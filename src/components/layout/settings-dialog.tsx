"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen, accessibility, setAccessibility } =
    useUIStore();

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="w-[68vw] max-w-[980px] h-[70vh] max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Innstillinger</DialogTitle>
          <DialogDescription>
            Tilpass visning og bevegelse for bedre tilgjengelighet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Visning
            </h3>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Infobanner</p>
              <p className="text-xs text-muted-foreground">
                Viser informasjon om demo og tilkoblingsstatus øverst i appen.
              </p>
            </div>
            <Switch
              checked={Boolean(accessibility.infoBanner)}
              onCheckedChange={(checked) =>
                setAccessibility({ infoBanner: checked })
              }
              aria-label="Vis infobanner"
            />
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Markdown-modus</p>
              <p className="text-xs text-muted-foreground">
                Viser assistentsvar i ren tekst uten visuell pynt.
              </p>
            </div>
            <Switch
              checked={accessibility.markdownMode}
              onCheckedChange={(checked) =>
                setAccessibility({ markdownMode: checked })
              }
              aria-label="Aktiver markdown-modus"
            />
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Vis kildetall i svartekst</p>
              <p className="text-xs text-muted-foreground">
                Viser markorer som [1] i assistentsvar der det finnes kilder.
              </p>
            </div>
            <Switch
              checked={accessibility.showInlineCitationNumbers}
              onCheckedChange={(checked) =>
                setAccessibility({ showInlineCitationNumbers: checked })
              }
              aria-label="Vis kildetall i svartekst"
            />
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Tekststørrelse</p>
              <p className="text-xs text-muted-foreground">
                Velg standard, storre eller stor tekst i hele appen.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "normal", label: "Standard" },
                { key: "large", label: "Større" },
                { key: "xlarge", label: "Stor" },
              ].map((option) => (
                <Button
                  key={option.key}
                  type="button"
                  variant={
                    accessibility.textScale === option.key ? "default" : "outline"
                  }
                  size="sm"
                  className={cn("justify-center", option.key === "xlarge" && "font-semibold")}
                  onClick={() =>
                    setAccessibility({
                      textScale: option.key as "normal" | "large" | "xlarge",
                    })
                  }
                  aria-pressed={accessibility.textScale === option.key}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Typografi
            </h3>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Høy kontrast</p>
              <p className="text-xs text-muted-foreground">
                Gir tydeligere kontrast på tekst og viktige elementer.
              </p>
            </div>
            <Switch
              checked={accessibility.highContrast}
              onCheckedChange={(checked) =>
                setAccessibility({ highContrast: checked })
              }
              aria-label="Aktiver høy kontrast"
            />
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Redusert bevegelse</p>
              <p className="text-xs text-muted-foreground">
                Demper animasjoner og overganger.
              </p>
            </div>
            <Switch
              checked={accessibility.reducedMotion}
              onCheckedChange={(checked) =>
                setAccessibility({ reducedMotion: checked })
              }
              aria-label="Aktiver redusert bevegelse"
            />
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Dysleksivennlig font</p>
              <p className="text-xs text-muted-foreground">
                Bruker en mer lesbar font for lang tekst.
              </p>
            </div>
            <Switch
              checked={accessibility.dyslexicFont}
              onCheckedChange={(checked) =>
                setAccessibility({
                  dyslexicFont: checked,
                  robotoFont: checked ? false : accessibility.robotoFont,
                })
              }
              aria-label="Aktiver dysleksivennlig font"
            />
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Roboto font</p>
              <p className="text-xs text-muted-foreground">
                Bruk Roboto som standard skrifttype i appen.
              </p>
            </div>
            <Switch
              checked={accessibility.robotoFont}
              onCheckedChange={(checked) =>
                setAccessibility({
                  robotoFont: checked,
                  dyslexicFont: checked ? false : accessibility.dyslexicFont,
                })
              }
              aria-label="Aktiver Roboto font"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tilgjengelighet
            </h3>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Ekstra linjeavstand</p>
              <p className="text-xs text-muted-foreground">
                Gir bedre luft mellom linjer i teksttunge svar.
              </p>
            </div>
            <Switch
              checked={accessibility.extraLineSpacing}
              onCheckedChange={(checked) =>
                setAccessibility({ extraLineSpacing: checked })
              }
              aria-label="Aktiver ekstra linjeavstand"
            />
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Tydelig fokusmarkering</p>
              <p className="text-xs text-muted-foreground">
                Gjør tastaturnavigasjon lettere med sterkere fokusramme.
              </p>
            </div>
            <Switch
              checked={accessibility.strongFocus}
              onCheckedChange={(checked) =>
                setAccessibility({ strongFocus: checked })
              }
              aria-label="Aktiver tydelig fokusmarkering"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Utvikler
            </h3>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Utviklermodus</p>
              <p className="text-xs text-muted-foreground">
                Viser tekniske detaljer som chunk-lenker og tekstutdrag uten innhold.
              </p>
            </div>
            <Switch
              checked={Boolean(accessibility.developerMode)}
              onCheckedChange={(checked) =>
                setAccessibility({ developerMode: checked })
              }
              aria-label="Aktiver utviklermodus"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
