# FRONTEND COMPLETION & IMPLEMENTATION MASTER PROMPT

## Resource Sharing Platform — Audit, Complete, Integrate, Test

You are GitHub Copilot working inside an existing Next.js frontend repository.

Your task is **NOT to redesign the application from scratch**.

Your task is to:

1. Audit the existing frontend against **all authoritative Markdown specifications**.
2. Identify exactly what is already implemented, partially implemented, missing, incorrectly implemented, or blocked.
3. Complete every frontend requirement that is supported by the specifications and available backend APIs.
4. Correct existing implementations that contradict the specifications.
5. Integrate the frontend with the real backend.
6. Never invent backend APIs, database behavior, roles, states, permissions, or workflows.
7. Continue working until every implementable requirement is complete.
8. Produce a final implementation audit proving what was completed and what remains blocked.

---

# 1. AUTHORITATIVE DOCUMENTS

The repository contains the following specification files:

```text
user-story.md
wireframe.md
wirefram-resolution.md
frontend-work-process.md
api_doc.md
```

Use them as follows.

### Priority 1 — Product behavior

```text
user-story.md
```

This is the source of truth for:

* roles
* permissions
* visibility
* onboarding
* authentication behavior
* resource lifecycle
* resource states
* upload rules
* moderation
* deletion
* versioning
* reporting
* promotion
* administration
* analytics
* edge cases

Cite requirements using:

```text
user-story.md §x.x
```

---

### Priority 2 — UI/UX

```text
wireframe.md
```

This is the source of truth for:

* required screens
* navigation
* page structure
* responsive behavior
* component behavior
* interaction patterns
* design system
* accessibility
* user journeys

Cite requirements using:

```text
wireframe.md §x.x
```

---

### Priority 3 — Resolved ambiguities and explicit exclusions

```text
wirefram-resolution.md
```

This document resolves ambiguities and explicitly identifies features that must NOT be fabricated.

It is authoritative for:

* resolved open questions
* API dependencies
* unavailable endpoints
* intentionally excluded features
* Upcoming Feature behavior
* backend gaps already identified

Cite requirements using:

```text
wirefram-resolution.md §x.x
```

---

### Priority 4 — Frontend implementation process

```text
frontend-work-process.md
```

This is the source of truth for:

* frontend architecture
* technical implementation
* milestones
* API integration
* validation
* state management
* error handling
* completion criteria

Cite requirements using:

```text
frontend-work-process.md §x.x
frontend-work-process.md Milestone X
```

---

### Priority 5 — Backend API contract

```text
api_doc.md
```

This is the source of truth for the documented backend endpoints and their request/response contracts.

Use it to determine:

* endpoint names
* HTTP methods
* request payloads
* query parameters
* response structures
* supported operations

Cite APIs using:

```text
api_doc.md §X
```

---

# 2. CRITICAL RULE — AUDIT BEFORE IMPLEMENTATION

Do NOT immediately start writing code.

First inspect the entire repository.

Inspect:

```text
package.json
src/**
user-story.md
wireframe.md
wirefram-resolution.md
frontend-work-process.md
api_doc.md
```

If backend source code is available in the repository/workspace, inspect that too.

Determine:

* current routes
* current components
* current hooks
* current API clients
* current state management
* current types
* current authentication implementation
* current route guards
* current placeholders
* current mock/static data
* current incomplete workflows
* current API integrations
* current dependencies
* current TypeScript/ESLint/build status

Do NOT assume the repository is in the same state described by an older prompt.

The actual source code is the current implementation.

---

# 3. CREATE AN IMPLEMENTATION GAP MATRIX

Before making substantial changes, create:

```text
docs/frontend-implementation-audit.md
```

The audit must contain:

| Requirement             | Specification      | Existing Route | Existing Component | API | Status                           | Required Action |
| ----------------------- | ------------------ | -------------- | ------------------ | --- | -------------------------------- | --------------- |
| Student registration    | user-story.md §1.2 | ...            | ...                | ... | COMPLETE/PARTIAL/MISSING/BLOCKED | ...             |
| Teacher registration    | user-story.md §1.3 | ...            | ...                | ... | ...                              | ...             |
| Login                   | user-story.md §1.6 | ...            | ...                | ... | ...                              | ...             |
| Discovery               | user-story.md §2   | ...            | ...                | ... | ...                              | ...             |
| Search                  | user-story.md §2.2 | ...            | ...                | ... | ...                              | ...             |
| Upload                  | user-story.md §3   | ...            | ...                | ... | ...                              | ...             |
| My Uploads              | user-story.md §3.9 | ...            | ...                | ... | ...                              | ...             |
| Resource Detail         | user-story.md §4   | ...            | ...                | ... | ...                              | ...             |
| Moderation              | user-story.md §5   | ...            | ...                | ... | ...                              | ...             |
| Version History         | user-story.md §6   | ...            | ...                | ... | ...                              | ...             |
| Platform Administration | user-story.md §7   | ...            | ...                | ... | ...                              | ...             |

Expand this matrix to cover **every relevant requirement in all five Markdown documents**.

Use these statuses exactly:

```text
COMPLETE
PARTIAL
MISSING
INCORRECT
BLOCKED — BACKEND API MISSING
BLOCKED — SPECIFICATION CONFLICT
OUT OF SCOPE
```

Do not mark something COMPLETE merely because a route exists.

A feature is COMPLETE only if its actual workflow works.

---

# 4. CURRENT REPOSITORY MUST BE TREATED AS PARTIAL

The current repository already contains some implementation.

Known existing areas include:

```text
src/app/
src/components/
src/hooks/
src/lib/api/
src/lib/types.ts
src/store/
src/providers/
```

Existing API modules include:

```text
src/lib/api/client.ts
src/lib/api/notifications.ts
src/lib/api/resources.ts
src/lib/api/users.ts
```

Existing hooks include resource, notification, upload, profile and user-related queries/mutations.

Therefore:

## DO NOT

* delete the existing architecture unnecessarily
* rebuild working components from scratch
* duplicate API clients
* create duplicate state-management systems
* create duplicate components
* replace working code merely for stylistic reasons

## DO

* inspect existing implementation
* reuse working code
* extend existing components
* correct incomplete code
* add missing modules
* preserve compatible behavior

---

# 5. KNOWN PARTIAL AREAS TO VERIFY

The following are known areas that require an audit.

Do not blindly assume they are completely missing; verify each one.

### Authentication

Inspect:

```text
/login
/register/student
/register/teacher
/forgot-password
/reset-password
/verification-pending
```

Verify real API integration against:

```text
api_doc.md §2
```

---

### Profile

Inspect:

```text
/profile
/profile/edit
```

Verify:

```text
GET /users/me
```

and the documented update behavior.

Do not use hard-coded role state as the source of truth.

The authenticated user must come from the backend.

---

### Discovery

Inspect:

```text
/
```

Verify:

* hierarchy
* colleges
* departments
* sessions
* courses
* resources
* visibility
* scope
* search
* filters

Reference:

```text
user-story.md §2
wireframe.md §4
```

---

### Search

Inspect:

```text
/search
```

Verify:

* URL query state
* debounce
* resource type
* session
* visibility scope
* include-other-colleges behavior
* loading
* empty state
* errors
* pagination/infinite loading

Do not use an endpoint that is not documented or confirmed by the backend.

---

### Upload

Inspect:

```text
/upload
```

The current implementation must be compared against:

```text
user-story.md §§3.1–3.9
frontend-work-process.md Milestone 4
wireframe.md upload specifications
```

Remove placeholders where the feature is actually required.

Implement the complete upload workflow.

---

### My Uploads

Inspect:

```text
/my-uploads
```

Verify the complete resource lifecycle.

---

### Resource Detail

Inspect:

```text
/resources/[id]
```

Verify:

* metadata
* visibility
* state
* uploader
* course
* department
* session
* file/video access
* version
* permitted actions
* reporting
* deletion
* versioning
* promotion

Reference:

```text
user-story.md §§4–6
```

---

### Notifications

Inspect:

```text
/notifications
```

The existing implementation already has a notifications API/query layer.

Complete the workflow using:

```text
GET /notifications
PATCH /notifications/:id/read
```

Do NOT implement WebSocket/SSE.

Reference:

```text
wirefram-resolution.md §1.8
api_doc.md §12
```

Polling is acceptable where specified.

---

# 6. API IMPLEMENTATION REQUIREMENT

The current API layer is incomplete.

Create API modules as required by the actual documented backend contract.

Expected organization:

```text
src/lib/api/
├── client.ts
├── auth.ts
├── users.ts
├── colleges.ts
├── departments.ts
├── sessions.ts
├── courses.ts
├── resources.ts
├── moderation.ts
├── reports.ts
├── promotions.ts
├── notifications.ts
├── analytics.ts
└── admin.ts
```

Do not create a module if it has no corresponding backend requirement.

Do not invent endpoint names.

Use `api_doc.md` as the first API reference.

If backend source code is available, verify the documented API against the actual implementation.

---

# 7. CENTRALIZED API CLIENT

The existing:

```text
src/lib/api/client.ts
```

must remain the central request mechanism.

It must correctly support:

* cookies/credentials
* JSON
* multipart/form-data
* API envelopes
* API errors
* 401
* 403
* 404
* 409
* 422
* 429
* 500
* network failures

For multipart requests:

DO NOT manually set:

```text
Content-Type: multipart/form-data
```

The browser must generate the boundary.

Never expose:

* passwords
* access tokens
* refresh tokens
* secrets

Never put HTTP-only authentication tokens into localStorage.

---

# 8. TANSTACK QUERY

All server state must use TanStack Query.

Use:

```text
useQuery
useInfiniteQuery
useMutation
```

Create hooks such as:

```text
useCurrentUserQuery
useCollegesQuery
useDepartmentsQuery
useSessionsQuery
useCoursesQuery
useResourcesQuery
useResourceQuery
useMyUploadsQuery
useNotificationsQuery
useModerationQueueQuery
useTeacherVerificationsQuery
useStudentVerificationsQuery
useAnalyticsQuery
```

Use mutation hooks for state-changing operations.

Do not store server data in Zustand.

Zustand should only hold client-side state.

---

# 9. AUTHENTICATED USER STATE

The current frontend must NOT rely on:

```text
role: "STUDENT"
```

as a hard-coded default.

Authentication state must be derived from:

```text
GET /users/me
```

The application must correctly support:

```text
GUEST
STUDENT
TEACHER
CR
CO_CR
SUB_ADMIN
PLATFORM_ADMIN
```

Reference:

```text
user-story.md §0
```

CR/Co-CR are elevated authorities associated with the user's account and must not be treated as unrelated independent login accounts.

---

# 10. ROUTE GUARDS

Implement route-level protection.

Hiding a button is NOT sufficient.

Examples:

### Guest

Allowed:

* homepage
* platform resources
* login
* registration
* password recovery

Blocked:

* college resources
* authenticated actions

---

### Unverified Student

Allowed:

* discovery
* search
* permitted resource viewing

Blocked:

* upload
* unauthorized actions

---

### Unverified Teacher

Allowed:

* discovery
* permitted resource viewing

Blocked:

* upload
* teacher moderation/admin functionality

---

### CR/Co-CR

Moderation access must be restricted to:

```text
own Department + Session
```

Reference:

```text
user-story.md §§0.2–0.3
user-story.md §5.2
```

---

### Sub Admin

Access restricted to their own college except where the specification explicitly provides read-only cross-college access.

Reference:

```text
user-story.md §§0.2–0.3
user-story.md §5.3
```

---

### Platform Admin

Platform-wide administrative access.

However, routine moderation/promotion behavior must remain distinct from exceptional override capability.

Reference:

```text
user-story.md §0.2
user-story.md §5.9
```

---

# 11. STUDENT REGISTRATION

Implement:

```text
/register/student
```

Fields:

* college
* department
* session
* registration number
* email
* password

Registration number uniqueness is:

```text
within selected college
```

not globally.

Reference:

```text
user-story.md §1.2
```

Use backend validation as authoritative.

---

# 12. TEACHER REGISTRATION

Implement:

```text
/register/teacher
```

Fields:

* college
* one or more departments
* email
* password

Teacher accounts enter:

```text
Pending Verification
```

They cannot upload before approval.

Reference:

```text
user-story.md §1.3
```

---

# 13. DISCOVERY AND BROWSING

Implement the complete hierarchy:

```text
College
↓
Department
↓
Session
↓
Course
↓
Resource
```

The wireframe specifies the browse structure.

Reference:

```text
user-story.md §2.1
wireframe.md §4.1
```

Required route where supported:

```text
/departments/[deptId]/sessions/[sessionId]/courses/[courseId]
```

Preserve query/filter state during navigation.

---

# 14. VISIBILITY RULES

Implement the exact visibility matrix from:

```text
user-story.md §0.3
```

Do not confuse:

```text
visibility
```

with:

```text
moderation authority
```

The "Include other colleges" control is a search/viewing scope control.

It does NOT grant additional permissions.

CR/Co-CR access must follow the two-tier rule:

### Tier 1

Own:

```text
Department + Session
```

Full elevated access.

### Tier 2

Other departments/sessions in own college:

Normal Student-level viewing.

### Tier 3

Other colleges:

Student-style opt-in viewing.

Reference:

```text
user-story.md §0.3
```

---

# 15. RESOURCE STATE MACHINE

Implement exactly the documented states:

```text
PENDING
IN_REVIEW
APPROVED
REJECTED
SUPERSEDED
DELETION_REQUESTED
DELETED
```

Do not create frontend-only fake backend states.

A visual condition can be represented with labels/badges without inventing a new state.

Reference:

```text
user-story.md §5.1
```

Every resource state must have correct available actions.

---

# 16. UPLOAD WORKFLOW

Complete:

```text
/upload
```

using the specification.

The workflow should cover:

1. resource type
2. file or YouTube source
3. classification
4. metadata
5. visibility
6. review
7. submission

Supported types:

```text
CLASS_NOTES
LECTURE_NOTES
SYLLABUS
VIDEO
PYQ
BOOK_PDF
```

Reference:

```text
user-story.md §§3.1–3.4
frontend-work-process.md Milestone 4
```

---

# 17. UPLOAD VALIDATION

Implement client-side validation for:

* required fields
* file type
* file size
* resource type compatibility
* PYQ session requirements
* URL format where applicable

Use:

```text
React Hook Form
+
Zod
```

Backend authorization and validation remain authoritative.

---

# 18. DUPLICATE HASH

If the backend returns a duplicate/content-hash warning:

* display the warning clearly
* preserve the user's context
* do not invent rejection behavior
* follow the backend response

Reference:

```text
frontend-work-process.md Milestone 4
```

---

# 19. MY UPLOADS

Complete:

```text
/my-uploads
```

Display resources according to state:

```text
PENDING
IN_REVIEW
APPROVED
REJECTED
SUPERSEDED
DELETION_REQUESTED
DELETED
```

Actions must be state-dependent.

Reference:

```text
user-story.md §3.9
```

---

# 20. RESOURCE METADATA EDITING

Implement documented operations:

```text
PATCH /resources/:id/metadata
PATCH /resources/:id/reassign
```

Structural reassignment must follow the backend/user-story rules.

If reassignment causes the resource to return to:

```text
PENDING
```

the UI must clearly explain this.

Reference:

```text
user-story.md §3.6
```

---

# 21. RESOURCE VERSIONING

Implement:

```text
/resources/[id]/versions
```

and:

```text
GET /resources/:id/versions
POST /resources/:id/versions
```

where documented.

Version ownership follows the original uploader rules.

Reference:

```text
user-story.md §§3.5, 6
```

---

# 22. RESOURCE DELETION

Implement only documented deletion flows.

Potential operations include:

```text
self-cancel
flag deletion
request deletion
deletion decision
```

Use the exact endpoints from:

```text
api_doc.md §11
```

Do not create fake states.

---

# 23. REPORTING

Implement the reporting workflow.

Endpoint:

```text
POST /resources/:id/report
```

Use the reasons specified by the user story.

Reference:

```text
user-story.md §5.5
api_doc.md §11
```

Unauthorized users must not be able to perform the action.

---

# 24. CR/CO-CR MODERATION

Implement the CR/Co-CR moderation workflow.

Reference:

```text
user-story.md §5.2
user-story.md §7.3
frontend-work-process.md Milestone 5
```

The queue must be scoped to:

```text
Department + Session
```

Required actions where supported:

```text
open review
approve
reject
deletion decision
recommend promotion
```

Reject actions must collect the required reason.

Do NOT implement bulk approval.

Reference:

```text
wirefram-resolution.md §1.11
```

---

# 25. STUDENT VERIFICATION

Implement:

```text
/moderate/cr/student-verifications
```

using the documented API.

Only implement actions explicitly supported by the specification/backend.

Do not invent a rejection endpoint if none exists.

Reference:

```text
api_doc.md §8
frontend-work-process.md Milestone 5
```

---

# 26. SUB ADMIN

Implement the Sub Admin experience.

Required areas include:

```text
Moderation Queue
Teacher Verification
CR/Co-CR Management
Analytics
```

Reference:

```text
user-story.md §§5.3, 5.8, 7.2
frontend-work-process.md Milestone 6
```

Sub Admin authority is restricted to their own college.

---

# 27. TEACHER VERIFICATION

Implement:

```text
GET /sub-admin/teacher-verifications
POST /sub-admin/teacher-verifications/:userId/approve
```

Use the actual backend contract.

Do not invent unsupported rejection functionality.

---

# 28. CR/CO-CR ASSIGNMENT

Implement:

```text
POST /sub-admin/cr-assignments
POST /sub-admin/cr-assignments/:assignmentId/revoke
```

Follow:

```text
user-story.md §1.4
```

When revoked:

* permissions immediately revert
* open queue items transfer according to the user story
* UI must reflect the new authority state

Do not invent a GET endpoint if the backend does not provide one.

---

# 29. PROMOTION WORKFLOW

Implement both documented promotion paths.

## Path A — CR/Co-CR recommendation

```text
POST /resources/:id/recommend-promotion
```

Then Sub Admin:

```text
POST /promotion-recommendations/:id/approve
POST /promotion-recommendations/:id/deny
```

Reference:

```text
user-story.md §5.4
```

---

## Path B — Sub Admin direct promotion

```text
POST /resources/:id/promote
```

Reference:

```text
user-story.md §5.4
```

Do not convert promotion into routine Platform Admin moderation.

---

# 30. PLATFORM ADMIN

Implement the Platform Admin surfaces required by:

```text
user-story.md §7.1
frontend-work-process.md Milestone 7
```

Required areas include:

```text
Structure
Sub Admin Management
Emergency Appointment
CRUD Override
Promotion Override
Analytics
```

---

# 31. MASTER DATA MANAGEMENT

Create:

```text
/admin/structure
```

with tabs for:

```text
Colleges
Departments
Sessions
Courses
```

Implement documented CRUD operations.

Use:

```text
api_doc.md §§4–7
```

Do not invent unsupported deletion behavior.

---

# 32. SUB ADMIN MANAGEMENT

Implement:

```text
/admin/sub-admins
```

Support:

```text
appoint
revoke
```

using documented APIs.

Do not invent a GET endpoint if the backend does not expose one.

If a required listing operation is genuinely unavailable, document:

```text
BLOCKED — BACKEND API MISSING
```

instead of fabricating an endpoint.

---

# 33. EMERGENCY APPOINTMENT

Implement the emergency appointment workflow only if supported by:

```text
user-story.md §0.2
user-story.md §1.4
frontend-work-process.md Milestone 7
api_doc.md
```

Require the specified justification.

Do not make this a normal administrative workflow.

---

# 34. PLATFORM ADMIN CRUD OVERRIDE

Implement the exceptional CRUD override exactly as specified.

Reference:

```text
user-story.md §5.9
```

The UI must require:

* target resource
* permitted action
* justification

Do not expose arbitrary state manipulation.

Every override must be represented as an auditable action.

---

# 35. PLATFORM ADMIN PROMOTION OVERRIDE

Implement:

```text
POST /platform-admin/promotion-override
```

where supported.

This is exceptional governance.

It is NOT a normal promotion queue.

Require the specified justification.

Reference:

```text
user-story.md §5.4a
```

---

# 36. ANALYTICS

Implement only documented analytics.

Use APIs from:

```text
api_doc.md §14
```

including where applicable:

```text
GET /analytics/content-gaps
GET /analytics/dedup-savings
GET /sub-admin/analytics/cr-throughput
GET /platform-admin/analytics/promotions-by-college
GET /platform-admin/analytics/override-logs
```

Show appropriate:

* loading
* empty
* error
* data states

Do not fabricate metrics.

---

# 37. NOTIFICATION BEHAVIOR

Use:

```text
GET /notifications
PATCH /notifications/:id/read
```

Implement polling where required.

Do NOT implement:

```text
WebSocket
SSE
```

Reference:

```text
wirefram-resolution.md §1.8
```

Do not invent notification types that are not specified.

---

# 38. EXPLICITLY DO NOT INVENT THESE FEATURES

The following must NOT be fabricated unless the authoritative specifications are changed:

### Comments

Do not create a comment system.

Reference:

```text
wirefram-resolution.md §1.1
```

### Verification-complete notification

Do not invent this notification.

Reference:

```text
wirefram-resolution.md §1.2
```

### Backend Recently Visited

Recently Visited is client-side only.

Reference:

```text
wirefram-resolution.md §1.4
```

### Save Draft

Do not create a draft state unless specified.

Reference:

```text
wirefram-resolution.md §1.5
```

### Bulk Approval

Do not implement.

Reference:

```text
wirefram-resolution.md §1.11
```

### WebSocket/SSE

Do not implement.

Reference:

```text
wirefram-resolution.md §1.8
```

### Saved Views

Treat as an upcoming/unavailable feature where specified.

Reference:

```text
wirefram-resolution.md §1.10
```

### Escalate

If the backend does not provide an escalation endpoint, do NOT create:

```text
POST /resources/:id/escalate
```

Reference:

```text
wirefram-resolution.md §3
```

---

# 39. MISSING BACKEND ENDPOINT RULE

If a Markdown requirement exists but the backend does not expose the required API:

DO NOT:

* invent an endpoint
* create fake data
* use localStorage as a fake database
* create mock success responses
* mark the feature COMPLETE

Instead:

1. Verify `api_doc.md`.
2. Inspect backend source if available.
3. Verify whether another documented endpoint can legitimately support the feature.
4. If not possible, mark it:

```text
BLOCKED — BACKEND API MISSING
```

5. Document the exact missing API and why it is required.
6. Continue implementing all other unblocked work.

---

# 40. UPCOMING FEATURE BEHAVIOR

When a feature is explicitly unavailable according to the resolution document, use:

```text
UpcomingFeatureCard
```

Do not use:

```text
disabled fake buttons
dead links
fake API calls
mock success messages
```

Reference:

```text
wirefram-resolution.md §5
```

---

# 41. NAVIGATION

Navigation must be authority-based.

Global:

```text
Discover
Search
Notifications
Profile
```

Authenticated upload-capable users:

```text
Upload
My Uploads
```

CR/Co-CR:

```text
Moderate
Student Verification
```

Sub Admin:

```text
Manage
Moderation
Teacher Verification
CR/Co-CR Management
Analytics
```

Platform Admin:

```text
Administration
Structure
Sub Admins
Emergency Appointment
Overrides
Analytics
```

Do not expose unauthorized navigation.

Reference:

```text
wireframe.md §3
```

---

# 42. RESPONSIVE DESIGN

Every completed route must work on:

```text
mobile
tablet
desktop
large desktop
```

Follow:

```text
wireframe.md §§6, 8, 13
```

Mobile requirements include where specified:

* bottom navigation
* safe-area support
* stacked cards
* bottom sheets
* full-screen moderation detail
* mobile upload flow

Desktop requirements include where specified:

* sidebar
* dense tables
* detail panels
* command palette

---

# 43. DESIGN SYSTEM

Reuse the existing design system and follow:

```text
wireframe.md §§8, 23–25
```

Do not randomly introduce:

* arbitrary colors
* arbitrary spacing
* arbitrary radii
* arbitrary shadows
* arbitrary animation durations

Reuse existing UI primitives before creating new ones.

---

# 44. ACCESSIBILITY

Every completed screen must support:

* keyboard navigation
* visible focus
* semantic HTML
* accessible labels
* accessible dialogs
* Escape-to-close
* screen-reader-friendly states
* sufficient contrast
* non-color state indicators
* appropriate mobile touch targets

Reference:

```text
wireframe.md §13
```

---

# 45. ERROR STATES

Every API-backed page must handle:

```text
loading
success
empty
error
401
403
404
409
422
429
500
network failure
```

Do not leave pages with:

```text
Loading...
Coming soon...
Something went wrong.
```

without useful recovery behavior.

---

# 46. REMOVE REQUIRED-FEATURE PLACEHOLDERS

Search the repository for:

```text
TODO
FIXME
coming soon
Coming Soon
placeholder
not implemented
mock data
fake data
hard-coded
```

For every occurrence determine whether it is:

1. legitimate UI placeholder text for an input
2. an explicitly allowed Upcoming Feature
3. an actual unfinished implementation

Remove unfinished placeholders for required features.

Do not remove legitimate input placeholders.

---

# 47. MOCK DATA RULE

Do not leave production workflows dependent on mock/static data.

Mock data is permitted only for:

* explicitly documented visual-only content
* UI development where backend functionality is genuinely unavailable
* Upcoming Feature presentation

If mock data is used because an API is missing, clearly document:

```text
BLOCKED — BACKEND API MISSING
```

---

# 48. FORM ARCHITECTURE

Use:

```text
React Hook Form
+
Zod
```

for important forms.

At minimum verify:

* login
* student registration
* teacher registration
* forgot password
* reset password
* upload
* metadata editing
* reassignment
* reporting
* rejection
* deletion
* promotion
* CR/Co-CR assignment
* emergency appointment
* admin override

---

# 49. CACHE INVALIDATION

After mutations, invalidate only affected queries.

Examples:

Approval:

```text
resource
moderation queue
my uploads
notifications
```

Promotion:

```text
resource
promotion state
notifications
analytics
```

CR revocation:

```text
current user
CR queue
Sub Admin queue
assignment-related data
```

Admin override:

```text
resource
override logs
analytics
```

Do not indiscriminately clear the entire TanStack Query cache.

---

# 50. IMPLEMENTATION ORDER

After the audit, implement in this order:

## Phase 1

Foundation:

* API client
* providers
* authenticated user
* types
* query infrastructure
* error handling

## Phase 2

Authentication:

* login
* registration
* password recovery
* verification state
* route guards

## Phase 3

Discovery:

* home
* hierarchy
* search
* filters
* access scope

## Phase 4

Resources:

* resource detail
* file/view
* version history
* reporting
* metadata
* deletion

## Phase 5

Upload:

* complete upload wizard
* validation
* duplicate handling
* My Uploads
* version creation

## Phase 6

Notifications.

## Phase 7

CR/Co-CR:

* moderation
* student verification
* promotion recommendation

## Phase 8

Sub Admin:

* moderation
* teacher verification
* CR/Co-CR management
* promotions
* analytics

## Phase 9

Platform Admin:

* structure
* Sub Admins
* emergency appointment
* CRUD override
* promotion override
* analytics

## Phase 10

Final:

* accessibility
* responsive behavior
* error states
* performance
* tests
* audit

---

# 51. DO NOT STOP AFTER CREATING ROUTES

A route existing does NOT mean the feature is complete.

For every feature verify this chain:

```text
Screen
↓
UI interaction
↓
validation
↓
TanStack Query hook
↓
API client
↓
real backend endpoint
↓
response handling
↓
success/error handling
↓
cache invalidation
↓
updated UI
```

For read operations:

```text
Route
↓
Query
↓
API
↓
Loading
↓
Success
↓
Empty
↓
Error
↓
Unauthorized
```

For mutations:

```text
User action
↓
Validation
↓
Mutation
↓
Backend
↓
Success/Error
↓
Toast/feedback
↓
Cache invalidation
↓
Updated UI
```

If any required link is missing, the feature is not COMPLETE.

---

# 52. TEST AFTER EACH PHASE

Run:

```text
TypeScript
ESLint
production build
tests
```

If the repository has Playwright or another E2E framework, use it.

At minimum verify:

## Authentication

* login
* student registration
* teacher registration
* password recovery
* verification
* logout

## Discovery

* guest access
* authenticated access
* hierarchy
* search
* filters
* scope toggle

## Resources

* detail
* visibility
* download/view
* reporting
* versions
* permissions

## Upload

* valid upload
* invalid upload
* duplicate
* PYQ validation
* metadata edit
* reassignment
* deletion
* resubmission
* version creation

## Moderation

* CR queue
* review
* approve
* reject
* deletion
* student verification
* promotion recommendation

## Sub Admin

* teacher verification
* CR/Co-CR assignment
* revocation
* moderation
* promotion
* analytics

## Platform Admin

* structure
* Sub Admin appointment/revocation
* emergency appointment
* CRUD override
* promotion override
* analytics
* audit logs

---

# 53. FINAL FULL-SPECIFICATION AUDIT

After implementation, re-read:

```text
user-story.md
wireframe.md
wirefram-resolution.md
frontend-work-process.md
api_doc.md
```

Do not rely only on your earlier audit.

Search the actual implementation again.

Look for:

```text
TODO
FIXME
coming soon
mock
fake
hard-coded
placeholder
unimplemented
```

Then verify every required route and workflow.

---

# 54. FINAL AUDIT FILE

Update:

```text
docs/frontend-implementation-audit.md
```

with a final table:

| Requirement          | Specification Citation | Route                      | Components | API | Status   | Notes |
| -------------------- | ---------------------- | -------------------------- | ---------- | --- | -------- | ----- |
| Student registration | user-story.md §1.2     | `/register/student`        | ...        | ... | COMPLETE | ...   |
| Teacher registration | user-story.md §1.3     | `/register/teacher`        | ...        | ... | COMPLETE | ...   |
| Login                | user-story.md §1.6     | `/login`                   | ...        | ... | COMPLETE | ...   |
| Discovery            | user-story.md §2       | `/`                        | ...        | ... | COMPLETE | ...   |
| Search               | user-story.md §2.2     | `/search`                  | ...        | ... | COMPLETE | ...   |
| Upload               | user-story.md §3       | `/upload`                  | ...        | ... | COMPLETE | ...   |
| My Uploads           | user-story.md §3.9     | `/my-uploads`              | ...        | ... | COMPLETE | ...   |
| Resource Detail      | user-story.md §4       | `/resources/[id]`          | ...        | ... | COMPLETE | ...   |
| Moderation           | user-story.md §5       | `/moderate/*`              | ...        | ... | COMPLETE | ...   |
| Version History      | user-story.md §6       | `/resources/[id]/versions` | ...        | ... | COMPLETE | ...   |
| Platform Admin       | user-story.md §7       | `/admin/*`                 | ...        | ... | COMPLETE | ...   |

Every required item must end as one of:

```text
COMPLETE
BLOCKED — BACKEND API MISSING
BLOCKED — SPECIFICATION CONFLICT
OUT OF SCOPE
```

Do not leave required functionality as:

```text
PARTIAL
MISSING
TODO
```

unless there is a documented blocker.

---

# 55. DEFINITION OF DONE

The frontend is COMPLETE only when:

1. Every required screen from `wireframe.md` exists.
2. Every applicable user journey from `wireframe.md` works.
3. Every applicable milestone from `frontend-work-process.md` is implemented.
4. Every supported API from `api_doc.md` needed by the frontend is integrated.
5. User-story permissions are enforced in frontend behavior.
6. Backend remains the final authorization authority.
7. Authentication is real.
8. Registration is real.
9. Upload is real.
10. My Uploads is real.
11. Resource detail is real.
12. Versioning is real.
13. Reporting is real.
14. Moderation is real.
15. Student verification is real where supported.
16. Teacher verification is real.
17. CR/Co-CR assignment/revocation is real where supported.
18. Promotion workflows are real where supported.
19. Sub Admin workflows are real.
20. Platform Admin workflows are real where supported.
21. Analytics are real where APIs exist.
22. Notifications work through the specified mechanism.
23. No fake backend endpoint exists.
24. No unauthorized UI action is exposed.
25. No required feature remains as a placeholder.
26. Loading states exist.
27. Empty states exist.
28. Error states exist.
29. 401/403/404 behavior is handled.
30. Mobile UI works.
31. Desktop UI works.
32. Accessibility requirements are satisfied.
33. TypeScript passes.
34. ESLint passes.
35. Production build passes.
36. Tests pass or any failing tests are documented.
37. The final audit accurately reflects reality.

---

# 56. FINAL COPILOT RESPONSE

When finished, respond with:

## Implementation Summary

What was completed.

## Audit Summary

```text
Complete: X
Partial: 0
Missing: 0
Incorrect: 0
Backend Blocked: X
Out of Scope: X
```

## Routes Added/Updated

List every route.

## API Modules Added/Updated

List every API client module.

## APIs Integrated

List every endpoint actually used.

## Components Added/Updated

List major reusable components.

## Specifications Satisfied

Reference the relevant:

```text
user-story.md §...
wireframe.md §...
wirefram-resolution.md §...
frontend-work-process.md ...
api_doc.md §...
```

## Backend Blockers

List ONLY genuine backend limitations.

For every blocker provide:

```text
Feature:
Specification:
Required API:
Current API situation:
Why frontend cannot complete it:
```

## Explicitly Out of Scope

List only features explicitly excluded by the specification.

## Validation

Report:

```text
TypeScript:
ESLint:
Build:
Unit Tests:
E2E Tests:
```

## Remaining Issues

List only genuine remaining issues.

Do NOT say the frontend is complete if any required feature is still backed by mock data, fake APIs, dead buttons, or placeholder implementation.

---

# FINAL WORKING INSTRUCTION

**Do not merely analyze the repository.**

After creating the audit, immediately begin implementing every requirement that is not blocked.

Work systematically through the phases.

Whenever you discover an existing implementation:

```text
keep it if correct
extend it if partial
fix it if incorrect
replace it only if necessary
```

Whenever you discover a missing feature:

```text
implement it if the backend/specification supports it
```

Whenever you discover a backend limitation:

```text
document it
do not hallucinate an API
continue with the remaining work
```

Whenever you discover a specification ambiguity:

```text
follow wirefram-resolution.md
```

Whenever documents appear to conflict:

```text
do not silently choose a behavior
inspect the resolution document
inspect the backend API contract
document the conflict if it cannot be resolved
```

The goal is a **real, integrated, production-ready frontend**, not a collection of static pages.

Begin with:

```text
PHASE 0 — COMPLETE REPOSITORY AUDIT
```

and continue until the Definition of Done is satisfied.
