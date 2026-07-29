# Backend Implementation Plan
### College Resource & Academic Collaboration Platform — v3.0 (Final)

##### **Stack:**   Express + TypeScript + PostgreSQL + Prisma ORM + JWT Auth + Google Drive API (Phase 1 storage)

**Deployment target:** Render

---

## 1. Guiding Principles

- **Every write operation is scope-checked, not just role-checked.** A CR is not just "a CR" — they must be the CR *of the specific ClassroomUnit* they're acting on. This is the single most important rule in this PRD and the most common place bugs will leak (e.g. a CR from Department A editing a Notice in Department B).
- **Validate at three layers, always:** (1) DTO/schema validation on the request body, (2) role guard, (3) scope/ownership guard against the database. Skipping layer 3 is the most likely source of privilege-escalation bugs in this system.
- **Personal/Confidential Shares are privacy-critical.** No admin role — including Owner Admin — may ever read share content. This must be enforced at the query layer, not just hidden in the UI.

---

## 2. Module Breakdown & Build Order

Build in this order because later modules depend on earlier ones (verification depends on classroom units; notices/discussion/shares depend on verified CR identity).

### Phase 1 — Foundation

#### 2.1 Auth Module
- JWT-based login/register/refresh.
- Password hashing (bcrypt/argon2), rate-limited login endpoint.
- **Validation:**
  - Registration DTO: email format, password strength, required `collegeId`, `departmentId`, `sessionId`.
  - Reject registration if `collegeId` doesn't exist (FK check before insert, not just a DB constraint error surfaced raw).
  - Enforce one account = one college at the DTO level (no `collegeId` array accepted).

#### 2.2 Core Hierarchy Module (College → Department → Semester → Course → Session → ClassroomUnit)
- CRUD for College/Department/Semester/Course/Session — admin-seeded, not end-user-facing initially.
- `ClassroomUnit` = unique(Department, Session) pair.
- **Validation:**
  - Enforce uniqueness constraint on (departmentId, sessionId) at the DB level AND check-before-create at the service level (return a clean 409, not a raw DB error).
  - Validate referential integrity top-down (Course belongs to a Semester belongs to a Department, etc.) before allowing a ClassroomUnit to reference them.

#### 2.3 Role & Assignment Module
Covers `AdminAssignment` (Owner Admin ↔ Sub Admin) and `CRAssignment` (Sub Admin ↔ CR).

- **Owner Admin logic:**
  - Exactly one Owner Admin row must exist platform-wide at all times — enforce via a singleton check in the service layer (DB unique constraint alone can't express "exactly one row with role=OwnerAdmin" cleanly across a shared Users table, so validate in application code inside a transaction).
  - Ownership transfer must be atomic: demote old Owner Admin + promote new one in a single DB transaction, so the system is never in a zero-Owner-Admin or two-Owner-Admin state mid-operation.
- **Sub Admin logic:**
  - Enforce exactly one Sub Admin per college: check for an existing active `AdminAssignment(role=SubAdmin, collegeId=X)` before creating a new one; reject or require an explicit demote-first step.
  - A Sub Admin can only be promoted/demoted by the Owner Admin — guard checks `req.user.role === OwnerAdmin`, not just "is admin."
- **CR logic:**
  - Enforce max 2 CRAssignments per ClassroomUnit (1 Main + 1 Co) — validate by counting active assignments for that `classroomUnitId` before insert, inside a transaction to avoid race conditions from two simultaneous promotions.
  - Promoter must be the Sub Admin of the *same college* as the ClassroomUnit's Department, or the Owner Admin. This requires a join-based scope check (ClassroomUnit → Department → College → SubAdmin's collegeId), not a flat role check.
- **Validation checklist for this module specifically:**
  - [ ] Singleton Owner Admin invariant enforced in a transaction
  - [ ] One-Sub-Admin-per-college invariant enforced pre-insert
  - [ ] Two-CR-per-unit cap enforced pre-insert, race-safe
  - [ ] Cross-college promotion attempts rejected (Sub Admin scope check)
  - [ ] All promote/demote actions written to an audit log table (needed for Section 6.2.6 / Phase 3 audit trail)

#### 2.4 Verification Module
- `VerificationRequest`: Student → ClassroomUnit, states `Pending` / `Verified`.
- **Validation:**
  - Only a CR of the *exact* ClassroomUnit the student registered under (or Sub Admin of that college, or Owner Admin) can approve.
  - Guard must resolve the requester's assignment scope and compare against `request.classroomUnitId` — reject with 403 on mismatch, don't silently no-op.
  - Prevent double-verification (idempotency check: if already `Verified`, return early rather than erroring or re-processing).
  - Gate ALL private-resource endpoints behind a `VerifiedGuard` that checks `user.verificationStatus === 'Verified'` — this is a global guard, not per-module, since it applies to Resources, Notices, Discussion, and Shares alike.

---

### Phase 2 — Content & Communication

#### 2.5 Resource Module
- CRUD scoped to CR's own ClassroomUnit; Students get read-only within their verified unit.
- Metadata only: fileName, fileId, fileUrl, previewUrl, category, visibility, courseId/sessionId, uploaderId.
- **Validation:**
  - Write guard: `req.user.role === CR AND resource.classroomUnitId === user's CRAssignment.classroomUnitId`.
  - Visibility enum restricted to `public | private` — reject anything else at DTO level.
  - On public resource endpoints, filter query at the DB level by `visibility = public`, never rely on hiding fields in the response serializer alone (defense in depth: a serializer bug shouldn't leak private resources).
  - Validate Google Drive fileId/URL format before persisting metadata (basic shape check — don't trust client-supplied URLs blindly for preview embedding; sanitize against XSS in the preview iframe context).

#### 2.6 Notice Module
- Scoped strictly to one Department + Session (ClassroomUnit).
- **Validation:**
  - Same CR-owns-this-unit scope check as Resources.
  - A Notice must never be queryable/joinable in a way that exposes it outside its `classroomUnitId` — add the scope filter at the repository/query-builder level, not just in the controller, so a future endpoint can't accidentally omit it.
  - Edit/delete guard: either of the *two* assigned CRs for that unit can act, not just the original author — check membership in `CRAssignment` for that unit, not `notice.authorId === user.id`.

#### 2.7 Discussion Module (Groups, Membership, Messages)
- `DiscussionGroup(courseId nullable, unique when set, classroomUnitId, createdBy)`.
- **Validation:**
  - Enforce unique constraint on `courseId` where not null (max 1 course-linked group) — DB partial unique index (`WHERE course_id IS NOT NULL`) plus a pre-check in the service for a clean error message.
  - General groups (`courseId = null`) bypass the uniqueness check entirely — validate this branch explicitly in tests.
  - Membership add/remove guard: actor must be a CR of the group's `classroomUnitId`.
  - Message write guard: actor must be an active member of the group (check `DiscussionMembership`), separate from the CR-management guard above — these are two different permissions (manage group vs. post in group).
  - Sanitize message content (strip/escape HTML) before storage to prevent stored XSS in a searchable, long-retention message history.

#### 2.8 Personal/Confidential Sharing Module
This is the highest-sensitivity module — treat it as security-critical, not just another CRUD resource.

- **Validation:**
  - Sender guard: `req.user.role === CR` — Students, Sub Admins, and Owner Admin must get a hard 403, no exceptions, even for their own college/unit.
  - Recipient visibility: query must join through `ShareRecipient` and filter `recipientId = req.user.id` — a user must never be able to fetch a `PersonalShare` by ID without being sender or explicit recipient. Add this check even for Owner Admin/Sub Admin roles that might otherwise have broad read scopes elsewhere in the system — **do not let a generic "admin can view all" middleware apply to this table.**
  - Explicitly exclude `PersonalShare`/`ShareRecipient` content columns from any analytics or admin query — analytics endpoints should query a `COUNT(*)` aggregate table/view that never selects the `content` column, ideally via a dedicated read-only view that doesn't expose it at all.
  - Recommend a unit test asserting: "Owner Admin token + direct API call to `/shares/:id` on a share they're not part of → 403", to guard this permanently in CI.

---

### Phase 3 — Profile, Dashboards, Analytics

#### 2.9 User Profile Module
- **Validation:**
  - Users can edit only their own profile (`req.user.id === params.userId`), except Sub Admin/Owner Admin may have limited override fields (verification status) — keep those on separate endpoints with separate guards, not a shared "edit profile" endpoint with conditional field logic.

#### 2.10 Dashboard Endpoints (aggregation, role-gated)
- Mostly read-composition endpoints pulling from other modules — no new write logic, but:
- **Validation:**
  - Each dashboard endpoint must apply the same scope filters as the underlying module (Sub Admin dashboard queries must be pre-filtered to their `collegeId`; don't return platform-wide data and trust the frontend to filter).

#### 2.11 Owner Admin Analytics Module
- Aggregate-only endpoints (counts, funnels, trends) via materialized views or scheduled aggregation jobs.
- **Validation:**
  - Hard-restrict every analytics endpoint to `role === OwnerAdmin` (or college-scoped subset for Sub Admin, per Section 11's authorization matrix).
  - Personal/Confidential Share stats must come from a count-only source (see 2.8) — never join to the content table directly, even for a `COUNT()`, if that join could be modified later to accidentally `SELECT *`. Prefer a dedicated aggregate table updated by a trigger/job.
  - Audit trail endpoint (promotions/demotions/ownership transfers) reads from the audit log written in 2.3 — validate that it's append-only (no UPDATE/DELETE permissions on that table from the app's DB role).

---

## 3. Cross-Cutting Concerns

### 3.1 Validation Layers (apply to every module above)
1. **DTO/schema validation** (class-validator or Zod) — type, format, required fields, enum bounds. Runs first, before any DB call.
2. **AuthGuard** — is the JWT valid, is the user verified (where required)?
3. **RoleGuard** — does this role generally have access to this action?
4. **ScopeGuard** — does this specific user have rights over this specific record (college/classroom unit/ownership match)? This is the guard most PRDs under-specify and most implementations skip — build it as a reusable decorator/interceptor (e.g. `@RequireScope('classroomUnit')`) rather than re-implementing inline in every controller.

### 3.2 Concurrency & Race Conditions
- Wrap all "cap enforcement" operations (Owner Admin singleton, one-Sub-Admin-per-college, two-CR-per-unit, one-course-linked-group) in DB transactions with `SELECT ... FOR UPDATE` or a unique constraint as a backstop — application-level pre-checks alone are not race-safe under concurrent requests.

### 3.3 Audit Logging
- Every role change (promote/demote/transfer) → append to an audit table: `actorId, action, targetId, previousRole, newRole, timestamp`. Required for Phase 3 UI but should be built starting Phase 1 so history isn't lost.

### 3.4 Testing Priorities
Given the permission complexity, prioritize automated tests (not just manual QA) for:
- Cross-college / cross-classroom-unit scope violations (the "wrong CR editing the wrong unit" class of bug).
- Owner Admin singleton and Sub Admin per-college invariants under concurrent requests.
- Personal Share content isolation from every admin-facing query path.

---

## 4. Suggested Sprint Mapping (aligned to PRD Section 12 MVP Scope)

| Sprint | Modules |
|---|---|
| 1 | Auth, Core Hierarchy, Role & Assignment |
| 2 | Verification, Resource Module, Google Drive integration |
| 3 | Notice, Discussion (groups + membership) |
| 4 | Discussion (messages), Personal/Confidential Sharing |
| 5 | User Profile, Dashboards (Student/CR/Sub Admin/Owner Admin) |
| 6 | Owner Admin Analytics, Audit Trail UI, hardening pass on all ScopeGuards |
