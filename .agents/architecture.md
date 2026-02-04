# Architecture & File Structure

## Directory Structure
```
/
├── .agents/             # Context for AI Agents
├── components/          # React Presentation Components
│   ├── PromptList.tsx   # Sidebar navigation and filtering
│   └── PromptEditor.tsx # Main editing area + Version History
├── hooks/               # Custom React Hooks (Business Logic)
│   └── usePromptLibrary.ts # CRUD logic, LocalStorage sync, Import/Export
├── services/            # (Deprecated/Empty) - Keeping for future API expansion
├── types.ts             # Global TypeScript Interfaces
├── App.tsx              # Main Layout & Routing (Master-Detail View)
├── index.tsx            # Entry Point
├── index.css            # Global Styles & Tailwind Directives
└── tailwind.config.js   # Design Tokens
```

## Data Flow
1.  **Source of Truth:** The `usePromptLibrary` hook maintains the state of `prompts` and `selectedId`.
2.  **Persistence:** Changes in `prompts` trigger a `useEffect` that writes to `localStorage`.
3.  **Component Communication:**
    - `App.tsx` acts as the controller.
    - It passes the prompt list and actions (select, delete) to `PromptList`.
    - It passes the currently selected prompt and update functions to `PromptEditor`.

## Logic Rules
- **Immutability:** State updates must treat the Prompt objects as immutable.
- **Versioning:** When saving a version, a snapshot of `systemInstruction` and `userPrompt` is pushed to the `versions` array.
- **IDs:** UUID v4 is used for Prompts and Versions.
