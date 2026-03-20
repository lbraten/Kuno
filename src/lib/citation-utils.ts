import { Citation } from "@/types";

export function getCitationSelectionKey(citation: Citation): string {
  const idPart = citation.id ?? "";
  const titlePart = citation.title ?? "";
  const chunkPart = citation.chunkId ?? "";
  const urlPart = citation.url ?? "";

  return [idPart, titlePart, chunkPart, urlPart].join("|");
}
