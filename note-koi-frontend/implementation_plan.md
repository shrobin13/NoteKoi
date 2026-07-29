# NoteKoi — Ultra-Premium Frontend Implementation Plan

A living knowledge universe for College Resource & Academic Collaboration.

## Background

The backend is a fully-built NestJS/Express REST API with JWT auth, role-based access control (OWNER_ADMIN → SUB_ADMIN → CR → STUDENT), and a clean hierarchy: College → Department → Semester → Course → Session → ClassroomUnit.

The existing Next.js 16 + Tailwind CSS 4 + TypeScript project is essentially empty (just a default scaffold). We are building the entire frontend from scratch inside it.

---

## User Review Required

> [!IMPORTANT]
> The PRD specifies **Next.js + TypeScript + Tailwind CSS** as the tech stack. The existing scaffold is already using TailwindCSS v4. The design system below will use CSS custom properties + TailwindCSS for implementation. I'll also install `framer-motion` for the cinematic animation system, `lucide-react` for icons, and `zustand` for lightweight state management.

> [!IMPORTANT]
> The design uses a warm editorial palette:
> - `--primary: #8FBF9F` (sage green)
> - `--secondary: #68a67d` (deeper green)
> - `--accent: #F18F01` (amber)
> - `--bg: #F5ECD7` (warm cream)
> - `--defaultColor: #24613b` (forest green)
> - `--text: #353535` (near-black)
>
> This warm + nature aesthetic is retained throughout. Dark mode optional in later phases.

> [!WARNING]
> The backend API base URL is `http://localhost:5000`. All API calls will use a central `lib/api.ts` client that reads `NEXT_PUBLIC_API_URL` from the environment. You should set this in `.env.local`.

---

## Open Questions

> [!IMPORTANT]
> **Q1: Google Drive file upload flow** — The backend stores `fileId`, `fileUrl`, `previewUrl` as strings. Does the CR upload directly to Google Drive on the frontend and then POST the resulting IDs to the backend? Or does the backend handle the Drive upload? This plan assumes: **the backend handles file upload** (CR posts a file form-data and the backend returns the Drive URLs). If not, please clarify before Phase 2 implementation.

> [!IMPORTANT]
> **Q2: Discussion & Notices** — The API docs don't include endpoints for Notices, Discussion Groups, Messages, or Personal Shares. This plan implements the UI for these but marks them as "Phase 2 — mock data only" until the API endpoints are available.

---

## Proposed Changes

### Foundation & Configuration

#### [MODIFY] [globals.css](file:///home/saikat/Desktop/work-files/NoteKoi/note-koi-frontend/app/globals.css)
Full design system reset: CSS custom properties for the brand palette, typography scale, animation tokens, noise texture overlay, glassmorphism variables.

#### [MODIFY] [layout.tsx](file:///home/saikat/Desktop/work-files/NoteKoi/note-koi-frontend/app/layout.tsx)
Update with General Sans / Satoshi font imports, proper metadata for NoteKoi, and global providers wrapper.

#### [NEW] `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### Packages to Install

```bash
pnpm add framer-motion lucide-react zustand @tanstack/react-query axios clsx
```

---

### Library Layer (`lib/`)

#### [NEW] `lib/api.ts`
Axios client with interceptors for Bearer token injection from `localStorage` and 401 refresh token handling.

#### [NEW] `lib/auth.ts`
Auth helper functions: `login()`, `register()`, `logout()`, `refreshToken()`, `getMe()`.

#### [NEW] `lib/hierarchy.ts`
Hierarchy fetchers: colleges, departments, semesters, courses, sessions, classroomUnits.

#### [NEW] `lib/resources.ts`
Resource fetchers: public list, unit list, single, create, update, delete.

#### [NEW] `lib/admin.ts`
Admin API: stats, sub-admin management, ownership transfer.

#### [NEW] `lib/verification.ts`
Verification request & approval flows.

---

### State Management (`store/`)

#### [NEW] `store/auth.ts`
Zustand store: `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `login()`, `logout()`.

#### [NEW] `store/ui.ts`
Zustand store: `commandPaletteOpen`, `sidebarOpen`, `currentBreadcrumb[]`.

---

### Component System (`components/`)

#### Design System Components

- **[NEW] `components/ui/Button.tsx`** — Variants: primary, secondary, ghost, danger. Spring hover animations.
- **[NEW] `components/ui/Card.tsx`** — Rounded-2xl, soft shadow, hover lift with Framer Motion.
- **[NEW] `components/ui/Badge.tsx`** — Category badges (Lecture, Notes, PYQ, Tutorial, Software, Other).
- **[NEW] `components/ui/Input.tsx`** — Floating-label inputs with focus animations.
- **[NEW] `components/ui/Modal.tsx`** — Blur backdrop, spring enter/exit animations.
- **[NEW] `components/ui/Skeleton.tsx`** — Shimmer loading placeholders.
- **[NEW] `components/ui/Toast.tsx`** — Slide-in notification toasts.
- **[NEW] `components/ui/CommandPalette.tsx`** — ⌘K global search overlay with animated list.

#### Layout Components

- **[NEW] `components/layout/Navbar.tsx`** — Top nav with animated logo, breadcrumb trail, profile dropdown.
- **[NEW] `components/layout/Sidebar.tsx`** — Collapsible sidebar for dashboard views.
- **[NEW] `components/layout/Breadcrumb.tsx`** — Animated breadcrumb reflecting hierarchy depth.
- **[NEW] `components/layout/PageTransition.tsx`** — Framer Motion `AnimatePresence` wrapper for page transitions.
- **[NEW] `components/layout/AmbientBackground.tsx`** — Floating particle + gradient ambient layer.

#### Feature Components

- **[NEW] `components/auth/LoginForm.tsx`**
- **[NEW] `components/auth/RegisterForm.tsx`**
- **[NEW] `components/hierarchy/CollegeCard.tsx`** — Zoom-into animation on click.
- **[NEW] `components/hierarchy/DepartmentCard.tsx`**
- **[NEW] `components/hierarchy/SemesterCard.tsx`**
- **[NEW] `components/hierarchy/CourseCard.tsx`**
- **[NEW] `components/resources/ResourceCard.tsx`** — File type icon, category badge, download/preview buttons.
- **[NEW] `components/resources/ResourceGrid.tsx`** — Staggered reveal animation.
- **[NEW] `components/resources/PDFPreview.tsx`** — Embedded Google Drive iframe preview.
- **[NEW] `components/resources/UploadModal.tsx`** — CR-only resource upload form.
- **[NEW] `components/dashboard/StatCard.tsx`** — Animated counter stat cards.
- **[NEW] `components/dashboard/ActivityFeed.tsx`**
- **[NEW] `components/verification/VerificationBanner.tsx`** — Unverified account banner.
- **[NEW] `components/verification/PendingList.tsx`** — CR/admin pending verification list.
- **[NEW] `components/notices/NoticeCard.tsx`** — (Phase 2, mock data)
- **[NEW] `components/discussions/DiscussionThread.tsx`** — (Phase 2, mock data)

---

### Pages (App Router)

#### Public Routes

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | **Landing Page** — cinematic hero, features, CTA |
| `/login` | `app/(auth)/login/page.tsx` | Login form with zoom transition |
| `/register` | `app/(auth)/register/page.tsx` | Multi-step registration: name+email → college+unit → password |
| `/explore` | `app/explore/page.tsx` | Public resource browser (no auth) |

#### Authenticated Routes (Student/CR)

| Route | File | Description |
|---|---|---|
| `/dashboard` | `app/(app)/dashboard/page.tsx` | Student Dashboard |
| `/college` | `app/(app)/college/page.tsx` | College detail |
| `/college/[id]/departments` | `app/(app)/college/[id]/departments/page.tsx` | Departments list with zoom cards |
| `/department/[id]/semesters` | `app/(app)/department/[id]/semesters/page.tsx` | Semesters |
| `/semester/[id]/courses` | `app/(app)/semester/[id]/courses/page.tsx` | Courses |
| `/course/[id]` | `app/(app)/course/[id]/page.tsx` | Course Detail + Resources |
| `/resources/[id]` | `app/(app)/resources/[id]/page.tsx` | PDF Viewer |
| `/search` | `app/(app)/search/page.tsx` | Search Experience |
| `/notices` | `app/(app)/notices/page.tsx` | Notice Board (Phase 2) |
| `/discussions` | `app/(app)/discussions/page.tsx` | Discussions (Phase 2) |
| `/profile` | `app/(app)/profile/page.tsx` | User Profile |

#### Admin Routes

| Route | File | Description |
|---|---|---|
| `/admin/cr` | `app/(admin)/cr/page.tsx` | CR Dashboard |
| `/admin/sub` | `app/(admin)/sub/page.tsx` | Sub Admin Dashboard |
| `/admin/owner` | `app/(admin)/owner/page.tsx` | Owner Admin Dashboard |

#### Layout Files

- `app/(auth)/layout.tsx` — Auth layout: centered card, ambient background
- `app/(app)/layout.tsx` — App layout: sidebar + navbar + breadcrumb
- `app/(admin)/layout.tsx` — Admin layout: admin sidebar + stats header

---

### Animation System

Using **Framer Motion** throughout:

1. **Page Transitions** — `AnimatePresence` with `y: 20 → 0` + `opacity: 0 → 1`, `spring` physics
2. **Zoom Navigation** — Cards scale from `1 → 1.05` on hover, `layoutId` shared element transitions for the "zoom into" navigation feel
3. **Staggered Lists** — `staggerChildren: 0.08` for resource/course grids
4. **Ambient Particles** — CSS keyframe floating blobs with `blur(40px)` and low opacity
5. **Morphing Containers** — `layout` prop for smooth height/width changes
6. **Command Palette** — Spring scale + blur backdrop
7. **Card Hover** — `whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(143,191,159,0.25)" }}`
8. **Breadcrumb** — Animated path with `AnimatePresence`

---

## Verification Plan

### Automated Tests
- `pnpm build` — TypeScript compilation must pass with zero errors

### Manual Verification
- Navigate `/` → `/login` → `/dashboard` → `/college/.../departments` → resource viewer
- Upload a resource as CR user (Phase 1 mock)
- Verify pending student as CR user
- Check Owner Admin `/admin/owner` stats dashboard
- Test mobile responsiveness at 375px, 768px, 1280px
- Verify Framer Motion animations play on route transitions
- Confirm API client sends `Authorization: Bearer <token>` header
