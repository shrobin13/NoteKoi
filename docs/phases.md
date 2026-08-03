# User Flow v6 — Resource Sharing Platform

> **Status:** Canonical specification. Supersedes v5. Five outstanding ambiguities from the v5 review are resolved below; every change is marked `[RESOLVED v6]`. Prior `[RESOLVED v5]` markers are left in place as a change history.

---

## 0. Roles — Complete Reference

This section is the single source of truth for what each role is and can do. Every other section refers back to these definitions rather than restating them.

### 0.1 Role hierarchy

```
Platform Admin
      │
      ▼
Sub Admin  ←── exactly one per college, appointed by Platform Admin
      │
      ▼
CR / Co-CR  ←── one pair per (Department + Session), appointed by Sub Admin
      │
      ├──► Student
      └──► Teacher

Guest — outside the hierarchy, unauthenticated
```

### 0.2 Role definitions

**Guest**

- Unauthenticated visitor.
- Read-only access to `PLATFORM`-visibility resources only. No access to any `COLLEGE`-visibility resource.
- Cannot upload, comment, report, or moderate.

**Student**

- Belongs to exactly one college, one department, one session.
- Uploads always created at `visibility = COLLEGE`, `college_id` = student's own college. Cannot set `PLATFORM` visibility directly.
- May create new versions of resources they originally uploaded.
- May edit permitted metadata (see §3.6) and request deletion (see §3.7) of their own uploads.
- May report any Approved resource they can view.
- Has no moderation authority over anyone else's uploads.

**Teacher**

- Belongs to exactly one college. May be assigned to teach one or more departments within that college. Cross-college teacher accounts are not supported.
- Requires Sub Admin approval before first upload (see §5.8). Cannot upload while in "Pending Verification" state.
- May upload lecture notes and set `visibility = COLLEGE` (default) or `visibility = PLATFORM` directly at upload time.
- May create new versions of resources they originally uploaded.
- May edit permitted metadata and request deletion of their own uploads.
- May report any Approved resource they can view.
- Has no moderation authority over anyone else's uploads.
- **Promotion notification exception:** if a Teacher's resource is promoted to `PLATFORM` via Path B (Sub Admin promotes directly — see §5.4), the Teacher is **not** notified of the promotion, and is not notified if that resource is later re-reviewed and rejected. Path B is a direct administrative action on the resource record, not an uploader-facing workflow event. `[RESOLVED v6 — see §3.8]`

**CR / Co-CR** _(Class Representative / Co-Class Representative)_

- Exactly one pair (CR + optional Co-CR) per (Department + Session), appointed by the Sub Admin from existing verified Student accounts in that batch.
- CR and Co-CR hold **identical permissions**; the distinction between the two titles is organisational only, not a permission difference.
- Elevated permissions activate immediately upon appointment and are revoked immediately upon removal (see §1.4).
- **Moderates only:** Pending Student uploads with `visibility = COLLEGE` that fall within their own assigned Department + Session. CR/Co-CR never moderates Teacher uploads or any `PLATFORM`-visibility resource — those always route to Sub Admin (see §5.2, §5.3).
- May recommend an Approved `COLLEGE` resource for platform-wide promotion. **Cannot promote unilaterally** — the "Recommend for Platform" action is the only promotion-related control ever shown to a CR/Co-CR (see §5.4).
- Is notified when Sub Admin approves or denies their promotion recommendation (see §3.8). `[RESOLVED v6]`
- Verifies student registrations for their own batch.
- Handles deletion requests and reports within their scope; escalates unresolvable cases to Sub Admin.
- Outside their moderation duties, a CR/Co-CR retains ordinary Student permissions (can upload, version, edit, request deletion of their own resources exactly as any Student would).
- **Viewing scope (clarified):** a CR/Co-CR's elevated ("Full") access applies **only** to their own Department + Session. For every other department/session within their **own college**, a CR/Co-CR sees resources exactly as an ordinary Student would — the normal default view, no toggle required. For resources at **other colleges**, a CR/Co-CR uses the same opt-in "Include other colleges" toggle as any Student or Teacher. A CR/Co-CR's moderation authority never extends beyond their own Department + Session, and neither does their "Full" viewing right. `[RESOLVED v6 — see §0.3]`

**Sub Admin**

- Exactly one per college, appointed by Platform Admin.
- Moderates all Pending Teacher uploads and all Pending `PLATFORM`-visibility resources originating from their college.
- Verifies and approves Teacher accounts within their college.
- Appoints and removes CR/Co-CRs within their college.
- Makes the routine approve/deny decision on every CR/Co-CR promotion recommendation from their college. This is Sub Admin's queue item, not a queue item for anyone else in the normal flow. `[RESOLVED v6 — see §5.4a for Platform Admin's exceptional relationship to this control]`
- May revoke `PLATFORM` visibility on any resource that originated from their college, returning it to `visibility = COLLEGE`.
- May directly promote any Approved Teacher-uploaded `COLLEGE` resource to `PLATFORM` without requiring a CR/Co-CR recommendation (Path B — see §5.4).
- Handles escalations and reports within their college.
- Audits CR/Co-CR moderation activity and throughput within their college.
- Has no moderation authority over resources outside their own college.

**Platform Admin**

- Manages the entire platform: colleges, departments, sessions, courses, global configuration.
- Appoints and removes Sub Admins (§1.5). Does **not** appoint or remove CR/Co-CR directly under normal operation — that authority belongs to Sub Admin (§1.4). This is a deliberate separation: role-appointment authority flows one level at a time down the hierarchy so that each layer answers to the layer directly above it. `[RESOLVED v6]`
- Resolves cross-college disputes and exceptional governance cases.
- **Does not participate in routine content moderation or routine promotion decisions.** No Pending/In Review queue is assigned to Platform Admin by default, and Platform Admin does not action CR/Co-CR promotion recommendations as a matter of routine — that is Sub Admin's job.
- **Ultimate authority (ownership clause):** because Platform Admin owns and operates the entire platform, Platform Admin always retains the _capability_ to act on any operation anywhere in the system — including moderation items, promotion recommendations, and (in a genuine emergency, such as a college left with no functioning Sub Admin) appointing an interim Sub Admin or, exceptionally, a CR/Co-CR directly. This capability is never a routine channel; every such use is logged exactly like the CRUD override in §5.9 (actor, target, action, timestamp, required justification note) and is reserved for cases the normal hierarchy cannot resolve on its own. Routine operation always flows through Sub Admin → CR/Co-CR as described elsewhere in this document. `[RESOLVED v6 — replaces the v5 wording that implied the promotion approve/deny control was routinely available to Platform Admin]`
- Uploads submitted by Platform Admin skip the review queue entirely and are created directly in the **Approved** state (see §3.4, §5.1).
- Holds a platform-wide **CRUD override power** on any resource, regardless of owning college or uploader. This is an exceptional-governance tool, not a routine moderation channel — see §5.9 for scope and constraints.
- Audits platform-wide moderation activity and analytics.

---

## 0.3 Access Control Policy (visibility only — not moderation authority)

This table governs **who can view** a resource. It does **not** govern who can moderate, edit, or delete a resource — moderation authority is defined separately in §5.

| User type         | `PLATFORM` resources | Own-college `COLLEGE` resources                                                                                                        | Other-college `COLLEGE` resources       |
| ----------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Guest             | ✅ Read              | ❌ Blocked                                                                                                                             | ❌ Blocked                              |
| Student / Teacher | ✅ Read              | ✅ Default view                                                                                                                        | ✅ Opt-in toggle                        |
| CR / Co-CR        | ✅ Read              | ✅ Full for own Dept+Session; **Default view (identical to Student) for every other Dept+Session in the same college** `[RESOLVED v6]` | ✅ Opt-in toggle (identical to Student) |
| Sub Admin         | ✅ Read              | ✅ Full (own college)                                                                                                                  | ✅ Read-only                            |
| Platform Admin    | ✅ Full              | ✅ Full (view)                                                                                                                         | ✅ Full (view)                          |

**CR/Co-CR viewing scope, spelled out:** a CR/Co-CR has exactly two tiers of access to `COLLEGE` resources, matching their two tiers of authority:

1. **Own Department + Session** — Full access (this is the tier where they also moderate).
2. **Everywhere else** — no elevation at all. Other departments/sessions in their own college behave exactly like ordinary Student default view (no toggle needed, nothing extra to enable). Other colleges behave exactly like ordinary Student opt-in view (toggle required). A CR/Co-CR is never treated as anything other than a regular Student outside their own Department + Session. `[RESOLVED v6]`

Note: Platform Admin's "Full (view)" in this table is a **viewing** right available to every college by default. It is distinct from the CRUD override power described in §0.2 and §5.9, which is an editing/deletion capability with additional constraints.

---

## 1. Onboarding & Identity

### 1.1 Guest discovers the platform

- Browse the homepage; see which colleges and departments exist.
- View all `PLATFORM` resources without logging in.
- Attempting to view a `COLLEGE` resource is blocked with a sign-in prompt, per §0.3.

### 1.2 Student registration

- Sign up by selecting college, department, and session (e.g., 2022–23).
- Enter `reg_no`, validated unique **within the selected college only** — two colleges may reuse the same `reg_no`.
- Account requires email or student-ID verification before activation. No upload allowed pre-verification.

### 1.3 Teacher registration

- Sign up by selecting exactly one college and one or more departments taught within that college.
- Account enters **Pending Verification**. No upload allowed until Sub Admin approves (§5.8).

### 1.4 CR / Co-CR assignment

- Sub Admin appoints one CR and optionally one Co-CR per (Department + Session) from existing verified Student accounts in that batch.
- Elevated permissions activate **immediately** on appointment.
- Sub Admin may revoke CR/Co-CR status at any time. On revocation:
  - The user immediately reverts to standard Student permissions.
  - Any resources sitting **In Review** in that CR/Co-CR's queue return to **Pending** and transfer to the Sub Admin queue.
  - Those transferred items remain with Sub Admin until a replacement CR/Co-CR is appointed for that Department + Session.
  - Upon appointment of the replacement CR/Co-CR, all transferred items **not yet decided** by Sub Admin automatically move into the new CR/Co-CR's queue.
- **Emergency exception:** if a Department + Session has no Sub Admin able to appoint a CR/Co-CR (e.g., the college's Sub Admin seat is itself vacant — see §1.5), Platform Admin may appoint an interim Sub Admin, or in extreme cases a CR/Co-CR directly, under the ownership clause in §0.2. This is logged exactly as a §5.9 override and is never routine. `[RESOLVED v6]`

### 1.5 Sub Admin assignment

- Platform Admin appoints one Sub Admin per college.
- Platform Admin may revoke Sub Admin status at any time. On revocation, all open queue items (Pending Teacher uploads, In Review resources, promotion recommendations awaiting decision) transfer immediately to the incoming Sub Admin upon their appointment.
- While a college has no Sub Admin (between revocation and replacement appointment), those open queue items sit unassigned; Platform Admin may act on them under the exceptional ownership clause (§0.2) rather than leaving them stalled, but this is not required and is not a routine duty.

### 1.6 Login & session management

- Any registered user stays logged in across devices.
- Any user may reset their password via email.

---

## 2. Discovery & Browsing

### 2.1 Hierarchical browse

- Users browse Department → Session → Course.
- Session carries a `department_id` foreign key.
- Session and Course are **platform-level** entities (not per-college) — course listings are identical across every college.
- Students see only departments their college has adopted via `college_department`. Unadopted departments are excluded from default browse/search.

### 2.2 Search

- Search by course name, keyword, or resource type.
- Every result displays a visibility label: "Platform-wide" or "[College name]".

### 2.3 Filtering

- Filter by resource type (class notes, lecture notes, syllabus, video, PYQ, book PDF).
- Filter PYQs by session/year.

---

## 3. Uploading Resources

### 3.1 Student uploads class notes

- Created at `visibility = COLLEGE`, `college_id` = student's college. Student cannot change visibility.
- Duplicate-hash warning shown if the same file already exists **for this course within the student's own college**. A hash match belonging to another college does not trigger a warning — those are separate, independently owned records (see §8, item on cross-college hash matches).

### 3.2 Teacher uploads lecture notes

- Marked with a "Teacher" badge.
- Teacher chooses `visibility = COLLEGE` (default) or `visibility = PLATFORM` at upload time.
- Routes to the **Sub Admin** review queue regardless of visibility chosen. Never routes to CR/Co-CR.

### 3.3 Platform-wide resource upload (syllabus, PYQ, book PDF, video)

- Teacher, Sub Admin, or Platform Admin may upload with `visibility = PLATFORM`, visible to all colleges after approval.
- Student or Teacher may submit a YouTube link as a video resource (no file storage consumed).
- PYQ uploads must include a session/year selection; undated question papers are rejected at submission.

### 3.4 Upload validation and initial state

- Unsupported file types and oversized files are rejected at upload time with a clear error.
- **All uploads except those submitted by Platform Admin** enter **Pending** state immediately after submission and are not visible to any other user until approved.
- **Platform Admin uploads bypass Pending entirely and are created directly in Approved state**, visible immediately. See §5.1 for the corresponding state-machine transition.

### 3.5 Resource versioning

- The original uploader (Student or Teacher) may create a new version of any resource they originally uploaded, regardless of current visibility. Versioning is based on **resource ownership** (the original uploader), not the uploader's current role.
- **When v2 is submitted:**
  - v2 enters **Pending** and routes to the same queue type as the original: CR/Co-CR for Student `COLLEGE` resources; Sub Admin for Teacher uploads and any `PLATFORM`-visibility resource.
  - v1 remains **Approved and live** until v2 is Approved — users are never left without access mid-review.
- **If v2 is Rejected:**
  - v1 remains Approved and live, unchanged.
  - Rejected v2 is visible only to: the uploader, the CR/Co-CR with moderation scope over that resource (or Sub Admin, if the resource type routes there), and Platform Admin. It never appears in Version History for any other user, including other CR/Co-CRs outside that scope.
- **If v2 is Approved:**
  - v1 automatically transitions to **Superseded** and is hidden from the default listing (still visible via Version History to permitted roles — see §6).
  - v2 inherits the current `visibility` of v1. If v1 was `PLATFORM`, v2 is `PLATFORM` on approval — re-promotion is never required.

### 3.6 Metadata editing

- **Lightweight edits** (title, description, tags): apply immediately, no re-moderation triggered.
- **Structural edits** (course or department reassignment):
  - Students may reassign only to courses within their own department. Out-of-department edits are rejected at save time.
  - Teachers may reassign only to courses within departments they are officially assigned to. Out-of-assignment edits are rejected at save time.
  - A valid structural edit transitions the resource **Approved → Pending**, re-entering the moderation queue.
  - **A valid structural edit immediately invalidates any outstanding promotion recommendation on that resource** (see §5.4).

### 3.7 Self-deletion (uploader-initiated)

- **Pending:** uploader may self-cancel before a moderator opens the resource. Cancellation is immediate → **Deleted**. Once a moderator moves the resource to In Review, self-cancel is no longer available.
- **In Review:** uploader may flag the resource for deletion. The resource **stays In Review**; a Deletion Requested flag is attached and visible to the moderator. Display status: **"In Review (Deletion Flagged)."** This is **not** a separate workflow state — the underlying state remains `In Review` with a flag attribute. The moderator resolves the content review and the deletion flag together:
  - Moderator approves deletion → **Deleted**, regardless of content-review outcome.
  - Moderator denies deletion → content review proceeds normally → **Approved** or **Rejected**.
- **Approved:** uploader may request deletion → **Deletion Requested**. Resource remains live until a moderator acts.
  - **This immediately invalidates any outstanding promotion recommendation on that resource** (see §5.4).

### 3.8 Upload status notifications

| Event                                                      | Notified                                                                                                                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resource Approved                                          | Uploader                                                                                                                                                                |
| Resource Rejected                                          | Uploader (with moderator reason)                                                                                                                                        |
| Promotion recommendation Approved (Path A)                 | Uploader + the recommending CR/Co-CR `[RESOLVED v6]`                                                                                                                    |
| Promotion recommendation Denied (Path A)                   | The recommending CR/Co-CR only — resource is unaffected, so the uploader is not notified `[RESOLVED v6]`                                                                |
| Resource promoted directly (Path B)                        | Not sent. Path B is a direct Sub Admin action on a Teacher resource; no promotion notification is triggered for the Teacher uploader `[RESOLVED v6 — see §0.2 Teacher]` |
| Deletion Approved                                          | Uploader                                                                                                                                                                |
| Deletion Denied                                            | Uploader (with moderator reason)                                                                                                                                        |
| Promoted resource later Rejected on re-review — **Path A** | Uploader + the CR/Co-CR who recommended it + the Sub Admin who approved it                                                                                              |
| Promoted resource later Rejected on re-review — **Path B** | The Sub Admin who promoted it only. No CR/Co-CR exists in this chain, and per the Path B rule above, the Teacher uploader is not notified `[RESOLVED v6]`               |

- In-app notifications are required; email is additive.
- My Uploads (§3.9) is the canonical status source and does not depend on notification delivery. A Path B Teacher uploader can always see the current `PLATFORM`/`COLLEGE` visibility of their resource in My Uploads even though no push notification is sent.

### 3.9 My Uploads page

Statuses displayed:

| Status                       | Description                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Pending                      | Submitted, awaiting moderator                                                                                                    |
| In Review                    | Moderator has opened the resource                                                                                                |
| In Review (Deletion Flagged) | Display-only label for `In Review` with an attached deletion flag — not a distinct workflow state                                |
| Approved                     | Live and visible                                                                                                                 |
| Rejected                     | Not approved; reason shown inline                                                                                                |
| Deletion Requested           | Deletion pending moderator decision                                                                                              |
| Deletion Denied              | Request denied; reason and decision date shown — this is a durable record on an Approved resource, not a separate workflow state |
| Deleted                      | Removed                                                                                                                          |
| Superseded                   | Replaced by a newer, approved version                                                                                            |

- Uploader may cancel a Pending resource or flag an In Review resource for deletion directly from this page.
- For Path B resources, the visibility badge (`COLLEGE` / `PLATFORM`) on this page is the source of truth for a Teacher whose resource was promoted or later reverted, since no notification is sent for that specific event.

---

## 4. Consuming Resources

### 4.1 Viewing & downloading

- Any user may view or download an Approved resource they have access to, per §0.3.
- Each resource displays uploader name, role (Student / Teacher), upload date, and version number.

### 4.2 Platform-wide access

- All users, including guests, view `PLATFORM` resources identically. All colleges see identical syllabus/PYQ/shared content.

### 4.3 College-scoped access (default filter, not a hard restriction)

- Logged-in users see their own college's `COLLEGE` resources by default.
- An "Include other colleges" toggle enables opt-in viewing of other colleges' scoped resources, per §0.3. This is a UI filter only — no additional permission is required beyond authentication.

---

## 5. Moderation

### 5.1 Resource state machine

**States:** `Pending` · `In Review` · `Approved` · `Rejected` · `Superseded` · `Deletion Requested` · `Deleted`

`In Review (Deletion Flagged)` is **not** a state — it is a display label for `In Review` plus a flag attribute. `Deletion Denied` is **not** a state — it is a logged outcome recorded against an `Approved` resource, displayed in My Uploads.

**All valid transitions:**

| From               | Event                                                       | To                                                  | Actor                  |
| ------------------ | ----------------------------------------------------------- | --------------------------------------------------- | ---------------------- |
| —                  | Upload (any role except Platform Admin)                     | Pending                                             | Uploader               |
| —                  | Platform Admin upload                                       | Approved                                            | Platform Admin         |
| Pending            | Self-cancel (before In Review)                              | Deleted                                             | Uploader               |
| Pending            | Moderator opens resource                                    | In Review                                           | CR/Co-CR or Sub Admin  |
| In Review          | Approve                                                     | Approved                                            | Moderator              |
| In Review          | Reject                                                      | Rejected                                            | Moderator              |
| In Review          | Uploader raises deletion flag → moderator approves deletion | Deleted                                             | Moderator              |
| In Review          | Uploader raises deletion flag → moderator denies deletion   | Continues → Approved or Rejected                    | Moderator              |
| Approved           | Authenticated user submits report                           | In Review (resource hidden)                         | Any authenticated user |
| Approved           | Uploader saves structural metadata edit                     | Pending                                             | Uploader               |
| Approved           | Uploader requests deletion                                  | Deletion Requested                                  | Uploader               |
| Approved           | New version (v2) is Approved by moderator                   | Superseded                                          | System (automatic)     |
| Rejected           | Uploader re-submits                                         | Pending                                             | Uploader               |
| Deletion Requested | Moderator approves deletion                                 | Deleted                                             | Sub Admin / CR/Co-CR   |
| Deletion Requested | Moderator denies deletion                                   | Approved (Denial logged in My Uploads)              | Sub Admin / CR/Co-CR   |
| Deletion Requested | Authenticated user submits report                           | In Review (deletion flag retained, resource hidden) | Any authenticated user |

When a report is filed against a `Deletion Requested` resource, the resource enters `In Review` carrying the deletion flag forward — the moderator resolves the content review and the still-pending deletion request together, using the same combined-resolution logic as the ordinary In Review deletion-flag case above.

Note: this table governs the **resource content** state machine. Promotion (`visibility` change) is a separate, parallel workflow described in §5.4 and does not add new resource states — see the promotion-recommendation-invalidation rule below for how the two interact.

**Diagram:**

```
  Platform Admin upload ──────────────────────────────► Approved (immediate)

  Upload (all other roles) / Re-submit / Structural Edit
                │
                ▼
        ┌───────────────┐
        │    Pending    │──── self-cancel ────────────────────► Deleted
        └───────┬───────┘
                │ moderator opens
                ▼
        ┌───────────────┐ ◄── deletion flag (from uploader)
        │   In Review   │
        └───┬───────┬───┘
      Approve│       │Reject
             │       │
        ┌────┘       └────┐
        ▼                 ▼
  ┌──────────┐      ┌──────────┐
  │ Approved │      │ Rejected │──► re-submit ──► Pending
  └──┬─┬──┬──┘      └──────────┘
     │ │  │
     │ │  └─── report ──────────────────────────► In Review (hidden)
     │ │
     │ └─── structural edit ───────────────────► Pending
     │       (invalidates any promotion recommendation)
     │
     └─── deletion request
                │
                ▼
      Deletion Requested
      (invalidates any promotion recommendation)
                │
       ┌────────┴─────────┐
     Deny          Approve         Report
       │              │              │
       ▼              ▼              ▼
    Approved       Deleted     In Review
 (Denied logged                (deletion flag
  in My Uploads)                 retained)

  Approved ──[v2 Approved]──► Superseded
```

### 5.2 CR / Co-CR moderation queue (Student uploads only)

- Queue contains: all Pending Student uploads from the CR/Co-CR's assigned Department + Session, and any Rejected-v2/re-submitted items from that scope.
- CR/Co-CR opens a resource (→ In Review), then Approves or Rejects with a written reason.
- CR/Co-CR handles deletion requests for resources within their scope.
- CR/Co-CR may mark any Approved `COLLEGE` resource as "Recommended for Platform," initiating Sub Admin review (§5.4). CR/Co-CR cannot promote unilaterally.
- CR/Co-CR escalates unresolvable items to Sub Admin.

### 5.3 Sub Admin moderation queue (Teacher uploads + PLATFORM resources + escalations + promotions)

Queue contains:

- All Pending Teacher uploads from the Sub Admin's college.
- All Pending resources with `visibility = PLATFORM`, regardless of uploader role.
- Promotion recommendations submitted by CR/Co-CR (§5.4).
- Reports and deletion requests escalated from CR/Co-CR, or filed directly against Teacher/PLATFORM resources.
- Teacher account verification requests (§5.8).

- Sub Admin may take any moderation action on any resource within their college.
- Sub Admin audits CR/Co-CR moderation decisions within their college.

### 5.4 Promotion workflow

Promotion updates `visibility` from `COLLEGE` to `PLATFORM` on the **existing** resource record. No new record is created; `college_id` is unchanged.

**Path A — Student-originated resource (CR/Co-CR recommendation required):**

```
Approved resource (visibility = COLLEGE, Student-uploaded)
          │
          │ CR/Co-CR selects "Recommend for Platform"
          ▼
  Promotion recommendation created
  (resource state remains Approved and live at COLLEGE level)
          │
          │ Sub Admin reviews recommendation
          ▼
       ┌──┴───┐
    Approve  Deny
       │       │
       ▼       ▼
  visibility  visibility
  = PLATFORM  stays COLLEGE
       │       │
       ▼       ▼
  Notifications per §3.8:
  Approve → Uploader + recommending CR/Co-CR
  Deny    → recommending CR/Co-CR only
```

**Path B — Teacher-originated resource (Sub Admin may promote directly, no recommendation required):**

```
Approved resource (visibility = COLLEGE, Teacher-uploaded)
          │
          │ Sub Admin selects "Promote to Platform" directly
          ▼
  visibility = PLATFORM
          │
          ▼
  No notification sent (§3.8, §0.2 Teacher) — visibility
  change is reflected in My Uploads (§3.9) only
```

Rationale: Teacher uploads never sit in a CR/Co-CR queue (§3.2), so a CR recommendation step was never reachable for them. Sub Admin, who already owns all Teacher-upload moderation, may promote directly. Because there is no recommendation step to confirm, Path B is treated as a routine visibility adjustment rather than an uploader-facing milestone, so it does not push a notification (§3.8). `[RESOLVED v6]`

**Promotion recommendation invalidation rule (applies to Path A only):**
Any transition that moves the underlying resource **out of Approved** — a report, a structural edit, or a deletion request — **immediately invalidates** any outstanding promotion recommendation on that resource. If the resource later returns to Approved (e.g., after a report is resolved with no changes, or a structural edit is re-approved), the CR/Co-CR must submit a **new** "Recommend for Platform" action — recommendations do not automatically resume.

- Sub Admin may revoke `PLATFORM` visibility at any time, returning the resource to `visibility = COLLEGE` (applies to resources promoted via either path).
- Platform Admin does not participate in **routine** promotion decisions (Path A or Path B) — see §5.4a for Platform Admin's exceptional relationship to promotion.

### 5.4a Platform Admin and promotion decisions (exceptional only) `[RESOLVED v6 — new section]`

This section resolves the apparent conflict between "the promotion approve/deny control belongs to Sub Admin" and "Platform Admin owns the whole platform."

- **Routine path:** Sub Admin owns every promotion decision for their college — both approving/denying Path A recommendations and executing Path B direct promotions. This is Sub Admin's queue, and it is where 100% of day-to-day promotion activity happens.
- **Platform Admin's standing capability:** because Platform Admin owns the platform, Platform Admin always retains the technical and administrative capability to act on a Path A recommendation or execute a Path B promotion directly, in exactly the same way the §5.9 CRUD override lets Platform Admin act on any resource record. This is **not** a second routine queue — Platform Admin has no standing promotion queue, mirroring §0.2's "no Pending/In Review queue is assigned to Platform Admin by default."
- **When it's used:** only for exceptional governance — e.g., a Sub Admin seat is vacant and a promotion is time-sensitive, a cross-college dispute over a recommendation needs resolving (§7.1), or a promotion decision needs correcting after a compromised account or an error a Sub Admin cannot unilaterally fix.
- **Logging:** every such use is logged exactly like a §5.9 override — actor, resource, action, timestamp, and a required justification note — and is visible in Platform Admin analytics (§7.5).
- **Net effect:** there is no contradiction — Sub Admin routinely decides; Platform Admin can decide only exceptionally, with the same audit trail as any other override, never as a parallel routine channel.

### 5.5 Reporting

- Any authenticated user may report an Approved (or Deletion Requested — see §5.1) resource as incorrect, spam, or plagiarised.
- The report immediately hides the resource from public listing and moves it to In Review.
- **Report routing:**
  - `COLLEGE` Student resources → CR/Co-CR queue.
  - Teacher uploads and `PLATFORM` resources → Sub Admin queue.
- If a promoted resource is re-reviewed and Rejected, all parties in the promotion chain are notified per §3.8 (Path A vs Path B notification rules differ — see §3.8).

### 5.6 Moderation acts on records, not files

- All moderation actions (approve, reject, delete) apply to the resource **record** only.
- Multiple records may reference the same `content_hash` (same physical file in object storage). Actions on one record never affect any other record.
- Moderator UI must never suggest that removing a record removes the underlying file.

### 5.7 Deletion request handling

Routing mirrors moderation queue routing:

- Student `COLLEGE` uploads → CR/Co-CR queue.
- Teacher uploads and `PLATFORM` resources → Sub Admin queue.

Moderator approves or denies with an optional written reason, surfaced in My Uploads (§3.9) and via notification (§3.8).

### 5.8 Teacher verification

- Sub Admin approves new Teacher account requests before upload is allowed.
- Teacher accounts remain in **Pending Verification** until Sub Admin approves — no uploads permitted in this state.

### 5.9 Platform Admin CRUD override _(exceptional governance only)_

- Platform Admin retains a platform-wide CRUD override capability on **any** resource record, regardless of owning college, uploader, or current workflow state.
- This power exists for **exceptional governance and dispute resolution** (per §7.1) — for example, removing content under legal obligation, resolving a cross-college dispute the normal hierarchy cannot settle, or correcting damage from a compromised account.
- It is **not** a routine moderation channel and does not replace the CR/Co-CR → Sub Admin queue system. Platform Admin has no standing moderation queue (§0.2).
- The same exceptional-use model governs Platform Admin's relationship to promotion decisions (§5.4a) and, in emergencies, role appointment (§1.4, §1.5, §0.2) — all three are instances of the same "ultimate ownership, exceptional use, always logged" principle. `[RESOLVED v6]`
- Every use of this override is **logged for audit** (actor, resource, action, timestamp, and a required justification note), visible in Platform Admin analytics (§7.5).
- Use of this override bypasses the standard state-machine queue but must still leave the resource in a valid state from §5.1 (e.g., Approved, Rejected, Deleted) — it does not create new states.

---

## 6. Version History Access

| Role                                                                         | Access                                                                                                               |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Guest                                                                        | No access                                                                                                            |
| Authenticated user (not the uploader, no moderation scope over the resource) | Approved versions only                                                                                               |
| Original uploader                                                            | Full history, all versions, including Rejected                                                                       |
| CR / Co-CR                                                                   | Full history, including Rejected versions, but **only** for resources within their own assigned Department + Session |
| Sub Admin                                                                    | Full history, including Rejected versions, but **only** for resources within their own college                       |
| Platform Admin                                                               | Full history across the entire platform, including all Rejected versions                                             |

- Superseded versions are hidden from the default resource view but visible in Version History to any role listed above with sufficient scope.
- **Rejected versions are visible only to:** the original uploader, the specific CR/Co-CR (or Sub Admin) whose scope covers that resource, and Platform Admin. A CR/Co-CR outside the relevant Department + Session, or a Sub Admin outside the relevant college, has no access to a Rejected version — they are treated the same as any other non-uploader authenticated user for that resource (consistent with the CR/Co-CR viewing-scope rule in §0.3: outside their own Department + Session, a CR/Co-CR is just a Student).

---

## 7. Platform Administration

### 7.1 Platform Admin responsibilities

- Add, edit, and deactivate colleges.
- Create platform-level departments and courses.
- Open and close sessions per department.
- Appoint and remove Sub Admins.
- Resolve cross-college disputes and exceptional moderation cases (via §5.9 override, exceptional promotion decisions via §5.4a, and exceptional role appointment via §1.4/§1.5, when required).
- Audit platform-wide moderation activity and analytics.

### 7.2 Sub Admin responsibilities

- Appoint and remove CR/Co-CRs for their college.
- Verify Teacher accounts.
- Moderate Teacher uploads and `PLATFORM`-visibility resources.
- Review and decide on CR/Co-CR promotion recommendations (Path A); may also promote Teacher resources directly (Path B).
- Handle escalations and reports within the college.
- Revoke `PLATFORM` visibility when necessary.
- Audit CR/Co-CR moderation throughput and decisions.

### 7.3 CR / Co-CR responsibilities

- Moderate Student uploads within their assigned Department + Session.
- Verify student registrations for their batch.
- Recommend resources for `PLATFORM` promotion (Path A only — cannot promote unilaterally).
- Handle deletion requests within their scope.
- Escalate unresolvable cases to Sub Admin.

### 7.4 Session & course management

- Platform Admin opens a new session for a specific department (different departments may run different academic calendars).
- Platform Admin adds or renames courses per department.
- **Course mutability rule:** editing a course updates its name and description only. All existing resource records continue referencing the same `course_id` and are unaffected by a rename. A structural curriculum change that requires a genuinely different course entity creates a **new** course; the existing course is never overwritten or deleted, preserving historical resource integrity.

### 7.5 Analytics

- Any admin (Sub Admin or Platform Admin) can see courses with the fewest approved resources, to identify content gaps.
- Any admin can see `content_hash` deduplication savings, to report storage efficiency.
- Platform Admin sees promotion counts per college, to identify high-quality contributing colleges.
- Sub Admin sees CR/Co-CR moderation throughput for their own college, to identify overloaded or inactive moderators.
- Platform Admin sees a log of all §5.9 CRUD override actions platform-wide, including actor, resource, action, and justification note, and this same log includes any exceptional §5.4a promotion actions and any exceptional §1.4/§1.5 role appointments Platform Admin performs. `[RESOLVED v6]`

---

## 8. Edge Cases (Reference)

- **Cross-department upload blocked:** Students cannot upload to, or reassign to, a course outside their own department. Teachers cannot reassign resources to departments outside their official assignment. Both are rejected at save time using the same validation logic.
- **Irrelevant departments hidden:** Students see only departments their college has adopted via `college_department`.
- **PLATFORM resource correction:** editing or removing a `PLATFORM` resource is a single action that propagates to all colleges immediately — there is only one record.
- **Cross-college content-hash match:** an identical file uploaded at College B creates a new, independently-owned resource record with College B's `college_id`. Storage is deduplicated at the physical-file level; moderation, ownership, and discoverability of the two records are fully independent.
- **Version inheritance on promoted resources:** if v1 is `PLATFORM` and the original uploader submits v2, v2 inherits `visibility = PLATFORM` and routes to the Sub Admin queue (not CR/Co-CR) even if the original uploader is a Student — because `PLATFORM`-visibility resources are always Sub Admin-moderated regardless of uploader role. On approval, v1 becomes Superseded; re-promotion is not required.
- **Rejected v2, v1 stays live:** if v2 is Rejected, v1 remains Approved and live, unchanged. Rejected v2 visibility follows the §6 rule (uploader, scoped CR/Co-CR or Sub Admin, Platform Admin only).
- **In Review + deletion flag race condition:** if a moderator has already opened a resource (In Review) when the uploader flags it for deletion, the resource stays In Review carrying the flag; the moderator resolves both together. The same combined-resolution pattern applies if a report is filed against a Deletion Requested resource (§5.1).
- **CR/Co-CR role revoked mid-review:** In Review items return to Pending and transfer to Sub Admin until a replacement CR/Co-CR is appointed, at which point undecided items automatically move to the new CR/Co-CR's queue.
- **Sub Admin replaced:** all open queue items (Pending Teacher uploads, In Review resources, promotion recommendations) transfer immediately to the incoming Sub Admin upon appointment.
- **Promotion recommendation invalidated:** any structural edit or deletion request against a resource with an outstanding promotion recommendation immediately invalidates that recommendation; a fresh recommendation is required after the resource returns to Approved.
- **Student's resource promoted via Path A, then versioned:** if a Student's resource was promoted to `PLATFORM` (necessarily via Path A — Student-originated resources have no Path B) and that Student submits v2, v2 inherits `visibility = PLATFORM` and routes to the Sub Admin queue (not CR/Co-CR). `[RESOLVED v6 — reworded from v5 to avoid implying a "Sub Admin direct-promotes a Student resource" path, which does not exist; only Path A applies to Student-originated resources]`
- **Platform Admin exceptional-use pattern:** the CRUD override (§5.9), exceptional promotion action (§5.4a), and emergency role appointment (§1.4, §1.5) all follow one consistent rule: Platform Admin's authority is real and unlimited in scope, but its _use_ is reserved for cases the normal hierarchy cannot handle, and every use is logged with actor, target, action, and justification. `[RESOLVED v6]`
- **Path B promotion generates no uploader notification:** confirmed and intentional — see §3.8 and §0.2 (Teacher). The Teacher can always confirm current visibility via My Uploads (§3.9).

---

## Appendix: Terms used consistently throughout this document

- **Uploader** — the user account that originally created a resource record (the "owner" for versioning purposes). Ownership does not change even if the uploader's role changes later.
- **Moderator** — whichever role has queue authority over a given resource: CR/Co-CR for Student `COLLEGE` uploads, Sub Admin for everything else (Teacher uploads, all `PLATFORM`-visibility resources).
- **Scope** — the boundary within which a role's authority applies: Department + Session for CR/Co-CR; college for Sub Admin; platform-wide for Platform Admin.
- **Routine vs. exceptional authority** — a role's routine authority is what it exercises day-to-day within its own scope (e.g., Sub Admin approving promotions). Platform Admin's platform-wide ownership authority is real but exceptional-only: available in every scope, but reserved for cases the routine hierarchy cannot resolve, and always logged. `[RESOLVED v6]`
- **State** vs. **display label** — only the seven states listed in §5.1 are actual workflow states. "In Review (Deletion Flagged)" and "Deletion Denied" are display labels/logged outcomes attached to an underlying state, never states in their own right.
