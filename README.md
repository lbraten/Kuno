# Kuno - Frontend Demo

<p align="center">
    <img src="public/branding/Kuno-logo.svg" alt="Kuno logo" width="220" />
</p>

En komplett frontend-demo av Kuno chatbot bygget med Next.js, TypeScript og Tailwind CSS.

## Formål

Dette er en frontend-fokusert demo designet for å demonstrere UI/UX, interaksjoner, tilgjengelighet og flyt.
Den fungerer med mock-data out-of-the-box, og kan kobles til Azure AI Foundry via en sikker server-endpoint i Next.js.

## Koble til Azure AI Foundry

1. Opprett filen `.env.local` i prosjektroten (du kan kopiere fra `.env.local.example`).
2. Sett verdier for:
    - `AZURE_OPENAI_ENDPOINT`
    - `AZURE_OPENAI_API_KEY`
    - `AZURE_OPENAI_DEPLOYMENT`
    - `AZURE_OPENAI_API_VERSION` (valgfritt, standard er `2024-10-21`)
3. Start appen med `npm run dev`.
4. Send en melding i chatten. Frontend kaller da `POST /api/chat`, som videresender sikkert til Foundry.

### Viktig sikkerhet

- API-nokkel ligger kun pa serveren (i `.env.local`), ikke i browser-kode.
- Klienten kaller kun lokal Next.js-route (`src/app/api/chat/route.ts`).
- Ikke bruk `NEXT_PUBLIC_` for hemmelige nøkler.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Språk**: TypeScript
- **Styling**: Tailwind CSS + CSS-variabler
- **Komponenter**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Markdown**: react-markdown
- **Ikoner**: Lucide React
- **i18n**: next-intl (nb-NO)

## Funksjoner

### Layout
- **Demo-banner**: Alltid synlig øverst for å indikere at dette er en demo
- **Toppbar**: Logo, søk, tema-bryter, innstillinger
- **Venstre sidebar**: Historikk, modus-velger, filtre
- **Hovedområde**: Chat med meldinger, oppfølgingsspørsmål, streaming
- **Høyre panel**: Kilder, tekstutdrag, kvalitetsnotater

### Funksjoner
- Simulert chat-streaming (ord-for-ord)
- Mock kilder med relevans-score
- Usikkerhetsindikatorer (lav/middels/høy)
- Filtre (virksomhet, år, dokumenttype)
- Tre modi: Chat, Søk, Avansert
- Historikk med samtaler
- Light/Dark/System tema
- Responsivt design (mobil-først)
- Kommandopalett (Ctrl+K / ⌘K)
- Tilgjengelighetsfunksjoner (ARIA, keyboard nav)
- Respekterer prefers-reduced-motion

## Prosjektstruktur

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Hovedside
│   └── globals.css         # Global styling
├── components/
│   ├── chat/               # Chat-komponenter
│   │   ├── message.tsx
│   │   ├── chat-input.tsx
│   │   ├── loading-dots.tsx
│   │   └── follow-ups.tsx
│   ├── layout/             # Layout-komponenter
│   │   ├── demo-banner.tsx
│   │   ├── top-bar.tsx
│   │   ├── side-panel.tsx
│   │   └── insight-panel.tsx
│   ├── sidebar/            # Sidebar-komponenter
│   │   ├── history-list.tsx
│   │   ├── mode-toggle.tsx
│   │   └── filters.tsx
│   ├── insight/            # Innsiktspanel-komponenter
│   │   ├── source-list.tsx
│   │   ├── chunk-viewer.tsx
│   │   └── quality-note.tsx
│   ├── ui/                 # shadcn/ui komponenter
│   └── providers/          # React providers
├── store/
│   ├── chat-store.ts       # Zustand chat state
│   └── ui-store.ts         # Zustand UI state
├── lib/
│   ├── utils.ts            # Hjelpefunksjoner
│   └── mock-data.ts        # Mock data
└── types/
    └── index.ts            # TypeScript typer
```

## Design System

### Fargepalett
- **Primær**: Grønn (CSS-variabel `--primary`: 149.6 28.1% 49.6%)
- **Aksent**: Lys grønn (CSS-variabel `--accent`: 148 41.7% 85.9%)
- **Petrol**: Egendefinert skala i Tailwind (`petrol`, bl.a. #76C69D / #5BA27E)
- **Nøytral**: Lyse/mørke gråtoner fra `--background` og `--foreground`

### Typografi
- **Font**: Inter (med system fallback)
- **Skala**: Tailwind standard

### Tema
- Light mode (standard når ingen lagret preferanse finnes)
- Dark mode
- System (følger OS-preferanse)

## Nøkkelfunksjoner

### Simulert Streaming
Chat-responser streames ord-for-ord med `setInterval` for å simulere en ekte AI-respons.

### Mock Data
All data (samtaler, kilder, chunks) er hardkodet i `src/lib/mock-data.ts`. Ingen nettverkskall gjøres.

### State Management
- **chat-store.ts**: Håndterer samtaler, meldinger, filtre, modus
- **ui-store.ts**: Håndterer tema, sidebar/panel-tilstand, kommandopalett

### Tilgjengelighet
- Semantisk HTML
- ARIA-labels
- Keyboard navigation
- Focus management
- Screen reader support
- Respekterer `prefers-reduced-motion`

## Internasjonalisering

Prosjektet bruker `next-intl` med norsk bokmål (nb-NO) som standard språk.
Oversettelser finnes i `messages/nb-NO.json`.

## Responsivt Design

- **Mobil (<768px)**: Sidebar og innsiktspanel starter lukket
- **Tablet (768px-1024px)**: Sidebar synlig, innsiktspanel kan skjules
- **Desktop (>1024px)**: Full layout med alle paneler synlige

## Ytelse

- Server-side rendering med Next.js App Router
- Optimalisert bundle med code splitting
- Lazy loading av komponenter hvor relevant
- Optimaliserte animasjoner

## Testing

Testing er ikke konfigurert ennå.

## Lisens

Privat demo-prosjekt.

## Utvikling

Utviklet som en komplett frontend-demo for å demonstrere moderne React/Next.js-praksis,
tilgjengelighet, og brukeropplevelse uten avhengighet av backend-tjenester.
