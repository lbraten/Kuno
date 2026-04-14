# Kuno Foundry Instruksjoner

Denne filen samler praktiske instruksjoner for lokal drift av Kuno med Azure AI Foundry, Search metadata og PDF-kilder.

## 1. Nokkelflyt i appen

- Frontend sender chat til `POST /api/chat`.
- `src/app/api/chat/route.ts` kaller Foundry Project Agent (`/openai/v1/responses`).
- Kilder bygges fra:
  - agent-annotations (foretrukket)
  - metadata-oppslag i Azure AI Search (fallback for `doc_x`/interne referanser)
- Blob-PDF lenker i UI gaar via `GET /api/source-file`.

## 2. Miljovariabler som ma settes

Minimum for Foundry-kall:

```dotenv
AZURE_OPENAI_ENDPOINT=https://foundry-kunnskapsassistenten.services.ai.azure.com/api/projects/proj-default
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=leander-front
AZURE_OPENAI_API_VERSION=2024-10-21
AZURE_AI_PROJECT_AGENT_NAME=kuno-new-foundry
AZURE_AI_PROJECT_API_VERSION=v1
```

For metadata-oppslag av kilder:

```dotenv
AZURE_AI_SEARCH_ENDPOINT=https://kubot26.search.windows.net
AZURE_AI_SEARCH_API_KEY=...
AZURE_AI_SEARCH_INDEX_NAME=ka-blobtest-index
AZURE_AI_SEARCH_API_VERSION=2024-05-01-preview
AZURE_AI_SEARCH_ID_FIELD=uid
AZURE_AI_SEARCH_FILENAME_FIELD=metadata_storage_name
AZURE_AI_SEARCH_URL_FIELD=blob_url
```

For private Blob PDF via app-proxy:

```dotenv
AZURE_STORAGE_ACCOUNT_NAME=kubot26
AZURE_STORAGE_ACCOUNT_KEY=...
```

Feature toggles:

```dotenv
KUNO_REQUIRE_GROUNDED_ONLY=false
KUNO_ALLOW_TEXT_URL_CITATION_FALLBACK=false
KUNO_INCLUDE_DEBUG_DETAILS=true
```

## 3. Vanlige feil og arsaker

### Feil: `Tools configured with OBO auth are not supported with API key authentication`

Arsak:
- Valgt agent bruker OBO-tooling, men backend autentiserer med API key.

Tiltak:
- Bruk en API-key kompatibel agent, eller
- bygg token-basert auth (Entra ID) i backend.

### Feil: `answerBasis: general` + `citationCount: 0`

Arsak:
- Agent svarer tekst, men returnerer ikke dokumenterte kilder.

Tiltak:
- Sjekk agent/tool-oppsett i Foundry.
- Sjekk Search metadata vars.
- Sjekk diagnostikkfelt i respons (`searchMetadataCitations`, `annotationCitations`).

### Feil: `Invalid expression ... Could not find a property named 'id'`

Arsak:
- Feil Search-feltnavn i env.

Tiltak:
- Bruk feltene fra indexen (for dette prosjektet: `uid`, `metadata_storage_name`, `blob_url`).

### Feil ved apning av PDF: `PublicAccessNotPermitted`

Arsak:
- Blob er privat.

Tiltak:
- Sett `AZURE_STORAGE_ACCOUNT_NAME` og `AZURE_STORAGE_ACCOUNT_KEY`.
- Aapne via `/api/source-file` (UI gjor dette automatisk for blob-lenker).

## 4. Hurtigsjekk etter endringer

1. Restart dev-server:

```bash
npm run dev
```

2. Sjekk konfig:

- `GET /api/chat` skal vise `foundryConfigured: true`.
- `mode` skal vaere `project`.
- `projectAgentName` skal vaere riktig agent.

3. Send testsporsmal i UI.

4. Se serverlogg:

- `request.received`
- `project.response`
- eventuelt `response.blocked` eller `project.call_failed`

## 5. Sikkerhet

- Ikke commit `.env.local`.
- Roter nokler som er eksponert i logger/chat.
- Bruk minst mulig privilegerte nokler der det er mulig.
