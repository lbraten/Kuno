"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChatStore } from "@/store/chat-store";
import { uncertaintyExplanations } from "@/lib/mock-data";
import { Info } from "lucide-react";

export function QualityNote() {
  const { messages } = useChatStore();

  // Get the latest assistant message with uncertainty
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.uncertainty);

  if (!latestAssistantMessage || !latestAssistantMessage.uncertainty) {
    return null;
  }

  const uncertainty = latestAssistantMessage.uncertainty;
  const explanation = uncertaintyExplanations[uncertainty];

  return (
    <Card className="border-[#D6B689] bg-[#FBF3E8] dark:border-[#937A57] dark:bg-[#261F14]/55">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-foreground">
          <Info className="h-4 w-4 text-[#937A57] dark:text-[#D6B689]" />
          Kvalitetsnotat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-xs text-foreground/85 dark:text-foreground/90">
          {explanation}
        </p>
      </CardContent>
    </Card>
  );
}
