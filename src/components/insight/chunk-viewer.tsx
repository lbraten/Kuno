"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockChunks } from "@/lib/mock-data";
import { useChatStore } from "@/store/chat-store";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChunkViewer() {
  const { messages } = useChatStore();
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());

  // Get all unique chunk IDs from citations
  const chunkIds = messages
    .filter((m) => m.role === "assistant" && m.citations)
    .flatMap((m) => m.citations!)
    .map((c) => c.chunkId)
    .filter((id): id is string => id !== undefined)
    .filter((id, index, self) => self.indexOf(id) === index);

  const toggleChunk = (chunkId: string) => {
    const newExpanded = new Set(expandedChunks);
    if (newExpanded.has(chunkId)) {
      newExpanded.delete(chunkId);
    } else {
      newExpanded.add(chunkId);
    }
    setExpandedChunks(newExpanded);
  };

  if (chunkIds.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Ingen tekstutdrag tilgjengelig ennå.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Tekstutdrag</h3>
      {chunkIds.map((chunkId) => {
        const isExpanded = expandedChunks.has(chunkId);
        const content = mockChunks[chunkId] || "Innhold ikke tilgjengelig";

        return (
          <Card key={chunkId}>
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs text-muted-foreground">
                  {chunkId}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleChunk(chunkId)}
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
                <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground">
                  {content}
                </pre>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
