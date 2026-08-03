# NoteKoi — Backend Features by Role

This document maps every feature exposed by the NoteKoi backend to the role(s) that can perform it. It is derived from an analysis of the backend source: routes, middlewares/guards, services, permission map, and the Prisma schema (`noteKoi-backend/src/routes`, `src/middlewares`, `src/services`, `src/permissions`, `prisma/schema.prisma`).

---

## Roles Overview

| Role | Description |
|---|---|
| **Guest** | Unauthenticated visitor (no `User` row). |
| **Student** | Base account role. Requires email/student-ID verification (`isVerified`) before uploading. |
| **CR / Co-CR** | An **elevation on top of a Student account** (not a base role). Appointed by the Sub Admin per (Department + Session). CR and Co-CR hold identical permissions; the distinction is organisational only. |
| **Teacher** | Base account role. Must be approved by the Sub Admin (`TeacherVerificationStatus.VERIFIED`) before uploading. |
| **Sub Admin** | Exactly one active per college, appointed/revoked by the Platform Admin. |
| **Platform Admin** | Superuser with master-data management and exceptional, always-logged override powers. Belongs to no college. |

---

## Guest (Unauthenticated)

### Authentication
- Register a new **Student** account (`POST /register/student`).
- Register a new **Teacher** account (`POST /register/teacher`).
- Log in (`POST /login`).
- Refresh access token (`POST /refresh`).
- Request password reset (`POST /forgot-password`).
- Reset password (`POST /reset-password`).

### Browsing
- List / search **approved, PLATFORM-visible** resources (`GET /resources`, `GET /resources/search`) — guests only see `visibility = PLATFORM`.
- View a public approved platform resource (`GET /resources/:id`).
- View the platform-level department / course / session / college catalogues (routes without auth guards).

---

## Student (base role)

> A Student **must be verified** (`isVerified = true`) to upload. CR/Co-CR powers are listed separately below.

### Account & Profile
- Log in / log out / refresh session.
- View own profile (`GET /me`).
- Update own profile (`PUT /me`).
- View own role assignments — CR/Co-CR, Sub Admin, etc. (`GET /me/assignments`).

### Browsing & Discovery
- List / search approved resources visible to a student: **all PLATFORM resources + own-college COLLEGE resources** (`GET /resources`, `GET /resources/search`).
- Optionally include other colleges' COLLEGE resources via `includeOtherColleges` query flag.
- View resource detail (`GET /resources/:id`) — full access to platform resources and own-college resources; read access to other-college resources only when `includeOtherColleges = true`.
- View version history of approved resources (`GET /resources/:id/versions`).

### Resource Upload
- Upload resources via JSON (`POST /resources`) or multipart file (`POST /resources/upload`).
- Rules enforced by the backend:
  - Student must be verified.
  - Uploads are forced to `visibility = COLLEGE` and tied to the student's own college.
  - May only upload to the student's **own department**.
  - PYQ (past-year question) resources require a session and may only target the student's **own session**.
  - New uploads start in `PENDING` state (enter the moderation queue).
  - Video resources accept either a `youtubeUrl` or `fileUrl` (not both); all other types require a `fileUrl`.

### Managing Own Uploads ("My Uploads")
- List own uploads with derived display status (`GET /resources/my-uploads`) — shows `PENDING`, `IN_REVIEW`, `IN_REVIEW_DELETION_FLAGGED`, `APPROVED`, `REJECTED`, `SUPERSEDED`, `DELETION_REQUESTED`, `DELETED`, `DELETION_DENIED`.
- Edit lightweight metadata (title, description, tags) of own resources (`PATCH /resources/:id/metadata`).
- **Reassign (structural edit)** own resource to a different course/department/session (`PATCH /resources/:id/reassign`). Resets state to `PENDING` and invalidates pending promotion recommendations. Students may only reassign within their own department.
- **Upload a new version** of own resource (`POST /resources/:id/versions`) — creates a new `Resource` row linked in the version chain; inherits course/department/visibility; resource type cannot change.
- **Self-cancel** a `PENDING` upload (`POST /resources/:id/self-cancel`).
- **Flag deletion** while the resource is `IN_REVIEW` (`POST /resources/:id/flag-deletion`).
- **Request deletion** of an `APPROVED` resource (`POST /resources/:id/request-deletion`) — enters `DELETION_REQUESTED` state.
- **Resubmit** a `REJECTED` resource (`POST /resources/:id/resubmit`).
- View deletion-request outcomes (`Approved` / `Denied`) surfaced in My Uploads.

### Reporting
- File a report against an `APPROVED` or `DELETION_REQUESTED` resource (`POST /resources/:id/report`) with reason `INCORRECT | SPAM | PLAGIARISED` and an optional note. Filing a report moves the resource to `IN_REVIEW`.

### Notifications
- List own in-app notifications (`GET /notifications`).
- Mark a notification as read (`PATCH /notifications/:id/read`).
- Notification types a student uploader receives: `RESOURCE_APPROVED`, `RESOURCE_REJECTED`, `PROMOTION_RECOMMENDATION_APPROVED` (Path A), `DELETION_APPROVED`, `DELETION_DENIED`, and — if their promoted resource is later rejected on re-review — `PROMOTED_RESOURCE_LATER_REJECTED`.

### Student Verification Queue
- **Any verified student** with an active CR/Co-CR assignment for a Department + Session may view the pending-student verification queue for that scope (`GET /cr/student-verifications`, guarded by `requireActiveCrCoCr` + `authorize("STUDENT")`).
- Approve student verification (`POST /student-verifications/:userId/approve`) — allowed for either an active CR/Co-CR of the target's Department + Session, or the Sub Admin of the target's college when no CR exists for that scope.

---

## CR / Co-CR (Student elevation)

> A CR or Co-CR is an **active Student** with a `CrCoCrAssignment` for a (Department + Session) of their college. All Student features remain available. Moderation scope is limited to their **own Department + Session**.

### Moderation (Resource Review)
- View the **CR moderation queue** (`GET /cr/queue`) — resources pending/in review within their scope.
- **Open for review**: move a `PENDING` resource to `IN_REVIEW` (`POST /resources/:id/open-review`).
- **Approve** an `IN_REVIEW` resource (`POST /resources/:id/approve`). If the uploader flagged deletion while in review, approval acts as deletion approval.
- **Reject** an `IN_REVIEW` resource with a reason (`POST /resources/:id/reject`).
- **Deletion decisions**: approve/deny deletion requests (`POST /resources/:id/deletion-decision`).
- **Resolve reports** (`POST /reports/:id/resolve`).
- Deletion resolutions and rejections generate notifications to the uploader.

### Promotion (Path A)
- **Recommend** an approved, college-visible, student-originated resource for platform promotion (`POST /resources/:id/recommend-promotion`).
- Receives `PROMOTION_RECOMMENDATION_APPROVED` / `PROMOTION_RECOMMENDATION_DENIED` notifications when the Sub Admin decides.
- If their promoted recommendation is later rejected on re-review, receives `PROMOTED_RESOURCE_LATER_REJECTED`.

### Verification
- View pending student verifications for their Department + Session (`GET /cr/student-verifications`).
- Approve verification of students in their Department + Session scope (`POST /student-verifications/:userId/approve`).

---

## Teacher

> A Teacher account begins in `PENDING_VERIFICATION` and must be approved by the Sub Admin (`VERIFIED`) before it can upload.

### Account & Profile
- Register / log in / log out / refresh.
- View & update own profile (`GET /me`, `PUT /me`).
- View own teacher department assignments (`GET /me/assignments`).

### Browsing & Discovery
- List / search **platform + own-college** approved resources (same visibility rules as Students).
- View resource detail / version history for approved resources.

### Resource Upload
- Upload via JSON (`POST /resources`) or multipart (`POST /resources/upload`).
- Rules enforced by the backend:
  - Teacher must be `VERIFIED`.
  - Upload must be within a department the teacher is **assigned to teach**.
  - Uploads are automatically associated with the teacher's college.
  - Teacher uploads start in `PENDING` (enter moderation).
  - Video/PYQ rules identical to students.

### Managing Own Uploads
- Same self-management tools as Students: My Uploads listing, metadata edit, structural reassign (limited to assigned departments), new version upload, self-cancel, flag deletion, request deletion, resubmit.
- **Visibility promotion happens via Path B**: the Sub Admin directly promotes teacher-originated resources (`POST /resources/:id/promote`) — a CR/Co-CR recommendation is **not** used for teacher uploads.
- Per the Path B rule (§3.8 / §0.2 Teacher), the backend does **not** send the teacher uploader a promotion notification on direct promotion, nor on later re-review rejection.

### Reporting & Notifications
- File reports against approved / deletion-requested resources.
- Receive `RESOURCE_APPROVED`, `RESOURCE_REJECTED`, `DELETION_APPROVED`, `DELETION_DENIED` notifications.
- Mark notifications read.

---

## Sub Admin

> A Sub Admin is an active, college-scoped moderator appointed by the Platform Admin. Scoped to **exactly one college**.

### Account & Profile
- Log in / refresh / log out; view & update own profile (`GET /me`, `PUT /me`); view own assignments (`GET /me/assignments`).

### Browsing & Discovery
- List / search approved resources: **all PLATFORM resources + own-college COLLEGE resources** (`GET /resources`).
- Read access to **any** college's COLLEGE resources (full read for own college; read-only for other colleges).
- View non-approved resources within own college (moderation context) and full version history.

### Resource Upload
- Upload resources via JSON or multipart.
- A Sub Admin may create a resource at **PLATFORM visibility** which is **directly APPROVED** (bypasses the moderation queue).
- Uploads are tied to the Sub Admin's college.

### Moderation
- View the **Sub Admin moderation queue** (`GET /sub-admin/queue`).
- Open `PENDING` resources for review; approve / reject `IN_REVIEW` resources (with reason).
- Approve deletion requests (or deny them) — `POST /resources/:id/deletion-decision`.
- Resolve reports (`POST /reports/:id/resolve`).

### Promotion
- **Approve** a CR/Co-CR Path A promotion recommendation (`POST /promotion-recommendations/:id/approve`) — promotes the resource to PLATFORM and notifies uploader + recommender.
- **Deny** a Path A recommendation (`POST /promotion-recommendations/:id/deny`) — notifies the recommender.
- **Promote (Path B)** approved teacher-originated college resources directly (`POST /resources/:id/promote`).
- **Revoke** platform visibility back to COLLEGE (`POST /resources/:id/revoke-promotion`).
- Receives `PROMOTED_RESOURCE_LATER_REJECTED` notification when a previously promoted resource is rejected on re-review (both Path A and Path B).

### Verification
- View the college's pending **student** verification queue where no CR/Co-CR exists for the scope (`GET /sub-admin/student-verifications`).
- View the college's pending **teacher** verification queue (`GET /sub-admin/teacher-verifications`).
- Approve student verification (fallback when no CR in scope — `POST /student-verifications/:userId/approve`).
- Approve teacher verification (`POST /sub-admin/teacher-verifications/:userId/approve`).

### Role Management (within college)
- Appoint a **CR or Co-CR** for a (Department + Session) of the college (`POST /sub-admin/cr-assignments`) — target must be a verified student of the same college; only one active CR and one active Co-CR per scope.
- Revoke a CR/Co-CR assignment (`POST /sub-admin/cr-assignments/:assignmentId/revoke`).

### Analytics
- View **content gaps** (under-served courses) (`GET /analytics/content-gaps`) — shared with Platform Admin.
- View **deduplication savings** from content-hash matches (`GET /analytics/dedup-savings`) — shared with Platform Admin.
- View **CR throughput** for own college (`GET /sub-admin/analytics/cr-throughput`).
- View **CR audit** (`GET /sub-admin/cr-audit`).

### Notifications
- List notifications / mark read. Receives moderation and promotion-related notifications.

---

## Platform Admin

> Platform Admin has no college (`collegeId = null`). Every **exceptional** action is recorded in the `AdminOverrideLog` with a required justification note.

### Account & Profile
- Log in / refresh / log out; view & update profile; view assignments.

### Browsing & Discovery
- Can view **every** resource regardless of state, visibility, or college (`GET /resources`, `GET /resources/:id`, `GET /resources/:id/versions`).

### Resource Upload
- Upload **PLATFORM-visible** resources with no college association, **directly in `APPROVED` state** (bypasses moderation).

### Master Data Management
- **Colleges**: create (`POST /colleges`), update (`PATCH /colleges/:id`), list (`GET /colleges`).
- **College–Department adoption**: list departments adopted by a college (`GET /colleges/:collegeId/departments`), adopt a department (`POST /colleges/:collegeId/departments`), revoke an adoption (`DELETE /colleges/:collegeId/departments/:departmentId`) — powers the "irrelevant departments hidden" per-college view.
- **Departments**: create (`POST /departments`), update (`PATCH /departments/:id`), list (`GET /departments`).
- **Courses**: create (`POST /departments/:departmentId/courses`), update (`PATCH /courses/:id`), list (`GET /departments/:departmentId/courses`).
- **Sessions**: create (`POST /departments/:departmentId/sessions`), update (`PATCH /sessions/:id`), list (`GET /departments/:departmentId/sessions`).

### Sub Admin Management
- Appoint a Sub Admin for a college (`POST /platform-admin/sub-admins`) — enforces **one active Sub Admin per college**.
- Revoke a Sub Admin (`POST /platform-admin/sub-admins/:assignmentId/revoke`).

### Exceptional Overrides (always audited with justification)
- **Resource CRUD override** (`POST /platform-admin/resources/:id/override`) — direct exceptional mutation of any resource.
- **Promotion decision override** (`POST /platform-admin/promotion-override`) — exceptional promote/revoke of platform visibility, bypassing routine Path A/B rules.
- **Emergency role appointments** (`POST /platform-admin/emergency-appointments`) — interim Sub Admin or CR/Co-CR appointment outside the normal flow.
- **Override audit log** (`GET /platform-admin/analytics/override-logs`) — unified log of all §5.9 CRUD overrides, §5.4a promotion exceptions, and §1.4/§1.5 role appointments.

### Analytics
- Content gaps (`GET /analytics/content-gaps`).
- Deduplication savings (`GET /analytics/dedup-savings`).
- **Promotion counts by college** (`GET /platform-admin/analytics/promotions-by-college`).

---

## Cross-Cutting Rules Enforced by the Backend

1. **Resource state machine** (`resourceStateMachine.service.ts`) — the only seven real states: `PENDING → IN_REVIEW → APPROVED | REJECTED | DELETION_REQUESTED | DELETED | SUPERSEDED`. "In Review (Deletion Flagged)" and "Deletion Denied" are *derived display labels*, not states.
2. **Reports** may only be filed against `APPROVED` or `DELETION_REQUESTED` resources; filing moves the resource back to `IN_REVIEW`.
3. **Structural edits** (reassign course/department) reset state to `PENDING` and **invalidate pending promotion recommendations**.
4. **Versioning** — a new version is a new `Resource` row chained via `rootResourceId`; resource type is immutable across versions.
5. **Promotion invalidation** — pending recommendations are invalidated on report, structural edit, or deletion request.
6. **Duplicate detection** — `contentHash` enables cross-college deduplication and duplicate-warning scoped to (college, course, hash).
7. **Verification gates** — Students must be `isVerified`, Teachers must be `VERIFIED`, before upload.
8. **Collision rules** — one active Sub Admin per college; one active CR and one active Co-CR per (college, department, session, type); one pending promotion recommendation per resource.
9. **All Platform Admin exceptional actions are logged** in `AdminOverrideLog` with `actorId`, `overrideType`, `targetType`, `targetId`, `action`, and a required `justificationNote`.

---

## Feature Matrix (Quick Reference)

| Feature | Guest | Student | CR/Co-CR | Teacher | Sub Admin | Platform Admin |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Register (student / teacher) | ✅ | — | — | ✅ (needs approval) | — | — |
| Login / logout / refresh / password reset | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View / update own profile | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Browse approved platform resources | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Browse own-college resources | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Browse other-college resources (`includeOtherColleges`) | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload resource | — | ✅ (verified) | ✅ | ✅ (verified) | ✅ | ✅ (direct APPROVED, PLATFORM) |
| Edit own metadata / reassign / new version | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Self-cancel / flag deletion / request deletion / resubmit | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| File report | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| View / mark notifications | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Open / approve / reject resources | — | — | ✅ (own dept+session) | — | ✅ (own college) | — |
| Deletion decisions / resolve reports | — | — | ✅ | — | ✅ | — |
| View moderation queue | — | — | ✅ (`/cr/queue`) | — | ✅ (`/sub-admin/queue`) | — |
| Recommend promotion (Path A) | — | — | ✅ | — | — | — |
| Approve/deny recommendations | — | — | — | — | ✅ | — |
| Direct promote teacher resource (Path B) | — | — | — | — | ✅ | — |
| Revoke promotion | — | — | — | — | ✅ | — |
| View student verification queue | — | — | ✅ (scope) | — | ✅ (college) | — |
| Approve student verification | — | — | ✅ (scope) | — | ✅ (fallback) | — |
| View / approve teacher verification | — | — | — | — | ✅ | — |
| Appoint / revoke CR, Co-CR | — | — | — | — | ✅ | — |
| Appoint / revoke Sub Admin | — | — | — | — | — | ✅ |
| Manage colleges / departments / courses / sessions | — | — | — | — | — | ✅ |
| Adopt / revoke college departments | — | — | — | — | — | ✅ |
| Content gaps analytics | — | — | — | — | ✅ | ✅ |
| Dedup savings analytics | — | — | — | — | ✅ | ✅ |
| CR throughput / audit analytics | — | — | — | — | ✅ | — |
| Promotions by college analytics | — | — | — | — | — | ✅ |
| Resource CRUD override | — | — | — | — | — | ✅ |
| Promotion decision override | — | — | — | — | — | ✅ |
| Emergency role appointment | — | — | — | — | — | ✅ |
| Override audit log | — | — | — | — | — | ✅ |