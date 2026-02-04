# UI / UX Design System

## Layout Philosophy

- **Master-Detail View:**
  - Left Sidebar (`w-80`): Navigation, Search, Filtering.
  - Main Content (`flex-1`): Editor inputs.
  - Right Panel (inside Editor): Version History.
- **Full Height:** App prevents body scroll (`overflow-hidden`, `h-screen`) and manages internal scrolling areas.
- **Persistent Footer:** A global `h-10` utility bar for legal and project metadata.
- **Glassmorphism Overlays:** Modals and Infopages use `backdrop-blur-md` and semi-transparent backgrounds to maintain spatial depth.

## Color Palette (Tailwind Config)

### Text

- **Primary:** `text-txt-primary` (#222424) - Main content.
- **Secondary:** `text-txt-secondary` (#555757) - Meta data, labels.
- **Muted:** `text-txt-muted` (#767878) - Placeholders, icons.

### Accents

- **Accent 1 (Red-Orange):** `bg-accent-1` (#D63C24) - Primary Actions (New Prompt in Sidebar/Dashboard), Errors, Danger Modals.
- **Accent 2 (Orange):** `text-accent-2` (#EF7D00) - Highlights, Tags, Warning Modals.
- **Accent 3 (Blue):** `text-accent-3` (#0090B6) - Selection state, Links, Save actions, Success feedback.

### Canvas / Backgrounds

- **Base:** `bg-canvas-base` (#F9FAFB) - App background.
- **Card:** `bg-canvas-card` (#FFFFFF) - Panels, Inputs.
- **Hover:** `bg-canvas-hover` (#F3F4F6) - Interactive elements hover state.

## Typography

- **Font Family:** 'Mulish', sans-serif.
- **Sizing:** Standard Tailwind scale. Input fields use `text-sm` for density.

## Components

- **Buttons:** Minimalist, often icon-only or icon+text.
- **Inputs:** Clean borders, focus ring uses `ring-accent-3`.
- **Scrollbars:** Custom thin scrollbar implementation (see `index.css`).
