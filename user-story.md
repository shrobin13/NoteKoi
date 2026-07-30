# User Stories — College Resource & Academic Collaboration Platform

**Source:** College_Resource_Platform_PRD_v3.0_FINAL
**Roles covered:** Guest (Public), Student, Class Representative (Main CR / Co-CR), Sub Admin, Owner Admin

Each story follows the format: *As a [role], I want to [do something], so that [benefit] — with acceptance criteria drawn directly from the PRD.*

---

## 1. Guest / Public Visitor (No Login Required)

### 1.1 Search public resources
**As a** guest, **I want to** search academic resources by title, course, department, semester, and resource type, **so that** I can find material without needing an account.
- Acceptance criteria: Search only returns resources marked **public**; private resources, notices, discussion content, and Personal/Confidential Shares never appear.

### 1.2 Browse public academic resources
**As a** guest, **I want to** view publicly released lecture sheets, reference books, notes, previous-year questions, and related software/tools, **so that** I can access open academic material freely.

### 1.3 Preview a file before downloading
**As a** guest, **I want to** preview supported files (e.g., PDFs) directly in the browser, **so that** I can check relevance before downloading.

---

## 2. Student

### 2.1 Register and select a college
**As a** student, **I want to** create an account and bind it to exactly one college, **so that** my access is scoped correctly from the start.
- Acceptance criteria: An account cannot be linked to more than one college; college binding happens at registration.

### 2.2 Await and receive verification
**As a** student, **I want to** have my account reviewed and approved by a CR of my Department + Session, **so that** I can unlock private resource access.
- Acceptance criteria: Account starts in **Pending** state. Approval normally comes from one of the two CRs of my declared Department + Session. If no CR is available or the request is stuck, the college's Sub Admin can verify me directly; the Owner Admin can also verify me as a platform-wide fallback.

### 2.3 Browse and download resources
**As a** verified student, **I want to** browse and download resources within my classroom unit, **so that** I can access lecture materials, notes, books, previous-year questions, and software.
- Acceptance criteria: Read/download only — no create, edit, or delete rights.

### 2.4 View notices for my classroom
**As a** verified student, **I want to** see notices posted for my exact Department + Session, **so that** I stay informed about announcements relevant to me.
- Acceptance criteria: I cannot see notices from other departments or sessions; notices are never public.

### 2.5 Participate in discussion groups
**As a** verified student, **I want to** join and post in discussion groups I've been added to, **so that** I can collaborate with classmates on courses or open topics.
- Acceptance criteria: I can only participate in groups a CR has added me to; full message history is visible and searchable within those groups.

### 2.6 Receive Personal/Confidential Shares
**As a** verified student, **I want to** view any Personal/Confidential Share a CR has specifically addressed to me, **so that** I can receive private notes or targeted suggestions.
- Acceptance criteria: Visible only if I am an explicit recipient; I cannot send my own shares.

### 2.7 View and manage my profile
**As a** student, **I want to** see my personal details, verification status, and activity summary, **so that** I can track my standing on the platform.
- Acceptance criteria: Profile shows name, college, department, semester, course, session, role, and Pending/Verified status.

### 2.8 Understand my limits
**As a** student, **I want to** be prevented from uploading/editing/deleting resources, publishing notices, managing discussion membership, or sending Personal/Confidential Shares, **so that** classroom content stays governed by CRs.

---

## 3. Class Representative (Main CR & Co-CR)

> Main CR and Co-CR have **fully identical permissions**. The Main/Co label is for identification only — there is no functional or administrative difference between them. A classroom unit (one Department + one Session) may have at most **two** CRs at a time.

### 3.1 Manage academic resources (full CRUD)
**As a** CR, **I want to** create, read, update, and delete resources within my classroom unit, **so that** I can keep course materials accurate and current.
- Acceptance criteria: Every resource carries category, course/session relationship, and a public/private visibility flag. Only CRs (not students, Sub Admins, or the Owner Admin) can perform CRUD on resources.

### 3.2 Publish and manage notices
**As a** CR, **I want to** publish, edit, and delete notices scoped to my Department + Session, **so that** I can communicate directly and reliably with my classroom unit.
- Acceptance criteria: Notices are visible only to verified members of that exact Department + Session; either of the two assigned CRs can edit or delete a notice; notices are never public.

### 3.3 Create and manage discussion groups
**As a** CR, **I want to** create discussion groups and assign them to a course, or create general (non-course) groups, **so that** I can organize collaboration by topic.
- Acceptance criteria: A course can have **at most one** linked discussion group. Any number of general/topic groups (no course link) may exist within the classroom unit.

### 3.4 Manage discussion group membership
**As a** CR, **I want to** add or remove any member from any discussion group I manage, **so that** I can keep group membership correct and relevant.
- Acceptance criteria: Applies to any group in my classroom unit, at any time.

### 3.5 Verify pending student accounts
**As a** CR, **I want to** approve pending Student accounts requesting to join my Department + Session, **so that** only legitimate members gain private access.
- Acceptance criteria: I am the primary approver; Sub Admin/Owner Admin act only as fallback.

### 3.6 Send Personal/Confidential Shares
**As a** CR, **I want to** send a private, targeted share (confidential notes, suggestions, or targeted announcements) to specific members, **so that** I can communicate sensitively without broadcasting to the whole class.
- Acceptance criteria: Only CRs can send these — students, Sub Admins, and the Owner Admin cannot. Visible only to explicitly addressed recipients. Structurally separate from Notices and Discussion, so it never leaks into either.

### 3.7 Use the CR Dashboard
**As a** CR, **I want to** access a dedicated dashboard with resource CRUD tools, a notice composer, a discussion group creator/manager, a pending-verification queue, and a Personal Share composer, **so that** I can manage all my responsibilities from one place.

---

## 4. Sub Admin (One Per College)

### 4.1 Promote/demote CRs
**As a** Sub Admin, **I want to** promote a verified Student to Main CR or Co-CR (or demote a CR back to Student) for any Department + Session within my college, **so that** I can staff classroom leadership as needed.
- Acceptance criteria: Scoped strictly to my own college; capped at two CR seats per classroom unit.

### 4.2 Verify accounts as a fallback
**As a** Sub Admin, **I want to** verify pending Student accounts directly, **so that** verification isn't blocked when no CR is available for that Department + Session.

### 4.3 View my college's structure and statistics
**As a** Sub Admin, **I want to** view structure and statistics scoped to my own college only, **so that** I can monitor and support classroom governance within my remit.

### 4.4 Operate within my authority boundaries
**As a** Sub Admin, **I want to** be prevented from managing other Sub Admins, transferring the Sub Admin role, or directly managing resources/notices/discussion membership, **so that** governance stays cleanly separated by role.
- Acceptance criteria: Only the Owner Admin can reassign a college's Sub Admin. Resource/notice/discussion management remains CR-owned.

### 4.5 Use the Sub Admin Dashboard
**As a** Sub Admin, **I want to** access a dashboard with a structure view of my college, CR promote/demote controls, a fallback verification tool, and college-level statistics, **so that** I can manage my college efficiently.

---

## 5. Owner Admin (Exactly One, Platform-Wide)

### 5.1 Promote/demote Sub Admins
**As the** Owner Admin, **I want to** promote a verified user to Sub Admin for any college, or demote a Sub Admin back to their prior role, **so that** I can staff college-level administration across the platform.

### 5.2 Transfer platform ownership
**As the** Owner Admin, **I want to** transfer ownership to another verified user, **so that** platform leadership can change hands when needed.
- Acceptance criteria: The previous Owner Admin immediately reverts to their prior role; exactly one Owner Admin exists after the transfer.

### 5.3 Act as platform-wide fallback for CR promotion and verification
**As the** Owner Admin, **I want to** directly promote/demote a CR for any Department + Session, and verify any account platform-wide, **so that** governance never gets stuck even if no Sub Admin or CR is available.
- Acceptance criteria: This is a fallback path — normal operations are delegated to the relevant Sub Admin or CR.

### 5.4 View platform-wide structure and statistics
**As the** Owner Admin, **I want to** view structure and statistics across every college, **so that** I can monitor the health and growth of the whole platform.
- Suggested key statistics: total/active users (DAU/WAU/MAU) platform-wide and per college; new registrations and verification funnel (pending vs. verified, average turnaround); number of colleges, Sub Admins, classroom units, and CR coverage (including units with zero or one CR); total resources uploaded and storage volume used; notices published and their reach; discussion groups created, messages sent, most active groups; Personal/Confidential Shares sent (**count only**); role-change audit trail (promotions, demotions, ownership/Sub Admin transfers).

### 5.5 Respect Personal Share privacy, even as the top role
**As the** Owner Admin, **I want to** see only aggregate counts of Personal/Confidential Shares — never their content, **so that** student and CR privacy is preserved regardless of my administrative authority.
- Acceptance criteria: No admin role, including the Owner Admin, can ever access Personal Share content — no exceptions.

### 5.6 Stay out of day-to-day content/communication management
**As the** Owner Admin, **I want to** be structurally prevented from directly managing resources, notices, or discussion group membership, **so that** that responsibility stays fully owned by CRs.

### 5.7 Use the Owner Admin Dashboard
**As the** Owner Admin, **I want to** access a dashboard with a platform-wide structure view across all colleges, Sub Admin promote/demote controls, an ownership-transfer control, a global audit log of role changes, and the platform-wide statistics view, **so that** I have complete oversight of the platform from a single place.

---

## 6. Cross-Role Rules Recap

| Rule | Detail |
|---|---|
| Owner Admin count | Exactly one, platform-wide, at all times |
| Sub Admin count | Exactly one per college (extendable in future, not built now) |
| Ownership transfer | Owner Admin only; exactly one Owner Admin after transfer |
| Sub Admin promote/demote | Owner Admin only — a Sub Admin cannot manage another Sub Admin |
| CR promote/demote | The college's Sub Admin, or the Owner Admin as fallback |
| CR seats per classroom unit | Maximum 2 (1 Main CR + 1 Co-CR), fully equal permissions |
| Classroom unit definition | One Department + one Session |
| Account verification authority | CR (primary); Sub Admin or Owner Admin (fallback) |
| Personal/Confidential Share senders | CR only |
| Discussion groups per course | Maximum 1 course-linked group; unlimited general/topic groups |
| Personal Share content visibility | Sender + recipient(s) only — never Sub Admin or Owner Admin, even in analytics |

---

## 7. Authorization Matrix (Reference)

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