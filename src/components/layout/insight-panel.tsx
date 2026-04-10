"use client";

import { ReactNode } from "react";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
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
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            {children}
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "hidden lg:block fixed top-[66px] z-[70] transition-[right] duration-300 ease-in-out",
          insightPanelOpen ? "right-[21rem]" : "right-4"
        )}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleInsightPanel}
          aria-label={insightPanelOpen ? "Skjul innsiktspanel" : "Vis innsiktspanel"}
          className="hidden lg:flex bg-background/95 shadow-sm backdrop-blur [&_svg]:size-5"
        >
          {insightPanelOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
              <path d="M15 4v16" />
              <path d="M9 10l2 2l-2 2" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
              <path d="M15 4v16" />
              <path d="M10 10l-2 2l2 2" />
            </svg>
          )}
        </Button>
      </div>
    </>
  );
}
