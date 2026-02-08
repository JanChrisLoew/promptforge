---
description: Workflow for addressing code review feedback and optimizing performance
---

# Code Review & Optimization Workflow

Use this workflow when addressing code review feedback or performing optimization passes.

## 1. Analysis

- [ ] Review the feedback/requirements.
- [ ] Identify affected components.
- [ ] Create a reproduction case for performance issues if possible.

## 2. Implementation Strategy

- [ ] **Performance**: Look for expensive calculations in `render` loops. Use `useMemo` and `useCallback`.
- [ ] **Robustness**: Check for `null`/`undefined` in contexts and props. Add error boundaries or safe checks.
- [ ] **UX**: Ensure dangerous actions have confirmation dialogs.

## 3. Verification

// turbo

- [ ] Run the build verification: `npm run build`.
- [ ] Manual verification of the specific feedback items.

## 4. Documentation

- [ ] Update `task.md` with progress.
- [ ] Create/Update `walkthrough.md` with verification results.
