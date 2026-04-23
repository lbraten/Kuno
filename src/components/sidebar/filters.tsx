"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { DATA_SCOPE_OPTIONS } from "@/lib/data-scopes";
import type { DataScope } from "@/types";

export function Filters() {
  const { filter, setFilter } = useChatStore();
  const [open, setOpen] = useState(false);

  const setScope = (scope: DataScope) => {
    setFilter({ scope });
  };

  const clearFilters = () => {
    setFilter({
      scope: "all",
    });
  };

  const activeFilterCount = filter.scope === "all" ? 0 : 1;
  const selectedScopeOption = DATA_SCOPE_OPTIONS.find(
    (option) => option.value === filter.scope
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtre</h3>
        {activeFilterCount > 0 && (
          <span className="text-xs bg-secondary text-secondary-foreground border border-secondary/60 px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Administrer filtre
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Datagrunnlag</DialogTitle>
            <DialogDescription>
              Velg hvilke rapportkategorier modellen kan bruke i svarene.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div>
              <h4 className="font-medium mb-3">Datagrunnlag</h4>
              <div className="grid gap-2">
                {DATA_SCOPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setScope(option.value)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      filter.scope === option.value
                        ? "border-primary/70 bg-primary/10"
                        : "border-input hover:bg-secondary/40"
                    )}
                    aria-pressed={filter.scope === option.value}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={clearFilters}>
                Nullstill alle
              </Button>
              <Button onClick={() => setOpen(false)}>Bruk filtre</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active filters preview */}
      {activeFilterCount > 0 && (
        <div className="space-y-1">
          <div className="text-xs bg-secondary text-secondary-foreground border border-secondary/60 px-2 py-1 rounded truncate">
            Datagrunnlag: {selectedScopeOption?.label ?? "Ukjent"}
          </div>
        </div>
      )}
    </div>
  );
}
