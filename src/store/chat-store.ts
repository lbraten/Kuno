import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Message,
  Conversation,
  Filter,
  Mode,
  RetrieveConfig,
  Citation,
} from "@/types";
import {
  mockCitations,
  mockAssistantResponses,
  mockFollowUps,
} from "@/lib/mock-data";
import { sleep } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

type Uncertainty = "low" | "medium" | "high";

function getMockTopicConfig(content: string): {
  responseIndex: number;
  citationIds: string[];
  uncertainty: Uncertainty;
} {
  const lower = content.toLowerCase();

  if (lower.includes("mobb") || lower.includes("skolemilj")) {
    return { responseIndex: 0, citationIds: ["cite-1", "cite-2", "cite-8"], uncertainty: "low" };
  }
  if (lower.includes("frav")) {
    return { responseIndex: 1, citationIds: ["cite-3", "cite-9"], uncertainty: "medium" };
  }
  if (lower.includes("eksamen") || lower.includes("klage")) {
    return { responseIndex: 2, citationIds: ["cite-10", "cite-7", "cite-14"], uncertainty: "medium" };
  }
  if (lower.includes("spesialundervis")) {
    return { responseIndex: 3, citationIds: ["cite-4", "cite-11"], uncertainty: "medium" };
  }
  if (lower.includes("barnehage") || lower.includes("overgang")) {
    return { responseIndex: 4, citationIds: ["cite-5", "cite-12"], uncertainty: "medium" };
  }
  if (lower.includes("orden") || lower.includes("oppf") || lower.includes("ungdomsskole")) {
    return { responseIndex: 5, citationIds: ["cite-6", "cite-13"], uncertainty: "medium" };
  }
  if (lower.includes("tilrettelegging")) {
    return { responseIndex: 6, citationIds: ["cite-7", "cite-14"], uncertainty: "medium" };
  }

  return {
    responseIndex: mockAssistantResponses.length - 1,
    citationIds: ["cite-1"],
    uncertainty: "high",
  };
}

function pickCitationsById(ids: string[]): Citation[] {
  const idSet = new Set(ids);
  return mockCitations.filter((citation) => idSet.has(citation.id));
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isStreaming: boolean;
  filter: Filter;
  mode: Mode;
  retrieveConfig: RetrieveConfig;
  abortController: AbortController | null;

  // Actions
  createConversation: () => void;
  setCurrentConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  setFilter: (filter: Partial<Filter>) => void;
  setMode: (mode: Mode) => void;
  setRetrieveConfig: (config: Partial<RetrieveConfig>) => void;
  setMessageInlineCitationNumbers: (messageId: string, show: boolean) => void;
  deleteConversation: (id: string) => void;
}

const CHAT_CACHE_KEY = "kuno-chat-cache-v1";
const CHAT_CACHE_VERSION = 2;

type PersistedChatState = {
  conversations?: Conversation[];
  currentConversationId?: string | null;
  messages?: Message[];
  filter?: Filter;
  mode?: Mode;
  retrieveConfig?: RetrieveConfig;
};

function isConversation(value: unknown): value is Conversation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Conversation>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string" &&
    Array.isArray(candidate.messages)
  );
}

function migrateChatCacheState(
  persistedState: unknown,
  version: number
): PersistedChatState {
  const base = (persistedState ?? {}) as PersistedChatState;

  // v1 -> v2: normalize malformed cache entries and re-derive selected messages.
  if (version < 2) {
    const conversations = Array.isArray(base.conversations)
      ? base.conversations.filter(isConversation)
      : [];
    const sortedConversations = sortConversationsByUpdatedAt(conversations);
    const hasCurrentConversation = sortedConversations.some(
      (conversation) => conversation.id === base.currentConversationId
    );
    const currentConversationId = hasCurrentConversation
      ? (base.currentConversationId ?? null)
      : (sortedConversations[0]?.id ?? null);
    const selectedConversation = sortedConversations.find(
      (conversation) => conversation.id === currentConversationId
    );

    return {
      ...base,
      conversations: sortedConversations,
      currentConversationId,
      messages: selectedConversation?.messages ?? [],
      filter: base.filter ?? { organizations: [], years: [], docTypes: [] },
      mode: base.mode ?? "chat",
      retrieveConfig: base.retrieveConfig ?? { topK: 5, minScore: 0.7 },
    };
  }

  return base;
}

function sortConversationsByUpdatedAt(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function withConversationUpdated(
  conversations: Conversation[],
  conversationId: string,
  updates: Partial<Conversation>
): Conversation[] {
  const next = conversations.map((conversation) =>
    conversation.id === conversationId ? { ...conversation, ...updates } : conversation
  );

  return sortConversationsByUpdatedAt(next);
}

function withConversationMessagesPatched(
  conversations: Conversation[],
  conversationId: string,
  nextMessages: Message[]
): Conversation[] {
  return conversations.map((conversation) =>
    conversation.id === conversationId
      ? { ...conversation, messages: nextMessages }
      : conversation
  );
}

function isEmptyDraftConversation(conversation: Conversation): boolean {
  return conversation.title === "Ny samtale" && conversation.messages.length === 0;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      messages: [],
      isStreaming: false,
      filter: {
        organizations: [],
        years: [],
        docTypes: [],
      },
      mode: "chat",
      retrieveConfig: {
        topK: 5,
        minScore: 0.7,
      },
      abortController: null,

      createConversation: () => {
        const now = new Date().toISOString();
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          title: "Ny samtale",
          createdAt: now,
          updatedAt: now,
          messages: [],
        };
        set((state) => ({
          conversations: sortConversationsByUpdatedAt([
            newConv,
            ...state.conversations.filter((conversation) =>
              conversation.id === state.currentConversationId
                ? !isEmptyDraftConversation(conversation)
                : true
            ),
          ]),
          currentConversationId: newConv.id,
          messages: [],
        }));
      },

      setCurrentConversation: (id: string) => {
        const conv = get().conversations.find((c) => c.id === id);
        if (conv) {
          set({ currentConversationId: id, messages: conv.messages });
        }
      },

      sendMessage: async (content: string) => {
        let { currentConversationId, conversations, messages } = get();
        const defaultShowInlineCitationNumbers =
          useUIStore.getState().accessibility.showInlineCitationNumbers;

        if (!currentConversationId) {
          const now = new Date().toISOString();
          const newConv: Conversation = {
            id: `conv-${Date.now()}`,
            title: "Ny samtale",
            createdAt: now,
            updatedAt: now,
            messages: [],
          };

          const updatedConversations = sortConversationsByUpdatedAt([
            newConv,
            ...conversations,
          ]);

          set({
            conversations: updatedConversations,
            currentConversationId: newConv.id,
            messages: [],
          });

          currentConversationId = newConv.id;
          conversations = updatedConversations;
          messages = [];
        }

        // Create user message
        const userMessage: Message = {
          id: `msg-${Date.now()}`,
          role: "user",
          content,
          createdAt: new Date().toISOString(),
        };

        const newMessages = [...messages, userMessage];
        const conversationTitle =
          messages.length === 0 ? content.slice(0, 50) : undefined;

        set((state) => ({
          messages: newMessages,
          isStreaming: true,
          conversations: withConversationUpdated(state.conversations, currentConversationId!, {
            ...(conversationTitle ? { title: conversationTitle } : {}),
            messages: newMessages,
            updatedAt: new Date().toISOString(),
          }),
        }));

        // Keep local abort support and progressive rendering in UI.
        const controller = new AbortController();
        set({ abortController: controller });

        try {
          if (controller.signal.aborted) return;

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: content,
              history: messages
                .filter((m) => m.role === "user" || m.role === "assistant")
                .map((m) => ({ role: m.role, content: m.content })),
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorData = (await response.json().catch(() => null)) as
              | { error?: string }
              | null;
            throw new Error(errorData?.error ?? "Klarte ikke aa hente svar fra API");
          }

          const payload = (await response.json()) as {
            content?: string;
            uncertainty?: Uncertainty;
            citations?: Citation[];
            answerBasis?: "grounded" | "general" | "blocked";
          };
          const assistantText =
            payload.content?.trim() || "Jeg fikk ikke noe svar fra modellen.";

          const assistantMessage: Message = {
            id: `msg-${Date.now()}-assistant`,
            role: "assistant",
            content: "",
            showInlineCitationNumbers: defaultShowInlineCitationNumbers,
            source: "foundry",
            citations: payload.citations ?? [],
            uncertainty: payload.uncertainty ?? "low",
            answerBasis: payload.answerBasis,
            createdAt: new Date().toISOString(),
          };

          set({ messages: [...newMessages, assistantMessage] });

          // Render response progressively for consistent UX.
          const words = assistantText.split(" ");
          for (let i = 0; i < words.length; i++) {
            if (controller.signal.aborted) break;

            assistantMessage.content += (i > 0 ? " " : "") + words[i];

            set((state) => ({
              messages: [...state.messages.slice(0, -1), assistantMessage],
            }));

            await sleep(20);
          }

          // Final update
          const finalMessages = [...newMessages, assistantMessage];
          set((state) => ({
            messages: finalMessages,
            isStreaming: false,
            abortController: null,
            conversations: withConversationUpdated(
              state.conversations,
              currentConversationId!,
              {
                messages: finalMessages,
                updatedAt: new Date().toISOString(),
              }
            ),
          }));
        } catch (error) {
          const topicConfig = getMockTopicConfig(content);
          const mockResponse = mockAssistantResponses[topicConfig.responseIndex];
          const mockCitationsForTopic = pickCitationsById(topicConfig.citationIds);

          const fallbackMessage: Message = {
            id: `msg-${Date.now()}-assistant-fallback`,
            role: "assistant",
            content: "",
            showInlineCitationNumbers: defaultShowInlineCitationNumbers,
            source: "mock",
            citations: mockCitationsForTopic,
            uncertainty: topicConfig.uncertainty,
            answerBasis: "grounded",
            createdAt: new Date().toISOString(),
          };

          set({ messages: [...newMessages, fallbackMessage] });

          const words = mockResponse.split(" ");
          for (let i = 0; i < words.length; i++) {
            if (controller.signal.aborted) break;

            fallbackMessage.content += (i > 0 ? " " : "") + words[i];

            set((state) => ({
              messages: [...state.messages.slice(0, -1), fallbackMessage],
            }));

            await sleep(20);
          }

          const failedMessages = [...newMessages, fallbackMessage];

          set((state) => ({
            messages: failedMessages,
            isStreaming: false,
            abortController: null,
            conversations: withConversationUpdated(
              state.conversations,
              currentConversationId!,
              {
                messages: failedMessages,
                updatedAt: new Date().toISOString(),
              }
            ),
          }));
          console.warn("Faller tilbake til mock-svar:", error);
        }
      },

      stopStreaming: () => {
        const { abortController } = get();
        if (abortController) {
          abortController.abort();
          set({ isStreaming: false, abortController: null });
        }
      },

      setFilter: (filter: Partial<Filter>) => {
        set((state) => ({ filter: { ...state.filter, ...filter } }));
      },

      setMode: (mode: Mode) => {
        set({ mode });
      },

      setRetrieveConfig: (config: Partial<RetrieveConfig>) => {
        set((state) => ({
          retrieveConfig: { ...state.retrieveConfig, ...config },
        }));
      },

      setMessageInlineCitationNumbers: (messageId: string, show: boolean) => {
        set((state) => {
          const nextMessages = state.messages.map((message) =>
            message.id === messageId
              ? { ...message, showInlineCitationNumbers: show }
              : message
          );

          if (!state.currentConversationId) {
            return { messages: nextMessages };
          }

          return {
            messages: nextMessages,
            conversations: withConversationMessagesPatched(
              state.conversations,
              state.currentConversationId,
              nextMessages
            ),
          };
        });
      },

      deleteConversation: (id: string) => {
        set((state) => {
          const updatedConversations = state.conversations.filter((c) => c.id !== id);
          const nextCurrentConversationId =
            state.currentConversationId === id
              ? updatedConversations[0]?.id ?? null
              : state.currentConversationId;
          const nextMessages = nextCurrentConversationId
            ? updatedConversations.find((conversation) => conversation.id === nextCurrentConversationId)
                ?.messages ?? []
            : [];

          return {
            conversations: updatedConversations,
            currentConversationId: nextCurrentConversationId,
            messages: nextMessages,
          };
        });
      },
    }),
    {
      name: CHAT_CACHE_KEY,
      version: CHAT_CACHE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: migrateChatCacheState,
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        messages: state.messages,
        filter: state.filter,
        mode: state.mode,
        retrieveConfig: state.retrieveConfig,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.abortController = null;
        state.isStreaming = false;

        // Always open on a fresh chat view after page refresh.
        state.currentConversationId = null;
        state.messages = [];
      },
    }
  )
);
