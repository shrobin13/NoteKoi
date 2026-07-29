# AI Context — College Resource & Academic Collaboration Platform

> **Purpose of this file:** This is the single reference an AI coding assistant (Claude Code, Cursor, Copilot, etc.) should read before generating or modifying code in this repo. It distills the PRD (v3.0 Final), the backend implementation plan, and `schema.prisma` into the rules that must never be violated. When in doubt, this file wins over general best-practice instincts — the permission model here is stricter and more specific than typical CRUD apps.

---

## 1. What this product is

A web platform that organizes academic resources (lectures, notes, books, previous-year questions, software) by **College → Department → Semester → Course → Session**, with content and communication governed entirely by student-elected **Class Representatives (CRs)** instead of a Teacher role. Administration is a thin, two-tier layer (Owner Admin, Sub Admin) that exists only to appoint/remove CRs — it does not touch content.

**There is no Teacher role.** Do not reintroduce one. Every content/communication permission that might intuitively belong to "a teacher" belongs to the CR instead.

---

## 2. Tech stack (do not deviate without being told)

| Layer | Choice |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| Backend |  Express, TypeScript, REST API |
| DB | PostgreSQL, Prisma ORM |
| Auth | JWT |
| File storage | Google Drive API (Phase 1) — metadata-only in DB, pluggable to Cloudflare R2 / AWS S3 later. **Never store file bytes in Postgres.** |
| Realtime (discussion) | REST + WebSocket |
| Deployment | Vercel (frontend), Render (backend) |
| Charts (analytics) | recharts |

Schema reference: see `schema.prisma` in this repo — it is the source of truth for table/column names, enums, and relations. Generate Prisma client code against it; don't invent parallel field names.

---

## 3. Roles — the core mental model

Four roles, in a strict hierarchy of **scope**, not just permission level:

| Role | Count | Scope | Can promote/demote |
|---|---|---|---|
| **Owner Admin** | Exactly 1, platform-wide | Everything (as fallback only) | Sub Admins, ownership transfer; CR (fallback) |
| **Sub Admin** | Exactly 1 per college | Their college only | CRs within their college only |
| **CR (Main / Co)** | Max 2 per ClassroomUnit | Their ClassroomUnit only | Nobody (CRs verify Students, they don't promote/demote) |
| **Student** | Unlimited | Read/participate within their verified ClassroomUnit only | Nobody |

**Main CR and Co-CR are 100% permission-identical.** The label is cosmetic. Never write an `if (seat === 'MAIN')` permission branch — if you find yourself doing that, it's a bug.

**A "ClassroomUnit" = one Department + one Session pair.** This is the atomic unit of governance. Almost every scope check in this app reduces to: *"is this actor's CR/Student assignment for the same ClassroomUnit as the record they're touching?"*

### Golden rule for every guard you write
Role check alone is never sufficient. Always check **role AND scope**:
- CR actions → must match `classroomUnitId`
- Sub Admin actions → must match `collegeId`
- Owner Admin → no scope restriction (platform-wide), but still audit-logged

---

## 4. Hard invariants (violating these is a P0 bug, not a style issue)

1. Exactly **one** active Owner Admin row exists platform-wide, always.
2. Exactly **one** active Sub Admin per college (current release — schema is designed to extend to multiple later, but do not build that now).
3. Max **two** active CR seats per ClassroomUnit: one `MAIN`, one `CO`.
4. Max **one** course-linked DiscussionGroup per course (`courseId` set). Unlimited general groups (`courseId = null`) per ClassroomUnit.
5. A `PersonalShare`'s content is visible **only** to its author and its explicit `ShareRecipient`s. **No role — including Owner Admin — may ever read the content.** Analytics may only ever show counts.
6. Every account is bound to **exactly one** college, set at registration, never multi-valued.
7. Private resources (anything beyond public browsing) require `verificationStatus = VERIFIED`. This is a global gate, not a per-feature check.
8. Notices are **never public** — visible only to verified members of the exact ClassroomUnit they were posted for.
9. Only a CR can send a `PersonalShare`. Students, Sub Admins, and the Owner Admin get a hard 403 — not a filtered view, an actual rejection.

These map directly to the partial unique indexes and guard patterns described in Section 6 below — implement the DB constraint **and** the application-level check for all of them. DB constraints alone give ugly raw errors; app checks alone aren't race-safe.

---

## 5. Authorization matrix (from PRD §11 — copy this into any permissions test suite)

| Action | Student | CR | Sub Admin | Owner Admin |
|---|---|---|---|---|
| View/download public resources | ✅ | ✅ | ✅ | ✅ |
| View/download private resources (own unit/college, verified) | ✅ | ✅ | View only | View only |
| Create/edit/delete resources | ❌ | ✅ (own unit) | ❌ | ❌ |
| Publish/edit/delete notices | ❌ | ✅ (own unit) | ❌ | ❌ |
| Verify pending Student accounts | ❌ | ✅ (own unit) | ✅ (fallback, own college) | ✅ (fallback, platform-wide) |
| Create/manage discussion groups & members | ❌ | ✅ (own unit) | ❌ | ❌ |
| Send Personal/Confidential Shares | ❌ | ✅ | ❌ | ❌ |
| Promote/demote CR | ❌ | ❌ | ✅ (own college) | ✅ (fallback, any college) |
| Promote/demote Sub Admin | ❌ | ❌ | ❌ | ✅ |
| Transfer Owner Admin role | ❌ | ❌ | ❌ | ✅ |
| View platform-wide statistics | ❌ | ❌ | ❌ (own college only) | ✅ |

---

## 6. Validation pattern — apply to every endpoint

Four layers, in this order, and don't skip any of them:

1. **DTO/schema validation** (class-validator / Zod) — types, formats, enum bounds, required fields. Runs before touching the DB.
2. **AuthGuard** — valid JWT? Is `verificationStatus === VERIFIED` where the endpoint requires it?
3. **RoleGuard** — does this role generally perform this action? (from the matrix in §5)
4. **ScopeGuard** — does *this specific user* have rights over *this specific record*? Resolve via a DB join (e.g. `CRAssignment` → `classroomUnitId` === the target record's `classroomUnitId`). Build this as a reusable decorator (e.g. `@RequireScope('classroomUnit')`), not copy-pasted inline per controller.

Cap-enforcement operations (Owner Admin singleton, one-Sub-Admin-per-college, two-CR-per-unit, one-course-linked-group) must be wrapped in a **DB transaction** with the pre-check plus the partial unique index as backstop — pre-checks alone are not race-safe under concurrent requests.

---

## 7. Data model quick reference

Full detail lives in `schema.prisma`. Key relationships an AI assistant should internalize:

```
College ─< Department ─< Semester ─< Course ─< Session ─< ClassroomUnit >─ Department
                                                              │
                                                              ├─< CRAssignment >─ User
                                                              ├─< VerificationRequest >─ User
                                                              ├─< Resource
                                                              ├─< Notice
                                                              ├─< DiscussionGroup ─< DiscussionMembership >─ User
                                                              │                  └─< Message
                                                              └─< PersonalShare ─< ShareRecipient >─ User

User ─< AdminAssignment >─ College   (role: SUB_ADMIN | OWNER_ADMIN)
User ─< CRAssignment >─ ClassroomUnit (seat: MAIN | CO)
```

Notable non-obvious constraints (see schema comments + bottom-of-file raw SQL):
- `DiscussionGroup.courseId` partial-unique (only when non-null).
- `CRAssignment` partial-unique on `(classroomUnitId, seat) WHERE isActive`.
- `AdminAssignment` partial-unique on `collegeId WHERE role='SUB_ADMIN' AND isActive`, and on `role WHERE role='OWNER_ADMIN' AND isActive`.

`AuditLog` is append-only — the app's DB role should have INSERT+SELECT only, no UPDATE/DELETE.

---

## 8. Feature scope by phase (don't build Phase 3 features into Phase 1 code paths)

- **Phase 1:** Auth + college binding, hierarchy CRUD, Owner↔Sub Admin & Sub↔CR assignment, verification flow, Resource CRUD + Google Drive integration, PDF preview, public browsing.
- **Phase 2:** Notices, discussion groups + membership, Personal/Confidential Sharing, search improvements, role-specific dashboards.
- **Phase 3:** Notifications, advanced search, Owner Admin Analytics, audit-trail UI.

---

## 9. Things an AI assistant should proactively flag, not silently "fix"

- Any request that reintroduces a "Teacher" role or gives Students write access to resources/notices/discussion management.
- Any admin-facing query that would `SELECT *` (or otherwise touch `content`) from `PersonalShare` — this should always be blocked and called out, even if the request seems like a reasonable admin feature.
- Any permission logic that distinguishes Main CR from Co-CR.
- Any cap-enforcement code (Owner Admin singleton, Sub Admin per college, CR seats, course-linked groups) that only checks in application code without a transaction or matching partial unique index.
- Cross-college or cross-classroom-unit actions that only check role, not scope.

---

## 10. Related files in this repo

- `schema.prisma` — canonical DB schema.
- `Backend_Implementation_Plan.md` — module build order, per-module validation checklist, sprint mapping.
- PRD source: *College_Resource_Platform_PRD_v3_0_FINAL* (all business rules in this file are derived from it — treat it as the ultimate source of truth if this file and the PRD ever disagree).