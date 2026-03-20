"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { useUIStore } from "@/store/ui-store";
import { Card } from "@/components/ui/card";
import { FileText, Building, Calendar, FileType } from "lucide-react";
import { Citation } from "@/types";
import { cn } from "@/lib/utils";
import { getCitationSelectionKey } from "@/lib/citation-utils";

const INTERNAL_URL_HOST_PATTERNS = [
  ".search.windows.net",
  ".services.ai.azure.com",
  ".openai.azure.com",
  ".cognitiveservices.azure.com",
];

function isUsablePublicSourceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    return !INTERNAL_URL_HOST_PATTERNS.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}

function getCitationUrl(citation: Citation): string | null {
  const rawUrl = citation.url ?? citation.chunkId;
  if (!rawUrl) return null;

  if (rawUrl.startsWith("/api/source-file")) {
    return rawUrl;
  }

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    if (rawUrl.includes(".blob.core.windows.net/")) {
      return `/api/source-file?url=${encodeURIComponent(rawUrl)}`;
    }

    if (isUsablePublicSourceUrl(rawUrl)) {
      return rawUrl;
    }
  }

  return null;
}

export function SourceList() {
  const { messages } = useChatStore();
  const { selectedCitationKey } = useUIStore();

  const latestAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const isFoundryWithoutSources =
    latestAssistantMessage?.source === "foundry";
  const latestAnswerBasis = latestAssistantMessage?.answerBasis;

  // Get all unique citations from messages
  const citations = messages
    .filter((m) => m.role === "assistant" && m.citations)
    .flatMap((m) => m.citations!)
    .filter(
      (citation, index, self) =>
        index === self.findIndex((c) => c.id === citation.id)
    );

  useEffect(() => {
    if (!selectedCitationKey) return;

    const selectedElement = document.querySelector(
      `[data-citation-key="${CSS.escape(selectedCitationKey)}"]`
    );

    if (selectedElement instanceof HTMLElement) {
      selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedCitationKey]);

  if (citations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        {latestAnswerBasis === "blocked"
          ? "Svar ble blokkert fordi ingen kilder ble funnet i datagrunnlaget."
          : latestAnswerBasis === "general"
          ? "Dette svaret er merket som allmennkunnskap og har ingen datakilder."
          : isFoundryWithoutSources
          ? "Ingen kilder ble mottatt for dette svaret. Sjekk Agent-oppsett og grounding i Foundry."
          : "Ingen kilder ennå. Start en samtale for å se kilder."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Kilder ({citations.length})</h3>
      {citations.map((citation) => (
        <SourceCard
          key={citation.id}
          citation={citation}
          highlighted={getCitationSelectionKey(citation) === selectedCitationKey}
        />
      ))}
    </div>
  );
}

function SourceCard({
  citation,
  highlighted,
}: {
  citation: Citation;
  highlighted: boolean;
}) {
  const [showChunkLink, setShowChunkLink] = useState(false);
  const citationUrl = getCitationUrl(citation);
  const downloadUrl =
    citationUrl && citationUrl.startsWith("/api/source-file")
      ? `${citationUrl}&mode=download`
      : citationUrl;
  const citationKey = getCitationSelectionKey(citation);

  return (
    <Card
      data-citation-key={citationKey}
      className={cn(
        "p-3 hover:shadow-md transition-all duration-200",
        highlighted &&
          "ring-2 ring-primary/70 bg-primary/5 border-primary/40 shadow-md"
      )}
    >
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
          <div className="space-y-1">
            <button
              type="button"
              className="text-xs text-primary underline underline-offset-2"
              onClick={() => setShowChunkLink((prev) => !prev)}
            >
              {showChunkLink ? "Skjul chunk-lenke" : "Vis chunk-lenke"}
            </button>
            {showChunkLink && (
              <div className="text-xs text-primary break-all">
                Chunk: {citation.chunkId}
              </div>
            )}
          </div>
        )}

        {citationUrl && (
          <div className="flex items-center gap-3 text-xs">
            <a
              href={citationUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Åpne PDF
            </a>
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Last ned PDF
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
