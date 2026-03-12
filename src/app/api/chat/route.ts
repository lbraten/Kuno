import { NextResponse } from "next/server";

type ChatRequestBody = {
  message?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

const DEFAULT_SYSTEM_PROMPT =
  "Du er Kuno, en hjelpsom assistent for skole- og utdanningssporsmal i Norge. Svar kort, strukturert og pa norsk bokmal.";

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

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";

    if (!endpoint || !apiKey || !deployment) {
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
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content =
      data.choices?.[0]?.message?.content?.trim() ||
      "Jeg fikk ikke et gyldig svar fra modellen.";

    return NextResponse.json({ content });
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