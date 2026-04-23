export type Role = "user" | "assistant";

export interface Citation {
  id: string;
  title: string;
  url?: string;
  organization?: string;
  year?: number;
  docType?: string;
  chunkId?: string;
  score?: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  citations?: Citation[];
  uncertainty?: "low" | "medium" | "high";
  answerBasis?: "grounded" | "general" | "blocked";
  source?: "foundry" | "mock";
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export type DataScope =
  | "all"
  | "elevundersokelsen"
  | "laererundersokelser"
  | "skolelederundersokelser"
  | "foreldreundersokelser"
  | "tiltaksevalueringer"
  | "laereplananalyse"
  | "mobbing-og-psykososialt-miljo"
  | "frafalls-og-gjennomforingsstudier"
  | "kompetanseutvikling"
  | "barnehageforskning"
  | "minoritetsperspektiv"
  | "digitalisering-og-teknologi"
  | "spesialundervisning-og-tilpasset-opplaering";

export interface Filter {
  scope: DataScope;
}

export type Mode = "chat" | "retrieve" | "advanced";

export interface RetrieveConfig {
  topK: number;
  minScore: number;
}
