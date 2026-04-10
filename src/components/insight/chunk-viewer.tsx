"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockChunks } from "@/lib/mock-data";
import { useChatStore } from "@/store/chat-store";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChunkEntry = {
  key: string;
  title: string;
  chunkId?: string;
};

function isLikelyUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function ChunkViewer() {
  const { messages } = useChatStore();
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());
  const [showReferences, setShowReferences] = useState<Set<string>>(new Set());

  const latestAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const isFoundryWithoutChunks =
    latestAssistantMessage?.source === "foundry";

  // Build unique chunk entries from citations.
  const chunkEntries = messages
    .filter((m) => m.role === "assistant" && m.citations)
    .flatMap((m) => m.citations!)
    .map((citation) => {
      const chunkId = citation.chunkId;
      const title = citation.title?.trim() || "Kilde";
      const key = chunkId ? `${title}|${chunkId}` : title;

      return {
        key,
        title,
        chunkId,
      } as ChunkEntry;
    })
    .filter(
      (entry, index, self) =>
        index === self.findIndex((candidate) => candidate.key === entry.key)
    );

  const toggleChunk = (chunkKey: string) => {
    const newExpanded = new Set(expandedChunks);
    if (newExpanded.has(chunkKey)) {
      newExpanded.delete(chunkKey);
    } else {
      newExpanded.add(chunkKey);
    }
    setExpandedChunks(newExpanded);
  };

  const toggleReference = (chunkKey: string) => {
    const next = new Set(showReferences);
    if (next.has(chunkKey)) {
      next.delete(chunkKey);
    } else {
      next.add(chunkKey);
    }
    setShowReferences(next);
  };

  if (chunkEntries.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        {isFoundryWithoutChunks
          ? "Ingen tekstutdrag tilgjengelig. Utdrag vises først nar du kobler til en kunnskapskilde/retrieval."
          : "Ingen tekstutdrag tilgjengelig ennå."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Tekstutdrag</h3>
      {chunkEntries.map((entry) => {
        const isExpanded = expandedChunks.has(entry.key);
        const chunkReference = entry.chunkId;
        const content =
          (chunkReference ? mockChunks[chunkReference] : undefined) ??
          "Tekstutdrag ble ikke returnert av agenten for denne kilden.";
        const hasTechnicalReference = Boolean(chunkReference);
        const isReferenceVisible = showReferences.has(entry.key);
        const isReferenceUrl = Boolean(
          chunkReference && isLikelyUrl(chunkReference)
        );

        return (
          <Card key={entry.key}>
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex-1 min-w-0 text-xs text-muted-foreground break-words pr-2">
                  {entry.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleChunk(entry.key)}
                  className="h-6 px-2"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="p-3 pt-0">
                <pre className="text-xs whitespace-pre-wrap break-words font-sans text-muted-foreground">
                  {content}
                </pre>

                {hasTechnicalReference && (
                  <div className="mt-2 space-y-1">
                    <button
                      type="button"
                      className="text-xs text-primary underline underline-offset-2"
                      onClick={() => toggleReference(entry.key)}
                    >
                      {isReferenceVisible
                        ? "Skjul teknisk referanse"
                        : "Vis teknisk referanse"}
                    </button>
                    {isReferenceVisible && chunkReference && (
                      <div className="text-xs text-muted-foreground break-all">
                        {isReferenceUrl ? "Kildelenke" : "Chunk-ID"}: {chunkReference}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
