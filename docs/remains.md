# What Remains to Build

Ordered by dependency — items higher up must be completed before items that depend on them. Each item references the spec section it satisfies.

---

## Priority 1 — Backend gaps (blocking frontend work)

### 1.1 Notification dispatch on resource approval/rejection
**Spec §3.8**

`resourceStateMachine.service.ts` has `approve()` and `reject()` functions but neither calls `createNotification`. The `NotificationType` enum already has `RESOURCE_APPROVED` and `RESOURCE_REJECTED` entries. Fix both functions to fire notifications after state change.

Also wire `DELETION_APPROVED` and `DELETION_DENIED` in `decideDeletionRequest` inside the repository.

Also wire `PROMOTED_RESOURCE_LATER_REJECTED` when a resource that was previously promoted gets rejected on re-review — this requires detecting whether the resource had a prior PLATFORM promotion event.

### 1.2 Static file serving
Files are uploaded to local disk via Multer but `server.ts` has no static file middleware. Add:
```ts
app.use("/uploads", express.static("uploads"));
```
Or switch to object storage (Cloudflare R2 / S3) and return a signed URL instead of a local path.

### 1.3 Admin override actually executes state changes
**Spec §5.9, §5.4a, §1.4/§1.5**

`performResourceOverride` and `performEmergencyAppointment` currently only write to `AdminOverrideLog` — they do not execute the underlying action. 

- `performResourceOverride`: after logging, actually call the appropriate state machine function (approve/reject/delete the resource in the DB).
- `performEmergencyAppointment`: after logging, actually create the Sub Admin or CR/Co-CR assignment row.

### 1.4 Add `name` field to User model
The frontend (`types.ts`, profile page, resource detail, upload guide) expects `user.name`. The backend User model and all DTOs do not include a `name` field. Add an optional `name` (display name) field to the `User` model, include it in DTOs, and add a migration.

### 1.5 CR/Co-CR detection endpoint
**Spec §0.2, §0.3**

The backend returns `role: "STUDENT"` for CR/Co-CR users. The frontend cannot know whether a Student has CR/Co-CR elevation without querying assignments. Add an endpoint:

```
GET /api/v1/users/me/assignments
```

Returns any active `CrCoCrAssignment` rows for the current user (departmentId, sessionId, type). The frontend uses this to render the elevated moderation UI.

---

## Priority 2 — Discover/Home page (core user-facing feature)

### 2.1 Build the Discover hub (home page)
**Spec §2, §4**

`app/(app)/page.tsx` is currently a placeholder stub. Replace it with a real discovery page:

- **Recent resources** — fetch `GET /api/v1/resources?limit=10` and display with `ResourceCard`
- **Browse by department** — list departments (filtered to user's college-adopted ones); clicking a department navigates to a department page
- **Stats strip** — total resources count, total PLATFORM resources (optional, adds life to the page)
- **Role-aware greeting** — show user's name/role; show "Upload a resource" CTA for Students/Teachers; show "Review queue" CTA for CR/Sub Admin

### 2.2 Department → Session → Course browse
**Spec §2.1**

Create the hierarchical browse flow:
- `/browse/[departmentId]` — lists sessions for the department; shows adopted-only departments for Student/Teacher
- `/browse/[departmentId]/[sessionId]` — lists courses within that session; lists resources per course
- Breadcrumb navigation at each level

### 2.3 "Include other colleges" toggle
**Spec §0.3, §4.3**

Add a toggle on the Search page and on browse pages. When enabled, the `?includeOtherColleges=true` query param is passed to `GET /api/v1/resources`. The backend already supports this param.

---

## Priority 3 — Upload form improvements

### 3.1 Replace raw ID inputs with dropdowns
**Spec §3.1, §3.2**

The upload form currently has plain text inputs for Course ID and Department ID. Replace them with cascading dropdowns:
- Department dropdown (filtered to student's own dept for Students; all assigned depts for Teachers)
- Course dropdown (filtered to selected department via `GET /api/v1/departments/:id/courses`)
- Session dropdown (pre-filled for Students; shown for PYQ type for Teachers)
- College ID should be read from user context silently, not shown as an input

### 3.2 Content-hash duplicate warning
**Spec §3.1**

After a file is selected, compute its SHA-256 hash in the browser (`crypto.subtle`) and call a new backend endpoint:
```
GET /api/v1/resources/check-hash?hash=<sha256>&courseId=<id>&collegeId=<id>
```
If a match exists, show a warning banner ("A resource with this file already exists for this course") without blocking submission.

---

## Priority 4 — My Uploads — self-service actions

### 4.1 Self-cancel button for Pending resources
**Spec §3.7**

On the My Uploads page, for resources with `state = PENDING`, show a "Cancel submission" button that calls `POST /api/v1/resources/:id/self-cancel`. Confirm before acting.

### 4.2 Flag for deletion button (In Review resources)
**Spec §3.7**

For resources with `state = IN_REVIEW`, show a "Flag for deletion" button → `POST /api/v1/resources/:id/flag-deletion`. Once flagged, button changes to "Flagged for deletion" (disabled).

### 4.3 Request deletion button (Approved resources)
**Spec §3.7**

For resources with `state = APPROVED`, show a "Request deletion" button → `POST /api/v1/resources/:id/deletion-request`. Confirm before acting.

### 4.4 Create new version button
**Spec §3.5**

For resources with `state = APPROVED` or `REJECTED`, show a "Upload new version" button. Opens a simplified upload form (same file picker + optional title/description override) that calls `POST /api/v1/resources/:id/versions`.

### 4.5 Resubmit button
**Spec §5.1**

For resources with `state = REJECTED`, show a "Resubmit" button → `POST /api/v1/resources/:id/resubmit`. Shows the rejection reason inline.

---

## Priority 5 — Resource detail page enhancements

### 5.1 Version history section
**Spec §6**

Below the resource metadata on `/resources/[id]`, show a "Version History" section. Fetch `GET /api/v1/resources/:id/versions`. Display each version with its state badge. Only show Rejected versions if the viewer has scope (uploader, CR in scope, Sub Admin in college, Platform Admin).

### 5.2 Report button
**Spec §5.5**

For APPROVED resources (and DELETION_REQUESTED), show a "Report this resource" button. Opens a dialog with reason selector (INCORRECT / SPAM / PLAGIARISED) + optional note → calls `POST /api/v1/resources/:id/report`.

### 5.3 Lightweight metadata edit form
**Spec §3.6**

For the uploader viewing their own resource: show an "Edit" button that expands an inline form for title + description + tags → calls `PUT /api/v1/resources/:id/metadata`.

---

## Priority 6 — CR / Co-CR moderation dashboard

### 6.1 CR queue page
**Spec §5.2**

Create `/moderation/queue` (visible only to users with an active CR/Co-CR assignment). Fetches `GET /api/v1/moderation/cr-queue`. For each resource:
- "Open for review" button → `POST /api/v1/resources/:id/review/open`
- When In Review: "Approve" and "Reject" buttons with required reason
- Deletion flag indicator; combined approve-or-deny-deletion resolution

### 6.2 Student verification screen for CR
**Spec §1.4, §7.3**

Create `/moderation/verify-students`. Fetches `GET /api/v1/verification/students/cr`. Lists unverified students in the CR's batch. "Approve" button → `POST /api/v1/verification/students/:userId/approve`.

### 6.3 "Recommend for Platform" on resource detail
**Spec §5.4 Path A**

On `/resources/[id]`, if the viewer has an active CR/Co-CR assignment covering that resource's departmentId + sessionId, show a "Recommend for Platform" button → `POST /api/v1/resources/:id/promote/recommend`. Disabled if `visibility` is already PLATFORM or a pending recommendation exists.

---

## Priority 7 — Sub Admin dashboard

### 7.1 Sub Admin queue page
**Spec §5.3**

Create `/admin/queue` (visible to Sub Admin only). Fetches `GET /api/v1/moderation/sub-admin-queue`. Renders four sections:
1. **Pending teacher uploads** — approve/reject with reason
2. **Pending PLATFORM resources** — approve/reject with reason
3. **Escalations** — open In Review items; same approve/reject interface
4. **Promotion recommendations** — approve or deny each recommendation (Path A only)

### 7.2 Teacher verification screen
**Spec §5.8, §7.2**

Create `/admin/verify-teachers`. Fetches `GET /api/v1/verification/teachers`. Lists PENDING_VERIFICATION teachers with their college and departments. "Approve" button → `POST /api/v1/verification/teachers/:userId/approve`.

### 7.3 Promote / Revoke buttons for Teacher resources
**Spec §5.4 Path B**

On `/resources/[id]`, if the viewer is the Sub Admin and the resource is an APPROVED Teacher COLLEGE resource, show "Promote to Platform" → `POST /api/v1/resources/:id/promote`. If already PLATFORM, show "Revoke platform visibility" → `POST /api/v1/resources/:id/promote/revoke`.

### 7.4 CR/Co-CR appointment screen
**Spec §1.4, §7.2**

Create `/admin/appointments/cr`. Sub Admin can view current CR/Co-CR assignments for their college and appoint or revoke them:
- Appoint: select verified Student + department + session + type (CR or CO_CR) → `POST /api/v1/roles/cr-co-cr`
- Revoke: `DELETE /api/v1/roles/cr-co-cr/:assignmentId`

### 7.5 Sub Admin analytics page
**Spec §7.5**

Create `/admin/analytics`. Fetches:
- `GET /api/v1/analytics/content-gaps` — courses with fewest resources
- `GET /api/v1/analytics/cr-throughput` — moderator activity

---

## Priority 8 — Platform Admin dashboard

### 8.1 College management
**Spec §7.1**

Create `/platform/colleges`. List all colleges; add/edit/deactivate. Wire to the existing college CRUD endpoints.

### 8.2 Department + course management
**Spec §7.1, §7.4**

Create `/platform/departments`. List all departments; add/rename (course mutability rule: rename is safe, new entity for structural curriculum change). Adopt/unadopt departments per college via `CollegeDepartment`.

Create `/platform/courses`. List and manage courses per department.

### 8.3 Session management
**Spec §7.4**

Create `/platform/sessions`. List open/closed sessions per department; open new sessions; close sessions.

### 8.4 Sub Admin appointment screen
**Spec §1.5**

Create `/platform/appointments/sub-admin`. Platform Admin appoints or revokes Sub Admin per college → `POST/DELETE /api/v1/roles/sub-admin`.

### 8.5 Platform Admin analytics
**Spec §7.5**

Create `/platform/analytics`. Fetches:
- `GET /api/v1/analytics/promotion-counts` — promotion counts per college
- `GET /api/v1/analytics/dedup-savings` — storage deduplication

### 8.6 Admin override log viewer
**Spec §5.9, §7.5**

Create `/platform/override-log`. Lists all `AdminOverrideLog` entries (actor, target, action, justification, timestamp). Accessible only to Platform Admin.

---

## Priority 9 — UX polish

### 9.1 Notification bell in top bar
**Spec §3.8**

Add unread notification count badge to the top bar (bell icon). Poll or refresh on focus. Clicking navigates to `/notifications`.

### 9.2 Profile shows names not IDs
`/profile` shows raw `collegeId` and `departmentId`. Resolve these to College name and Department name by joining with the master-data queries.

### 9.3 Profile edit form
`/profile/edit` exists as a page file but has not been audited for content. Wire it to `PUT /api/v1/users/me` with name and email update.

### 9.4 Improve ResourceCard
The `ResourceCard` shows basic metadata. Add: visibility badge (PLATFORM / COLLEGE pill), display status pill (APPROVED / PENDING / REJECTED / etc.), uploader role badge (Student / Teacher).

### 9.5 Visibility label on search results
**Spec §2.2**

Every search result must display "Platform-wide" or "[College name]" per the spec. Currently no visibility label is shown on search results.

---

## Known bugs to fix

| Location | Bug |
|---|---|
| `upload/page.tsx:333` | References `user.name` but backend User DTO has no `name` field — falls through to `user.email` silently |
| `resource.service.ts` (resource override) | `performResourceOverride` writes a log but does not mutate the resource — admin override action has no effect |
| `adminOverride.service.ts` (emergency appoint) | `performEmergencyAppointment` writes a log but does not create the assignment row |
| `resourceStateMachine.service.ts` | `approve()` and `reject()` do not fire `RESOURCE_APPROVED` / `RESOURCE_REJECTED` notifications |
| `promotion.service.ts` | `revokePromotion()` does not fire `PROMOTED_RESOURCE_LATER_REJECTED` notification per §3.8 |
| Frontend `types.ts` | `Notification.title` and `Notification.body` do not match backend `Notification` model fields (`type`, `message`, `reason`) — the notification page uses `title` and `body` but the backend returns `type` and `message` |
| `note-koi-frontend/src/app/page.tsx` | Discover dashboard is a placeholder stub with no content |
