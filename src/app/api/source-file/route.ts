import { BlobClient, StorageSharedKeyCredential } from "@azure/storage-blob";

export const runtime = "nodejs";

type DownloadMode = "inline" | "attachment";

function getDownloadMode(value: string | null): DownloadMode {
  return value === "download" ? "attachment" : "inline";
}

function isBlobStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".blob.core.windows.net");
  } catch {
    return false;
  }
}

function getFileNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const lastPart = parsed.pathname.split("/").filter(Boolean).pop();
    return lastPart ? decodeURIComponent(lastPart) : "source.pdf";
  } catch {
    return "source.pdf";
  }
}

async function streamPublicUrl(url: string) {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });

  return response;
}

async function streamPrivateBlobWithKey(url: string) {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (!accountName || !accountKey) {
    return null;
  }

  const parsed = new URL(url);
  if (!parsed.hostname.toLowerCase().startsWith(`${accountName.toLowerCase()}.`)) {
    return null;
  }

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const blobClient = new BlobClient(url, credential);
  const download = await blobClient.download();

  return {
    contentType: download.contentType ?? "application/pdf",
    stream: download.readableStreamBody,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceUrl = searchParams.get("url");
  const mode = getDownloadMode(searchParams.get("mode"));

  if (!sourceUrl || !isBlobStorageUrl(sourceUrl)) {
    return new Response(
      JSON.stringify({ error: "Ugyldig eller manglende blob-url." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const fileName = getFileNameFromUrl(sourceUrl);

  try {
    const publicResponse = await streamPublicUrl(sourceUrl);

    if (publicResponse.ok && publicResponse.body) {
      return new Response(publicResponse.body, {
        status: 200,
        headers: {
          "Content-Type": publicResponse.headers.get("content-type") ?? "application/pdf",
          "Content-Disposition": `${mode}; filename*=UTF-8''${encodeURIComponent(fileName)}`,
          "Cache-Control": "private, max-age=300",
        },
      });
    }

    const privateBlob = await streamPrivateBlobWithKey(sourceUrl);
    if (privateBlob?.stream) {
      return new Response(privateBlob.stream as never, {
        status: 200,
        headers: {
          "Content-Type": privateBlob.contentType,
          "Content-Disposition": `${mode}; filename*=UTF-8''${encodeURIComponent(fileName)}`,
          "Cache-Control": "private, max-age=300",
        },
      });
    }

    return new Response(
      JSON.stringify({
        error:
          "Filen er ikke offentlig tilgjengelig. Sett AZURE_STORAGE_ACCOUNT_NAME og AZURE_STORAGE_ACCOUNT_KEY for server-side tilgang.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ukjent feil ved filhenting";

    return new Response(
      JSON.stringify({ error: "Kunne ikke hente filen", details: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
