# UI / UX Execution Guideline
## College Resource & Academic Collaboration Platform — v3.0
**For: Frontend coding agent (Claude Code / Cursor / Copilot / human dev)**
**Reference PRD: V3.0 Final, July 29 2026**

This document is the single source of truth for how the frontend should look, move, and feel. It is written so a coding agent can implement pixel-accurate, motion-accurate UI without needing to ask clarifying questions. Follow it exactly. Where the PRD (roles, data, permissions) and this doc (visuals) overlap, this doc governs presentation only — never invent new roles or permissions; use the ones below exactly as defined.

> **Design north star:** This is not an admin panel. It is a *living knowledge universe* the student travels through — College → Department → Semester → Course → Session → Resource. Every navigation is a **camera move into a deeper layer**, not a page load.

---

## 0. Product Context the UI Must Reflect

Use these exact role names and permission boundaries everywhere in the UI (labels, empty states, gated buttons, dashboards). Do not use generic terms like "Admin" or "Teacher."

| Role | Scope | Can do in UI |
|---|---|---|
| **Student** | One college, one classroom unit (Dept+Session) | Browse/download resources, view notices, join discussions, view Personal Shares addressed to them, view own profile |
| **CR** (Main CR / Co‑CR — visually identical, badge differs only in label) | One classroom unit | Full resource CRUD, notice composer, discussion group manager, verification queue, Personal/Confidential Share composer |
| **Sub Admin** | One college | CR promote/demote, fallback verification, college-scoped stats — **read-only** on resources/notices/discussions |
| **Owner Admin** | Platform-wide | Sub Admin promote/demote + ownership transfer, platform-wide structure & analytics, global audit log — **read-only** everywhere else |

Content hierarchy the navigation/breadcrumbs must always encode:
`College → Department → Semester → Course → Session → [Lectures / Notes / PYQs / Tutorials / Software]`

Governance is a *separate* tree from content — never merge them visually. Content pages use the "knowledge universe" navigation; governance dashboards (CR/Sub Admin/Owner Admin) use a calmer, denser "control room" mode (see Section 7).

---

## 1. Technology Stack (mandatory)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSR/ISR for public resource pages (SEO for public search), CSR for authenticated dashboards |
| Language | **TypeScript** | strict mode on |
| Styling | **Tailwind CSS** | all design tokens below as Tailwind theme extensions, never hardcoded hex in components |
| Component library | **shadcn/ui** | base for every interactive primitive — buttons, inputs, dialogs, dropdowns, tabs, sheets, command palette, tables, tooltips, popovers, breadcrumbs, avatar, skeleton, toast (sonner). Do not hand-roll a primitive shadcn already provides. |
| Icons | **Lucide React** | stroke width 1.75, never mix icon sets |
| Animation | **Framer Motion** for React-level orchestration (page transitions, shared layout, spring physics) + **CSS transitions** for micro-interactions (hover/press) to avoid JS overhead on simple states |
| Shared-element / layout transitions | Framer Motion `layoutId` | this is the mechanism behind every "zoom into" transition described below |
| Scrolling | **Lenis** (`@studio-freight/lenis` or `lenis` npm) | smooth inertia scroll on marketing/landing + resource explorer |
| Charts (Owner Admin Analytics) | **Recharts** | matches PRD's tech mapping (section 7 of PRD) |
| PDF preview | `react-pdf` or embedded viewer | wrapped in the app's own chrome (Section 6.7) — never the bare browser PDF plugin look |
| Command palette | `cmdk` (shadcn's Command component is built on it) | |
| Forms | `react-hook-form` + `zod` | shadcn Form component |
| State/data | React Query (TanStack Query) for server state | keeps loading/optimistic states consistent with the motion system |
| Fonts | Load via `next/font`: **General Sans** or **Satoshi** (display/headings), **Inter** or **Geist** (body/UI) | self-host both, do not use Google Fonts CDN for these (neither is on Google Fonts) |
| Noise/texture | Inline SVG turbulence filter or a tileable PNG at ~3% opacity, `mix-blend-mode: overlay` | applied to page background only, never on cards or text |

Do not introduce a second component library, a second icon set, or a second animation library. Consistency of the underlying system is what makes the "Apple/Linear/Vercel" feel possible.

---

## 2. Design Tokens

### 2.1 Color

Ship these as CSS variables in `globals.css` **and** mirrored into `tailwind.config.ts` `theme.extend.colors`. Keep the PRD/user-supplied palette exactly as given — do not "improve" the hues.

```css
:root {
  --primary: #8FBF9F;      /* sage green — primary actions, active states */
  --secondary: #68A67D;    /* deeper green — hover/pressed states, secondary CTAs */
  --text: #353535;         /* body/heading text on light surfaces */
  --accent: #F18F01;       /* amber — highlights, notifications, CR-only actions, streaks */
  --bg: #F5ECD7;           /* warm parchment base background */
  --default: #24613B;      /* deep forest — dark-mode base / footer / hero backgrounds / headers on glass */

  --surface: #FFFFFF;          /* cards on top of --bg */
  --surface-2: #FBF6EA;        /* nested card / input background, slightly warmer than white */
  --border: rgba(53,53,53,0.08);
  --border-strong: rgba(53,53,53,0.14);

  --text-muted: rgba(53,53,53,0.62);
  --text-faint: rgba(53,53,53,0.40);

  --success: #4C9A6A;
  --warning: #F18F01;   /* reuse accent — do not add a competing yellow */
  --danger: #D95F5F;
  --info: #5B8DBF;

  --glass-bg: rgba(255,255,255,0.55);
  --glass-border: rgba(255,255,255,0.35);
  --glow-primary: rgba(143,191,159,0.35);
  --glow-accent: rgba(241,143,1,0.28);
}

/* Dark mode: used for hero/landing sections, PDF viewer chrome, and an optional app-wide dark theme */
[data-theme="dark"] {
  --bg: #16241C;                 /* darkened derivative of --default */
  --surface: #1E3327;
  --surface-2: #23392C;
  --text: #F5ECD7;               /* invert onto the parchment tone */
  --text-muted: rgba(245,236,215,0.64);
  --border: rgba(245,236,215,0.10);
  --glass-bg: rgba(30,51,39,0.55);
  --glass-border: rgba(245,236,215,0.12);
}
```

Usage rules:
- `--primary` and `--secondary` are for interactive/brand elements only — never for large background fills (they'll fight the parchment `--bg`).
- `--accent` is reserved for: CR-exclusive actions (upload, publish notice, send Personal Share), unread badges, active timers, and the single most important CTA per screen. Never use it for more than one element type per screen — it loses meaning if overused.
- Role badges: Student = neutral gray chip; CR = `--accent` chip; Sub Admin = `--secondary` chip; Owner Admin = `--default` chip with a small crown-style Lucide `Crown` icon.
- Glassmorphism (`--glass-bg`/`--glass-border` + `backdrop-filter: blur(20px) saturate(160%)`) is reserved **only** for: command palette, modals/dialogs, the top nav on scroll, and toasts. Never apply glass to a resting content card — see Section 1's "soft shadows, minimal borders" instruction; glass and card-shadow are two different surface languages and must not mix on the same element.

### 2.2 Typography

```
Display / Headings: "General Sans" (fallback "Satoshi", then system-ui)
Body / UI: "Inter" (fallback "Geist", then system-ui)
```

Type scale (Tailwind `fontSize` extension, desktop → mobile clamp):

| Token | Desktop | Mobile | Weight | Use |
|---|---|---|---|---|
| `display-xl` | 88px / 1.0 | 44px | 600 | Landing hero only |
| `display-lg` | 56px / 1.05 | 34px | 600 | Section heroes (College/Dept landing) |
| `display-md` | 40px / 1.1 | 28px | 600 | Page titles (Course Detail, Dashboard headers) |
| `heading-lg` | 28px / 1.2 | 22px | 600 | Card group titles, modal titles |
| `heading-md` | 20px / 1.3 | 18px | 600 | Card titles |
| `body-lg` | 17px / 1.6 | 16px | 400 | Lead paragraphs |
| `body-md` | 15px / 1.6 | 15px | 400 | Default body/UI text |
| `body-sm` | 13px / 1.5 | 13px | 400 | Meta text, timestamps, captions |
| `label` | 12px / 1.4, uppercase, tracking 0.06em | same | 500 | Eyebrow labels, section kickers |

Rules:
- Letter-spacing on `display-*` is slightly negative (`-0.02em`) for an editorial, Apple-keynote feel.
- Never center-align paragraphs longer than one line. Left-align body copy; center is for hero eyebrow + H1 only, and only on the landing page.
- Line length cap: 68ch for body text blocks (discussions, notices, resource descriptions).

### 2.3 Shape, Elevation, Spacing

- Corner radius: `--radius-lg: 24px` (cards, modals, hero panels), `--radius-md: 16px` (buttons, inputs, chips), `--radius-sm: 10px` (badges, small chips). Never use square corners anywhere except table cell dividers.
- Shadows — soft, warm-tinted, never pure black:
  - `--shadow-sm: 0 1px 2px rgba(53,53,53,0.06)`
  - `--shadow-md: 0 8px 24px -8px rgba(53,53,53,0.12)`
  - `--shadow-lg: 0 24px 60px -16px rgba(36,97,59,0.18)` (tinted with `--default` for cards that "float" — resource cards, course cards)
  - `--shadow-glow-primary: 0 0 40px var(--glow-primary)` (hover state on primary CTAs)
- Borders: 1px `--border`, used sparingly — prefer shadow-based separation over borders. Borders only on: input fields, table rows, and the command palette.
- Spacing scale: base unit 4px, but **compositionally** use generous multiples — sections are separated by 96–160px on desktop, cards have 24–32px internal padding, never less than 16px padding on any interactive container. "Premium spacing" means whitespace is the primary hierarchy tool, more than color or size.
- Grid: 12-column, max content width 1440px, gutter 24px. Mobile: 4-column, gutter 16px, side margin 20px.

---

## 3. Motion System — Core Principles

Motion is not decoration here; it *is* the information architecture. Every hierarchy transition (College→Dept→Semester→Course→Session→Resource) must read as "the camera moved deeper," not "a new page loaded."

### 3.1 Timing & Easing tokens

```ts
// tailwind.config.ts / motion tokens
export const motion = {
  duration: {
    micro: 0.12,      // hover, press, icon toggles
    fast: 0.22,       // dropdowns, tooltips, small popovers
    base: 0.38,       // card hover-lift, tab switches, accordions
    layer: 0.55,      // page-to-page "zoom" transitions, modal open/close
    cinematic: 0.9,   // landing hero entrance, first paint choreography
  },
  ease: {
    standard: [0.22, 1, 0.36, 1],     // Apple-esque decelerate — default for almost everything
    entrance: [0.16, 1, 0.3, 1],       // elements arriving on screen
    exit: [0.4, 0, 1, 1],              // elements leaving — snappier, no lingering
    spring: { type: "spring", stiffness: 260, damping: 24, mass: 0.9 }, // buttons, cards, elastic expansion
    springSoft: { type: "spring", stiffness: 170, damping: 26, mass: 1 }, // modals, sheets
  },
};
```

Global rule: **nothing animates longer than 900ms**, and only the landing-page hero choreography is allowed to approach that ceiling. Everything a user *waits on* to proceed (page transitions, modal open) must resolve in ≤550ms. Respect `prefers-reduced-motion`: fall back to a 150ms opacity crossfade for every transition described below when it's set.

### 3.2 The "Zoom Into" Navigation Pattern (signature interaction)

This is the core, repeated pattern for every hierarchy descent (Landing→Auth, College card→Department, Department card→Semester, Semester→Course, Course→Resource Explorer).

Implementation with Framer Motion shared layout:

1. The clicked card (e.g. a Department card) has a stable `layoutId` (e.g. `layoutId={`dept-card-${id}`}`).
2. On click: card's container morphs (via `layout` prop, animated by Framer Motion's FLIP-based engine) from its grid position/size into the destination page's hero header position/size — same element, not a new one.
3. Simultaneously:
   - Background blurs and darkens (`backdrop-filter: blur(0→24px)`, overlay opacity `0→0.4`) over `duration.layer`, easing `standard`.
   - Everything *except* the clicked card fades + scales down slightly (`scale: 1→0.96`, `opacity: 1→0`) over `duration.base` — this is the "camera pushing past them" cue.
   - The clicked card's content (title, thumbnail/icon) morphs into the new page's title/hero treatment using matching `layoutId`s on the title text and icon/thumbnail specifically, not just the outer card.
4. New page content (list of Semesters, list of Courses, etc.) enters with a staggered fade+rise (`y: 16→0, opacity: 0→1`, `staggerChildren: 0.04`), starting only after the morph settles (~70% through the transition, not after).
5. Breadcrumb bar animates the new segment in via horizontal slide (`x: -8→0, opacity 0→1`) synced with step 4.

This same choreography powers: Login button → Auth page zoom, Department card → Semester, Semester → Course, Course → Resource Explorer. Do not build five different transition components — build **one** `<ZoomTransitionLink>` wrapper (or a shared `useZoomNavigation` hook) parameterized by source/destination `layoutId` pairs, and reuse it at every hierarchy level.

### 3.3 Micro-interactions (apply to every interactive element, no exceptions)

- **Hover lift**: `translateY(-2px to -4px)` + shadow steps from `--shadow-sm`→`--shadow-md`, `duration.base`, `ease.standard`. Applies to: cards, list rows in Resource Explorer, nav items.
- **Soft glow**: on primary buttons and the active nav item, add `box-shadow: var(--shadow-glow-primary)` on hover, fading in over `duration.fast`.
- **Press**: `scale(0.97)`, `duration.micro`, spring easing — every clickable element compresses slightly on `:active`/`onTapStart`.
- **Elastic card expansion**: used when a card expands inline (e.g. a Resource card expanding to show description/metadata without navigating) — `ease.spring`, height auto via Framer Motion's `AnimatePresence`+measured height, never `height: auto` animated directly in CSS.
- **Icon toggles** (bookmark, like, expand chevrons): `duration.micro`, scale bounce (`1→1.2→1`) on activation.
- **Focus states**: 2px ring in `--primary` at 40% opacity, offset 2px — always visible for keyboard nav, must pass WCAG regardless of the aesthetic minimalism elsewhere.

### 3.4 Ambient / atmospheric layer

- **Floating ambient particles**: on Landing and Auth pages only — 12–20 small soft-blurred circles (radial gradient `--primary`/`--accent` at 8–14% opacity, size 40–160px), drifting slowly (translate + slight rotate, 20–40s loops, `ease: linear`, randomized phase per particle so they never sync). Implement as absolutely-positioned divs in a `motion.div` loop, or a lightweight canvas if performance requires — but cap total particle count so it never impacts input latency. Pause via `IntersectionObserver` when the section isn't in view.
- **Parallax backgrounds**: hero sections and College/Department landing headers — background layer moves at 0.3–0.5x scroll speed relative to foreground content, implemented via `useScroll` + `useTransform` (Framer Motion) tied to Lenis scroll position, not native scroll listener (avoids jank).
- **Blur-to-focus transitions**: used when content loads or a modal reveals detail — element starts at `filter: blur(8px)`, `opacity: 0`, `scale: 1.02`, animates to `blur(0)`, `opacity: 1`, `scale: 1` over `duration.base`. Use for: PDF preview appearing, Search results populating, Profile activity cards on first load.
- **Noise texture**: applied once, globally, to `<body>` background, static (not animated), 3% opacity, blend-mode overlay — gives the parchment `--bg` tactile depth without being visible as "grain" consciously.

### 3.5 Command palette animation

- Trigger: `⌘K` / `Ctrl+K` or a visible search pill in nav.
- Backdrop: fades in `duration.fast`, `--glow` blur 0→16px.
- Panel: enters with `scale: 0.96→1`, `opacity: 0→1`, `y: -8→0`, `ease.springSoft`, glass surface (`--glass-bg`, `--glass-border`, blur 24px).
- List items: stagger in (`staggerChildren: 0.02`), and re-filter on keystroke with a crossfade (not a layout jump) — use `AnimatePresence mode="popLayout"`.
- Selecting a result that is a hierarchy destination (a Course, a Resource) triggers the **same zoom-into pattern** from 3.2, not a hard navigation — the palette closes while the destination's shared element grows from the palette row's position.

### 3.6 Animated breadcrumbs

- Breadcrumb bar sits directly under the top nav, always visible on authenticated pages below Landing/Auth.
- Each segment (College / Department / Semester / Course / Session) is a small pill, current segment styled with `--primary` text + `--surface-2` background, past segments muted-gray, future/inactive segments not rendered until reached.
- On navigation, the new segment slides in from the right (`x: 12→0, opacity 0→1`, `duration.fast`) while, if the trail is now too long for the viewport, the earliest segment collapses into a "…" overflow menu (shadcn `DropdownMenu`) rather than wrapping or shrinking text.

### 3.7 Context-aware page transitions (fallback, non-hierarchy navigations)

For navigations that are *not* a hierarchy descent (e.g. Dashboard → Profile, Course → Discussion tab, any dashboard-to-dashboard move), do not use the full zoom pattern — it's reserved for the knowledge-tree. Instead use a lighter **directional cross-fade**:
- Forward (deeper/rightward nav, e.g. clicking into a tab): incoming content `x: 16→0, opacity 0→1`; outgoing `x: 0→-16, opacity 1→0`. Both `duration.base`, `ease.standard`, running concurrently (not sequential).
- Backward (breadcrumb click, browser back): reverse the above.
- Modal/sheet opens (Upload Resource, Compose Notice, Personal Share composer, Verification review): shadcn `Dialog`/`Sheet` defaults overridden with `ease.springSoft`, backdrop blur per 3.4.

---

## 4. Page-by-Page Specification

For each page: layout intent, key components (map to shadcn where applicable), and the specific motion behaviors from Section 3 that apply.

### 4.1 Landing Page (public)
- Full-bleed hero on `--default` dark background, parallax + ambient particles (3.4), `display-xl` headline, `body-lg` subhead, single primary CTA ("Explore Resources") + secondary ghost CTA ("Log in").
- Below the fold: horizontally-scrolling (Lenis-smooth) showcase of College logos/cards; a 3-step "how it works" section with scroll-triggered reveal (`blur-to-focus`, staggered per step); testimonial/stat strip; footer.
- The Login/CTA button, when clicked, is the literal trigger for the Landing→Auth zoom transition (3.2) — treat the button itself as the shared element that expands to become the auth panel's container.

### 4.2 Login
- Centered glass panel (`--glass-bg`, 480px max width) floating over a blurred/parallax continuation of the landing background — the world doesn't fully disappear, reinforcing "you zoomed into a room within the universe."
- shadcn `Form` + `Input` + `Button`. Inline validation via zod, error messages slide+fade in below field (`duration.fast`).
- College binding is mandatory at the account level (per PRD Section 4) — login itself doesn't ask for college (that's registration), but show a small "Verified for [College Name]" chip under the email field once the domain/account resolves, if feasible, to reinforce the binding concept.
- Link to Register with a subtle underline-grow hover.

### 4.3 Register
- Same glass panel language as Login, taller, multi-step (shadcn `Tabs` or a custom step indicator) — Step 1: identity + credentials, Step 2: **College → Department → Semester → Course → Session** cascading selects (each select populates the next with a blur-to-focus swap, not a jarring reload), Step 3: confirmation + "Pending verification" state explanation.
- On submit, show the account's state clearly as a status chip: **Pending** (gray, clock icon) — set expectation that a CR/Sub Admin/Owner Admin verification unlocks private access (per PRD Section 4). This is not an error state — style it calm and informative, not red.

### 4.4 Student Dashboard
- Header: greeting + role/verification badge + current classroom unit (Dept + Session) pill.
- Primary layout: large "Continue where you left off" resource row (horizontal scroll cards with hover-lift), then a grid of entry points as large tappable tiles: Resources, Notices (with unread count in `--accent`), Discussions, Personal Shares (only shown if any addressed to them), Profile.
- Each tile uses the `layoutId` shared-element pattern to zoom into its destination (per 3.2/3.7 depending on whether it's a hierarchy or a flat nav — Resources tile is hierarchy-deep, so use 3.2; Notices/Discussions/Profile are flat, use 3.7).
- Empty/pending state: if unverified, show a calm full-width banner (not a blocking modal) explaining pending verification, with the classroom unit's CRs named as who to contact.

### 4.5 Resource Explorer (College → Department → Semester → Course → Session tree)
- This is the "knowledge universe" screen. Left rail: collapsible tree/breadcrumb of the hierarchy (desktop only; becomes a bottom sheet trigger on mobile). Main area: large card grid, one level at a time (e.g. Departments as cards when inside a College).
- Cards: `--surface` background, `--radius-lg`, `--shadow-md` resting → `--shadow-lg` + lift on hover, large icon or generated abstract gradient thumbnail (per department/subject, not literal photos), title in `heading-md`, meta line in `body-sm` muted (e.g. "6 semesters · 42 courses").
- Clicking a card triggers the zoom-into pattern (3.2) into the next level. At the Session level, the "cards" become resource-type tiles (Lectures / Notes / PYQs / Tutorials / Software) per PRD Section 5.
- Visibility metadata (public/private) shown as a small lock/globe Lucide icon on each resource row — public resources are viewable logged-out, private require verified membership; never fake this distinction, reflect actual auth state.
- CR-only affordances (Upload, Edit, Delete) render only for CR role on their own classroom unit — as `--accent`-colored controls in a persistent but unobtrusive toolbar, not scattered per-item to avoid clutter for the read-only majority.

### 4.6 Course Detail
- Hero header uses the shared-element title/icon that just "arrived" from the Semester zoom.
- Tabs (shadcn `Tabs`, underline style, `ease.standard` sliding indicator): Overview · Resources · Discussion · Notices.
- Overview: course metadata, session info, resource-count stat cards.
- This page is the jumping-off point for the Course→Resource Explorer zoom described in the brief.

### 4.7 PDF Viewer
- Full-screen immersive mode, dark chrome (`--default` background regardless of light/dark theme — a PDF is easier to read in a neutral dark frame) with a floating glass toolbar (zoom, page nav, download, close) that auto-hides after 2.5s of inactivity and reappears on mouse move/tap (fade, `duration.fast`).
- Opening a PDF from a resource row/card uses a **contained zoom**: the row/card's thumbnail scales up and fades into the viewer's document canvas (`layoutId` shared element again) rather than a hard route change — reinforces "you moved deeper into this one document."
- Closing reverses the same transition back to the exact scroll position in Resource Explorer.

### 4.8 Search Experience
- Two entry points: persistent nav search pill (opens the `cmdk` command palette per 3.5) and a dedicated `/search` page for public, unauthenticated deep search.
- Dedicated page: large centered input at top (`display-md`-adjacent size, generous padding), filter chips below (College/Dept/Semester/Type — shadcn `ToggleGroup`), results as the same card language as Resource Explorer for consistency, with `blur-to-focus` entrance as results stream in.
- No-results state: illustrative (simple line-art SVG, on-brand colors, no stock imagery), never a plain "No results" text block.

### 4.9 Discussion Page
- Two-pane layout (desktop): left = list of groups within the classroom unit (course-linked groups pinned first, then general groups), right = active thread.
- Message list: minimal, editorial — sender name in `heading` weight, message in `body-md`, timestamp in `body-sm` faint. New messages arrive with a soft rise+fade (`y:6→0`), never a jarring pop.
- Course-linked groups show the linked course as a small chip at the top of the thread (enforces the PRD's "max 1 group per course" rule visually — clicking it zooms back into that Course Detail page).
- CR-only controls (create group, add/remove member) appear as a `+`/gear affordance in the group list header — visible only to CR role for that unit.
- Mobile: single-pane, group list is a full-screen sheet that slides away (3.7 directional) when a thread is opened.

### 4.10 Notice Board
- Feed layout, scoped strictly to the viewer's own Department + Session (never show a cross-unit toggle — there is nothing to toggle to, per PRD 6.2.2).
- Each notice: card with author (one of the two CRs, shown by name + CR badge), timestamp, body (`body-md`, max width capped for readability), edit/delete affordances only for the authoring CR or their co-CR.
- Compose (CR only): floating `--accent` action button → sheet/dialog per 3.7 with a simple rich-text-lite composer (bold/italic/list, shadcn-styled toolbar).
- Unread notices get a small `--accent` dot; read ones lose it with a gentle fade once viewed (on scroll-into-view via IntersectionObserver, not on click).

### 4.11 Profile
- Header: avatar (generated initials-avatar with a soft gradient background using `--primary`/`--secondary` if no photo), name, role badge, verification status chip, college/department/semester/course/session breadcrumb-style meta line.
- Body: activity summary cards (resources uploaded, notices posted — CR only; discussion participation — everyone) as small stat tiles with count-up number animation on first view (`duration.base`, easing `standard`, using a simple `useEffect` + `requestAnimationFrame` or a lightweight counting hook).
- Personal Shares addressed to the viewer surface here too (Student view) as a private, clearly-separated section — never mixed visually with Notices or Discussion, per PRD's explicit separation requirement.

### 4.12 CR Dashboard
- "Control room" density (see Section 7) — this user checks this screen often and needs speed over spectacle.
- Sections: Verification queue (pending Students for their unit, approve/reject inline with optimistic UI), Resource manager (table/grid toggle, full CRUD), Notice composer shortcut, Discussion group manager, Personal Share composer shortcut.
- Pending verification count and any unread items surface as `--accent` badges in a persistent left sidebar nav, consistent with Student Dashboard's badge language.

### 4.13 Sub Admin Dashboard
- College-scoped structure view: a visual tree/org-chart of Departments → Sessions → assigned CRs, with unassigned/single-CR classroom units visually flagged (e.g. `--warning` outline) so gaps are obvious at a glance.
- CR promote/demote: table of verified Students eligible for promotion within a selected classroom unit, promote/demote as a confirm-dialog action (never a silent one-click — role changes always get a shadcn `AlertDialog` confirmation).
- College-level stats as a compact `recharts` row (active users, resource counts, verification turnaround) — smaller and fewer charts than Owner Admin's view.

### 4.14 Owner Admin Dashboard
- Platform-wide structure view (all colleges), Sub Admin management (promote/demote/appoint), the singular high-stakes **ownership transfer** action gated behind a distinct, deliberately heavier confirmation flow (type-to-confirm pattern, not just a checkbox — this is the one irreversible, platform-critical action in the whole system).
- Global audit log: reverse-chronological table of role changes (who/what/when), filterable, exportable.
- Owner Admin Analytics (Section 6.2.7 of PRD): full `recharts` suite — DAU/WAU/MAU, registration/verification funnel, CR coverage map (list of under-covered classroom units), storage volume, notice reach, discussion activity, **Personal/Confidential Share counts only — never content, ever, with no UI path that could expose it**. Make this omission visible/intentional in the design (e.g. a small locked-icon note: "Content is never visible — counts only, always").

### 4.15 Mobile Responsive Layouts
- Bottom tab bar (not a hamburger-only pattern) for the 4–5 most-used destinations per role: Student = Dashboard/Resources/Discussions/Notices/Profile; CR = adds a central `+` quick-action (accent-colored, elevated) for Upload/Notice/Share.
- The zoom-into pattern (3.2) still applies on mobile but simplifies: full-screen card-to-page morph without the "other cards fade back" step (too busy on small screens) — just the clicked card grows to fill the viewport.
- Sheets (shadcn `Sheet`, bottom-anchored) replace desktop dialogs/side panels universally on mobile.
- Touch targets minimum 44×44px. Hover-lift micro-interactions are disabled on touch (no hover state); replace with the press/scale micro-interaction only.
- Command palette becomes a full-screen search sheet, not a floating panel.

---

## 5. Component Inventory (build once, reuse everywhere)

Build these as shared, themed wrappers around shadcn primitives — do not restyle shadcn components ad hoc per page.

- `<ZoomCard>` — the card used at every hierarchy level (College/Dept/Semester/Course/Session/Resource-type), parameterized by icon/thumbnail, title, meta line, and `layoutId`.
- `<RoleBadge>` — Student/CR/SubAdmin/OwnerAdmin, per the color mapping in 2.1.
- `<VerificationChip>` — Pending/Verified states.
- `<HierarchyBreadcrumb>` — animated per 3.6.
- `<ZoomTransitionLink>` / `useZoomNavigation()` — the single reusable implementation of Section 3.2.
- `<StatTile>` — count-up number + label, used in Profile, Sub Admin, Owner Admin dashboards.
- `<EmptyState>` — illustrative, on-brand, reused for no-results/no-notices/no-messages/etc.
- `<ConfirmActionDialog>` — wraps shadcn `AlertDialog`, used for every role-change and delete action.
- `<AmbientParticles>` and `<ParallaxLayer>` — the two atmospheric primitives from 3.4, used only where specified (Landing/Auth), not sprinkled elsewhere.

---

## 6. Iconography

- Lucide only, stroke width 1.75, default size 20px (16px in dense dashboard tables, 24px in nav/hero contexts).
- Suggested mappings: College = `Building2`, Department = `LayoutGrid`, Semester = `CalendarDays`, Course = `BookOpen`, Session = `Users`, Lectures = `PlayCircle`, Notes = `FileText`, PYQs = `History`, Tutorials = `GraduationCap`, Software = `Package`, Notices = `Megaphone`, Discussion = `MessagesSquare`, Personal Share = `Lock`, Verification = `ShieldCheck`, Owner Admin = `Crown`.
- Never use filled/duotone icon variants — outline only, to keep the minimal-iconography instruction from the brief.

---

## 7. Two Visual Modes: "Explore" vs "Control Room"

To reconcile "cinematic knowledge universe" with "a CR/Sub Admin/Owner Admin needs to work fast," the product has two coherent but distinct visual densities, sharing the same tokens/components:

| | **Explore mode** (Landing, Auth, Student Dashboard, Resource Explorer, Course Detail, Search, PDF Viewer) | **Control Room mode** (CR/Sub Admin/Owner Admin Dashboards) |
|---|---|---|
| Spacing | Maximal — large cards, generous gaps | Denser — more compact rows/tables, still ≥16px padding |
| Motion | Full cinematic system (3.2–3.6) | Micro-interactions + 3.7 cross-fades only; **no** zoom-into pattern, **no** ambient particles |
| Layout | Card-grid, hero-led | Table/list-led, sidebar nav |
| Color use | More `--bg`/parchment surface visible | More `--surface`/white, less exposed background |

Never apply Control Room density to Explore pages or vice versa — the contrast is intentional and reinforces "browsing a universe" vs "getting work done."

---

## 8. Accessibility & Performance Guardrails (non-negotiable)

- Respect `prefers-reduced-motion`: all Section 3 animations degrade to a 150ms opacity fade.
- Color contrast: verify `--text` on `--bg` and all badge combinations meet WCAG AA (4.5:1 for body text). `--accent` (#F18F01) on `--bg` (#F5ECD7) is borderline — always pair `--accent` text with a dark background chip rather than using it as text-on-parchment directly.
- All shared-element/zoom transitions must have a non-JS fallback route (a plain Next.js route change) if Framer Motion fails to load — never block navigation on animation.
- Lazy-load below-the-fold landing sections and the ambient particle layer; never let decorative motion cost more than ~5ms per frame — profile with React DevTools before shipping.
- PDF viewer and discussion message lists must virtualize long lists (react-window or similar) — motion polish must never come at the cost of scroll performance on long resource/message lists.

---

## 9. What "Done" Looks Like

A coding agent implementing this should be able to self-check against:
1. Every hierarchy click (College→Dept→Semester→Course→Session→Resource) uses the same underlying `<ZoomTransitionLink>` — not five bespoke transition implementations.
2. Every interactive element has hover-lift + soft-glow + press states — none feel static or default-browser.
3. Colors never leave the token list in Section 2.1 — no ad hoc hex codes in components.
4. CR-only, Sub Admin-only, and Owner Admin-only actions are never visible (not just disabled) to roles without that permission, matching the PRD's Authorization Matrix (Section 11 of the PRD) exactly.
5. Personal/Confidential Shares never appear in any Notice or Discussion UI surface, and never expose content in any Owner Admin analytics view — counts only.
6. Explore-mode pages feel spacious and cinematic; Control Room pages feel fast and dense — a reviewer should immediately be able to tell which mode any screenshot belongs to.