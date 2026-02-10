"use client";

import { ReactNode } from "react";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsightPanelProps {
  children: ReactNode;
}

export function InsightPanel({ children }: InsightPanelProps) {
  const { insightPanelOpen, setInsightPanelOpen } = useUIStore();

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
          "fixed lg:static inset-y-0 right-0 z-50 w-80 border-l bg-background transition-transform duration-300 ease-in-out lg:translate-x-0",
          insightPanelOpen ? "translate-x-0" : "translate-x-full"
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
              onClick={() => setInsightPanelOpen(false)}
              aria-label="Skjul innsiktspanel"
              className="hidden lg:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            {children}
          </div>
        </div>
      </aside>
    </>
  );
}
