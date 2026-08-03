# NoteKoi — Project Reference for Claude

## What this project is

NoteKoi is a **college academic resource-sharing platform**. Students, Teachers, and admins collaborate to share notes, syllabi, PYQs, book PDFs, and lecture videos. Resources go through a moderation workflow before going live. Platform supports multi-college, multi-department, and multi-session hierarchies.

The canonical product spec is `docs/phases.md` (User Flow v6). Read it before making any business-logic decisions — it is the source of truth for roles, permissions, state machines, and notification rules.

---

## Monorepo structure

```
NoteKoi/
├── note-koi-frontend/   — Next.js 16 + Tailwind + React Query + Zustand
├── noteKoi-backend/     — Express 5 + Prisma 7 + PostgreSQL (Neon)
├── package.json         — root scripts
└── pnpm-workspace.yaml  — workspace definition
```

Run everything from the root:

```bash
pnpm install        # installs both workspaces
pnpm run dev        # starts frontend (port 3000) and backend in parallel
```

---

## Tech stack

### Backend (`noteKoi-backend`)
- **Runtime**: Node.js (ESM, `"type": "module"`)
- **Framework**: Express 5
- **ORM**: Prisma 7 with PostgreSQL (Neon)
- **Auth**: JWT (access + refresh tokens), HTTP-only cookies, CSRF guard
- **Validation**: Zod
- **File uploads**: Multer (local disk, SHA-256 content hash)
- **Email**: Nodemailer (password reset only at the moment)
- **Logging**: Pino
- **Dev**: tsx watch

Key env vars needed (create `.env` in `noteKoi-backend/`):
```
DATABASE_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
PASSWORD_RESET_TOKEN_SECRET=
CORS_ORIGIN=http://localhost:3000
PORT=4000
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

### Frontend (`note-koi-frontend`)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Data fetching**: TanStack React Query
- **State**: Zustand (user store, app store)
- **HTTP client**: Axios (via `src/lib/api/client.ts`, cookie credentials)
- **Dev**: `next dev`

Key env var (create `.env.local` in `note-koi-frontend/`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Database

Schema lives at `noteKoi-backend/prisma/schema.prisma`. One migration already applied (`20260803074007_init`).

```bash
# from noteKoi-backend/
pnpm prisma migrate dev   # new migration
pnpm prisma generate      # regenerate client after schema change
pnpm prisma studio        # browse data
pnpm run seed             # seed initial data
```

Generated client outputs to `noteKoi-backend/generated/prisma/`.

---

## Backend architecture

```
src/
├── server.ts              — Express app + route registration
├── routes/                — thin route files, wire middleware + controller
├── controllers/           — parse req, call service, return res
├── services/              — business logic
├── repositories/          — Prisma queries only (no business logic)
├── middlewares/
│   ├── authenticate.ts    — verifies JWT, attaches req.user
│   ├── authorize.ts       — role-based (PLATFORM_ADMIN, SUB_ADMIN, etc.)
│   ├── scopeGuards.ts     — scope checks (active sub admin, active CR/Co-CR)
│   ├── csrfGuard.ts       — CSRF header check on state-changing routes
│   └── validate.ts        — Zod body validation
├── auth/                  — JWT sign/verify, password hash/compare, cookie helpers
├── config/                — env, logger, cookie names
├── errors/                — AppError class
├── helpers/               — response.ts (ok(), created())
├── mail/                  — nodemailer wrapper
├── permissions/           — permissionMap.ts
├── prisma/                — prisma.ts client singleton
├── storage/               — multerConfig.ts
└── validators/            — Zod schemas per domain
```

**Pattern**: route → middleware chain → controller → service → repository. Services never import other services' repositories directly; they import from their own domain's repository.

---

## Frontend architecture

```
src/
├── app/
│   ├── (auth)/            — login, register/student, register/teacher,
│   │                        forgot-password, reset-password, verification-pending
│   ├── (app)/             — authenticated app shell layout
│   │   └── page.tsx       — Discover/Home (currently a placeholder stub)
│   ├── upload/            — upload form
│   ├── my-uploads/        — user's upload history
│   ├── resources/[id]/    — resource detail
│   ├── search/            — search + filter
│   ├── notifications/     — notification feed
│   └── profile/           — profile view + edit
├── components/
│   ├── shared/            — app shell, layout, nav, resource-card, etc.
│   └── ui/                — button, card, badge, dialog, input, textarea
├── hooks/                 — React Query hooks + auth guard
├── lib/
│   ├── api/               — per-domain API functions (axios calls)
│   ├── types.ts           — TypeScript types for all domain entities
│   └── utils.ts           — helpers
├── providers/             — theme provider
└── store/                 — Zustand stores (use-user-store, use-app-store)
```

---

## Roles (from spec §0.1)

| Role | Notes |
|---|---|
| `PLATFORM_ADMIN` | Manages whole platform; exceptional-use override everywhere |
| `SUB_ADMIN` | One per college; moderates teachers + PLATFORM resources; manages CR/Co-CR |
| `STUDENT` | Uploads COLLEGE resources; may be elevated to CR/Co-CR via `CrCoCrAssignment` |
| `TEACHER` | Uploads COLLEGE or PLATFORM; requires Sub Admin verification first |

CR / Co-CR is **not a base role** — it is a Student account with an active `CrCoCrAssignment`. The backend always returns `role: "STUDENT"` for them; the frontend must check for an active assignment to show elevated UI.

Guest = unauthenticated. No User row.

---

## Resource state machine (from spec §5.1)

```
Upload → PENDING → IN_REVIEW → APPROVED → SUPERSEDED (when v2 approved)
                             → REJECTED  → PENDING (re-submit)
         PENDING → DELETED   (self-cancel, before IN_REVIEW)
         IN_REVIEW + deletionFlag → DELETED (moderator approves deletion)
         APPROVED → DELETION_REQUESTED → DELETED / APPROVED (denied, logged)
         APPROVED/DELETION_REQUESTED → IN_REVIEW (report filed, resource hidden)
```

"In Review (Deletion Flagged)" = `state: IN_REVIEW` + `deletionFlag: true` — not a separate state.  
"Deletion Denied" = `DeletionRequest.status: DENIED` — not a separate state, a logged outcome.

---

## Key business rules to never break

1. Students always upload at `visibility = COLLEGE`. They cannot set PLATFORM.
2. Teachers route to **Sub Admin queue**, never to CR queue, regardless of visibility.
3. Platform Admin uploads skip Pending entirely → created `APPROVED`.
4. Structural metadata edits (courseId/departmentId change) → resource returns to `PENDING` and any outstanding promotion recommendation is immediately invalidated.
5. Path A promotion (student resource): CR recommends → Sub Admin approves/denies.
6. Path B promotion (teacher resource): Sub Admin promotes directly, no recommendation step, **no notification to teacher**.
7. CR/Co-CR scope: moderation authority only over their own Department + Session. Outside that, they are a regular Student.
8. Content hash dedup: multiple resource records can share the same physical file. Actions on one record never affect any other record.
9. Notification for "Promoted resource later rejected on re-review": Path A notifies uploader + CR/Co-CR who recommended + Sub Admin who approved. Path B notifies Sub Admin only (not the teacher uploader).

---

## What's done vs. what remains

See `docs/complete.md` for what has been built.  
See `docs/remains.md` for the ordered build plan.
