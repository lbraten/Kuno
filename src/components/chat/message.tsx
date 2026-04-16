"use client";

import { Message as MessageType } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { User, Copy, ThumbsUp, ThumbsDown, Hash } from "lucide-react";
import Image from "next/image";
import type { ClipboardEvent } from "react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/store/ui-store";
import { useChatStore } from "@/store/chat-store";
import {
  formatCitationDisplayNumber,
  getCitationSelectionKey,
  linkifyInlineCitationNumbers,
  stripInlineCitationNumbers,
} from "@/lib/citation-utils";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const assistantSource = !isUser ? message.source ?? "mock" : null;
  const answerBasis = !isUser ? message.answerBasis : undefined;
  const setMessageInlineCitationNumbers = useChatStore(
    (state) => state.setMessageInlineCitationNumbers
  );
  const { setSelectedCitationKey, setInsightPanelOpen, accessibility } =
    useUIStore();
  const markdownMode = accessibility.markdownMode;
  const citationNumberPairs = (message.citations ?? []).map((citation, index) => {
    const displayNumber = formatCitationDisplayNumber(citation.id, index);
    return [displayNumber, citation] as const;
  });
  const inlineCitationNumbers = new Set(
    citationNumberPairs.map(([displayNumber]) => displayNumber)
  );
  const citationByDisplayNumber = new Map(citationNumberPairs);
  const showInlineCitationNumbers =
    message.showInlineCitationNumbers ?? accessibility.showInlineCitationNumbers;
  const contentWithoutInlineCitationNumbers = !isUser
    ? stripInlineCitationNumbers(message.content, inlineCitationNumbers)
    : message.content;
  const renderedContent =
    !isUser && !showInlineCitationNumbers
      ? contentWithoutInlineCitationNumbers
      : message.content;
  const markdownContent =
    !isUser &&
    showInlineCitationNumbers &&
    inlineCitationNumbers.size > 0 &&
    !markdownMode
      ? linkifyInlineCitationNumbers(message.content, inlineCitationNumbers)
      : renderedContent;
  const proseTextScaleClass =
    accessibility.textScale === "xlarge"
      ? "prose-lg"
      : accessibility.textScale === "large"
        ? ""
        : "prose-sm";
  const preTextScaleClass =
    accessibility.textScale === "xlarge"
      ? "text-lg"
      : accessibility.textScale === "large"
        ? "text-base"
        : "text-sm";

  const copyToClipboard = async () => {
    const textToCopy = !isUser
      ? contentWithoutInlineCitationNumbers
      : message.content;

    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(textToCopy);
      return;
    }

    // Fallback for environments where Clipboard API is unavailable.
    if (typeof document !== "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const handleAssistantCopy = (event: ClipboardEvent<HTMLElement>) => {
    if (isUser) return;

    const selectedText =
      typeof window !== "undefined" ? window.getSelection()?.toString() ?? "" : "";
    const sourceText = selectedText.trim().length > 0 ? selectedText : message.content;

    event.preventDefault();
    event.clipboardData.setData(
      "text/plain",
      stripInlineCitationNumbers(sourceText, inlineCitationNumbers)
    );
  };

  const openInlineCitation = (displayNumber: string) => {
    const citation = citationByDisplayNumber.get(displayNumber);
    if (!citation) return;

    setSelectedCitationKey(getCitationSelectionKey(citation));
    setInsightPanelOpen(true);
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-6",
        isUser ? "bg-muted/50" : "bg-background"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-udir-green-9 text-white"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Image
            src="/branding/Kuno-logo-white-solid.svg"
            alt="Kuno"
            width={16}
            height={16}
            className="h-4 w-4"
          />
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isUser ? "Du" : "Kuno"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(message.createdAt)}
          </span>
          {message.uncertainty && !isUser && !markdownMode && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                message.uncertainty === "low" &&
                  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                message.uncertainty === "medium" &&
                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                message.uncertainty === "high" &&
                  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              )}
            >
              {message.uncertainty === "low" && "Høy sikkerhet"}
              {message.uncertainty === "medium" && "Middels sikkerhet"}
              {message.uncertainty === "high" && "Lav sikkerhet"}
            </span>
          )}
          {assistantSource && !markdownMode && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                assistantSource === "foundry"
                  ? "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200"
                  : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              )}
            >
              {assistantSource === "foundry" ? "AI Foundry" : "Mock data"}
            </span>
          )}
          {answerBasis && !markdownMode && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                answerBasis === "grounded" &&
                  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
                answerBasis === "general" &&
                  "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                answerBasis === "blocked" &&
                  "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
              )}
            >
              {answerBasis === "grounded" && "Datagrunnlag"}
              {answerBasis === "general" && "Allmennkunnskap"}
              {answerBasis === "blocked" && "Ikke i datagrunnlag"}
            </span>
          )}
        </div>

        {markdownMode && !isUser ? (
          <pre
            className={cn(
              "chat-message-content whitespace-pre-wrap rounded-md border bg-muted/30 p-3 leading-relaxed overflow-x-auto",
              preTextScaleClass
            )}
            onCopy={handleAssistantCopy}
          >
            {renderedContent}
          </pre>
        ) : (
          <div
            className={cn(
              "chat-message-content prose dark:prose-invert max-w-none prose-headings:mt-5 prose-headings:mb-3 prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-blockquote:my-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
              proseTextScaleClass
            )}
            onCopy={!isUser ? handleAssistantCopy : undefined}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{renderedContent}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  a: ({ href, children }) => {
                    const citationMatch = href?.match(/^#kuno-citation-(\d+)$/);
                    if (citationMatch?.[1]) {
                      const displayNumber = citationMatch[1];

                      return citationByDisplayNumber.has(displayNumber) ? (
                        <button
                          type="button"
                          className="mx-0.5 inline-flex items-center rounded border border-secondary/60 bg-secondary px-1.5 py-0.5 text-[11px] leading-none text-secondary-foreground hover:bg-secondary/80"
                          onClick={() => openInlineCitation(displayNumber)}
                        >
                          [{displayNumber}]
                        </button>
                      ) : (
                        <span>[{displayNumber}]</span>
                      );
                    }

                    if (!href) {
                      return <span>{children}</span>;
                    }

                    return (
                      <a
                        href={href}
                        className="text-primary underline underline-offset-2"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            )}
          </div>
        )}

        {!isUser && !markdownMode && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {citationNumberPairs.map(([displayNumber, citation]) => (
              <button
                key={citation.id}
                className="text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary/60 px-2 py-1 rounded transition-colors"
                onClick={() => {
                  setSelectedCitationKey(getCitationSelectionKey(citation));
                  setInsightPanelOpen(true);
                }}
              >
                [{displayNumber}] {citation.title}
              </button>
            ))}
          </div>
        )}

        {!isUser && !markdownMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kopier</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {message.citations && message.citations.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        setMessageInlineCitationNumbers(
                          message.id,
                          !showInlineCitationNumbers
                        )
                      }
                      aria-label={
                        showInlineCitationNumbers
                          ? "Skjul kildetall i teksten"
                          : "Vis kildetall i teksten"
                      }
                    >
                      <Hash
                        className={cn(
                          "h-3.5 w-3.5",
                          showInlineCitationNumbers && "text-primary"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {showInlineCitationNumbers
                      ? "Skjul kildetall"
                      : "Vis kildetall"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bra svar</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dårlig svar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}
