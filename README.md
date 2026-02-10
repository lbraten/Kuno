# Kuno - Frontend Demo

En komplett frontend-demo av Kuno chatbot bygget med Next.js, TypeScript og Tailwind CSS.

## 🎯 Formål

Dette er en **ren frontend-demo** designet for å demonstrere UI/UX, interaksjoner, tilgjengelighet og flyt. 
Ingen backend, ingen API-kall, ingen ekte data – alt er mocket og simulert lokalt i klienten.

## 🚀 Kom i gang

### Forutsetninger

- Node.js 18+ 
- npm, pnpm, yarn eller bun

### Installasjon

```bash
# Installer avhengigheter
npm install

# Kjør utviklingsserver
npm run dev

# Bygg for produksjon
npm run build

# Start produksjonsserver
npm start
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Språk**: TypeScript
- **Styling**: Tailwind CSS + CSS-variabler
- **Komponenter**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Markdown**: react-markdown
- **Ikoner**: Lucide React
- **i18n**: next-intl (nb-NO)

## ✨ Funksjoner

### Layout
- **Demo-banner**: Alltid synlig øverst for å indikere at dette er en demo
- **Toppbar**: Logo, søk (⌘K), tema-bryter, innstillinger
- **Venstre sidebar**: Historikk, modus-velger, filtre
- **Hovedområde**: Chat med meldinger, oppfølgingsspørsmål, streaming
- **Høyre panel**: Kilder, tekstutdrag, kvalitetsnotater

### Funksjoner
- ✅ Simulert chat-streaming (ord-for-ord)
- ✅ Mock kilder med relevans-score
- ✅ Usikkerhetsindikatorer (lav/middels/høy)
- ✅ Filtre (virksomhet, år, dokumenttype)
- ✅ Tre modi: Chat, Søk, Avansert
- ✅ Historikk med samtaler
- ✅ Light/Dark/System tema
- ✅ Responsivt design (mobil-først)
- ✅ Kommandopalett (⌘K / Ctrl+K)
- ✅ Tilgjengelighetsfunksjoner (ARIA, keyboard nav)
- ✅ Respekterer prefers-reduced-motion

## 📁 Prosjektstruktur

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

## 🎨 Design System

### Fargepalett
- **Primær**: Blå (#2563EB)
- **Aksent**: Petrol (#1F6B75)
- **Nøytral**: Grå-toner for bakgrunn og tekst

### Typografi
- **Font**: Inter (med system fallback)
- **Skala**: Tailwind standard

### Tema
- Light mode
- Dark mode
- System (følger OS-preferanse)

## 🔍 Nøkkelfunksjoner

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

## 🌍 Internasjonalisering

Prosjektet bruker `next-intl` med norsk bokmål (nb-NO) som standard språk.
Oversettelser finnes i `messages/nb-NO.json`.

## 📱 Responsivt Design

- **Mobil (<768px)**: Sidebars er skuffer som kan åpnes/lukkes
- **Tablet (768px-1024px)**: Sidebar synlig, insight panel kan skjules
- **Desktop (>1024px)**: Full layout med alle paneler synlige

## ⚡ Ytelse

- Server-side rendering med Next.js App Router
- Optimalisert bundle med code splitting
- Lazy loading av komponenter hvor relevant
- Optimaliserte animasjoner

## 🧪 Testing (Valgfritt)

Prosjektet er satt opp for testing med:
- Playwright for e2e-testing
- Vitest/React Testing Library for komponententesting

```bash
# Kjør tester (når implementert)
npm test
```

## 📝 Lisens

Privat demo-prosjekt.

## 👨‍💻 Utvikling

Utviklet som en komplett frontend-demo for å demonstrere moderne React/Next.js-praksis,
tilgjengelighet, og brukeropplevelse uten avhengighet av backend-tjenester.
