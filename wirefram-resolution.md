# wireframe-resolutions.md — Open Question Resolution Pass

> **Method.** Every `TODO`, `Open Question #N`, and "API Dependencies: TODO — no API documentation supplied" line in `wireframe.md` was checked against `Backend Work Process — Resource Sharing Platform.md` (the actual API spec that didn't exist when the wireframe was generated). Where the backend file gives a concrete, citable answer, the item below is marked **RESOLVED**. Where the backend file is silent — including cases where it silently confirms a feature was *never built* — the item is marked **REMAINS OPEN**, and, per your instruction, the recommendation is to render a lightweight **"Upcoming Feature" placeholder card** in that spot instead of building undefined behavior. No answer is invented; every resolution below cites a Phase/task or Section from the backend file.
>
> This document does not edit `wireframe.md` in place — it's a companion resolution log. Section 5 gives the exact copy/spec for the "Upcoming Feature" card so it's applied consistently everywhere it's needed.

---

## 1. Original Open Questions (plan §17 / wireframe Section D)

| # | Question | Status | Resolution |
|---|---|---|---|
| 1 | **Comment Thread** — does a comment feature exist? | **RESOLVED — feature does not exist** | No `Comment` model anywhere in `schema.prisma` (confirmed by omission — the backend file's own rule is "never add a model not in schema.prisma," and no comment table, endpoint, or Phase task appears anywhere in Section 11). The single stray mention in the source flow doc ("Guest cannot comment") does not correspond to a built feature. **Action:** remove all comment affordances from B.10 permanently — this isn't a future feature, it's a discarded one-off phrase. If product later wants comments, it requires a net-new schema model and is a new project, not a gap-fill. |
| 2 | **Verification-complete notification** for Students/Teachers | **RESOLVED — not built** | Backend Phase 12 task 2 explicitly enumerates *every* notification event that gets wired to `notificationService`: Approved, Rejected, Promotion Approved/Denied, Path B promotion (explicitly "no notification"), Deletion Approved/Denied, Promoted-then-Rejected (both paths). "Student/Teacher verified" is not in that list, and the AI Agent Rules forbid inventing notification events not present in Section 11. **Action:** B.5/B.6/B.14/B.17/B.19 should not build a "you're verified" notification. The only way a user learns they're verified is landing on Discover again and seeing full nav — which already works, since Phase 5 task 4 flips `isVerified` synchronously and nothing gates re-fetching `GET /users/me`. No card needed; this is a real (minor) UX gap worth flagging to product for a future phase, not a rendering gap. |
| 3 | **Dark/light mode default** | **STILL OPEN — cosmetic, not a missing feature** | Backend file never touches UI theme (no `User.themePreference` field in scope, no endpoint). This isn't a functionality gap, it's a design decision with no backend blocker either way — the Profile screen's `AppearanceToggle` can ship exactly as designed (system-preference default + manual override) since nothing in the backend contradicts or requires it. No placeholder card needed; keep as documented assumption. |
| 4 | **"Recently visited" personalization** | **RESOLVED — confirmed client-only, as assumed** | No `GET/POST /recently-visited`-style endpoint exists anywhere in Section 11, and no such model exists in the schema-derived Phase list. This *confirms* (rather than contradicts) the wireframe's client-side-only assumption. **Action:** keep `RecentlyVisitedStrip` exactly as designed — client-side cache, never backend-synced, never cross-device. |
| 5 | **Save-as-draft during Upload** | **RESOLVED — confirmed not built** | `ResourceState` per the badge legend only contains `PENDING / IN_REVIEW / APPROVED / REJECTED / SUPERSEDED / DELETION_REQUESTED / DELETED` — no `DRAFT` state exists, and Phase 7's upload tasks (1–15) contain no draft-save endpoint. **Action:** confirmed — do not build. Matches wireframe's existing exclusion. |
| 6 | **Analytics visualization type** (chart vs. table vs. number) | **PARTIALLY RESOLVED** | Backend Phase 14 confirms the *data* endpoints (`/analytics/content-gaps`, `/analytics/dedup-savings`, `/platform-admin/analytics/promotions-by-college`, `/sub-admin/analytics/cr-throughput`, `/platform-admin/analytics/override-logs`) but returns aggregate data only — it does not dictate chart type. The wireframe's fixed *interaction* pattern (Data Cards first, detail table on demand, §22.5) is unaffected and can ship now; only the literal chart-vs-number-vs-bar choice for the Data Cards remains a design decision. No placeholder card needed — this isn't a missing feature, all five metrics are real, callable endpoints today. |
| 7 | **Brand identity specifics** (hue, font, logo) | **STILL OPEN — out of backend's scope entirely** | Not addressed and not blockable by the backend. Pure design-system decision; not a "missing feature," so no Upcoming Feature card applies — just needs design sign-off. |
| 8 | **Real-time notification delivery mechanism** | **RESOLVED — confirmed polling, no push** | Backend Section 2 (Project Structure) explicitly marks `queue/` as *"NOT USED in Phase 1–13 (no Redis available)"* and `jobs/` as *"in-process only, no Redis/queue broker."* No WebSocket/SSE setup appears anywhere in Section 6 (Auth) or Phase 12 (Notifications) — `GET /notifications` is a plain polling read. **Action:** confirmed — implement `NotificationRow` polling (e.g., TanStack Query interval refetch) exactly as the wireframe assumed. Not a gap; ship as-is. |
| 9 | **Read-only browsing during pending verification** | **RESOLVED — confirmed available** | Phase 5 task 5 states the block applies only to *"upload/report/self-deletion actions while `isVerified=false`"* — browsing/read (`GET`) endpoints are never mentioned as gated. **Action:** confirmed — B.5/B.6's "Browse anyway" CTA is correct and can lose its TODO; Discover/Search/Resource Detail truly stay open pre-verification. |
| 10 | **Saved views for admin/analytics tables** | **RESOLVED — not built, genuine feature gap** | No endpoint, no model, no Phase 11 task anywhere resembling saved filters/column prefs. This is the clearest case of "no answer exists yet." **Action → Upcoming Feature card.** See Section 5. Applies to B.22, B.23, B.24, B.26 (Override Log), and component C.6 (Tables). |
| 11 | **Bulk-approve on moderation queues** | **RESOLVED — confirmed deliberately absent** | Every Phase 9 moderation endpoint (`open-review`, `approve`, `reject`, `flag-deletion`, `deletion-decision`) operates on a single `:id`. No bulk/batch route exists anywhere in Section 11. **Action:** confirmed — do not build a bulk-select UI on moderation queues (B.16, B.17, B.18, B.19, B.20); this is intentional per the "individually reasoned decision" design goal, not a gap. |

---

## 2. New Ambiguities Surfaced During Wireframe Generation (Section D.1)

| Ambiguity | Status | Resolution |
|---|---|---|
| **Exact field list — Register Student (B.2)** | **RESOLVED** | Phase 5 task 1: `POST /auth/register/student` body = **college, department (must be adopted by that college), session, regNo (unique per collegeId), email, password.** Update B.2's Component Tree from generic `TextInput × N` to this exact field set; `regNo` uniqueness is scoped per college, not global (Section 5, `schema:User @@unique([collegeId, regNo])`). |
| **Exact field list — Register Teacher (B.3)** | **RESOLVED** | Phase 5 task 6: `POST /auth/register/teacher` body = **college, one-or-more departments, email, password.** Note the plural departments — B.3's field list needs a multi-select department control, not a single dropdown. |
| **Exact scoping logic (§0.3)** governing Discover/Search/Browse visibility | **RESOLVED (concrete matrix now exists)** | Phase 7 task 11 states the visibility matrix directly: **Guest** → platform-only; **Student/Teacher** → own-college by default + opt-in "include other colleges" toggle; **CR/Co-CR** → two-tier; **Sub Admin** → own-college full, other-college read-only; **Platform Admin** → full. Phase 8 task 1 adds: Students see only departments their *own college has adopted* (`CollegeDepartment` filter); Guests/Teachers/Admins see the full platform-level hierarchy. Carry this matrix directly into B.7/B.8/B.9's "Permission Rules" — no longer a TODO. |
| **B.17 (Student Verification) / B.19 (Teacher Verification): separate screens or tabs of B.16/B.18?** | **RESOLVED — genuinely separate endpoints, treat as separate screens/data sources** | Backend gives four *distinct* endpoint groups with no shared query param: `GET /cr/queue` + `GET /sub-admin/queue` (content moderation, Phase 9), `GET /cr/student-verifications` + `GET /sub-admin/student-verifications` (Phase 5), `GET /sub-admin/teacher-verifications` (Phase 6). None of these are variations of the same list call — B.18's "Pending Teacher Uploads / Pending Platform Resources / Escalations" tabs (Phase 9 task 3 scope) explicitly does **not** include Teacher Verification. **Action:** keep B.17/B.19 as their own screens (or tabs backed by separate API calls, never a shared query) — do not try to merge them into B.16/B.18's list component's data source. |
| **Is Promotion Queue (B.20) the same surface as B.18's "Promotion Recommendations" tab?** | **PARTIALLY RESOLVED — plus a real backend gap found** | The *decision* endpoints exist and are shared (`POST /promotion-recommendations/:id/approve`\|`/deny`, Phase 11 task 2), so B.20 and a B.18 tab **could** point at the same decision actions. However: **no `GET` list endpoint for pending `PromotionRecommendation` rows is enumerated anywhere in Section 11** — Phase 9 task 3's `/sub-admin/queue` scope explicitly excludes promotions, and Phase 11 never lists a corresponding `GET`. This is a genuine backend gap, not a UI ambiguity. **Action → flag to backend team as a missing task** (a `GET /sub-admin/promotion-recommendations` list route, mirroring the existing `/sub-admin/queue` pattern). Until it exists, render B.20 / the B.18 "Promotion Recommendations" tab as an **Upcoming Feature card** (see Section 5) rather than pointing it at a nonexistent endpoint. |
| **Reject/decline path for Student Verification (B.17) / Teacher Verification (B.19)** | **RESOLVED — confirmed, no reject path exists** | Phase 5 task 4 and Phase 6 task 1 each define only an `.../approve` action. No decline/reject endpoint appears anywhere for either queue. **Action:** confirmed — B.17/B.19 should render **Approve only**, with no Reject button at all (not even a hidden one) — this isn't a placeholder gap, it's a confirmed one-action queue. |
| **Colleges/Departments/Sessions/Courses (B.23): one screen with tabs, or four screens?** | **RESOLVED — recommend one screen, entity-type tabs** | Backend Section 2.1 gives each entity its own route/controller/service/repository/validator file (`college.*`, `department.*`, `session.*`, `course.*`) — four independent endpoint groups (Phase 4 tasks 1–5), confirming they're conceptually separate resources. But the wireframe's own Component Tree for B.23 already parameterizes `EntityTable`/`EditDrawer` "per entity type," and Implementation Notes call this a single "structural, infrequent task" pattern shared with B.21. **Recommendation:** one screen, four tabs (College / Department / Session / Course), each tab's table backed by its own endpoint group — same UI pattern B.18 already uses for its four sub-scopes. This is a recommendation, not a backend-confirmed fact, since routing structure is a frontend call either way. |
| **Offline behavior** | **STILL OPEN — not a "missing feature," it's out of scope** | No offline endpoint, caching layer, or service-worker strategy appears anywhere in the backend file (it's a stateless REST API with cookie auth — genuinely incompatible with true offline use without separate infra work). This isn't a placeholder-card situation; it's a "not building this" situation. **Action:** implement only the standard `Error State` (toast + retry) from A.6 when a request fails due to connectivity — do not attempt an offline mode. |
| **Analytics/telemetry events** (product usage analytics) | **STILL OPEN — invisible, no UI impact** | Confirmed absent from the backend (Phase 14's analytics are business metrics about *content*, not instrumentation about *UI usage*). Since this is invisible instrumentation with no user-facing surface, it doesn't need an Upcoming Feature card — there's nothing on screen for a card to replace. No action needed for wireframe purposes. |
| **Not-found / invalid-resource-ID on Resource Detail (B.10)** | **PARTIALLY RESOLVED** | Section 4 confirms the API contract: a bad `:id` returns a standard `404` with the shared error envelope (`{ success:false, error:{ code, message } }`, Section 4/8) — so the frontend now has something concrete to branch on. The exact *screen design* for that case is still undecided, but it no longer needs a TODO: reuse A.6's existing "No Permission" pattern (redirect-with-message to Discover), since a 404 and a permission-denied 403 should feel the same to the viewer either way. |
| **Exact px dimensions** (buttons, cards, grid columns per breakpoint) | **STILL OPEN — pure frontend/design decision** | Not addressed and not blockable by the backend at all. No card needed; needs design sign-off same as brand identity (#7). |

---

## 3. New Gap Found During This Pass: **"Escalate" has no backend support**

Not previously flagged in `wireframe.md`, but worth surfacing: B.16 (Moderation Queue — CR/Co-CR) and B.18 (Sub Admin queue tabs) both list **Escalate** as a per-item Secondary action. Searching Section 11 end-to-end, **no `POST .../escalate` endpoint, service method, or Phase task exists anywhere.** The only related backend behavior is *automatic, system-triggered* queue transfer on CR/Co-CR **revocation** (Phase 6 task 5, Phase 9 task 15) — that's an admin action, not something the moderator themselves can trigger from the queue.

**Action → Upcoming Feature card.** Do not ship a functional "Escalate" button pointing at nothing. Replace it with the Section 5 placeholder, or simply omit the button entirely until the backend team confirms and adds the endpoint. Same applies to the "escalation target/visibility scope" TODO already in B.16's Permission Rules — it can't be resolved because the feature itself isn't built yet, not because documentation is missing.

**Also found:** three list (`GET`) endpoints are implied-but-not-explicitly-enumerated in Section 11, unlike every other CRUD surface which gets an explicit `GET` task:
- CR/Co-CR assignments list (B.21) — Phase 6 only states the `POST appoint` / `POST revoke` actions (tasks 4–5), no `GET /sub-admin/cr-assignments`.
- Sub Admin assignments list (B.24) — same pattern, Phase 6 task 2–3 only give `POST`s.
- Promotion recommendations list (B.20) — covered above in Section 2.

These are almost certainly intentional omissions (a list route is implied by REST convention and cheap to add), not deliberate exclusions like "Escalate" or "bulk-approve" — but per the backend file's own AI Agent Rule ("never invent endpoints... stop and flag rather than guess"), they should be confirmed with the backend team before the frontend codes against an assumed URL. Recommend adding `GET /sub-admin/cr-assignments` and `GET /platform-admin/sub-admins` as explicit Phase 6 tasks.

---

## 4. API Dependency Reference — Fills Every Screen's "API Dependencies: TODO"

| Screen | Endpoint(s) | Backend Phase |
|---|---|---|
| B.1 Sign In | `POST /api/v1/auth/login` | Phase 2, task 6 |
| B.2 Register — Student | `POST /api/v1/auth/register/student` | Phase 5, task 1 |
| B.3 Register — Teacher | `POST /api/v1/auth/register/teacher` | Phase 5, task 6 |
| B.4 Forgot/Reset Password | `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password` | Phase 2, tasks 9–10 |
| B.5 Verification Pending (Student) | `GET /api/v1/users/me` (poll `isVerified`) | Phase 5, task 9 |
| B.6 Verification Pending (Teacher) | `GET /api/v1/users/me` (poll `teacherVerificationStatus`) | Phase 5, task 9 |
| B.7 Discover/Home | `GET /departments/:id/sessions`, `GET /departments/:id/courses`, `GET /resources` (highlights), `GET /resources/search` (entry only) | Phase 8, tasks 1–3 |
| B.8 Search Results | `GET /resources/search?q=`, `GET /resources?resourceType=&sessionId=`, `?includeOtherColleges=true` | Phase 8, tasks 2–4 |
| B.9 Browse | `GET /departments/:id/sessions`, `GET /departments/:id/courses`, `GET /resources` (course-level list) | Phase 8, tasks 1, 3 |
| B.10 Resource Detail | `GET /resources/:id`; contextual: `PATCH /resources/:id/metadata`, `PATCH /resources/:id/reassign`, `POST /resources/:id/versions`, `POST /resources/:id/report`, `POST /resources/:id/recommend-promotion`, `POST /resources/:id/promote`, `POST /resources/:id/request-deletion`, `POST /resources/:id/self-cancel`, `POST /resources/:id/flag-deletion`, `POST /resources/:id/resubmit` | Phase 7 (tasks 11–14), Phase 9 (7,8,10,14), Phase 10 (1), Phase 11 (1,3) |
| B.11 Version History | `GET /resources/:rootId/versions` | Phase 13, task 1 |
| B.12 Upload Flow | `POST /resources` (multipart, Multer) | Phase 7, tasks 4–8 |
| B.13 My Uploads | `GET /resources/my-uploads`; state actions same as B.10 | Phase 7, task 10 |
| B.14 Notifications | `GET /notifications`, `PATCH /notifications/:id/read` | Phase 12, task 3 |
| B.15 Profile/Account Settings | `GET /users/me`, `POST /auth/logout` | Phase 5 (9), Phase 2 (8) |
| B.16 Moderation Queue — CR/Co-CR | `GET /cr/queue`, `POST /resources/:id/open-review`, `/approve`, `/reject`, `/deletion-decision` | Phase 9, tasks 2, 4–6, 11 |
| B.17 Student Verification Queue | `GET /cr/student-verifications`, `GET /sub-admin/student-verifications` (fallback), `POST /student-verifications/:userId/approve` | Phase 5, tasks 2–4 |
| B.18 Moderation Queue — Sub Admin | `GET /sub-admin/queue` (Teacher uploads + Platform resources + escalations only — **not** verification or promotions, see Section 2); same decision endpoints as B.16 | Phase 9, task 3 |
| B.19 Teacher Verification Queue | `GET /sub-admin/teacher-verifications`, `POST /sub-admin/teacher-verifications/:userId/approve` | Phase 6, task 1 |
| B.20 Promotion Queue | Decisions: `POST /resources/:id/recommend-promotion`, `POST /promotion-recommendations/:id/approve`\|`/deny`. **List endpoint missing — see Section 3.** | Phase 11, tasks 1–2 |
| B.21 CR/Co-CR Management | `POST /sub-admin/cr-assignments`, `POST /sub-admin/cr-assignments/:id/revoke`. **List endpoint not explicit — see Section 3.** | Phase 6, tasks 4–5 |
| B.22 Sub Admin Analytics | `GET /analytics/content-gaps`, `GET /analytics/dedup-savings`, `GET /sub-admin/analytics/cr-throughput` | Phase 14, tasks 1–2, 4 |
| B.23 Colleges/Departments/Sessions/Courses | `POST/GET/PATCH /colleges`, `POST/GET/PATCH /departments`, `POST /colleges/:collegeId/departments` + `DELETE`, `POST /departments/:departmentId/sessions` + `PATCH /sessions/:id`, `POST/PATCH /departments/:departmentId/courses` | Phase 4, tasks 1–5 |
| B.24 Sub Admin Management | `POST /platform-admin/sub-admins`, `POST /platform-admin/sub-admins/:assignmentId/revoke`. **List endpoint not explicit — see Section 3.** | Phase 6, tasks 2–3 |
| B.25 Emergency Appointment | `POST /platform-admin/emergency-appointments` | Phase 6, task 6 |
| B.26 CRUD/Promotion Override, Override Log | `POST /platform-admin/resources/:id/override`, `POST /platform-admin/promotion-override`, `GET /platform-admin/analytics/override-logs` | Phase 15 (task 1), Phase 11 (task 9), Phase 14 (task 5) |

---

## 5. The "Upcoming Feature" Card — Standard Spec

For every location above marked **→ Upcoming Feature card**, use one shared component rather than a bespoke treatment per screen. It extends the existing `EmptyStateBlock` pattern (A.6/§8.16) so it needs no new visual language:

- **Component:** `UpcomingFeatureCard` (variant of `EmptyStateBlock`, C.2-adjacent).
- **Radius/elevation:** `16px` radius, L0 (resting, no shadow) — same as any card at rest (A.4).
- **Content:** one calm, single-color illustration (never playful/whimsical on functional surfaces per §8.10's serious-surface rule) + one-line explanation ("This isn't available yet.") + optional second line naming the feature plainly (e.g., "Escalation isn't available yet — reach out to your Sub Admin directly.").
- **No primary action button.** There's nothing to do yet — a card with a dead-end CTA is worse than no CTA. If genuinely useful, a single Tertiary link to a working alternative is fine (e.g., Promotion Queue's card could link back to Resource Detail's existing "Recommend for Platform" action, which *does* work).
- **Never disabled-but-visible controls.** Don't render a grayed-out "Escalate" button — per §20's own hidden-vs-disabled rule, an unbuilt feature is closer to "absent" than "disabled," so the card *replaces* the control rather than sitting next to a dead one.
- **Applies to:** Escalate action (B.16, B.18, C.7), Promotion Queue list view (B.20, pending the missing endpoint), Saved views (B.22, B.23, B.24, B.26, C.6).

---

## 6. Summary — What Changed

- **9 of 11** original Open Questions are now fully or partially resolved with a citation.
- **7 of 9** new ambiguities from D.1 are resolved or given a concrete recommendation.
- **1 new gap** found that wireframe.md didn't previously flag: Escalate has zero backend support.
- **3 likely-missing list endpoints** flagged for the backend team to confirm/add (promotion recommendations, CR/Co-CR assignments, Sub Admin assignments).
- **Every screen's** "API Dependencies: TODO" is now filled with a real endpoint, except the two spots (B.20, and by extension B.18's Promotion tab) blocked on the missing list route above.
- **Genuinely unresolvable items** (brand hue/font, exact px dimensions, offline mode, telemetry) stay open because they're either pure design decisions or explicitly out of scope — not because information is missing. Only *feature-shaped* gaps (Escalate, saved views, promotion queue listing) get the Upcoming Feature card treatment.