# frontend-imp-process.md

> **Purpose.** This document is the canonical frontend implementation roadmap and task specification for the Resource Sharing Platform. It is designed to be executed sequentially by an AI coding agent (copilot) with minimal human guidance. 
> It synthesizes the functional requirements (`user-story.md`), the design philosophy (`wireframe.md`), and the API/feature resolutions (`wirefram-resolution.md`) into actionable engineering milestones.

---

## 0. General Technical Architecture & Guidelines

Before initiating Milestone 1, the AI agent must establish the project foundation. The following assumptions define the tech stack and architectural patterns to be used.

### 0.1 Tech Stack
- **Framework:** Next.js (App Router) + React [1]
- **Styling:** Tailwind CSS [2]
- **UI Primitives:** Radix UI (via shadcn/ui pattern) [3]
- **State Management & Data Fetching:** TanStack Query (React Query) v5 for server state [4]; Zustand for lightweight client state (e.g., command palette, recently visited) [5].
- **Forms & Validation:** React Hook Form + Zod [6, 7]. Zod schemas must mirror backend validation rules exactly.
- **File Uploads:** `react-dropzone` for desktop drag-and-drop, standard `<input type="file">` for mobile.

### 0.2 Folder Structure
```text
src/
├── app/                    # Next.js App Router (pages, layouts)
│   ├── (auth)/             # Login, register, forgot password
│   ├── (app)/              # Authenticated app shell (Discover, Resource, Upload)
│   ├── (admin)/            # Sub Admin & Platform Admin routes
│   └── layout.tsx
├── components/
│   ├── ui/                 # Base primitives (Button, Input, Dialog, Badge)
│   ├── shared/             # App-specific shared (Header, Sidebar, ResourceCard)
│   └── features/           # Complex feature components (UploadWizard, ModerationQueue)
├── hooks/                  # Custom hooks (useDebounce, useAuth, useMediaQuery)
├── lib/                    # Utilities, API client, auth provider
│   ├── api/                # API endpoint groupings
│   ├── types.ts            # TypeScript interfaces matching Prisma models
│   └── utils.ts            # cn(), formatters
└── providers/              # Context providers (QueryClient, Theme, Auth)
```

### 0.3 Data Models & TypeScript Interfaces
Create `src/lib/types.ts`. Interfaces must strictly follow the Prisma schema implied in the source documents.
```typescript
export type UserRole = 'GUEST' | 'STUDENT' | 'TEACHER' | 'CR' | 'CO_CR' | 'SUB_ADMIN' | 'PLATFORM_ADMIN';
export type ResourceState = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED' | 'DELETION_REQUESTED' | 'DELETED';
export type Visibility = 'COLLEGE' | 'PLATFORM';
export type ResourceType = 'CLASS_NOTES' | 'LECTURE_NOTES' | 'SYLLABUS' | 'VIDEO' | 'PYQ' | 'BOOK_PDF';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  collegeId?: string;
  departmentId?: string;
  sessionId?: string;
  isVerified: boolean;
  teacherVerificationStatus?: 'PENDING_VERIFICATION' | 'APPROVED';
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  state: ResourceState;
  visibility: Visibility;
  deletionFlag?: boolean;
  version: number;
  contentHash: string;
  uploader: Pick<User, 'id' | 'name' | 'role'>;
  collegeId: string;
  courseId: string;
  sessionId?: string;
  createdAt: string;
}
```

### 0.4 Design System Tokens (Tailwind Config)
Implement the following semantic tokens in `tailwind.config.ts` to map directly to the wireframe's visual requirements (Section 8.6).
```typescript
colors: {
  state: {
    pending: 'amber',      // ResourceState.PENDING
    in_review: 'blue',     // ResourceState.IN_REVIEW
    approved: 'green',     // ResourceState.APPROVED
    rejected: 'red',       // ResourceState.REJECTED
    superseded: 'gray',    // ResourceState.SUPERSEDED
    del_requested: 'orange',
    deleted: 'gray',
  },
  visibility: {
    platform: 'violet',
    college: 'slate',      // Neutral
  }
}
```

### 0.5 API Client & Integration
- Utilize a centralized fetcher (e.g., `ky` or native `fetch` wrapper) that automatically includes HTTP-only cookies (for session auth) and handles the `{ success: boolean, error: { code, message } }` standard envelope.
- All TanStack Query hooks should be named `useXxxQuery` or `useXxxMutation` and live in `src/hooks/`.

### 0.6 References
- `[1] Next.js App Router: https://nextjs.org/docs/app`
- `[2] Tailwind CSS: https://tailwindcss.com/docs/installation`
- `[3] Radix UI: https://www.radix-ui.com/primitives/docs/overview/introduction`
- `[4] TanStack Query: https://tanstack.com/query/latest/docs/framework/react/overview`
- `[5] Zustand: https://docs.pmnd.rs/zustand/getting-started/introduction`
- `[6] React Hook Form: https://react-hook-form.com/get-started`
- `[7] Zod: https://zod.dev/`

---

## Milestone 1: Foundation & Design System

### Objective
Establish the project scaffolding, design system, layout shell, and routing architecture based on the mobile-first strategy and navigation hierarchy.

### Features Included
1. Application Shell (Responsive Layout)
2. Navigation (Bottom Nav, Desktop Sidebar, Top Bar)
3. Core UI Components
4. Command Palette (Desktop) & Global Search
5. Empty State & Upcoming Feature Placeholders

### Detailed Breakdown & Tasks
1. **Application Shell & Routing**
   - Create route groups: `(auth)`, `(app)`, `(admin)`.
   - Implement `RootLayout` with ThemeProvider (dark/light mode, system-preference default).
   - Implement `AppLayout` containing `<TopBar />`, `<DesktopSidebar />`, `<MobileBottomNav />`, and `<MobileFab />` (context-aware FAB for Upload).
2. **Navigation Components**
   - **Bottom Nav (Mobile):** 4 destinations (Discover, Search, Notifications, Profile). Respect `env(safe-area-inset-bottom)`.
   - **Sidebar (Desktop `lg`+):** Conditionally render context groups ("Moderate", "Manage", "Administration") based on user role/authority. Do not render disabled items; omit entirely if the user lacks authority.
   - **Top Bar:** Breadcrumbs (only for `Department → Session → Course` hierarchy), Search input, Notifications bell with unread badge, Profile avatar.
3. **Core UI Components (shadcn/ui pattern)**
   - Build `Button` (Primary, Secondary, Destructive, Tertiary text-link). Primary action must always be top-right (desktop) or bottom-fixed (mobile).
   - Build `Card` (8px radius for small, 16px for cards).
   - Build `Badge` (State, Visibility, Role variants mapped to design tokens).
   - Build `Input`, `Select`, `Textarea`, `Dialog`, `Drawer` (converts to Bottom Sheet on mobile), `Table`.
4. **Command Palette & Search**
   - Implement `CommandPalette` (`⌘K`) using `cmdk` library, desktop only.
   - Implement debounced global search input.
5. **State Placeholders**
   - Create `UpcomingFeatureCard` component (per `wirefram-resolution.md` Section 5). 16px radius, L0 elevation, calm illustration, no primary CTA.
   - Create `EmptyStateBlock` with specific reason text and single next-action.

### Required UI Components
`AppShell`, `Sidebar`, `BottomNav`, `TopBar`, `FloatingActionButton`, `CommandPalette`, `SearchInput`, `Button`, `Card`, `Badge`, `Dialog`, `Drawer`, `Table`, `UpcomingFeatureCard`.

### Pages/Screens
N/A (Layout components only).

### User Flows & Interactions
- User opens app on mobile: sees Bottom Nav. Upload FAB is center-anchored, disappears if navigating to a screen where upload is invalid (e.g., Resource Detail).
- User opens app on desktop: presses `⌘K` to open Command Palette, types "up", hits Enter to navigate to Upload.

### State Management Requirements
- Zustand store for `CommandPalette` (open/closed).
- Zustand store for `RecentlyVisited` (client-side array of course/resource IDs, capped at 5).

### API/Data Requirements
- `GET /users/me` (to determine role for sidebar visibility).

### Validation & Error-Handling
- Handle 401/403 globally via API interceptor: redirect to `/login` if 401.

### Edge Cases
- iOS notch/home indicator safe areas.
- Role context changes: if a Student is appointed as CR, the sidebar must immediately reflect the "Moderate" section without requiring a hard refresh (utilize TanStack Query invalidation on `/users/me`).

### Dependencies/Prerequisites
- Next.js project initialized, Tailwind configured.

### Completion Criteria / Checklist
- [ ] `AppLayout` renders correctly on mobile, tablet, and desktop breakpoints.
- [ ] Sidebar groups dynamically render based on mock user roles.
- [ ] Command palette opens with `⌘K` and routes to mocked destinations.
- [ ] `UpcomingFeatureCard` renders correctly.

---

## Milestone 2: Authentication & Onboarding

### Objective
Implement user registration, login, password reset, and the verification pending states.

### Features Included
1. Sign In
2. Register — Student
3. Register — Teacher
4. Forgot / Reset Password
5. Verification Pending States

### Detailed Breakdown & Tasks
1. **Sign In Screen (`/login`)**
   - Fields: Email, Password.
   - On submit: `POST /api/v1/auth/login`.
   - On success: fetch `/users/me`, redirect to Discover. Read-only browsing remains available even if unverified.
2. **Student Registration (`/register/student`)**
   - Fields: College (select), Department (select, filtered by `college_department` adoption), Session (select), Reg No (text), Email, Password.
   - Validation: `regNo` unique per college (backend enforces, frontend displays inline error).
3. **Teacher Registration (`/register/teacher`)**
   - Fields: College (select), Departments (multi-select combobox).
   - On success: set `teacherVerificationStatus` to `PENDING_VERIFICATION`.
4. **Forgot/Reset Password**
   - Views for requesting reset email and setting new password via token.
5. **Verification Pending Screens**
   - Student Pending: Explain they can browse but cannot upload/report.
   - Teacher Pending: Explain they must wait for Sub Admin approval to upload.
   - Polling: Implement TanStack Query `refetchInterval: 30000` on `GET /users/me` to detect when `isVerified` flips to `true`. Once verified, show success toast and invalidate nav state.

### Required UI Components
`AuthFormLayout`, `FormInput`, `FormSelect`, `FormMultiSelect`, `Button`, `Alert`.

### Pages/Screens
`/login`, `/register/student`, `/register/teacher`, `/forgot-password`, `/reset-password`, `/verification-pending`.

### User Flows & Interactions
- Register -> land on Verification Pending -> browse Discover (read-only) -> receive verification (via polling) -> nav updates to show Upload FAB.

### State Management Requirements
- AuthProvider (Zustand or Context) holding `user` object.
- TanStack Query mutations for auth endpoints.

### API/Data Requirements
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register/student`
- `POST /api/v1/auth/register/teacher`
- `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`
- `GET /api/v1/users/me`

### Validation & Error-Handling
- Zod schemas matching backend payload exactly.
- Inline field errors for duplicate `reg_no` or email.
- Global error toast for network failures.

### Edge Cases
- User navigates directly to `/upload` while unverified: route guard redirects to Verification Pending screen.
- Teacher tries to login before approval: allow login, but restrict UI to Verification Pending + Read-only Discover.

### Dependencies/Prerequisites
- Milestone 1 complete. Backend Auth APIs available.

### Completion Criteria / Checklist
- [ ] Students and Teachers can register.
- [ ] Form validations trigger inline errors on invalid submission.
- [ ] Verification pending screen polls and updates UI when verified.

---

## Milestone 3: Discovery & Resource Consumption

### Objective
Implement the primary browsing, searching, and detail-viewing experiences for resources.

### Features Included
1. Discover / Home Hub
2. Hierarchical Browse (Dept -> Session -> Course)
3. Search Results
4. Resource Detail Page
5. Version History Viewer
6. Reporting a Resource

### Detailed Breakdown & Tasks
1. **Discover / Home (`/`)**
   - Layout: Search bar top, "Recently Visited" strip (from Zustand store), Browse hierarchy tiles, "Recent Platform Highlights" feed.
   - Data: `GET /resources?visibility=PLATFORM&state=APPROVED`.
2. **Hierarchical Browse (`/departments/[deptId]/sessions/[sessionId]/courses/[courseId]`)**
   - Render breadcrumbs.
   - List resources using `ResourceCard` grid (F-pattern desktop, stacked mobile).
   - Implement "Include other colleges" toggle (Switch component, clearly distinct from filter chips). Changes API query param `?includeOtherColleges=true`.
3. **Search Results (`/search`)**
   - Debounced input (300ms).
   - Results show Type Icon, Title, Visibility Badge, Uploader metadata.
   - Infinite scroll pagination.
4. **Resource Detail (`/resources/[id]`)**
   - Z-pattern layout. Title, Type, Visibility, State (if viewer is uploader/moderator).
   - Primary action: Download/View (opens link or downloads file).
   - Metadata section.
   - Contextual actions toolbar: Edit (if owner), Report, Version History, Recommend for Platform (if eligible CR), Request Deletion.
5. **Version History (`/resources/[id]/versions`)**
   - Fetch `GET /resources/:rootId/versions`.
   - Vertical timeline list. Current version anchored top.
   - Rejected versions visually dimmed/locked if user lacks permission (Guest/Standard Student).
6. **Report Resource**
   - Dialog with reason selection (Incorrect, Spam, Plagiarised).
   - `POST /resources/:id/report`.

### Required UI Components
`ResourceCard`, `ResourceDetailHeader`, `ApprovalTimeline`, `VersionTimeline`, `FilterChip`, `ScopeToggle`, `Breadcrumb`, `ReportDialog`.

### Pages/Screens
`/`, `/departments/[deptId]/sessions/[sessionId]/courses/[courseId]`, `/search`, `/resources/[id]`, `/resources/[id]/versions`.

### User Flows & Interactions
- Guest searches -> clicks COLLEGE resource -> intercepted with "Sign in to view" prompt.
- Student clicks "Include other colleges" -> list expands -> visibility badge shows "[College Name]".

### State Management Requirements
- URL search params for filters (type, session) and scope toggle to support back-button integrity.
- TanStack Query `useInfiniteQuery` for lists.

### API/Data Requirements
- `GET /departments/:id/sessions`, `GET /departments/:id/courses`
- `GET /resources`, `GET /resources/search`
- `GET /resources/:id`, `GET /resources/:rootId/versions`
- `POST /resources/:id/report`

### Validation & Error-Handling
- 404 on Resource Detail: Render `EmptyStateBlock` ("This resource doesn't exist or was removed") and redirect to Discover.
- 403 on Resource Detail: Render "You don't have permission to view this" with Sign In CTA if Guest.

### Edge Cases
- A resource is moved to `IN_REVIEW` (hidden) right as the user clicks it. Handle 404/403 gracefully.
- Guest user attempting version history: redirect to login.

### Dependencies/Prerequisites
- Milestone 1, 2 complete.

### Completion Criteria / Checklist
- [ ] Browse hierarchy renders correctly based on user's college adoptions.
- [ ] Search debounce works and does not spam API.
- [ ] Resource Detail renders state badges only for authorized viewers.
- [ ] Version history hides rejected versions from unauthorized roles.

---

## Milestone 4: Upload & Resource Management

### Objective
Implement the step-by-step upload wizard, My Uploads dashboard, and self-service metadata editing / deletion flows.

### Features Included
1. Upload Wizard (Step-by-step)
2. My Uploads Dashboard
3. Metadata Editing (Lightweight & Structural)
4. Self-Deletion Flows
5. Resource Versioning (v2 submission)

### Detailed Breakdown & Tasks
1. **Upload Wizard (`/upload`)**
   - Full-screen mobile wizard, centered form desktop.
   - Step 1: Choose Type (PYQ, Notes, etc.).
   - Step 2: File input / YouTube link.
   - Step 3: Classification (Course, Session if PYQ).
   - Step 4: Visibility (Teacher only).
   - Step 5: Review & Submit.
   - `POST /resources` (multipart/form-data).
2. **My Uploads (`/my-uploads`)**
   - List user's resources grouped by Status (Pending, In Review, Approved, Rejected, etc.).
   - Actions available per state: Cancel (Pending), Flag for Deletion (In Review), Request Deletion (Approved), Edit Metadata, Add New Version.
3. **Metadata Editing**
   - Inline drawer form.
   - Structural edits (Course/Dept change): warn user it returns resource to Pending.
   - `PATCH /resources/:id/metadata` or `/reassign`.
4. **Self-Deletion**
   - Cancel Pending: immediate.
   - Flag In Review: attaches `deletionFlag`. UI updates to "In Review (Deletion Flagged)".
   - Request Deletion Approved: moves to `DELETION_REQUESTED`.
5. **Versioning (v2 Submission)**
   - Reuse Upload Wizard, but prefaced with "Creating Version 2 for [Title]".
   - `POST /resources/:id/versions`.

### Required UI Components
`UploadWizard`, `FileDropzone`, `YoutubeInput`, `FormSelect`, `MyUploadsTable` (converts to stacked cards on mobile), `EditMetadataDrawer`, `DeletionRequestDialog`.

### Pages/Screens
`/upload`, `/my-uploads`, (Drawers/Modals for edit/actions).

### User Flows & Interactions
- User uploads file -> backend returns duplicate hash warning -> display non-blocking inline banner "This file already exists for this course" -> allow user to proceed anyway or cancel.
- User edits course assignment -> save -> UI shows resource state changed to Pending.

### State Management Requirements
- React Hook Form with `useForm` context across wizard steps to hold state until final submission.

### API/Data Requirements
- `POST /resources` (multipart)
- `GET /resources/my-uploads`
- `PATCH /resources/:id/metadata`, `PATCH /resources/:id/reassign`
- `POST /resources/:id/self-cancel`, `/flag-deletion`, `/request-deletion`, `/resubmit`, `/versions`

### Validation & Error-Handling
- File size/type validation client-side before upload begins.
- PYQ missing session/year: block Next button on Step 3.
- Cross-department reassignment: inline error "You cannot reassign to a course outside your department."

### Edge Cases
- Uploader's role changes (e.g., promoted to Teacher) - versioning still allowed because ownership is tied to the original upload record, not current role.
- Network drops during file upload: show retry state on the submit button.

### Dependencies/Prerequisites
- Milestone 3 complete.

### Completion Criteria / Checklist
- [ ] Wizard completes successfully for both file and YouTube link.
- [ ] My Uploads correctly displays all 7 states + display labels.
- [ ] Metadata structural edit correctly triggers Pending state.

---

## Milestone 5: CR/Co-CR Moderation & Student Verification

### Objective
Implement the CR/Co-CR queues for content moderation and student verification.

### Features Included
1. CR Moderation Queue (Student Uploads)
2. Student Verification Queue
3. Moderation Actions (Approve, Reject, Deletion Decision)
4. Promotion Recommendation (Path A)

### Detailed Breakdown & Tasks
1. **CR Moderation Queue (`/moderate/cr`)**
   - Dense list/table view (stacked cards on mobile).
   - Scope indicator banner: "Showing pending items for [Dept] - [Session]".
   - Items show: Type, Title, Uploader, Submitted Date, Deletion Flag indicator.
   - Tap item -> opens detail panel (desktop) / full screen (mobile) maintaining queue context ("Item 4 of 17", Next/Prev buttons).
2. **Student Verification Queue (`/moderate/cr/student-verifications`)**
   - List of pending students in CR's batch.
   - Data: Name, Reg No, College.
   - Action: Approve only. (No reject button, per `wirefram-resolution.md` Section 2).
3. **Moderation Actions**
   - Approve: closes item, moves to next.
   - Reject: opens Dialog requiring written reason. `POST /resources/:id/reject`.
   - Deletion Decision: If `deletionFlag` is true, prompt moderator to Approve Deletion or Deny Deletion (proceed with normal review).
4. **Promotion Recommendation (Path A)**
   - On Approved `COLLEGE` Student resources in CR scope, show "Recommend for Platform" action.
   - Confirmation dialog.
   - `POST /resources/:id/recommend-promotion`.

### Required UI Components
`ModerationQueueLayout`, `QueueListItem`, `QueueDetailPanel`, `RejectReasonDialog`, `DeletionDecisionDialog`, `ApproveButton`.

### Pages/Screens
`/moderate/cr`, `/moderate/cr/student-verifications`.

### User Flows & Interactions
- CR opens item -> clicks Reject -> modal requires reason -> submits -> item animates out of list -> queue advances to next item automatically.
- CR clicks "Escalate" -> **Replace with `UpcomingFeatureCard`** (per resolution doc, no backend endpoint exists).

### State Management Requirements
- Optimistic updates for queue removal on Approve/Reject to ensure instant UI feedback.
- Cache invalidation for `/cr/queue`.

### API/Data Requirements
- `GET /cr/queue`, `GET /cr/student-verifications`
- `POST /resources/:id/open-review`, `/approve`, `/reject`, `/deletion-decision`
- `POST /student-verifications/:userId/approve`
- `POST /resources/:id/recommend-promotion`

### Validation & Error-Handling
- Cannot reject without a reason. Disable submit button until reason text length > 10.

### Edge Cases
- CR attempts to open item that was transferred to Sub Admin (due to CR revocation). Handle 404/403 by refreshing queue list.
- CR clicks "Escalate" -> must render placeholder card, not a broken button.

### Dependencies/Prerequisites
- Milestone 4 complete. User must have active CR/Co-CR elevation.

### Completion Criteria / Checklist
- [ ] Queue renders items scoped strictly to CR's Dept + Session.
- [ ] Approve/Reject flows function correctly and advance the queue.
- [ ] Student Verification queue renders Approve-only.
- [ ] Escalate action is safely replaced by Upcoming Feature card.

---

## Milestone 6: Sub Admin Management & Moderation

### Objective
Implement the Sub Admin dashboard, handling Teacher uploads, Platform resources, Teacher verifications, and Path A promotion decisions.

### Features Included
1. Sub Admin Moderation Queue (Multi-tab)
2. Teacher Verification Queue
3. CR/Co-CR Management (Appoint/Revoke)
4. Path B Direct Promotion (Teacher Resources)
5. Promotion Recommendations Decision (Path A)
6. Sub Admin Analytics

### Detailed Breakdown & Tasks
1. **Sub Admin Moderation Queue (`/manage/sub-admin/queue`)**
   - Tabs: Pending Teacher Uploads | Pending Platform Resources | Escalations.
   - *Note: Promotion recommendations tab should render `UpcomingFeatureCard` due to missing list endpoint.*
   - Same list/detail pattern as CR queue.
2. **Teacher Verification (`/manage/sub-admin/teacher-verifications`)**
   - List of pending teachers. Data: Name, College, Depts.
   - Action: Approve only.
3. **CR/Co-CR Management (`/manage/sub-admin/cr-assignments`)**
   - Table of active CRs per Dept+Session.
   - Appoint action: Search verified students in batch, assign CR or Co-CR.
   - Revoke action: Confirmation dialog. Warns that In Review items will transfer to Sub Admin queue.
4. **Path B Promotion (Direct)**
   - On Approved `COLLEGE` Teacher resources, Sub Admin sees "Promote to Platform" button.
   - Executes direct visibility change. No notification sent to Teacher.
5. **Promotion Recommendations (Path A)**
   - *Decision endpoint exists, but list endpoint is missing.* Render `UpcomingFeatureCard` for the list. If accessed via deep link/notification, allow the decision UI (`POST /promotion-recommendations/:id/approve|deny`) to render.
6. **Sub Admin Analytics (`/manage/sub-admin/analytics`)**
   - Data cards for: Content Gaps, Dedup Savings, CR Throughput.
   - `UpcomingFeatureCard` for "Saved Views".

### Required UI Components
`AdminQueueTabs`, `TeacherVerifyTable`, `CRAssignmentTable`, `AppointCRDialog`, `AnalyticsCard`, `UpcomingFeatureCard`.

### Pages/Screens
`/manage/sub-admin/queue`, `/manage/sub-admin/teacher-verifications`, `/manage/sub-admin/cr-assignments`, `/manage/sub-admin/analytics`.

### User Flows & Interactions
- Sub Admin promotes Teacher resource -> UI updates badge to PLATFORM immediately -> no notification generated.
- Sub Admin revokes CR -> confirms -> success toast -> queue automatically fetches newly transferred items.

### State Management Requirements
- Tab state managed via URL search params (`?tab=teacher_uploads`).

### API/Data Requirements
- `GET /sub-admin/queue`, `GET /sub-admin/teacher-verifications`
- `POST /sub-admin/teacher-verifications/:userId/approve`
- `POST /sub-admin/cr-assignments`, `POST /sub-admin/cr-assignments/:id/revoke`
- `POST /resources/:id/promote` (Path B)
- `GET /analytics/content-gaps`, `/dedup-savings`, `/sub-admin/analytics/cr-throughput`

### Validation & Error-Handling
- Appointing a CR to a batch that already has one: block and show error "A CR already exists for this Dept+Session. Revoke the current one first."

### Edge Cases
- Path B resource is rejected later: Sub Admin (promoter) gets notified, Teacher does not.
- CR list endpoint missing: Use `UpcomingFeatureCard` or assume standard REST convention if backend confirms it. (Prefer placeholder to avoid hallucinated endpoints).

### Dependencies/Prerequisites
- Milestone 5 complete.

### Completion Criteria / Checklist
- [ ] Sub Admin queue tabs render correctly (with placeholder for Promotions tab).
- [ ] CR appointment and revocation works.
- [ ] Path B promotion executes without sending notification.
- [ ] Analytics cards render data from endpoints.

---

## Milestone 7: Platform Admin & Global Overrides

### Objective
Implement the structural master data management, global overrides, and platform-wide analytics.

### Features Included
1. Structural CRUD (Colleges, Depts, Sessions, Courses)
2. Sub Admin Management
3. Emergency Appointments
4. CRUD & Promotion Overrides
5. Platform Analytics & Override Log

### Detailed Breakdown & Tasks
1. **Structural CRUD (`/admin/structure`)**
   - Single screen, 4 tabs (Colleges, Departments, Sessions, Courses).
   - Table-first layout. Edit actions open side Drawer.
   - Create/Edit forms for each entity.
2. **Sub Admin Management (`/admin/sub-admins`)**
   - List of Sub Admins per college.
   - Appoint/Revoke actions.
3. **Emergency Appointment (`/admin/emergency-appointment`)**
   - Short form to appoint interim Sub Admin or CR directly.
   - **Requires Justification Note** (textarea, min length 20).
4. **CRUD Override (`/admin/override`)**
   - Search for resource by ID/Title.
   - Execute state change bypassing normal queue (e.g., force Delete, force Approve).
   - **Requires Justification Note**.
5. **Promotion Override (`/admin/promotion-override`)**
   - Force promote/deny a promotion.
   - **Requires Justification Note**.
6. **Platform Analytics & Override Log (`/admin/analytics`)**
   - Metrics: Promotions per college.
   - Table log of all overrides (actor, target, action, timestamp, justification).
   - `UpcomingFeatureCard` for "Saved Views".

### Required UI Components
`EntityTable`, `EntityEditDrawer`, `SubAdminTable`, `JustificationNoteDialog`, `OverrideLogTable`, `AnalyticsCard`.

### Pages/Screens
`/admin/structure`, `/admin/sub-admins`, `/admin/emergency-appointment`, `/admin/override`, `/admin/analytics`.

### User Flows & Interactions
- Admin executes CRUD Override on a resource -> enters justification -> success -> entry appears in Override Log.
- Admin attempts to delete a Course -> block deletion (backend enforces course mutability rule; courses are never deleted, only renamed).

### State Management Requirements
- Standard TanStack Query mutations. Override actions should invalidate both the specific resource cache and the Override Log cache.

### API/Data Requirements
- `POST/GET/PATCH /colleges`, `/departments`, `/sessions`, `/courses`
- `POST /platform-admin/sub-admins`, `/revoke`
- `POST /platform-admin/emergency-appointments`
- `POST /platform-admin/resources/:id/override`
- `POST /platform-admin/promotion-override`
- `GET /platform-admin/analytics/override-logs`, `/promotions-by-college`

### Validation & Error-Handling
- All override and emergency appointment forms block submission if the Justification Note is empty or too short.
- Course rename validation: ensure name isn't blank.

### Edge Cases
- Admin attempts to delete a college with active resources: backend returns 400. Frontend displays inline toast "Cannot deactivate college with active resources."

### Dependencies/Prerequisites
- Milestone 6 complete.

### Completion Criteria / Checklist
- [ ] Master data tables render and allow safe editing via drawers.
- [ ] Override actions require and successfully log justification notes.
- [ ] Override log table displays historical overrides with correct actor/timestamp data.
- [ ] Saved Views replaced with Upcoming Feature card.