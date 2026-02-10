"use client";

import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
        <p className="text-amber-900 dark:text-amber-200">
          <strong>Kuno (frontend-demo):</strong> Dette er en testmodell uten
          ekte data eller backend. Innholdet er simulert.
        </p>
      </div>
    </div>
  );
}
