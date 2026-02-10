"use client";

import { useChatStore } from "@/store/chat-store";
import { Card } from "@/components/ui/card";
import { FileText, Building, Calendar, FileType } from "lucide-react";
import { Citation } from "@/types";

export function SourceList() {
  const { messages } = useChatStore();

  // Get all unique citations from messages
  const citations = messages
    .filter((m) => m.role === "assistant" && m.citations)
    .flatMap((m) => m.citations!)
    .filter(
      (citation, index, self) =>
        index === self.findIndex((c) => c.id === citation.id)
    );

  if (citations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Ingen kilder ennå. Start en samtale for å se kilder.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Kilder ({citations.length})</h3>
      {citations.map((citation) => (
        <SourceCard key={citation.id} citation={citation} />
      ))}
    </div>
  );
}

function SourceCard({ citation }: { citation: Citation }) {
  return (
    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight flex-1">
            {citation.title}
          </h4>
          {citation.score && (
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full flex-shrink-0">
              {(citation.score * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          {citation.organization && (
            <div className="flex items-center gap-1.5">
              <Building className="h-3 w-3" />
              <span>{citation.organization}</span>
            </div>
          )}
          {citation.year && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>{citation.year}</span>
            </div>
          )}
          {citation.docType && (
            <div className="flex items-center gap-1.5">
              <FileType className="h-3 w-3" />
              <span>{citation.docType}</span>
            </div>
          )}
        </div>

        {citation.chunkId && (
          <div className="text-xs text-primary">
            Chunk: {citation.chunkId}
          </div>
        )}
      </div>
    </Card>
  );
}
