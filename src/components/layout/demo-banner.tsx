"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { useChatStore } from "@/store/chat-store";

export function DemoBanner() {
  const { messages } = useChatStore();
  const [foundryConfigured, setFoundryConfigured] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        const response = await fetch("/api/chat", { method: "GET" });
        if (!response.ok) {
          if (isMounted) setFoundryConfigured(false);
          return;
        }

        const payload = (await response.json()) as {
          foundryConfigured?: boolean;
        };

        if (isMounted) {
          setFoundryConfigured(Boolean(payload.foundryConfigured));
        }
      } catch {
        if (isMounted) setFoundryConfigured(false);
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const latestSource = latestAssistantMessage?.source ?? "mock";

  const showLegacyMockText = foundryConfigured === false;
  const showMockFallbackActive = foundryConfigured === true && latestSource === "mock";
  const showFoundryConnected =
    foundryConfigured === true && latestSource === "foundry";

  return (
    <div className="bg-secondary/35 border-b border-secondary/60 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
        <Info className="h-4 w-4 text-secondary-foreground/90 flex-shrink-0" />
        <p className="text-secondary-foreground">
          {showLegacyMockText ? (
            <>
              <strong>Kuno (frontend-demo):</strong> Dette er en testmodell uten
              ekte data eller backend. Innholdet er simulert.
            </>
          ) : showMockFallbackActive ? (
            <>
              <strong>Kuno (demo):</strong> AI Foundry er konfigurert men ikke tilkoblet.
            </>
          ) : showFoundryConnected ? (
            <>
              <strong>Kuno (demo):</strong> AI Foundry er tilkoblet.
            </>
          ) : (
            <>
              <strong>Kuno (demo):</strong> Dette er en demo under utvikling og
              er ikke ferdig ennå.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
