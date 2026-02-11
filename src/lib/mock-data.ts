export const mockConversations = [
  {
    id: "conv-1",
    title: "Hva sier regelverket om mobbing?",
    createdAt: "2026-02-08T10:30:00Z",
    updatedAt: "2026-02-08T10:35:00Z",
    messages: [],
  },
  {
    id: "conv-2",
    title: "Hvordan beregnes fravær i videregående?",
    createdAt: "2026-02-07T14:20:00Z",
    updatedAt: "2026-02-07T14:28:00Z",
    messages: [],
  },
  {
    id: "conv-3",
    title: "Gjennomføring av eksamen og klage",
    createdAt: "2026-02-05T09:15:00Z",
    updatedAt: "2026-02-05T09:22:00Z",
    messages: [],
  },
];

export const mockOrganizations = [
  "Utdanningsdirektoratet",
  "Kunnskapsdepartementet",
  "Barneombudet",
  "Statsforvalteren",
  "Skoleeier",
];

export const mockYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export const mockDocTypes = [
  "Forskrift",
  "Veileder",
  "Rundskriv",
  "Rapport",
  "Horing",
];

export const mockCitations = [
  {
    id: "cite-1",
    title: "Opplæringsloven kapittel 9 A (elevenes skolemiljø)",
    organization: "Utdanningsdirektoratet",
    year: 2024,
    docType: "Forskrift",
    chunkId: "chunk-1",
    score: 0.92,
  },
  {
    id: "cite-2",
    title: "Veileder: Mobbing og krenkelser i skolen",
    organization: "Utdanningsdirektoratet",
    year: 2023,
    docType: "Veileder",
    chunkId: "chunk-2",
    score: 0.88,
  },
  {
    id: "cite-3",
    title: "Forskrift om fravær i videregående opplæring",
    organization: "Kunnskapsdepartementet",
    year: 2025,
    docType: "Forskrift",
    chunkId: "chunk-3",
    score: 0.85,
  },
];

export const mockChunks: Record<string, string> = {
  "chunk-1":
    "Kapittel 9 A. Elevenes skolemiljø\n\nSkolen skal aktivt og systematisk arbeide for at alle elever har et trygt og godt skolemiljø som fremmer helse, trivsel og læring. Elever som opplever utrygghet eller krenkelser har rett til at skolen handler raskt og setter inn tiltak.",
  "chunk-2":
    "Veiledning om mobbing og krenkelser:\n\n1. Varsling: Alle ansatte skal melde fra ved mistanke om krenkelser.\n2. Undersøkelse: Skolen skal snarest mulig kartlegge elevens opplevelse.\n3. Tiltak: Det skal settes inn konkrete og evaluerbare tiltak.\n4. Oppfølging: Skolen må sikre at tiltakene virker over tid.",
  "chunk-3":
    "Fravær i videregående opplæring:\n\nFravær skal føres på vitnemål og kompetansebevis. Dokumentert fravær kan unntas innenfor fastsatte grenser. Skolen skal informere elevene om regler for dokumentasjon og frister.",
};

export const mockFollowUps = [
  "Hva skal skolen gjøre ved mistanke om mobbing?",
  "Hvilken dokumentasjon teller for fravær?",
  "Hvordan beregnes fraværsgrensen?",
  "Hva er klagefristen etter eksamen?",
];

export const mockAssistantResponses = [
  "Skolen har en plikt til å sikre et trygt og godt skolemiljø. Ved mistanke om mobbing skal skolen undersøke, sette inn tiltak og følge opp at tiltakene virker.",
  "Fravær i videregående skal føres på vitnemål, men dokumentert fravær kan unntas innenfor gjeldende regler. Elevene må informeres om krav til dokumentasjon.",
  "Ved eksamen gjelder egne regler for gjennomføring og klage. Klagefristen og prosessen skal framgå av skolens informasjon til elevene.",
  "Jeg har funnet relevant informasjon i gjeldende regelverk og veiledere. Her er de viktigste punktene.",
];

export const uncertaintyExplanations = {
  low: "Svaret er basert på klare og entydige kilder med høy relevans.",
  medium:
    "Svaret er basert på kilder som delvis dekker spørsmålet. Vurder å konsultere flere kilder.",
  high: "Svaret er usikkert. Kildene er ikke entydige eller har lav relevans til spørsmålet. Kontakt fagansvarlig for avklaring.",
};
