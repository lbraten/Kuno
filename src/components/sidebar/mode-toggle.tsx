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
      description: "Samtale med kontekstuell forståelse",
    },
    {
      value: "retrieve",
      label: "Søk",
      icon: FileSearch,
      description: "Finn relevante dokumenter",
    },
    {
      value: "advanced",
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
                "w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
                mode === m.value && "bg-accent border border-primary/50"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mt-0.5 flex-shrink-0",
                  mode === m.value ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium text-sm",
                    mode === m.value && "text-primary"
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
