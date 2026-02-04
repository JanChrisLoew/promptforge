# Data Models

The application relies on the following core data structures defined in `types.ts`.

## 1. Prompt (Root Entity)
Represents a single entry in the library.

```typescript
interface Prompt {
  id: string;               // UUID v4
  title: string;            // User-defined title (must be unique)
  description: string;      // Optional description
  category: string;         // Grouping category (e.g., "Coding", "Writing")
  systemInstruction: string;// The "System" role content
  userPrompt: string;       // The "User" role content or template
  tags: string[];           // Array of string tags for filtering
  lastUpdated: string;      // ISO 8601 Date String
  versions: PromptVersion[];// History of changes
}
```

## 2. PromptVersion (Child Entity)
Represents a snapshot of a prompt at a specific point in time.

```typescript
interface PromptVersion {
  id: string;               // UUID v4
  timestamp: string;        // ISO 8601 Date String
  systemInstruction: string;// Snapshot of system instruction
  userPrompt: string;       // Snapshot of user prompt
  note?: string;            // Optional "Commit message"
}
```

## 3. Library
The collection of all prompts.

```typescript
type PromptLibrary = Prompt[];
```
