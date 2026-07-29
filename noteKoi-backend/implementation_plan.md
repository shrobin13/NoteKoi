# noteKoi Backend — Implementation Plan (Phase 1)

## Overview

Building a full Express.js + TypeScript + PostgreSQL (Prisma ORM) + Zod backend for the College Resource & Academic Collaboration Platform. Phase 1 covers: Auth + college binding, hierarchy CRUD, admin/CR assignment, verification flow, Resource CRUD, and public browsing.

The project already has:
- `package.json` with `express`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`
- `prisma/schema.prisma` — fully defined schema (source of truth)
- `tsconfig.json` — ESM NodeNext modules
- `src/config/index.ts` — partial env config stub
- `.env` — DATABASE_URL, JWT secrets, bcrypt config populated

Missing dependencies to install: `zod`, `jsonwebtoken`, `bcrypt`, `cors`, `helmet`, `express-rate-limit`, `@types/bcrypt`, `@types/jsonwebtoken`, `@types/cors`, `tsx` (dev runner), `nodemon`

---

## Architecture

```
src/
├── config/           # env validation (Zod), env.ts
├── lib/              # prisma client singleton, logger
├── middlewares/      # auth, role, scope, validate, errorHandler, rateLimiter
├── modules/
│   ├── auth/         # register, login, refresh, logout
│   ├── users/        # profile CRUD
│   ├── hierarchy/    # college, department, semester, course, session, classroomUnit
│   ├── admin/        # owner-admin & sub-admin management
│   ├── cr/           # CR assignment & management
│   ├── verification/ # student verification flow
│   └── resources/    # resource CRUD + public browsing
├── types/            # global types, express augmentation
└── app.ts / server.ts
```

Each module follows: `module.router.ts` → `module.controller.ts` → `module.service.ts` → `module.schema.ts` (Zod)

---

## Key Design Decisions

### Middleware Stack (4-layer per ai-context.md §6)
1. `validate(schema)` — Zod DTO validation before DB touch
2. `authenticate` — JWT verify + attach `req.user`; check `verificationStatus === VERIFIED` where required
3. `requireRole(...roles)` — role-level check from auth matrix
4. `requireScope(type)` — classroomUnit/college scope verification via DB join

### Hard Invariants (enforced via transaction + partial unique index)
- INV-001: One OWNER_ADMIN active platform-wide
- INV-002: One SUB_ADMIN active per college
- INV-003: Max 2 CR seats per ClassroomUnit (1 MAIN + 1 CO)
- INV-007: Max 1 course-linked DiscussionGroup per course

### Auth Flow
- Access token: 15m JWT (HS256)
- Refresh token: 7d JWT stored in HTTP-only cookie
- Refresh token rotation on each use

---

## Proposed Changes

### 1. Dependencies

Install via `pnpm`:
- `zod`, `jsonwebtoken`, `bcrypt`, `cors`, `helmet`, `express-rate-limit`
- Dev: `@types/jsonwebtoken`, `@types/bcrypt`, `@types/cors`, `tsx`, `nodemon`

Update `package.json` scripts: `dev`, `build`, `start`

---

### 2. Config & Infrastructure

#### [MODIFY] [index.ts](file:///home/light/Desktop/working/noteKoi/noteKoi-backend/src/config/index.ts)
Full env validation using Zod `.parse()` — fail-fast at startup.

#### [NEW] src/config/env.ts
Zod schema for all env vars with type-safe exports.

#### [NEW] src/lib/prisma.ts
Prisma singleton with `@prisma/adapter-pg` + PgPool.

#### [NEW] src/lib/logger.ts
Simple console logger with timestamps and levels.

---

### 3. Types

#### [NEW] src/types/express.d.ts
Augment `Request` with `user: { id, role, verificationStatus, collegeId, classroomUnitId }`.

#### [NEW] src/types/index.ts
Shared response types, ApiError class.

---

### 4. Middlewares

#### [NEW] src/middlewares/validate.ts
Generic Zod middleware factory: `validate(schema)` — validates `req.body`, `req.params`, `req.query`.

#### [NEW] src/middlewares/authenticate.ts
- Verifies Bearer JWT access token
- Attaches decoded payload to `req.user`
- Optional `requireVerified` flag for private endpoints (INV-005)

#### [NEW] src/middlewares/requireRole.ts
- `requireRole(...roles: Role[])` — checks `req.user.role`
- Never branches on CR seat (R-016)

#### [NEW] src/middlewares/requireScope.ts
- `requireScope('classroomUnit')` — verifies user's classroomUnitId matches target
- `requireScope('college')` — verifies user's collegeId matches target
- Resolved via DB join on CRAssignment/AdminAssignment

#### [NEW] src/middlewares/errorHandler.ts
Global error handler: ApiError → structured JSON, Zod/Prisma errors → 400/409.

#### [NEW] src/middlewares/rateLimiter.ts
Rate limiter for auth endpoints.

---

### 5. Auth Module

#### [NEW] src/modules/auth/auth.schema.ts
Zod schemas: `RegisterSchema`, `LoginSchema`, `RefreshSchema`

#### [NEW] src/modules/auth/auth.service.ts
- `register(dto)` — hash password, create User (PENDING), create VerificationRequest, return tokens
- `login(dto)` — verify credentials, issue tokens
- `refresh(token)` — rotate refresh token
- `logout(token)` — invalidate refresh token

#### [NEW] src/modules/auth/auth.controller.ts
Routes: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`

#### [NEW] src/modules/auth/auth.router.ts

---

### 6. Users Module

#### [NEW] src/modules/users/users.schema.ts
Zod: `UpdateProfileSchema`

#### [NEW] src/modules/users/users.service.ts
- `getProfile(userId)` — own profile only
- `updateProfile(userId, dto)` — own fields only (R-050)
- `updateVerificationStatus` — SEPARATE endpoint, admin/CR only

#### [NEW] src/modules/users/users.controller.ts + users.router.ts

---

### 7. Hierarchy Module

#### [NEW] src/modules/hierarchy/
- `colleges` — CRUD (Owner Admin only for create/update/delete; public read)
- `departments` — CRUD (Sub Admin of that college for create/update/delete)
- `semesters` — CRUD (Sub Admin)
- `courses` — CRUD (Sub Admin)
- `sessions` — CRUD (Sub Admin)
- `classroomUnits` — CRUD (Sub Admin; enforces INV-006 unique dept+session pair)

Each has schema, service, controller, router files.

---

### 8. Admin Module

#### [NEW] src/modules/admin/admin.schema.ts + service + controller + router
- `POST /admin/sub-admins` — Owner Admin assigns Sub Admin (INV-001/002 transaction)
- `DELETE /admin/sub-admins/:userId` — Owner Admin demotes Sub Admin
- `POST /admin/transfer-ownership` — atomic ownership transfer (INV-001 transaction, R-004)
- `GET /admin/stats` — platform-wide stats (Owner Admin only, R-006)

---

### 9. CR Module

#### [NEW] src/modules/cr/cr.schema.ts + service + controller + router
- `POST /cr/assign` — Sub Admin (or Owner Admin fallback) assigns CR to ClassroomUnit (INV-003 transaction)
- `DELETE /cr/assign/:userId` — demote CR back to Student
- Seat assignment: MAIN or CO, partial unique index backstop

---

### 10. Verification Module

#### [NEW] src/modules/verification/verification.schema.ts + service + controller + router
- `POST /verification/request` — Student requests verification for ClassroomUnit
- `GET /verification/pending` — CR/Sub Admin/Owner Admin views pending requests (scoped)
- `POST /verification/approve/:requestId` — approve (R-029 fallback order, R-030 idempotency)
- Enforces fallback: CR → Sub Admin (own college) → Owner Admin

---

### 11. Resources Module

#### [NEW] src/modules/resources/resources.schema.ts + service + controller + router
- `GET /resources` — public browsing (visibility=PUBLIC, no auth, DB-level filter R-039)
- `GET /resources/:id` — public/private based on visibility + verificationStatus
- `POST /resources` — CR only (own classroomUnit), scope-checked
- `PATCH /resources/:id` — CR only (own unit)
- `DELETE /resources/:id` — CR only (own unit)
- File metadata only — no binary columns (Google Drive fileId/fileUrl)
- Pagination on list endpoints (R-054)

---

### 12. App Entry Points

#### [NEW] src/app.ts
Express app factory: cors, helmet, json parser, routes mount, error handler.

#### [NEW] src/server.ts
HTTP server start, Prisma connect.

---

## Verification Plan

### Build Check
- `pnpm tsc --noEmit` — TypeScript compilation with zero errors

### Functional Checks (manual curl / Postman)
1. Register → login → get profile
2. Owner Admin assigns Sub Admin → scope check prevents cross-college
3. Sub Admin assigns CR → INV-003 enforced (3rd CR returns 409)
4. Student requests verification → CR approves → status becomes VERIFIED
5. CR uploads resource → Student can read (private, own unit) → public user can't
6. Public resource visible without auth

### Invariant Assertions
- Double-assign Owner Admin returns 409
- Double-assign Sub Admin to same college returns 409
- Third CR seat on same unit returns 409
