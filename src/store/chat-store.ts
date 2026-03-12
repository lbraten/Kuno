import { create } from "zustand";
import { Message, Conversation, Filter, Mode, RetrieveConfig } from "@/types";
import {
  mockConversations,
  mockCitations,
  mockAssistantResponses,
  mockFollowUps,
} from "@/lib/mock-data";
import { sleep } from "@/lib/utils";

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
  deleteConversation: (id: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: mockConversations,
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
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "Ny samtale",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    set((state) => ({
      conversations: [newConv, ...state.conversations],
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
    const { currentConversationId, conversations, messages } = get();

    // Create user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    set({ messages: newMessages, isStreaming: true });

    // Update conversation title if it's the first message
    if (messages.length === 0 && currentConversationId) {
      const updatedConvs = conversations.map((c) =>
        c.id === currentConversationId
          ? { ...c, title: content.slice(0, 50), messages: newMessages }
          : c
      );
      set({ conversations: updatedConvs });
    }

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

      const payload = (await response.json()) as { content?: string };
      const assistantText =
        payload.content?.trim() || "Jeg fikk ikke noe svar fra modellen.";

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: "",
        source: "foundry",
        citations: mockCitations.slice(0, Math.floor(Math.random() * 3) + 1),
        uncertainty: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as
          | "low"
          | "medium"
          | "high",
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
      set({
        messages: finalMessages,
        isStreaming: false,
        abortController: null,
      });

      // Update conversation
      if (currentConversationId) {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === currentConversationId
              ? {
                  ...c,
                  messages: finalMessages,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      }
    } catch (error) {
      const mockResponse =
        mockAssistantResponses[
          Math.floor(Math.random() * mockAssistantResponses.length)
        ];

      const fallbackMessage: Message = {
        id: `msg-${Date.now()}-assistant-fallback`,
        role: "assistant",
        content: "",
        source: "mock",
        citations: mockCitations.slice(0, 1),
        uncertainty: "medium",
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

      set({
        messages: failedMessages,
        isStreaming: false,
        abortController: null,
      });

      if (currentConversationId) {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === currentConversationId
              ? {
                  ...c,
                  messages: failedMessages,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
      }
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

  deleteConversation: (id: string) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversationId:
        state.currentConversationId === id
          ? null
          : state.currentConversationId,
      messages: state.currentConversationId === id ? [] : state.messages,
    }));
  },
}));
