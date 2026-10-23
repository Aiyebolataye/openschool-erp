# OpenSchool ERP — Current-State Audit

> Generated 2026-09-08. Baseline for master roadmap planning.

---

## 1. Executive Summary

OpenSchool ERP is a multi-tenant educational institution platform built as a pnpm monorepo (`apps/web`, `apps/api`, `packages/*`). **Version 1 is approximately 15–20% implemented**. The frontend is a complete UI mock with 14 role-based dashboards plus a platform-admin panel. The backend has authentication, a full Prisma schema, and local Docker infrastructure — but no domain API modules beyond auth. Engineering specs are fully frozen for all 10 V1 domains.

---

## 2. Repository & Tooling

| Aspect | Status |
|--------|--------|
| Repo | `C:\Users\USER\Documents\SMS` — git initialized, 4 commits |
| Monorepo | pnpm 9 workspaces (`apps/*`, `packages/*`) |
| Node | Requires ≥ 22.0.0 |
| Node version manager | Not detected; no `.nvmrc` |
| Git status | 86 modified/untracked files; `apps/api/`, `docker-compose.yml`, docx, and ~15 web pages uncommitted |
| Branches | Default (no feature branches) |
| CI/CD | None |
| Packages | `packages/*` is empty (placeholder only) |

---

## 3. Documentation State

### 3a. Architecture (6 documents — `architecture/`)

| Doc | Size | Status |
|-----|------|--------|
| 01 System Architecture | ~101 KB | Frozen |
| 02 Database Architecture | ~51 KB | Frozen |
| 03 Implementation Roadmap | ~44 KB | Frozen |
| 04 Architecture Freeze | ~40 KB | Frozen |
| 05 Implementation Playbook | ~43 KB | Frozen |
| 06 Throughput & Performance | ~17 KB | Review (additive over frozen baseline) |

Total: ~308 KB of frozen baseline architecture + performance design.

### 3b. Engineering Specs (10 domains — `engineering/`)

All 10 V1 domains approved & frozen (Phases P1–P7):

| Domain | File | ~Lines | ADRs |
|--------|------|--------|------|
| Identity & Access | Identity & Access Engineering.md | 919 | 30 |
| Institution Management | Institution Management Engineering.md | 1,112 | 30 |
| People | People Engineering.md | 1,433 | 44 |
| Academic Management | Academic Management Engineering.md | 1,600 | 35 |
| Finance | Finance Engineering.md | 1,495 | 35 |
| Communication | Communication Engineering.md | 2,531 | 35 |
| Operations | Operations Engineering.md | 2,279 | 35 |
| Documents & Learning | Documents & Learning Engineering.md | 1,693 | 35 |
| Reporting & Analytics | Reporting & Analytics Engineering.md | 1,616 | 35 |
| Platform Administration | Platform Administration Engineering.md | 3,159 | 35 |

Also present: `ROADMAP.md` (V1–V4 phased plan), `00 README.md`, per-domain `.prisma` snippets.

### 3c. Governance (`governance/`)
- Documentation Constitution.md
- Documentation Dependency Map.md

### 3d. Product Documentation (`Product Documentation/`)
Not inventoried in detail this pass; present but not audited for completeness.

### 3e. UI/UX (`ui-ux/`)
Not inventoried in detail; present as reference docs.

### 3f. Platform Standards (`platform standards/`)
Present but not inventoried in detail.

---

## 4. Frontend (`apps/web`)

### 4a. Stack

| Layer | Detail |
|-------|--------|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19, Tailwind 4, Radix UI primitives |
| State | `app-store.ts` (local, not wired) |
| API client | **None** — zero fetch/axios calls |
| Auth on client | **None** — no login page, no token storage, no session handling |
| Tests | **None** |

### 4b. Pages Built

**156 page files** across 16 portals/sections (all static with hardcoded demo data):

| Portal | Pages | Role Target |
|--------|-------|-------------|
| `(platform)/` | 18 pages | Platform admin (orgs, users, roles, billing, subscriptions, modules, support, system-health, developer, etc.) |
| `institution/` | 29 pages | Institution admin (students, staff, academics, finance, operations, communications, reports, settings, etc.) |
| `principal/` | 15 pages | Principal (academics, staff, students, attendance, results, reports, etc.) |
| `teacher/` | 15 pages | Teacher (attendance, assignments, assessments, lesson-notes, subjects, timetable, etc.) |
| `student/` | 8 pages | Student (assignments, attendance, messages, results, timetable, etc.) |
| `parent/` | 8 pages | Parent (children, fees, results, calendar, messages, etc.) |
| `bursar/` | 7 pages | Bursar (fees, invoices, payments, expenses, communications) |
| `librarian/` | 7 pages | Librarian (catalogue, loans, overdue, add-book, communications) |
| `hostel-admin/` | 7 pages | Hostel admin (rooms, boarders, attendance, incidents, communications) |
| `clinic-admin/` | 7 pages | Clinic admin (visits, medications, immunizations, referrals, communications) |
| `transport-manager/` | 7 pages | Transport (routes, vehicles, drivers, trips, communications) |
| `hr-officer/` | 7 pages | HR (staff, leave, payroll, recruitments, communications) |
| `student-management/` | 7 pages | Student management (students, achievements, certificates, reviews, communications) |
| `org-admin/` | 14 pages | Org/集团 admin (institutions, finance, staff, announcements, surveys, templates, etc.) |

**Shared UI components**: button, card, badge, modal, data-table, form, KPI card, stat card, pagination, search-input, tabs, chatbox, page-header, select, sidebar, top-nav, workspace-layout, page-layout.

### 4c. Key Observations
- `PasswordPrefix` in `institution/staff/page.tsx` provides a default-password reference for UI walkthroughs.
- Every page is a pure UI mock — no data binding, no loading states, no error states, no form submissions.
- `next.config.ts` present but no `rewrites` to proxy API calls.
- `postcss.config.mjs` and Tailwind 4 config present.

---

## 5. Backend (`apps/api`)

### 5a. Stack

| Layer | Detail |
|-------|--------|
| Framework | NestJS 10 (modular monolith) |
| ORM | Prisma 6.19.3 (pinned — Prisma 7 incompatible) |
| Auth | Passport + JWT (HS256), bcrypt 10 rounds |
| Cache | ioredis 5.6.1 (pinned) |
| Queue | BullMQ 5.30+ |
| Validation | class-validator + global ValidationPipe (whitelist, forbidNonWhitelisted) |
| API docs | Swagger/OpenAPI (`/api/docs`) |
| Security | Helmet (defaults only) |
| Logging | nestjs-pino + winston listed as deps but **NOT configured or wired** |

### 5b. Prisma Schema

| Metric | Count |
|--------|-------|
| Domain source files | 10 (`prisma/domains/`) |
| Merge script | `scripts/merge-schemas.mjs` |
| Generated `schema.prisma` | `prisma/schema.prisma` |
| Models | 52 |
| Enums | 14 |
| Migration | `20260908180041_init` — applied |
| Database | PostgreSQL 16 (Docker, port 5433) |

Coverage by domain: identity, institution, people, academic, finance, communication, operations, documents, analytics, platform — all have models in the merged schema.

### 5c. Seed Data

| Metric | Count |
|--------|-------|
| Tenant | 1 (`greenfield-academy`) |
| Institution | 1 (Demo Academy, code `GA`) |
| Users | 11 (all with real bcrypt hashes, password: `Password@123`) |
| Roles | 13 (11 assigned to users, 2 unused: `INSTITUTION_ADMIN`, `STUDENT`) |
| Staff | 9 (STF-001 → STF-0009) |
| Students | 5 (STU-21401, STU-21411, STU-21402, STU-21403, STU-21404) |
| Guardians | 1 (Mr Eze, linked to Chidi + Kayode) |
| Departments | 5 |
| Academic year | 1 (2025/2026) |
| Terms | 3 |
| Curriculum | 1 |
| Subjects | 13 |
| Classes | 2 |
| Enrollments | 5 |
| Fee structures | 3 |
| Invoices | 6 |
| Transport | 1 route, 1 vehicle |
| Hostels | 1 (Red House), 1 allocation |
| Library | 1 book, 1 loan |

### 5d. What Is Built & Working

| Component | Files | Status |
|-----------|-------|--------|
| **Auth module** (login, register, refresh, me) | `modules/auth/*` (7 files) | ✅ Builds, typechecks, smoke-tested (login + me + tenant-aware guard verified) |
| Health endpoint | `health/*` (2 files) | ✅ `GET /api/v1/health` — reports DB up |
| CacheService (Redis, tag invalidation) | `cache/*` (2 files) | ✅ Builds; used by AuthService session storage |
| QueueService (BullMQ) | `queue/*` (2 files) | ✅ Builds; `addJob` + `createWorker` working |
| PaymentWorker (stub) | `workers/*` (2 files) | ✅ Builds; only logs received jobs, no real logic |
| CorrelationIdInterceptor | `common/interceptors/` | ⚠️ Builds but **NOT registered** globally in `main.ts` |
| AllExceptionsFilter | `common/filters/` | ⚠️ Builds but **NOT registered** globally in `main.ts` |
| TenantGuard | `common/guards/tenant.guard.ts` | ⚠️ Builds but NOT applied to any route (only `TenantAwareJwtGuard` in auth service uses it) |
| PermissionGuard | `common/guards/permission.guard.ts` | ⚠️ Builds but NOT applied to any route; `permissions` table is empty |
| TenantRateLimitGuard | `rate-limit/*` (2 files) | ⚠️ Builds but NOT applied to any route (including login) |
| PrismaService + PrismaModule | `prisma/*` (2 files) | ✅ Works — injected into AuthService |

### 5e. What Is NOT Built

**Zero domain API modules exist.** Only `modules/auth/` is present. Missing:
- People (students, staff, guardians CRUD)
- Institution management
- Academic (classes, attendance, grades, results, assignments, timetable)
- Finance (invoices, fee structures, payments, expenses)
- Operations (hostels, transport, library, clinic, inventory, visitors, maintenance)
- Communication (notifications, campaigns, chat, SMS, email)
- Documents & Learning (S3 uploads, templates, learning resources)
- Reporting & Analytics (dashboards, KPIs, reports, exports)
- Platform Administration (tenant lifecycle, subscriptions, feature flags, webhooks, audit)

### 5f. Auth Gaps Identified

| Gap | Detail |
|-----|--------|
| Public self-register with arbitrary role | `POST /auth/register` accepts any `roleName`, including `PLATFORM_ADMIN` |
| No login rate limiting | `TenantRateLimitGuard` not applied to login or globally |
| No lockout mechanism | No failed-attempt tracking, no account lock |
| `cors: true` in `main.ts` | Allows any origin — open CORS in dev and production alike |
| Hardcoded JWT fallback | `config.get('jwt.secret', 'change-me')` — silent fallback if env missing |
| Single-session per user | Redis key `session:{userId}` overwritten on each login; no multi-device |
| Refresh token not stored in DB session row | Session `token` column written but not checked against |
| `sessions` table never cleaned | `expiresAt` column exists but no TTL enforcement or cron cleanup |
| `/auth/me` returns raw JWT payload | No user profile enrichment (name, email, permissions) |

---

## 6. Database & Infrastructure

### 6a. Docker Stack (`docker-compose.yml`)

| Service | Image | Port (host) | Status |
|---------|-------|-------------|--------|
| PostgreSQL | postgres:16-alpine | **5433** (remapped from 5432 — native Windows Postgres on 5432) | ✅ Healthy |
| Redis | redis:7-alpine | 6379 | ✅ Healthy |
| MinIO | minio/minio:latest | 9000 (API), 9001 (console) | ✅ Healthy |
| MinIO bucket init | minio/mc:latest | — | ✅ `openschool-dev` bucket created |

### 6b. What's Running vs. What's Configured

| Infra | Running | Used by app |
|-------|---------|-------------|
| Postgres | ✅ | ✅ Prisma migrations + seed |
| Redis | ✅ | ✅ CacheService, QueueService, Session storage |
| MinIO (S3) | ✅ | ❌ No S3 client service in the app |
| Native Windows Postgres | ⚠️ Running on 5432 | Conflict — reason Docker Postgres remapped to 5433 |

### 6c. What's Missing for Production Deployment

- No Dockerfile for `apps/api`
- No Nginx/reverse proxy / TLS termination
- No staging vs. production environment split
- No DB backup/restore strategy
- No secret management (Vault, AWS Secrets Manager, etc.)
- No log aggregation / centralized logging
- No health check orchestration for deployed environments
- `NODE_ENV` not enforced; Swagger UI always exposed

---

## 7. Security Posture Summary

| Area | Status |
|------|--------|
| Password hashing | ✅ bcrypt, cost 10 |
| Password strength validation | ✅ `IsStrongPassword`, min 8 |
| JWT signing | ✅ HS256, expiry enforced |
| Refresh token flow | ⚠️ Works, but single-session only |
| Tenant isolation guard | ⚠️ Exists but not applied to domain routes |
| Permission guard | ⚠️ Exists but permissions table empty; not applied |
| Rate limiting | ⚠️ Guard exists, not wired |
| Helmet | ✅ Defaults only (no CSP tuning) |
| Input validation | ✅ Global pipe whitelist + forbidNonWhitelisted |
| CORS | ❌ `cors: true` — open to all origins |
| Swagger exposure | ⚠️ Always on (should be dev-only) |
| API key / webhook auth | ❌ Not implemented |
| Data-at-rest encryption | ❌ Not configured |
| Audit logging | ⚠️ `audit_logs` table exists in schema, not written to |

---

## 8. Testing

| Area | Status |
|------|--------|
| API unit tests | ❌ None (jest configured, no `.spec.ts` files) |
| API e2e tests | ❌ None (`test/jest-e2e.json` not created) |
| Web unit tests | ❌ None |
| Web component tests | ❌ None |
| Integration tests | ❌ None |
| CI pipeline | ❌ None |

---

## 9. Git & Version Control

| Aspect | Detail |
|--------|--------|
| Total commits | 4 |
| Commit messages | Informal (feat: ...); no conventional-commits enforcement |
| Uncommitted files | 86 (entire `apps/api/`, `docker-compose.yml`, 15+ web pages, architecture/06, docx) |
| Branches | Default only (no `main`/`develop` branch strategy) |
| .gitignore | Minimal — does not cover `.env`, `dist/`, `.next/`, `*.log`, etc. (currently works because those files haven't been added) |
| Pre-commit hooks | None |

---

## 10. Overall Progress Matrix

| Layer | Design/Docs | Frontend UI | Backend Code | Infra | Tests | Production Ready |
|-------|-------------|-------------|--------------|-------|-------|------------------|
| Identity & Auth | ✅ Frozen | ⚠️ No login page | ⚠️ Auth only, gaps | ✅ Docker | ❌ | ❌ |
| Institution Mgmt | ✅ Frozen | ✅ 29 pages | ❌ | — | ❌ | ❌ |
| People | ✅ Frozen | ✅ Within portals | ❌ | — | ❌ | ❌ |
| Academic | ✅ Frozen | ✅ 38+ pages (teacher/principal/student) | ❌ | — | ❌ | ❌ |
| Finance | ✅ Frozen | ✅ 14+ pages (bursar/institution/parent) | ❌ | — | ❌ | ❌ |
| Communication | ✅ Frozen | ✅ "communication" page in every portal | ❌ | — | ❌ | ❌ |
| Operations | ✅ Frozen | ✅ 28+ pages (hostel/clinic/transport/librarian) | ❌ | — | ❌ | ❌ |
| Documents & Learning | ✅ Frozen | ✅ Within portals | ❌ | ❌ No S3 client | ❌ | ❌ |
| Reporting & Analytics | ✅ Frozen | ✅ Within portals | ❌ | — | ❌ | ❌ |
| Platform Admin | ✅ Frozen | ✅ 18 pages | ❌ | — | ❌ | ❌ |

---

## 11. Summary: What Exists Today

**Ready and working:**
- Frozen architecture + engineering specs for all 10 V1 domains
- Full Prisma schema (52 models, 14 enums) across 10 domain files, merged and applied
- Rich seed data (Demo Academy: 11 users, 9 staff, 5 students, full term structure)
- Docker local dev stack (Postgres, Redis, MinIO) — all healthy
- Auth module: login, register, refresh, `/auth/me` — functional with JWT + bcrypt
- BullMQ queue infrastructure + stub payment worker
- 14 role-based portals + platform admin panel (156 static mock pages, Tailwind + Radix UI)
- Shared component library (UI primitives)

**Exists but not wired:**
- `CorrelationIdInterceptor` — not globally registered
- `AllExceptionsFilter` — not globally registered
- `TenantRateLimitGuard` — exists, applied nowhere
- `TenantGuard` + `PermissionGuard` — exist, applied nowhere; permissions table empty
- nestjs-pino / winston — listed in deps, not configured
- Swagger — always on, should be dev-only
- Redis env vars configured but `cors: true` reflects all origins

**Does not exist:**
- All 9 remaining domain API modules (~50+ controllers, ~100+ services)
- Email / SMS / Push notification delivery (no mailer, no SMS provider, no consumers)
- Payment gateway integration (Paystack keys empty, no webhook controller)
- S3 client service / document upload endpoints
- Multi-tenant isolation middleware (global)
- Login brute-force protection
- Auth audit logging
- Session cleanup / TTL enforcement
- Rate limiting on any endpoint
- Any test file
- API Dockerfile / CI/CD / deployment config
- Frontend API client / auth flow / login page
- `.env` not committed (correct); `.gitignore` insufficient for production safeguards
