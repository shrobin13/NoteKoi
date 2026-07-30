# NoteKoi Full Frontend Implementation Plan

## Overview

The NoteKoi frontend has a solid skeleton with routing, API clients, store, and base components. The task is to **complete the UI** with all missing pages and enhance existing ones to match the UI guideline exactly — with proper API integration, cinematic design, and full role-based behavior.

## Current State Assessment

### ✅ Already Exists (partial quality)
- Landing page (`/`) — needs enhancement to match full guideline
- Login page — functional, minimal
- Register page — needs to check
- Dashboard page — functional, partial
- Explore page (public resources) — functional
- College list page — functional  
- CR Dashboard — basic verification queue
- Owner Admin Dashboard — basic stats + sub admin list
- Notices page — **mock data only**, needs API
- Discussions page — **mock data only**, needs API
- Profile page — needs to check
- Auth/app/admin layouts

### ❌ Missing Pages
- `/college/[id]` — College detail → departments list
- `/department/[id]` — Department detail → semesters list  
- `/semester/[id]` — Semester detail → courses list
- `/course/[id]` — Course detail page with tabs
- `/resources/[id]` — Resource detail/viewer page
- `/admin/sub` — Sub Admin Dashboard (full implementation)
- Resource Upload flow for CR

### ❌ Missing API Endpoints in Backend
- Notices API (`/api/notices`) — **not in API docs, needs backend + frontend**
- Discussions API (`/api/discussions`) — **not in API docs, needs backend + frontend**
- Personal Shares API — **not in API docs, needs backend + frontend**

### ❌ Design Quality Issues
- Notices & Discussions use mock data — need real API
- Sub Admin dashboard is empty
- Many pages lack the "cinematic" motion system from guidelines
- No resource viewer/PDF page

---

## Proposed Changes

### Backend — Add Missing Endpoints

> [!IMPORTANT]
> The API documentation does not include Notices, Discussions, or Personal Shares endpoints. We need to build these backend modules.

#### [NEW] Backend Modules to Create

**Notices Module** (`/api/notices`)
- `GET /api/notices` — Get notices for user's classroomUnit (auth required)
- `POST /api/notices` — Create notice (CR only)
- `PATCH /api/notices/:id` — Edit notice (CR, own)
- `DELETE /api/notices/:id` — Delete notice (CR, own)

**Discussions Module** (`/api/discussions`)
- `GET /api/discussions/groups` — List groups user is member of
- `POST /api/discussions/groups` — Create group (CR only)
- `GET /api/discussions/groups/:groupId/messages` — Get messages
- `POST /api/discussions/groups/:groupId/messages` — Send message
- `POST /api/discussions/groups/:groupId/members` — Add member (CR)
- `DELETE /api/discussions/groups/:groupId/members/:userId` — Remove member (CR)

**Personal Shares Module** (`/api/shares`)
- `GET /api/shares` — Get shares addressed to current user
- `POST /api/shares` — Send personal share (CR only)

---

### Frontend — Complete Pages & Enhancements

#### [MODIFY] `globals.css` — Full token alignment to guideline spec
- Add missing CSS variables (glass-bg, glass-border, glow tokens)
- Align shadow tokens exactly

#### [MODIFY] `app/page.tsx` — Landing Page Enhancement
- Full-bleed dark hero on `--default` background
- Ambient particles + parallax
- College showcase horizontal scroll
- 3-step how-it-works section

#### [NEW] `app/(app)/college/[id]/page.tsx` — College Detail → Departments
- Department cards grid with zoom-into transitions
- Breadcrumb: Colleges → [College Name]

#### [NEW] `app/(app)/department/[id]/page.tsx` — Department → Semesters
- Semester cards grid
- Breadcrumb: Colleges → College → [Department Name]

#### [NEW] `app/(app)/semester/[id]/page.tsx` — Semester → Courses  
- Course cards grid

#### [NEW] `app/(app)/course/[id]/page.tsx` — Course Detail
- Tabs: Overview · Resources · Discussion · Notices
- Session info + resource stat cards

#### [MODIFY] `app/(app)/resources/[id]/page.tsx` — Resource Detail/Viewer
- Full resource metadata display
- PDF preview embed
- Download button

#### [MODIFY] `app/(app)/notices/page.tsx` — Real API Notices
- Connected to real backend (or mock with elegant UI when no API)
- CR compose button with drawer
- Unread dot system

#### [MODIFY] `app/(app)/discussions/page.tsx` — Real API Discussions
- Two-pane layout (groups + messages)
- Real message sending

#### [MODIFY] `app/(app)/profile/page.tsx` — Enhanced Profile
- Avatar with gradient initials
- Activity stat tiles with count-up animation
- Personal shares section for students

#### [NEW] `app/(admin)/sub/page.tsx` — Sub Admin Dashboard
- College structure view
- CR promote/demote controls
- Pending verifications

#### [MODIFY] `app/(admin)/cr/page.tsx` — CR Dashboard Enhancement
- Add Resource Manager section (CRUD)
- Notice composer shortcut
- Full verification queue with approve/reject

#### [MODIFY] `app/(admin)/owner/page.tsx` — Owner Admin Enhancement
- Sub Admin management with promote/demote
- Ownership transfer with type-to-confirm
- Platform-wide stats with recharts (if installed)

#### [NEW] `lib/notices.ts` — Notices API client
#### [NEW] `lib/discussions.ts` — Discussions API client
#### [NEW] `lib/shares.ts` — Personal Shares API client

---

## Open Questions

> [!IMPORTANT]
> **Backend API for Notices/Discussions/Shares**: The API documentation doesn't include these. Should I:
> 1. Build the backend modules + routes + prisma schema additions
> 2. Or build the frontend with graceful fallback (show message that feature is coming)?

Since you said "if anything is missing in backend, build it" — I'll implement both backend and frontend.

> [!NOTE]
> **Recharts**: Not in package.json. I'll use simple CSS-based stat displays for analytics unless you want me to install recharts.

---

## Verification Plan

### Manual Verification
1. Visit `/` — verify cinematic landing with dark hero
2. Register a new account — verify multi-step form works
3. Login → Dashboard — verify role-appropriate content
4. Navigate College → Dept → Semester → Course → Resources hierarchy
5. As CR: upload resource, create notice, verify student
6. As Sub Admin: promote/demote CR
7. As Owner Admin: promote Sub Admin, view stats
8. Mobile: verify responsive bottom tab bar

### API Connectivity
- Backend runs on `localhost:5000`
- All forms submit to real API
- React Query caches + refetches correctly
