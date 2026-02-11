"use client";

import { useEffect, useRef } from "react";
import { DemoBanner } from "@/components/layout/demo-banner";
import { TopBar } from "@/components/layout/top-bar";
import { SidePanel } from "@/components/layout/side-panel";
import { InsightPanel } from "@/components/layout/insight-panel";
import { Message } from "@/components/chat/message";
import { LoadingDots } from "@/components/chat/loading-dots";
import { FollowUps } from "@/components/chat/follow-ups";
import { ChatInput } from "@/components/chat/chat-input";
import { HistoryList } from "@/components/sidebar/history-list";
import { ModeToggle } from "@/components/sidebar/mode-toggle";
import { Filters } from "@/components/sidebar/filters";
import { SourceList } from "@/components/insight/source-list";
import { ChunkViewer } from "@/components/insight/chunk-viewer";
import { QualityNote } from "@/components/insight/quality-note";
import { CommandPalette } from "@/components/command-palette";
import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { PlusCircle, PanelRightOpen } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

export default function Home() {
  const { messages, isStreaming, createConversation, currentConversationId } =
    useChatStore();
  const { setInsightPanelOpen, setSidebarOpen } = useUIStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const isMdUp = window.innerWidth >= 768;
    const isLgUp = window.innerWidth >= 1024;
    setSidebarOpen(isMdUp);
    setInsightPanelOpen(isLgUp);
  }, [setInsightPanelOpen, setSidebarOpen]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen">
      <DemoBanner />
      <TopBar />
      <CommandPalette />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SidePanel>
          <div className="space-y-6">
            <HistoryList />
            <div className="border-t pt-6">
              <ModeToggle />
            </div>
            <div className="border-t pt-6">
              <Filters />
            </div>
          </div>
        </SidePanel>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="max-w-2xl text-center space-y-6">
                  <h2 className="text-3xl font-bold">Velkommen til Kuno</h2>
                  <p className="text-muted-foreground text-lg">
                    Frontend-demo av Kuno med UI og interaksjoner. Alt innhold er lokalt simulert uten backend.
                  </p>
                  <Button
                    size="lg"
                    onClick={createConversation}
                    className="gap-2"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Start ny samtale
                  </Button>
                  <div className="pt-8 text-sm text-muted-foreground">
                    <p className="mb-2">Eksempler du kan prøve:</p>
                    <ul className="space-y-1">
                      <li>• Hva er skolens plikter ved mobbing?</li>
                      <li>• Hvordan beregnes fravær i videregående?</li>
                      <li>• Hva er klagefristen etter eksamen?</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <Message key={message.id} message={message} />
                ))}
                {isStreaming && <LoadingDots />}
                {!isStreaming && hasMessages && <FollowUps />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <ChatInput />
        </main>

        {/* Right Insight Panel */}
        <InsightPanel>
          <div className="space-y-6">
            <QualityNote />
            <SourceList />
            <ChunkViewer />
          </div>

          {/* Show button when panel is hidden */}
          <div className="lg:hidden fixed bottom-20 right-4 z-30">
            <Button
              size="icon"
              onClick={() => setInsightPanelOpen(true)}
              className="h-12 w-12 rounded-full shadow-lg"
            >
              <PanelRightOpen className="h-5 w-5" />
            </Button>
          </div>
        </InsightPanel>
      </div>
    </div>
  );
}
