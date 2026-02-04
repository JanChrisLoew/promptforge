# Technical Specification

## 1. Tech Stack

- **Runtime:** Node.js >=18.0.0
- **Language:** TypeScript 5.x (Strict Mode)
- **Bundler:** Vite 6.x
- **UI Framework:** React 19+
- **Styling:** Tailwind CSS 3.x
- **Icons:** Lucide React
- **Persistence:** `window.localStorage`
- **Utilities:** `uuid` for ID generation

## 2. Architecture & File Structure

```text
/
├── .agents/             # Consolidated Documentation
├── components/          # React Presentation Components
│   ├── MainWorkspace.tsx# High-level layout orchestrator
│   ├── PromptList.tsx   # Sidebar navigation and filtering
│   ├── PromptEditor.tsx # Main editing area + Version History
│   ├── Dashboard.tsx    # Statistics and home view
│   └── ...              # UI helper components
├── hooks/               # Business Logic
│   └── usePromptLibrary.ts # CRUD logic, LocalStorage sync
├── types.ts             # Global TypeScript Interfaces
├── App.tsx              # Root Controller & Auth simulation
└── utils/               # Sanitization, Formatting, Migration
```

### Data Flow

1. **Source of Truth:** `usePromptLibrary` hook maintains `prompts` state.
2. **Persistence:** State changes trigger writes to `localStorage`.
3. **Communication:** `App.tsx` manages Auth and global modals; `MainWorkspace` delegates to Editor/Dashboard.

## 3. Data Models

### Prompt (Root Entity)

```typescript
interface Prompt {
  id: string;               // UUID v4
  title: string;            // Unique user-defined title
  description: string;      
  category: string;         // Group (e.g., "Coding")
  systemInstruction: string;
  userPrompt: string;       
  tags: string[];           
  lastUpdated: string;      
  versions: PromptVersion[];
}
```

### PromptVersion

```typescript
interface PromptVersion {
  id: string;
  timestamp: string;
  systemInstruction: string;
  userPrompt: string;
  note?: string;            // Snapshot "Commit message"
}
```

## 4. Cloud Readiness

- **DB-Agnostic:** `usePromptLibrary` abstracts storage details.
- **Async-First:** Storage actions are ready for remote DB latency.
- **UUIDs:** Global uniqueness prevents sync collisions.
