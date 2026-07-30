# Product Requirements Document

## College Resource & Academic Collaboration Platform

*Version 3.0 — Final*

**Date:** July 29, 2026
**Status:** Final — approved for development

---

## 0. Revision Summary — What Changed from v1.0

This version replaces the Teacher role entirely and introduces a student-led governance model built around the Class Representative (CR). Key changes consolidated from stakeholder input:

- **Teacher role removed.** Resource CRUD (create, read, update, delete) is now owned by the Class Representative(s), not a Teacher account.
- **Two-tier Administrator model.** One platform-wide Owner Admin, plus one Sub Admin per college. The Owner Admin can promote/demote Sub Admins and transfer ownership; each Sub Admin governs only their own college and can promote/demote CRs for any Department + Session within it, but cannot promote, demote, or otherwise manage other Sub Admins.
- **CR capacity capped at two per classroom unit.** A classroom unit (defined as one Department + Session pair) may have at most two CRs: one Main CR and one Co-CR, with fully identical permissions.
- **Mandatory verification + college binding.** Every account must be linked to exactly one college and verified before it can access private (authenticated) resources. Verification is normally done by a CR, with the Sub Admin (and Owner Admin) able to verify directly as a fallback.
- **Notices scoped to Department + Session.** Notices are never public — they are only visible to the specific Department + Session they were posted for, and only the two CRs assigned to that unit can publish them.
- **CR-created, CR-assigned discussion groups.** CRs can create multiple discussion groups within their classroom unit and assign each one to any course; CRs can add or remove any member from any group they manage.
- **New Personal/Confidential Sharing feature — CR-only.** A private, targeted sharing channel (e.g. confidential notes or suggestions) that only a CR can send, visible only to the specific members it is addressed to — separate from Notices and Discussion.
- **New User Profile section and separate CR/Sub Admin/Owner Admin dashboards.** Distinct dashboard experiences per role, including a platform-wide statistics dashboard for the Owner Admin.

---

## 1. Product Overview

The College Resource & Academic Collaboration Platform is a web-based system that organizes academic resources by college, department, semester, course, and session. It gives students structured access to lecture materials, notes, books, previous-year questions, and related software.

Governance of content and communication is decentralized to student-elected Class Representatives (CRs) rather than a separate Teacher role. Platform administration is two-tiered: one Owner Admin oversees the entire platform and appoints a Sub Admin for each college, and each Sub Admin governs CR appointments within their own college. Day-to-day content and communication management is handled entirely by CRs within their own classroom unit.

---

## 2. Product Goals

- Centralize academic resources in one searchable platform.
- Provide structured, permission-controlled access to course materials.
- Reduce dependency on scattered Google Drive links and messaging groups.
- Give every classroom unit (Department + Session) self-governance through elected CRs, without needing a Teacher account.
- Guarantee that only verified members of a college can access that college's private resources.
- Provide a lightweight, transferable Administrator layer for platform-wide role governance.
- Support both open, department-wide communication (Notices, Discussion) and narrow, targeted private communication (Personal Sharing).

---

## 3. Roles & Governance Model

### 3.1 Owner Admin (platform owner)

Exactly one Owner Admin account exists for the entire platform, across all colleges.

- Promote a verified user to Sub Admin for any college, or demote a Sub Admin back to their prior role.
- Transfer platform ownership to another verified user. The previous Owner Admin immediately reverts to their prior role; only one Owner Admin exists after the transfer.
- Can also directly promote/demote a CR for any Department + Session, and verify accounts directly, as a platform-wide fallback — though this is normally delegated to the relevant Sub Admin.
- View platform-wide structure and statistics across every college (see Section 6.2.6 Owner Admin Analytics).
- Does NOT directly manage resources, notices, or discussion group membership — that responsibility belongs to CRs.

### 3.2 Sub Admin (per college)

Exactly one Sub Admin account exists per college, appointed by the Owner Admin.

- Promote a verified Student to CR (Main CR or Co-CR) for any Department + Session within their own college, or demote a CR back to Student.
- Verify pending Student accounts directly, as a fallback when no CR is available for that Department + Session.
- View structure and statistics scoped to their own college only.
- Cannot promote, demote, or otherwise manage another Sub Admin, and cannot transfer the Sub Admin role — only the Owner Admin can reassign a college's Sub Admin.
- Cannot manage resources, notices, or discussion group membership directly — that remains CR-owned.
- Capacity: exactly one Sub Admin per college in the current scope. The model is designed to be extendable to multiple Sub Admins per college in a future release, but this is not built now.

### 3.3 Class Representative (CR) — Main CR & Co-CR

The CR is the operational content and communication manager for one classroom unit, defined as one Department + Session pair. Main CR and Co-CR have fully identical permissions — the Main/Co label is for identification only and carries no functional or administrative difference.

- Capacity: exactly two CR seats per classroom unit — one Main CR and one Co-CR. No more than two may be assigned at a time.
- Assignment: only the relevant college's Sub Admin (or the Owner Admin, as fallback) can promote a Student into either seat, or demote a CR out of it.
- Permissions (identical for Main CR and Co-CR): full CRUD on academic resources within their classroom unit; publish, edit, and delete Notices scoped to their Department + Session; create and manage discussion groups and their membership; verify pending Student accounts requesting to join their Department + Session; send Personal/Confidential Shares to specific members (the only role able to send these).

### 3.4 Student

- Register an account and select their college.
- Await verification from a CR of their Department + Session (or the Sub Admin/Owner Admin as fallback) before gaining private access.
- Browse and download resources, view notices for their own Department + Session, and participate in discussion groups they're added to, once verified.
- View any Personal/Confidential Share specifically addressed to them.
- Cannot upload, edit, or delete resources, publish notices, manage discussion membership, or send Personal/Confidential Shares.

### 3.5 Role Assignment Rules Summary

| Rule | Detail |
|---|---|
| Owner Admin count | Exactly one, platform-wide, at all times |
| Sub Admin count | Exactly one per college for now (design allows extending to multiple per college in a future release, not built now) |
| Ownership transfer | Owner Admin only; only one Owner Admin active after transfer |
| Sub Admin promote/demote authority | Owner Admin only — a Sub Admin cannot manage another Sub Admin |
| CR promote/demote authority | The college's Sub Admin, or the Owner Admin as fallback |
| CR seats per classroom unit | Maximum 2 (1 Main CR + 1 Co-CR) |
| Classroom unit definition | One Department + one Session |
| CR permission parity | Main CR and Co-CR have fully equal permissions |
| Account verification authority | CR (primary), Sub Admin or Owner Admin (fallback) |
| Personal/Confidential Share senders | CR only |
| Discussion groups per course | Maximum 1 (course-linked); unlimited general/topic groups per classroom unit |
| Personal Share content visibility | Sender and recipient(s) only — never visible to Sub Admin or Owner Admin, including in analytics |

---

## 4. Account Verification & College Binding

Private resources (anything beyond public browsing) are only available to accounts that satisfy both conditions below:

- **College binding —** every account must be linked to exactly one college at registration. A single account cannot span multiple colleges.
- **CR verification —** a new Student account remains in a Pending state until one of the two CRs of the Student's declared Department + Session approves it. Only after approval does the account unlock private-resource access.

Fallback: if no CR is available or a request is stuck, the college's Sub Admin can verify the account directly. The Owner Admin can also verify any account platform-wide as an ultimate fallback.

---

## 5. Information Architecture

**Content hierarchy:**

College
→ Department
→ Semester
→ Course
→ Session
→ Lectures / Notes / Previous Year Questions / Tutorials / Related Software

**Governance hierarchy (independent of the content tree above):**

- Owner Admin (platform-wide) → Sub Admin (1 per college) → Classroom units (Department + Session pairs) → up to 2 CRs (Main + Co-CR) per unit → verified Students within that unit.

---

## 6. Feature List

### 6.1 Public Features (no login required)

- Resource Search — search by title, course, department, semester, and resource type, across public resources only.
- Public Academic Resources — publicly released lecture sheets, reference books, notes, previous-year questions, and related software/tools.
- Resource Preview — in-browser preview for supported file types (e.g., PDFs).

*Not visible publicly: Notices, discussion content, private resources, and Personal/Confidential Shares are excluded from all public/unauthenticated views under any circumstance.*

### 6.2 Private Features (verified, college-bound accounts only)

#### 6.2.1 Resource Management (CR-owned)

- Main CR and Co-CR have full CRUD control over resources within their Department + Session.
- Students have read/download access only within their verified classroom unit.
- Every resource carries category, course/session relationship, and visibility (public vs private) metadata.

#### 6.2.2 Notices (Department + Session scoped)

- Notices are created and managed exclusively by the two CRs assigned to a given Department + Session.
- A notice is only visible to verified members of that exact Department + Session — never to other sessions, other departments, or the public.
- Notices support edit and delete by either assigned CR.

#### 6.2.3 Discussion Groups

- A discussion group can be assigned to a course — and each course may have at most one discussion group. A course cannot have two groups competing for the same topic.
- CRs can also create general discussion groups that are not tied to any course (e.g. for a random/open topic); any number of general groups may exist within a classroom unit.
- CRs (Main or Co-CR) can add or remove any member from any discussion group they manage, at any time.
- Full message history is retained and searchable within each group.

#### 6.2.4 Personal / Confidential Sharing

- A distinct sharing channel — e.g. confidential notes, private suggestions, or targeted announcements.
- Only a CR can send a Personal/Confidential Share — Students, Sub Admins, and the Owner Admin cannot send one.
- Visible only to the specific member(s) the CR explicitly addresses it to — not the whole classroom unit, and never public.
- Kept structurally separate from Notices and Discussion so it never leaks into either group view.

#### 6.2.5 User Profile

- Personal details: name, college, department, semester, course, session, role (Student / CR / Sub Admin / Owner Admin).
- Verification status indicator (Pending / Verified).
- Activity summary: resources uploaded (CR), notices posted (CR), discussion participation.

#### 6.2.6 Dashboards

- **Student Dashboard** — resource browser, notices for their classroom unit, discussion access, profile, and any Personal Shares addressed to them.
- **CR Dashboard** — resource CRUD tools, notice composer, discussion group creator/manager, pending-verification queue, and Personal Share composer.
- **Sub Admin Dashboard** — structure view for their own college, CR promote/demote controls, fallback account-verification tool, and college-level statistics.
- **Owner Admin Dashboard** — platform-wide structure view across all colleges, Sub Admin promote/demote controls, ownership-transfer control, a global audit log of role changes, and the platform-wide statistics view described below.

#### 6.2.7 Owner Admin Analytics (platform-wide statistics)

Visible only to the Owner Admin. Privacy is treated as a top priority: the Owner Admin (and every other role) can never view the content of a Personal/Confidential Share — only aggregate counts are ever exposed, with no exceptions. Suggested key statistics:

- Total and active users (daily/weekly/monthly active users), platform-wide and per college.
- New registrations over time, and verification funnel: pending vs. verified accounts, average verification turnaround time.
- Number of colleges, Sub Admins, classroom units, and CR coverage — including a list of classroom units with zero or one CR assigned.
- Total resources uploaded, by college/department, and storage volume used (Google Drive quota consumption).
- Notices published and their reach (verified members per Department + Session).
- Discussion groups created, messages sent, and most active groups.
- Personal/Confidential Shares sent (count only — content stays private/uninspectable to preserve confidentiality).
- Role-change audit trail: promotions, demotions, and ownership/Sub Admin transfers over time.

---

## 7. Feature-to-Technology Mapping

| Feature | Primary Stack Components |
|---|---|
| Resource Search & Preview (public) | Next.js (SSR/ISR pages) + REST API (NestJS/Express) + PostgreSQL full-text search |
| Authentication, Roles & Verification | JWT-based auth, NestJS/Express role guards (Owner Admin/Sub Admin/CR/Student), PostgreSQL Users/VerificationRequest tables |
| Owner Admin ↔ Sub Admin management | REST API with ownership-scoped guards + PostgreSQL AdminAssignment table (role, collegeId, assignedBy) |
| Sub Admin ↔ CR management | REST API with college-scoped guards + PostgreSQL CRAssignment table |
| Resource CRUD (CR) | Next.js CR dashboard UI + REST API + Prisma ORM + Google Drive API for file storage |
| Notices (Dept+Session scoped) | REST API with role/scope guards + PostgreSQL Notice table (departmentId, sessionId) + Next.js notice feed |
| CR-created Discussion Groups & Membership | REST/WebSocket API + PostgreSQL DiscussionGroup (courseId nullable, unique when set, classroomUnitId, createdBy) / Message / Membership tables |
| Personal/Confidential Sharing (CR-only) | REST API restricting sender to CR role + recipient-list ACL checks + PostgreSQL PersonalShare/ShareRecipient tables |
| User Profile | Next.js profile page + REST API + PostgreSQL Users table |
| CR / Sub Admin / Owner Admin Dashboards | Next.js role-gated routes (middleware) + shadcn/ui components |
| Owner Admin Analytics | Aggregation REST endpoints + PostgreSQL analytical queries (materialized views) + recharts on the Next.js dashboard |
| File Storage | Google Drive API (Phase 1) → migration-ready to Cloudflare R2 / AWS S3 |
| Deployment | Vercel (frontend), Render (backend) |

---

## 8. File Management Strategy

Files are initially stored using the Google Drive API. The application stores only metadata:

- File name
- File ID
- File URL
- Preview URL
- Resource category
- Visibility (public/private)
- Course/session relationship
- Owning CR (uploader) reference

The architecture keeps storage pluggable to allow future migration to object storage such as Cloudflare R2 or AWS S3 without changing the resource-metadata schema.

---

## 9. Technology Stack

**Frontend**

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend**

- NestJS or Express.js
- TypeScript
- REST API

**Database**

- PostgreSQL
- Prisma ORM
- Neon PostgreSQL Free Tier

**Storage**

- Google Drive API (Phase 1)
- Cloudflare R2 or AWS S3 (future migration path)

**Deployment**

- Vercel for frontend
- Render for backend

---

## 10. Database Entities

| Entity | Purpose / Key Fields |
|---|---|
| User | Auth info, role (Student/CR/SubAdmin/OwnerAdmin), collegeId, departmentId, sessionId, verification status |
| College | College information |
| Department | Department details |
| Semester | Semester information |
| Course | Course details |
| Session | Academic session |
| ClassroomUnit | Department + Session pairing; the scope for CR assignment, notices, and discussion |
| AdminAssignment | Links a User to a College as Sub Admin, or marks the single Owner Admin; assigned/revoked by Owner Admin |
| CRAssignment | Links a User to a ClassroomUnit as Main CR or Co-CR; assigned/revoked by that college's Sub Admin (or Owner Admin fallback) |
| VerificationRequest | Pending Student → ClassroomUnit approval request; resolved by a CR, Sub Admin, or Owner Admin |
| Resource | Academic file metadata, visibility flag, uploader (CR) reference |
| Notice | Departmentid + sessionId scoped announcement; author is one of the two CRs |
| DiscussionGroup | CR-created discussion channel; linked to a classroomUnitId and an optional courseId — unique constraint on (courseId) when set (max 1 group per course); groups with courseId = null are general/topic groups, unlimited per classroom unit |
| DiscussionMembership | Which Users belong to a DiscussionGroup; managed by the creating/assigned CR |
| Message | Discussion messages |
| PersonalShare | Confidential note/suggestion content; author is always a CR |
| ShareRecipient | Explicit list of Users a PersonalShare is visible to |

---

## 11. Authorization Matrix

| Action | Student | CR (Main/Co) | Sub Admin | Owner Admin |
|---|---|---|---|---|
| View/download public resources | Yes | Yes | Yes | Yes |
| View/download private resources (own unit/college, once verified) | Yes | Yes | View only | View only |
| Create/edit/delete resources | No | Yes (own unit) | No | No |
| Publish/edit/delete notices | No | Yes (own unit) | No | No |
| Verify pending Student accounts | No | Yes (own unit) | Yes (fallback, own college) | Yes (fallback, platform-wide) |
| Create/manage discussion groups & members | No | Yes (own unit) | No | No |
| Send Personal/Confidential Shares | No | Yes | No | No |
| Promote/demote CR | No | No | Yes (own college) | Yes (fallback, any college) |
| Promote/demote Sub Admin | No | No | No | Yes |
| Transfer Owner Admin role | No | No | No | Yes |
| View platform-wide statistics | No | No | No (own college only) | Yes |

---

## 12. MVP Scope

**Phase 1**

- Authentication + college binding
- College/department/semester/course/session hierarchy
- Owner Admin ↔ Sub Admin appointment; Sub Admin ↔ CR promotion/demotion
- Account verification flow (CR-approved, with Sub Admin/Owner Admin fallback)
- Resource CRUD (CR) + Google Drive integration
- PDF preview
- Public resource browsing

**Phase 2**

- Notices (Department + Session scoped)
- CR-created discussion groups with membership management
- Personal/Confidential Sharing (CR-only)
- Search improvements
- CR Dashboard + Sub Admin Dashboard + Owner Admin Dashboard

**Phase 3**

- Notifications
- Advanced search
- Owner Admin Analytics (statistics dashboard)
- Role-change audit trail UI (Owner Admin ↔ Sub Admin ↔ CR)

---

## 13. Non-Functional Requirements

**Performance**

- Fast resource browsing.
- Optimized API responses.

**Security**

- JWT authentication.
- Role- and scope-based authorization (Student/CR/Sub Admin/Owner Admin, with College and Department+Session scoping).
- Secure file access.
- Personal Shares restricted to CR senders and enforced via explicit recipient ACL checks, not just role checks.
- Privacy-first design: Personal/Confidential Share content is end-to-end restricted to sender + recipient(s) — no admin role, including the Owner Admin, can access content, only aggregate counts in analytics.

**Scalability**

- Modular backend architecture.
- Replaceable storage layer.
- Classroom-unit model scales independently of college/department growth.

---

## 14. Success Metrics

- Number of uploaded resources.
- Active student users.
- Search usage.
- Discussion participation.
- Notice reach within scoped Department + Session.
- Verification turnaround time (registration → CR approval).
- Resource availability and reliability.

---

## 15. Resolved Decisions — Final

Every open question raised during review has been confirmed. This PRD is final and conflict-free:

- **Admin scope — RESOLVED.** Two-tier model: one platform-wide Owner Admin (can promote/demote Sub Admins, transfer ownership) plus one Sub Admin per college (can promote/demote CRs for their college only; cannot manage other Sub Admins).
- **Main CR vs Co-CR — RESOLVED.** Fully identical permissions; no distinction of any kind.
- **Unassigned classroom units / stuck verification — RESOLVED.** Sub Admin can verify directly for their college; Owner Admin can verify directly platform-wide, as a further fallback.
- **Discussion group granularity — RESOLVED.** CRs create discussion groups themselves. A course may have at most one course-linked discussion group; CRs may additionally create any number of general (non-course) discussion groups for open topics.
- **Personal/Confidential Share senders — RESOLVED.** CR only. Students, Sub Admins, and the Owner Admin cannot send one.
- **Sub Admin count per college — RESOLVED.** Exactly one Sub Admin per college for the current release. The data model keeps this extendable to multiple Sub Admins per college in a future release, but that is explicitly out of scope now.
- **Personal Share privacy in analytics — RESOLVED.** Privacy is the top priority: the Owner Admin dashboard shows aggregate counts of Personal/Confidential Shares only. Content is never exposed to any admin role under any circumstance.

*No further open questions remain. This document is ready to move into development.*