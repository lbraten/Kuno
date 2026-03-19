import { NextResponse } from "next/server";

type Citation = {
  id: string;
  title: string;
  organization?: string;
  year?: number;
  docType?: string;
  chunkId?: string;
  score?: number;
};

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

function getFoundryConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";
  const agentId = process.env.AZURE_AI_AGENT_ID;
  const agentApiVersion =
    process.env.AZURE_AI_AGENT_API_VERSION ?? "2024-05-01-preview";
  const requireGroundedOnly =
    (process.env.KUNO_REQUIRE_GROUNDED_ONLY ?? "true").toLowerCase() ===
    "true";

  return {
    endpoint,
    apiKey,
    deployment,
    apiVersion,
    agentId,
    agentApiVersion,
    requireGroundedOnly,
    configured: Boolean(endpoint && apiKey && (deployment || agentId)),
  };
}

function createBlockedResponse() {
  return {
    content:
      "Jeg kan ikke svare på dette uten dokumenterte kilder i kunnskapsgrunnlaget. Prøv et mer avgrenset spørsmål eller legg til relevante dokumenter i Agent-oppsettet.",
    uncertainty: "high" as const,
    citations: [] as Citation[],
    answerBasis: "blocked" as const,
  };
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
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
}) {
  const { endpoint, apiKey, deployment, apiVersion, history, message } = params;
  const cleanEndpoint = endpoint.replace(/\/$/, "");
  const url = `${cleanEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

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

export async function GET() {
  const { configured } = getFoundryConfig();
  return NextResponse.json({ foundryConfigured: configured });
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

    const {
      endpoint,
      apiKey,
      deployment,
      apiVersion,
      agentId,
      agentApiVersion,
      requireGroundedOnly,
      configured,
    } =
      getFoundryConfig();

    if (!configured || !endpoint || !apiKey) {
      return NextResponse.json(
        {
          error:
            "Manglende Foundry-konfigurasjon. Sett AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY og minst en av AZURE_OPENAI_DEPLOYMENT eller AZURE_AI_AGENT_ID i .env.local",
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

    let agentError: string | null = null;

    if (agentId) {
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
          return NextResponse.json(createBlockedResponse());
        }

        return NextResponse.json(agentResult);
      } catch (error) {
        agentError =
          error instanceof Error
            ? error.message
            : "Ukjent feil ved Agent-kall";

        // Fallback to deployment chat if Agent API is unavailable or misconfigured.
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
      history,
      message: userMessage,
    });

    if (requireGroundedOnly && completionResult.citations.length === 0) {
      return NextResponse.json(createBlockedResponse());
    }

    return NextResponse.json(completionResult);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ukjent runtime-feil";

    return NextResponse.json(
      {
        error: "Uventet feil ved kall mot Foundry",
        details: message,
      },
      { status: 500 }
    );
  }
}