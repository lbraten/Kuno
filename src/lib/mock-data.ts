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
  {
    id: "conv-4",
    title: "Rett til spesialundervisning i grunnskolen",
    createdAt: "2026-02-04T11:10:00Z",
    updatedAt: "2026-02-04T11:18:00Z",
    messages: [],
  },
  {
    id: "conv-5",
    title: "Overgang barnehage til skole",
    createdAt: "2026-02-03T08:05:00Z",
    updatedAt: "2026-02-03T08:12:00Z",
    messages: [],
  },
  {
    id: "conv-6",
    title: "Fraværsgrense og dokumentasjon",
    createdAt: "2026-02-02T15:40:00Z",
    updatedAt: "2026-02-02T15:55:00Z",
    messages: [],
  },
  {
    id: "conv-7",
    title: "Regler for orden og oppførsel i ungdomsskolen",
    createdAt: "2026-02-01T09:30:00Z",
    updatedAt: "2026-02-01T09:41:00Z",
    messages: [],
  },
  {
    id: "conv-8",
    title: "Tilrettelegging ved eksamen i videregående",
    createdAt: "2026-01-31T13:05:00Z",
    updatedAt: "2026-01-31T13:16:00Z",
    messages: [],
  },
];

export const mockOrganizations = [
  "Utdanningsdirektoratet",
  "Kunnskapsdepartementet",
  "Barneombudet",
  "Statsforvalteren",
  "Skoleeier",
  "Kunnskapssenter for utdanning",
  "Barnehagemyndigheten",
];

export const mockYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export const mockDocTypes = [
  "Forskrift",
  "Veileder",
  "Rundskriv",
  "Rapport",
  "Høring",
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
  {
    id: "cite-4",
    title: "Veileder: Spesialundervisning i grunnskolen",
    organization: "Utdanningsdirektoratet",
    year: 2024,
    docType: "Veileder",
    chunkId: "chunk-4",
    score: 0.83,
  },
  {
    id: "cite-5",
    title: "Rundskriv om overgang barnehage til skole",
    organization: "Kunnskapsdepartementet",
    year: 2022,
    docType: "Rundskriv",
    chunkId: "chunk-5",
    score: 0.8,
  },
  {
    id: "cite-6",
    title: "Regler for orden og oppførsel",
    organization: "Utdanningsdirektoratet",
    year: 2023,
    docType: "Veileder",
    chunkId: "chunk-6",
    score: 0.78,
  },
  {
    id: "cite-7",
    title: "Tilrettelegging og særskilt tilpasning ved eksamen",
    organization: "Utdanningsdirektoratet",
    year: 2025,
    docType: "Veileder",
    chunkId: "chunk-7",
    score: 0.81,
  },
  {
    id: "cite-8",
    title: "Skolemiljø og tiltak mot mobbing – oppsummering",
    organization: "Utdanningsdirektoratet",
    year: 2024,
    docType: "Rapport",
    chunkId: "chunk-8",
    score: 0.79,
  },
  {
    id: "cite-9",
    title: "Fraværsutvikling i videregående opplæring",
    organization: "Utdanningsdirektoratet",
    year: 2023,
    docType: "Rapport",
    chunkId: "chunk-9",
    score: 0.77,
  },
  {
    id: "cite-10",
    title: "Eksamen og klage – praksisnotat",
    organization: "Utdanningsdirektoratet",
    year: 2024,
    docType: "Rundskriv",
    chunkId: "chunk-10",
    score: 0.76,
  },
  {
    id: "cite-11",
    title: "Spesialundervisning – kvalitetsnotat",
    organization: "Utdanningsdirektoratet",
    year: 2022,
    docType: "Rapport",
    chunkId: "chunk-11",
    score: 0.75,
  },
  {
    id: "cite-12",
    title: "Overgang barnehage-skole – felles forventninger",
    organization: "Kunnskapsdepartementet",
    year: 2023,
    docType: "Rundskriv",
    chunkId: "chunk-12",
    score: 0.74,
  },
  {
    id: "cite-13",
    title: "Orden og oppførsel – erfaringsrapport",
    organization: "Utdanningsdirektoratet",
    year: 2024,
    docType: "Rapport",
    chunkId: "chunk-13",
    score: 0.73,
  },
  {
    id: "cite-14",
    title: "Tilrettelegging ved eksamen – praksisnotat",
    organization: "Utdanningsdirektoratet",
    year: 2025,
    docType: "Rapport",
    chunkId: "chunk-14",
    score: 0.72,
  },
];

export const mockChunks: Record<string, string> = {
  "chunk-1":
    "Kapittel 9 A. Elevenes skolemiljø\n\nSkolen skal aktivt og systematisk arbeide for at alle elever har et trygt og godt skolemiljø som fremmer helse, trivsel og læring. Elever som opplever utrygghet eller krenkelser har rett til at skolen handler raskt og setter inn tiltak.",
  "chunk-2":
    "Veiledning om mobbing og krenkelser:\n\n1. Varsling: Alle ansatte skal melde fra ved mistanke om krenkelser.\n2. Undersøkelse: Skolen skal snarest mulig kartlegge elevens opplevelse.\n3. Tiltak: Det skal settes inn konkrete og evaluerbare tiltak.\n4. Oppfølging: Skolen må sikre at tiltakene virker over tid.",
  "chunk-3":
    "Fravær i videregående opplæring:\n\nFravær skal føres på vitnemål og kompetansebevis. Dokumentert fravær kan unntas innenfor fastsatte grenser. Skolen skal informere elevene om regler for dokumentasjon og frister.",
  "chunk-4":
    "Spesialundervisning i grunnskolen:\n\nElever som ikke har eller kan få tilfredsstillende utbytte av ordinær opplæring, kan ha rett til spesialundervisning. Skolen skal vurdere behovet, innhente sakkyndig vurdering og fatte vedtak med mål og omfang.",
  "chunk-5":
    "Overgang barnehage til skole:\n\nBarnehage og skole skal samarbeide om en trygg overgang. Foreldre skal involveres, og relevant informasjon kan deles med samtykke. Overgangsplaner skal bidra til kontinuitet i barnets læring og trivsel.",
  "chunk-6":
    "Orden og oppførsel i ungdomsskolen:\n\nSkolen kan fastsette lokale ordensregler. Reaksjoner skal være forholdsmessige og varsles på forhånd. Elever har rett til å bli hørt før det treffes tiltak som påvirker skolegangen.",
  "chunk-7":
    "Tilrettelegging ved eksamen:\n\nElever med behov for særskilt tilrettelegging kan få utvidet tid, hjelpemidler eller tilpasset gjennomføring. Skolen skal dokumentere behovet og informere om søknadsfrister.",
  "chunk-8":
    "Skolemiljø og tiltak mot mobbing:\n\nRapporter peker på behov for tydelig systemansvar, rask respons ved varsler og dokumenterte tiltak som evalueres jevnlig. Variasjon mellom skoler i rutiner og oppfølging er et gjennomgående funn.",
  "chunk-9":
    "Fraværsutvikling i videregående:\n\nFravær varierer mellom programområder og regioner. Tiltak som tett oppfølging, tidlig varsling og samarbeid med hjemmet trekkes frem som effektive for å redusere fravær.",
  "chunk-10":
    "Eksamen og klage – praksis:\n\nSkolen skal sikre at kandidatene får informasjon om klageadgang, frister og hva klagen kan gjelde. Dokumentasjon av hendelser og formelle feil er avgjørende ved klagebehandling.",
  "chunk-11":
    "Spesialundervisning – kvalitet og praksis:\n\nRapporter viser behov for tydelige mål i vedtak, sammenheng mellom sakkyndig vurdering og tiltak, og systematisk evaluering av elevens utbytte.",
  "chunk-12":
    "Overgang barnehage-skole – felles forventninger:\n\nTidlig dialog, felles aktiviteter og informasjonsdeling med samtykke styrker kontinuitet for barnet. Overgangsplaner bør være forankret hos skoleeier.",
  "chunk-13":
    "Orden og oppførsel – erfaringer:\n\nSkoler med tydelige ordensregler og konsekvent praksis rapporterer færre konflikter. Elever etterspør forutsigbarhet og medvirkning.",
  "chunk-14":
    "Tilrettelegging ved eksamen – praksis:\n\nBehovsvurdering skal dokumenteres, og tiltak må ikke svekke vurderingens validitet. Variasjon i praksis mellom skoler er et vanlig funn.",
};

export const mockFollowUps = [
  "Hva skal skolen gjøre ved mistanke om mobbing?",
  "Hvilken dokumentasjon teller for fravær?",
  "Hvordan beregnes fraværsgrensen?",
  "Hva er klagefristen etter eksamen?",
  "Hvem kan be om spesialundervisning?",
  "Hva er skolens plikter ved overgang fra barnehage?",
  "Hvilke regler gjelder for orden og oppførsel?",
  "Hvordan søker man om tilrettelegging ved eksamen?",
];

export const mockAssistantResponses = [
  "Jeg har gjennomgått relevante Udir-ressurser og oppsummert hovedfunn om skolemiljø og mobbing. Her er en strukturert oversikt:\n1. Skolemiljø og tiltak mot mobbing – oppsummering\nPubliseringsår: 2024\nHva rapporten sier:\nSkoler med klare rutiner for varsling og rask respons håndterer saker mer effektivt.\nDet er store variasjoner i hvordan tiltak dokumenteres og evalueres.\nElever rapporterer at involvering og medvirkning øker opplevd trygghet.\nI skolemiljødata oppgir ofte X% av elever at de har opplevd krenkelser det siste året.\nLenke: Les rapporten\n1\n2. Opplæringsloven kapittel 9 A (elevenes skolemiljø)\nPubliseringsår: 2024\nHva rapporten sier:\nSkolen har aktivitetsplikt ved mistanke om krenkelser.\nTiltak skal være konkrete, tidsfestede og evaluerbare.\nElevens opplevelse skal være utgangspunkt for vurderingen.\nLenke: Les regelverket\n2\n3. Veileder: Mobbing og krenkelser i skolen\nPubliseringsår: 2023\nHva rapporten sier:\nAlle ansatte skal melde fra ved mistanke om krenkelser.\nSkolen skal kartlegge saken raskt og følge opp over tid.\nSamarbeid med foresatte er sentralt for varig effekt.\nLenke: Les veilederen\n3\nOppsummert – største utfordringer\nUlik praksis mellom skoler skaper uforutsigbarhet for elever og foresatte.\nMangelfull dokumentasjon gjør det vanskelig å vurdere effekt av tiltak.\nBehov for tydeligere systematikk og elevmedvirkning.\nVil du at jeg lager en tiltaksplan basert på disse funnene?\n3 referanser\n1\nskolemiljo-rapport-2024.pdf\n2\nopplaeringsloven-kap9a.pdf\n3\nudir-mobbing-veileder-2023.pdf",
  "Jeg har gjennomgått relevante Udir-ressurser om fravær i videregående og oppsummert de viktigste funnene. Her er en strukturert oversikt:\n1. Fraværsutvikling i videregående opplæring\nPubliseringsår: 2023\nHva rapporten sier:\nFravær varierer mellom programområder og regioner.\nTidlig varsling og tett oppfølging reduserer risiko for høyt fravær.\nSkoler med tydelige rutiner rapporterer lavere andel elever over grensen.\nI fraværsdata oppgir ofte X% av elever fravær over fastsatt grense.\nLenke: Les rapporten\n1\n2. Forskrift om fravær i videregående opplæring\nPubliseringsår: 2025\nHva rapporten sier:\nFravær skal føres på vitnemål og kompetansebevis.\nDokumentert fravær kan unntas innenfor fastsatte rammer.\nSkolen skal informere om dokumentasjonskrav og frister.\nLenke: Les forskriften\n2\n3. Udir-veiledning om fravær\nPubliseringsår: 2024\nHva rapporten sier:\nEksempler på gyldig dokumentasjon må vurderes opp mot lokale rutiner.\nDialog med hjemmet og oppfølging ved mønstre i fravær er anbefalt.\nLenke: Les veilederen\n3\nOppsummert – største utfordringer\nStore variasjoner i praksis for dokumentasjon.\nUlik informasjonskvalitet til elever og foresatte.\nBehov for mer systematisk oppfølging tidlig i skoleåret.\nVil du at jeg lager forslag til lokal fraværsrutine?\n3 referanser\n1\nfravaer-rapport-2023.pdf\n2\nfravaer-forskrift-2025.pdf\n3\nudir-fravaer-veileder-2024.pdf",
  "Jeg har gjennomgått relevante Udir-ressurser om eksamen og klage. Her er en strukturert oversikt:\n1. Eksamen og klage – praksisnotat\nPubliseringsår: 2024\nHva rapporten sier:\nSkoler må dokumentere hendelser og formelle feil tydelig.\nKlageinformasjon skal gis på en forståelig måte til alle kandidater.\nKlagefrekvens varierer mellom fag, men ligger ofte rundt X%.\nLenke: Les notatet\n1\n2. Regler for eksamen og klage\nPubliseringsår: 2025\nHva rapporten sier:\nKlage kan gjelde formelle feil og vurdering der det er adgang.\nKlagefrister og klageinstans skal opplyses før eksamen.\nVed formelle feil kan eksamen annulleres.\nLenke: Les regelverket\n2\n3. Tilrettelegging ved eksamen – praksisnotat\nPubliseringsår: 2025\nHva rapporten sier:\nTilrettelegging krever dokumentert behov og søknad innen frist.\nTiltak må ikke svekke vurderingens validitet.\nSkoler rapporterer ulik praksis i innvilgelse av tiltak.\nLenke: Les notatet\n3\nOppsummert – største utfordringer\nUlik praksis for informasjon om klage.\nVariasjon i dokumentasjon ved formelle feil.\nBehov for mer forutsigbar tilretteleggingspraksis.\nVil du at jeg lager en sjekkliste for eksamensansvarlig?\n3 referanser\n1\neksamen-klage-2024.pdf\n2\nregelverk-eksamen-klage-2025.pdf\n3\ntilrettelegging-eksamen-2025.pdf",
  "Jeg har gjennomgått relevante Udir-ressurser om spesialundervisning i grunnskolen. Her er en strukturert oversikt:\n1. Spesialundervisning – kvalitetsnotat\nPubliseringsår: 2022\nHva rapporten sier:\nFlere vedtak mangler tydelige mål og evalueringskriterier.\nSammenheng mellom sakkyndig vurdering og tiltak er ofte svak.\nSkoler med faste evalueringsrutiner rapporterer bedre måloppnåelse.\nI kommunale oversikter mottar ofte X% av elever spesialundervisning.\nLenke: Les notatet\n1\n2. Veileder: Spesialundervisning i grunnskolen\nPubliseringsår: 2024\nHva rapporten sier:\nEleven har rett til medvirkning og tilpasset opplæring.\nSakkyndig vurdering skal ligge til grunn for vedtak.\nVedtak skal beskrive mål, innhold og organisering.\nLenke: Les veilederen\n2\nOppsummert – største utfordringer\nMangler i kvalitet på vedtak og oppfølging.\nUjevn praksis mellom skoler.\nBehov for tydeligere mål og evaluering.\nVil du at jeg lager en mal for vedtak og oppfølging?\n2 referanser\n1\nspesialundervisning-kvalitetsnotat-2022.pdf\n2\nudir-spesialundervisning-veileder-2024.pdf",
  "Jeg har gjennomgått relevante Udir-ressurser om overgang barnehage til skole. Her er en strukturert oversikt:\n1. Overgang barnehage-skole – felles forventninger\nPubliseringsår: 2023\nHva rapporten sier:\nOvergangsplaner gir bedre kontinuitet for barnet.\nForeldresamarbeid og samtykke er avgjørende for informasjonsdeling.\nFelles aktiviteter styrker trygghet ved skolestart.\nLokale kartlegginger viser ofte at X% av foresatte opplever overgangstiltak som nyttige.\nLenke: Les rundskrivet\n1\n2. Rundskriv om overgang barnehage til skole\nPubliseringsår: 2022\nHva rapporten sier:\nBarnehage og skole skal samarbeide om en trygg overgang.\nInformasjon kan deles med samtykke.\nTiltak skal tilpasses lokale behov.\nLenke: Les rundskrivet\n2\nOppsummert – største utfordringer\nUlik grad av struktur mellom barnehager og skoler.\nVarierende praksis for samtykke og informasjonsdeling.\nBehov for felles overgangsplan i skoleeier.\nVil du at jeg lager forslag til overgangsplan?\n2 referanser\n1\novergang-felles-forventninger-2023.pdf\n2\novergang-rundskriv-2022.pdf",
  "Jeg har gjennomgått relevante Udir-ressurser om orden og oppførsel i ungdomsskolen. Her er en strukturert oversikt:\n1. Orden og oppførsel – erfaringsrapport\nPubliseringsår: 2024\nHva rapporten sier:\nSkoler med tydelige ordensregler rapporterer færre konflikter.\nElever etterspør forutsigbarhet og medvirkning.\nReaksjoner som oppleves rettferdige gir høyere etterlevelse.\nI skoleeierdata registreres ofte X% av saker knyttet til brudd i overgang mellom timer.\nLenke: Les rapporten\n1\n2. Regler for orden og oppførsel\nPubliseringsår: 2023\nHva rapporten sier:\nOrdensregler må være tydelige og kjent for elever og foresatte.\nTiltak skal være forholdsmessige og varsles.\nElever har rett til å bli hørt før sanksjoner.\nLenke: Les veilederen\n2\nOppsummert – største utfordringer\nUlik praktisering av sanksjoner mellom lærere.\nManglende elevmedvirkning i regelutforming.\nBehov for tydeligere rutiner for varsling.\nVil du at jeg lager forslag til revidert ordensreglement?\n2 referanser\n1\norden-erfaringsrapport-2024.pdf\n2\norden-veileder-2023.pdf",
  "Jeg har gjennomgått relevante Udir-ressurser om tilrettelegging ved eksamen. Her er en strukturert oversikt:\n1. Tilrettelegging ved eksamen – praksisnotat\nPubliseringsår: 2025\nHva rapporten sier:\nBehovsvurdering skal dokumenteres og være begrunnet.\nTiltak skal ikke svekke vurderingens validitet.\nSkoler rapporterer variasjon i innvilgelse og tiltakstype.\nI fylkesvise oversikter innvilges ofte X% av søknader om tilrettelegging.\nLenke: Les notatet\n1\n2. Tilrettelegging og særskilt tilpasning ved eksamen\nPubliseringsår: 2025\nHva rapporten sier:\nSkolen skal informere om søknadsfrister og krav til dokumentasjon.\nTiltak kan være utvidet tid, hjelpemidler eller tilpasset lokasjon.\nLik praksis er nødvendig for å sikre likebehandling.\nLenke: Les veilederen\n2\nOppsummert – største utfordringer\nUlik praksis i behovsvurdering.\nUklare frister og krav til dokumentasjon.\nBehov for mer likebehandling mellom skoler.\nVil du at jeg lager en søknadsmal for tilrettelegging?\n2 referanser\n1\ntilrettelegging-praksisnotat-2025.pdf\n2\nudir-tilrettelegging-veileder-2025.pdf",
  "Jeg har samlet de viktigste punktene fra gjeldende regelverk og veiledere. Si ifra hvilket tema du vil dykke dypere i, så lager jeg en komplett oversikt med kilder og handlingspunkter.",
];

export const uncertaintyExplanations = {
  low: "Svaret er basert på klare og entydige kilder med høy relevans.",
  medium:
    "Svaret er basert på kilder som delvis dekker spørsmålet. Vurder å konsultere flere kilder.",
  high: "Svaret er usikkert. Kildene er ikke entydige eller har lav relevans til spørsmålet. Kontakt fagansvarlig for avklaring.",
};
