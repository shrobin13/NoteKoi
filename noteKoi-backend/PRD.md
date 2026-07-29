# PRD — College Resource & Academic Collaboration Platform
### AI-Implementation Edition — derived from v3.0 (Final)

> **Format note:** This document restates the human PRD as an unambiguous rule set for an AI coding agent to implement against. Every requirement is written as a discrete, testable rule (`R-###`) so it can be traced to code and to a test case. Where the original PRD used prose that implied a rule, that rule is made explicit here. If this document and the original PRD ever conflict, treat that as a bug to flag, not something to silently resolve either way.

---

## 0. Document conventions

- `R-###` — a functional/business rule. Each one should map to at least one automated test.
- `INV-###` — a system invariant that must hold true at all times, including under concurrent writes.
- `MUST` / `MUST NOT` — non-negotiable. `SHOULD` — strong default, deviate only with explicit instruction.
- Entity names in `PascalCase` refer directly to Prisma models of the same name.

---

## 1. Product summary

A web platform organizing academic resources by **College → Department → Semester → Course → Session**. Content and communication governance is fully decentralized to elected **Class Representatives (CRs)**. There is **no Teacher role** — `R-001`: no code path may create, reference, or gate on a "Teacher" role.

Two-tier administration exists solely to appoint/remove CRs and Sub Admins:
- One **Owner Admin**, platform-wide.
- One **Sub Admin** per college.

Neither admin tier touches resources, notices, discussion membership, or shares directly (`R-002`).

---

## 2. Roles

### 2.1 Owner Admin
- `INV-001`: Exactly one active Owner Admin exists platform-wide at all times.
- `R-003`: Owner Admin MAY promote a verified user to Sub Admin for any college, or demote a Sub Admin.
- `R-004`: Owner Admin MAY transfer ownership to another verified user. This MUST be atomic — the prior Owner Admin is demoted and the new one promoted in a single transaction (`INV-001` must never be violated mid-transfer, not even for one row).
- `R-005`: Owner Admin MAY promote/demote a CR for any ClassroomUnit, and verify any account, as a platform-wide fallback.
- `R-006`: Owner Admin MAY view platform-wide structure and statistics across all colleges.
- `R-007`: Owner Admin MUST NOT directly manage Resources, Notices, or DiscussionMembership.
- `R-008`: Owner Admin MUST NOT ever read `PersonalShare.content`, under any code path, including admin tooling, support tooling, or ad-hoc DB scripts run by staff.

### 2.2 Sub Admin
- `INV-002`: Exactly one active Sub Admin exists per college (current scope — schema may support more in future, do not build multi-Sub-Admin logic now).
- `R-009`: Sub Admin MAY promote a verified Student to CR (Main or Co) for any ClassroomUnit **within their own college only**, or demote a CR back to Student.
- `R-010`: Sub Admin MAY verify pending Student accounts directly, as a fallback when no CR is available, **scoped to their own college**.
- `R-011`: Sub Admin MAY view structure/statistics scoped to their own college only.
- `R-012`: Sub Admin MUST NOT promote, demote, or otherwise manage another Sub Admin.
- `R-013`: Sub Admin MUST NOT transfer their own or another's Sub Admin role — only Owner Admin reassigns a college's Sub Admin.
- `R-014`: Sub Admin MUST NOT directly manage Resources, Notices, or DiscussionMembership.

### 2.3 Class Representative (CR) — Main & Co
- `INV-003`: At most 2 active CR seats per ClassroomUnit — exactly one `MAIN`, one `CO`.
- `R-015`: Main CR and Co-CR MUST have fully identical permissions. `R-016`: No code path may branch on `seat === MAIN` vs `CO` for permission purposes. The seat label is for display only.
- `R-017`: Only the ClassroomUnit's college's Sub Admin, or the Owner Admin (fallback), may assign/demote a CR seat.
- `R-018`: A CR has full CRUD over Resources scoped to their own ClassroomUnit only.
- `R-019`: A CR may publish/edit/delete Notices scoped to their own ClassroomUnit only. Either of the two assigned CRs (not just the original author) may edit/delete a given Notice.
- `R-020`: A CR may create and manage DiscussionGroups and DiscussionMembership within their own ClassroomUnit.
- `R-021`: A CR may verify pending Student accounts requesting to join their own ClassroomUnit.
- `R-022`: A CR is the only role permitted to send a `PersonalShare`.

### 2.4 Student
- `R-023`: Student MAY register and select exactly one college.
- `R-024`: Student account starts `PENDING` and awaits verification from a CR of their declared ClassroomUnit (or Sub Admin/Owner Admin fallback) before gaining private-resource access.
- `R-025`: Once verified, Student MAY browse/download resources, view Notices, and participate in DiscussionGroups scoped to their own ClassroomUnit.
- `R-026`: Student MAY view any `PersonalShare` explicitly addressed to them (via `ShareRecipient`).
- `R-027`: Student MUST NOT upload/edit/delete Resources, publish Notices, manage DiscussionMembership, or send PersonalShares.

---

## 3. Account verification & college binding

- `INV-004`: Every account is bound to exactly one `collegeId` at registration. Never multi-valued, never mutable after registration without an explicit admin-driven transfer flow (not in current scope — flag if requested).
- `R-028`: A Student account remains `PENDING` until a CR of the declared ClassroomUnit approves it.
- `R-029`: Fallback order for verification: CR of the unit → Sub Admin of the college → Owner Admin (platform-wide).
- `R-030`: Approving an already-`VERIFIED` request MUST be idempotent (return success without reprocessing), not error.
- `INV-005`: All private-resource endpoints (Resources beyond public visibility, Notices, DiscussionGroups, PersonalShares) MUST reject any request where `user.verificationStatus !== VERIFIED`, enforced by one shared guard, not duplicated per-module logic.

---

## 4. Information architecture

Content hierarchy (strict top-down containment):
```
College → Department → Semester → Course → Session → {Resources, Notices via ClassroomUnit}
```

Governance hierarchy (independent axis):
```
Owner Admin → Sub Admin (1/college) → ClassroomUnit (Dept+Session) → up to 2 CRs → verified Students
```

- `R-031`: A `ClassroomUnit` = exactly one `(departmentId, sessionId)` pair. `INV-006`: no two ClassroomUnit rows may share the same pair.

---

## 5. Features

### 5.1 Public (no auth)
- `R-032`: Resource search by title, course, department, semester, resource type — public resources only.
- `R-033`: Public academic resources are browsable without login.
- `R-034`: In-browser preview for supported file types (e.g. PDF).
- `R-035`: Notices, discussion content, private resources, and PersonalShares MUST NEVER appear in any unauthenticated response, under any query path or error state.

### 5.2 Resource Management (CR-owned)
- `R-036`: CR has full CRUD on Resources within their ClassroomUnit.
- `R-037`: Student has read/download only, scoped to their verified ClassroomUnit.
- `R-038`: Every Resource carries `category`, course/session relationship, and `visibility` (`PUBLIC`/`PRIVATE`).
- `R-039`: Public-resource list queries MUST filter `visibility = PUBLIC` at the database query level, not only in response serialization.

### 5.3 Notices (Department+Session scoped)
- `R-040`: Only the two CRs of a ClassroomUnit may create/edit/delete its Notices.
- `R-041`: A Notice is visible only to verified members of its exact ClassroomUnit — never other sessions, departments, or the public.

### 5.4 Discussion Groups
- `INV-007`: At most one DiscussionGroup per `courseId` (when `courseId` is set).
- `R-042`: Unlimited general (non-course) DiscussionGroups per ClassroomUnit (`courseId = null`).
- `R-043`: A CR (either seat) may add/remove any member from any group they manage, at any time.
- `R-044`: Full message history is retained and searchable within each group.
- `R-045`: Managing a group (add/remove members) and posting a message are separate permissions — a member can post without being able to manage membership; a CR managing membership is not automatically "a poster" if they were removed as a member themselves (edge case — should not normally occur, but guard both independently).

### 5.5 Personal / Confidential Sharing
- `R-046`: Only a CR may send a `PersonalShare`.
- `R-047`: Visible only to explicitly addressed `ShareRecipient`(s) plus the author — never the whole ClassroomUnit, never public.
- `R-048`: Structurally and query-path separate from Notices/DiscussionGroups — must never appear in either's feed.
- `INV-008`: No query outside of "am I the author or an explicit recipient" may ever return `PersonalShare.content`. This includes admin dashboards, analytics, support tooling, and audit exports.

### 5.6 User Profile
- `R-049`: Displays name, college, department, semester, course, session, role, verification status, and role-appropriate activity summary.
- `R-050`: A user may edit only their own profile fields. Verification-status overrides by Sub Admin/Owner Admin MUST live on a separate endpoint with its own guard — never a conditional branch inside the generic profile-edit endpoint.

### 5.7 Dashboards
- `R-051`: Student, CR, Sub Admin, and Owner Admin each get a distinct dashboard. Sub Admin dashboard data MUST be pre-filtered server-side to their college — never returned unfiltered with an expectation the frontend filters it.

### 5.8 Owner Admin Analytics
- `R-052`: Visible only to Owner Admin (Sub Admin gets college-scoped equivalents per §2.2).
- `INV-009`: PersonalShare-related statistics MUST be count-only, sourced from a dedicated aggregate that never selects `content`.
- `R-053`: Suggested metrics: total/active users (DAU/WAU/MAU) platform-wide and per college; registration trend and verification funnel (pending vs verified, average turnaround); college/Sub Admin/ClassroomUnit counts and CR coverage (including units with 0 or 1 CR); resource counts and storage volume by college/department; Notice counts and reach; DiscussionGroup/message counts and most-active groups; PersonalShare send counts (never content); full role-change audit trail.

---

## 6. Non-functional requirements

- `R-054` **Performance:** resource browsing and API responses should be optimized (paginate list endpoints; avoid N+1 queries across the hierarchy joins).
- `R-055` **Security:** JWT auth; role- and scope-based authorization on every endpoint (see §7); secure file access (never expose raw Drive credentials to the client); PersonalShare access enforced via explicit recipient ACL, not role checks alone.
- `INV-010` **Privacy-first design:** PersonalShare content is end-to-end restricted to sender + recipients. No exceptions for any admin role, ever, including in analytics.
- `R-056` **Scalability:** modular backend architecture; storage layer must remain swappable (Google Drive → R2/S3) without changing the Resource metadata schema; the ClassroomUnit model must scale independently of college/department growth (no assumptions of a fixed or small number of ClassroomUnits).

---

## 7. Authorization matrix (canonical — copy into test suite)

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

## 8. Data entities (see `schema.prisma` for authoritative field-level definitions)

`User, College, Department, Semester, Course, Session, ClassroomUnit, AdminAssignment, CRAssignment, VerificationRequest, Resource, Notice, DiscussionGroup, DiscussionMembership, Message, PersonalShare, ShareRecipient, AuditLog`

Each entity's purpose/key fields are defined once, in the schema file — this PRD does not restate field lists to avoid drift between two sources of truth. If a rule here implies a field that doesn't exist in the schema, flag the mismatch rather than guessing a column name.

---

## 9. Technology stack

| Layer | Choice |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS or Express.js, TypeScript, REST API |
| Database | PostgreSQL (Neon Free Tier), Prisma ORM |
| Storage | Google Drive API (Phase 1) → Cloudflare R2 / AWS S3 (future) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 10. MVP phasing

| Phase | Scope |
|---|---|
| **1** | Auth + college binding · hierarchy CRUD · Owner↔Sub Admin & Sub↔CR assignment · verification flow · Resource CRUD + Drive integration · PDF preview · public browsing |
| **2** | Notices · discussion groups + membership · PersonalShare (CR-only) · search improvements · CR/Sub Admin/Owner Admin dashboards |
| **3** | Notifications · advanced search · Owner Admin Analytics · audit-trail UI |

`R-057`: Do not implement Phase 2/3 features as dependencies of Phase 1 code — each phase should be independently shippable per the table above.

---

## 11. Success metrics (for reference — not implementation rules)

Resources uploaded · active student users · search usage · discussion participation · Notice reach within scoped ClassroomUnit · verification turnaround time · resource availability/reliability.

---

## 12. Resolved decisions (no open questions remain)

All ambiguities below were explicitly resolved during PRD review — treat any request that reopens them as requiring explicit new instruction, not silent reinterpretation:

1. **Admin scope:** two-tier (Owner Admin + one Sub Admin/college) — final.
2. **Main vs Co-CR:** fully identical, no distinction — final.
3. **Unassigned units / stuck verification:** Sub Admin (own college) then Owner Admin (platform-wide) fallback — final.
4. **Discussion granularity:** max 1 course-linked group per course; unlimited general groups — final.
5. **PersonalShare senders:** CR only — final.
6. **Sub Admin count:** exactly 1/college now; schema extendable later, not built now — final.
7. **PersonalShare privacy in analytics:** counts only, content never exposed to any admin role — final.

---

## 13. Traceability

When implementing, reference rule IDs (`R-###`, `INV-###`) in code comments and test names wherever the logic is non-obvious, e.g.:

```ts
// R-030: idempotent re-approval — return early if already VERIFIED
// INV-003: enforced here + partial unique index CRAssignment_unit_seat_active_unique
```

This keeps a direct line from PRD rule → implementation → test, so a future change to one rule can be grepped across the codebase by its ID.