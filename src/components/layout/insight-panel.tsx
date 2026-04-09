"use client";

import { ReactNode } from "react";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsightPanelProps {
  children: ReactNode;
}

export function InsightPanel({ children }: InsightPanelProps) {
  const { insightPanelOpen, setInsightPanelOpen, toggleInsightPanel } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {insightPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setInsightPanelOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Insight panel */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 border-l bg-background overflow-hidden transition-all duration-300 ease-in-out lg:static lg:inset-auto lg:right-auto",
          insightPanelOpen
            ? "w-80 translate-x-0"
            : "w-80 translate-x-full lg:w-0 lg:translate-x-0 lg:border-l-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Innsikt</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setInsightPanelOpen(false)}
              aria-label="Lukk innsiktspanel"
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleInsightPanel}
              aria-label={insightPanelOpen ? "Skjul innsiktspanel" : "Vis innsiktspanel"}
              className="hidden lg:flex"
            >
              {insightPanelOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            {children}
          </div>
        </div>
      </aside>

      {!insightPanelOpen && (
        <div className="hidden lg:block fixed right-4 top-24 z-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleInsightPanel}
            aria-label="Vis innsiktspanel"
            className="hidden lg:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}
