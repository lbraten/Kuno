"use client";

import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";
import { MessageSquare } from "lucide-react";
import { Mode } from "@/types";

function BubblesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7.001 15.085A1.5 1.5 0 0 1 9 16.5" />
      <circle cx="18.5" cy="8.5" r="3.5" />
      <circle cx="7.5" cy="16.5" r="5.5" />
      <circle cx="7.5" cy="4.5" r="2.5" />
    </svg>
  );
}

function MessagesSquareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" />
    </svg>
  );
}

const modes: { value: Mode; label: string; icon: any; description: string }[] =
  [
    {
      value: "chat",
      label: "Chat",
      icon: MessageSquare,
      description: "Få hjelp til å finne og oppsummere relevante forskningsrapporter",
    },
    {
      value: "retrieve", //her het den søk før, så valuen må endres fra retrieve til søk for ryddighet
      label: "Språkvask",
      icon: BubblesIcon,
      description: "Skriv om teksten din basert på Udirs språkprofil",
    },
    {
      value: "advanced",
      label: "Pressesvar",
      icon: MessagesSquareIcon,
      description: "Lag svar tilpasset presse og offentlig kommunikasjon",
    },
  ];

export function ModeToggle() {
  const { mode, setMode } = useChatStore();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-3">Modus</h3>
      <div className="space-y-1">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={cn(
                "w-full flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transform-gpu transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none",
                mode === m.value
                  ? "translate-x-1 border-udir-green-7 bg-udir-green-3 shadow-sm dark:border-primary/50 dark:bg-primary/10"
                  : "translate-x-0 border-border bg-card hover:border-udir-green-6/60 hover:bg-udir-green-3/55 dark:border-transparent dark:bg-transparent dark:hover:bg-secondary/55"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mt-0.5 flex-shrink-0 transition-[color,transform] duration-200 ease-out motion-reduce:transition-none",
                  mode === m.value
                    ? "scale-105 text-udir-green-8 dark:text-primary"
                    : "text-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium text-sm transition-colors duration-200 ease-out motion-reduce:transition-none",
                    mode === m.value
                      ? "text-udir-green-9 dark:text-primary"
                      : "text-foreground"
                  )}
                >
                  {m.label}
                </p>
                <p className="text-xs text-muted-foreground">{m.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
