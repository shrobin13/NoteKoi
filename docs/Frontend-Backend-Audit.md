# NoteKoi — Frontend vs. Backend Feature Audit

**Date:** 2026-08-04
**Scope:** `note-koi-frontend/src` pages vs. backend routes/validators documented in `docs/Features.md` and confirmed against `noteKoi-backend/src` (routes, validators, controllers).

---

## 🔴 BROKEN — Pages that call endpoints that don't exist or are wired incorrectly

### 1. `/upload` — "Add New Version" flow never calls the versioning endpoint
- **Evidence:** `my-uploads/page.tsx` links to `/upload?versionOf={id}` ("Add New Version"); `resources/[id]/page.tsx` links to `/upload?editId={id}` ("Edit Metadata").
- **Problem:** `upload/page.tsx` reads only `versionOf` and **never reads `editId`**. It never calls `addResourceVersion()` — `useUploadResourceMutation` always calls `createResource()` (POST `/resources`), creating a brand-new resource instead of a chained version. The `addResourceVersion` API function exists in `lib/api/resources.ts` but is **never imported/used anywhere**.
- **Result:** "Add New Version" creates a duplicate standalone resource; "Edit Metadata" on the resource detail page is a dead link (page ignores `editId`).

### 2. `/upload` — Payload mismatch with backend validator
- **Evidence:** `useUploadResourceMutation.ts` sends `uploaderId` and `uploaderRoleSnapshot` in the body.
- **Problem:** Backend `createResourceSchema` does **not** include `uploaderId` or `uploaderRoleSnapshot` — the backend derives both from the authenticated user. Extra keys are stripped by Zod. The frontend's role-snapshot logic (e.g., Teacher/Sub Admin choosing PLATFORM visibility) is **not honored**; the backend enforces its own visibility rules. The "Platform-wide" radio for teachers/sub-admins is misleading.

### 3. `/manage/sub-admin/queue` — Promotion Recommendations: no UI despite backend endpoints
- **Evidence:** `queue/page.tsx` renders an `UpcomingFeatureCard` for the "promotions" tab; query disabled for that tab.
- **Problem:** Backend has `POST /promotion-recommendations/:id/approve` and `/deny` (Features.md §Sub Admin), but the frontend has **no page/UI** to list pending recommendations or approve/deny them. `approveRecommendation`/`denyRecommendation` do not exist in `lib/api/admin.ts`.

### 4. `/manage/sub-admin/queue` — `tab` query param unsupported by backend
- **Evidence:** `getSubAdminQueue(1, tab)` sends `?tab=...` (`lib/api/admin.ts`).
- **Problem:** Backend `GET /sub-admin/queue` (`moderation.routes.ts`) has **no query validation schema** for `tab`. Tabs ("Teacher Uploads" / "Platform Resources") show the same unfiltered data.

---

## 🟡 PARTIALLY BROKEN / INCORRECT

### 5. `/resources/[id]` — "Edit Metadata" link is a dead end
- **Evidence:** `resources/[id]/page.tsx` links to `/upload?editId=${id}`.
- **Problem:** Upload page ignores `editId`. Only `/my-uploads` metadata editing works. Clicking Edit on the resource detail page opens a blank upload form.

### 6. `/resources/[id]` — "Recommend for Platform" gating incomplete
- **Evidence:** `resources/[id]/page.tsx`: `canRecommend = isCR && visibility === "COLLEGE" && state === "APPROVED"`.
- **Problem:** Backend requires the CR to be **active** for the resource's (Department + Session) scope (`requireActiveCrCoCr`). Frontend only checks `user.role === "CR" || "CO_CR"`, not the active assignment scope. A CR outside the resource's department/session sees the button and gets a 403.


i. Profile page, SignUp, Sign In page  e kono Navigation (Nav, Footer) section nai
ii. Register as a teacher korte gele College select korar por second field(departments) field shows nothing, doesn’t work, and department iii. select korte na paray register kora jayni
iv. Register as a student a same issue, department or session nothing can be selected, 
v. Sign up er (as a student, or as a teacher) confirm password option nai, register, login page e password visibility button nai
vi. http://localhost:3000/manage/sub-admin/analytics crThroughput?.reduce is not a function
vii. src/app/manage/sub-admin/analytics/page.tsx (79:31) @ SubAdminAnalyticsPage
viii. On submit resource no success message and redirect is happening (no clue if the file is submitted or not)
ix. Submitted files isn’t showing 
---

## Summary Table

| Page | Issue | Severity |
|---|---|---|
| `/upload` (version flow) | `addResourceVersion` never called; creates duplicate instead of version | 🔴 High |
| `/upload` (edit flow) | `editId` param ignored; dead link from resource detail | 🔴 High |
| `/upload` (payload) | Sends `uploaderId`/`uploaderRoleSnapshot` not in backend schema; PLATFORM visibility UI misleading | 🟡 Medium |
| `/manage/sub-admin/queue` | Promotion tab is placeholder; no approve/deny UI despite backend endpoints | 🔴 High |
| `/manage/sub-admin/queue` | `tab` param unsupported by backend; tabs show same data | 🟡 Medium |
| `/resources/[id]` | Recommend button doesn't check active CR scope | 🟡 Medium |

**Most critical:** the versioning flow (never calls the backend version endpoint) and the Sub Admin promotion decision UI (missing entirely despite backend support).
