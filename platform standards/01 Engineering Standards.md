# OpenSchool ERP — Engineering Standards

**Platform-Wide Engineering Standards Manual**

| Aspect | Detail |
|--------|--------|
| Document | Engineering Standards |
| Scope | All V1 engineering specifications and future implementations |
| Status | Approved — Active |
| Version | 1.0.0 |
| Effective Date | 2026-07-20 |
| Authority | Architecture baseline established from 10 approved domain specifications |

---

## Table of Contents

1. [Scope](#1-scope)
2. [Engineering Principles](#2-engineering-principles)
3. [Technology Stack](#3-technology-stack)
4. [Naming Standards](#4-naming-standards)
5. [Entity Standards](#5-entity-standards)
6. [Audit Standards](#6-audit-standards)
7. [Lifecycle Standards](#7-lifecycle-standards)
8. [Event Standards](#8-event-standards)
9. [Validation Standards](#9-validation-standards)
10. [Error Standards](#10-error-standards)
11. [API Standards](#11-api-standards)
12. [Multi-Tenant Standards](#12-multi-tenant-standards)
13. [Security Standards](#13-security-standards)
14. [Performance Standards](#14-performance-standards)
15. [Documentation Standards](#15-documentation-standards)
16. [Architecture Decision Record Standards](#16-architecture-decision-record-standards)
17. [Engineering Review Checklist](#17-engineering-review-checklist)
18. [Revision History](#18-revision-history)

---

## 1. Scope

### 1.1 Purpose

This document is the single authoritative engineering standard for the OpenSchool ERP platform. All engineering specifications and future implementations must comply with this document.

### 1.2 Applicability

This standard applies to:

- All 10 approved V1 domain engineering specifications
- All future V2, V3, and V4 engineering specifications
- All implementation code derived from engineering specifications
- All database schemas, API contracts, and integration points

### 1.3 Relationship to Domain Specifications

Domain engineering specifications define **what** to build — business rules, entities, aggregates, events, and APIs specific to a domain. This document defines **how** to build — platform-wide conventions that every domain must follow.

Domain specifications may define domain-specific conventions that supplement this standard, but may not contradict it.

### 1.4 Governance

- Changes to this standard require architecture review
- All new domain specifications must demonstrate compliance during Phase 2 (Domain Design)
- Non-compliance identified during implementation must be resolved before merge

---

## 2. Engineering Principles

### 2.1 Core Philosophy

| Principle | Description |
|-----------|-------------|
| Domain-Driven Design | Every bounded context is self-contained with its own aggregates, services, and persistence. Cross-domain communication occurs only through domain events. |
| SOLID | Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion — applied at aggregate, service, and module boundaries. |
| Clean Architecture | Domain logic is independent of infrastructure. Repositories, controllers, and external integrations are adapters around the domain core. |
| Separation of Concerns | Each module owns one responsibility. Finance owns calculation. Communication owns delivery. People owns identity. No domain duplicates another domain's logic. |
| Configuration over Customization | Academic policies, grading rules, progression criteria, security policies, and feature flags are institution-configurable via records. No code changes required. |
| Event-Driven Architecture | Cross-domain communication uses domain events published via EventEmitter2 (in-process). Events carry versioned envelopes. Consumers are idempotent. |
| Multi-Tenant SaaS | Every query is scoped to tenant context. Application-level isolation (no RLS). Institution scoping provides additional granularity within a tenant. |
| API-First | Every capability is exposed through a documented API. Internal service communication follows the same contract patterns as external APIs. |

### 2.2 Architectural Decisions

All architectural decisions are recorded as Architecture Decision Records (ADRs) within each domain specification. Platform-wide ADRs are documented in this standard. Domain-specific ADRs are documented in their respective specifications.

### 2.3 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | >=22.0.0 |
| Backend Framework | NestJS | ^11.0.0 |
| ORM | Prisma | ^6.12.0 |
| Language | TypeScript | ^5.8.3 |
| Frontend Framework | Next.js | Latest stable |
| UI Components | shadcn/ui + Tailwind CSS | Latest stable |
| Mobile Framework | Flutter | Latest stable |
| Database | PostgreSQL | 16+ |
| Queue | BullMQ | Latest stable |
| Cache | Redis | 7+ |
| Containerization | Docker | Latest stable |
| Object Storage | S3-compatible | — |
| CI/CD | GitHub Actions | Latest stable |
| Validation | class-validator + class-transformer | Latest stable |
| Testing | Jest | ^30.0.0 |
| API Documentation | Swagger/OpenAPI | ^7.0.0 |
| Authentication | JWT + bcrypt | — |

---

## 3. Naming Standards

### 3.1 Code Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Modules | PascalCase | AcademicCalendarModule |
| Aggregates | PascalCase + Aggregate suffix | AcademicYearAggregate |
| Entities | PascalCase | AcademicYear, StudentClassEnrollment |
| Value Objects | PascalCase | DateRange, MarkRange, SubjectCode |
| Domain Events | PascalCase, past tense | AcademicYearCreated, StudentPromoted |
| DTOs | PascalCase + suffix (Create/Update/Response) | CreateAcademicYearDto, AcademicYearResponseDto |
| Services | PascalCase + Service suffix | AcademicCalendarService |
| Controllers | PascalCase + Controller suffix | AcademicCalendarController |
| Repositories | PascalCase + Repository suffix | AcademicCalendarRepository |
| Methods | camelCase | createAcademicYear, findActiveTerm |
| Error Classes | PascalCase + Error suffix | AcademicYearNotFoundError |
| Permissions | `{domain}:{resource}:{action}` | academics:subject:read |

### 3.2 Database Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | snake_case, plural | academic_years, student_class_enrollments |
| Columns | snake_case | academic_year_id, max_score |
| Primary Keys | `id` | id (uuid) |
| Foreign Keys | `{referenced_table_singular}_id` | academic_session_id, staff_person_id |
| Join Tables | `{table_a}_{table_b}` | subject_subject_groups |
| Indexes | `idx_{table_abbreviation}_{columns}` | idx_ay_tenant_institution, idx_sce_student |
| Unique Constraints | Inline with column definitions | UNIQUE (tenant_id, institution_id, name) |
| Check Constraints | Inline with table definitions | CHECK: exactly one of X or Y must be non-null |

### 3.3 Enum Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Enum Types | PascalCase | AcademicYearStatus, AttendanceStatus |
| Enum Values | SCREAMING_SNAKE_CASE | DRAFT, ACTIVE, CLOSED, PARTIALLY_PAID |
| Status Enums | `{Entity}Status` | AcademicYearStatus, InvoiceStatus |
| Type Enums | `{Entity}Type` or `{Concept}Type` | AssessmentType, AllocationType |
| Action Enums | `{Entity}Action` or `{Concept}Action` | SubscriptionAction, LicenseAction |

**Enum Value Conventions:**

- Use `ACTIVE` / `INACTIVE` for enabled/disabled states (not `ENABLED` / `DISABLED`)
- Use `DRAFT` / `PUBLISHED` for content lifecycle (not `PENDING` / `LIVE`)
- Use `ARCHIVED` for soft-archived state (not `CLOSED` or `HISTORICAL`)
- Use `SUPERSEDED` for replaced records (not `EXPIRED` or `REPLACED`)
- Use `CANCELLED` with double-L for cancelled states
- Use `PENDING` for awaiting-action states (not `WAITING` or `QUEUED`)

### 3.4 API Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Route Prefixes | `/api/v1/{domain}/{resource}` | /api/v1/academics/calendar |
| Resource Paths | Plural nouns | /academic-years, /students |
| Path Parameters | `:id` | /academic-years/:id |
| Query Parameters | camelCase | sortBy, categoryId, typeId |
| Response Fields | camelCase | academicYearId, totalScore, createdAt |
| Error Codes | SCREAMING_SNAKE_CASE | ACADEMIC_YEAR_NOT_FOUND |
| Permission Strings | `{domain}:{resource}:{action}` | academics:subject:read |

---

## 4. Entity Standards

### 4.1 Primary Key Strategy

All entities use UUID v4 as the primary key:

```prisma
id String @id @default(uuid()) @db.Uuid
```

- UUIDs are generated application-side, not by the database
- UUIDs are immutable once assigned
- No sequential or predictable UUIDs (use `uuid()` function, not time-based)

### 4.2 Public Business Identifiers

Entities exposed to end users carry an immutable, human-readable public business identifier in addition to the internal UUID.

| Entity | Format | Example |
|--------|--------|---------|
| Person | P-YYYY-NNNNNN | P-2026-000123 |
| Student | STU-YYYY-NNNNNN | STU-2026-000456 |
| Staff | EMP-YYYY-NNNNNN | EMP-2026-000789 |
| Applicant | APP-YYYY-NNNNNN | APP-2026-000012 |

**Rules:**
- Generated on creation; immutable; never recycled or reassigned
- Scoped to tenant: `UNIQUE(tenant_id, public_id)`
- Sequential within tenant and calendar year; resets annually
- Used for search and display; API responses always include public ID
- Not used for authorization decisions; internal UUIDs remain the source of truth
- Academic entities (subjects, classes, assessments) are internal-facing and use internal UUIDs only

### 4.3 Tenant Ownership

Every entity belongs to exactly one tenant. The tenant relationship is enforced at the application level:

```prisma
tenantId String @map("tenant_id") @db.Uuid
tenant   Tenant @relation(fields: [tenantId], references: [id])
```

- Tenant ID is extracted from the JWT and passed as the first parameter to all repository methods
- No Postgres Row-Level Security (RLS); all isolation is application-level
- Every query must include a tenant filter; omission is a security violation

### 4.4 Institution Ownership

Most entities are scoped to an institution within a tenant:

```prisma
institutionId String @map("institution_id") @db.Uuid
institution   Institution @relation(fields: [institutionId], references: [id])
```

- Some entities (e.g., Person in People domain) span multiple institutions within a tenant
- Cross-institution queries require explicit authorization

### 4.5 Version Field

All mutable entities include a version field for optimistic concurrency:

```prisma
version Int @default(1)
```

- Incremented on every update
- Used in `WHERE version = @expectedVersion` to detect conflicts
- Immutable entities (results, report cards, attendance records) do not require a version field

### 4.6 Metadata Fields

Every mutable entity includes:

```prisma
createdAt DateTime  @default(now()) @map("created_at")
createdBy String?   @map("created_by") @db.Uuid
updatedAt DateTime  @updatedAt @map("updated_at")
updatedBy String?   @map("updated_by") @db.Uuid
```

- `createdBy` and `updatedBy` store the actor's UUID (from JWT subject claim)
- Nullable on entities that may be created by system processes
- Immutable entities that never update after creation may omit `updatedAt` and `updatedBy`

### 4.7 Soft Delete

All mutable core entities support soft delete:

```prisma
deletedAt DateTime? @map("deleted_at")
deletedBy String?   @map("deleted_by") @db.Uuid
```

- Business status (e.g., ACTIVE, DRAFT, PUBLISHED) is a separate concern from deletion
- Status enums represent business states; `deleted_at` controls deletion exclusively
- 30-day restore window before permanent deletion
- Restore reverts `deleted_at`, clears `deleted_by`, and sets the entity to active state
- Permanent deletion only via admin job after retention period

**Immutable entities** that must never be deleted include:
- Published results and report cards
- Attendance records
- Audit logs
- Summer school results

These entities have no `deleted_at` / `deleted_by` columns.

### 4.8 Prisma Schema Principles

- UUID `@default(uuid())` for all primary keys
- `@unique` constraints for business keys
- `@map` for snake_case column names
- Soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status via `status` enum (never a deletion marker)
- Optimistic locking via `version` (Int @default(1))
- Audit fields: created_at, created_by, updated_at, updated_by
- JSON columns for flexible data (metadata, configuration, criteria snapshots)
- Prisma enums mapped to database types
- Cascade deletes: child entities cascade from parent aggregate root; cross-aggregate references use application-level guards

---

## 5. Audit Standards

### 5.1 Entity Audit Fields

Every mutable entity must include:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| created_at | timestamptz | No | Timestamp of creation |
| created_by | uuid | Yes | Actor who created the record |
| updated_at | timestamptz | No | Timestamp of last update |
| updated_by | uuid | Yes | Actor who last updated the record |

- `created_by` and `updated_by` are nullable to support system-initiated operations
- Immutable entities that never update may omit `updated_at` and `updated_by`

### 5.2 Append-Only Audit Log

Every state-changing operation generates an audit log entry:

| Field | Type | Description |
|-------|------|-------------|
| entity_type | varchar | Entity class name (e.g., "AcademicYear") |
| entity_id | uuid | Entity primary key |
| action | varchar | Operation performed (e.g., "CREATED", "UPDATED", "STATUS_CHANGED") |
| actor_id | uuid | User who performed the action |
| actor_email | varchar | Email of the actor |
| changes | jsonb | JSON diff of changed fields |
| context_ip | inet | IP address of the request |
| context_user_agent | varchar | User agent string |
| timestamp | timestamptz | When the action occurred |

**Rules:**
- Audit logs are append-only; never update or delete
- Audit logs are tenant-scoped
- Audit logs are not soft-deleted
- Published results, report cards, and attendance records are immutable; corrections create new records with audit trail

---

## 6. Lifecycle Standards

### 6.1 Standard Lifecycle States

Most entities follow a lifecycle pattern. The standard states are:

| State | Description |
|-------|-------------|
| Draft | Initial state; entity is being configured or prepared |
| Active | Entity is operational and available for use |
| Suspended | Entity is temporarily disabled (may be reactivated) |
| Archived | Entity is permanently deactivated but retained for history |
| Deleted | Entity is soft-deleted; recoverable within retention period |

### 6.2 Lifecycle Notation

In engineering specifications, lifecycle states are documented as:

```
EntityName: Draft → Active → Archived
```

- Parenthesized states indicate terminal or exceptional transitions:
  ```
  StudentClassEnrollment: Enrolled → Active → (Transferred) → (Withdrawn)
  ```
- Reverse transitions are noted explicitly:
  ```
  ReportDefinition: DRAFT → PUBLISHED → ARCHIVED → DRAFT (revise)
  ```

### 6.3 Lifecycle Principles

1. **Status enums represent business states**, not deletion markers
2. **Soft delete is separate from lifecycle** — an entity can be ACTIVE and soft-deleted simultaneously
3. **Transitions are validated** — not all transitions are valid from every state
4. **Transitions are audited** — every state change generates an audit log entry
5. **Transitions are published** — state changes emit domain events for cross-domain consumption
6. **Terminal states are irreversible** — ARCHIVED and WITHDRAWN cannot be reversed without explicit restore operations

### 6.4 Common Lifecycle Patterns

**Calendar Entities (Academic Year, Session, Term):**
```
Draft → Active → Closed
```

**Content Entities (Subject, GradeScale, Policy):**
```
Draft → Active → Inactive
```

**Document Entities (Assignment, Assessment):**
```
Draft → Published → Closed
```

**Result Entities (Result, ReportCard):**
```
Compiled → Approved → Published (immutable after Published)
```

**Financial Entities (Invoice, Bill):**
```
Draft → Generated → Published → (Partially Paid) → Paid / Overdue / Written Off / Cancelled
```

---

## 7. Event Standards

### 7.1 Event Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Event Type | PascalCase, past tense | AcademicYearCreated, StudentPromoted |
| Pattern | `{Entity}{PastTenseVerb}` | InvoicePublished, PaymentConfirmed |

**Rules:**
- Events use past tense because they describe something that already happened
- Events include the entity name as a prefix for discoverability
- Multi-word verbs use clean past tense: `StudentConditionallyPromoted` (not `ConditionalPromotion`)
- Parallel entities use consistent verbs: `AcademicYearActivated` and `AcademicSessionActivated` (not `Opened` vs `Activated`)

### 7.2 Event Envelope

Every domain event carries a versioned envelope:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| eventId | uuid | Yes | Unique event identifier; primary deduplication key |
| eventVersion | int | Yes | Monotonically increasing per event type; incremented on payload schema changes |
| schemaVersion | string | Yes | Payload schema version (e.g., "1.0.0") |
| occurredAt | timestamptz | Yes | When the event occurred |
| correlationId | uuid | Yes | Groups related events across a single user action |
| causationId | uuid | Yes | ID of the event or command that caused this event |
| tenantId | uuid | Yes | Tenant context |
| actorId | uuid | Yes | User who triggered the event |
| payload | jsonb | Yes | Event-specific data |

### 7.3 Event Publishing

- Events are published via EventEmitter2 (in-process) after transaction commit
- Events are NOT published inside the transaction (to avoid phantom events on rollback)
- Events are published synchronously within the process; async processing is handled by consumers
- Future migration to a message queue (BullMQ/Redis) is anticipated but not yet required

### 7.4 Idempotency

- `eventId` is the deduplication key
- Consumers must check `eventId` before processing to prevent duplicate handling
- Processed `eventId` values are stored with a minimum TTL of 72 hours
- Idempotency is enforced at the consumer level, not the publisher level

### 7.5 Ordering

- Events within a single aggregate are published in transaction order
- Events across aggregates may arrive out of order; consumers must handle this
- No global ordering guarantee; eventual consistency is the expected model

### 7.6 Retry and Replay

- Failed event processing is retried with exponential backoff
- Maximum retry attempts are configurable per consumer
- Events are stored and can be replayed for debugging or recovery
- Replay must be idempotent (same as normal processing)

### 7.7 Consumer Patterns

| Pattern | Description |
|---------|-------------|
| AuditLogConsumer | Creates audit log entries for all state-change events |
| NotificationConsumer | Sends notifications for user-facing events |
| FinanceConsumer | Creates fee assignments and financial records |
| PeopleConsumer | Updates person enrollment and status records |
| Domain-specific consumers | Handle domain-specific event reactions |

---

## 8. Validation Standards

### 8.1 Input Validation

All API inputs are validated at three layers:

1. **DTO Validation** — class-validator decorators on DTO properties (required, length, format, range)
2. **Service Validation** — domain-specific business rules enforced before persistence
3. **Database Validation** — unique constraints, foreign keys, check constraints, enum types

### 8.2 Validation Rules Format

Validation rules are documented in engineering specifications as:

| Rule ID | Description |
|---------|-------------|
| V-{ENTITY}-{NN} | Validation rule description |

Example:

| Rule | Description |
|------|-------------|
| V-AY-01 | Name: required, 1–50 chars, unique within Institution |
| V-AY-02 | Start date: required, valid date |
| V-AY-03 | End date: required, valid date, must be after start date |
| V-AY-04 | Status: required, valid enum (DRAFT, ACTIVE, CLOSED) |

### 8.3 Domain Validation

- Entities validate their own invariants on creation and update
- Aggregate roots enforce consistency boundaries
- Cross-aggregate validation uses application-level guards, not database constraints
- Cross-domain validation consumes domain events; no direct cross-domain queries

### 8.4 Business Rule Validation

- Business rules are documented in Phase 1 (Domain Analysis) of each specification
- Rules are enforced at the service layer
- Rule violations return structured error responses with specific error codes
- Configurable rules (via AcademicPolicy, FinancialPolicy, etc.) are validated against current policy values

---

## 9. Error Standards

### 9.1 Error Response Format

All API errors return a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "code": "ACADEMIC_YEAR_NOT_FOUND",
    "message": "Academic year with the specified ID was not found",
    "details": []
  }
}
```

### 9.2 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful read or update |
| 201 | Successful creation |
| 204 | Successful deletion (no content) |
| 400 | Validation error (malformed request) |
| 401 | Unauthenticated (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found or not in tenant scope |
| 409 | Version conflict (optimistic concurrency) |
| 422 | Business rule violation (valid syntax, invalid semantics) |
| 429 | Rate limit exceeded |
| 500 | Internal server error (never expose details) |

### 9.3 Error Categories

| Category | Code Pattern | Example |
|----------|-------------|---------|
| Validation | `{ENTITY}_VALIDATION_ERROR` | ACADEMIC_YEAR_VALIDATION_ERROR |
| Not Found | `{ENTITY}_NOT_FOUND` | ACADEMIC_YEAR_NOT_FOUND |
| Conflict | `{ENTITY}_CONFLICT` | ACADEMIC_YEAR_CONCURRENCY_CONFLICT |
| Business Rule | `{ENTITY}_{RULE}_VIOLATION` | ENROLLMENT_CAPACITY_EXCEEDED |
| Authentication | `AUTHENTICATION_{REASON}` | AUTHENTICATION_TOKEN_EXPIRED |
| Authorization | `AUTHORIZATION_{REASON}` | AUTHORIZATION_INSUFFICIENT_PERMISSIONS |
| Concurrency | `CONFLICT` | Version mismatch; resource modified by another user |
| Integration | `{DOMAIN}_INTEGRATION_ERROR` | FINANCE_INTEGRATION_ERROR |
| Infrastructure | `INTERNAL_SERVER_ERROR` | Internal server error; check logs |

### 9.4 Error Handling Principles

- Structured error responses; never expose internal details
- Domain-specific error classes; each domain defines its own error hierarchy
- Full error context logged server-side (stack trace, request context, actor)
- Client-facing messages are human-readable; technical details are in server logs
- Cross-domain errors are wrapped in the calling domain's error context

---

## 10. API Standards

### 10.1 Pagination

All list endpoints support offset-based pagination:

```
GET /api/v1/{domain}/{resource}?page=1&limit=20
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasNext": true
  }
}
```

- Default page size: 20
- Maximum page size: 100
- `hasNext` field enables clients to determine if more pages exist without computing `page * limit < total`

### 10.2 Filtering

- Filter by exact match: `?status=ACTIVE`
- Filter by UUID: `?academicYearId=uuid`
- Filter by category: `?categoryId=uuid`
- Multiple values: `?status=ACTIVE,DRAFT`

### 10.3 Sorting

```
?sortBy=created_at&sortOrder=desc
```

- Default sort: `created_at` descending
- Supported fields vary by endpoint

### 10.4 Searching

```
?search=keyword
```

- Full-text search across searchable fields
- Implementation varies by entity (ILIKE for simple text, tsvector for full-text)

### 10.5 Optimistic Concurrency

For update operations, clients must include the resource version in an `If-Match` header:

```
PUT /api/v1/academics/calendar/years/:id
If-Match: 3
```

On version mismatch, the server returns 409 Conflict:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "The record has been modified by another user. Please refresh and retry.",
    "details": [{ "field": "version", "currentVersion": 5, "submittedVersion": 3 }]
  }
}
```

### 10.6 Idempotency

- Create operations should support client-generated idempotency keys
- Retry scenarios must not create duplicate records
- Idempotency is enforced via unique constraints and event deduplication

### 10.7 Bulk Operations

- Bulk operations are limited to 100 records per request
- Bulk operations are atomic (all succeed or all fail)
- Bulk operations return per-record success/failure results

### 10.8 Asynchronous Operations

- Long-running operations return 202 Accepted with a job ID
- Job status is pollable via `GET /api/v1/jobs/:id`
- Completion notifications are delivered via domain events

### 10.9 Error Responses

All error responses follow the format defined in Section 9.1.

---

## 11. Multi-Tenant Standards

### 11.1 Tenant Isolation

- Every entity belongs to exactly one tenant
- Tenant ID is extracted from the JWT and passed as the first parameter to all repository methods
- Application-level filtering (no Postgres Row-Level Security)
- Every query must include a tenant filter; omission is a security violation
- Cross-tenant access is treated as a security violation and logged

### 11.2 Institution Isolation

- Most entities are scoped to an institution within a tenant
- Institution ID further scopes queries within a tenant
- Some entities (e.g., Person) may span multiple institutions within a tenant
- Cross-institution queries require explicit authorization

### 11.3 Shared Services

- Platform Administration manages the platform itself (tenant lifecycle, subscriptions, licensing)
- Communication is a shared service that consumes events from all domains but owns no entity data
- Reporting & Analytics reads from all domains but owns no entity data
- Identity & Access provides authentication and authorization for all domains

### 11.4 Cross-Tenant Restrictions

- No cross-tenant data access under any circumstances
- No cross-tenant event consumption
- No cross-tenant API calls
- Platform-level operations (monitoring, analytics) use aggregated, anonymized data only

---

## 12. Security Standards

### 12.1 Authentication

- JWT access tokens (15-minute expiry) + refresh tokens (7-day expiry) with rotation
- Refresh token rotation on every use; old refresh tokens are invalidated
- Token revocation on password change, MFA change, or security incident
- Rate limiting on authentication endpoints (login, register, forgot password)

### 12.2 Authorization

- RBAC with hierarchical permissions
- Permissions follow the pattern `{domain}:{resource}:{action}`
- Permission Groups provide reusable bundles for API keys
- Declarative authorization via NestJS Guards
- Authorization flow: JwtAuthGuard → TenantGuard → InstitutionGuard → ResourceGuard → ModuleLicenseGuard → controller execution

### 12.3 Least Privilege

- Users receive only the permissions required for their role
- API keys are scoped to specific permission groups
- Temporary delegation has time bounds (maximum 365 days)
- Elevated operations require additional approval

### 12.4 Sensitive Data

- Passwords are hashed with bcrypt (12 rounds); never stored in plaintext
- Integration credentials are encrypted at rest using AES-256-GCM
- MFA secrets are encrypted at rest
- PII is logged at INFO level or above; never at DEBUG level
- API keys and secrets are never committed to source control

### 12.5 Encryption

- Data in transit: TLS 1.3 for all API communication
- Data at rest: AES-256-GCM for sensitive fields (credentials, secrets, MFA tokens)
- Database-level encryption via PostgreSQL Transparent Data Encryption (TDE)

### 12.6 Security Headers

- Content Security Policy (CSP) headers on all responses
- CSRF protection via double-submit cookie pattern
- XSS prevention via CSP and output encoding
- Rate limiting on all endpoints (configurable per tenant)
- Request size limits (10MB default)

### 12.7 Audit

- All authentication events are logged (login, logout, password change, MFA change)
- All authorization failures are logged
- All data exports are logged with actor, timestamp, and record count
- Security alerts are generated for anomalous patterns (multiple failed logins, unusual IP patterns)

---

## 13. Performance Standards

### 13.1 Pagination

- All list endpoints must support pagination
- Default page size: 20 items
- Maximum page size: 100 items
- Large result sets must not be loaded into memory; use cursor or offset pagination

### 13.2 Indexing

- All foreign key columns must be indexed
- All columns used in WHERE clauses must be indexed
- Composite indexes for common query patterns (e.g., student + term + status)
- Unique constraints must have matching indexes
- Partial indexes for conditional uniqueness (e.g., WHERE deleted_at IS NULL)

### 13.3 Caching

- Read-through caching for high-read, low-write reference data (grade scales, policies, calendar hierarchy)
- Cache invalidation via domain events (e.g., AcademicPolicyUpdated invalidates policy cache)
- Cache TTL: configurable per entity type (default 5 minutes)
- No caching for mutable, frequently-updated data (enrollments, attendance)

### 13.4 Asynchronous Processing

- Long-running operations (>2 seconds) must be processed asynchronously via job queues
- Job queues use BullMQ with Redis backend
- Failed jobs are retried with exponential backoff (max 3 retries)
- Job progress is trackable via API

### 13.5 Bulk Operations

- Bulk operations are batched to avoid transaction timeouts
- Batch size: configurable (default 100 records per batch)
- Each batch completes independently; partial failures do not roll back successful batches
- Progress reporting for large bulk operations

### 13.6 Query Optimization

- No N+1 queries; use eager loading or batch queries
- Use Prisma `include` or `select` to avoid loading unnecessary data
- Use `@defer` for large JSON fields when not needed
- Monitor slow query logs; queries exceeding 500ms require optimization

---

## 14. Documentation Standards

### 14.1 Engineering Specification Structure

Every domain engineering specification must include:

1. Overview (domain purpose, scope, dependencies)
2. Engineering Principles (core philosophy, naming conventions, isolation rules)
3. Architecture Decision Records
4. Engineering Status (phase summary table)
5. Phase 1 — Domain Analysis (entities, lifecycle, business rules, events, assumptions)
6. Phase 2 — Domain Design (aggregates, relationships, services, invariants, policies, validation rules, read models)
7. Phase 3 — Database Design (table catalogue, column catalogue, constraints, indexes)
8. Phase 4 — Prisma Schema (enums, models, validation)
9. Phase 5 — Backend Implementation (modules, repositories, services, controllers, guards, events, transactions, key flows)
10. Phase 6 — API Design (endpoint catalogue, common parameters, resource groups)
11. Phase 7 — Testing & Verification (test categories, scenarios, production readiness)
12. Revision History

### 14.2 Documentation Quality

- Use consistent Markdown formatting throughout
- Use tables for structured data (entities, rules, events, endpoints)
- Use code blocks for schema definitions and JSON examples
- Cross-reference related sections using anchor links
- Maintain consistent terminology across all documents
- No UTF-8 encoding artifacts or malformed characters
- Use American English for code identifiers; British English is acceptable in prose

### 14.3 Version History

Every document must maintain a version history table:

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | YYYY-MM-DD | Initial creation |
| 1.1.0 | YYYY-MM-DD | Description of changes |

- Version numbers follow semantic versioning (major.minor.patch)
- Major version: breaking changes to architecture or business rules
- Minor version: additions, refinements, or consistency fixes
- Patch version: typo fixes, formatting corrections

---

## 15. Architecture Decision Record Standards

### 15.1 ADR Format

Every ADR follows this format:

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-NNN | Clear statement of the decision | Clear explanation of why this decision was made |

### 15.2 ADR Numbering

- ADRs are numbered sequentially within each domain specification (ADR-001, ADR-002, ...)
- ADRs are never renumbered or reused
- Deleted ADRs are marked as superseded, not removed

### 15.3 ADR Lifecycle

- ADRs are created during Phase 2 (Domain Design)
- ADRs may be added during architecture review or refinement passes
- ADRs are not removed or renamed after approval
- Conflicting ADRs must be resolved before domain approval

### 15.4 Platform-Wide ADRs

The following ADRs apply across all domains:

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-P01 | Application-level tenant isolation (no RLS) | Simpler debugging, easier multi-database support, framework-agnostic |
| ADR-P02 | Optimistic concurrency via version column | Prevents lost updates; no pessimistic locking overhead |
| ADR-P03 | Soft delete with 30-day retention | Prevents accidental data loss; supports compliance |
| ADR-P04 | Immutable audit logs (append-only) | Tamper-proof audit trail; compliance requirement |
| ADR-P05 | Domain events via EventEmitter2 (in-process) | Decouples services; supports async processing; future migration to MQ |
| ADR-P06 | Business status separate from deletion | Status enums represent business states; deleted_at controls deletion exclusively |
| ADR-P07 | Public business identifiers for user-facing entities | Human-readable IDs for search and display; internal UUIDs for authorization |
| ADR-P08 | Cross-aggregate references use application-level guards | No cross-aggregate cascade deletes; application logic prevents orphaned records |

---

## 16. Engineering Review Checklist

Use this checklist when reviewing any engineering specification or implementation.

### 16.1 Domain Design Review

- [ ] All entities have clear ownership (one domain owns each entity)
- [ ] Aggregates are consistent (aggregate root enforces all invariants)
- [ ] Cross-domain communication is via events only (no direct queries)
- [ ] Business rules are documented with IDs (BR-{DOMAIN}-{NN})
- [ ] Lifecycle states are complete and transitions are documented
- [ ] Validation rules are documented with IDs (V-{ENTITY}-{NN})
- [ ] ADRs cover all non-trivial decisions

### 16.2 Database Design Review

- [ ] All tables have tenant_id and institution_id where applicable
- [ ] All mutable entities have version, created_at, created_by, updated_at, updated_by
- [ ] All mutable core entities have deleted_at, deleted_by
- [ ] All foreign keys are indexed
- [ ] All unique constraints have matching indexes
- [ ] Cascade rules are RESTRICT for historical records, CASCADE only within aggregates
- [ ] No cross-aggregate cascade deletes

### 16.3 Prisma Schema Review

- [ ] All models use UUID primary keys
- [ ] All enums are mapped to database types
- [ ] All columns use @map for snake_case names
- [ ] All business keys have @unique constraints
- [ ] Optimistic concurrency via version field on mutable entities
- [ ] Soft delete fields on all mutable core entities
- [ ] Audit fields on all mutable entities

### 16.4 API Design Review

- [ ] All endpoints follow RESTful conventions
- [ ] All list endpoints support pagination
- [ ] All update operations require version (If-Match header)
- [ ] All endpoints have documented permissions
- [ ] Error responses follow the standard format
- [ ] HTTP status codes are correct for each scenario
- [ ] Rate limiting is documented

### 16.5 Security Review

- [ ] Tenant isolation verified (every query includes tenant filter)
- [ ] Authorization checked at controller level (Guards)
- [ ] Sensitive data is encrypted at rest
- [ ] No secrets in source control
- [ ] Audit logging covers all state changes
- [ ] Rate limiting is implemented on all endpoints

### 16.6 Performance Review

- [ ] No N+1 query patterns
- [ ] Indexes cover all common query patterns
- [ ] Caching strategy documented for read-heavy entities
- [ ] Async processing for operations >2 seconds
- [ ] Bulk operations are batched appropriately

### 16.7 Testing Review

- [ ] Test scenarios cover all business rules
- [ ] Test scenarios cover all lifecycle transitions
- [ ] Test scenarios cover all error conditions
- [ ] Test scenarios cover tenant isolation
- [ ] Test scenarios cover concurrent operations
- [ ] Test scenarios cover cross-domain event consumption

---

## 17. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-20 | Initial creation — Platform-wide engineering standards derived from 10 approved V1 domain specifications |

---

*This document is the engineering constitution for OpenSchool ERP. All engineering specifications and implementations must comply with this standard. Changes require architecture review.*
