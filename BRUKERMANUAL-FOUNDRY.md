# Brukermanual: Koble Kuno til Azure AI Foundry

Denne guiden er laget for forste gangs oppsett, helt uten forkunnskap.

## 1) Hva du har i dag

- Appen din fungerer allerede med mock-data.
- Det betyr at den kan ligge pa GitHub uten hemmelige nøkler.
- Nar Foundry ikke er satt opp, faller chatten tilbake til mock-svar automatisk.

## 2) Hva som er hemmelig og hva som kan pushes

Trygt a pushe til GitHub:
- Kodefiler i prosjektet
- `.env.local.example`

Skal aldri pushes:
- `.env.local` (inneholder hemmelige nøkler)

## 3) Oppsett i Azure AI Foundry (portal)

1. Logg inn i Azure AI Foundry.
2. Lag eller velg en eksisterende Azure OpenAI-resource.
3. Gaa til Models / Deployments.
4. Opprett en deployment av en chat-modell (for eksempel `gpt-4o-mini`).
5. Noter disse tre verdiene:
   - Endpoint (URL)
   - API Key
   - Deployment name (eksakt navn du ga deploymenten)

## 4) Oppsett i prosjektet lokalt

1. I prosjektroten, lag filen `.env.local`.
2. Kopier inn dette (og erstatt med dine verdier):

AZURE_OPENAI_ENDPOINT=https://DIN-RESOURCE.openai.azure.com
AZURE_OPENAI_API_KEY=din-hemmelige-nokkel
AZURE_OPENAI_DEPLOYMENT=ditt-deployment-navn
AZURE_OPENAI_API_VERSION=2024-10-21

3. Lagre filen.
4. Start appen pa nytt med `npm run dev`.

5. Sjekk at du ikke tvinger statisk export lokalt:

NEXT_PUBLIC_STATIC_EXPORT=false

Viktig:
- Endrer du `.env.local`, ma du restarte dev-serveren for at Next.js skal lese nye variabler.

## 5) Hvordan koblingen fungerer i koden

Frontend sender melding hit:
- `POST /api/chat`

Server-koden som snakker med Foundry:
- `src/app/api/chat/route.ts`

Chat-state som styrer meldingene i UI:
- `src/store/chat-store.ts`

Flyt:
1. Du skriver i chat-feltet
2. Frontend kaller lokal API-route
3. API-routen bruker env-verdier og kaller Foundry
4. Svar vises i chat
5. Hvis Foundry ikke er satt opp eller feiler, brukes mock-svar automatisk

Merk:
- Hvis `NEXT_PUBLIC_STATIC_EXPORT=true`, blir appen statisk og `POST /api/chat` vil gi 404.

## 6) Sjekkliste hvis det ikke virker

1. Er `.env.local` opprettet i prosjektroten?
2. Er `AZURE_OPENAI_DEPLOYMENT` helt lik deployment-navnet i Foundry?
3. Starter endpoint med `https://` og slutter uten ekstra tegn?
4. Har du restartet `npm run dev` etter env-endringer?
5. Har ressursen riktig tilgang/rettigheter i Azure?

## 7) Vanlig arbeidsmate videre

- GitHub/demo: behold mock-fallback som i dag
- Lokalt/staging: legg inn `.env.local` og test med Foundry
- Produksjon: sett samme env-variabler i host-plattformen (for eksempel Vercel/Azure App Service), aldri i frontend-kode

## 8) Hvilke filer er relevante

- `src/app/api/chat/route.ts`
- `src/store/chat-store.ts`
- `.env.local.example`
- `README.md`
