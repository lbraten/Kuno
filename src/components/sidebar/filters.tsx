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
import { Filter, SlidersHorizontal } from "lucide-react";
import {
  mockOrganizations,
  mockYears,
  mockDocTypes,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Filters() {
  const { filter, setFilter } = useChatStore();
  const [open, setOpen] = useState(false);

  const toggleOrganization = (org: string) => {
    const orgs = filter.organizations.includes(org)
      ? filter.organizations.filter((o) => o !== org)
      : [...filter.organizations, org];
    setFilter({ organizations: orgs });
  };

  const toggleYear = (year: number) => {
    const years = filter.years.includes(year)
      ? filter.years.filter((y) => y !== year)
      : [...filter.years, year];
    setFilter({ years });
  };

  const toggleDocType = (docType: string) => {
    const docTypes = filter.docTypes.includes(docType)
      ? filter.docTypes.filter((d) => d !== docType)
      : [...filter.docTypes, docType];
    setFilter({ docTypes });
  };

  const clearFilters = () => {
    setFilter({ organizations: [], years: [], docTypes: [] });
  };

  const activeFilterCount =
    filter.organizations.length + filter.years.length + filter.docTypes.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtre</h3>
        {activeFilterCount > 0 && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
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
            <DialogTitle>Avanserte filtre</DialogTitle>
            <DialogDescription>
              Velg hvilke kilder som skal inkluderes i søket
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Organizations */}
            <div>
              <h4 className="font-medium mb-3">Virksomheter</h4>
              <div className="space-y-2">
                {mockOrganizations.map((org) => (
                  <label
                    key={org}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filter.organizations.includes(org)}
                      onChange={() => toggleOrganization(org)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{org}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Years */}
            <div>
              <h4 className="font-medium mb-3">År</h4>
              <div className="flex flex-wrap gap-2">
                {mockYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm border transition-colors",
                      filter.years.includes(year)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-input hover:bg-accent"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Types */}
            <div>
              <h4 className="font-medium mb-3">Dokumenttyper</h4>
              <div className="space-y-2">
                {mockDocTypes.map((docType) => (
                  <label
                    key={docType}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filter.docTypes.includes(docType)}
                      onChange={() => toggleDocType(docType)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{docType}</span>
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
          {filter.organizations.slice(0, 2).map((org) => (
            <div
              key={org}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded truncate"
            >
              {org}
            </div>
          ))}
          {filter.organizations.length > 2 && (
            <div className="text-xs text-muted-foreground px-2">
              +{filter.organizations.length - 2} flere...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
