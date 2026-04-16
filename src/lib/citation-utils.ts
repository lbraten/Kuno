import { Citation } from "@/types";

const INLINE_CITATION_MARKER_REGEX = /\[(\d+)\](?!\()/g;

export function getCitationSelectionKey(citation: Citation): string {
  const idPart = citation.id ?? "";
  const titlePart = citation.title ?? "";
  const chunkPart = citation.chunkId ?? "";
  const urlPart = citation.url ?? "";

  return [idPart, titlePart, chunkPart, urlPart].join("|");
}

export function formatCitationDisplayNumber(
  citationId: string | undefined,
  fallbackIndex: number
): string {
  const id = citationId?.trim() ?? "";

  const explicitMatch =
    id.match(/^(?:src|cite)-(\d+)$/i) ?? id.match(/^(\d+)$/);
  if (explicitMatch?.[1]) return explicitMatch[1];

  return String(fallbackIndex + 1);
}

export function normalizeInlineCitationSpacing(text: string): string {
  return text.replace(/([^\s([{"'`])\[(\d+)\](?!\()/g, "$1 [$2]");
}

export function stripInlineCitationNumbers(
  text: string,
  validNumbers?: Set<string>
): string {
  const withoutMarkers = text.replace(
    INLINE_CITATION_MARKER_REGEX,
    (match, number) => {
      if (validNumbers && !validNumbers.has(number)) {
        return match;
      }

      return "";
    }
  );

  return withoutMarkers
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function linkifyInlineCitationNumbers(
  text: string,
  validNumbers: Set<string>
): string {
  const withSpacing = normalizeInlineCitationSpacing(text);

  return withSpacing.replace(INLINE_CITATION_MARKER_REGEX, (match, number) => {
    if (!validNumbers.has(number)) return match;
    return `[${number}](#kuno-citation-${number})`;
  });
}
