"use client";

import { Message as MessageType } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { User, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/store/ui-store";
import { getCitationSelectionKey } from "@/lib/citation-utils";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const assistantSource = !isUser ? message.source ?? "mock" : null;
  const answerBasis = !isUser ? message.answerBasis : undefined;
  const { setSelectedCitationKey, setInsightPanelOpen, accessibility } =
    useUIStore();
  const markdownMode = accessibility.markdownMode;

  const copyToClipboard = async () => {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(message.content);
      return;
    }

    // Fallback for environments where Clipboard API is unavailable.
    if (typeof document !== "undefined") {
      const textArea = document.createElement("textarea");
      textArea.value = message.content;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
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
            : "bg-petrol-800 text-white"
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

      <div className="flex-1 space-y-2 overflow-hidden">
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
          <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm leading-relaxed overflow-x-auto">
            {message.content}
          </pre>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
        )}

        {!isUser && !markdownMode && message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.citations.map((citation) => (
              <button
                key={citation.id}
                className="text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-secondary/60 px-2 py-1 rounded transition-colors"
                onClick={() => {
                  setSelectedCitationKey(getCitationSelectionKey(citation));
                  setInsightPanelOpen(true);
                }}
              >
                [{citation.id}] {citation.title}
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
