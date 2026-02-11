"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Square } from "lucide-react";

export function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage, isStreaming, stopStreaming } = useChatStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Skriv en melding..."
            disabled={isStreaming}
            className="flex-1 text-base sm:text-sm"
            aria-label="Chat input"
          />
          {isStreaming ? (
            <Button
              type="button"
              onClick={stopStreaming}
              variant="destructive"
              size="icon"
              aria-label="Stopp generering"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!input.trim()}
              size="icon"
              aria-label="Send melding"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Kuno kan gjøre feil. Dobbeltsjekk viktig informasjon. (NB! Dette er bare en demo med simulert data.)
        </p>
      </form>
    </div>
  );
}
