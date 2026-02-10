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
    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          Kvalitetsnotat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-xs text-amber-900 dark:text-amber-200">
          {explanation}
        </p>
      </CardContent>
    </Card>
  );
}
