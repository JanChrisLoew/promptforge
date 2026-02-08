export interface PromptVersion {
  id: string;
  timestamp: string;
  systemInstruction: string;
  userPrompt: string;
  note?: string;
  config?: { showSystemInstruction?: boolean };
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string; // Deprecated, migrate to folderPath
  folderPath?: string; // New folder structure (e.g., "/Work/ProjectA")
  metadata?: Record<string, string>; // Structured naming fields
  systemInstruction: string;
  userPrompt: string;
  tags: string[];
  comments?: Comment[]; // Collaboration history
  lastUpdated: string;
  versions: PromptVersion[];
  config?: { showSystemInstruction?: boolean };
}

export type PromptLibrary = Prompt[];

export interface PromptStats {
  totalPrompts: number;
  totalVersions: number;
  uniqueTags: number;
}

// --- Settings & Master Data Types ---

export interface NamingField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: string[]; // For 'select' type
  maxLength?: number;
  defaultValue?: string;
}

export interface NamingSchema {
  enabled: boolean;
  fields: NamingField[];
  separator: string;
  hasFreeTextSuffix: boolean;
  folderNamingType?: 'valueOnly' | 'labelAndValue'; // New setting
}

export interface AppSettings {
  namingSchema: NamingSchema;
  userName: string;
  manualCategories: string[];
}
