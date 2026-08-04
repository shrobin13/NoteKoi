# UI/UX Plan — Resource Sharing Platform (v4)

> **Source of truth.** This document is the ONLY planning input for `wireframe.md` and everything the frontend team builds after it. It is derived strictly from `userflow.md` (v6) and `schema.prisma` — the same two files that produced `backendWorkProcess.md`. Every screen, role, state, and label referenced here traces to a cited `§x.x` section or a named Prisma model/enum. Nothing here invents a feature, role, workflow, or page. Every point that the two source documents leave unspecified is isolated in **Section 17 — Open Questions**, not silently decided by aesthetic preference.
>
> This document does not contain wireframes, mockups, components, or code. It is the reasoning layer that must exist *before* a wireframe can be drawn responsibly.

> **v2 changelog.** Sections 18–25 are new. They introduce **no** screen, role, feature, or workflow beyond what Sections 1–17 already establish — each works strictly within the existing site map (§4.1), component list (§10), and token values (§8), making methodology explicit that was previously implicit: full user-journey traces across existing screens, an explicit cognitive-load budget, a formal action-priority taxonomy, a per-component state matrix, data-heavy/admin interaction patterns, a consolidated design-token reference, performance constraints, and expanded AI implementation guardrails. Anywhere a gap surfaced a genuinely new ambiguity, it was added to Section 17 rather than silently resolved — same discipline as v1. Sections 1–17 and every internal `§x.x` reference inside them are otherwise unchanged from v1.

> **v3 changelog.** Sections 26–27 are new, plus targeted edits inside Section 1 (a sixth core principle) and Section 4.2 (a pointer to the new hero treatment). This pass answers a specific product direction: the content-facing surfaces (Discover, Resource Detail, onboarding) should feel like a considered editorial/marketing experience — closer to how Apple presents a product — not a utility dashboard, while the trust-and-moderation surfaces (queues, admin, audit) stay exactly as restrained and Linear-fast as Sections 1 and 5 already require. The mechanism for this is **Motion.dev** (the `motion` package) as the app's single animation engine, replacing the previously engine-agnostic descriptions in Section 9 with concrete spring physics, scroll-linked reveals, and shared-layout transitions. Nothing in Sections 1–25 is weakened: Section 1's "state is never hidden" and Section 5's "density is a feature" for queues are explicitly reaffirmed as taking precedence over any cinematic treatment (§26.5). One new item was added to Section 17 (Open Question 12) where this direction touches a genuine content-selection ambiguity the source documents don't resolve.

> **v4 changelog.** Sections 28–29 are new. They specify a single, app-wide navigation pattern — **zoom-through (origin-scale) page transitions** — where the clicked trigger (a button, card, or nav item) expands via a Motion.dev `layoutId` interpolation to fill the viewport and become the destination page, and back navigation plays the identical transform in reverse. This **supersedes** Section 9's generic "Page transitions: cross-fade + slight upward slide" row app-wide (§28.7) — that row's underlying reasoning is preserved, not discarded, since watching a destination emerge from the exact thing you clicked is a stronger version of "signals new context without disorienting," not a departure from it. The pattern is universal in *shape* but not in *speed*: content surfaces get the fuller `spring-smooth` zoom, while moderation/admin/audit surfaces get the same pattern at `spring-snappy` pace specifically so Section 1's Linear-speed promise to moderators and Section 5's density reasoning are never compromised (§28.5) — this is a reconciliation, not an exception carved out after the fact. Drawers, dialogs, sheets, and destructive confirmations are explicitly excluded (§28.6) since they aren't navigations. No new Open Question was needed — this is a direct product instruction, not a source-document ambiguity.

---

## 1. Design Philosophy

**What this product actually is.** Underneath the polish, this is a *trust and moderation* system wearing the clothes of a file-sharing app. Every resource carries a visible state (`Pending → In Review → Approved/Rejected → …`), a visible scope (`COLLEGE` vs `PLATFORM`), and a visible chain of custody (uploader, moderator, promotion history). The UI's job is to make that trust machinery legible at a glance, for six different audiences, without ever looking like a compliance tool. That is the single hardest constraint on this design, and it is the lens every later decision passes through.

**Why we're referencing Linear, Raycast, Arc, Vercel, Notion, Apple, Dropbox Dash, Stripe, Figma — and what we take from each:**
- **Linear** — speed as a design value, not a slogan. Keyboard-first, command palette, instant transitions, no "please wait" screens for anything the app itself can compute quickly. We borrow this for moderation queues and search, where moderators (CR/Co-CR, Sub Admin) work through many items in a session and every extra click compounds.
- **Notion** — calm editorial typography treats content as *documents*, not database rows. A `Resource` here has a title, description, tags, uploader, type — it deserves a reading layout, not a spreadsheet cell. We borrow this for Resource Detail.
- **Arc Browser** — the idea of "spaces" for different contexts. A Student who is also a CR/Co-CR is really operating in two contexts (their own uploads vs. their moderation queue). We borrow the *feel* of switching contexts cleanly, without borrowing tabs-as-browser-metaphor literally.
- **Stripe Dashboard** — proof that dense, numbers-heavy admin data (analytics, audit logs) can still feel premium through restraint: generous whitespace *around* dense tables, not dense whitespace *inside* them. We borrow this for Sub Admin/Platform Admin analytics.
- **Vercel / Raycast** — dark-mode-native, monospace accents for identifiers/hashes/IDs, subtle borders instead of heavy shadows. We borrow the general "engineering premium" visual register for anything Platform-Admin/audit-facing.
- **Figma / Apple (chrome)** — contextual toolbars that appear only when relevant, and disappear when not. We borrow this for resource-detail actions (report, recommend-for-promotion, edit) which are role- and state-dependent and must never show an action the current viewer cannot take.
- **Apple (content presentation)** — beyond chrome restraint, apple.com's product pages are the reference for how *content itself* is presented: one confident idea per screenful, large deliberate typography, generous whitespace used as a storytelling device rather than empty space, and motion that reveals meaning as you scroll instead of decorating a static page. We borrow this specifically for how a Resource is introduced on Discover and how it opens into Resource Detail (§26) — never for chrome, controls, or anything queue/admin-facing, which stay Linear-fast and Figma-restrained per the bullet above.
- **Dropbox Dash** — unified, cross-source search as a first-class surface rather than a buried input. We borrow this for the platform's own cross-college, cross-course search.

**Core principles that follow from this:**
1. **State is never hidden.** A resource's moderation state and visibility scope are always visible without a click — not on hover, not behind an icon tooltip.
2. **One primary action per screen.** Every screen has exactly one emphasized action; everything else is secondary or tertiary, visually.
3. **Progressive disclosure, not information hiding.** Detail (moderator reasons, version history, audit justification notes) is one click away, never buried two or three levels deep, never truncated without a way to read the whole thing.
4. **Roles change what you see, not how the app behaves.** The same resource card, the same detail page, the same design language is reused across Guest/Student/Teacher/CR/Sub Admin/Platform Admin — only the *available actions* change. This is what makes six roles feel like one coherent product instead of six different apps.
5. **Content-first, chrome-last.** Navigation, sidebars, and toolbars are as quiet as possible so that the resource — a document someone needs before an exam — is what a user's eyes land on first.
6. **Experience the content, don't just retrieve it (content surfaces only).** On Discover, Resource Detail, and onboarding, a resource is introduced with the same confidence a product marketing page gives a product — not because it needs selling, but because a student's exam notes deserve to feel like something worth opening, not a row in a spreadsheet. This principle is deliberately scoped: it never touches a moderation queue, an admin table, or an audit screen, where principle 1 and Section 5's density-is-a-feature reasoning still govern completely. Full implementation: Section 26.

---

## 2. User Experience Principles

Before any layout decision, every screen in this plan was interrogated with the same six questions. This section states the *general* answers that recur across the product; Section 12 (Page Prioritization) states the *specific* answer per screen. See also Section 18 (journeys, which chain these principles across screens) and Section 19 (the explicit cognitive-load budget behind "how do we reduce cognitive load," below).

- **Who is using this, and under what pressure?** Students and Teachers are usually here transactionally and often time-pressured (before a class, before an exam) — optimize for "find it and leave." CR/Co-CR and Sub Admin are here repeatedly, in short bursts, working through a queue — optimize for "clear the queue with minimum clicks per item." Platform Admin is here rarely, for structural or exceptional actions — optimize for "confidence and auditability over speed."
- **What's most important, and what should stay hidden?** For a Student/Teacher: the resource itself, its state if it's theirs, and how to get more of what they need (search, browse). Hidden until asked for: moderator identity details beyond role, full audit trails, other colleges' internals. For a moderator: the queue item's content and the decision controls. Hidden until asked for: unrelated queue items, resolved history (available in one tap, not on-screen by default).
- **Which actions deserve emphasis?** Anything that is this screen's entire reason for existing (Approve/Reject on a moderation item, Submit on an upload form, Recommend for Platform on an eligible resource) is the one primary button. Anything reversible or exploratory (filter, sort, view version history) is secondary. See Section 20 for the full action-priority taxonomy.
- **How do we reduce cognitive load?** By never asking a user to hold context across screens. Duplicate-hash warnings, department-scope errors, and PYQ-session requirements all surface *inline, at the moment of the relevant field*, not as a rejection after submission. Section 19 turns this into explicit, checkable budgets rather than a general aspiration.
- **How do we reduce scrolling and navigation?** Queues and browse lists default to the narrowest useful scope (own Department+Session for CR/Co-CR, own college for Sub Admin, per §0.3) so the list itself is short by default, with an explicit, clearly-labeled way to widen it — never the reverse.

---

## 3. Navigation Architecture

Navigation is designed from first principles around one fact: **six roles share one app, but no single role needs six roles' worth of navigation at once.** A Student never needs to see "Moderate," a Guest never needs to see "My Uploads." Navigation reveals itself progressively as capability increases.

### 3.1 Global Navigation (always present, every role)
A persistent, minimal shell containing exactly:
- **Discover / Home** — the browse-and-search entry point (§2.1, §2.2).
- **Search** — always reachable, never nested (§2.2).
- **Upload** — a single, prominent action (FAB on mobile, button on desktop) — present for every authenticated role that can upload (Student, Teacher, Sub Admin, Platform Admin per §3.1–§3.3); hidden entirely for Guest, who is prompted to sign in if tapped.
- **Notifications** — bell icon with unread-count badge (§3.8).
- **Profile / Account** — avatar, role badge, verification status, settings, logout.

### 3.2 Context Navigation (appears only when the role/elevation is present)
- **My Uploads** — appears for Student/Teacher/Sub Admin/Platform Admin (anyone who can upload) — never for Guest.
- **Moderate** — appears only when the signed-in user currently has an *active* elevation or role that owns a queue: active CR/Co-CR (§5.2), Sub Admin (§5.3). This is not a role-based nav item, it's an *authority*-based one — a Student who is not currently an active CR/Co-CR never sees it, even though "Student" and "CR/Co-CR" are the same underlying account (§0.2).
- **Manage** (Sub Admin only) — CR/Co-CR appointments, Teacher verification, Student verification fallback, Analytics for their college.
- **Administration** (Platform Admin only) — Colleges, Departments, Sessions, Courses, Sub Admin appointments, Emergency Appointments, CRUD Override, Promotion Override, platform-wide Analytics.

### 3.3 Breadcrumbs
Used only for the genuinely hierarchical browse path (§2.1): `Department → Session → Course → Resource`. Never used for flat lists (queues, notifications, uploads) — those get a simple page title instead, since a breadcrumb implies a parent/child relationship that doesn't exist there.

### 3.4 Search & Command Palette
- **Search** (§2.2) is a persistent, always-reachable input — not a page you navigate to, a field you invoke from anywhere (`/` key or tap the search icon). Matches course name, keyword, resource type; every result shows its visibility label inline (§2.2).
- **Command Palette** (`⌘K` / `Ctrl+K`, desktop only) is a superset of search for power users (moderators especially): jump to Moderation Queue, jump to My Uploads, jump to a specific course, trigger Upload — all without leaving keyboard focus. This is a UX accelerator, not a new feature surface; every action it exposes already exists elsewhere in the nav. Its moderator-specific keyboard accelerators are itemized in Section 22.3.

### 3.5 Recently Visited (client-side convenience only)
A short "recently viewed courses/resources" strip on Discover, stored client-side (not a backend feature — no such model exists in `schema.prisma`; see Section 17). Purely a navigation shortcut, never a source of truth for anything.

### 3.6 Back Behavior
Standard platform back behavior (browser back / Android system back / iOS swipe-back) always returns to the *exact prior scroll position and filter state* of a list — never resets a query. This matters most for moderators paging through a queue and Students browsing search results.

### 3.7 Empty States
Every navigable list has a designed empty state (Section 8.11) — never a bare "No results" line. Empty states always explain *why* (e.g., "No pending items in your Department+Session queue") and offer the one relevant next action (e.g., "Browse the college's resources instead").

---

## 4. Information Architecture

### 4.1 Full Site Map (every screen this product needs — no more, no fewer)

| Screen | Who sees it | Source |
|---|---|---|
| Sign In | Guest | §1.6 |
| Register — Student | Guest | §1.2 |
| Register — Teacher | Guest | §1.3 |
| Forgot / Reset Password | Guest, any authenticated role | §1.6 |
| Verification Pending (Student) | Student, `isVerified=false` | §1.2 |
| Verification Pending (Teacher) | Teacher, `PENDING_VERIFICATION` | §1.3, §5.8 |
| Discover / Home | Everyone (content scoped per §0.3) | §2.1, §4.2, §4.3 |
| Search Results | Everyone | §2.2 |
| Browse: Department → Session → Course | Everyone | §2.1, §2.3 |
| Resource Detail | Everyone with view access (§0.3) | §4.1 |
| Version History | Everyone, scoped per §6 | §6 |
| Upload Flow | Student, Teacher, Sub Admin, Platform Admin | §3.1–§3.4 |
| My Uploads | Student, Teacher, Sub Admin, Platform Admin | §3.9 |
| Notifications | Everyone authenticated | §3.8 |
| Profile / Account Settings | Everyone authenticated | §1.6 |
| Moderation Queue — CR/Co-CR | Active CR/Co-CR | §5.2 |
| Student Verification Queue | Active CR/Co-CR (own scope) / Sub Admin (fallback) | §0.2, §7.3 |
| Moderation Queue — Sub Admin | Sub Admin | §5.3 |
| Teacher Verification Queue | Sub Admin | §5.8 |
| Promotion Queue (Path A decisions) | Sub Admin | §5.4 |
| CR/Co-CR Management | Sub Admin | §1.4 |
| Sub Admin Analytics | Sub Admin | §7.5, §7.2 |
| Colleges | Platform Admin | §7.1 |
| Departments / Sessions / Courses | Platform Admin | §7.1, §7.4 |
| Sub Admin Management | Platform Admin | §1.5 |
| Emergency Appointment | Platform Admin | §1.4, §1.5 |
| CRUD Override | Platform Admin | §5.9 |
| Promotion Override | Platform Admin | §5.4a |
| Platform Analytics & Override Log | Platform Admin | §7.5 |

No page exists outside this table. If a future request implies a 26th screen, it must trace to a `§` citation before it's added.

### 4.2 Content Hierarchy per Hub
- **Discover** hierarchy: (1) search bar, (2) "continue where you left off" recents strip, (3) Department → Session → Course browse entry, (4) a light "recently approved" or "platform highlights" feed — never buried below a hero banner. **v3 addition:** the "platform highlights" feed in item (4) now opens with one large, editorially-treated spotlight item before the regular grid begins — this is a presentation change to an already-listed piece of content, not a new content source; see Section 26.4 for the full treatment and Section 17's Open Question 12 for the one genuinely open question it surfaces (how the spotlighted item is selected).
- **Resource Detail** hierarchy: (1) title + type icon + visibility badge + state badge (if it's the viewer's own resource or they moderate it), (2) primary action (Download/View), (3) description + tags, (4) uploader + version + date metadata, (5) contextual actions (Report, Recommend for Platform, Edit, Request Deletion, Version History) — only the ones the viewer's role/scope permits.
- **Moderation Queue** hierarchy: (1) scope indicator (which Department+Session or which college this queue covers — always visible, since a moderator must never wonder "am I looking at the right scope"), (2) queue list sorted oldest-first, (3) per-item quick metadata (type, title, uploader role, submitted date, deletion-flag indicator if present), (4) the decision action, always reachable without opening a second screen for the common case.

### 4.3 Entity Model, Restated for Design (not a schema re-derivation — a design lens on it)
The product has exactly one central entity a user cares about: the **Resource**. Every other entity (Department, Session, Course, College) exists only to *classify and scope* a Resource, and every actor entity (Student, Teacher, CR/Co-CR, Sub Admin, Platform Admin) exists only to *act on* a Resource. This asymmetry is why Section 4.2 gives Resource Detail an editorial, document-first treatment while classification entities (Section 5's "Admin CRUD screens") get a plain table-first treatment — a Course doesn't deserve a hero layout, a Resource does. Concretely, for design purposes:
- **Accessed most often:** Resource (view/download), then Course (as a browse waypoint), then queue items (for moderator roles specifically, not the general population).
- **Relationships that must be surfaced, not just stored:** Resource → uploader (always, per §4.1 "displays uploader name, role"); Resource → current state (always, when the viewer has a stake); Resource → version chain (one click away, §6); Resource → moderation/promotion history (one click away, the Approval Timeline, Section 10).
- **Relationships intentionally *not* surfaced by default:** Resource → full audit metadata (justification notes, override actor) — visible only to Platform Admin and only on the specific override/audit surfaces (§7.5), never bleeding into the ordinary Resource Detail view for a Student or Teacher.
- **One-click actions, by design:** Download/View, Report, Version History, Recommend for Platform (when eligible). **Not one-click, by design (require a confirmation step):** Reject-with-reason, Delete/Request Deletion, any Platform Admin override — see Section 14's confirmation-dialog rule for why the friction here is intentional, not an oversight.

---

## 5. Layout Strategy

Every layout choice below states *why*, per the brief's instruction — never "because it looks nice."

- **Discover / Browse pages → card grid, F-pattern reading.** Resources are visually distinguishable primarily by type (a PDF, a video, a PYQ) — a grid of type-iconed cards supports quick visual scanning the way a list of plain text rows would not. F-pattern because users scan left-to-right across a row of cards, then down.
- **Moderation queues → dense list/table, top-to-bottom reading, never a card grid.** A moderator processing 30 pending items needs to compare items at a glance and act fast — a card grid wastes vertical space per item and forces more scrolling. Density here is a feature, not a compromise.
- **Resource Detail → single-column editorial layout, Z-pattern.** This is the one place content is read, not scanned — title top-left, primary action top-right (Z-pattern terminus), then a single reading column below. No sidebar competing for attention.
- **Analytics (Sub Admin / Platform Admin) → generous outer whitespace, dense inner tables/numbers.** Per the Stripe Dashboard reasoning in Section 1: the *page* should feel calm even though the *data* is dense — achieved by whitespace around card containers, not inside them.
- **Admin CRUD screens (Colleges, Departments, Sessions, Courses) → table-first, form-in-drawer.** These are structural, infrequent tasks (§7.1) — a persistent table with an edit action opening a side drawer keeps context (the rest of the list) visible while editing one row, unlike a full-page form that discards that context.
- **Spacing rhythm:** a single 8pt base unit throughout (see Section 8.2 and the consolidated Section 23 token table) applied consistently so that vertical rhythm feels intentional rather than ad hoc — this is what separates "premium" from "generic Bootstrap," per the brief's explicit goal.
- **Alignment:** left-aligned text universally (no centered body copy anywhere except empty-state illustrations and auth screens' single-column forms) — centered text reads as "template," per the brief's stated aversion.
- **Interaction priority:** on every screen, the single highest-priority action sits in the same relative position (top-right on desktop, bottom-fixed on mobile) so users build muscle memory across the whole app rather than hunting per screen. Formalized in Section 20.

---

## 6. Responsive Strategy

- **Breakpoints:** `sm` 0–639px (mobile, primary target), `md` 640–1023px (tablet), `lg` 1024–1439px (desktop), `xl` 1440px+ (wide desktop/analytics). Design and build mobile-first (`sm` styles are the base, larger breakpoints are additive), matching Section 7's mandate.
- **Navigation reflow:** the persistent sidebar (desktop `lg`+) collapses to a bottom navigation bar (`sm`/`md`) — see Section 7.1. "Manage"/"Administration" sections that would be sidebar groups on desktop become a "More" sheet on mobile rather than crowding the bottom bar (which is reserved for the 4–5 highest-frequency destinations only).
- **Tables → stacked cards:** every dense table (moderation queues, admin CRUD lists, analytics) reflows to a stacked-card list below `md` — each "row" becomes a card showing the same fields vertically, with the row's primary action as a full-width button at the card's bottom edge (thumb-reachable).
- **Filters → bottom sheet:** filter controls that sit inline on desktop (chips/dropdowns in the page header) collapse into a single "Filters" trigger opening a bottom sheet on mobile — never a second row of horizontally-scrolling chips, which is easy to miss.
- **Forms:** single-column at every breakpoint (register, upload, edit) — a two-column form is a common template-feeling mistake (Section 15) and provides no benefit even on wide desktop for the field counts this product has.
- **Drawers vs. dialogs:** side drawers (desktop) become bottom sheets (mobile) for the same content — e.g., Resource quick-actions, admin CRUD edit forms. Full dialogs (confirmations) stay centered modals at every breakpoint since they're short and must interrupt, not slide alongside.

---

## 7. Mobile First Strategy

Per the brief: mobile is the primary design target, not a shrink of desktop. Every decision below is made mobile-first, then enhanced for desktop.

### 7.1 Bottom Navigation (mobile primary chrome)
Four destinations, evenly spaced, icon + label, thumb-reachable at the screen's bottom safe area: **Discover, Search, Notifications, Profile.** Upload is deliberately *not* a fifth bottom-nav tab — it's a center-anchored FAB that floats above the bar (see 7.2), because "create" deserves more visual weight than "navigate."

### 7.2 FAB (Upload)
A single floating action button, center-bottom, present on Discover/Browse/Search screens for any role that can upload. It is **context-aware and disappears** on screens where uploading isn't relevant (inside someone else's Resource Detail, inside a Moderation Queue) — an omnipresent FAB that does nothing contextual is exactly the "generic template" pattern the brief asks to avoid.

### 7.3 Thumb Reach & One-Hand Usage
Primary actions (Approve/Reject in moderation, Submit in upload/register forms, the FAB) are placed in the bottom third of the viewport. Secondary/rare actions (filters, sort, "include other colleges" toggle, admin links) live in the top bar, accepting that they require a reach/two-hand action — this is an acceptable tradeoff since they're used far less often per session.

### 7.4 Gesture-Friendly Interactions
- Swipe-to-dismiss on notification items and toasts.
- Swipe actions on a moderation-queue card (swipe right = Approve, swipe left = Reject) as an *accelerator* for the same buttons already on the card — never the only way to perform the action, since gestures aren't discoverable or accessible (Section 13).
- Pull-to-refresh on Discover, Search Results, and every queue.

### 7.5 Drawers & Bottom Sheets
Any desktop side-drawer (filters, quick edit, resource quick-actions) becomes a bottom sheet on mobile — anchored to the bottom edge, draggable to dismiss, respecting the safe area.

### 7.6 Search Accessibility
Search is one tap from anywhere via the bottom nav's Search tab — never nested inside a menu. The mobile search screen opens directly to the keyboard focused, with recent searches shown before typing starts.

### 7.7 Large Touch Targets & Safe Areas
Minimum 44×44pt touch targets everywhere (Section 13.4); bottom nav and FAB respect `env(safe-area-inset-bottom)` on iOS notch/home-indicator devices.

### 7.8 Keyboard Behavior
Forms (register, upload metadata, moderation reason) scroll the focused field above the mobile keyboard automatically; the primary submit action stays visible above the keyboard rather than being pushed off-screen — critical for the Upload flow's title/description fields and the moderator's rejection-reason field.

### 7.9 Mobile Upload Flow
A step-by-step wizard (not one long scrolling form): (1) choose type, (2) pick file or paste YouTube link (§3.3), (3) classification (course, session if PYQ), (4) visibility choice (Teacher only, §3.2) — with each step full-screen, one thumb-reachable "Next," minimizing simultaneous decisions.

### 7.10 Responsive Tables, Filters, Moderation
Already covered structurally in Section 6; the mobile-first implication is that the **stacked-card version is the primary design**, and the desktop table is the "enhancement" layered on top of the same underlying data — not the other way around.

---

## 8. Visual Design System

### 8.1 Typography
A single modern grotesk sans-serif family (system-first stack, e.g. Inter/Geist-class) for both UI and content — no serif, no display font, matching the "editorial but not decorative" brief. One scale, used consistently:

| Token | Size | Use |
|---|---|---|
| Display | 32–40px | Resource Detail title, page-level headers on Discover |
| Heading | 22–24px | Section headers (queue names, "My Uploads") |
| Subheading | 17–18px | Card titles, list item titles |
| Body | 15px | Descriptions, form labels, table cells |
| Caption | 13px | Metadata (dates, uploader, version number), badges |
| Micro | 11px | Timestamps in dense lists, audit-log fine print |

A monospace accent face is reserved for identifiers only — resource IDs, content hashes, justification-note references in Platform Admin screens — echoing the Vercel/Raycast "engineering premium" register from Section 1, and never used for user-facing content.

### 8.2 Spacing Scale
8pt base grid: `4, 8, 12, 16, 24, 32, 48, 64px`. No arbitrary values outside this scale — this is what produces the consistent vertical rhythm called for in Section 5.

### 8.3 Grid System
12-column grid on `lg`+ desktop with a max content width (so analytics/admin tables don't stretch edge-to-edge on ultra-wide monitors); single-column fluid grid below `lg`.

### 8.4 Radius
Two radii only: `8px` (buttons, inputs, small chips/badges) and `16px` (cards, dialogs, sheets) — a restrained two-tier system, not the "one radius per component type" sprawl common in templated UIs.

### 8.5 Shadow / Elevation
Three elevation levels, borders preferred over shadows at rest (Vercel-style flat-until-interactive):
- **Level 0 (resting):** 1px neutral border, no shadow.
- **Level 1 (hover/raised):** subtle shadow, used on card hover and dropdown surfaces.
- **Level 2 (overlay):** dialogs, drawers, command palette — the only elements allowed a visible shadow at rest, since they're floating above the page by definition.

### 8.6 Color Philosophy
Neutral-first palette (grayscale majority) with **one** brand accent color used sparingly for the single primary action per screen (Section 2) — never for decoration. All other color usage is **semantic**, not aesthetic:

| Concept | Color mapping | Why |
|---|---|---|
| `ResourceState.PENDING` | Amber/neutral-warm | "waiting," not yet actionable by the viewer |
| `ResourceState.IN_REVIEW` | Blue | actively being worked |
| `ResourceState.APPROVED` | Green | live, trustworthy |
| `ResourceState.REJECTED` | Red | negative outcome |
| `ResourceState.SUPERSEDED` | Neutral gray | inert, historical |
| `ResourceState.DELETION_REQUESTED` | Orange | pending a decision, distinct from Pending |
| `ResourceState.DELETED` | Neutral gray, strikethrough label | inert, historical |
| `Visibility.PLATFORM` | Violet/indigo badge | "wider than default," a distinct semantic axis from state |
| `Visibility.COLLEGE` | Neutral badge | default, no special emphasis needed |
| Verification status (Teacher `PENDING_VERIFICATION` / Student `isVerified=false`) | Amber, same family as Pending | conceptually the same "awaiting approval" semantic |

This mapping is used identically everywhere the state or visibility appears — badges, queue rows, filters, analytics charts — per the consistency rule in Section 14.

### 8.7 Dark Mode / Light Mode
Both supported, system-preference by default (with a manual override in Profile settings — see Section 17 for the "default" assumption). Dark mode is treated as a first-class design, not an inverted filter — semantic state colors are re-tuned for dark backgrounds to maintain the same relative contrast/legibility, not simply lightened.

### 8.8 Motion Philosophy
Summarized here, detailed in Section 9: motion clarifies *what changed and where it went*, never decorates. Durations stay in the 100–300ms range; nothing lingers. Performance implications of this are made explicit in Section 24.

### 8.9 Icon Usage
A single icon set (line-style, consistent stroke weight) throughout — one icon per concept, reused identically everywhere (e.g., the PYQ icon always looks the same in a card, a filter chip, and an upload-type picker). Icons are always paired with a text label in navigation — never icon-only, which fails both the "obvious without tutorials" goal and accessibility (Section 13).

### 8.10 Illustration Usage
Minimal — reserved for empty states and onboarding only, never on data-bearing or audit screens (Section 15's "don't mix tone" mistake). Simple, geometric, single-color-on-neutral, never cartoonish.

### 8.11 Avatar Usage
Initials-based fallback avatars (no generic silhouette icon) using the same neutral palette; a small role-indicator badge (Section 8.13) can overlay an avatar in moderator-facing contexts (e.g., "who moderated this") but never on a Student's own profile view of themselves.

### 8.12 Badges
Three badge families, visually distinct from each other so they're never confused: **state badges** (Section 8.6 colors), **visibility badges** (COLLEGE/PLATFORM), **role badges** (Student/Teacher/CR/Co-CR/Sub Admin/Platform Admin — shown on uploader/moderator attribution, per §4.1 "displays uploader name, role"). A resource card can show at most a state badge + visibility badge simultaneously — never stack more than two, or badges themselves become clutter. (This "max two" rule is the badge-specific instance of the general cognitive-load budget in Section 19.)

### 8.13 Status Colors
Consolidated from 8.6 into a single reusable token set (`state-pending`, `state-in-review`, `state-approved`, `state-rejected`, `state-superseded`, `state-deletion-requested`, `state-deleted`, `visibility-platform`, `visibility-college`) so implementation never re-derives a color ad hoc per screen. Repeated, alongside every other token category, in the single consolidated reference at Section 23.

### 8.14 Loading Philosophy
Skeleton screens for anything with a known shape (resource cards, queue rows, tables) — never a centered spinner for primary content, which tells the user nothing about what's coming. Spinners are reserved for button-level, in-place loading (e.g., a Submit button mid-request) where a skeleton doesn't make sense.

### 8.15 Skeleton Philosophy
Skeletons mirror the exact shape and count of the content they're replacing (e.g., a queue skeleton shows the same number of placeholder rows the previous page load had, capped at a sensible max) — so the transition from skeleton to real content causes no layout shift. See Section 24 for the broader layout-shift discipline this belongs to.

### 8.16 Empty State Philosophy
Every empty state has: (1) a short, specific explanation of *why* it's empty (not a generic "Nothing here"), (2) exactly one relevant next action, (3) a small, calm illustration (Section 8.10) — never used to fill space decoratively, only to soften what would otherwise be a stark blank page.

---

## 9. Motion Design Principles

Motion exists to answer "what just happened and where did it go" — never to impress. Every entry below states the *usability reason*. Concrete duration/easing token values are consolidated in Section 23; the performance rules governing *how* these are implemented (which CSS properties to animate, when to skip animation) are in Section 24. **v3:** the entire app standardizes on **[Motion.dev](https://motion.dev)** (the `motion` package) as its one animation engine — every row below is implemented as a Motion spring, `layoutId` transition, or `whileInView` trigger rather than hand-rolled CSS transitions, so the *feel* of a button press and the *feel* of a page transition come from the same physics system. This table still states *why* each interaction moves; Section 26 states *how*, with concrete spring configs, specifically for the cinematic content surfaces (Discover, Resource Detail, onboarding) — queues, admin, and audit surfaces use this table exactly as written, unchanged.

| Interaction | Motion | Why |
|---|---|---|
| Page transitions | Quick cross-fade + slight upward slide, ~150–200ms | Signals "new context," without disorienting or delaying |
| Hover (cards, list rows) | Subtle elevation lift (Level 0→1), ~100ms | Confirms interactivity before the click, cheap to compute |
| Modal / dialog open | Fade + scale-from-98%, ~150ms; instant on reduced-motion | Draws the eye to the new focal point without a jarring pop |
| Drawer / bottom sheet | Slide from the anchored edge, spring-based, ~250ms | Reinforces spatial origin (it came from the side/bottom, so it "returns" there on close) |
| Loading | Skeleton pulse, continuous subtle opacity breathing | Signals "still working" without demanding attention |
| Success (e.g., Approve action) | Brief checkmark micro-animation on the action button itself, ~200ms, then the row transitions out of the queue | Confirms the specific action succeeded before the item disappears — instant disappearance alone can feel like the click didn't register |
| Failure / error | Short horizontal shake on the offending field (~150ms) + inline red message, no shake on the whole form | Localizes the error precisely, doesn't distract from unrelated fields |
| Toast | Slide-in from top (mobile) / top-right (desktop), auto-dismiss with a visible progress edge, swipe-to-dismiss | Non-blocking, but gives the user a visible, quittable countdown |
| Card hover (desktop) | Elevation lift only, no scale change | Scaling a card on hover shifts surrounding layout and reads as "toy-like," not premium |
| Selection (checkbox/multi-select in admin tables) | Instant fill + tiny checkmark draw, <100ms | Selection state must feel immediate, never lagged |
| Expansion (accordion — e.g. Version History list) | Height auto-animate, ~200ms ease | Communicates that content is *revealed*, not replaced |
| Micro-interactions (button press) | Scale-down to 97% on press, spring back on release | Standard tactile feedback, cheap and universally understood |
| Focus transitions (keyboard nav) | Focus ring fades in, ~100ms | Supports Section 13's keyboard-navigation requirement without a jarring hard-edge ring |
| Shared element transition | Resource card → Resource Detail: the card's title/thumbnail area morphs into the detail header position | Preserves spatial continuity so the detail page doesn't feel like "a different app" |

**Where motion must NOT be used:**
- **Destructive/critical confirmations** (Reject with reason, Delete approval, CRUD Override, Emergency Appointment) — the confirmation dialog itself may fade in, but there is no animated delay, countdown, or "hold to confirm" gimmick on the action itself. A moderator or admin should never wait on an animation to complete a decision they've already made.
- **Dense tables/lists beyond ~20 rows** — no per-row stagger-in animation; it becomes a performance and attention cost with no usability benefit at that density (moderation queues, admin CRUD tables).
- **Anything a user does repeatedly in a session** — e.g., paging through a 40-item moderation queue must not replay an entrance animation on every item; only the *first* load of a queue gets the skeleton→content transition.
- **When `prefers-reduced-motion` is set** — every animation above degrades to an instant state change (Section 13.6).

---

## 10. Component Behavior Guidelines

Every component below is defined by *behavior*, not appearance, per the brief's instruction. The full default/hover/focus/active/disabled/loading/success/error/empty state matrix for the components most likely to be gotten wrong is in Section 21 — this section stays focused on *what a component is for*; Section 21 covers *what it looks like at every point in its lifecycle*.

- **Buttons.** Three tiers: Primary (filled, accent color, one per screen — Section 2), Secondary (outlined/ghost, any number), Destructive (red, only for irreversible or hard-to-reverse actions — Reject, Delete, Revoke, CRUD Override). Destructive buttons always require a confirmation dialog with the consequence stated in plain language, never just "Are you sure?". See Section 20 for the full priority taxonomy, including the Tertiary (text-link) tier and the rule on hidden-vs-disabled.
- **Cards.** A Resource card shows type icon, title, visibility badge, state badge (only if viewer is uploader or moderator — a Guest/other-college viewer sees no state badge, since state is not their concern), and one-line metadata (uploader role + date). Hover (desktop) reveals a quiet overflow menu (Report, Version History) without adding buttons to the resting card — the resting card stays clean.
- **Dialogs.** Reserved for short, interrupting decisions: confirmations, the rejection-reason prompt, the deletion-decision prompt. Never used for multi-step flows (those are full-screen wizards, Section 7.9) and never used for content that benefits from scrolling alongside other context (that's a drawer).
- **Drawers.** Used for "look at this alongside what I was already looking at" tasks: quick-edit metadata while the resource list stays visible behind it, admin CRUD edit forms while the table stays visible. Always dismissible by tapping outside or a close affordance, never only by completing the form.
- **Tables.** Used for admin CRUD (Colleges/Departments/Sessions/Courses) and analytics — sortable columns, no inline editing (editing opens the drawer), row-level actions in a trailing overflow menu. Bulk-select and column-visibility behavior for these tables is specified in Section 22.
- **Data Cards.** Used on analytics screens for single-metric summaries (e.g., "Promotions this month," "Dedup savings") — large number, short label, no chart clutter inside the card itself; a card that needs a chart gets a chart, not both crammed together.
- **Search.** Debounced-as-you-type, shows result count and visibility labels per result (§2.2) inline, never a separate "search page" the user must submit to — results stream in below the input.
- **Filters.** Chip-based, additive (selecting one narrows, doesn't replace the view) — resource type and PYQ session/year per §2.3, plus the "include other colleges" toggle per §4.3 shown as a distinct, clearly-different-looking control (a switch, not a chip) since it changes *scope*, not *filter criteria*, and that distinction matters enough to be visually obvious.
- **Dropdowns.** Used only for single-select from a short, known list (e.g., resource type at upload) — never for navigation (that's the nav itself) and never for more than ~10 options (that becomes a searchable combobox instead, e.g., Course selection).
- **Context Menus.** Right-click (desktop) / long-press (mobile) on a Resource card surfaces the same overflow actions as the card's hover menu — never new actions exclusive to the context menu, to avoid two different mental models for the same card.
- **Command Palette.** `⌘K`, fuzzy-matches destinations and quick actions (Section 3.4) — desktop only; mobile relies on the bottom nav + Search tab instead, since a command palette's keyboard-centric model doesn't translate to touch.
- **Notification Center.** Grouped by type (moderation outcomes, promotion outcomes, deletion outcomes — matching the §3.8 event table exactly), unread items visually distinct (not just a dot — a subtle background tint on the row), tap/click deep-links directly to the relevant Resource Detail or queue item, never to a generic list.
- **Sidebar (desktop, `lg`+ only).** Persistent, grouped exactly per Section 3.2's context-navigation logic — sections that don't apply to the current user's authority are absent entirely, not shown-disabled (a disabled nav item invites confusion, "why can't I click this").
- **Top Bar.** Breadcrumb (browse contexts only, Section 3.3) + Search + Notifications + Profile — consistent across every screen so it never has to be relearned.
- **Bottom Navigation (mobile).** Fixed, four items (Section 7.1), the active item visually filled/accented, others outlined.
- **FAB.** Section 7.2 — context-aware presence, single action (Upload), never a speed-dial/multi-action FAB, which adds a decision step the brief's "reduce clicks" goal argues against.
- **Tabs.** Used within a single queue to separate sub-scopes that share the same underlying list shape (e.g., Sub Admin's queue tabs: Pending Teacher Uploads / Pending Platform Resources / Escalations / Promotion Recommendations, per §5.3) — never used to fake separate pages that deserve their own route.
- **Pagination.** Infinite scroll for content-discovery lists (Discover, Search Results, Browse) where "keep scrolling" matches user intent; classic numbered pagination for admin/audit tables (Colleges list, Override Log) where "jump to page 4" is a real, common intent and infinite scroll would make that harder, not easier.
- **Upload UI.** Step wizard (Section 7.9) on both mobile and desktop for consistency; drag-and-drop zone added on desktop as an enhancement (not a replacement) over the native file picker; duplicate-hash warning (§3.1) appears as an inline, non-blocking banner *before* submission, not a modal that must be dismissed to proceed — it's information, not a gate.
- **Version Timeline.** A simple vertical list, current/latest version visually anchored at the top, each entry showing version number, state badge, and date — Rejected versions render for permitted viewers only (§6) and are visually dimmed/locked-icon to signal "historical, not currently accessible to everyone."
- **Approval Timeline.** A read-only log embedded in Resource Detail (visible to uploader + relevant moderator scope + Platform Admin, mirroring §6's access logic) showing state transitions with actor, action, timestamp, and reason where one exists (§3.8, §5.1) — this is the "audit trail made legible" component central to Section 1's philosophy.
- **Comment Thread — not built.** See Section 17; `userflow.md` §0.2 mentions "comment" once in passing (Guest cannot "comment") but no comment workflow, model, or endpoint exists anywhere else in either source document. No comment-thread component is designed. Flagged, not invented.

---

## 11. Interaction Patterns

- **Onboarding (Student/Teacher).** Register → immediate "Verification Pending" state screen (distinct copy per role, matching §1.2/§1.3) → read-only browse access remains available (only upload/report/comment-adjacent actions are blocked) so the wait doesn't feel like a locked-out dead end → push/in-app notification the moment verification completes (mirroring the notification patterns of §3.8, applied to this analogous "approval" event even though it isn't literally in the §3.8 table — see Section 17). Full step-by-step trace: Section 18.1.
- **Upload flow.** Type selection → classification (course, conditionally session for PYQ, §3.3) → file/link input → (Teacher only) visibility choice (§3.2) → review screen showing exactly what will be submitted and its resulting initial state (Pending, or Approved-immediately if Platform Admin, §3.4) → submit → immediate redirect to the resource's My Uploads entry, not back to Discover, so the user can see the state they just created. Full step-by-step trace: Section 18.4.
- **Moderation flow (CR/Co-CR and Sub Admin).** Queue list → tap/click an item opens it *within* the queue context (a detail panel or full-screen-on-mobile view that still shows "item 4 of 17" and next/previous navigation) rather than routing away to the generic Resource Detail page and losing queue position → decision (Approve/Reject-with-reason, or the combined deletion-flag resolution per §3.7/§5.1) → item animates out of the list (Section 9) → queue automatically advances to the next item, minimizing clicks between decisions. Full step-by-step trace: Section 18.5. Keyboard accelerators for this flow: Section 22.3.
- **Search flow.** Type → debounced instant results with visibility labels → tap a result → Resource Detail; no intermediate "did you mean" or advanced-search page, since §2.2's scope (course name, keyword, resource type) doesn't warrant one. Full step-by-step trace: Section 18.3.
- **Promotion flow (Path A — CR/Co-CR recommends, Sub Admin decides).** "Recommend for Platform" appears as a contextual action on an eligible resource's detail page (Approved, COLLEGE, Student-uploaded, within the CR/Co-CR's scope, §5.4) → confirmation dialog stating what happens next ("Sub Admin will review this recommendation") → the resource visibly shows a "Recommended" indicator to the uploader in My Uploads until decided. Path B (Sub Admin promotes a Teacher resource directly, §5.4) is a single contextual action on the resource detail with no CR-facing equivalent, since Teacher uploads never reach a CR/Co-CR queue (§3.2).
- **Deletion flow.** Uploader-initiated (§3.7): a "Request Deletion" or "Cancel" action on My Uploads/Resource Detail, contextual to the resource's current state (Cancel while Pending, Flag while In Review, Request while Approved) — the UI never shows an option that isn't valid for the resource's current state, preventing the user from even attempting an invalid transition.
- **Notification-to-action flow.** Every notification (§3.8's event table) deep-links directly to the specific resource or queue item it concerns — never to a generic "you have an update" landing page. Full step-by-step trace: Section 18.7.
- **Error states.** Inline, field-level, worded in plain language tied to the specific business rule (e.g., "This course is outside your assigned departments" rather than a generic "Invalid input") — matching the backend's Zod validation messages one-to-one so frontend and backend never show contradictory wording. Full step-by-step trace: Section 18.9.

---

## 12. Page Prioritization

| Screen | Primary goal | Primary action | Secondary action(s) | Key info shown | Attention flow | Est. completion time | Frequency |
|---|---|---|---|---|---|---|---|
| Discover / Home | Orient + find something fast | Search / tap into browse | Recently viewed, upload | Adopted departments, recent/highlighted resources | Search bar → recents → browse tiles | <10s to orient | Every session |
| Search Results | Find the specific resource | Open a result | Refine filters | Title, type, visibility label per result | Top-down list scan | 10–30s | Frequent |
| Resource Detail | Consume or act on one resource | Download/View | Report, Recommend, Edit, Version History, Request Deletion | Title, description, tags, uploader, version, state (if relevant) | Title → primary action → metadata → contextual actions | 5–60s | Frequent |
| Upload Flow | Get a resource into the system correctly | Submit | Save as draft — **not built, see Section 17** | Type, classification, visibility (Teacher) | Linear step-by-step | 1–3 min | Occasional (Student/Teacher), routine (Sub Admin/Platform Admin) |
| My Uploads | Track status of what I've submitted | Open an item / take a state-appropriate action | Filter by status | Status per §3.9 table | Status-grouped scan | 15–45s | Frequent for active uploaders |
| Notifications | See what changed | Tap to view the relevant item | Mark all read | Event type + resource | Top-down, unread emphasized | 10–20s | Frequent, short |
| CR/Co-CR Moderation Queue | Clear pending items in my batch | Approve / Reject | Escalate, view deletion flag | Scope indicator, item list | Scope banner → list → decision | Seconds per item, minutes per session | Routine (active CR/Co-CR only) |
| Student Verification Queue | Confirm legitimate registrations | Approve | — | Student name, reg no, batch | List scan → approve | Seconds per item | Occasional, bursty (start of term) |
| Sub Admin Moderation Queue | Clear Teacher/Platform items + escalations | Approve / Reject | Escalate context, view reports | Tabs by sub-queue (§5.3) | Tab → list → decision | Minutes per session | Routine |
| Teacher Verification Queue | Approve legitimate Teacher accounts | Approve | — | Teacher name, college, departments | List scan → approve | Seconds per item | Occasional |
| Promotion Queue | Decide Path A recommendations | Approve / Deny | View resource before deciding | Resource summary, recommending CR | List → open resource → decide | 1–2 min per item | Occasional |
| CR/Co-CR Management | Appoint/revoke CRs | Appoint | Revoke | Active assignments per dept+session | Table scan | 1–2 min per action | Occasional |
| Sub Admin Analytics | Understand college health | View charts/tables | Export (if needed) | Throughput, content gaps, dedup savings | Summary cards → detail table | 1–3 min | Rare, periodic |
| Colleges / Departments / Sessions / Courses (Platform Admin) | Maintain master data correctly | Create / Edit | Deactivate, adopt/un-adopt | Table of entities | Table → drawer edit | 1–5 min | Rare |
| Sub Admin Management | Appoint/revoke Sub Admins | Promote existing user | Revoke | Active assignment per college | Table scan | 1–2 min | Rare |
| Emergency Appointment | Resolve a vacancy fast, with a paper trail | Appoint (interim Sub Admin / direct CR/Co-CR) | — | Justification note field (required) | Short form, justification emphasized | 1–2 min | Very rare, high-stakes |
| CRUD Override | Resolve an exceptional case on a specific resource | Perform override action | View resource, view history | Justification note (required) | Search resource → action → justification | 2–5 min | Very rare, high-stakes |
| Promotion Override | Resolve an exceptional promotion case | Approve/Deny/Promote directly | — | Justification note (required) | Similar to above | 2–5 min | Very rare |
| Platform Analytics & Override Log | Platform-wide oversight | View log/analytics | Filter by override type | Promotions per college, override log | Summary → filterable log table | 2–5 min | Rare, periodic |

---

## 13. Accessibility Guidelines

- **Keyboard navigation.** Every interactive element reachable via Tab in a logical order matching visual layout; the Command Palette and all dialogs/drawers are fully keyboard-operable (open, navigate, confirm, dismiss with `Esc`).
- **Focus management.** Opening a dialog/drawer moves focus to its first interactive element and traps it there until dismissed; closing returns focus to the element that triggered it — critical for moderators tabbing through a queue's confirmation dialogs repeatedly.
- **Contrast.** WCAG AA minimum for all text; AAA target for state/visibility badge text against its background, since misreading a state badge (e.g., Rejected vs. Approved) has real consequences.
- **ARIA.** Toasts and notification updates use `aria-live="polite"` regions; tabs, queues, and the command palette use correct ARIA roles (`tablist`/`tab`, `listbox`/`option`, `dialog`) so assistive tech announces state changes correctly (e.g., "Resource approved" on a successful moderation action).
- **Touch targets.** Minimum 44×44pt for every tappable element, including badges/chips that are also interactive (e.g., a filter chip) — decorative-only badges are exempt but must not overlap a tappable area.
- **Reduced motion.** `prefers-reduced-motion` disables every entrance/hover/expansion animation in Section 9, replacing them with instant state changes — functionality is never gated behind an animation completing.
- **Screen readers.** State and visibility badges always carry a text equivalent (not color alone) — e.g., an `aria-label="Approved, Platform-wide"` on a badge that visually shows just a green dot and an icon, so color-blind and screen-reader users get the same information sighted users do.
- **Keyboard-accelerator discoverability.** Any shortcut introduced in Section 22.3 must also be reachable via a visible, clickable control — a shortcut is always an accelerator for an existing affordance, never the only way to perform the action (same rule Section 7.4 already applies to gestures).

---

## 14. Design Consistency Rules

- Exactly one accent color, used only for primary actions and active/selected states — never for decoration, headers, or illustration.
- Exactly one primary CTA per screen (Section 2) — if a screen seems to need two, that's a signal the screen is doing two jobs and should be split, not a signal to add a second primary button.
- The state/visibility color mapping (Section 8.6/8.13) is used identically in every surface it appears — badges, filters, charts, notifications. A state is never given a different color on an analytics chart than it has on a resource card.
- Icons are 1:1 with concepts, reused identically everywhere — no icon means two different things in different screens, and no concept has two different icons.
- Terminology matches the source documents' exact vocabulary everywhere in the UI copy: "Sub Admin" (not "Admin" or "SubAdmin"), "CR/Co-CR," the exact state names from `ResourceState`, "Recommend for Platform" (not "Promote" — that verb is reserved for the Sub Admin's actual promotion action, keeping the two distinct actions from ever reading as the same thing).
- Card elevation styles never mix on one screen — a screen uses Level 0 resting cards throughout, or Level 1, never both styles side by side.
- Every destructive action shares one confirmation-dialog pattern (title, plain-language consequence, destructive button styled identically) rather than each screen inventing its own.

---

## 15. Common UX Mistakes To Avoid

- **Looking like a generic admin dashboard** — the brief's explicit aversion. Avoided by the editorial Resource Detail treatment, the restrained two-radius/three-elevation system, and refusing the "sidebar + top bar + card grid of stats" template reflex for anything content-facing (reserved only for genuinely dense admin/analytics screens, and even there, treated per Section 5's whitespace discipline).
- **Cards randomly placed without hierarchy** — avoided by the strict content-hierarchy rules in Section 4.2 and the one-primary-action rule in Section 14.
- **Modal overuse** — reserving dialogs strictly for short interruptions (Section 10) and using drawers/full pages for anything more substantial.
- **Icon-only navigation ("mystery meat")** — every nav icon carries a label (Section 8.9).
- **Mobile as an afterthought** — structurally prevented by designing mobile-first per Section 7 and treating desktop as the enhancement layer, not the reverse.
- **Inconsistent status colors** — prevented by the single token set in Section 8.13/23 used everywhere without exception.
- **Overusing shadows/gradients for "premium" feel** — avoided by the flat-until-interactive elevation model (Section 8.5); premium is communicated through restraint and rhythm, not decoration.
- **Cluttered, always-visible filter bars** — avoided by the chip/bottom-sheet pattern (Section 6) that only shows active filters, collapsing the rest.
- **Blocking spinners for primary content** — avoided by the skeleton-first loading philosophy (Section 8.14).
- **Redundant confirmations for reversible, low-stakes actions** — e.g., no confirmation dialog for "lightweight metadata edit" (§3.6), since it has no state consequence; confirmations are reserved for genuinely destructive/state-changing actions (Section 14).
- **Whimsical illustration on serious/audit surfaces** — the CRUD Override, Emergency Appointment, and Override Log screens (Section 8.10) stay illustration-free and visually sober; playful empty-state illustrations are reserved for low-stakes screens like an empty Notifications list.
- **Treating every role's needs as the same navigation** — avoided by the authority-based context navigation in Section 3.2, so a Student is never shown a cluttered nav full of admin destinations they'll never use.
- **Animating for its own sake** — every entry in Section 9 states a usability reason; if a proposed animation can't state one, it doesn't ship.
- **Designing screens in isolation from the flows that connect them** — avoided by requiring every core flow to be traced end-to-end in Section 18 before `wireframe.md` is drawn, not assembled after the fact from individually-good pages.
- **An unbounded "add one more action to this screen" drift** — avoided by the explicit cognitive-load ceilings in Section 19, which give a concrete number to push back with instead of a vague "feels cluttered."

---

## 16. AI Implementation Rules

For whichever AI agent generates `wireframe.md` from this document, and for any AI implementing the frontend after that:

- Read this entire document before producing `wireframe.md` — not just the Information Architecture section.
- Never add a screen not listed in Section 4.1's site map. If a screen seems necessary and isn't listed, stop and flag it rather than inventing it.
- Never add a component or interaction not described in Sections 9–11 (or their Section 21/22 detail). Reuse the described behavior; do not invent a new pattern for a screen that has an analogous existing one (e.g., don't invent a new confirmation pattern for one specific destructive action — reuse Section 14's single pattern).
- Follow the Visual Design System (Section 8) and the consolidated token reference (Section 23) exactly — the type scale, spacing scale, radius values, elevation levels, motion durations/easing, z-index layers, and color-semantic mapping are fixed inputs, not suggestions to be reinterpreted.
- Design mobile layouts first for every screen, then adapt upward per Section 6/7 — never design desktop first and shrink it down.
- Respect every item in Section 17 as **unresolved** — mark the corresponding wireframe area with a placeholder/TODO referencing the specific Open Question number, rather than silently picking an answer.
- Never design a Comment Thread, "Save as Draft," "Pinned Pages" (backend-persisted), "Saved Views" (backend-persisted), bulk-approve on moderation queues, or any other feature not present in `userflow.md`/`schema.prisma`, even if this document's component/interaction language seems to leave room for it (Section 10's explicit callout on Comment Thread is the model to follow for anything else similarly ambiguous; Section 22 extends the same discipline to data-heavy admin patterns specifically).
- When two roles share a screen (e.g., Resource Detail across Guest/Student/Sub Admin/Platform Admin), design the one shared layout with role-conditional contextual actions (Section 1, principle 4) — never four separate screen designs for the same underlying page.
- Full expanded constraint set: Section 25.

---

## 17. Open Questions

These are the points `userflow.md` and `schema.prisma` do not resolve. Do not silently decide them in `wireframe.md` — carry them forward as open until the product owner resolves each one, exactly as `backendWorkProcess.md` Section 16 handled backend ambiguities.

1. **"Comment" is mentioned once, with no supporting feature.** `userflow.md` §0.2 states Guest "cannot upload, comment, report, or moderate" — implying commenting is a real action for other roles — but no `Comment` model exists in `schema.prisma` and no comment workflow appears anywhere else in `userflow.md`. **This plan does not design a Comment Thread** (Section 10) pending clarification: either the word is a leftover from an earlier draft and should be ignored, or commenting is a real, currently undocumented feature that needs its own spec before it can be designed.
2. **Verification-complete notification for Students/Teachers.** §3.8's notification table doesn't include a "your account was verified" event (it only covers resource/promotion/deletion events). Section 11/18.1 assumes an analogous in-app notification fires when a Student's CR/Co-CR (or fallback Sub Admin) approves them, or when a Sub Admin approves a Teacher — reasonable given the pattern elsewhere, but not explicitly specified.
3. **Dark/light mode default.** Neither source document addresses this. Assumed: system-preference by default, with a manual override in Profile settings (Section 8.7) — a common, low-risk default, but not derived from spec.
4. **"Recently visited" / any persisted personalization.** No such model exists in `schema.prisma`. Section 3.5 treats this as client-side-only convenience (e.g., local storage), never a backend-synced feature, and it must stay that way unless a future schema change adds support.
5. **Save-as-draft during Upload.** Not described in `userflow.md` (§3.4 describes only submit-time validation, not an intermediate saved state) — Section 12 explicitly notes this is **not built**. If needed, it would require a schema change (a draft state or table) outside this plan's authority to assume.
6. **Exact analytics visualization types** (charts vs. tables vs. numbers) for §7.5's content-gap, dedup-savings, promotion-count, and throughput analytics. Section 10 specifies these are shown as "Data Cards" with optional detail tables, but the precise chart types (bar, line, none) are left to `wireframe.md` to decide within that constraint, since `userflow.md` only describes *what* to show, not how to chart it.
7. **Brand identity specifics** (exact accent hue, exact font family beyond "modern grotesk sans," logo). Section 8 states principles and a token structure; exact values are a brand decision outside either source document's scope and should be supplied by the product owner before `wireframe.md` finalizes literal hex/font values.
8. **Real-time notification delivery mechanism.** `backendWorkProcess.md` implements notifications via a stateless in-app + additive-email model, with no WebSocket/real-time infrastructure noted in the backend tech stack. This plan therefore assumes **polling** (via TanStack Query's refetch/interval capabilities) for notification freshness, not a live push — flagged here since it affects how "instant" the Notification Center can feel.
9. **Read-only browsing while a Student/Teacher account is pending verification.** §1.2/§1.3 state only that upload is blocked pre-verification; Section 11/18.1's onboarding flow assumes browsing/search remain available during the wait (not a full account lockout), since the source text never states browsing is blocked — flagged as an inference, not an explicit rule.
10. **"Saved views" for admin/analytics tables.** No such model exists in `schema.prisma` and no workflow appears in `userflow.md`. Section 22.4 explicitly does **not** design saved/persisted table views for this reason, following the same not-built discipline as Comment Thread (Section 10) and Save-as-Draft (item 5 above). Column-visibility preferences, where offered at all, are client-side-only (Section 22.4) for the same reason.
11. **Bulk-approve on moderation queues.** `userflow.md` §5.1/§5.4 describe moderation decisions as individual, reasoned acts (a Reject requires a reason per item). This plan deliberately does **not** design a bulk-approve/bulk-reject control for CR/Co-CR or Sub Admin queues (Section 22.2), since it would let a moderator approve multiple resources without the individual review the state machine seems to assume — this is a product-policy question (is batch moderation ever acceptable?) that needs the product owner's answer before either the backend or this plan can support it, not a UI decision to make unilaterally.
12. **Discover spotlight selection logic (v3).** Section 26.4 introduces a single editorially-treated spotlight item above the regular Discover feed — a presentation change, not a new content source (the underlying resource already comes from the existing "recently approved / platform highlights" feed, §4.2). Neither `userflow.md` nor `schema.prisma` specifies *how* one item is chosen over another for this position. Plausible candidates — most recent Approved-and-Platform resource, most-downloaded in a rolling window, or a manually curated Platform Admin pick — all fit within existing data, but choosing between them is a product/business-logic decision this plan doesn't have the authority to make silently. Until resolved, `wireframe.md` should treat the spotlight as populated by the simplest available candidate (most recent Approved, PLATFORM-visibility resource) and mark the slot itself as configurable, not hardcode a selection algorithm as if it were settled.

---

## 18. User Journeys (Cross-Screen Flow Traces)

Sections 1–17 define screens and components in isolation; this section chains them into the actual paths a person takes, per screen, so no journey is left to assemble itself from individually-good pages after the fact (Section 15). Every step below cites the screen (Section 4.1) or interaction pattern (Section 11) it uses — nothing new is introduced here, only sequenced.

### 18.1 First-time onboarding (Student or Teacher)
1. Guest lands on **Discover** (read-only, §2.1) → taps **Upload** or **Sign In**, is routed to **Register**.
2. Completes **Register — Student/Teacher** (§1.2/§1.3).
3. Immediately shown **Verification Pending** (role-specific copy) — not a dead end: a persistent "Browse anyway" affordance keeps Discover/Search/Resource Detail reachable (§9 assumption, Open Question 9).
4. Time passes outside the app; CR/Co-CR (Student) or Sub Admin (Teacher) approves in their queue (§5.2/§5.8).
5. **Notification** fires (Open Question 2) → tapping it deep-links to Discover with the Verification Pending state now cleared, Upload/My Uploads nav items now visible (Section 3.2's authority-based reveal, live in real time).
6. First Upload (18.4) becomes the natural next journey.

### 18.2 Login → session
1. **Sign In** (§1.6) → on success, routed to **Discover**, not a generic dashboard — Discover is designed as the universal landing point per Section 4.2, regardless of role.
2. Nav chrome (Section 3.1–3.2) renders according to the account's *current* authority (e.g., a Student who is also an active CR/Co-CR sees **Moderate** immediately) — no separate "switch context" step, per Section 1's Arc-inspired principle 4 (roles change what you see, not a mode you toggle).

### 18.3 Search → Resource → Download
1. From anywhere, invoke **Search** (`/` key or bottom-nav tab, §3.4/7.6).
2. Debounced results stream in with visibility labels inline (§2.2, Section 10 "Search").
3. Tap a result → **Resource Detail**, shared-element transition from the result row (Section 9's shared-element entry) so the destination doesn't feel like "a different app."
4. Primary action **Download/View** is the Z-pattern terminus (Section 5) — one tap, no interstitial confirmation (this is a non-destructive, reversible action, per Section 14).

### 18.4 Upload → Pending → Moderation → Resolved
1. Tap **Upload** (FAB mobile / button desktop, §3.1) → step wizard (§7.9): type → classification → file/link → visibility (Teacher only).
2. Duplicate-hash warning, if triggered, renders as an inline banner on the file-input step — informational, never blocking (Section 10 "Upload UI").
3. Review step shows the resulting initial state plainly ("This will be submitted as **Pending**" or "**Approved** — Platform Admin uploads publish immediately," §3.4).
4. Submit → redirect to **My Uploads**, the new item visible at its actual current state (Section 11 "Upload flow" — never back to Discover).
5. Elsewhere: a moderator's **Moderation Queue** (§5.2/§5.3) now contains the item (18.5 continues from here).
6. Resolution (Approved/Rejected) → **Notification** (§3.8) → uploader taps through, deep-linked to **My Uploads** or **Resource Detail**, seeing the new state and, if rejected, the reason (Section 10 "Approval Timeline").

### 18.5 Moderation session (CR/Co-CR or Sub Admin, one sitting)
1. Tap **Moderate** (only visible per Section 3.2's authority check) → **Moderation Queue**, scope banner visible before anything else (Section 4.2).
2. Open item 1 of N — detail panel stays *within* the queue context (Section 11), showing "item 1 of 17" and next/previous.
3. Decide: Approve (single tap) or Reject (opens the reason dialog, Section 10 "Dialogs") — or, for Sub Admin, resolve a deletion flag (§3.7/§5.1).
4. Success micro-animation (Section 9) → item animates out → queue auto-advances to item 2, no extra navigation tap.
5. Repeat until queue empty → the queue's own **Empty State** (§3.7/8.16) explains "No pending items in your Department+Session queue" with a next action (e.g., "Browse the college's resources instead").
6. Power-user acceleration for this exact loop: Section 22.3's keyboard shortcuts (desktop only).

### 18.6 Promotion (Path A: CR/Co-CR recommends → Sub Admin decides)
1. CR/Co-CR, viewing an eligible **Resource Detail** (Approved, COLLEGE, Student-uploaded, in-scope, §5.4) → taps **Recommend for Platform** (contextual action, only rendered because all four eligibility conditions hold — Section 4.2 "only the ones the viewer's role/scope permits").
2. Confirmation dialog states the consequence in plain language ("Sub Admin will review this recommendation," Section 14's confirmation pattern).
3. Resource now shows a "Recommended" indicator in the uploader's **My Uploads** (Section 11).
4. Sub Admin sees it queued in their **Promotion Queue** tab (§5.3/§5.4) → opens the underlying resource before deciding (Section 12's attention flow for that screen) → Approve/Deny.
5. Outcome triggers a **Notification** to both the original uploader and the recommending CR/Co-CR, each deep-linking to their own relevant view of the same resource.

### 18.7 Notification → action
1. Bell icon shows an unread-count badge (§3.8) from anywhere in the global nav (Section 3.1).
2. Tap → **Notification Center**, grouped by event type, unread rows tinted (Section 10).
3. Tap a specific notification → deep-links directly to the resource/queue item it concerns (Section 11 "Notification-to-action flow") — never a generic landing page.
4. This same pattern closes the loop for 18.1 (verification), 18.4 (moderation outcome), and 18.6 (promotion outcome) — one mechanism, four triggers, per Section 14's consistency rule.

### 18.8 Mobile upload wizard (device-specific detail on top of 18.4)
Already fully specified at Section 7.9 (four full-screen steps, one thumb-reachable "Next" per step) — restated here only to make explicit that it is the mobile-specific *implementation* of Journey 18.4's Upload step, not a separate flow.

### 18.9 Error recovery
1. A business-rule violation (e.g., selecting a course outside the CR/Co-CR's assigned departments) is caught **inline, at the field**, the moment it's knowable — never deferred to a post-submit rejection (Section 2, Section 11 "Error states").
2. The field shakes briefly (Section 9), a red inline message appears in plain language matching the backend's Zod message verbatim (Section 11), focus remains on the field — no modal interrupts the flow.
3. User corrects the field in place and continues the same wizard step/form — no re-navigation, no lost progress in earlier steps.

### 18.10 Empty-state recovery
1. Any list screen with zero results (empty Moderation Queue, empty My Uploads, a Search with no matches, a newly-adopted Department with no Courses yet) renders its screen-specific empty state (§3.7/8.16) instead of a bare "No results."
2. The empty state states *why* in one line and offers exactly *one* next action appropriate to that screen (e.g., empty Search → "Try browsing by Department instead" with a direct link into 2.1's browse hierarchy; empty queue → "Browse the college's resources instead").
3. No empty state is a dead end — every one has exactly one forward path, never zero and never more than one (tying back to Section 19's one-decision-at-a-time budget).

### 18.11 Exceptional admin action (Emergency Appointment / CRUD Override, as a representative high-stakes journey)
1. Platform Admin navigates **Administration** (§3.2, authority-gated) → **Emergency Appointment** or **CRUD Override**.
2. Short, sober form (no illustration, Section 8.10/15) — search/select the target (person or resource) → choose the action → **required** justification-note field, visually emphasized as the form's true center of gravity (Section 12's attention-flow for this row).
3. Submit triggers Section 14's shared destructive-confirmation pattern — plain-language consequence stated, no motion delay (Section 9's "must NOT" list) — the admin should never wait on an animation to complete a decision already made.
4. Outcome is written to the **Platform Analytics & Override Log** (§7.5), itself reachable in the same Administration section, closing the loop for later audit review — no separate confirmation screen needed beyond the toast (Section 9 "Toast").

---

## 19. Cognitive Load Budget

Section 2 states the general goal ("reduce cognitive load"); this section gives it enforceable numbers so a reviewer can check a screen against a budget instead of an impression.

- **One decision at a time.** Exactly one primary action per screen (already Section 14) — this section adds: exactly one primary *decision point* per screen, meaning a screen never asks the user to resolve two independent questions (e.g., "approve or reject" AND "escalate or not") through equally-weighted controls in the same view. Where a second decision genuinely exists (e.g., a deletion-flag resolution alongside Approve/Reject), it's presented as a distinct, clearly subordinate control (Section 4.2's moderation-queue hierarchy item 4), never a second co-equal button.
- **Badge ceiling.** Maximum two badges visible on any one card at rest (Section 8.12) — a third piece of state information, if ever needed, goes in the overflow/detail view, not a third badge.
- **Contextual-action ceiling.** Maximum three contextual actions surfaced directly on a Resource Detail or card without an overflow menu (Section 10's "Cards" and "Figma/Apple" toolbar principle, Section 1) — a fourth eligible action goes behind the overflow, never expands the visible row.
- **Filter-chip visibility ceiling.** Roughly five visible filter chips before a "more filters" affordance takes over (ties to Section 6's bottom-sheet collapse and Section 15's "cluttered filter bar" mistake) — this is a soft ceiling since exact chip count varies by screen, but it's the number a reviewer should treat as the default assumption.
- **One-click depth for progressive disclosure.** Any "detail one click away" claim in this document (Section 1 principle 3: moderator reasons, version history, audit notes) means literally one interaction — a click, not a click that opens a menu that opens the actual content. If a design needs two clicks to reach something this document calls "one click away," that's a defect against this budget, not an acceptable interpretation.
- **Wizard-step field ceiling.** Each Upload wizard step (Section 7.9) surfaces only the fields relevant to that step's single decision — never the full form's fields visible-but-disabled ahead of time, which would just relocate the "everything at once" problem instead of solving it.
- **No duplicate entry points for the same action within one screen.** A given action (e.g., "Approve") appears once as a control on a given screen — a queue item's swipe gesture (Section 7.4) and its on-card button are the *same* action exposed two ways for two input modes, not two different affordances competing for attention; the Command Palette (Section 3.4) is the one sanctioned exception, since it's an opt-in, keyboard-only accelerator layer that doesn't add anything to the visible screen itself.
- **Grouping.** Related metadata is always visually grouped as a single unit (e.g., uploader + role + date sit together as one metadata line, Section 4.2) rather than interleaved with unrelated fields — a reviewer should be able to point at any two adjacent pieces of information on a screen and state why they're adjacent.

---

## 20. Action Hierarchy & Interaction Priority

Section 10 already names three button tiers for visual treatment; this section makes the full taxonomy — including a fourth, lower tier, and the rule for when an unavailable action is hidden versus merely disabled — explicit and consistent everywhere.

| Tier | Visual treatment | Used for | Example |
|---|---|---|---|
| **Primary** | Filled, accent color, exactly one per screen (Section 14) | The screen's entire reason for existing | Submit (Upload), Approve (moderation), Download (Resource Detail) |
| **Secondary** | Outlined/ghost, any number | Reversible or exploratory actions | Filter, Sort, View Version History, Cancel (non-destructive) |
| **Tertiary** | Plain text link, lowest visual weight, used sparingly | Low-frequency or "escape hatch" actions that shouldn't compete visually with Secondary controls | "Skip," "Not now," a footer-level "Report a problem" link |
| **Destructive** | Red fill or red outline (context-dependent), always behind a confirmation dialog (Section 14) | Irreversible or hard-to-reverse actions | Reject-with-reason, Delete/Request Deletion, Revoke, CRUD Override |

**Hidden vs. disabled — the rule that prevents "why can't I click this" confusion (extending Section 15's sidebar rule to every action, not just navigation):**
- **Permission- or scope-gated actions** (the viewer's role/authority simply doesn't include this action, e.g., a Guest and "Report," or an out-of-scope CR/Co-CR and a queue item) are **never rendered at all** — not grayed out, not present-but-disabled. An absent control communicates "not your action" without inviting a support question.
- **Input-validation-gated actions** (the *same* actor's own form is incomplete, e.g., Submit before required Upload fields are filled) **are shown disabled**, with the reason surfaced inline at the offending field (Section 18.9) — because here the actor is mid-task and benefits from seeing the destination control exists, unlike the permission case where the action was never theirs to take.
- **State-gated actions** (the resource's current state makes an action temporarily invalid, e.g., "Cancel" only while Pending per Section 11's deletion flow) follow the permission rule: hidden, not disabled, since showing a Cancel button on an Approved resource and disabling it would falsely imply cancellation is generally possible.

This taxonomy is what Section 10's "Buttons" entry and Section 14's "exactly one primary CTA" rule are instances of — nothing here changes those rules, it names the full system they belong to.

---

## 21. Component State Matrix

Every interactive component has a lifecycle beyond its resting appearance. This table gives the default expectation per state for the components most prone to being under-specified; anything not listed inherits the nearest analogous row (e.g., a Dropdown behaves like a Text Input for focus/error purposes). Transition motion between these states is Section 9's table; the *visual* end-state at each point is defined here.

| Component | Default | Hover (desktop) | Focus | Active/Pressed | Disabled | Loading | Success | Error | Empty |
|---|---|---|---|---|---|---|---|---|---|
| **Button (Primary/Secondary)** | Resting per tier (Section 20) | Slight elevation/tint shift | Visible focus ring (Section 9) | Scale to 97% (Section 9) | Only for input-validation gating (Section 20); dimmed, cursor not-allowed | In-place spinner replaces label, button stays same size (no layout shift, Section 24) | Brief checkmark micro-animation (Section 9) before its normal next state | N/A — errors surface at the field, not the button | N/A |
| **Text Input / Textarea** | 1px neutral border (Level 0, Section 8.5) | Border darkens slightly | Accent-colored ring, per Section 13 focus rules | N/A (text inputs don't have a pressed state) | Muted background, muted text, no border emphasis | N/A (inputs don't load) | Brief green border flash optional, subtle | Red border + inline message below, shake (Section 9) | Placeholder text visible, no visual difference from a filled-then-cleared state beyond the placeholder itself |
| **Resource Card** | Level 0 border, no shadow | Level 1 lift, quiet overflow menu appears (Section 10) | Visible focus ring around the whole card (keyboard nav, Section 13) | Slight scale-down on press (touch) | N/A (cards aren't disabled, they're simply not rendered if inaccessible — Section 20) | Skeleton shape matching the real card (Section 8.15) | N/A | N/A (a card itself doesn't error; a failed download shows a toast, Section 9) | Not applicable to a single card — see list-level empty state (Section 18.10) |
| **Moderation Queue Item Row** | Level 0, oldest-first position | Level 1 lift | Focus ring, "item N of M" context stays visible (Section 18.5) | Decision buttons show pressed state per Button row above | N/A | Skeleton row, exact row count capped sensibly (Section 8.15) | Checkmark micro-animation → animates out of list (Section 9) | Reject-reason validation error shown inline in the reason dialog, not on the row itself | Queue-level empty state (Section 18.5 step 5) |
| **Toggle / Switch** (e.g., "include other colleges," Section 10 Filters) | Off state, neutral track | Slight track-color shift | Focus ring around the whole control | Thumb travels with a quick spring (~150ms) | Rare; if ever disabled, dimmed with no interaction | N/A | N/A | N/A | N/A |
| **Filter Chip** | Neutral outline, unselected | Slight fill tint | Focus ring | Instant fill on selection (Section 9's "Selection" entry) | N/A (unavailable filters are simply absent, Section 20) | N/A | N/A | N/A | N/A |
| **Upload Dropzone** | Dashed border, neutral | Border solidifies, slight background tint | Focus ring (keyboard-triggered file picker) | Border accent-colored while a file is dragged over it | N/A | Progress indicator replaces the dropzone content during upload | Brief checkmark + filename replaces dropzone prompt | Red border + inline message (e.g., "unsupported file type") per Section 18.9 | Default state *is* the empty state here — dashed border with prompt text is definitionally "nothing dropped yet" |

---

## 22. Data-Heavy UX Patterns (Admin, Analytics, Moderation)

Section 5 already established *why* moderation queues and admin tables use dense layouts; this section specifies the interaction patterns dense screens need so an AI implementer doesn't default to a generic card grid (the exact failure mode Section 15 warns against) or invent an unbounded set of "power features."

### 22.1 Dense Tables (Admin CRUD, Analytics, Override Log)
Sortable columns, no inline cell editing (edits open the drawer, Section 10 "Tables"), row-level actions in a trailing overflow menu. Numbered pagination, not infinite scroll, for exactly the tables where "jump to page 4" is a real intent (Section 10 "Pagination").

### 22.2 Bulk Actions — deliberately scoped, not universal
Multi-select checkboxes are appropriate **only** on structural admin tables where a row represents inert master data with no individual-reasoning requirement (e.g., deactivating several stale Courses at once, Section 7.1's "Deactivate" secondary action). Multi-select/bulk-approve is **explicitly not designed** for Moderation Queues (§5.1's state machine treats each decision as an individually reasoned act, and Sub Admin/CR-Co-CR Reject requires a per-item reason) — see Open Question 11. This is a reasoned exclusion, not an oversight: don't add bulk-approve to a queue screen because "it would be more efficient," since efficiency here would come at the cost of the individual review the moderation model assumes.

### 22.3 Keyboard Shortcuts (desktop only, moderator-facing)
An extension of the Command Palette's existing "power user" remit (Section 3.4), scoped specifically to the repeated moderation loop (Journey 18.5):
- `J` / `K` — move to next/previous queue item (mirrors the existing next/previous control, Section 11, never a shortcut-only action per Section 13's discoverability rule).
- `A` — Approve the current item (same control as the on-screen Approve button).
- `R` — open the Reject-with-reason dialog for the current item (same control as the on-screen Reject button).
- `Ctrl/Cmd + Enter` — confirm whatever dialog is currently open (Reject-reason, deletion-flag resolution).
- `?` — opens a lightweight shortcuts-help overlay listing the above, satisfying Section 13's discoverability requirement for any accelerator.
These are accelerators for controls that already exist on-screen (Section 20's taxonomy, Section 22.2's per-item reasoning requirement) — never a way to approve/reject without the same reasoning step the mouse-driven flow requires.

### 22.4 Column Visibility & Saved Views
Admin tables (Colleges/Departments/Sessions/Courses, Override Log) may offer a column-visibility toggle, stored **client-side only** — the same discipline already applied to "Recently Visited" (Section 3.5, Open Question 4), since no column-preference model exists in `schema.prisma`. **Saved/persisted views are not designed** (Open Question 10) for the same reason Comment Thread and Save-as-Draft aren't: no backing model exists, and inventing one silently would be exactly the kind of unauthorized feature addition Section 16 prohibits.

### 22.5 Analytics Screens
Data Cards for single-metric summaries, detail tables for anything that needs row-level drill-down (Section 10 "Data Cards") — generous outer whitespace around dense inner content (Section 5's Stripe-inspired reasoning). Exact chart types remain Open Question 6; this section fixes the *interaction* pattern (card-first, table-on-demand) without prejudging the *visualization* choice.

---

## 23. Design Tokens (Consolidated Reference)

A single lookup table for every fixed value referenced elsewhere in this document. **These are restatements, not new decisions** — every value below already appears in Sections 6, 8, or 9; this section exists so an implementer never has to hunt across the document (or worse, re-derive a value ad hoc, which Section 8.13 already warns against for color specifically). The one genuinely new addition is the z-index layering order, which no earlier section specified a stacking order for even though several (dialogs, drawers, toasts, command palette) implicitly assume one.

| Category | Token(s) | Value(s) | Source section |
|---|---|---|---|
| Spacing | `space-1…8` | `4, 8, 12, 16, 24, 32, 48, 64px` | 8.2 |
| Radius | `radius-sm`, `radius-lg` | `8px`, `16px` | 8.4 |
| Elevation | `elevation-0/1/2` | Border-only / subtle shadow / overlay shadow | 8.5 |
| Breakpoints | `sm/md/lg/xl` | `0–639 / 640–1023 / 1024–1439 / 1440+px` | 6 |
| Typography | `display/heading/subheading/body/caption/micro` | `32–40 / 22–24 / 17–18 / 15 / 13 / 11px` | 8.1 |
| Motion duration | short / standard / long | `~100ms` (hover, focus, selection) / `~150–200ms` (page, modal, error shake) / `~250ms` (drawer/sheet spring) | 9 |
| Motion ceiling | — | 300ms hard ceiling, nothing lingers | 8.8 |
| Motion easing | standard, spring | Ease-out for fades/scale-ins; spring for drawers/sheets/button press (Section 9's drawer and micro-interaction rows) | 9 |
| Z-index layers (**new**) | `z-base…z-palette` | `z-base (0) < z-sticky-nav (10) < z-dropdown (20) < z-drawer-sheet (30) < z-dialog (40) < z-toast (50) < z-command-palette (60)` | New — resolves an implicit gap; see note below |
| Color — state | `state-pending/in-review/approved/rejected/superseded/deletion-requested/deleted` | Per Section 8.6's mapping | 8.6, 8.13 |
| Color — visibility | `visibility-platform/college` | Per Section 8.6's mapping | 8.6, 8.13 |

**Note on z-index:** the layering order above is derived purely from which components must visually sit above which others *given rules already stated* (a toast must be readable over a dialog per Section 9's toast description; the command palette is invoked in any context including over a dialog, per Section 3.4's "from anywhere"). It does not add a new component or behavior — it just makes an already-necessary ordering explicit so two different screens don't accidentally assign a drawer a higher stack position than a dialog.

---

## 24. Performance & Motion Constraints

Section 9 states the *usability* reasoning for motion; this section states the *technical* discipline that keeps that motion cheap, so "premium-feeling" never costs responsiveness (the exact tradeoff Section 15 warns against under "overusing shadows/gradients").

- **Animate only `transform` and `opacity`.** Every entry in Section 9's table is achievable through these two properties. Layout-triggering properties (`width`, `height`, `top`, `left`, `margin`) are never animated directly — the one apparent exception, the Version History accordion's "height auto-animate" (Section 9), is implemented via a measured-height technique (animating to a computed pixel value, then `transform`-based reveal) rather than naive `height: auto` transitions, which jank.
- **Hard 300ms ceiling, no exceptions** (already stated at 8.8/9 — repeated here as a technical constraint, not just a taste preference): anything that would need to exceed it should be redesigned as a progress indicator instead of a longer animation.
- **`prefers-reduced-motion` always wins** (13.6/9): every animation in Section 9 has an instant-state-change fallback; this is a hard requirement, not a nice-to-have, since functionality must never be gated behind an animation completing.
- **No layout shift on load.** Skeletons mirror exact shape and row count (8.15); images/thumbnails reserve their aspect ratio box before the asset loads, so a slow-loading Resource card thumbnail never pushes surrounding content down after first paint.
- **Lazy-load below-the-fold content** on infinite-scroll surfaces (Discover, Search Results, Browse — Section 10 "Pagination") — only the visible plus a small buffer of upcoming cards render fully; further cards mount as the user approaches them.
- **No animation replay on repeated actions** (already stated at Section 9's "must NOT" list) — restated here as a performance point, not just an attention point: re-triggering a full entrance animation on every page of a 40-item queue is wasted computation with no usability upside.
- **Debounced search stays debounced** (Section 10 "Search") — this is also a performance constraint, not purely a UX one: an un-debounced as-you-type search would multiply backend calls with no benefit to the result quality the user sees.

---

## 25. AI Implementation Constraints (extends Section 16)

These add process discipline on top of Section 16's content discipline — Section 16 governs *what* may appear in `wireframe.md`; this section governs *how the plan itself must be treated* across sessions and iterations, addressing the specific failure mode of a multi-session AI implementation drifting from its own earlier decisions.

- **Never redesign an already-approved screen without updating this plan document first.** If implementation reveals that a screen in Section 4.1 needs to change shape, the change is proposed as an edit to this document (with its own reasoning, per Section 5's "state why" discipline) before it's built — not silently reinterpreted at the wireframe or code stage.
- **Reuse before creation.** Before introducing what looks like a new component, check Sections 10, 21, and 22 for an existing analogous entry. A genuinely new component requires a stated behavior gap that no existing entry covers — the same evidentiary bar Section 4.1 already applies to a proposed 26th screen.
- **No new navigation pattern mid-project.** The four-item bottom nav + context-aware FAB (Section 7.1–7.2) and the authority-based sidebar (Section 3.2) are the whole navigation system; a later addition (e.g., a hamburger menu, a secondary tab bar) is out of scope unless this document is revised first.
- **No new interaction style without it first appearing in Sections 9–11, 18, 21, or 22.** E.g., a drag-to-reorder interaction, a right-swipe-to-archive pattern, or any gesture beyond Section 7.4's three named ones needs to be added here before it's implemented, not invented ad hoc for "one screen that seemed to need it."
- **Token values in Section 23 are fixed inputs, not starting suggestions.** `wireframe.md` and downstream code may not introduce a spacing, radius, elevation, motion-duration, or z-index value outside Section 23's table.
- **A journey step that would require an unlisted screen stops and flags — it doesn't improvise one.** Section 18's journeys are traced entirely through Section 4.1's site map; if implementing a journey seems to need an intermediate screen not in that table, that's the same "flag, don't invent" situation Section 16 already describes for screens in general.
- **Every new Open Question follows Section 17's format.** If building the frontend surfaces a genuinely new ambiguity the source documents don't resolve, it's added to Section 17 with the same structure (what's missing, what was assumed instead, why) — never resolved silently mid-implementation.

---

## 26. Cinematic Experience Layer (Motion.dev Implementation)

### 26.1 Why, and what this is not
Section 1's principle 6 states the goal: Discover, Resource Detail, and onboarding should feel like a considered, editorial experience — not because the product is being sold, but because a set of exam notes deserves to feel like something worth opening. This section is the concrete mechanism. It is **not** a new visual language, a new component set, or a license to add chrome: every rule from Sections 8 (visual system), 10 (component behavior), 14 (consistency), and 19 (cognitive-load budget) still applies without exception. What changes is *how content enters and moves on screen* — the physics, sequencing, and typographic confidence of presentation — never *what information appears* or *how many actions compete for attention*.

### 26.2 The engine
The app standardizes on **Motion.dev** (`motion`, the successor to Framer Motion) as its single animation library, for React and vanilla JS alike. One engine, one physics model, used everywhere motion appears — this is what makes a button press and a page transition feel like they belong to the same product, and it's why Section 27 forbids mixing in a second animation library later. Three named spring presets (§26.7) replace the vaguer "100ms / 150–200ms / 250ms" durations in Section 9's table with an actual physics model — springs, not eased durations, are the default for everything in this section, because a spring is what makes motion feel alive rather than merely timed.

### 26.3 Core techniques
- **Spring physics as the default, not eased duration curves.** Every interaction in Section 9's table that specifies a duration is, on the content surfaces this section governs, implemented as a Motion spring using one of the three presets in §26.7 instead. A spring settles at a natural, slightly organic pace rather than stopping dead at a fixed millisecond — this is the single biggest contributor to "cinematic" versus "timed."
- **Shared layout transitions via `layoutId`.** Section 9's table already names the Resource card → Resource Detail "shared element transition" qualitatively; Motion's `layoutId` is the literal implementation — the same DOM identity persists across the navigation, so the thumbnail and title genuinely move and resize into their detail-page position rather than one view fading out while another fades in. Same technique for a Moderation Queue item opening into its within-queue detail panel (§18.5) — though there, per §26.5, the transition itself is instant/utilitarian (`spring-snappy`, §26.7), never a slow cinematic morph, because a moderator's queue is not a content-surface.
- **Scroll-linked reveals (`whileInView`, `useScroll`/`useTransform`).** Discover's "recently approved" grid and the spotlight (§26.4) fade and rise into view as the user scrolls to them, staggered across siblings at `stagger-interval` (§26.7). This fires once on first paint of a given scroll position only — it never replays on scroll-back, and it never applies to a list beyond ~20 items, both restating (not overriding) Section 9's existing "must NOT" list.
- **A single, scoped parallax.** The Discover hero/spotlight background layer moves at roughly 0.3× the foreground's scroll speed — the *only* place parallax appears anywhere in the product. It is presentation on one card, not a page-wide scroll effect, and it never appears on a queue, table, or admin screen.
- **Gesture-driven drag physics.** The swipe-to-approve/reject accelerator (§7.4) and bottom-sheet dismissal (§7.5) use Motion's `drag` with `dragElastic` for a natural rubber-band resistance rather than a linear follow — still, per §13's existing rule, an accelerator for a control that's also present as a plain button, never the only way to act.

### 26.4 Discover Home — from dashboard to editorial spotlight
This extends, and does not replace, §4.2's Discover content hierarchy.
- **Above the fold:** one large spotlight — a single resource or platform highlight presented at Display-token scale (§8.1), generous whitespace around it, the scoped parallax background from §26.3, headline text that reveals word-by-word or line-by-line on first paint (capped per §26.7's hero-reveal exception). This is a presentation change applied to an item already sourced from the existing "recently approved / platform highlights" feed (§4.2) — see Open Question 12 for the one thing about it that's genuinely unresolved (which item gets picked).
- **Search stays first in interaction priority.** The spotlight is presentation, not a competing primary action — Section 14's "exactly one primary CTA" rule holds because the spotlight's own action ("open this resource") is the same single-purpose action any card has, not a second, competing CTA.
- **Cards below the spotlight are unchanged in substance.** Type icon, ≤2 badges (§19), one-line metadata — nothing about §10's Card definition or §21's state matrix changes. Only their *entrance* (§26.3's scroll reveal) and *hover* (spring-eased lift instead of linear) change. This is the load-bearing distinction the whole section rests on: cinematic is a property of *motion*, never of *information density* — adding a decorative element to satisfy a "premium" feeling would be exactly the Section 15 mistake ("overusing shadows/gradients for premium feel") this document already warns against, just committed with motion instead of gradients.

### 26.5 Explicit non-goals — where Section 1 and Section 5 outrank this section
- **Moderation queues, admin CRUD tables, analytics, and audit/override screens get none of this.** Section 9's existing ceiling (no stagger beyond ~20 rows, no repeated entrance animation, no motion delay on a destructive confirmation) is absolute and unmodified. A CR/Co-CR clearing 30 queue items has zero use for a cinematic reveal and every use for the instant, Linear-fast response Section 1 already promises them — this section adds literally nothing to Section 5's reasoning for why queues are dense lists, not card grids.
- **State and visibility badges are never delayed for cinematic effect.** Section 1 principle 1 ("state is never hidden") outranks any entrance animation in this section — a badge's color and label are correct and legible from the first rendered frame; at most its *fade-in* is animated alongside the card, never its *correctness*.
- **`prefers-reduced-motion` collapses everything in this section to instant states** — same hard requirement as §13.6/§24. With reduced motion set, the spotlight becomes a static block, parallax and stagger disable entirely, and `layoutId` morphs become plain instant navigation. This section is additive polish, never a functional dependency.

### 26.6 Component-level notes (extends Section 21's state matrix, content surfaces only)
- **Resource Card:** entrance = fade + ~12px rise on scroll into view, `spring-gentle`, staggered by `stagger-interval` across a visible row, first-load-only. Hover keeps §21's existing Level 0→1 lift, now spring-eased (`spring-snappy`) instead of a linear transition.
- **Spotlight/hero card:** parallax background (§26.3), large-format headline reveal capped at the hero-reveal exception (§26.7) — this is the one place in the entire product where the 300ms motion ceiling (§24) is deliberately exceeded, and only there, only once per session per surface.
- **Discover → Resource Detail transition:** `layoutId` morph (§26.3) supersedes the generic crossfade description in Section 9's page-transition row, for this specific navigation only. Every other page transition in the product keeps Section 9's plain crossfade unchanged.

### 26.7 Tokens added (extends Section 23 — additive only, nothing in Section 23's existing rows changes)

| Token | Value | Used for |
|---|---|---|
| `spring-snappy` | stiffness 400, damping 30 | Button press, selection, chip toggle, queue-item transitions (§26.5) |
| `spring-smooth` | stiffness 200, damping 26 | Drawer, sheet, standard page transitions |
| `spring-gentle` | stiffness 120, damping 20 | Scroll-linked reveals, hero/spotlight, parallax |
| `stagger-interval` | 40–60ms | Card-grid entrance, first load only, capped at ~20 items per Section 9 |
| Hero-reveal ceiling | ~400ms total, once per session per surface | The single, explicit, scoped exception to Section 24's 300ms ceiling — nowhere else in the product |

---

## 27. AI Implementation Additions for Motion (extends Section 25)

- **Motion.dev is the only animation library.** No mixing in React Spring, GSAP, raw CSS keyframes, or another engine for anything beyond a trivial one-off — consistent spring feel across the app depends on one physics system, not several approximating each other.
- **Any new animated element maps to a named technique.** Before adding motion somewhere new, check Section 9's table and Section 26.3's technique list for an existing entry — the same "reuse before invention" discipline Section 25 already applies to components applies here to motion.
- **Cinematic treatment is scoped, not a house style.** Section 26.4–26.6 apply to Discover, Resource Detail, and onboarding surfaces only. An implementer must not add hero treatment, parallax, or extended stagger to a moderation queue, admin table, or audit screen to make it "feel more premium" — doing so would directly contradict Section 1's trust-legibility mandate and Section 5's density-is-a-feature reasoning, both of which outrank this section by design (§26.5).
- **Ship the reduced-motion, instant-state version first.** Build the functional, motion-off baseline, then layer Motion.dev's springs and reveals on top — never the reverse, since §26.5 requires the instant-state fallback to be complete and correct, not a stripped-down afterthought.
- **The hero-reveal ceiling in §26.7 is the only sanctioned exception to Section 24's 300ms rule.** No other screen or component may cite this section to justify exceeding that ceiling.

---

## 28. Zoom-Through Navigation (Origin-Scale Page Transitions)

### 28.1 What it is
Clicking any navigable trigger — a button, a Resource card, a nav item — causes that trigger's own bounding box to expand via a Motion.dev `layoutId` interpolation until it fills the viewport and becomes the destination page. Navigating back (browser back, iOS swipe-back, Android system back — the same gesture set §3.6 already governs) plays the identical transform in reverse: the current page's container shrinks back down into the exact position and size of the trigger that opened it, while the previous screen — already mounted, already in its correct scroll/filter state per §3.6 — reappears beneath it. The destination doesn't "load in"; it emerges from the thing you clicked, and going back doesn't "navigate away"; it visibly returns to where you were.

### 28.2 Mechanism (Motion.dev implementation)
- Every navigable trigger is wrapped in a `motion` element carrying a `layoutId` unique to that trigger → destination pair (e.g. `layoutId="nav-signin"` on both the Sign In button and the root container of the Login page; `layoutId="resource-{id}"` on a Resource card and its Resource Detail root, per §26.3).
- On click, Motion's layout animation interpolates the trigger's current box (position, size) to the destination container's full-viewport box, at the surface-appropriate spring from §26.7 (see §28.5).
- The destination's own content (headline, form fields, card grid) is a nested child that fades/rises in slightly *after* the frame's expansion begins — a short ~40–80ms child delay — so the sequence reads as "the button became the page, and then the page's content appeared," not two things happening at once.
- The expanding shape's own background color is part of the same interpolation (button fill → page background), so there's never a frame of unstyled or mismatched background mid-scale.

### 28.3 Back navigation is the same transform, reversed — not a second animation
This is the detail that makes zoom-*out* feel like zoom-*out* rather than an unrelated shrink: back-navigation doesn't get its own bespoke animation. It plays §28.2's interpolation with start and end swapped — current page → trigger's original box — using the same spring preset that opened it. Content fades out slightly *ahead* of the shrink completing, mirroring the "content arrives after the frame" sequencing from §28.2. Because the prior screen is already correctly restored per §3.6 before the shrink finishes, there's nothing to visibly "load" underneath — it's simply revealed.

### 28.4 When there's no natural shared shape
A Resource card zooming into Resource Detail has an obvious shared shape already (§26.3's `layoutId`). A plain button — "Sign in," "Upload," a nav item — doesn't resemble its destination page at rest. For these, the button's own bounding rect is still the valid origin: the destination root is simply given the same `layoutId`, and Motion interpolates a small, rounded, filled shape into a full-viewport one — corner radius animating from the button's `radius-sm` (§8.4/23) toward the page's outer edge, fill color animating from the button's accent/neutral fill toward the page background, over the same transform. Visually it reads as the button expanding and becoming the frame of the next screen, exactly as it does for a card.

### 28.5 Surface-appropriate pacing — one pattern, tuned speed, not two patterns
- **Content surfaces** (Discover, Search Results, Resource Detail, onboarding, and the auth screens — Sign In, Register, Forgot/Reset Password) use `spring-smooth` (§26.7) for the zoom — felt and confident, still within Section 24's existing budget since it's a spring, not a fixed long duration.
- **Utility surfaces** (Moderation Queues, admin CRUD, analytics, audit/override) use the identical pattern at `spring-snappy` pace. The *shape* of the transition — expand from trigger, become the page, reverse on back — stays one coherent interaction language across the entire app (honoring Section 14's consistency rule and avoiding the "six different apps" failure Section 1 principle 4 already warns against). Only the *speed* changes, and it changes specifically so a CR/Co-CR or Sub Admin clearing a 30-item queue (§18.5) never feels slowed by it — this is how the pattern coexists with Section 1's Linear-speed promise to moderators and Section 5's "density is a feature" reasoning, rather than quietly overriding them.
- **Destructive/critical confirmations are exempt entirely**, not just slowed — Reject-with-reason, Delete, CRUD Override, and Emergency Appointment dialogs keep Section 9's existing plain fade + scale-from-98% modal treatment. A confirmation must never feel like "arriving somewhere new," since that would undercut the deliberate, non-cinematic weight Section 9's "must NOT" list already assigns to these specific moments.

### 28.6 Explicit non-goals
- **Zoom-through is a *navigation* pattern only** — page A to page B. It does not apply to opening a drawer, dialog, or bottom sheet, which keep their existing slide/fade treatment (§9, §10's Drawers/Dialogs definitions) since those are "look at this alongside what I was already looking at," not "I went somewhere."
- **Scroll-triggered card reveals are unaffected.** The staggered fade-and-rise from §26.3/26.6 on Discover's feed and Search Results (as shown in the mockups above) still happens on scroll into view — zoom-through only fires on an actual navigation click, never on scroll or on list load.
- **`prefers-reduced-motion` collapses zoom-through to an instant cut**, exactly as every other motion technique in this document (§13.6/§24) — this is the single most important non-goal here, since a full-viewport scale transform is precisely the kind of motion most likely to cause discomfort for someone who has opted out of animation. The instant-cut version must be built and correct first, per §27's existing "ship the reduced-motion baseline first" rule.

### 28.7 What this supersedes, and what it doesn't
- This **replaces** Section 9's generic "Page transitions: quick cross-fade + slight upward slide" row as the app-wide default — that row's *reasoning* ("signals new context, without disorienting or delaying") is preserved and, if anything, strengthened: a destination visibly emerging from the exact element clicked is a stronger fulfillment of "undisorienting" than a crossfade, not a departure from it.
- The Discover → Resource Detail card morph already specified at §26.3/26.6 is simply the resource-card-specific instance of this same general pattern — nothing about that description changes; it stops being a special case and becomes the norm every navigation follows.
- Every other row in Section 9's motion table (hover, dialog open, drawer/sheet, loading, success, error, toast, selection, expansion, focus) is **unchanged** — zoom-through only touches full-page navigation, not any of these other interaction types.
- Journeys 18.1–18.11 in Section 18 need no rewriting — they're composed of ordinary navigations, and every "→" in those traces now simply resolves through §28's mechanism instead of a plain crossfade; the *sequence* of screens each journey visits is identical.

---

## 29. AI Implementation Additions for Zoom-Through Navigation (extends Sections 25 and 27)

- **Wrap every navigable trigger with a `layoutId` per §28.2** before treating a screen as complete — a button or card that merely calls a router push without a matching `layoutId` on both ends produces a plain cut, not the zoom-through pattern this section specifies, and is a defect against it.
- **Never apply zoom-through to a drawer, dialog, sheet, or confirmation** (§28.6) — if an element opens "alongside" existing content rather than replacing the screen, it is not a navigation and keeps Section 9's existing drawer/dialog treatment untouched.
- **Reuse the two existing spring presets, don't invent a third pace.** §28.5's content-vs-utility split is achieved entirely with `spring-smooth` and `spring-snappy` from §26.7 — a new, differently-tuned spring for this pattern specifically would violate §25's "token values are fixed inputs" rule.
- **The reduced-motion, instant-cut version is the baseline, not an afterthought** — same rule §27 already states for the cinematic layer generally, repeated here because a full-viewport scale transform is the highest-risk animation in the entire document for anyone with motion sensitivity.
- **Moderation queues and admin/audit screens still get the pattern, just fast** — an implementer must not read §28.5's "utility surfaces" language as license to skip zoom-through there entirely; the shape stays universal per §14's consistency rule, only the spring preset changes.