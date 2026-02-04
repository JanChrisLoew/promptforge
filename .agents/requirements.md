# Requirements & Traceability Matrix (RTM)

## Project Overview
**PromptForge** is a local-first, professional prompt engineering tool designed for performance, privacy, and ease of use. This document tracks the functional and non-functional requirements against the current codebase implementation.

## Legend
- ✅ **Complete:** Fully implemented and integrated.
- 🚧 **In Progress:** Partially implemented or needs refinement.
- ❌ **Pending:** Planned but not yet started.

## Requirements Traceability Matrix (Phase 1: Core Library)

| ID | Category | Requirement Description | Status | Implementation Reference |
| :--- | :--- | :--- | :--- | :--- |
| **CORE-001** | **CRUD** | Create new empty prompts with unique IDs. | ✅ | `usePromptLibrary.ts` -> `createPrompt` |
| **CORE-002** | **CRUD** | Read/List prompts with infinite scroll/virtualization support (UI). | ✅ | `PromptList.tsx` (overflow-y-auto) |
| **CORE-003** | **CRUD** | Update prompt content (System, User, Title, Category). | ✅ | `PromptEditor.tsx` -> `handleChange` |
| **CORE-004** | **CRUD** | Delete prompts with confirmation dialog. | ✅ | `usePromptLibrary.ts` -> `deletePrompt` |
| **ORG-001** | **Organization** | Filter prompts by search term (Title/Tags). | ✅ | `PromptList.tsx` -> `filteredPrompts` |
| **ORG-002** | **Organization** | Group prompts by Category with collapsible folders. | ✅ | `PromptList.tsx` -> `groupedPrompts` |
| **ORG-003** | **Organization** | Sort prompts by "Last Updated" and "Alphabetical". | ✅ | `PromptList.tsx` -> `sortMode` |
| **ORG-004** | **Organization** | Add/Remove Tags for prompts. | ✅ | `PromptEditor.tsx` -> `Tags section` |
| **VER-001** | **Versioning** | Create snapshots (versions) of a prompt. | ✅ | `PromptEditor.tsx` -> `saveVersion` |
| **VER-002** | **Versioning** | Restore previous versions from history. | ✅ | `PromptEditor.tsx` -> `restoreVersion` |
| **VER-003** | **Versioning** | Add optional commit notes to versions. | ✅ | `PromptEditor.tsx` -> `commitNote` |
| **DATA-001** | **Persistence** | Auto-save all data to LocalStorage. | ✅ | `usePromptLibrary.ts` -> `useEffect` |
| **DATA-002** | **Import/Export** | Export full library to JSON (Blob-based for large files). | ✅ | `utils/index.ts` -> `downloadJson` |
| **DATA-003** | **Import/Export** | Export single prompt to JSON. | ✅ | `PromptEditor.tsx` -> `handleExportSingle` |
| **DATA-004** | **Import/Export** | Import JSON library with validation and ID conflict resolution. | ✅ | `usePromptLibrary.ts` -> `importLibrary` |
| **UX-001** | **Interaction** | Keyboard Shortcuts (`Ctrl+S` to save version). | ✅ | `PromptEditor.tsx` -> `useEffect(keydown)` |
| **UX-002** | **Feedback** | Visual indicator for "Saving..." vs "Saved". | ✅ | `PromptEditor.tsx` -> `Cloud/CloudOff icons` |
| **UX-003** | **Dashboard** | Show statistics when no prompt is selected. | ✅ | `App.tsx` -> `stats` |
| **UX-004** | **Theming** | Support System Dark/Light mode. | ✅ | `index.css` -> `@media (prefers-color-scheme: dark)` |
| **PERF-001** | **Optimization** | Debounce user input to prevent excessive LocalStorage writes. | ✅ | `PromptEditor.tsx` (600ms delay) |
| **PERF-002** | **Stability** | Layout Shift prevention (Scrollbar Gutter). | ✅ | `index.css` -> `scrollbar-gutter: stable` |
| **SEC-001** | **Safety** | Prevent data loss on component unmount or rapid switching (Flush). | ✅ | `PromptEditor.tsx` -> `Safety Flush` effects |
| **SEC-002** | **Validation** | Type Guard checks for imported JSON data. | ✅ | `utils/index.ts` -> `isValidPrompt` |

## Future Roadmap & Concept Requirements

The following requirements define the evolution from a "Library" to a full "Prompt Engineering IDE".

### Phase 2: AI Execution (The Playground)
| ID | Category | Requirement Description | Value Proposition |
| :--- | :--- | :--- | :--- |
| **AI-001** | **Execution** | Integration of **Google Gemini API** (BYOK - Bring Your Own Key). | Allows immediate testing of prompts without leaving the app. |
| **AI-002** | **Configuration** | UI to set Model Parameters (Temperature, TopK, TopP, JSON Mode). | Fine-tuning of model behavior per prompt. |
| **AI-003** | **History** | Store "Run History" (Input/Output pairs) locally, linked to the specific prompt version. | Allows reviewing past model performance to measure improvement. |
| **AI-004** | **Cost** | Live Token Counting (Input/Output) and estimated cost calculation. | Helps engineers optimize prompts for production costs. |
| **AI-005** | **Multimodal** | **Native PDF & Image Support:** Support uploading PDFs (`application/pdf`) and Images as Inline-Data. | Enables **Document Understanding** (RAG-lite) tasks directly in the browser without external OCR. |

### Phase 3: Advanced Engineering
| ID | Category | Requirement Description | Value Proposition |
| :--- | :--- | :--- | :--- |
| **ENG-001** | **Variables** | Auto-detect `{{variables}}` in text and provide form fields to fill them before execution. | Makes testing dynamic prompts much faster and realistic. |
| **ENG-002** | **Comparison** | **A/B Testing View:** Run two versions of a prompt side-by-side against the same input. | Direct visual comparison of changes (e.g., "Did adding 'think step-by-step' help?"). |
| **ENG-003** | **Structure** | Structured "Few-Shot" UI (List of Input/Output examples) instead of raw text block. | Easier management of training examples within the prompt. |
| **ENG-004** | **Linting** | Static analysis of prompts (e.g., "Prompt too long", "Conflicting instructions"). | Automated quality assurance. |

### Phase 4: Workflow & Integration
| ID | Category | Requirement Description | Value Proposition |
| :--- | :--- | :--- | :--- |
| **FLOW-001** | **Export** | "Copy as Code" button (Python/JS/cURL snippets with variables pre-filled). | Reduces friction when moving from prompt engineering to production code. |
| **FLOW-002** | **Chaining** | Create simple chains where the output of Prompt A becomes the input of Prompt B. | Enables testing of multi-step agentic workflows. |
| **FLOW-003** | **Eval** | Define "Test Cases" (Fixed inputs + Expected outputs) that can be run in bulk. | Regression testing for prompts to ensure updates don't break edge cases. |
| **FLOW-004** | **Batching** | **Data-Driven Testing:** Upload a CSV/JSON file to run the prompt against every row (Batch Mode). | Essential for verifying reliability across a dataset before deployment. |

## Technical Constraints & Health Check

### 1. Data Integrity
- **Status:** Healthy
- **Details:** The application now uses a robust "Safety Flush" mechanism in `PromptEditor` to handle race conditions between the debounced save timer and component unmounting/switching. Imports are validated via `isValidPrompt`.

### 2. Performance
- **Status:** Healthy
- **Details:**
    - **Debouncing:** Input lag is minimized by delaying the write operation to LocalStorage.
    - **Rendering:** React `useMemo` is used extensively for derived state (filtering, sorting, stats) to prevent unnecessary re-renders.

### 3. Scalability (Local)
- **Status:** Good
- **Details:**
    - **Storage:** Limited by browser `LocalStorage` quota (typically 5-10MB strings).
    - **Export:** The switch to `Blob` and `URL.createObjectURL` allows exporting libraries significantly larger than the previous `data:uri` limit.
