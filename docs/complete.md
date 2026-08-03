# What's Complete

This document is an honest audit of what has actually been built and is substantially working, cross-referenced against the v6 spec (`docs/phases.md`).

---

## Backend (`noteKoi-backend`)

### Database schema — COMPLETE
The Prisma schema is a faithful, complete implementation of the v6 spec. Every model, enum, relation, index, and business-logic comment is in place:

- All 16 models: `College`, `Department`, `CollegeDepartment`, `Session`, `Course`, `User`, `TeacherDepartment`, `SubAdminAssignment`, `CrCoCrAssignment`, `Resource`, `PromotionRecommendation`, `PromotionEvent`, `Report`, `DeletionRequest`, `Notification`, `AdminOverrideLog`
- All enums faithful to spec: `Role`, `TeacherVerificationStatus`, `CrCoCrType`, `ResourceType`, `Visibility`, `ResourceState`, `PromotionPath`, `PromotionRecommendationStatus`, `PromotionEventAction`, `ReportReason`, `ReportStatus`, `DeletionRequestStatus`, `NotificationType`, `OverrideType`
- First migration applied (`20260803074007_init`)

### Authentication — COMPLETE
- `POST /api/v1/auth/login` — email + password, sets HTTP-only access token + refresh token cookies, sets CSRF cookie
- `POST /api/v1/auth/refresh` — rotates both tokens from refresh cookie
- `POST /api/v1/auth/logout` — clears all auth cookies
- `POST /api/v1/auth/forgot-password` — generates reset token, sends email with reset URL via nodemailer
- `POST /api/v1/auth/reset-password` — validates reset token, updates password hash

### User registration — COMPLETE
- `POST /api/v1/users/register/student` — creates Student account with college + department + session + regNo; validates college adoption of department; validates session belongs to department; regNo unique within college
- `POST /api/v1/users/register/teacher` — creates Teacher account with college + multiple departments; validates college adoption of each department; account starts as `PENDING_VERIFICATION`
- `GET /api/v1/users/me` — returns current authenticated user's profile

### Master data — COMPLETE
All CRUD endpoints for platform-level entities are implemented:
- Colleges: list, create, update, deactivate
- Departments: list, create, update
- Sessions: list by department, create, open/close
- Courses: list by department, create, update

### Resource management — COMPLETE
- `POST /api/v1/resources` — JSON body upload; validates course ↔ department match; enforces role-specific rules (student locked to COLLEGE, teacher must be assigned to department, PYQ requires sessionId); Platform Admin uploads bypass Pending → directly APPROVED; SHA-256 hash computed from file
- `POST /api/v1/resources/upload` — multipart file upload (Multer), computes contentHash
- `GET /api/v1/resources` — paginated list with role-based visibility filtering (Guest sees PLATFORM only; Student/Teacher see own college + opt-in other; Sub Admin sees own college full + others read-only; Platform Admin sees all); supports `?q=`, `?resourceType=`, `?sessionId=`, `?visibility=`, `?includeOtherColleges=` filters
- `GET /api/v1/resources/my-uploads` — paginated list of authenticated user's own uploads with `displayStatus` computed field
- `GET /api/v1/resources/:id` — single resource with role-based access control; guest can see PLATFORM only; handles CR/Co-CR scope check
- `PUT /api/v1/resources/:id/metadata` — lightweight edit (title, description, tags); no state change; uploader only
- `PUT /api/v1/resources/:id/reassign` — structural edit (courseId + departmentId); validates uploader's department scope; resets resource to PENDING; invalidates outstanding promotion recommendations
- `POST /api/v1/resources/:id/versions` — create new version; inherits visibility and course/department from parent; routes to same queue type as original
- `GET /api/v1/resources/:id/versions` — version history with role-based access (§6)

### Resource state machine — COMPLETE
All 9 transitions from spec §5.1 are implemented in `resourceStateMachine.service.ts`:

| Transition | Endpoint |
|---|---|
| Pending → In Review | `POST /api/v1/resources/:id/review/open` |
| In Review → Approved (+ supersede v1 if v2) | `POST /api/v1/resources/:id/review/approve` |
| In Review → Rejected | `POST /api/v1/resources/:id/review/reject` |
| Pending → Deleted (self-cancel) | `POST /api/v1/resources/:id/self-cancel` |
| In Review + deletion flag | `POST /api/v1/resources/:id/flag-deletion` |
| Approved → Deletion Requested | `POST /api/v1/resources/:id/deletion-request` |
| Deletion request decision | `POST /api/v1/deletion-requests/:id/decision` |
| Rejected → Pending (re-submit) | `POST /api/v1/resources/:id/resubmit` |
| Approved/Deletion Requested → In Review (report) | `POST /api/v1/resources/:id/report` |

Edge cases implemented:
- When `approve` is called on a resource with `deletionFlag = true`, it deletes instead of approving (combined resolution)
- `approveResourceAndSupersede` atomically sets v2 to APPROVED and v1 to SUPERSEDED in a transaction
- Report against a Deletion Requested resource sets In Review while retaining deletion flag

### Moderation queues — COMPLETE
- `GET /api/v1/moderation/cr-queue` — CR's pending Student COLLEGE resources (own dept + session)
- `GET /api/v1/moderation/sub-admin-queue` — Sub Admin's pending teacher uploads, PLATFORM resources, escalations, and pending promotion recommendations

### Promotion workflow — COMPLETE

**Path A (Student resource, CR recommends)**:
- `POST /api/v1/resources/:id/promote/recommend` — CR/Co-CR creates recommendation; validates resource is APPROVED, COLLEGE, student-uploaded, no existing pending recommendation
- `POST /api/v1/promotion-recommendations/:id/approve` — Sub Admin approves; updates visibility to PLATFORM; creates PromotionEvent; notifies uploader + recommending CR/Co-CR
- `POST /api/v1/promotion-recommendations/:id/deny` — Sub Admin denies; notifies recommending CR/Co-CR only (not uploader, per spec §3.8)

**Path B (Teacher resource, Sub Admin direct)**:
- `POST /api/v1/resources/:id/promote` — Sub Admin promotes directly; no notification sent (per spec)

**Revoke**:
- `POST /api/v1/resources/:id/promote/revoke` — Sub Admin revokes PLATFORM → COLLEGE

### Role assignment — COMPLETE
- `POST /api/v1/roles/sub-admin` — Platform Admin appoints Sub Admin
- `DELETE /api/v1/roles/sub-admin/:assignmentId` — Platform Admin revokes Sub Admin
- `POST /api/v1/roles/cr-co-cr` — Sub Admin appoints CR/Co-CR from verified Students
- `DELETE /api/v1/roles/cr-co-cr/:assignmentId` — Sub Admin revokes CR/Co-CR

### Verification — COMPLETE
- `GET /api/v1/verification/students/cr` — CR lists unverified students in their batch
- `GET /api/v1/verification/students/sub-admin` — Sub Admin lists unverified students in their college
- `POST /api/v1/verification/students/:userId/approve` — CR or Sub Admin approves student
- `GET /api/v1/verification/teachers` — Sub Admin lists teachers pending verification
- `POST /api/v1/verification/teachers/:userId/approve` — Sub Admin approves teacher

### Notifications — COMPLETE
- `GET /api/v1/notifications` — paginated list for authenticated user
- `POST /api/v1/notifications/:id/read` — mark single notification as read
- Notifications are dispatched for: promotion recommendation approved (uploader + CR), promotion recommendation denied (CR only), promotion revoke (all chain members per path)

### Analytics — COMPLETE
- `GET /api/v1/analytics/content-gaps` — courses with fewest approved resources (§7.5)
- `GET /api/v1/analytics/dedup-savings` — content_hash deduplication savings (§7.5)
- `GET /api/v1/analytics/promotion-counts` — promotion counts per college (§7.5, Platform Admin)
- `GET /api/v1/analytics/cr-throughput` — CR/Co-CR moderation throughput (§7.5, Sub Admin)

### Admin Override (§5.9, §5.4a, §1.4/§1.5) — COMPLETE (partial implementation noted below)
- `POST /api/v1/admin/override/promotion` — Platform Admin acts on a promotion decision; writes `AdminOverrideLog` with justification note
- `POST /api/v1/admin/override/appointment` — Platform Admin emergency appointment; writes `AdminOverrideLog` (log only — actual appointment is a known gap, see `remains.md`)
- `POST /api/v1/admin/override/resources/:id` — Platform Admin CRUD override on resource; writes `AdminOverrideLog` (log only — actual state mutation is a known gap, see `remains.md`)

### Infrastructure — COMPLETE
- CSRF guard (`x-csrf-token` header required on all POST/PUT/DELETE after auth routes)
- JWT authentication middleware (attaches `req.user`)
- Role-based authorization middleware (`permissionMap.ts`)
- Scope guards: `requireActiveSubAdmin`, `requireActiveCrCoCr`, `requireActiveCrCoCrOrSubAdmin`, `requireDeptSessionScope`, `requireSameCollege`
- Zod validation middleware per route
- Centralized error handler (AppError → structured JSON response)
- Pino request logger
- Multer file upload with local disk storage
- Nodemailer email wrapper

---

## Frontend (`note-koi-frontend`)

### App shell — COMPLETE
- Responsive sidebar (desktop) + bottom navigation bar (mobile)
- Top bar with navigation controls
- Command palette (scaffolded, not wired to data)
- Floating action button (upload shortcut)
- Theme provider (dark theme)
- ReactQuery provider + query client with `credentials: "include"` configured
- Auth refresh on 401 responses via Axios interceptor

### Auth pages — COMPLETE
All auth pages are fully functional and wired to the backend:
- `/login` — email + password form; on success redirects to `/`
- `/register/student` — cascading dropdowns (College → Department → Session) + regNo + email + password; fetches live data from backend
- `/register/teacher` — college + multi-department selection + email + password
- `/forgot-password` — email form; calls backend forgot-password endpoint
- `/reset-password` — token from URL + new password form
- `/verification-pending` — informational page after student registers

### Upload page — COMPLETE
`/upload` — functional form with:
- File upload (any type) or YouTube URL
- Resource type selector (all 6 types)
- Title, description, tags
- Course ID, Department ID (manually typed — IDs required, not dropdowns yet)
- Session ID, College ID (pre-filled from user context)
- Visibility locked to COLLEGE for Students; dropdown for Teachers/Admins
- Redirects to `/my-uploads` on success

### My Uploads page — COMPLETE
`/my-uploads` — lists the authenticated user's uploads; shows `displayStatus` (including DELETION_DENIED, IN_REVIEW_DELETION_FLAGGED derived labels); uses `ResourceCard` component.

### Search page — COMPLETE
`/search` — keyword search + resource-type filter pills; fetches from backend with `?q=` and `?resourceType=` params; shows result count; client-side refinement on top of server results.

### Resource detail page — FUNCTIONAL
`/resources/[id]` — shows resource metadata (type, visibility, state, uploader, tags, created date); download link for file URL or YouTube watch link; back button.

### Notifications page — FUNCTIONAL
`/notifications` — lists notifications with read/unread badge and timestamp. Empty state handled.

### Profile page — FUNCTIONAL
`/profile` — shows email, role, verification badge, college ID, department ID; logout button wired to backend.

### API client layer — COMPLETE
All backend endpoints consumed have corresponding API functions in `src/lib/api/`:
- `auth.ts` — login, logout, register student/teacher, forgot/reset password, refresh
- `colleges.ts` — list colleges, list college departments
- `departments.ts` — list departments
- `sessions.ts` — list sessions by department
- `courses.ts` — list courses by department
- `resources.ts` — list, get, my-uploads, upload (multipart)
- `notifications.ts` — list, mark read
- `users.ts` — get me, update me

### React Query hooks — COMPLETE
- `useRequireAuth` — redirects to `/login` if unauthenticated; returns current user
- `useResourcesQuery`, `useResourceQuery`, `useMyUploadsQuery`
- `useUploadResourceMutation`, `useLogoutMutation`, `useUpdateCurrentUserMutation`
- `useNotificationsQuery`, `useUsersQuery`

### UI component library — COMPLETE
Bespoke unstyled-but-themed components: `Button`, `Card`, `Badge`, `Dialog`, `Input`, `Textarea`.
Shared layout components: `ResourceCard`, `EmptyStateBlock`, `UpcomingFeatureCard`, `AuthFormLayout`.
