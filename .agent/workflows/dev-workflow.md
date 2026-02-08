---
description: Standard development workflow for Feature implementation and bug fixes
---

# Developer Workflow

This workflow outlines the standard process for implementing features or fixing bugs in the PromptForge codebase.

## 1. Preparation

- [ ] Pull the latest changes from `main`.
- [ ] Create a new branch: `git checkout -b feature/your-feature-name` or `fix/your-bug-fix`.
- [ ] Install dependencies if needed: `pnpm install`.

## 2. Development Loop

- [ ] Start the development server: `npm run dev`.
- [ ] Implement your changes.
- [ ] **Lint frequently**: Run `npm run lint` to catch issues early.

## 3. Verification (Pre-Commit)

// turbo

- [ ] Run the full verification suite: `npm run build`.
  - This checks:
    1. ESLint rules (`npm run lint`)
    2. File length constraints (`npm run health-check`)
    3. TypeScript types (`tsc`)
    4. Production build (`vite build`)

## 4. Finalization

- [ ] Commit your changes with a descriptive message.
- [ ] Push to the remote branch.
