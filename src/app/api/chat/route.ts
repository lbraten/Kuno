import { NextResponse } from "next/server";

type Citation = {
  id: string;
  title: string;
  url?: string;
  organization?: string;
  year?: number;
  docType?: string;
  chunkId?: string;
  score?: number;
};

const INTERNAL_URL_HOST_PATTERNS = [
  ".search.windows.net",
  ".services.ai.azure.com",
  ".openai.azure.com",
  ".cognitiveservices.azure.com",
];

type AnswerBasis = "grounded" | "general" | "blocked";

type ChatRequestBody = {
  message?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

type Uncertainty = "low" | "medium" | "high";

type FilterDetail = {
  filtered?: boolean;
  severity?: string;
};

type ContentFilterResults = Record<string, FilterDetail | undefined>;

type SearchMetadataConfig = {
  endpoint: string;
  apiKey: string;
  indexName: string;
  apiVersion: string;
  idField: string;
  fileNameField: string;
  urlField: string;
};

function getUncertaintyFromFilters(filters?: ContentFilterResults): Uncertainty {
  if (!filters) return "low";

  let hasNonSafeSeverity = false;

  for (const value of Object.values(filters)) {
    if (!value) continue;
    if (value.filtered) return "high";

    const severity = value.severity?.toLowerCase();
    if (severity && severity !== "safe") {
      hasNonSafeSeverity = true;
    }
  }

  return hasNonSafeSeverity ? "medium" : "low";
}

const DEFAULT_SYSTEM_PROMPT =
  "Du er Kuno, en hjelpsom assistent for skole- og utdanningssporsmal i Norge. Svar kort, strukturert og pa norsk bokmal.";

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Ukjent feil";
}

function isOboAuthMismatchError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("obo auth") &&
    normalized.includes("api key authentication")
  );
}

function logChatEvent(
  level: "info" | "warn" | "error",
  event: string,
  details: Record<string, unknown>
) {
  const serialized = JSON.stringify(details);
  if (level === "warn") {
    console.warn(`[api/chat] ${event} ${serialized}`);
    return;
  }

  if (level === "error") {
    console.error(`[api/chat] ${event} ${serialized}`);
    return;
  }

  console.info(`[api/chat] ${event} ${serialized}`);
}

type EndpointMode = "openai-resource" | "project";

function detectEndpointMode(endpoint: string): EndpointMode {
  return endpoint.includes("/api/projects/") ? "project" : "openai-resource";
}

function getFoundryConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";
  const agentId = process.env.AZURE_AI_AGENT_ID;
  const agentApiVersion =
    process.env.AZURE_AI_AGENT_API_VERSION ?? "2024-05-01-preview";
  const projectAgentApiVersion =
    process.env.AZURE_AI_PROJECT_API_VERSION ?? "v1";
  const projectAgentName = process.env.AZURE_AI_PROJECT_AGENT_NAME;
  const projectAgentVersion = process.env.AZURE_AI_PROJECT_AGENT_VERSION;
  const allowTextUrlCitationFallback =
    (process.env.KUNO_ALLOW_TEXT_URL_CITATION_FALLBACK ?? "false").toLowerCase() ===
    "true";
  const includeDebugDetails =
    (process.env.KUNO_INCLUDE_DEBUG_DETAILS ?? "true").toLowerCase() ===
    "true";
  const strictProjectToolAuth =
    (process.env.KUNO_STRICT_PROJECT_TOOL_AUTH ?? "false").toLowerCase() ===
    "true";
  const searchMetadataEndpoint = process.env.AZURE_AI_SEARCH_ENDPOINT;
  const searchMetadataApiKey = process.env.AZURE_AI_SEARCH_API_KEY;
  const searchMetadataIndexName = process.env.AZURE_AI_SEARCH_INDEX_NAME;
  const searchMetadataApiVersion =
    process.env.AZURE_AI_SEARCH_API_VERSION ?? "2024-07-01";
  const searchMetadataIdField =
    process.env.AZURE_AI_SEARCH_ID_FIELD ?? "id";
  const searchMetadataFileNameField =
    process.env.AZURE_AI_SEARCH_FILENAME_FIELD ?? "metadata_storage_name";
  const searchMetadataUrlField =
    process.env.AZURE_AI_SEARCH_URL_FIELD ?? "metadata_storage_path";
  const requireGroundedOnly =
    (process.env.KUNO_REQUIRE_GROUNDED_ONLY ?? "true").toLowerCase() ===
    "true";

  const mode = endpoint ? detectEndpointMode(endpoint) : null;

  return {
    endpoint,
    apiKey,
    deployment,
    apiVersion,
    agentId,
    agentApiVersion,
    projectAgentApiVersion,
    projectAgentName,
    projectAgentVersion,
    allowTextUrlCitationFallback,
    includeDebugDetails,
    searchMetadataEndpoint,
    searchMetadataApiKey,
    searchMetadataIndexName,
    searchMetadataApiVersion,
    searchMetadataIdField,
    searchMetadataFileNameField,
    searchMetadataUrlField,
    mode,
    requireGroundedOnly,
    strictProjectToolAuth,
    configured: Boolean(
      endpoint && apiKey && (deployment || agentId || projectAgentName)
    ),
  };
}

function createBlockedResponse(debug?: Record<string, unknown>) {
  const response = {
    content:
      "Jeg kan ikke svare på dette uten dokumenterte kilder i kunnskapsgrunnlaget. Prøv et mer avgrenset spørsmål eller legg til relevante dokumenter i Agent-oppsettet.",
    uncertainty: "high" as const,
    citations: [] as Citation[],
    answerBasis: "blocked" as const,
  };

  if (debug && Object.keys(debug).length > 0) {
    return { ...response, debug };
  }

  return response;
}

function buildHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "api-key": apiKey,
    "OpenAI-Beta": "assistants=v2",
  };
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

async function extractAgentCitations(
  endpoint: string,
  apiKey: string,
  agentApiVersion: string,
  annotations: Array<{
    type?: string;
    file_citation?: { file_id?: string; quote?: string };
  }>
): Promise<Citation[]> {
  const fileIds = Array.from(
    new Set(
      annotations
        .map((annotation) => annotation.file_citation?.file_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  if (fileIds.length === 0) return [];

  const cleanEndpoint = endpoint.replace(/\/$/, "");
  const fileInfoPairs = await Promise.all(
    fileIds.map(async (fileId) => {
      try {
        const fileData = await fetchJson<{ filename?: string }>(
          `${cleanEndpoint}/openai/files/${fileId}?api-version=${agentApiVersion}`,
          {
            method: "GET",
            headers: buildHeaders(apiKey),
          }
        );

        return [fileId, fileData.filename ?? fileId] as const;
      } catch {
        return [fileId, fileId] as const;
      }
    })
  );

  const titleByFileId = new Map<string, string>(fileInfoPairs);

  return fileIds.map((fileId, index) => ({
    id: `src-${index + 1}`,
    title: titleByFileId.get(fileId) ?? fileId,
    docType: "Agent file",
    chunkId: fileId,
  }));
}

async function runAgentConversation(params: {
  endpoint: string;
  apiKey: string;
  agentId: string;
  agentApiVersion: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
}) {
  const {
    endpoint,
    apiKey,
    agentId,
    agentApiVersion,
    history,
    message,
  } = params;
  const cleanEndpoint = endpoint.replace(/\/$/, "");

  const thread = await fetchJson<{ id: string }>(
    `${cleanEndpoint}/openai/threads?api-version=${agentApiVersion}`,
    {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({}),
    }
  );

  const additionalMessages = [
    ...history.map((item) => ({ role: item.role, content: item.content })),
    { role: "user" as const, content: message },
  ];

  const run = await fetchJson<{ id: string; status?: string }>(
    `${cleanEndpoint}/openai/threads/${thread.id}/runs?api-version=${agentApiVersion}`,
    {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        assistant_id: agentId,
        additional_messages: additionalMessages,
      }),
    }
  );

  const terminalStatuses = new Set([
    "completed",
    "failed",
    "cancelled",
    "expired",
  ]);

  let runStatus = run.status ?? "queued";
  for (let i = 0; i < 30 && !terminalStatuses.has(runStatus); i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const polledRun = await fetchJson<{ status?: string }>(
      `${cleanEndpoint}/openai/threads/${thread.id}/runs/${run.id}?api-version=${agentApiVersion}`,
      {
        method: "GET",
        headers: buildHeaders(apiKey),
      }
    );

    runStatus = polledRun.status ?? "queued";
  }

  if (runStatus !== "completed") {
    throw new Error(`Agent run stoppet med status: ${runStatus}`);
  }

  const messagesPayload = await fetchJson<{
    data?: Array<{
      role?: string;
      content?: Array<{
        type?: string;
        text?: {
          value?: string;
          annotations?: Array<{
            type?: string;
            file_citation?: { file_id?: string; quote?: string };
          }>;
        };
      }>;
    }>;
  }>(
    `${cleanEndpoint}/openai/threads/${thread.id}/messages?api-version=${agentApiVersion}`,
    {
      method: "GET",
      headers: buildHeaders(apiKey),
    }
  );

  const latestAssistantMessage = messagesPayload.data?.find(
    (item) => item.role === "assistant"
  );

  const textSegments = (latestAssistantMessage?.content ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text?.value?.trim() ?? "")
    .filter(Boolean);

  const annotations = (latestAssistantMessage?.content ?? [])
    .flatMap((part) => part.text?.annotations ?? [])
    .filter(Boolean);

  const citations = await extractAgentCitations(
    endpoint,
    apiKey,
    agentApiVersion,
    annotations
  );

  return {
    content:
      textSegments.join("\n\n") || "Jeg fikk ikke et gyldig svar fra agenten.",
    uncertainty: "low" as const,
    citations,
    answerBasis: (citations.length > 0 ? "grounded" : "general") as AnswerBasis,
  };
}

async function runDeploymentChat(params: {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
  mode: EndpointMode;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
}) {
  const { endpoint, apiKey, deployment, apiVersion, mode, history, message } =
    params;
  const cleanEndpoint = endpoint.replace(/\/$/, "");
  const url =
    mode === "project"
      ? `${cleanEndpoint}/openai/v1/chat/completions`
      : `${cleanEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const messages = [
    { role: "system", content: DEFAULT_SYSTEM_PROMPT },
    ...history,
    { role: "user", content: message },
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      ...(mode === "project" ? { model: deployment } : {}),
      messages,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Foundry-kall feilet: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: { content?: string };
      content_filter_results?: ContentFilterResults;
    }>;
  };

  return {
    content:
      data.choices?.[0]?.message?.content?.trim() ||
      "Jeg fikk ikke et gyldig svar fra modellen.",
    uncertainty: getUncertaintyFromFilters(
      data.choices?.[0]?.content_filter_results
    ),
    citations: [] as Citation[],
    answerBasis: "general" as const,
  };
}

function buildProjectInput(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  message: string
) {
  const policy =
    "Instruks: Bruk kun prosjektets kunnskapsgrunnlag. Ikke bruk nettsok eller internettkilder. Hvis du mangler kildegrunnlag, svar at du mangler dokumenterte kilder.";
  const turns = [...history, { role: "user" as const, content: message }];

  const conversation = turns
    .map((turn) => `${turn.role === "assistant" ? "Assistent" : "Bruker"}: ${turn.content}`)
    .join("\n\n");

  return `${policy}\n\n${conversation}`;
}

type UrlCandidate = {
  title: string;
  url: string;
};

function extractUrlCandidatesFromText(text: string): UrlCandidate[] {
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi;
  const rawUrlRegex = /https?:\/\/[^\s)\]]+/gi;

  const seen = new Set<string>();
  const candidates: UrlCandidate[] = [];

  let markdownMatch: RegExpExecArray | null;
  while ((markdownMatch = markdownLinkRegex.exec(text)) !== null) {
    const title = markdownMatch[1]?.trim();
    const url = markdownMatch[2]?.trim();
    if (!url || seen.has(url)) continue;

    seen.add(url);
    candidates.push({
      title: title || url,
      url,
    });
  }

  let rawMatch: RegExpExecArray | null;
  while ((rawMatch = rawUrlRegex.exec(text)) !== null) {
    const url = rawMatch[0]?.trim();
    if (!url || seen.has(url)) continue;

    seen.add(url);
    candidates.push({
      title: url,
      url,
    });
  }

  return candidates;
}

async function isReachableUrl(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    if (head.ok) return true;

    if (head.status === 403 || head.status === 405) {
      const getProbe = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      });

      return getProbe.ok;
    }

    return false;
  } catch {
    return false;
  }
}

async function buildVerifiedUrlCitations(text: string): Promise<Citation[]> {
  const candidates = extractUrlCandidatesFromText(text).slice(0, 8);
  if (candidates.length === 0) return [];

  const checks = await Promise.all(
    candidates.map(async (candidate) => ({
      candidate,
      reachable: await isReachableUrl(candidate.url),
    }))
  );

  const reachable = checks.filter((entry) => entry.reachable);

  return reachable.map((entry, index) => ({
    id: `src-${index + 1}`,
    title: entry.candidate.title,
    url: entry.candidate.url,
    docType: entry.candidate.url.toLowerCase().includes(".pdf")
      ? "PDF"
      : "URL",
    chunkId: entry.candidate.url,
  }));
}

function isUsablePublicSourceUrl(url?: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    return !INTERNAL_URL_HOST_PATTERNS.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}

  function isBlobStorageUrl(url?: string): boolean {
    if (!url) return false;

    try {
      const parsed = new URL(url);
      return parsed.hostname.toLowerCase().endsWith(".blob.core.windows.net");
    } catch {
      return false;
    }
  }

function titleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const lastPart = parsed.pathname.split("/").filter(Boolean).pop();
    if (!lastPart) return url;

    return decodeURIComponent(lastPart);
  } catch {
    return url;
  }
}

function normalizeCitationTitle(title: string | undefined, fallbackUrl?: string): string {
  const trimmed = title?.trim();
  const isGenericDocTitle = Boolean(trimmed && /^doc_\d+$/i.test(trimmed));

  if (!trimmed || isGenericDocTitle) {
    if (fallbackUrl) return titleFromUrl(fallbackUrl);
    return trimmed || "Kilde";
  }

  return trimmed;
}

function stripInlineSourcePlaceholders(text: string): string {
  // Removes tokens like 【4:1†source】 that are not user-meaningful without mapped citations.
  return text
    .replace(/【\d+:\d+†source】/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function searchMetadataLookup(params: {
  config: SearchMetadataConfig;
  query: string;
  top?: number;
}) {
  const { config, query, top = 5 } = params;
  const cleanEndpoint = config.endpoint.replace(/\/$/, "");
  const url = `${cleanEndpoint}/indexes/${encodeURIComponent(
    config.indexName
  )}/docs/search?api-version=${config.apiVersion}`;

  const requestBody = {
    search: query,
    top,
    select: [config.idField, config.fileNameField, config.urlField].join(","),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": config.apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    const payload = (await response.json()) as {
      value?: Array<Record<string, unknown>>;
    };

    return payload.value ?? [];
  }

  const errorText = await response.text();
  const invalidSelectFieldError =
    response.status === 400 && errorText.includes("$select");

  if (!invalidSelectFieldError) {
    throw new Error(errorText || `Search metadata lookup failed (${response.status})`);
  }

  // Retry without select when configured field names don't exist in this index.
  const fallbackResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": config.apiKey,
    },
    body: JSON.stringify({
      search: query,
      top,
    }),
  });

  if (!fallbackResponse.ok) {
    const fallbackErrorText = await fallbackResponse.text();
    throw new Error(
      fallbackErrorText || `Search metadata lookup fallback failed (${fallbackResponse.status})`
    );
  }

  const fallbackPayload = (await fallbackResponse.json()) as {
    value?: Array<Record<string, unknown>>;
  };

  return fallbackPayload.value ?? [];
}

function readFirstStringField(
  hit: Record<string, unknown>,
  candidates: string[]
): string | null {
  for (const field of candidates) {
    const value = hit[field];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

async function resolveCitationsFromSearchMetadata(params: {
  annotations: Array<{
    type?: string;
    file_id?: string;
    title?: string;
    url?: string;
  }>;
  userMessage: string;
  config: SearchMetadataConfig;
}) {
  const { annotations, userMessage, config } = params;

  const terms = new Set<string>();

  terms.add(userMessage.trim());
  for (const annotation of annotations) {
    const title = annotation.title?.trim();
    const isGenericDocTitle = Boolean(title && /^doc_\d+$/i.test(title));
    if (title && !isGenericDocTitle) {
      terms.add(title);
    }

    if (annotation.file_id?.trim()) {
      terms.add(annotation.file_id.trim());
    }
  }

  const searchTerms = Array.from(terms).filter(Boolean).slice(0, 5);
  const citationByUrl = new Map<string, Citation>();
  let inaccessibleUrlCount = 0;

  for (const term of searchTerms) {
    try {
      const hits = await searchMetadataLookup({
        config,
        query: term,
        top: 5,
      });

      for (const hit of hits) {
        const url =
          readFirstStringField(hit, [
            config.urlField,
            "metadata_storage_path",
            "url",
            "source",
            "document_url",
            "filepath",
          ]) ?? "";
        if (!url || !isUsablePublicSourceUrl(url)) continue;

        const fileName =
          readFirstStringField(hit, [
            config.fileNameField,
            "metadata_storage_name",
            "file_name",
            "filename",
            "title",
            "name",
          ]) ?? titleFromUrl(url);

        if (citationByUrl.has(url)) continue;

        const isPubliclyReachable = await isReachableUrl(url);
          const keepViaProxy = isBlobStorageUrl(url);
        if (!isPubliclyReachable) {
          inaccessibleUrlCount += 1;
        }

        citationByUrl.set(url, {
          id: `src-${citationByUrl.size + 1}`,
          title: fileName,
            url: isPubliclyReachable || keepViaProxy ? url : undefined,
          docType: url.toLowerCase().includes(".pdf")
            ? isPubliclyReachable
              ? "PDF"
                : keepViaProxy
                  ? "PDF (via app)"
                  : "PDF (ikke offentlig)"
            : isPubliclyReachable
              ? "URL"
                : keepViaProxy
                  ? "URL (via app)"
                  : "URL (ikke offentlig)",
          chunkId: url,
        });
      }
    } catch (error) {
      logChatEvent("warn", "search_metadata.lookup_failed", {
        query: term,
        error: toErrorMessage(error),
      });
    }

    if (citationByUrl.size >= 5) break;
  }

  if (inaccessibleUrlCount > 0) {
    logChatEvent("warn", "search_metadata.urls_not_public", {
      inaccessibleUrlCount,
    });
  }

  return Array.from(citationByUrl.values()).slice(0, 5);
}

async function runProjectAgentConversation(params: {
  endpoint: string;
  apiKey: string;
  agentName: string;
  agentVersion?: string;
  allowTextUrlCitationFallback: boolean;
  searchMetadataConfig: SearchMetadataConfig | null;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
}) {
  const {
    endpoint,
    apiKey,
    agentName,
    agentVersion,
    allowTextUrlCitationFallback,
    searchMetadataConfig,
    history,
    message,
  } = params;
  const cleanEndpoint = endpoint.replace(/\/$/, "");

  const response = await fetch(`${cleanEndpoint}/openai/v1/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      input: buildProjectInput(history, message),
      agent_reference: {
        type: "agent_reference",
        name: agentName,
        ...(agentVersion ? { version: agentVersion } : {}),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    output?: Array<{
      type?: string;
      content?: Array<{
        type?: string;
        text?: string;
        annotations?: Array<{
          type?: string;
          file_id?: string;
          title?: string;
          url?: string;
        }>;
      }>;
    }>;
  };

  const outputTexts = (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text?.trim() ?? "")
    .filter(Boolean);

  const annotations = (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .flatMap((item) => item.annotations ?? [])
    .filter(Boolean);

  const annotationCitations = annotations.map((annotation, index) => ({
    id: `src-${index + 1}`,
    title: normalizeCitationTitle(
      annotation.title,
      annotation.url ?? annotation.file_id
    ),
    url: annotation.url,
    docType: annotation.type ?? "Agent reference",
    chunkId: annotation.url ?? annotation.file_id,
  }));

  const usableAnnotationCitations = annotationCitations.filter((citation) =>
    isUsablePublicSourceUrl(citation.url ?? citation.chunkId)
  );

  const rawContentText =
    outputTexts.join("\n\n") ||
    "Jeg fikk ikke et gyldig svar fra prosjektagenten.";

  const contentText = stripInlineSourcePlaceholders(rawContentText);

  const verifiedUrlCitations =
    allowTextUrlCitationFallback && usableAnnotationCitations.length === 0
      ? await buildVerifiedUrlCitations(contentText)
      : [];

  const searchMetadataCitations =
    usableAnnotationCitations.length === 0 && searchMetadataConfig
      ? await resolveCitationsFromSearchMetadata({
          annotations,
          userMessage: message,
          config: searchMetadataConfig,
        })
      : [];

  const citationsWithFallback =
    usableAnnotationCitations.length > 0
      ? usableAnnotationCitations
      : searchMetadataCitations.length > 0
        ? searchMetadataCitations
        : verifiedUrlCitations;

  const filteredAnnotationCitationCount =
    annotationCitations.length - usableAnnotationCitations.length;

  if (filteredAnnotationCitationCount > 0) {
    logChatEvent("warn", "project.annotation_citations_filtered", {
      agentName,
      annotationCitations: annotationCitations.length,
      usableAnnotationCitations: usableAnnotationCitations.length,
      filteredAnnotationCitationCount,
    });
  }

  return {
    content: contentText,
    uncertainty: "low" as const,
    citations: citationsWithFallback,
    answerBasis: (citationsWithFallback.length > 0
      ? "grounded"
      : "general") as AnswerBasis,
    diagnostics: {
      mode: "project",
      agentName,
      agentVersion: agentVersion ?? null,
      annotations: annotations.length,
      annotationCitations: annotationCitations.length,
      usableAnnotationCitations: usableAnnotationCitations.length,
      filteredAnnotationCitationCount,
      searchMetadataCitations: searchMetadataCitations.length,
      verifiedUrlCitations: verifiedUrlCitations.length,
      fallbackEnabled: allowTextUrlCitationFallback,
      searchMetadataConfigured: Boolean(searchMetadataConfig),
    },
  };
}

async function listProjectAgents(params: {
  endpoint: string;
  apiKey: string;
  projectAgentApiVersion: string;
}) {
  const { endpoint, apiKey, projectAgentApiVersion } = params;
  const cleanEndpoint = endpoint.replace(/\/$/, "");

  const payload = await fetchJson<{
    data?: Array<{ id?: string; name?: string }>;
  }>(`${cleanEndpoint}/agents?api-version=${projectAgentApiVersion}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
  });

  return (payload.data ?? []).map((agent) => ({
    id: agent.id ?? "",
    name: agent.name ?? agent.id ?? "",
  }));
}

export async function GET() {
  const {
    configured,
    endpoint,
    apiKey,
    mode,
    projectAgentApiVersion,
    projectAgentName,
  } = getFoundryConfig();

  if (!configured || !endpoint || !apiKey) {
    return NextResponse.json({ foundryConfigured: false });
  }

  if (mode !== "project") {
    return NextResponse.json({
      foundryConfigured: true,
      mode,
      projectAgents: [],
      projectAgentName,
    });
  }

  try {
    const projectAgents = await listProjectAgents({
      endpoint,
      apiKey,
      projectAgentApiVersion,
    });

    return NextResponse.json({
      foundryConfigured: true,
      mode,
      projectAgents,
      projectAgentName,
    });
  } catch {
    return NextResponse.json({
      foundryConfigured: true,
      mode,
      projectAgents: [],
      projectAgentName,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return NextResponse.json(
        { error: "message er paakrevd" },
        { status: 400 }
      );
    }

    const foundryConfig = getFoundryConfig();

    const {
      endpoint,
      apiKey,
      deployment,
      apiVersion,
      agentId,
      agentApiVersion,
      projectAgentApiVersion,
      projectAgentName,
      projectAgentVersion,
      allowTextUrlCitationFallback,
      includeDebugDetails,
      mode,
      requireGroundedOnly,
      strictProjectToolAuth,
      configured,
    } = foundryConfig;

    const searchMetadataConfig = getSearchMetadataConfig(foundryConfig);

    if (!configured || !endpoint || !apiKey) {
      return NextResponse.json(
        {
          error:
            "Manglende Foundry-konfigurasjon. Sett AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY og minst en av AZURE_OPENAI_DEPLOYMENT, AZURE_AI_AGENT_ID eller AZURE_AI_PROJECT_AGENT_NAME i .env.local",
        },
        { status: 500 }
      );
    }

    const history = (body.history ?? [])
      .filter(
        (item): item is { role: "user" | "assistant"; content: string } =>
          Boolean(item?.role && item?.content)
      )
      .slice(-8);

    logChatEvent("info", "request.received", {
      mode,
      deployment,
      projectAgentName,
      projectAgentVersion,
      requireGroundedOnly,
      strictProjectToolAuth,
      allowTextUrlCitationFallback,
      historyCount: history.length,
      messageLength: userMessage.length,
    });

    let agentError: string | null = null;

    if (mode === "project" && projectAgentName) {
      try {
        const projectAgentResult = await runProjectAgentConversation({
          endpoint,
          apiKey,
          agentName: projectAgentName,
          agentVersion: projectAgentVersion,
          allowTextUrlCitationFallback,
          searchMetadataConfig,
          history,
          message: userMessage,
        });

        logChatEvent("info", "project.response", {
          answerBasis: projectAgentResult.answerBasis,
          citationCount: projectAgentResult.citations.length,
          diagnostics: projectAgentResult.diagnostics,
        });

        if (requireGroundedOnly && projectAgentResult.citations.length === 0) {
          const debug = {
            reason: "grounded_only_no_citations",
            mode,
            projectAgentName,
            diagnostics: projectAgentResult.diagnostics,
          };

          logChatEvent("warn", "response.blocked", debug);

          return NextResponse.json(
            createBlockedResponse(includeDebugDetails ? debug : undefined)
          );
        }

        return NextResponse.json(projectAgentResult);
      } catch (error) {
        agentError = toErrorMessage(error);

        logChatEvent("error", "project.call_failed", {
          mode,
          projectAgentName,
          error: agentError,
        });

        if (isOboAuthMismatchError(agentError) && strictProjectToolAuth) {
          return NextResponse.json(
            {
              error:
                "Project Agent-feil: verktøyet bruker OBO-auth, men appen kaller med API-key. Bytt verktoy/auth i Foundry-agenten eller bruk Entra/OBO i appen.",
              details: agentError,
              ...(includeDebugDetails
                ? {
                    debug: {
                      reason: "project_call_failed_obo_auth_mismatch",
                      mode,
                      projectAgentName,
                    },
                  }
                : {}),
            },
            { status: 502 }
          );
        }

        if (isOboAuthMismatchError(agentError) && !strictProjectToolAuth) {
          logChatEvent("warn", "project.call_failed_obo_auth_mismatch", {
            mode,
            projectAgentName,
            strictProjectToolAuth,
            fallback: "deployment",
          });
        }
      }

      if (requireGroundedOnly && agentError) {
        let hints: Array<{ id: string; name: string }> = [];

        try {
          hints = await listProjectAgents({
            endpoint,
            apiKey,
            projectAgentApiVersion,
          });
        } catch {
          // Keep fallback error response if lookup fails.
        }

        return NextResponse.json(
          {
            error:
              "Project Agent-kall feilet, og grounded-only modus tillater ikke fallback uten kilder.",
            details: agentError,
            availableProjectAgents: hints,
            ...(includeDebugDetails
              ? {
                  debug: {
                    reason: "project_call_failed",
                    mode,
                    projectAgentName,
                  },
                }
              : {}),
          },
          { status: 502 }
        );
      }
    } else if (agentId) {
      try {
        const agentResult = await runAgentConversation({
          endpoint,
          apiKey,
          agentId,
          agentApiVersion,
          history,
          message: userMessage,
        });

        if (requireGroundedOnly && agentResult.citations.length === 0) {
          const debug = {
            reason: "grounded_only_no_citations",
            mode,
            agentId,
            citationCount: agentResult.citations.length,
          };

          logChatEvent("warn", "response.blocked", debug);

          return NextResponse.json(
            createBlockedResponse(includeDebugDetails ? debug : undefined)
          );
        }

        return NextResponse.json(agentResult);
      } catch (error) {
        agentError = toErrorMessage(error);

        logChatEvent("error", "assistant.call_failed", {
          mode,
          agentId,
          error: agentError,
        });

        // Fallback to deployment chat if Agent API is unavailable or misconfigured.
      }

      // In grounded-only mode, failing Agent calls should be explicit.
      // Silent fallback to deployment will always look ungrounded in this app.
      if (requireGroundedOnly && agentError) {
        return NextResponse.json(
          {
            error:
              "Agent-kall feilet, og grounded-only modus tillater ikke fallback uten kilder.",
            details: agentError,
            ...(includeDebugDetails
              ? {
                  debug: {
                    reason: "assistant_call_failed",
                    mode,
                    agentId,
                  },
                }
              : {}),
          },
          { status: 502 }
        );
      }
    }

    if (!deployment) {
      return NextResponse.json(
        {
          error:
            "Agent-kall feilet og AZURE_OPENAI_DEPLOYMENT er ikke satt for fallback.",
          details: agentError,
        },
        { status: 502 }
      );
    }

    const completionResult = await runDeploymentChat({
      endpoint,
      apiKey,
      deployment,
      apiVersion,
      mode: mode ?? "openai-resource",
      history,
      message: userMessage,
    });

    if (requireGroundedOnly && completionResult.citations.length === 0) {
      const debug = {
        reason: "grounded_only_no_citations",
        mode,
        deployment,
        citationCount: completionResult.citations.length,
      };

      logChatEvent("warn", "response.blocked", debug);

      return NextResponse.json(
        createBlockedResponse(includeDebugDetails ? debug : undefined)
      );
    }

    return NextResponse.json(completionResult);
  } catch (error) {
    const message = toErrorMessage(error);

    logChatEvent("error", "request.failed", {
      error: message,
    });

    return NextResponse.json(
      {
        error: "Uventet feil ved kall mot Foundry",
        details: message,
      },
      { status: 500 }
    );
  }
}

function getSearchMetadataConfig(config: ReturnType<typeof getFoundryConfig>): SearchMetadataConfig | null {
  const {
    searchMetadataEndpoint,
    searchMetadataApiKey,
    searchMetadataIndexName,
    searchMetadataApiVersion,
    searchMetadataIdField,
    searchMetadataFileNameField,
    searchMetadataUrlField,
  } = config;

  if (!searchMetadataEndpoint || !searchMetadataApiKey || !searchMetadataIndexName) {
    return null;
  }

  return {
    endpoint: searchMetadataEndpoint,
    apiKey: searchMetadataApiKey,
    indexName: searchMetadataIndexName,
    apiVersion: searchMetadataApiVersion,
    idField: searchMetadataIdField,
    fileNameField: searchMetadataFileNameField,
    urlField: searchMetadataUrlField,
  };
}