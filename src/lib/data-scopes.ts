import type { DataScope } from "@/types";

export type ThematicDataScope = Exclude<DataScope, "all">;

export type DataScopeDefinition = {
  id: ThematicDataScope;
  label: string;
  description: string;
  includeTerms: string[];
  aliases?: string[];
};

export const THEMATIC_DATA_SCOPE_ORDER: ThematicDataScope[] = [
  "elevundersokelsen",
  "laererundersokelser",
  "skolelederundersokelser",
  "foreldreundersokelser",
  "tiltaksevalueringer",
  "laereplananalyse",
  "mobbing-og-psykososialt-miljo",
  "frafalls-og-gjennomforingsstudier",
  "kompetanseutvikling",
  "barnehageforskning",
  "minoritetsperspektiv",
  "digitalisering-og-teknologi",
  "spesialundervisning-og-tilpasset-opplaering",
];

export const DATA_SCOPE_DEFINITIONS: Record<
  ThematicDataScope,
  DataScopeDefinition
> = {
  elevundersokelsen: {
    id: "elevundersokelsen",
    label: "Elevundersøkelsen",
    description: "Svar fra kilder som handler om Elevundersøkelsen.",
    includeTerms: [
      "elevundersøkelsen",
      "elevundersøkelse",
      "elevundersokelsen",
      "elevundersokelse",
    ],
  },
  laererundersokelser: {
    id: "laererundersokelser",
    label: "Lærerundersøkelser",
    description: "Kilder knyttet til lærerundersøkelser.",
    includeTerms: [
      "lærerundersøkelsen",
      "lærerundersøkelser",
      "laererundersokelsen",
      "laererundersokelser",
    ],
  },
  skolelederundersokelser: {
    id: "skolelederundersokelser",
    label: "Skolelederundersøkelser",
    description: "Kilder knyttet til skolelederundersøkelser.",
    includeTerms: [
      "skolelederundersøkelsen",
      "skolelederundersøkelser",
      "skolelederundersokelsen",
      "skolelederundersokelser",
    ],
  },
  foreldreundersokelser: {
    id: "foreldreundersokelser",
    label: "Foreldreundersøkelser",
    description: "Kilder knyttet til foreldreundersøkelser.",
    includeTerms: [
      "foreldreundersøkelsen",
      "foreldreundersøkelser",
      "foreldreundersokelsen",
      "foreldreundersokelser",
    ],
  },
  tiltaksevalueringer: {
    id: "tiltaksevalueringer",
    label: "Tiltaksevalueringer",
    description: "Effektevalueringer og vurderinger av tiltak.",
    includeTerms: [
      "tiltaksevaluering",
      "tiltaksevalueringer",
      "evaluering av tiltak",
      "effektevaluering",
    ],
  },
  laereplananalyse: {
    id: "laereplananalyse",
    label: "Læreplananalyse",
    description: "Analyser av læreplanverk, inkludert LK20.",
    includeTerms: ["læreplananalyse", "laereplananalyse", "lk20", "læreplan"],
  },
  "mobbing-og-psykososialt-miljo": {
    id: "mobbing-og-psykososialt-miljo",
    label: "Mobbing og psykososialt miljø",
    description: "Kilder om mobbing, skolemiljø og psykososialt miljø.",
    includeTerms: [
      "mobbing",
      "psykososialt miljø",
      "psykososialt miljo",
      "skolemiljø",
      "skolemiljo",
      "krenkelser",
    ],
  },
  "frafalls-og-gjennomforingsstudier": {
    id: "frafalls-og-gjennomforingsstudier",
    label: "Frafalls- og gjennomføringsstudier",
    description: "Studier om frafall, fullføring og gjennomføring.",
    includeTerms: [
      "frafall",
      "gjennomføring",
      "gjennomforing",
      "fullføring",
      "fullforing",
    ],
  },
  kompetanseutvikling: {
    id: "kompetanseutvikling",
    label: "Kompetanseutvikling",
    description: "Kilder om kompetanseutvikling i sektoren.",
    includeTerms: ["kompetanseutvikling", "etterutdanning", "videreutdanning"],
  },
  barnehageforskning: {
    id: "barnehageforskning",
    label: "Barnehageforskning",
    description: "Forskningskilder om barnehagefeltet.",
    includeTerms: ["barnehageforskning", "barnehage", "førskole", "forskning"],
  },
  minoritetsperspektiv: {
    id: "minoritetsperspektiv",
    label: "Minoritetsperspektiv",
    description: "Kilder med minoritets- og mangfoldsperspektiv.",
    includeTerms: [
      "minoritetsperspektiv",
      "minoritet",
      "mangfold",
      "innvandrerbakgrunn",
      "språklig",
      "spraklig",
    ],
  },
  "digitalisering-og-teknologi": {
    id: "digitalisering-og-teknologi",
    label: "Digitalisering og teknologi",
    description: "Kilder om digitalisering, IKT og teknologi.",
    includeTerms: ["digitalisering", "teknologi", "ikt", "digital"],
  },
  "spesialundervisning-og-tilpasset-opplaering": {
    id: "spesialundervisning-og-tilpasset-opplaering",
    label: "Spesialundervisning og tilpasset opplæring",
    description: "Kilder om spesialundervisning og tilpasset opplæring.",
    includeTerms: [
      "spesialundervisning",
      "tilpasset opplæring",
      "tilpasset opplaering",
      "inkludering",
    ],
  },
};

export const DATA_SCOPE_OPTIONS: Array<{
  value: DataScope;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "Alle rapporter",
    description: "Bruk hele kunnskapsgrunnlaget i indeksen.",
  },
  ...THEMATIC_DATA_SCOPE_ORDER.map((scopeId) => {
    const definition = DATA_SCOPE_DEFINITIONS[scopeId];
    return {
      value: definition.id,
      label: definition.label,
      description: definition.description,
    };
  }),
];

const DATA_SCOPE_SET = new Set<DataScope>(
  DATA_SCOPE_OPTIONS.map((option) => option.value)
);

export function isDataScope(value: unknown): value is DataScope {
  return typeof value === "string" && DATA_SCOPE_SET.has(value as DataScope);
}
