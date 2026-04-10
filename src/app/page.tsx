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
import { Input } from "@/components/ui/input";
import { PanelRightOpen, Search, Send, SlidersHorizontal } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { SettingsDialog } from "@/components/layout/settings-dialog";
import Image from "next/image";

const EXAMPLE_PROMPTS = [
  "Hva viser rapportene om implementering av LK20 i grunnskolen?",
  "Hvilke funn finnes om vurderingspraksis i videregående opplæring?",
  "Hva sier forskningen om inkludering og læringsmiljø i skolen?",
  "Hvilke tiltak virker mot mobbing og uønsket atferd?",
  "Hva vet vi om overgangen fra barnehage til skole?",
  "Hvilke funn finnes om tidlig innsats og spesialpedagogiske tiltak?",
];

export default function Home() {
  const { messages, isStreaming, sendMessage, mode } = useChatStore();
  const { insightPanelOpen, setInsightPanelOpen, setSidebarOpen } = useUIStore();
  const { accessibility } = useUIStore();
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

  useEffect(() => {
    const body = document.body;

    body.classList.toggle("a11y-text-large", accessibility.textScale === "large");
    body.classList.toggle("a11y-text-xlarge", accessibility.textScale === "xlarge");
    body.classList.toggle("a11y-markdown-mode", accessibility.markdownMode);
    body.classList.toggle("a11y-high-contrast", accessibility.highContrast);
    body.classList.toggle("a11y-reduced-motion", accessibility.reducedMotion);
    body.classList.toggle("a11y-dyslexic-font", accessibility.dyslexicFont);
    body.classList.toggle("a11y-roboto-font", accessibility.robotoFont);
    body.classList.toggle("a11y-extra-line-spacing", accessibility.extraLineSpacing);
    body.classList.toggle("a11y-strong-focus", accessibility.strongFocus);
  }, [accessibility]);

  const hasMessages = messages.length > 0;
  const isComingSoonMode = mode === "retrieve" || mode === "advanced";
  const comingSoonContent =
    mode === "retrieve"
      ? {
          title: "Søk-agent",
          subtitle: "Søk er ikke utviklet ennå.",
          hint: "Bytt tilbake til Chat for å skrive meldinger.",
          Icon: Search,
        }
      : {
          title: "Avansert søk",
          subtitle: "Avansert søk er ikke utviklet ennå.",
          hint: "Bytt tilbake til Chat for å skrive meldinger.",
          Icon: SlidersHorizontal,
        };

  return (
    <div className="flex flex-col h-screen">
      {Boolean(accessibility.infoBanner) && <DemoBanner />}
      <TopBar />
      <CommandPalette />
      <SettingsDialog />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SidePanel>
          <div className="space-y-6">
            <div>
              <HistoryList />
            </div>
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
            {isComingSoonMode ? (
              <div className="flex h-full items-center justify-center px-4 py-6">
                <div className="w-full max-w-3xl rounded-2xl border bg-card/70 p-6 shadow-sm backdrop-blur-sm md:p-7">
                  <div className="mx-auto w-full max-w-2xl space-y-5 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-background shadow-sm">
                      <comingSoonContent.Icon className="h-8 w-8 text-udir-green-8" />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-3xl font-bold tracking-tight">{comingSoonContent.title}</h2>
                      <p className="text-muted-foreground text-lg leading-relaxed">{comingSoonContent.subtitle}</p>
                    </div>

                    <div className="mx-auto max-w-xl rounded-lg border border-udir-green-7 bg-udir-green-3 px-4 py-3 text-sm font-medium text-udir-green-9 dark:border-udir-green-6 dark:bg-udir-green-10/35 dark:text-udir-green-3">
                      Denne funksjonen er ikke utviklet ennå.
                    </div>

                    <div className="mx-auto flex w-full max-w-xl gap-2">
                      <Input
                        disabled
                        placeholder="Skriving er deaktivert i denne modusen"
                        className="flex-1 text-base sm:text-sm"
                        aria-label="Skrivefelt deaktivert"
                      />
                      <Button type="button" size="icon" disabled aria-label="Send deaktivert">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">{comingSoonContent.hint}</p>
                  </div>
                </div>
              </div>
            ) : !hasMessages ? (
              <div className="flex h-full items-center justify-center px-4 py-6">
                <div className="w-full max-w-3xl rounded-2xl border bg-card/70 p-6 shadow-sm backdrop-blur-sm md:p-7">
                  <div className="mx-auto w-full max-w-2xl space-y-5 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border bg-background shadow-sm">
                      <Image
                        src="/branding/Kuno-logo.svg"
                        alt="Kuno"
                        width={34}
                        height={34}
                        className="h-8 w-8 dark:hidden"
                      />
                      <Image
                        src="/branding/Kuno-logo-white.svg"
                        alt="Kuno"
                        width={34}
                        height={34}
                        className="hidden h-8 w-8 dark:block"
                      />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-3xl font-bold tracking-tight">Hei, jeg er Kuno!</h2>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Jeg hjelper deg med å finne og oppsummere innsikt fra rapporter om barnehage, grunnskole og videregående,
                        blant annet om LK20, vurdering, inkludering og læringsmiljø.
                        Svarene bygger på oppsummert forskning og analyser fra Utdanningsdirektoratets kunnskapssystemer.
                      </p>
                    </div>

                    <div className="mx-auto grid max-w-xl grid-cols-1 gap-2 text-center text-sm sm:grid-cols-3">
                      <div className="rounded-lg border border-udir-green-7 bg-udir-green-3 px-3 py-2 font-medium text-udir-green-9 dark:border-udir-green-6 dark:bg-udir-green-10/35 dark:text-udir-green-3">
                        Oppsummere funn
                      </div>
                      <div className="rounded-lg border border-udir-green-7 bg-udir-green-3 px-3 py-2 font-medium text-udir-green-9 dark:border-udir-green-6 dark:bg-udir-green-10/35 dark:text-udir-green-3">
                        Sammenligne rapporter
                      </div>
                      <div className="rounded-lg border border-udir-green-7 bg-udir-green-3 px-3 py-2 font-medium text-udir-green-9 dark:border-udir-green-6 dark:bg-udir-green-10/35 dark:text-udir-green-3">
                        Foresla oppfølging
                      </div>
                    </div>

                    <div className="pt-4 text-sm text-muted-foreground">
                      <p className="mb-2 font-medium text-foreground">Prøv et spørsmål:</p>
                      <p className="mb-4">Klikk på et forslag under, eller skriv ditt eget spørsmål nederst.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
                      {EXAMPLE_PROMPTS.map((prompt) => (
                        <Button
                          key={prompt}
                          type="button"
                          variant="outline"
                          disabled={isStreaming}
                          onClick={() => void sendMessage(prompt)}
                          className="min-h-24 w-full justify-center rounded-xl border-border bg-card px-4 py-3 whitespace-normal text-center text-foreground shadow-sm hover:bg-muted"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
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

          {!isComingSoonMode && <ChatInput />}
        </main>

        {/* Right Insight Panel */}
        <InsightPanel>
          <div className="space-y-6">
            <QualityNote />
            <SourceList />
            <ChunkViewer />
          </div>
        </InsightPanel>

        {!insightPanelOpen && (
          <div className="lg:hidden fixed bottom-20 right-4 z-50">
            <Button
              size="icon"
              onClick={() => setInsightPanelOpen(true)}
              className="h-12 w-12 rounded-full shadow-lg"
              aria-label="Vis innsiktspanel"
            >
              <PanelRightOpen className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
