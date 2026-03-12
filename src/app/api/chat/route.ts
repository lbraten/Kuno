import { NextResponse } from "next/server";

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

  return {
    endpoint,
    apiKey,
    deployment,
    apiVersion,
    configured: Boolean(endpoint && apiKey && deployment),
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

    const { endpoint, apiKey, deployment, apiVersion, configured } =
      getFoundryConfig();

    if (!configured || !endpoint || !apiKey || !deployment) {
      return NextResponse.json(
        {
          error:
            "Manglende Foundry-konfigurasjon. Sett AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY og AZURE_OPENAI_DEPLOYMENT i .env.local",
        },
        { status: 500 }
      );
    }

    const cleanEndpoint = endpoint.replace(/\/$/, "");
    const url = `${cleanEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const history = (body.history ?? [])
      .filter(
        (item): item is { role: "user" | "assistant"; content: string } =>
          Boolean(item?.role && item?.content)
      )
      .slice(-8);

    const messages = [
      { role: "system", content: DEFAULT_SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userMessage },
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
      return NextResponse.json(
        { error: `Foundry-kall feilet: ${errorText}` },
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: { content?: string };
        content_filter_results?: ContentFilterResults;
      }>;
    };

    const content =
      data.choices?.[0]?.message?.content?.trim() ||
      "Jeg fikk ikke et gyldig svar fra modellen.";

    const uncertainty = getUncertaintyFromFilters(
      data.choices?.[0]?.content_filter_results
    );

    return NextResponse.json({ content, uncertainty });
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