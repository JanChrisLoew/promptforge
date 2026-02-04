# Project Brief: PromptForge

## 1. Overview & Philosophy

PromptForge is a professional, standalone Single Page Application (SPA) designed for "Prompt Engineering". It provides a dual-view architecture (Landing Page & Dashboard) allowing users to manage AI prompts in a local-first environment.

### Core Philosophy

- **Local-First:** Data is persisted in the browser's LocalStorage. No backend is required.
- **Privacy:** No data leaves the user's browser unless explicitly exported.
- **Speed:** Instant interactions, optimized for desktop usage.
- **Professional UX:** A clean, IDE-like interface with in-app modals and a global landing-to-dashboard flow.

## 2. Key Features

1. **Library Management:** Create, Read, Update, Delete (CRUD) prompts.
2. **Versioning:** Save snapshots (versions) of prompts with commit notes. Restore previous versions.
3. **Organization:** Categorization, Tagging, and Search/Filter functionality.
4. **Import/Export:** Full library backup via JSON or single prompt export.
5. **Safe Editing:** Duplicate detection and confirmation dialogs for destructive actions.

## 3. Requirements & Traceability (Phase 1)

| ID | Category | Requirement Description | Status |
| :--- | :--- | :--- | :--- |
| **CORE-001** | **CRUD** | Create new empty prompts with unique IDs. | ✅ |
| **CORE-002** | **CRUD** | Read/List prompts with infinite scroll support. | ✅ |
| **CORE-003** | **CRUD** | Update prompt content (System, User, Title, Category). | ✅ |
| **CORE-004** | **CRUD** | Delete prompts with custom confirmation modal. | ✅ |
| **ORG-001** | **Organization** | Filter prompts by search term (Title/Tags). | ✅ |
| **ORG-002** | **Organization** | Group prompts by Category with collapsible folders. | ✅ |
| **ORG-003** | **Organization** | Sort prompts by "Last Updated" and "Alphabetical". | ✅ |
| **ORG-004** | **Organization** | Add/Remove Tags for prompts. | ✅ |
| **VER-001** | **Versioning** | Create snapshots (versions) of a prompt. | ✅ |
| **VER-002** | **Versioning** | Restore previous versions with warning modal. | ✅ |
| **VER-003** | **Versioning** | Add optional commit notes to versions. | ✅ |
| **DATA-001** | **Persistence** | Auto-save all data to LocalStorage. | ✅ |
| **DATA-002** | **Import/Export** | Export full library to JSON (Blob-based). | ✅ |
| **SEC-002** | **Validation** | Type Guard checks for imported JSON data. | ✅ |
| **AUTH-001** | **Access** | Simulated Auth (Landing Page gating). | ✅ |

## 4. Future Roadmap

### Phase 2: AI Execution (The Playground)

- **Gemini API Integration:** BYOK (Bring Your Own Key) testing.
- **Model Parameters:** UI for Temperature, TopK, TopP, etc.
- **Multimodal Support:** Native PDF & Image understanding.

### Phase 3: Advanced Engineering

- **Variables:** Auto-detect `{{variables}}` and provide form fields.
- **A/B Testing:** Run two versions side-by-side for comparison.
- **Few-Shot UI:** Structured management of input/output examples.

### Phase 4: Workflow

- **Copy as Code:** Python/JS/cURL snippets with pre-filled variables.
- **Chaining:** Multi-step agentic workflows.
- **Batching:** Run prompts against CSV/JSON datasets.
