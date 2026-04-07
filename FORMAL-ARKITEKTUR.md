# Formål og Arkitektur: Kuno

## Hva er Kuno?

Kuno er en avansert chatbot-løsning for skole- og utdanningsspørsmål, bygget for å demonstrere både moderne frontend-teknologi og ekte integrasjon med kunstig intelligens (KI) via Azure AI Foundry. Prosjektet er ikke bare en visuell demo - det inneholder fullstendig backend-logikk for sikker, sporbar og kildebasert dialog med KI-modeller.

---

## Hvordan henger ting sammen?

### 1. Brukeropplevelse

- **Brukeren skriver et spørsmål** i chatten.
- UI-et gir umiddelbar tilbakemelding (streaming, oppfølgingsforslag, usikkerhetsindikatorer).
- Svaret kan komme fra mock-data (demo) eller fra ekte KI (Azure Foundry), avhengig av oppsett.

### 2. Fra prompt til Azure og tilbake

#### a) Frontend → Backend

- Når brukeren sender en melding, kalles en lokal API-route: `/api/chat`.
- Denne route-en fungerer som en sikker proxy - API-nøkler og sensitive data ligger kun på serveren.

#### b) Backend → Azure Foundry

- Serveren bygger opp en samtalehistorikk og systemprompt.
- Den velger riktig modus:
  - **Project Agent**: Bruker en forhåndsdefinert agent i Foundry, med tilgang til et spesifikt kunnskapsgrunnlag.
  - **Deployment**: Bruker en spesifikk modell-deployment (f.eks. GPT-4o) direkte.
- Spørsmålet og historikken sendes til Azure via REST-API, med alle nødvendige nøkler og parametre.

#### c) Azure → Backend

- Azure Foundry returnerer et svar, ofte med:
  - **Selve svaret** (tekst)
  - **Annotasjoner**: Referanser til hvilke dokumenter, PDF-er eller kilder svaret bygger på
  - **Evalueringsscore**: F.eks. hvor sikker modellen er, eller hvor relevante kildene er

#### d) Backend → Frontend

- Serveren pakker svaret, kildene og usikkerhetsnivået i et strukturert JSON-svar.
- Hvis det ikke finnes dokumenterte kilder (og "grounded only"-modus er aktiv), blokkeres svaret og brukeren får beskjed om at det mangler grunnlag.
- Frontend viser svaret, kildeliste, kvalitetsnotater og eventuelle usikkerhetsindikatorer.

---

## Evaluering, kilder og sporbarhet

- **Kilder**: Hver kilde har tittel, type (f.eks. PDF, URL), år, organisasjon og en relevans-score.
- **Annotasjoner**: KI-modellen kan markere hvilke deler av svaret som stammer fra hvilke kilder.
- **Evalueringsscore**: Systemet kan vise hvor sikker modellen er på svaret (lav, middels, høy usikkerhet), basert på innholdsanalyse og eventuelle filtere fra Azure.
- **Fallback**: Hvis annotasjoner mangler, kan systemet gjøre egne søk i Azure Search for å finne relevante dokumenter, eller verifisere lenker i teksten.

### Hvor vurderingen faktisk skjer i kode

For dette prosjektet skjer vurdering av svar **før** visning i backend, ikke i UI:

- `src/app/api/chat/route.ts`:
  - Leser policy-flagg som styrer evaluering (`KUNO_REQUIRE_GROUNDED_ONLY`, `KUNO_INCLUDE_DEBUG_DETAILS`, `KUNO_ALLOW_TEXT_URL_CITATION_FALLBACK`).
  - Setter `answerBasis` til `grounded`, `general` eller `blocked` basert på om dokumenterte kilder finnes.
  - Beregner `uncertainty` fra Azure content filters (safe/non-safe/filtered).
  - Blokkerer respons eksplisitt i grounded-only modus dersom citation-count er 0.
  - Logger hendelser som `project.response`, `response.blocked`, `project.call_failed` for sporbarhet.

- `src/store/chat-store.ts`:
  - Tar imot vurderingsfeltene fra API (`uncertainty`, `answerBasis`, `citations`) og legger dem på assistentmeldingen i state.
  - Gjør ikke kvalitetsvurdering selv, men videreformidler backend-resultatet til UI.

- `src/components/chat/message.tsx` og `src/components/insight/source-list.tsx`:
  - Viser status visuelt (f.eks. Datagrunnlag / Allmennkunnskap / Ikke i datagrunnlag).
  - Presenterer kilder eller forklarende tekst når svar er blokkert eller ugrunnlagt.

- `src/components/insight/quality-note.tsx`:
  - Viser kvalitetsnotat basert på `uncertainty`.
  - Merk: dette er presentasjon av vurdering, ikke selve vurderingsmotoren.

Konklusjon: Kvalitetskontroll og policy-handheving skjer i API-laget, mens frontend viser resultatet av disse kontrollene.

---

## Hvorfor er dette mer enn bare en frontend?

- **Ekte backend**: All KI-kommunikasjon skjer via en Next.js API-route, ikke direkte fra nettleseren. Dette gir sikkerhet, fleksibilitet og mulighet for logging, feilhåndtering og tilpasning.
- **Kildehåndtering**: Systemet gjør avansert matching mellom svar, annotasjoner og eksterne søk for å sikre at alle svar kan spores til dokumenterte kilder.
- **Sikkerhet**: API-nøkler og sensitive data eksponeres aldri til klienten.
- **Utvidbarhet**: Backend kan enkelt utvides med flere moduser, flere datakilder, eller ekstra logikk for evaluering og filtrering.
- **Diagnostikk og logging**: Alle kall, feilsituasjoner og filtere logges for enkel feilsøking og videreutvikling.

---

## Prosessflyt (oppsummert)

1. **Bruker skriver spørsmål**
2. **Frontend sender til backend**
3. **Backend bygger opp samtale og sender til Azure Foundry**
4. **Azure returnerer svar + kilder + score**
5. **Backend evaluerer, filtrerer og pakker svaret**
6. **Frontend viser alt - med sporbarhet og usikkerhetsindikatorer**

---

Dette gir en løsning som både er pedagogisk, sikker, og teknisk robust - og som kan brukes både som demo og som utgangspunkt for produksjon.