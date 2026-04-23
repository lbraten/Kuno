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

const ALL_SCOPE: DataScope = "all";
const THEME_SCOPE_OPTIONS = DATA_SCOPE_OPTIONS.filter(
  (option) => option.value !== ALL_SCOPE
);

export function Filters() {
  const { filter, setFilter } = useChatStore();
  const [open, setOpen] = useState(false);

  const selectedScopes = filter.scopes.length > 0 ? filter.scopes : [ALL_SCOPE];

  const setScopes = (scopes: DataScope[]) => {
    setFilter({ scopes });
  };

  const isScopeSelected = (scope: DataScope) => {
    return selectedScopes.includes(scope);
  };

  const toggleScope = (scope: DataScope) => {
    if (scope === ALL_SCOPE) {
      setScopes([ALL_SCOPE]);
      return;
    }

    const nextSet = new Set(selectedScopes);
    nextSet.delete(ALL_SCOPE);

    if (nextSet.has(scope)) {
      nextSet.delete(scope);
    } else {
      nextSet.add(scope);
    }

    const nextScopes = Array.from(nextSet) as DataScope[];
    setScopes(nextScopes.length > 0 ? nextScopes : [ALL_SCOPE]);
  };

  const clearFilters = () => {
    setScopes([ALL_SCOPE]);
  };

  const selectedScopedOptions = DATA_SCOPE_OPTIONS.filter(
    (option) => option.value !== ALL_SCOPE && selectedScopes.includes(option.value)
  );
  const activeFilterCount = selectedScopedOptions.length;
  const selectedLabelPreview = selectedScopedOptions
    .slice(0, 2)
    .map((option) => option.label)
    .join(", ");

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
              Velg en eller flere rapportkategorier modellen kan bruke i svarene.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <h4 className="font-medium mb-2">Datagrunnlag</h4>

              <label
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm cursor-pointer",
                  isScopeSelected(ALL_SCOPE)
                    ? "border-primary/70 bg-primary/10"
                    : "border-input hover:bg-secondary/25"
                )}
              >
                <input
                  type="checkbox"
                  checked={isScopeSelected(ALL_SCOPE)}
                  onChange={() => toggleScope(ALL_SCOPE)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                <span>Alle rapporter</span>
              </label>

              <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {THEME_SCOPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm leading-snug cursor-pointer",
                      isScopeSelected(option.value)
                        ? "border-primary/70 bg-primary/10"
                        : "border-input hover:bg-secondary/25"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isScopeSelected(option.value)}
                      onChange={() => toggleScope(option.value)}
                      className="h-3.5 w-3.5 accent-primary shrink-0"
                    />
                    <span>{option.label}</span>
                  </label>
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
            Datagrunnlag: {selectedLabelPreview}
            {activeFilterCount > 2 ? ` +${activeFilterCount - 2} flere` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
