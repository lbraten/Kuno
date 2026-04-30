"use client";

import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, FileSearch, Sparkles } from "lucide-react";
import { Mode } from "@/types";

const modes: { value: Mode; label: string; icon: any; description: string }[] =
  [
    {
      value: "chat",
      label: "Chat",
      icon: MessageSquare,
      description: "Skriv meldinger og få svar fra Kuno",
    },
    {
      value: "retrieve", //her het den søk før, så valuen må endres fra retrieve til søk for ryddighet
      label: "Språkvask",
      icon: FileSearch,
      description: "Skriv om teksten din bassert på udir sin språkprofil",
    },
    {
      value: "advanced", //her må noe annet komme, Øyvind hadde noen ideer
      label: "Avansert",
      icon: Sparkles,
      description: "Finjuster søk og innstillinger",
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
