"use client";

import { mockFollowUps } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";

export function FollowUps() {
  const { sendMessage, isStreaming } = useChatStore();

  return (
    <div className="px-4 py-6 border-t bg-muted/30">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">
        Foreslåtte oppfølgingsspørsmål:
      </h3>
      <div className="flex flex-wrap gap-2">
        {mockFollowUps.map((question, index) => (
          <Button
            key={index}
            variant="secondary"
            size="sm"
            onClick={() => !isStreaming && sendMessage(question)}
            disabled={isStreaming}
            className="text-left h-auto border-0 bg-secondary/60 px-3 py-2 whitespace-normal hover:bg-secondary/75"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
