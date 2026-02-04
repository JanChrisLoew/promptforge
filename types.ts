export interface PromptVersion {
  id: string;
  timestamp: string;
  systemInstruction: string;
  userPrompt: string;
  note?: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  systemInstruction: string;
  userPrompt: string;
  tags: string[];
  lastUpdated: string;
  versions: PromptVersion[];
}

export type PromptLibrary = Prompt[];

export interface PromptStats {
  totalPrompts: number;
  totalVersions: number;
  uniqueTags: number;
}
