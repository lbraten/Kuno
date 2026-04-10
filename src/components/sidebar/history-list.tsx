"use client";

import { useCallback, useMemo, useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Plus, MessageSquare, Search, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_HISTORY_ITEMS = 4;
const EXIT_ANIMATION_MS = 220;

type ConversationItem = ReturnType<typeof useChatStore.getState>["conversations"][number];

function isEmptyDraftConversation(conversation: ConversationItem): boolean {
  return conversation.title === "Ny samtale" && conversation.messages.length === 0;
}

export function HistoryList() {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [exitingConversationIds, setExitingConversationIds] = useState<Set<string>>(
    () => new Set()
  );
  const {
    conversations,
    currentConversationId,
    messages,
    setCurrentConversation,
    createConversation,
    deleteConversation,
  } = useChatStore();
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const reducedMotion = useUIStore(
    (state) => state.accessibility.reducedMotion
  );

  const runWithOptionalExitAnimation = useCallback(
    (conversationId: string, action: () => void) => {
      if (reducedMotion) {
        action();
        return;
      }

      setExitingConversationIds((prev) => {
        const next = new Set(prev);
        next.add(conversationId);
        return next;
      });

      window.setTimeout(() => {
        action();
        setExitingConversationIds((prev) => {
          const next = new Set(prev);
          next.delete(conversationId);
          return next;
        });
      }, EXIT_ANIMATION_MS);
    },
    [reducedMotion]
  );

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredConversations = useMemo(() => {
    if (!normalizedSearchQuery) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const inTitle = conversation.title.toLowerCase().includes(normalizedSearchQuery);
      const inMessages = conversation.messages.some((message) =>
        message.content.toLowerCase().includes(normalizedSearchQuery)
      );

      return inTitle || inMessages;
    });
  }, [conversations, normalizedSearchQuery]);

  const visibleConversations = useMemo(
    () => filteredConversations.slice(0, MAX_VISIBLE_HISTORY_ITEMS),
    [filteredConversations]
  );

  const hiddenConversations = useMemo(
    () => filteredConversations.slice(MAX_VISIBLE_HISTORY_ITEMS),
    [filteredConversations]
  );

  const hasHiddenConversations =
    filteredConversations.length > MAX_VISIBLE_HISTORY_ITEMS;

  const hiddenCount = filteredConversations.length - MAX_VISIBLE_HISTORY_ITEMS;

  const renderConversation = (conv: ConversationItem) => {
    const isExiting = exitingConversationIds.has(conv.id);

    return (
      <div
        key={conv.id}
        className={cn(
          "overflow-hidden transition-all ease-out",
          reducedMotion ? "duration-0" : "duration-200",
          isExiting ? "max-h-0 -translate-y-1 opacity-0" : "max-h-20 opacity-100"
        )}
      >
        <div
          className={cn(
            "group flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm transition-colors cursor-pointer",
            currentConversationId === conv.id
              ? "bg-secondary/55 border-secondary-foreground/30 hover:bg-secondary/65 dark:border-secondary/70 dark:bg-secondary/30 dark:hover:bg-secondary/40"
              : "hover:bg-secondary/55"
          )}
          onClick={() => {
            if (conv.id === currentConversationId) return;

            const currentConversation = conversations.find(
              (conversation) => conversation.id === currentConversationId
            );
            const shouldRemoveCurrentEmptyDraft =
              Boolean(currentConversation) &&
              isEmptyDraftConversation(currentConversation!) &&
              messages.length === 0;

            if (!currentConversationId || !shouldRemoveCurrentEmptyDraft) {
              setCurrentConversation(conv.id);
              return;
            }

            runWithOptionalExitAnimation(currentConversationId, () => {
              deleteConversation(currentConversationId);
              setCurrentConversation(conv.id);
            });
          }}
        >
          <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium">{conv.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(conv.updatedAt)}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              runWithOptionalExitAnimation(conv.id, () => {
                deleteConversation(conv.id);
              });
            }}
            aria-label="Slett samtale"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 justify-start gap-2"
            onClick={createConversation}
          >
            <Plus className="h-4 w-4" />
            Ny chat
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 [&_svg]:size-5"
            onClick={() => setSidebarOpen(false)}
            aria-label="Lukk sidepanel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
              <path d="M9 4v16" />
              <path d="M15 10l-2 2l2 2" />
            </svg>
          </Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Søk i chatter"
            className="pl-9"
            aria-label="Søk i chatter"
          />
        </div>
      </div>

      <div className="border-t pt-4 space-y-1">
        <h2 className="font-semibold">Historikk</h2>

        <div className="space-y-1">
          {visibleConversations.length > 0 ? (
            visibleConversations.map(renderConversation)
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Ingen chatter matcher søket.
            </p>
          )}

          {hasHiddenConversations && (
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                showAll ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
              )}
              aria-hidden={!showAll}
            >
              <div className="space-y-1 pt-1">
                {hiddenConversations.map(renderConversation)}
              </div>
            </div>
          )}

          {hasHiddenConversations && (
            <Button
              variant="ghost"
              className="w-full justify-between px-3 text-xs text-muted-foreground"
              onClick={() => setShowAll((prev) => !prev)}
            >
              <span className="relative inline-block h-4 min-w-[8rem] text-left">
                <span
                  className={cn(
                    "absolute inset-0 transition-all duration-200",
                    showAll
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-1 opacity-0"
                  )}
                >
                  Vis færre samtaler
                </span>
                <span
                  className={cn(
                    "absolute inset-0 transition-all duration-200",
                    showAll
                      ? "translate-y-1 opacity-0"
                      : "translate-y-0 opacity-100"
                  )}
                >
                  {`Vis ${hiddenCount} flere`}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300",
                  showAll && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
