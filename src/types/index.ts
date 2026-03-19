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

export interface Filter {
  organizations: string[];
  years: number[];
  docTypes: string[];
}

export type Mode = "chat" | "retrieve" | "advanced";

export interface RetrieveConfig {
  topK: number;
  minScore: number;
}
