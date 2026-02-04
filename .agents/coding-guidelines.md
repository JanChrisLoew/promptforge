# PromptForge Coding Guidelines

To ensure PromptForge remains a high-performance, maintainable, and "future-proof" professional tool, all development must adhere to the following standards.

## 1. File & Component Architecture

### No "God-Tier" Files

- **Maximum Line Count**: No single source file (`.ts`, `.tsx`) should exceed **350 lines**.
- **Reasoning**: Large files increase cognitive load, make testing harder, and lead to merge conflicts.
- **Action**: If a file exceeds 350 lines, it must be split into sub-components or moved to external utility/logic files.

### One Component Per File

- Each file should export exactly **one** primary component.
- Internal "sub-components" are allowed only if they are under 20 lines and used exclusively within that file.

## 2. Logic Separation

### Business Logic in Hooks

- Functional logic (data processing, state orchestration) belongs in **Custom Hooks** (`hooks/`).
- Components should only handle **UI State** and **Presentation**.

### Storage & Utilities

- Direct browser API calls (LocalStorage, IndexedDB) must be abstracted into `utils/storage.ts` or similar services.

## 3. Design Patterns

### Async-Ready Data Streams

- All storage-related actions must be `async`. This prepares the app for a future transition to cloud databases like Firebase/Firestore without refactoring the UI layer.

### Glassmorphism UI

- Use `backdrop-blur-*` and semi-transparent backgrounds for overlays and modals to maintain the premium "depth" aesthetic.

## 4. Linting & Health Checks

### Strict Types

- No `any` types. Use explicit interfaces or generics.
- All functional interfaces should be defined in `types.ts`.

### Performance

- Use `useMemo` and `useCallback` for expensive derivations and event handlers passed to children.
- Use `React.memo` for list items or expensive leaf components.

## 5. AI Agent Hygiene & Mess Prevention

### Prevent "Context Drift"

- **No Duplication**: Before implementing a utility or hook, search the codebase for similar logic. Do not implement the same logic twice in different styles.
- **Dead Code Cleanup**: AI agents must proactively delete unused imports, variables, and commented-out code after a refactor.
- **Markdown Integrity**: Every `.md` file must be "syntax solid." This means no linting violations (proper heading spacing, list formatting, and valid structure). Documentation must be as clean as the code.

### Strict Type Safety

- **No `any`**: The use of `any` is strictly prohibited except in rare migration cases. Always use `unknown` or define a proper interface.
- **Explicit Returns**: Functions should have explicit return types to prevent unexpected data flow.

### Defensive Programming

- **Error Boundaries**: Wrap major UI features in Error Boundaries to prevent a single crash from breaking the entire app.
- **Graceful Failures**: Every `async` operation must have a `try/catch` block and provide user feedback via the `ConfirmationModal` (Info/Danger) or a toast system.

### State Ownership

- **Single Source of Truth**: Identify which component "owns" a piece of state. Avoid duplicating state in children unless required for "local draft" patterns (like in `PromptEditor`).
- **Prop Drilling**: If a prop is passed more than 3 levels deep, consider using **React Context** or a state management hook.

---
*PromptForge - Built for Quality.*
