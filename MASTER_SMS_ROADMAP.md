# MASTER SMS ROADMAP

**Project:** OpenSchool ERP / School Management System (SMS)  
**Baseline:** `CURRENT-STATE-AUDIT.md` generated 2026-09-08  
**Roadmap purpose:** Single source of truth for completing V1 from the audited current state to production readiness.

---

# 0. How This Roadmap Is Used

This roadmap is intentionally **phase-gated**.

OpenCode must not decide the next phase independently.

For every phase:

1. Read this roadmap.
2. Implement only the current phase.
3. Run the required verification.
4. Produce the required completion report.
5. Stop.
6. The implementation is reviewed before the next phase begins.
7. If fixes are required, complete the fixes and re-run the phase gate.
8. Only after approval should the next phase begin.

### Status meanings

- `⬜ NOT STARTED`
- `🟡 IN PROGRESS`
- `🟠 READY FOR REVIEW`
- `🔴 BLOCKED / FIXES REQUIRED`
- `🟢 APPROVED`

---

# 1. Current Baseline

The current-state audit establishes that V1 is approximately **15–20% implemented**.

The repository is a pnpm monorepo with:

- `apps/web`
- `apps/api`
- `packages/*` currently empty

The frontend contains 156 static/mock pages across the portals. The backend currently has authentication plus infrastructure foundations, but no domain API modules beyond auth.

The database foundation is substantially ahead of the application layer:

- PostgreSQL 16
- Prisma 6.19.3
- 52 models
- 14 enums
- 10 domain schema sources
- applied initial migration
- seed data for Demo Academy

Local infrastructure currently includes:

- PostgreSQL
- Redis
- MinIO

The audit explicitly identifies the following as currently missing or incomplete:

- all remaining domain API modules
- email/SMS/push delivery
- real payment gateway integration
- S3/document service
- effective multi-tenant enforcement
- login brute-force protection
- auth audit logging
- session cleanup/TTL enforcement
- tests
- API Dockerfile
- CI/CD
- frontend API client/auth integration
- production deployment controls

Source: `CURRENT-STATE-AUDIT.md`.

---

# 2. Roadmap Principles

## 2.1 Repository is the implementation source of truth

Architecture and engineering documents define intended behavior. The actual repository determines what is currently implemented.

If documentation and code disagree:

1. identify the discrepancy;
2. do not silently resolve it;
3. record it;
4. stop if it affects architecture/security;
5. obtain review before making a potentially architectural change.

## 2.2 Security precedes scale

Do not build a large collection of domain APIs around authorization and tenant boundaries that have not been proven.

## 2.3 Every domain must follow common backend patterns

New modules must use the approved conventions established in the foundational phases for:

- authentication
- authorization
- tenant scoping
- validation
- transactions
- errors
- pagination
- auditability
- logging
- idempotency where applicable
- testing

## 2.4 Never trust the frontend for security

Hidden buttons, routes, role-specific pages, or client-side checks are not authorization.

Authorization must be enforced server-side.

## 2.5 Financial operations require stronger correctness guarantees

Payments, invoices, balances, receipts, reconciliation, and related operations require:

- transactional correctness
- authorization
- idempotency
- duplicate protection
- auditable state changes
- verified external events
- failure/retry handling

## 2.6 Tests are part of implementation

A feature is not complete merely because its code exists.

A phase is complete only when its required tests and verification pass.

---

# 3. Master Progress Tracker

| Phase | Name | Status | Review |
|---|---|---|---|
| 0 | Baseline, Repository Hygiene & Engineering Foundation | ⬜ | — |
| 1 | Authentication & Security Hardening | ⬜ | — |
| 2 | RBAC, Authorization & Multi-Tenant Isolation | ⬜ | — |
| 3 | Backend Reliability, Observability & Shared Infrastructure | ⬜ | — |
| 4 | Institution Management & People | ⬜ | — |
| 5 | Academic Management | ⬜ | — |
| 6 | Finance & Paystack | ⬜ | — |
| 7 | Operations | ⬜ | — |
| 8 | Documents & Learning | ⬜ | — |
| 9 | Communication: Notifications, Email, SMS, Push & Chat | ⬜ | — |
| 10 | Reporting & Analytics | ⬜ | — |
| 11 | Frontend API Integration | ⬜ | — |
| 12 | Full Integration, E2E, Reliability & Performance | ⬜ | — |
| 13 | Production Infrastructure & Operations | ⬜ | — |
| 14 | Final Security & Production Readiness Audit | ⬜ | — |

---

# PHASE 0 — BASELINE, REPOSITORY HYGIENE & ENGINEERING FOUNDATION

## Objective

Establish a controlled development foundation before implementing the remaining backend domains.

This phase should make the repository predictable, testable, configurable, and safe to extend.

## Dependencies

None.

## P0.1 Repository inventory

- [ ] Verify the actual monorepo structure.
- [ ] Inventory `apps/api`.
- [ ] Inventory `apps/web`.
- [ ] Inventory Prisma/domain schema sources.
- [ ] Inventory architecture and engineering specifications.
- [ ] Inventory environment/configuration files.
- [ ] Inventory Docker configuration.
- [ ] Inventory scripts.
- [ ] Inventory existing auth/infrastructure code.
- [ ] Identify generated files.
- [ ] Identify development-only files.
- [ ] Identify temporary/mock implementations.
- [ ] Identify all uncommitted work.

## P0.2 Git hygiene

- [ ] Review the current 86 modified/untracked files.
- [ ] Separate intentional source changes from generated artifacts.
- [ ] Strengthen `.gitignore`.
- [ ] Ensure `.env` and secret-bearing files are ignored.
- [ ] Ensure build output is ignored.
- [ ] Ensure Next.js output is ignored.
- [ ] Ensure logs are ignored.
- [ ] Establish a safe branch strategy.
- [ ] Do not delete existing work without verification.

## P0.3 Environment/configuration foundation

- [ ] Inventory every environment variable currently referenced.
- [ ] Categorize variables by development/staging/production.
- [ ] Establish a typed/central configuration access pattern.
- [ ] Identify required variables.
- [ ] Identify optional variables.
- [ ] Ensure missing critical configuration can be detected.
- [ ] Remove unsafe configuration fallbacks where identified by the audit.
- [ ] Do not expose secret values in logs or reports.

## P0.4 API engineering conventions

Define and document reusable conventions for:

- [ ] controller structure
- [ ] service structure
- [ ] DTOs
- [ ] validation
- [ ] response shape
- [ ] error handling
- [ ] pagination
- [ ] filtering
- [ ] sorting
- [ ] Prisma access
- [ ] transactions
- [ ] tenant scoping
- [ ] authorization
- [ ] audit events
- [ ] background jobs
- [ ] idempotency

These conventions must be compatible with the frozen engineering specifications.

## P0.5 Testing foundation

Create the foundation required for subsequent phases:

- [ ] Jest API configuration.
- [ ] Supertest/API test configuration.
- [ ] Test environment.
- [ ] Test database strategy.
- [ ] Test setup/teardown.
- [ ] Test data factories/fixtures.
- [ ] Authenticated-request helper.
- [ ] Tenant creation helper.
- [ ] Role/permission test helper.
- [ ] Database cleanup/reset strategy.
- [ ] At least one verified API integration test.

## P0.6 Build verification

- [ ] API build passes.
- [ ] API typecheck passes.
- [ ] Web build/typecheck passes where currently applicable.
- [ ] Prisma generation works.
- [ ] Prisma migration state is understood.
- [ ] Existing auth smoke flow still works.
- [ ] Docker development stack still starts.

## Out of scope

- Domain APIs.
- SMS/email/push providers.
- Paystack implementation.
- Frontend API integration.
- Major schema redesign.

## Phase 0 acceptance gate

- [ ] Repository state is documented.
- [ ] Environment configuration has an explicit contract.
- [ ] Test infrastructure can execute a real API test.
- [ ] Engineering conventions are documented.
- [ ] Existing working functionality has no unexplained regression.
- [ ] Build/typecheck/Prisma checks pass.

---

# PHASE 1 — AUTHENTICATION & SECURITY HARDENING

## Objective

Make authentication safe enough to serve as the foundation for every subsequent API.

## P1.1 Registration security

- [ ] Remove unrestricted client-selected role registration.
- [ ] Prevent public creation of privileged platform roles.
- [ ] Define which roles may self-register, if any, according to the frozen Identity & Access specification.
- [ ] Enforce server-side role assignment rules.
- [ ] Validate all registration input.
- [ ] Verify email/identity requirements defined by the specification.
- [ ] Ensure registration cannot bypass tenant boundaries.

## P1.2 Login protection

- [ ] Apply rate limiting to login.
- [ ] Add failed-attempt tracking.
- [ ] Define account lockout/temporary lock behavior according to the specification.
- [ ] Prevent brute-force abuse.
- [ ] Avoid leaking whether an account exists through error behavior where applicable.
- [ ] Test repeated failed login attempts.

## P1.3 JWT configuration

- [ ] Remove `change-me` fallback.
- [ ] Require production JWT configuration.
- [ ] Validate JWT configuration at startup.
- [ ] Confirm signing/verification behavior.
- [ ] Confirm access-token expiry.
- [ ] Confirm refresh-token expiry.
- [ ] Ensure secrets are not logged.

## P1.4 Sessions/refresh tokens

The audit identifies that Redis currently stores a single session per user and the DB session row is not actually enforced.

- [ ] Define the intended multi-device session model from the Identity specification.
- [ ] Implement secure refresh-token/session validation.
- [ ] Ensure revoked/expired sessions cannot refresh.
- [ ] Ensure session DB state and Redis state cannot silently diverge.
- [ ] Implement session expiry cleanup.
- [ ] Implement logout/revocation.
- [ ] Test expired sessions.
- [ ] Test revoked sessions.
- [ ] Test multiple sessions/devices if required by the specification.

## P1.5 CORS and HTTP security

- [ ] Replace `cors: true` with explicit allowed origins.
- [ ] Separate development/staging/production origins.
- [ ] Review Helmet configuration.
- [ ] Define production security headers.
- [ ] Add request-size limits.
- [ ] Review HTTP method behavior.
- [ ] Confirm production error responses do not leak internals.

## P1.6 Swagger/API documentation exposure

- [ ] Keep Swagger available for development.
- [ ] Restrict or disable Swagger in production according to deployment policy.
- [ ] Avoid exposing sensitive schemas or credentials.

## P1.7 Authentication audit logging

- [ ] Define auth audit events.
- [ ] Record security-relevant authentication events.
- [ ] Avoid logging passwords/tokens.
- [ ] Ensure audit records are tenant-aware where applicable.

## Phase 1 security gate

Required before Phase 2:

- [ ] Privileged roles cannot be self-created.
- [ ] Login rate limiting works.
- [ ] Brute-force protections work.
- [ ] JWT secret cannot silently fall back.
- [ ] Session/refresh validation is enforced.
- [ ] Session expiry/revocation works.
- [ ] CORS is restricted.
- [ ] Request-size limits exist.
- [ ] Security tests pass.
- [ ] No authentication regression.

---

# PHASE 2 — RBAC, AUTHORIZATION & MULTI-TENANT ISOLATION

## Objective

Build and prove the security boundary that all domain APIs will use.

## P2.1 Permission model

- [ ] Extract the authoritative role/permission matrix from the frozen Identity & Access specification.
- [ ] Compare it against the Prisma schema.
- [ ] Seed required permissions.
- [ ] Seed role-permission relationships.
- [ ] Define platform-level vs institution-level permissions.
- [ ] Define role-specific restrictions.
- [ ] Document the resulting matrix.

Do not invent permissions where the specification already defines them.

## P2.2 Permission enforcement

- [ ] Wire PermissionGuard to applicable routes.
- [ ] Ensure authorization is enforced server-side.
- [ ] Ensure service-layer authorization cannot be bypassed by alternate routes.
- [ ] Test allowed actions.
- [ ] Test denied actions.
- [ ] Test horizontal privilege escalation.
- [ ] Test vertical privilege escalation.

## P2.3 Tenant isolation

- [ ] Define the authoritative tenant/institution resolution mechanism.
- [ ] Define tenant-scoped service/repository patterns.
- [ ] Prevent trusting arbitrary tenant IDs from clients.
- [ ] Ensure tenant identity derives from authenticated context and approved platform operations.
- [ ] Apply tenant scoping consistently to database access.
- [ ] Review all existing auth queries for tenant correctness.
- [ ] Define platform-admin exceptions explicitly.

## P2.4 Object-level authorization

For resources such as students, staff, invoices, results, documents and messages:

- [ ] Verify ownership/tenant membership.
- [ ] Verify role permission.
- [ ] Verify resource relationship where required.
- [ ] Prevent IDOR/BOLA.
- [ ] Test guessed IDs from another tenant.
- [ ] Test IDs belonging to another role/user.

## P2.5 Security tests

Create reusable tests proving:

- [ ] School A cannot read School B.
- [ ] School A cannot update School B.
- [ ] School A cannot delete School B.
- [ ] Institution users cannot perform platform-only actions.
- [ ] Users cannot escalate roles.
- [ ] Users cannot modify their own protected authorization fields.
- [ ] Unauthorized resources return safe errors.
- [ ] Direct API calls cannot bypass UI restrictions.

## Phase 2 gate

No domain phase proceeds until tenant isolation and authorization tests pass.

---

# PHASE 3 — BACKEND RELIABILITY, OBSERVABILITY & SHARED INFRASTRUCTURE

## Objective

Wire the backend infrastructure that every domain will depend on.

## P3.1 Global logging

- [ ] Configure the selected structured logger.
- [ ] Wire it globally.
- [ ] Remove/avoid inconsistent logging patterns.
- [ ] Ensure sensitive information is excluded.
- [ ] Include useful request metadata.

## P3.2 Correlation IDs

- [ ] Register `CorrelationIdInterceptor` globally.
- [ ] Confirm every request receives/propagates a correlation ID.
- [ ] Include correlation ID in logs.
- [ ] Preserve it through relevant background jobs where practical.

## P3.3 Global error handling

- [ ] Register `AllExceptionsFilter`.
- [ ] Define safe production error responses.
- [ ] Ensure internal stack traces are not exposed.
- [ ] Ensure unexpected exceptions are logged.
- [ ] Ensure validation errors are consistent.

## P3.4 Rate limiting

- [ ] Wire the rate-limit infrastructure.
- [ ] Define global and endpoint-specific limits.
- [ ] Protect authentication.
- [ ] Protect expensive operations.
- [ ] Protect bulk operations.
- [ ] Ensure rate limiting is tenant/user/IP aware where appropriate.

## P3.5 Queue foundation

- [ ] Review queue names/job types.
- [ ] Define retry policy.
- [ ] Define backoff policy.
- [ ] Define failed-job behavior.
- [ ] Define dead-letter strategy if required.
- [ ] Define idempotency strategy for jobs.
- [ ] Ensure workers shut down cleanly.
- [ ] Ensure worker failures are observable.

## P3.6 Database reliability patterns

- [ ] Document transaction requirements.
- [ ] Define transaction boundaries for multi-record operations.
- [ ] Review important unique constraints.
- [ ] Review foreign keys.
- [ ] Review indexes for expected access patterns.
- [ ] Establish a migration safety process.

## P3.7 Health/readiness

- [ ] Keep the health endpoint.
- [ ] Separate liveness from readiness where needed.
- [ ] Check database connectivity.
- [ ] Check Redis where required.
- [ ] Check queue dependencies where required.
- [ ] Avoid exposing sensitive infrastructure information publicly.

## Phase 3 gate

- [ ] Logs are generated globally.
- [ ] Correlation IDs are present.
- [ ] Exceptions are centrally handled.
- [ ] Rate limiting is active.
- [ ] Queue failure/retry behavior is defined and tested.
- [ ] Health/readiness behavior is verified.

---

# PHASE 4 — INSTITUTION MANAGEMENT & PEOPLE

## Objective

Build the core domain data and APIs that most other modules depend on.

## P4.1 Institution Management

Implement according to the frozen Institution Management Engineering specification:

- [ ] Institution lifecycle.
- [ ] Institution configuration.
- [ ] Institution settings.
- [ ] Institution users/admin relationships.
- [ ] Relevant institution-level configuration.
- [ ] Required platform-admin operations.
- [ ] Required institution-admin operations.

For every operation:

- [ ] authentication
- [ ] authorization
- [ ] tenant enforcement
- [ ] validation
- [ ] audit logging
- [ ] tests

## P4.2 People

Implement according to the frozen People Engineering specification:

- [ ] students
- [ ] staff
- [ ] guardians
- [ ] relationships
- [ ] required profile fields
- [ ] status/lifecycle operations
- [ ] admissions/enrollment functionality specified for V1
- [ ] class/enrollment relationships as defined by the schema/spec

## P4.3 API quality

Every people endpoint must have:

- [ ] DTO validation
- [ ] authorization
- [ ] tenant isolation
- [ ] pagination where collection-sized
- [ ] filtering/search where specified
- [ ] safe response fields
- [ ] consistent errors
- [ ] tests

## P4.4 Critical tests

- [ ] Create/update/read/delete authorization.
- [ ] Cross-tenant access.
- [ ] Duplicate/uniqueness constraints.
- [ ] Invalid relationships.
- [ ] Deactivation/status behavior.
- [ ] Transactional multi-record operations.

## Phase 4 gate

Core institution and people workflows must operate end-to-end through real APIs and pass security tests.

---

# PHASE 5 — ACADEMIC MANAGEMENT

## Objective

Implement the complete academic domain defined by the frozen Academic Management specification.

## P5.1 Academic structure

- [ ] academic sessions
- [ ] terms
- [ ] curriculum structures
- [ ] subjects
- [ ] classes
- [ ] class memberships/enrollments
- [ ] teacher assignments
- [ ] required academic configuration

## P5.2 Attendance

- [ ] attendance creation
- [ ] attendance updates
- [ ] attendance retrieval
- [ ] role-based restrictions
- [ ] tenant scoping
- [ ] reporting inputs
- [ ] duplicate prevention

## P5.3 Assessments and grades

- [ ] assessment setup
- [ ] score entry
- [ ] score validation
- [ ] grade computation
- [ ] appropriate teacher permissions
- [ ] modification rules
- [ ] auditability

## P5.4 Results

- [ ] result computation
- [ ] result approval
- [ ] result publication
- [ ] result visibility
- [ ] report-card data
- [ ] historical result integrity

## P5.5 Assignments and timetable

Implement the V1 specification for:

- [ ] assignments
- [ ] submissions where specified
- [ ] lesson/academic resources where specified
- [ ] timetable
- [ ] teacher/student visibility

## P5.6 Academic Recovery

Implement the approved recovery/summer-school behavior defined in the product/engineering specifications.

Requirements must include preservation of original results and the configured attainable-grade rule.

## P5.7 Academic Probation

Implement the approved probation rules and visibility/workflow from the specification.

## P5.8 Academic integrity tests

- [ ] Teacher cannot modify unauthorized class/subject data.
- [ ] Students cannot modify results.
- [ ] Parents cannot modify academic records.
- [ ] Published results cannot be silently altered.
- [ ] Cross-tenant result access is blocked.
- [ ] Result calculations are deterministic.
- [ ] Concurrent score updates are handled correctly.

## Phase 5 gate

A complete academic lifecycle must work against the real database and pass authorization, tenant, calculation and integrity tests.

---

# PHASE 6 — FINANCE & PAYSTACK

## Objective

Implement finance as a controlled, auditable and idempotent domain.

## P6.1 Finance APIs

Implement the frozen Finance specification:

- [ ] fee structures
- [ ] fee configuration
- [ ] invoices
- [ ] balances
- [ ] payments
- [ ] receipts
- [ ] expenses
- [ ] financial reporting inputs
- [ ] relevant finance administration

## P6.2 Financial correctness

- [ ] Define authoritative financial states.
- [ ] Use database transactions where required.
- [ ] Prevent duplicate payment records.
- [ ] Protect balance calculations.
- [ ] Preserve financial history.
- [ ] Prevent unauthorized mutation.
- [ ] Add financial audit events.

## P6.3 Paystack integration

- [ ] Configure Paystack credentials securely.
- [ ] Implement payment initialization.
- [ ] Implement payment verification.
- [ ] Implement webhook endpoint.
- [ ] Verify webhook signatures.
- [ ] Validate webhook payloads.
- [ ] Implement duplicate-event protection.
- [ ] Implement idempotency.
- [ ] Handle failed/expired payments.
- [ ] Ensure payment state is not trusted from the client.
- [ ] Connect verified payment events to authoritative records.

## P6.4 Reconciliation

- [ ] Design reconciliation workflow.
- [ ] Implement scheduled reconciliation.
- [ ] Detect mismatches.
- [ ] Record reconciliation results.
- [ ] Ensure reconciliation is auditable.

## P6.5 Payment worker

Replace the current logging-only worker with actual safe processing.

- [ ] Define jobs.
- [ ] Implement idempotent processing.
- [ ] Implement retry/backoff.
- [ ] Handle permanent failures.
- [ ] Record failures.
- [ ] Test duplicate jobs.

## P6.6 Finance tests

- [ ] successful payment
- [ ] failed payment
- [ ] duplicate webhook
- [ ] invalid webhook signature
- [ ] repeated verification
- [ ] concurrent payment attempts
- [ ] unauthorized invoice access
- [ ] cross-tenant payment access
- [ ] balance correctness
- [ ] reconciliation mismatch

## Phase 6 gate

No finance feature is production-ready until payment and reconciliation tests pass.

---

# PHASE 7 — OPERATIONS

## Objective

Implement operational modules defined by the frozen Operations specification.

## P7.1 Hostel

- [ ] hostel configuration
- [ ] rooms
- [ ] allocations
- [ ] boarder management
- [ ] attendance/incidents where specified

## P7.2 Transport

- [ ] routes
- [ ] vehicles
- [ ] drivers
- [ ] trips
- [ ] student assignments
- [ ] operational status

## P7.3 Library

- [ ] catalogue
- [ ] books/items
- [ ] loans
- [ ] returns
- [ ] overdue handling

## P7.4 Clinic

- [ ] visits
- [ ] relevant medical/clinic records defined by the specification
- [ ] referrals
- [ ] immunization records where specified
- [ ] strict access controls

## P7.5 Inventory

- [ ] inventory items
- [ ] stock operations
- [ ] movements
- [ ] relevant assignment/maintenance relationships

## P7.6 Maintenance / Visitors / Other Operations

Implement all remaining V1 operational modules actually defined by the frozen specification.

## P7.7 Shared requirements

Every operational module requires:

- [ ] authorization
- [ ] tenant isolation
- [ ] validation
- [ ] auditability
- [ ] pagination
- [ ] appropriate transaction boundaries
- [ ] tests

## Phase 7 gate

Each operational module must have real API functionality and security tests before being marked complete.

---

# PHASE 8 — DOCUMENTS & LEARNING

## Objective

Turn MinIO into a secure application service and implement Documents & Learning.

## P8.1 S3/MinIO service

- [ ] Implement S3-compatible client.
- [ ] Configure credentials securely.
- [ ] Define bucket configuration.
- [ ] Define object naming.
- [ ] Define metadata.
- [ ] Define access rules.

## P8.2 Upload security

- [ ] Validate file size.
- [ ] Validate file type.
- [ ] Prevent path traversal/object-key abuse.
- [ ] Prevent unauthorized uploads.
- [ ] Prevent unauthorized reads.
- [ ] Enforce tenant ownership.
- [ ] Avoid exposing permanent public object URLs where inappropriate.

## P8.3 Documents

Implement the frozen Documents & Learning specification:

- [ ] document creation
- [ ] upload
- [ ] retrieval
- [ ] deletion/retention behavior
- [ ] templates
- [ ] learning resources
- [ ] relevant access controls

## P8.4 Tests

- [ ] authorized upload
- [ ] unauthorized upload
- [ ] cross-tenant read
- [ ] cross-tenant delete
- [ ] invalid file
- [ ] oversized file
- [ ] object access control

## Phase 8 gate

Documents must be securely stored, accessed and tested.

---

# PHASE 9 — COMMUNICATION

## Objective

Implement communication as a real event-driven system rather than queue constants alone.

## P9.1 Notification domain

Implement:

- [ ] notification records
- [ ] notification templates
- [ ] notification preferences
- [ ] notification creation
- [ ] recipient targeting
- [ ] read/unread behavior
- [ ] relevant expiration rules
- [ ] auditability

## P9.2 Queue consumers

The audit identifies queue/job constants without consumers.

Implement consumers for approved communication jobs:

- [ ] notification jobs
- [ ] email jobs
- [ ] SMS jobs
- [ ] push jobs
- [ ] bulk/campaign jobs
- [ ] chat jobs where queue processing is required

## P9.3 Email

- [ ] Choose provider according to project decision.
- [ ] Implement provider abstraction.
- [ ] Configure credentials securely.
- [ ] Implement mail service.
- [ ] Implement worker.
- [ ] Implement templates.
- [ ] Implement retries.
- [ ] Implement failure tracking.
- [ ] Prevent accidental production sends from development.

## P9.4 SMS

The audit confirms SMS is currently greenfield.

- [ ] Select SMS provider.
- [ ] Do not hardcode provider-specific logic into domain modules.
- [ ] Implement provider abstraction.
- [ ] Add secure provider configuration.
- [ ] Implement `SmsService`.
- [ ] Implement SMS worker.
- [ ] Implement retry/backoff.
- [ ] Implement delivery/failure tracking.
- [ ] Define message length/encoding behavior.
- [ ] Define sender configuration.
- [ ] Add tests using a provider mock/test environment.
- [ ] Verify production credentials separately.

## P9.5 Push notifications

- [ ] Select/confirm push provider.
- [ ] Implement device-token management.
- [ ] Implement push service.
- [ ] Implement worker.
- [ ] Handle invalid/expired tokens.
- [ ] Retry transient failures.
- [ ] Track delivery outcomes where supported.

## P9.6 Campaigns

- [ ] campaign creation
- [ ] audience targeting
- [ ] authorization
- [ ] scheduling if specified
- [ ] bulk delivery
- [ ] retry behavior
- [ ] delivery analytics
- [ ] abuse/rate protection

## P9.7 Chat

Implement the frozen Communication specification:

- [ ] conversations
- [ ] messages
- [ ] authorization
- [ ] tenant isolation
- [ ] notifications
- [ ] expiration/retention rules where specified
- [ ] abuse controls

## Phase 9 gate

Communication must be tested across success, retry and failure scenarios.

---

# PHASE 10 — REPORTING & ANALYTICS

## Objective

Build reporting on top of real domain data.

## P10.1 Reporting

Implement the frozen Reporting & Analytics specification:

- [ ] academic reports
- [ ] attendance reports
- [ ] finance reports
- [ ] operational reports
- [ ] institution reports
- [ ] platform reports
- [ ] exports

## P10.2 Analytics

- [ ] dashboards
- [ ] KPIs
- [ ] aggregation queries
- [ ] date/session/term filtering
- [ ] role-based visibility
- [ ] tenant isolation

## P10.3 Performance

- [ ] Identify expensive reports.
- [ ] Avoid unbounded queries.
- [ ] Add pagination where relevant.
- [ ] Add appropriate indexes.
- [ ] Move heavy work to background jobs where required.
- [ ] Define export limits.

## Phase 10 gate

Reports must use real data and respect role/tenant boundaries.

---

# PHASE 11 — FRONTEND API INTEGRATION

## Objective

Convert the existing static frontend into a functioning application without unnecessarily redesigning the existing UI.

## P11.1 API client

- [ ] Create centralized API client.
- [ ] Define base URL by environment.
- [ ] Implement request handling.
- [ ] Implement response/error handling.
- [ ] Implement authentication behavior.
- [ ] Implement refresh behavior.
- [ ] Prevent token leakage.
- [ ] Avoid duplicating API logic across pages.

## P11.2 Authentication UI

- [ ] Implement login.
- [ ] Implement session state.
- [ ] Implement logout.
- [ ] Implement refresh/session expiry behavior.
- [ ] Implement appropriate auth errors.
- [ ] Implement role-aware navigation.

## P11.3 Portal integration

Connect the existing pages to their real backend APIs:

- [ ] platform
- [ ] institution
- [ ] principal
- [ ] teacher
- [ ] student
- [ ] parent
- [ ] bursar
- [ ] librarian
- [ ] hostel
- [ ] clinic
- [ ] transport
- [ ] HR
- [ ] student management
- [ ] org administration

## P11.4 Forms

Replace mock submission with:

- [ ] real API calls
- [ ] validation
- [ ] loading state
- [ ] success state
- [ ] error state
- [ ] retry
- [ ] confirmation for destructive actions

## P11.5 Tables/search/filtering

- [ ] real pagination
- [ ] server-side filtering where needed
- [ ] server-side search where needed
- [ ] sorting
- [ ] empty states
- [ ] loading states

## P11.6 Permissions

- [ ] UI reflects permissions.
- [ ] UI does not become the security boundary.
- [ ] Unauthorized API operations remain blocked.

## Phase 11 gate

Critical user journeys must work end-to-end through the real frontend and backend.

---

# PHASE 12 — FULL INTEGRATION, E2E, RELIABILITY & PERFORMANCE

## Objective

Prove that the integrated system behaves correctly under realistic use and failure conditions.

## P12.1 Unit tests

- [ ] critical business logic
- [ ] calculations
- [ ] permission logic
- [ ] validation
- [ ] state transitions

## P12.2 Integration tests

- [ ] API/database flows
- [ ] authentication
- [ ] authorization
- [ ] tenant isolation
- [ ] finance
- [ ] notifications
- [ ] documents

## P12.3 E2E tests

Test critical journeys:

- [ ] school onboarding
- [ ] user login
- [ ] student admission
- [ ] staff workflow
- [ ] academic workflow
- [ ] results publication
- [ ] fee/invoice workflow
- [ ] payment
- [ ] parent access
- [ ] student access
- [ ] communication
- [ ] document upload
- [ ] platform administration

## P12.4 Failure testing

Test:

- [ ] database failure
- [ ] Redis failure
- [ ] queue failure
- [ ] provider timeout
- [ ] provider error
- [ ] duplicate webhook
- [ ] duplicate request
- [ ] retry
- [ ] partial transaction failure
- [ ] expired session
- [ ] revoked session
- [ ] unauthorized access

## P12.5 Concurrency

Test:

- [ ] simultaneous updates
- [ ] duplicate submissions
- [ ] concurrent payment events
- [ ] concurrent state transitions
- [ ] race conditions around unique records

## P12.6 Performance

Establish realistic load tests.

Measure:

- API latency
- database load
- connection usage
- Redis usage
- queue throughput
- worker throughput
- report performance
- concurrent users
- error rate

Do not claim scalability based only on code inspection.

## Phase 12 gate

Critical user journeys, security tests, integration tests and realistic performance tests must pass.

---

# PHASE 13 — PRODUCTION INFRASTRUCTURE & OPERATIONS

## Objective

Make the system deployable, observable, recoverable and maintainable in production.

## P13.1 Containerization

- [ ] Create API Dockerfile.
- [ ] Review web production build.
- [ ] Define production container configuration.
- [ ] Run as non-root where appropriate.
- [ ] Minimize production image contents.
- [ ] Verify health checks.

## P13.2 Environments

Create clear:

- [ ] development
- [ ] staging
- [ ] production

configuration.

Ensure environments cannot accidentally point at one another.

## P13.3 CI/CD

- [ ] install
- [ ] lint
- [ ] typecheck
- [ ] unit tests
- [ ] integration tests
- [ ] build
- [ ] migration checks
- [ ] deployment
- [ ] rollback strategy

## P13.4 TLS/reverse proxy

- [ ] reverse proxy
- [ ] TLS
- [ ] secure headers
- [ ] request limits
- [ ] routing
- [ ] health checks

## P13.5 Secrets

- [ ] Remove plaintext production secrets.
- [ ] Define secret-management mechanism.
- [ ] Rotate exposed/development credentials where necessary.
- [ ] Ensure secrets do not enter Git.
- [ ] Ensure secrets do not appear in logs.

## P13.6 Database backups

- [ ] automated backups
- [ ] retention policy
- [ ] backup monitoring
- [ ] restore procedure
- [ ] restore test

A backup that has never been restored should not be treated as proven.

## P13.7 Observability

Implement:

- [ ] centralized logs
- [ ] metrics
- [ ] error tracking
- [ ] application health monitoring
- [ ] database monitoring
- [ ] queue monitoring
- [ ] alerting
- [ ] deployment monitoring

## P13.8 Production API behavior

- [ ] Swagger policy enforced.
- [ ] CORS restricted.
- [ ] Debug behavior disabled.
- [ ] Production configuration validated.
- [ ] Error responses sanitized.
- [ ] Rate limiting active.
- [ ] Health endpoints safe.

## Phase 13 gate

A staging deployment must be reproducible and recoverable before production deployment.

---

# PHASE 14 — FINAL SECURITY & PRODUCTION READINESS AUDIT

## Objective

Perform a fresh adversarial review of the completed system.

This is not a formality.

The audit must be performed against the actual final code.

## P14.1 Security review

Re-test:

- [ ] authentication
- [ ] authorization
- [ ] RBAC
- [ ] tenant isolation
- [ ] IDOR/BOLA
- [ ] privilege escalation
- [ ] injection
- [ ] XSS
- [ ] CSRF
- [ ] SSRF where applicable
- [ ] file upload security
- [ ] secrets
- [ ] session security
- [ ] rate limiting
- [ ] webhook security
- [ ] replay protection
- [ ] audit logs
- [ ] PII exposure

## P14.2 Reliability review

- [ ] state transitions
- [ ] transactions
- [ ] concurrency
- [ ] idempotency
- [ ] retries
- [ ] background workers
- [ ] provider failures
- [ ] database failures
- [ ] Redis failures
- [ ] backup/restore

## P14.3 Data integrity review

- [ ] foreign keys
- [ ] unique constraints
- [ ] indexes
- [ ] tenant boundaries
- [ ] financial records
- [ ] academic records
- [ ] audit records
- [ ] deletion/retention behavior

## P14.4 Production checklist

Every production-readiness item must be:

- `PASS`
- `FAIL`
- `PARTIAL`
- `NOT APPLICABLE`

No `UNKNOWN` should remain for a launch-critical control.

## P14.5 Launch decision

Produce one of:

### APPROVED FOR PRODUCTION

No unresolved critical/high launch blockers.

### CONDITIONALLY APPROVED

Only explicitly documented medium/low issues remain.

### NOT APPROVED

Critical/high blockers remain.

---

# 4. Cross-Phase Definition of Done

A task is not complete merely because code exists.

For each implementation task:

- [ ] Code implemented.
- [ ] Existing architecture/specification respected.
- [ ] Authentication enforced.
- [ ] Authorization enforced.
- [ ] Tenant boundary enforced where applicable.
- [ ] Input validated.
- [ ] Errors handled.
- [ ] Database operation is safe.
- [ ] Transaction used where required.
- [ ] Auditability implemented where required.
- [ ] Tests added.
- [ ] Tests pass.
- [ ] No unrelated regressions.
- [ ] Documentation updated where behavior changed.

---

# 5. Rules for Database Changes

Do not casually modify the Prisma schema.

For every proposed schema change:

1. Explain why the current schema cannot support the requirement.
2. Identify affected models.
3. Identify affected relationships.
4. Identify migration impact.
5. Identify data migration requirements.
6. Identify rollback concerns.
7. Add/update tests.
8. Stop for review if the change alters a frozen architectural decision.

---

# 6. Rules for External Integrations

Every external integration must have:

- provider abstraction where appropriate
- secure configuration
- timeout handling
- retry policy
- failure handling
- logging without secrets
- test strategy
- production/test environment separation
- idempotency where applicable
- monitoring

Never make a domain module depend directly on provider-specific implementation if the architecture calls for an abstraction.

---

# 7. Required OpenCode Completion Report

At the end of every phase, OpenCode must create:

`PHASE_<N>_COMPLETION_REPORT.md`

The report must contain:

## Summary

What was implemented.

## Tasks

For every roadmap task:

- PASS
- PARTIAL
- FAIL
- NOT IMPLEMENTED

## Files Changed

List exact files.

## Database Changes

List migrations/schema changes.

## APIs Added/Changed

List exact routes/operations.

## Security

Explain authorization, tenant isolation and relevant protections.

## Tests

List:

- tests added
- tests run
- passed
- failed
- skipped

## Build Verification

Report:

- lint
- typecheck
- build
- Prisma
- integration tests
- E2E tests where applicable

## Regressions

Anything that previously worked but now does not.

## Known Issues

Anything unresolved.

## Out of Scope

Anything intentionally not changed.

## Recommendation

State:

`READY FOR REVIEW` or `NOT READY FOR REVIEW`

OpenCode must stop after producing this report.

---

# 8. Review Protocol

After OpenCode completes a phase, the project owner submits the completion report and relevant implementation state for review.

The reviewer evaluates:

1. Does implementation match the roadmap?
2. Does implementation match the frozen specifications?
3. Is security correctly enforced?
4. Is tenant isolation actually proven?
5. Are tests meaningful?
6. Are failure cases handled?
7. Did OpenCode introduce unrelated changes?
8. Did it modify architecture without approval?
9. Are acceptance criteria satisfied?

The review result is:

- `APPROVED`
- `APPROVED WITH REQUIRED FOLLOW-UP`
- `REJECTED`

OpenCode must not proceed to the next phase until the current phase is approved.

---

# 9. Change-Control Rule

If OpenCode discovers that a later phase requires a change to an earlier architectural decision:

**Do not silently change the roadmap.**

Instead:

1. Document the conflict.
2. Explain the technical reason.
3. Identify affected phases.
4. Propose alternatives.
5. Stop the affected implementation.
6. Obtain review.
7. Update the roadmap if the change is approved.

---

# 10. Current Known Production Blockers

Based on the current-state audit, these are known blockers at baseline:

- [ ] Domain APIs are missing.
- [ ] Authentication requires hardening.
- [ ] Authorization is not effectively enforced.
- [ ] Tenant isolation is not proven.
- [ ] Permissions table is empty.
- [ ] Rate limiting is not wired.
- [ ] Audit logging is not active.
- [ ] Email delivery is missing.
- [ ] SMS delivery is missing.
- [ ] Push delivery is missing.
- [ ] Paystack integration is missing.
- [ ] Payment worker is only a stub.
- [ ] S3/MinIO application service is missing.
- [ ] Global logging is not wired.
- [ ] Correlation ID interceptor is not globally registered.
- [ ] Global exception filter is not globally registered.
- [ ] Tests are missing.
- [ ] Frontend API client is missing.
- [ ] Frontend authentication is missing.
- [ ] API Dockerfile is missing.
- [ ] CI/CD is missing.
- [ ] Production secret management is missing.
- [ ] Backup/restore strategy is missing.
- [ ] Staging environment is missing.
- [ ] Production observability is missing.

These should be re-checked as the project progresses rather than blindly assumed to remain blockers.

---

# 11. Important Baseline Evidence

The current-state audit reports:

- 156 static frontend pages with no API client or client authentication.
- 52 Prisma models and 14 enums.
- Auth is the only implemented domain API.
- Redis and BullMQ foundations exist.
- MinIO is running but unused by the application.
- Permission and tenant guards exist but are not applied to domain routes.
- No API unit/e2e/integration tests currently exist.
- No CI/CD currently exists.
- No API Dockerfile currently exists.

The complete evidence remains in `CURRENT-STATE-AUDIT.md`.

---

# 12. First Instruction to OpenCode

When this roadmap is accepted, the first implementation instruction is:

> **Implement PHASE 0 ONLY from `MASTER_SMS_ROADMAP.md`.**
>
> Do not implement Phase 1 or any domain APIs.
>
> Follow every Phase 0 task and acceptance criterion.
>
> Preserve existing architecture and behavior unless a Phase 0 task explicitly requires a change.
>
> Run all required verification.
>
> Create `PHASE_0_COMPLETION_REPORT.md`.
>
> Stop and wait for review.

---

# 13. Roadmap Completion Condition

The roadmap is complete only when:

- all required V1 functionality is implemented;
- all required integrations are operational;
- security controls are enforced and tested;
- tenant isolation is proven;
- financial operations are verified;
- critical user journeys pass end-to-end;
- production infrastructure is deployed and recoverable;
- monitoring/alerting works;
- backup/restore is proven;
- final security audit has no unresolved launch blockers;
- final production-readiness audit approves the system.

**Do not equate completion of all code tasks with production approval.**

Production approval is a separate final gate.
