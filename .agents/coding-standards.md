# Coding & Design Standards

## 1. Development Principles

### Architecture

- **Max File Length:** No source file should exceed **350 lines**. Split if larger.
- **Component Scope:** One primary component per file.
- **Logic Separation:** Functional logic in **Hooks**; UI in **Components**.
- **Storage:** Abstract all storage calls into `utils/storage.ts`.

### AI Agent Hygiene

- **No Duplication:** Search codebase before implementing new utilities.
- **Dead Code:** Proactively delete unused imports/variables after refactors.
- **Markdown Integrity:** Every `.md` file must be "syntax solid" (no violations).
- **Temporary File Cleanup:** Delete logs/debug files immediately after use.

### Type Safety

- **No `any`:** Use `unknown` or explicit interfaces.
- **Explicit Returns:** Annotate function return types.

## 2. UI / UX Design System

### Layout Philosophy

- **Master-Detail:** Left Sidebar (320px) + Main Content (Flex-1).
- **Full Height:** `h-screen`, `overflow-hidden`.
- **Glassmorphism:** Use `backdrop-blur-*` for overlays/modals to maintain depth.

### Color Palette (Tailwind)

- **Text:** Primary (#222424), Secondary (#555757), Muted (#767878).
- **Accents:**
  - **Accent 1 (Red):** #D63C24 (Actions, Errors, Danger).
  - **Accent 2 (Orange):** #EF7D00 (Highlights, Warnings).
  - **Accent 3 (Blue):** #0090B6 (Selection, Save, Success).
- **Canvas:** Base (#F9FAFB), Card (#FFFFFF), Hover (#F3F4F6).

### Typography

- **Font Family:** 'Mulish', sans-serif.
- **Scale:** Standard Tailwind scale. `text-sm` for inputs.

## 3. Maintenance

- **Health Checks:** Run `pnpm health-check` to verify file length constraints.
- **Linting:** `pnpm lint` must be 100% clean (0 errors/warnings).
