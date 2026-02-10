export const mockConversations = [
  {
    id: "conv-1",
    title: "Hva er klimaavtalen i Paris?",
    createdAt: "2026-02-08T10:30:00Z",
    updatedAt: "2026-02-08T10:35:00Z",
    messages: [],
  },
  {
    id: "conv-2",
    title: "Retningslinjer for avfallshåndtering",
    createdAt: "2026-02-07T14:20:00Z",
    updatedAt: "2026-02-07T14:28:00Z",
    messages: [],
  },
  {
    id: "conv-3",
    title: "Forskrifter om byggesaksbehandling",
    createdAt: "2026-02-05T09:15:00Z",
    updatedAt: "2026-02-05T09:22:00Z",
    messages: [],
  },
];

export const mockOrganizations = [
  "Direktoratet for byggkvalitet",
  "Miljødirektoratet",
  "Helsedirektoratet",
  "Statsforvalteren",
  "Kommunal- og moderniseringsdepartementet",
];

export const mockYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export const mockDocTypes = [
  "Forskrift",
  "Veileder",
  "Rundskriv",
  "Rapport",
  "Høringsnotat",
];

export const mockCitations = [
  {
    id: "cite-1",
    title: "Plan- og bygningsloven § 12-4",
    organization: "Direktoratet for byggkvalitet",
    year: 2024,
    docType: "Forskrift",
    chunkId: "chunk-1",
    score: 0.92,
  },
  {
    id: "cite-2",
    title: "Veileder: Søknad om byggetillatelse",
    organization: "Direktoratet for byggkvalitet",
    year: 2023,
    docType: "Veileder",
    chunkId: "chunk-2",
    score: 0.88,
  },
  {
    id: "cite-3",
    title: "Avfallsforskriften kapittel 11",
    organization: "Miljødirektoratet",
    year: 2025,
    docType: "Forskrift",
    chunkId: "chunk-3",
    score: 0.85,
  },
];

export const mockChunks: Record<string, string> = {
  "chunk-1":
    "§ 12-4. Søknad om tillatelse\n\nTiltak etter § 1-2 og § 1-3 krever tillatelse (rammetillatelse, igangsettingstillatelse, midlertidig brukstillatelse og ferdigattest) fra kommunen. Tillatelse fra kommunen er ikke nødvendig når annet er bestemt i lov eller i medhold av lov.\n\nSøknad om tillatelse skal undertegnes av tiltakshaver og skal følges av nødvendige planer, tegninger og beskrivelser, samt kopi av nabovarsel etter § 21-3.",
  "chunk-2":
    "Veiledning for søknad om byggetillatelse:\n\n1. Planlegging: Før du søker, undersøk om tiltaket krever dispensasjon fra reguleringsplan.\n2. Dokumentasjon: Søknaden må inneholde situasjonsplan, fasadetegninger, plantegninger og snitt.\n3. Nabovarsel: Send varsel til naboer og legg ved dokumentasjon på dette i søknaden.\n4. Ansvarsrett: Oppgi hvem som har ansvarsrett (SØK, PRO, UTF, KONTROLL).",
  "chunk-3":
    "Kapittel 11. Avfall fra bygg- og anleggsvirksomhet\n\n§ 11-1. Virkeområde\nDette kapitlet gjelder avfall fra bygg- og anleggsvirksomhet, herunder avfall fra riving, rehabilitering og oppføring av bygninger og anlegg.\n\n§ 11-2. Kildesortering\nAvfall fra bygg- og anleggsvirksomhet skal kildesorteres i følgende fraksjoner: tre, metall, plast, gips, betong, tegl, papp/papir, farlig avfall og restavfall.",
};

export const mockFollowUps = [
  "Hva kreves av dokumentasjon ved søknad?",
  "Hvem kan ha ansvarsrett?",
  "Hva er forskjellen på ramme- og igangsettingstillatelse?",
  "Hvordan sender jeg nabovarsel?",
];

export const mockAssistantResponses = [
  "Basert på gjeldende forskrifter krever tiltak etter plan- og bygningsloven tillatelse fra kommunen. Dette inkluderer rammetillatelse, igangsettingstillatelse, midlertidig brukstillatelse og ferdigattest.",
  "For å søke om byggetillatelse må du innlevere en søknad med nødvendige planer, tegninger og beskrivelser. Søknaden skal undertegnes av tiltakshaver og følges av kopi av nabovarsel.",
  "Avfall fra bygg- og anleggsvirksomhet skal kildesorteres i ulike fraksjoner som tre, metall, plast, gips, betong, tegl, papp/papir, farlig avfall og restavfall, i henhold til avfallsforskriften kapittel 11.",
  "Jeg har funnet relevant informasjon om dette i gjeldende regelverk. La meg forklare de viktigste punktene.",
];

export const uncertaintyExplanations = {
  low: "Svaret er basert på klare og entydige kilder med høy relevans.",
  medium:
    "Svaret er basert på kilder som delvis dekker spørsmålet. Vurder å konsultere flere kilder.",
  high: "Svaret er usikkert. Kildene er ikke entydige eller har lav relevans til spørsmålet. Kontakt fagansvarlig for avklaring.",
};
