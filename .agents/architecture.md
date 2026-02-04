# Architecture & File Structure

## Directory Structure

```text
/
├── .agents/             # Context for AI Agents
├── components/          # React Presentation Components
│   ├── PromptList.tsx   # Sidebar navigation and filtering
│   ├── PromptEditor.tsx # Main editing area + Version History
│   ├── Dashboard.tsx    # Internal home and statistics
│   ├── LandingPage.tsx  # Guest entry point
│   ├── SiteFooter.tsx   # Global persistent footer
│   ├── InfoOverlay.tsx  # Legal/Info modals (About, Security)
│   └── ConfirmationModal.tsx # Custom themed dialogs
├── hooks/               # Custom React Hooks (Business Logic)
│   └── usePromptLibrary.ts # CRUD logic, LocalStorage sync, Import/Export
├── services/            # (Deprecated/Empty) - Keeping for future API expansion
├── types.ts             # Global TypeScript Interfaces
├── App.tsx              # Root Controller, Auth simulation, and Global UI state
├── index.tsx            # Entry Point
├── index.css            # Global Styles & Tailwind Directives
└── tailwind.config.js   # Design Tokens
```

## Data Flow

1. **Source of Truth:** The `usePromptLibrary` hook maintains the state of `prompts` and `selectedId`.
2. **Persistence:** Changes in `prompts` trigger a `useEffect` that writes to `localStorage`.
3. **Component Communication:**
    - `App.tsx` acts as the root controller.
    - It manages **Authentication State** and **Global Modals** (Confirmation/Info).
    - It conditionally renders the `LandingPage` or the main workspace (`PromptList` + `Dashboard`/`Editor`).
    - The `SiteFooter` remains persistent across all application states.

## Logic Rules

- **Immutability:** State updates must treat the Prompt objects as immutable.
- **Versioning:** When saving a version, a snapshot of `systemInstruction` and `userPrompt` is pushed to the `versions` array.
- **IDs:** UUID v4 is used for Prompts and Versions to ensure cloud-readiness and prevent ID collisions.

## Future-Proofing & Cloud Readiness

The application is designed to be "DB-Agnostic":

1. **Abstracted Hook:** `usePromptLibrary` serves as the single API for data. Components are decoupled from storage implementation.
2. **Async-First Pattern:** Logic is prepared for the latency of cloud databases (Firestore) by treating storage actions as asynchronous operations.
3. **UUID Fingerprints:** Every entity is uniquely identified globally, allowing for seamless synchronization across devices or users later.
