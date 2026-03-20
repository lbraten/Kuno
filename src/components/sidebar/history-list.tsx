"use client";

import { useCallback, useMemo, useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useUIStore } from "@/store/ui-store";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, MessageSquare, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_HISTORY_ITEMS = 5;
const EXIT_ANIMATION_MS = 220;

type ConversationItem = ReturnType<typeof useChatStore.getState>["conversations"][number];

function isEmptyDraftConversation(conversation: ConversationItem): boolean {
  return conversation.title === "Ny samtale" && conversation.messages.length === 0;
}

export function HistoryList() {
  const [showAll, setShowAll] = useState(false);
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

  const visibleConversations = useMemo(
    () => conversations.slice(0, MAX_VISIBLE_HISTORY_ITEMS),
    [conversations]
  );

  const hiddenConversations = useMemo(
    () => conversations.slice(MAX_VISIBLE_HISTORY_ITEMS),
    [conversations]
  );

  const hasHiddenConversations =
    conversations.length > MAX_VISIBLE_HISTORY_ITEMS;

  const hiddenCount = conversations.length - MAX_VISIBLE_HISTORY_ITEMS;

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
            "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent cursor-pointer",
            currentConversationId === conv.id && "bg-accent"
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
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Historikk</h2>
        <Button
          size="icon"
          variant="ghost"
          onClick={createConversation}
          aria-label="Ny samtale"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {visibleConversations.map(renderConversation)}

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
                Vis faerre samtaler
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
  );
}
