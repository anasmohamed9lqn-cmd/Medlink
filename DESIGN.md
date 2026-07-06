# Nile MedLink System Design Language & UI Blueprint

Welcome to the **Nile MedLink Design System (MDS)** master specification. This document reverse-engineers, categorizes, and solidifies the real, implemented visual design language and components of the Nile MedLink healthcare portal. 

Every design token, structural boundary, component variant, and page layout documented here is extracted directly from the actual codebase (including `src/index.css`, `src/App.tsx`, `src/components/`, `src/types.ts`, and `package.json`). 

---

## 1. Overview & System Philosophy

Nile MedLink is an enterprise-grade clinical portal and medical synchronization system designed for four key actors: Patients, Doctors, Insurance Officers, and System Administrators. 

The visual design language is engineered to communicate **rigorous clinical validity, immediate clarity, and absolute security**. 

### Core Design Characteristics:
*   **Clinical Confidence (The "Sky Blue" Anchor)**: Primary interactive elements use a high-visibility sky blue. This color implies pristine modern technology balanced with a trusted clinical environment.
*   **Emergency Guarding (The High-Contrast Rose Accent)**: Emergency data, critical lab tolerances, and destructive commands are treated with high-contrast, eye-safe rose and red tones.
*   **Dual-Nature Containers**: The system seamlessly shifts between **soft light-themed surfaces** for patient-facing portals and **dense, high-contrast dark workspaces** (`#1E293B`, `#0F172A`) for administrator audit consoles.
*   **Antigravity Motion**: Structural updates utilize subtle physical transitions (e.g., Spring-like custom motion, staggered card entry, and pulsing beacon animations on verified states) to guide attention without causing visual cognitive fatigue.
*   **Anti-AI-Slop & Humble Copy**: Design borders are kept clean, outer boundaries are kept clear of margin clutter, and all badges use human-literal descriptors (e.g., `🟢 Verified Doctor`, `Verified Patient File`) rather than pseudo-technical status strings.

---

## 2. Source Coverage & Evidence

The design patterns and tokens documented in this system are derived from the following core files in the active repository:
*   `src/index.css`: Global custom definitions, standard background typography, password visual masking classes, print layout rules, and keyframes.
*   `src/types.ts`: Domain models mapping user roles, medical records, and verification status fields that govern rendering paths.
*   `src/App.tsx`: App-wide router, main wrapper configurations, and top-level responsive navigation structures.
*   `src/components/PublicLanding.tsx`: Patient-facing features, hero modules, marketing graphics, benefits lists, and footer structures.
*   `src/components/Login.tsx`: Form structures, role selector panels, active inputs, validation indicators, and provisioning systems.
*   `src/components/SidebarContent.tsx`: Navigation states, dark and light sidebar themes, role dashboards, and logout triggers.
*   `src/components/PatientDashboard.tsx`: Demographics manager, emergency banners, medication cards, and physical identity QR badge generation.
*   `src/components/DoctorDashboard.tsx`: Clinical metrics charts, timeline elements, medical lists, and live webcam QR scanning code.
*   `src/components/AdminDashboard.tsx`: System audit layouts, tabular data, search query filters, database state synchronization, and UTC clock controls.

---

## 3. Colors & Theme Tokens

The Nile MedLink color palette is structured around human-centric clinical statuses. To support both high-contrast light portals and intense dark consoles, colors are grouped into semantic design tokens.

### 3.1 Core Palette & Semantic Roles

| Token Reference | Real Value (CSS / Hex) | Color Preview | Semantic Role & Implementation Use Cases |
| :--- | :--- | :--- | :--- |
| `{colors.primary}` | `#0ea5e9` (`sky-500`) | Sky Blue | Active clinical action, primary command triggers, navigation states, verification ticks. |
| `{colors.primary-dark}` | `#0284c7` (`sky-600`) | Darker Sky Blue | Hover states for primary active buttons and selectable navigation grids. |
| `{colors.primary-light}` | `#f0f9ff` (`sky-50`) | Soft Blue Ice | Accent backdrops, selected list highlights, informational tips, non-critical notes. |
| `{colors.success}` | `#10b981` (`emerald-500`) | Emerald Green | Approved insurances, verified staff badges, successful database state syncs, active log-ons. |
| `{colors.success-light}`| `#f0fdf4` (`emerald-50`) | Clear Green Tint | Verified patient badge backgrounds, approved request banners, normal clinical values. |
| `{colors.warning}` | `#f59e0b` (`amber-500`) | Amber Orange | Pending approval queues, claims under review, laboratory tests awaiting signature. |
| `{colors.error}` | `#f43f5e` (`rose-500`) | Rose Pink / Red | Critical lab values, emergency clinical cards, deleting items from records, system alerts. |
| `{colors.error-light}` | `#fff1f2` (`rose-50`) | Light Rose Wash | Emergency box backdrops, critical alert containers, system error screens. |

### 3.2 Surface Colors

| Token Reference | Real Value | Theme Profile | Applied UI Block |
| :--- | :--- | :--- | :--- |
| `{colors.bg-light}` | `#f8fafc` (`slate-50`) | Light Portal | Main workspace backdrop for patients, doctors, and insurance officers on desktop. |
| `{colors.bg-dark}` | `#0f172a` (`slate-900`) | Dark Console | System admin panels, dark system sidebars, and mobile drawer backgrounds. |
| `{colors.surface-card}` | `#ffffff` (`white`) | Light Portal | Clean component panels, statistics cards, and clinical inputs. |
| `{colors.surface-dark}` | `#1e293b` (`slate-800`) | Dark Console | Admin table columns, modal backdrops, and active code blocks. |
| `{colors.surface-dark-accent}`| `#1e293b/40` | Dark Console | Navigation header bars, sidebar user cards, and custom search lists. |

### 3.3 Typography & Border Colors

| Token Reference | Real Value | Applied UI Block |
| :--- | :--- | :--- |
| `{colors.text-dark}` | `#0f172a` (`slate-900`) | Primary headers, active titles, and bold labels (Light theme). |
| `{colors.text-medium}` | `#475569` (`slate-600`) | Body copy, general descriptions, and secondary captions (Light theme). |
| `{colors.text-light}` | `#94a3b8` (`slate-400`) | Inactive selections, metadata, and placeholder text. |
| `{colors.text-white}` | `#ffffff` | Primary text in dark-themed consoles, buttons, and alert modules. |
| `{colors.border-default}`| `#e2e8f0` (`slate-200`) | Soft dividers, card borders, and normal light-theme input outlines. |
| `{colors.border-dark}` | `#1e293b` (`slate-800`) | Dark theme component outlines, administrative table dividers. |

---

## 4. Typography System

The typography follows a double-sans-mono architecture. It utilizes **Inter** for conversational layouts, forms, and clinical data titles, paired with **JetBrains Mono** for tracking medical codes, record identifiers, dates, and security metrics logs.

### 4.1 Fonts

```css
/* Realized CSS Imports inside src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```
*   **Primary Sans-Serif**: `Inter`, ui-sans-serif, system-ui, sans-serif (`{typography.font-sans}`)
*   **Primary Monospace**: `JetBrains Mono`, ui-monospace, monospace (`{typography.font-mono}`)

### 4.2 Hierarchy Specification

| Typography Token | Tailwind Equivalent | Real Size | Default Weight | Line Height | Ideal Implementation Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `{typography.display-hero}`| `text-5xl lg:text-6xl` | `48px` - `60px` | `font-black` (900) | `leading-none` | Marketing landing page headers. |
| `{typography.title-lg}` | `text-2xl sm:text-3xl` | `24px` - `30px` | `font-extrabold` (800) | `leading-tight` | Landing section headers, system login cards. |
| `{typography.title-md}` | `text-xl` | `20px` | `font-extrabold` (800) | `leading-snug` | Primary component board titles, welcome cards. |
| `{typography.title-sm}` | `text-lg` | `18px` | `font-bold` (700) | `leading-snug` | Modal headers, sub-component section titles. |
| `{typography.title-xs}` | `text-sm` | `14px` | `font-bold` (700) | `leading-none` | Table column headers, inner card titles. |
| `{typography.body}` | `text-xs sm:text-xs` | `12px` | `font-normal` (400) | `leading-normal`| Patient record text, profile forms, body descriptions. |
| `{typography.body-sm}` | `text-[11px]` | `11px` | `font-medium` (500) | `leading-relaxed`| Clinical notes, lab reference range explanations. |
| `{typography.caption}` | `text-[10px]` | `10px` | `font-semibold` (600) | `leading-none` | Input labels, action metadata, badge text. |
| `{typography.badge-mini}` | `text-[9px]` | `9px` | `font-bold` (700) | `leading-none` | Verified doctor/patient role pills, pulse states. |

### 4.3 Type Design Principles:
1.  **Strict Size Ceiling**: Nile MedLink restricts body-level typography to a dense, legible size of `text-xs` (`12px`) or `text-[11px]` (`11px`) on workspace dashboards. This maximized visual density simulates high-density electronic clinical records software while maintaining clarity.
2.  **No Monospace Overuse**: Limit `{typography.font-mono}` exclusively to:
    *   Medical IDs (e.g., `MID-789410`)
    *   National IDs & License numbers
    *   Dates, Times, and Active countdown clocks
    *   Audit log payloads and database schemas.

---

## 5. Layout & Spatial System

Alignment integrity is what separates production-grade clinical software from basic prototypes. Spacing tokens prevent visual chaos and establish an intuitive rhythm.

### 5.1 Spacing Scale

Every padding click, layout block margin, gap, and offset maps to our mathematical spacing tokens:

| Token Reference | Real Value (Tailwind / px) | Implementation Guide |
| :--- | :--- | :--- |
| `{spacing.xxs}` | `0.5` (`2px`) | Status pulse alignments, tiny badge gaps. |
| `{spacing.xs}` | `1` (`4px`) | Inner text padding, button-icon spacing. |
| `{spacing.sm}` | `2` (`8px`) | Label-input gaps, card secondary metadata rows. |
| `{spacing.md}` | `4` (`16px`) | Component inner grids, small card padding. |
| `{spacing.lg}` | `6` (`24px`) | Standard dashboard panel padding, container spacing. |
| `{spacing.xl}` | `12` (`48px`) | Landing page hero element dividers. |

### 5.2 Layout Containers & Grids
*   **The Desktop Wrapper Platform**: All dashboards use a standard fluid containment block to safely anchor layouts on wide screens:
    `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (`{layout.max-container}`)
*   **Double-Deck Grid (The Dashboard Standard)**: All critical dashboard content follows a `12-column` grid configuration split into a **Primary LHS content panel** (`lg:col-span-8`) and an **Actionable RHS utility dock** (`lg:col-span-4`).

---

## 6. Elevation & Depth (Shadows)

Nile MedLink uses a flat, clinical, flat-to-surface hierarchy to ensure maximum performance inside sandboxed web overlays. Elevated depth is restricted to interactive popovers, login cards, and context panels.

| Level | Token Reference | Real Value (CSS Shadow) | Designed Use Case |
| :--- | :--- | :--- | :--- |
| **0 (Flat)** | `{elevation.flat}` | `shadow-none` | Text inputs, table rows, and standard border dividers. |
| **1 (Very Low)**| `{elevation.xs}` | `shadow-4xs` / `shadow-3xs` | Default dashboard metrics cards, diagnostic results cards. |
| **2 (Low)** | `{elevation.sm}` | `shadow-sm` | Primary buttons on hover states, inactive sidebars. |
| **3 (Medium)** | `{elevation.md}` | `shadow-md` | Active search dropdown options, role selectors, profile avatars. |
| **4 (High)** | `{elevation.lg}` | `shadow-lg` | Sticky global header navigation blocks, active floating modals. |

---

## 7. Shape System (Borders & Radius)

The geometry of Nile MedLink uses rounded corners to project a friendly, accessible, and cutting-edge aesthetic.

*   **Primary Component Capsule**: `{shape.rounded-xl}` (`rounded-xl` / `12px`). Applied to text inputs, search inputs, custom action select fields, individual table records, and inner dashboard grids.
*   **Double-Shield Container**: `{shape.rounded-2xl}` (`rounded-2xl` / `16px`). Applied to top marketing panels, metric overview cards, patient timeline sections, and physical identity graphics.
*   **Status Badge Radius**: `{shape.rounded-full}` (`rounded-full` / `9999px`). Applied to active status pills, user portrait frames, and verification ticks.

---

## 8. Shared UI Components Reference

To maintain absolute uniformity across multiple screens, use these verified atomic component schemas:

### 8.1 Navigation Components
*   **`component-sidebar` (`{component.sidebar}`)**:
    *   *Description*: The left-side vertical navigation rail. This sidebar has two visual profiles:
        *   **Standard Light Profile** (`{sidebar.profile-light}`): White background (`bg-white`), slate-200 dividers, slate-600 text, and sky-100 hover overrides for Patients, Doctors, and Insurance portals.
        *   **Audit Console Dark Profile** (`{sidebar.profile-dark}`): Intense slate background (`bg-slate-900`), slate-800 dividers, slate-350 text (`hover:text-white`), and custom emerald-600 background tags for database consoles.
    *   *States & Class Combinations*:
        *   *Active tab (Light)*: `bg-sky-50 text-sky-600 font-bold border border-sky-100/30`
        *   *Active tab (Dark-Admin)*: `bg-sky-500 text-white shadow-md` (emerald-600 if active on `database` sub-section).
        *   *Interactive Trigger*: `transition-all duration-150 rounded-xl`

### 8.2 Buttons
*   **`component-btn-primary` (`{component.btn-primary}`)**:
    *   *Description*: The workhorse actionable trigger of the portal.
    *   *Tailwind Classes*: `px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-4xs transition-all cursor-pointer`
    *   *States*:
        *   *Default*: `{colors.primary}`
        *   *Hover*: `{colors.primary-dark}`
        *   *Disabled*: `bg-slate-200 text-slate-400 cursor-not-allowed`

*   **`component-btn-emergency` (`{component.btn-emergency}`)**:
    *   *Description*: Prompts destructive deletions, critical updates, block lists, or secondary cancellations.
    *   *Tailwind Classes*: `px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer`

*   **`component-btn-secondary` (`{component.btn-secondary}`)**:
    *   *Description*: Used for edit cancellations, profile closes, and auxiliary updates.
    *   *Tailwind Classes*: `px-4 py-2 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200 hover:border-sky-200/40 text-xs font-bold rounded-xl duration-150 cursor-pointer`

### 8.3 Cards & Containers
*   **`component-card-metric` (`{component.card-metric}`)**:
    *   *Description*: Aggregated score indicators mapped cleanly under clinical values.
    *   *Tailwind Classes*: `bg-white p-5 rounded-2xl border border-slate-200/85 hover:border-sky-200 transition-all flex items-center gap-4 shadow-3xs`
    *   *Interactivity*: Light hover scale shifting, outline border deepens to `border-sky-200` to indicate clickable history.

*   **`component-card-emergency` (`{component.card-emergency}`)**:
    *   *Description*: The absolute top priority banner on active patient dashboards. Uses semantic warning backdrops.
    *   *Tailwind Classes*: `bg-rose-50/10 p-5 sm:p-6 rounded-2xl border border-rose-200/60 space-y-4`

### 8.4 Inputs & Forms
*   **`component-input-text` (`{component.input-text}`)**:
    *   *Description*: Secure text input configuration. Includes explicit focus, invalid states, and clean typography.
    *   *Tailwind Classes*: `w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-400 rounded-xl text-xs text-slate-800 outline-none transition-all duration-150`
    *   *States*:
        *   *Focused*: `bg-white border-sky-450 focus:ring-1 focus:ring-sky-400/20`
        *   *Invalid / Error*: `border-rose-400 focus:border-rose-500`

*   **`component-input-masked` (`{component.input-masked}`)**:
    *   *Description*: Applied specifically to medical password portals inside `Login.tsx` and `Register.tsx` to secure key entry.
    *   *Specialized CSS class*: `.secure-mask-input`

### 8.5 Feedback & Badge Indicators
*   **`component-badge-verified` (`{component.badge-verified}`)**:
    *   *Description*: Certifies a user role (Doctor or Patient) has passed institutional checks.
    *   *Tailwind Classes*: `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-750 border border-emerald-150/40`
    *   *Sub-element*: Pulsing green state circle: `<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>`

*   **`component-badge-emergency` (`{component.badge-emergency}`)**:
    *   *Description*: Highlights critical bio-values or severe allergen indices.
    *   *Tailwind Classes*: `bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase`

---

## 9. Iconography Strategy

The icon system is powered exclusively by `lucide-react` to keep build footprint minimal, type-safe, and instantly scalable without loading custom vector SVGs.

### 9.1 Semantic Icon Mapping
*   `Activity` / `Heart`: General doctor diagnostics, active vitals summary, clinical pathways.
*   `Shield` / `ShieldCheck`: Verification clearances, verified credential validations, insurance protections.
*   `QrCode`: Patient medical ID key generation, mobile webcam quick scanner actions.
*   `ClipboardList` / `FileText`: Medical records templates, chief complain sheets, administrative logs.
*   `Stethoscope` / `Briefcase` / `Building`: Doctor department groups, Medical institutions registries.
*   `Clock` / `Timer`: Session access parameters, automatic logouts, consultation schedulers.
*   `AlertTriangle` / `AlertCircle`: Emergency indicators, allergy warnings, server sync exceptions.

### 9.2 Icon Sizing Rules:
*   Inside sidebars: Always bound to `h-4 w-4` (`16px`).
*   Inside standard cards: Bound to `h-4.5 w-4.5` (`18px`) or `h-5 w-5` (`20px`).
*   Action triggers and auxiliary buttons: Always exact to `h-3.5 w-3.5` (`14px`).

---

## 10. Motion & Interaction States

The Nile MedLink experience is heavily refined using physical animations built natively through `motion` (`motion/react`) or standard Tailwind transitions.

### 10.1 Interaction Feedback States
*   **Button Hover State**: Shift background color over `transition-all duration-150 ease-in-out` with a slight opacity reduction or shadow increase.
*   **Interactive Card Hover**: Subtle vertical lift (`-2px translate`) paired with border coloring transition to indicate structural depth.
*   **Active Tab Transition**: Micro scale spring bounce to highlight changing section views.

### 10.2 Global Keyframe Classes (from `src/index.css`)
*   `animate-fade-in`: Simple landing and router transition state.
*   `animate-pulse`: Used continuously on unverified session backdrops, search syncing states, and active beacon rings.

---

## 11. Accessibility Matrix (A11y)

| Element Grid | Implemented Standard | Identified Action Checklist (Gaps) |
| :--- | :--- | :--- |
| **Color Contrast** | Safe `slate-600` body copy over white backdrops. Large dark text tags. | Ensure hover state on secondary elements (`slate-400` vs `#F8FAFC`) stays crisp under standard daylight conditions. |
| **HTML ID Identifiers**| Unique `id` and `name` attributes mapped explicitly to form controls. | Audit medical inputs recursively to ensure screen-readers parse labels correctly. |
| **Button Touch Surface**| Navigation targets kept at a safety surface of 44px on mobile screens. | None. |

---

## 12. Themes (Multi-Role Profiles)

Nile MedLink does **not** use a manual user-facing theme toggle, adhering to the cohesive **Single Polished Theme** design principle. Instead, visual theme profiles are mapped contextually to specific User Roles:

1.  **Light Portal (The Clinical Environment)**:
    *   *Active Users*: Patients, Doctors, and Insurance Teams.
    *   *Visuals*: Soft grey backgrounds (`#F8FAFC`), crisp white containers, and light-blue borders. Gives the feel of a bright, modern, calming medical clinic.
2.  **Dark Console (The administrative operations platform)**:
    *   *Active Users*: System Admin, Operations Administrators, and Mobile layout drawers.
    *   *Visuals*: Deep indigo-slates (`#1E293B`, `#0F172A`), high-contrast green badges, and rich monospace telemetry layouts. Implies a highly secure, clinical audit-verified master operations center.

---

## 13. Practical Design "Do's and Don'ts"

Follow these strict visual boundaries when expanding Nile MedLink modules:

### 🙆 Do's:
*   **Do** pair every critical numeric variable (such as test values or medical counts) with `{typography.font-mono}`.
*   **Do** enforce a strict `max-w-7xl` centered wrapper to anchor grid containers on widescreen monitors.
*   **Do** keep emergency medical data (such as allergies) wrapped in `{colors.error-light}` boxes with high-contrast red headings.
*   **Do** write human-literal badge labels: prefer `🟢 Verified Staff` over `SYSTEM_STAFF_PASS_AUTH_OK`.
*   **Do** utilize `{shape.rounded-xl}` for interactive controls to maintain a modern, friendly clinical aesthetic.

### 🙅 Don'ts:
*   **Don't** use custom SVG path files for icons; always scale and leverage `lucide-react` keys.
*   **Don't** add custom theme selector utilities or client controls; let the system automatically manage styles based on the authenticated role.
*   **Don't** apply pure clinical black text over absolute pure absolute white block backdrops; always soften text weights with our slate palette.
*   **Don't** write status coordinates or simulated server telemetry logs in the outer margins to avoid cluttered "AI slop" headers.

---

## 14. Responsive Behavior

| Breakpoint | Layout Behavior & Structural Transition |
| :--- | :--- |
| **Mobile (`< 640px`)** | Sidebars collapse into a dark slide-out drawer triggered via an overlay button. Medical grids stacked into a single column. Font sizes optimized to legible constants. |
| **Tablet (`640px - 1024px`)** | Lateral paddings expand. Grids adapt to tight double-columns. |
| **Desktop (`> 1024px`)** | Left rail sidebar locks into vertical alignment. Right-hand utility panels scale side-by-side with LHS medical panels in the double-deck grid. |

---

## 15. Page-by-Page Layout Blueprint

Expanding the system requires strict layout structure mapping. Leverage the following structural recipes for new pages:

### 15.1 Public Marketing Landing Page
*   **Layout**: Top fixed header bar -> High-impact Hero title container -> Multi-column Feature blocks -> Interactive Role showcase -> Detailed contact and subscription footer.
*   **Colors**: Clean marketing slate-bg with active primary sky text.

### 15.2 Authentic Secure Login Gateway
*   **Layout**: Clean typography heading paired with secondary info sub-headings -> Interactive Role simulator buttons (for quick dev testing) -> Secure Email/Password inputs -> Remember Me / Forgot links -> Wide primary submission action button.

### 15.3 Interactive Patient Workspace
*   **Layout**: Top personal welcome panel with high-contrast active medical ID -> Triple-row health overview statistics container -> Central split panel grid:
    *   *LHS Column* (66%): Recent clinical consultations list, severe allergic emergency banners, and historic medical lists.
    *   *RHS Column* (33%): SVG QR code card for clinics registry and legal health authorization statements.

---

## 16. Known Visual Inconsistencies & Gaps

Future developers should be aware of the following implementation anomalies in the active codebase:
1.  **Hardcoded Sky Overrides**: Select components inside `SidebarContent.tsx` utilize hardcoded background values (e.g., `bg-sky-[505]`, `bg-slate-[805]`) which act as custom visual placeholders.
2.  **Webcam Capture Boundaries**: Camera captures inside `DoctorDashboard` or portrait uploads leverage browser-native inputs and may display unstyled dialogue pop-ups if browser iframe permissions are locked.
3.  **Local Storage Sync Gates**: Some data elements (like insurance request approvals or physical card delivery states) are synchronized via local storage polling and may display a 2-second visual latency when switching account roles instantly without refreshing the tab.

---

## 17. Developer Workspace Integration Guide

Ensure your development workspace compiles correctly by running:
1.  **Initial Package Check**: Ensure dependencies like `qrcode.react`, `@supabase/supabase-js`, `firebase`, and `lucide-react` are loaded in `package.json`.
2.  **Linting**: Verify standard React JSX rules and TypeScript imports are resolved without importing unused type declarations.
3.  **Production build**: Build static resources cleanly to `/dist/` using the modern build pipeline.

---
* Nile MedLink Design Standards, 2026. Approved for production implementation.*
