# API Engineering Conventions — OpenSchool API

Baseline adopted during Phase 0. Applies to all new endpooints and modules in `apps/api`.
Follow these conventions unless a PR explicitly overrides them.

> **Phase 0 reality check.** Only the following are wired today: global `ValidationPipe`,
> global `api/v1` prefix, helmet, Swagger at `/api/docs`, and the global rate-limit guard
> (`TenantRateLimitGuard`, hardcoded limits — see ENVIRONMENT.md). `AllExceptionsFilter`,
> `CorrelationIdInterceptor`, `TenantGuard`, and `PermissionGuard` exist in `src/common/` but are
> **not registered yet**; their wiring lands in the phases listed in ENVIRONMENT.md. The sections
> below describe the target convention for every new endpoint, not current runtime behavior.

---

## 1. Module layout

One Nest module per domain. Put shared, cross-domain support code under `src/common`.

```
src/
  config/            # typed config factory + env validation (see ENVIRONMENT.md)
  common/
    dto/             # cross-cutting DTOs (pagination, ids)
    exceptions/      # domain exception hierarchy
    filters/         # exception filters (registered globally)
    guards/          # tenant, permission, auth guards
    interceptors/    # correlation-id and other cross-cutting concerns
    decorators/      # @CurrentUser, @TenantId, etc.
  modules/
    <domain>/
      <domain>.module.ts
      <domain>.controller.ts   # HTTP layer only
      <domain>.service.ts      # business logic only
      <domain>.repository.ts   # Prisma access (optional; service may own queries when simple)
      dto/                     # request/response DTOs
      entities/  (optional)    # response mapping types
  queue/             # BullMQ queue definitions/constants
  workers/           # queue consumers
  prisma/            # Prisma service (global)
  cache/             # cache service (Redis)
```

Rules:

- Controllers never import Prisma directly; they call services.
- Services never import `@nestjs/common` HTTP primitives (no `@Res`, no `@Req`) except typed DTOs.
- DTOs are the only input shape accepted by controllers. Do not accept raw `body` objects.
- Repositories (when extracted) are the only layer importing `PrismaService`.

---

## 2. HTTP conventions

### Routes

- Global prefix `api/v1` (set in `main.ts`).
- Plural resource nouns, snake-free: `GET /students`, `POST /students/{id}/actions`.
- Nested only for true ownership (`/students/{id}/enrollments`); otherwise top-level.

### Method mapping

| Method | Purpose | Success |
|--------|---------|---------|
| `GET` list | Collection with pagination meta | `200` |
| `GET` detail | Single resource | `200` |
| `POST` create | Create resource | `201` |
| `PATCH` | Partial update | `200` |
| `PUT` | Full replace (rare) | `200` |
| `DELETE` | Soft delete (`deletedAt`, never physical) | `200` |

### Response envelope

- List responses always use the pagination envelope (see §4).
- Detail responses return the resource directly (no envelope) — the envelope is **not** used for single resources.
- Errors never return business logic in a 2xx body; use proper status codes.

### Idempotency

- `POST` creates are idempotent via a natural unique key or an `Idempotency-Key` header for payable/async operations (finance, job-triggering endpoints). Store the key and replay the stored response.

---

## 3. Validation

- `ValidationPipe` is global: `whitelist`, `forbidNonWhitelisted`, `transform`, `enableImplicitConversion`.
- One class-validator DTO per request body/query. Document with `@ApiProperty` for Swagger.
- Always `@IsUUID()` ids; always explicit `@IsEnum()` for enum fields (never free strings on the wire where an enum exists).
- Query params validated as DTOs too (paginated list DTOs).

---

## 4. Pagination

Standard list query DTO: `page` (default 1), `pageSize`/`limit` (default 20, max 100), `q` (optional search), `sort`/`order`.

Standard response:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

---

## 5. Tenant scoping

- Every table carries `tenantId` (see schema). **Every query must filter by the requesting tenant.**
- Front doors are `TenantGuard`-protected controllers; the guard reads tenant from JWT claims and stores it on the request context.
- Services receive the tenant id via `@TenantId()` decorator or from `RequestContext` — never from a body field.
- Never accept `tenantId` in a request body; it is derived from auth. A body `tenantId` that differs from the JWT tenant is rejected.

---

## 6. Authorization

- Roles: `PLATFORM_ADMIN`, `ORG_ADMIN`, `PRINCIPAL`, `VICE_PRINCIPAL`, `ADMIN`, `BURSAR`, `HR_OFFICER`, `TEACHER`, `STUDENT`, `PARENT`, `LIBRARIAN`, `CLINIC_ADMIN`, `HOSTEL_ADMIN`, `TRANSPORT_MANAGER`, `SUMMER_SCHOOL_DIRECTOR`.
- Route-level: `@UseGuards(JwtAuthGuard, PermissionGuard)` + `@RequirePermission('module:action')`.
- Rely on the `permissions` table (seeded per role). Do not hard-code role arrays in controllers where a permission string exists.
- Unauthorized vs forbidden: 401 (no/invalid token) vs 403 (valid token, insufficient permission). Keep them distinct.

---

## 7. Error handling

- Global `AllExceptionsFilter` returns a stable envelope:

```json
{
  "statusCode": 409,
  "code": "DUPLICATE_RECORD",
  "message": "A student with this admission number already exists",
  "correlationId": "e70a...",
  "timestamp": "2026-09-08T10:00:00Z"
}
```

- Services throw typed domain exceptions (e.g., `NotFoundException`, `ConflictException` with a `code`), never raw Prisma errors to the client.
- Map Prisma `P2002` (unique) to 409, `P2025` (not found) to 404, `P2003` (FK) to 422 — centrally in the filter or repository helper.
- Never leak stack traces or internal values; `debug` mode may include the original message locally only (guarded by `NODE_ENV`).
- Every response includes `correlationId` when available (CorrelationIdInterceptor).

---

## 8. Auditing

- Emit domain events via `EventEmitter2` on state-changing operations: `user.registered`, `fee.paid`, `permission.changed`, etc.
- Audit log entries are written by the event listeners (idempotent, async, never in the request hot path).
- Never log secrets, tokens, or passwords. Log actor id, tenant id, entity id, action, and new state summary.

---

## 9. Background jobs

- All asynchronous/slow work goes through BullMQ queues defined in `src/queue/queue.constants.ts` (`QUEUE_NAMES`, `JOB_TYPES`).
- Workers live in `src/workers/`. Add job = enqueue + worker handler + idempotency key when the job can be re-run.
- Jobs carry `tenantId` and `actorId` so workers can scope and audit correctly.

---

## 10. Optimistic / causal data

- All updates modify `updatedAt` (Prisma `@updatedAt`).
- Soft-deleted rows keep `deletedAt`; list queries default `WHERE deletedAt IS NULL` (unless a dedicated admin/restore endpoint).
- Never hard-delete user, financial, or audit data.

---

## 11. Style

- TypeScript strict; `readonly` where possible; no `any` (use `unknown` + narrowing).
- Barrel `index.ts` on shared folders.
- Functions named as verbs; services named `<Domain>Service`, repositories `<Domain>Repository`, DTOs `<Verb><Resource>Dto` (e.g., `CreateStudentDto`).
- Use the `@Api*` decorators (swagger) on controllers for a complete, browsable spec at `/api/docs`.
- Tests mirror module folders: `<domain>.controller.spec.ts`, `<domain>.service.spec.ts` (unit) and `<domain>.e2e-spec.ts` (integration), under `apps/api/test/`.

---

## 12. Definition of "done" for a new endpoint

1. DTO validation complete.
2. Route registered with `JwtAuthGuard` + tenant scope.
3. Permission guard applied (unless PUBLIC).
4. Error handling: typed exceptions for all failure paths.
5. Domain event emitted for state changes.
6. Pagination envelope on list endpoints.
7. Swagger docs render at `/api/docs`.
8. Unit test (service) + integration test (e2e) passing.
9. No `.env` / secrets added; config via `ConfigService` only.