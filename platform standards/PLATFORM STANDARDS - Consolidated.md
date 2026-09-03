# OpenSchool ERP — Platform Standards

**Consolidated Reference — All Platform Governing Documents**

| Aspect | Detail |
|--------|--------|
| **Document** | Platform Standards (Consolidated) |
| **Status** | Approved |
| **Version** | 1.0.0 |
| **Date** | 2026-07-20 |
| **Author** | Platform Architecture Team |
| **Review Cycle** | Quarterly |

---

## Document Inventory

| # | Document | Lines | Description |
|---|----------|-------|-------------|
| 01 | Engineering Standards | 978 | Platform-wide naming, entity, audit, lifecycle, validation, API, security, and performance standards |
| 02 | Cross-Domain Integration Specification | 1,484 | Domain ownership, dependency matrices, 15 workflows, integration patterns, failure handling |
| 03 | Platform Event Catalogue | 3,153 | 99 domain events across 10 domains, categories, ordering, versioning, delivery, consumer matrix |
| 04 | API Style Guide | 2,360 | REST conventions, URL standards, request/response standards, error model, security, versioning |
| 05 | Development Standards | 3,169 | Backend/frontend architecture, Prisma conventions, testing, Git, code review, AI-assisted development |
| 06 | DevOps & Deployment Standards | 2,058 | Infrastructure, CI/CD, environments, monitoring, security, backup, scalability, runbooks |

**Total: ~13,200 lines across 6 documents**

---

## Quick Reference by Topic

| Topic | Primary Document | Section |
|-------|-----------------|---------|
| Naming conventions | 01 Engineering Standards | §3 |
| Entity standards | 01 Engineering Standards | §4 |
| Audit standards | 01 Engineering Standards | §5 |
| Lifecycle patterns | 01 Engineering Standards | §6 |
| Event standards | 01 Engineering Standards | §7 |
| Validation rules | 01 Engineering Standards | §8 |
| Error format | 01 Engineering Standards | §9 |
| API standards | 01 Engineering Standards | §10 |
| Multi-tenant isolation | 01 Engineering Standards | §11 |
| Security standards | 01 Engineering Standards | §12 |
| Performance standards | 01 Engineering Standards | §13 |
| Domain ownership | 02 Integration Spec | §3 |
| Dependency matrices | 02 Integration Spec | §4 |
| Integration patterns | 02 Integration Spec | §5 |
| Event-driven communication | 02 Integration Spec | §6 |
| Transaction boundaries | 02 Integration Spec | §7 |
| Cross-domain workflows | 02 Integration Spec | §8 |
| Event catalogue (all 99) | 03 Event Catalogue | §7 |
| Event categories | 03 Event Catalogue | §8 |
| Consumer matrix | 03 Event Catalogue | §12 |
| URL standards | 04 API Style Guide | §4 |
| HTTP methods | 04 API Style Guide | §5 |
| Request/response envelope | 04 API Style Guide | §6-7 |
| Pagination | 04 API Style Guide | §8 |
| Error model | 04 API Style Guide | §17 |
| Backend architecture | 05 Dev Standards | §4-5 |
| Prisma conventions | 05 Dev Standards | §6 |
| Frontend (Flutter) | 05 Dev Standards | §7-8 |
| Testing strategy | 05 Dev Standards | §11 |
| Git workflow | 05 Dev Standards | §13 |
| AI-assisted development | 05 Dev Standards | §18 |
| CI/CD pipeline | 06 DevOps Standards | §8 |
| Environment strategy | 06 DevOps Standards | §4 |
| Monitoring | 06 DevOps Standards | §11 |
| Backup & DR | 06 DevOps Standards | §14 |
| Operational runbooks | 06 DevOps Standards | §16 |

---



---

# PAGE BREAK

---


# OpenSchool ERP â€” Engineering Standards

**Platform-Wide Engineering Standards Manual**

| Aspect | Detail |
|--------|--------|
| Document | Engineering Standards |
| Scope | All V1 engineering specifications and future implementations |
| Status | Approved â€” Active |
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

Domain engineering specifications define **what** to build â€” business rules, entities, aggregates, events, and APIs specific to a domain. This document defines **how** to build â€” platform-wide conventions that every domain must follow.

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
| SOLID | Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion â€” applied at aggregate, service, and module boundaries. |
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
| Object Storage | S3-compatible | â€” |
| CI/CD | GitHub Actions | Latest stable |
| Validation | class-validator + class-transformer | Latest stable |
| Testing | Jest | ^30.0.0 |
| API Documentation | Swagger/OpenAPI | ^7.0.0 |
| Authentication | JWT + bcrypt | â€” |

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
EntityName: Draft â†’ Active â†’ Archived
```

- Parenthesized states indicate terminal or exceptional transitions:
  ```
  StudentClassEnrollment: Enrolled â†’ Active â†’ (Transferred) â†’ (Withdrawn)
  ```
- Reverse transitions are noted explicitly:
  ```
  ReportDefinition: DRAFT â†’ PUBLISHED â†’ ARCHIVED â†’ DRAFT (revise)
  ```

### 6.3 Lifecycle Principles

1. **Status enums represent business states**, not deletion markers
2. **Soft delete is separate from lifecycle** â€” an entity can be ACTIVE and soft-deleted simultaneously
3. **Transitions are validated** â€” not all transitions are valid from every state
4. **Transitions are audited** â€” every state change generates an audit log entry
5. **Transitions are published** â€” state changes emit domain events for cross-domain consumption
6. **Terminal states are irreversible** â€” ARCHIVED and WITHDRAWN cannot be reversed without explicit restore operations

### 6.4 Common Lifecycle Patterns

**Calendar Entities (Academic Year, Session, Term):**
```
Draft â†’ Active â†’ Closed
```

**Content Entities (Subject, GradeScale, Policy):**
```
Draft â†’ Active â†’ Inactive
```

**Document Entities (Assignment, Assessment):**
```
Draft â†’ Published â†’ Closed
```

**Result Entities (Result, ReportCard):**
```
Compiled â†’ Approved â†’ Published (immutable after Published)
```

**Financial Entities (Invoice, Bill):**
```
Draft â†’ Generated â†’ Published â†’ (Partially Paid) â†’ Paid / Overdue / Written Off / Cancelled
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

1. **DTO Validation** â€” class-validator decorators on DTO properties (required, length, format, range)
2. **Service Validation** â€” domain-specific business rules enforced before persistence
3. **Database Validation** â€” unique constraints, foreign keys, check constraints, enum types

### 8.2 Validation Rules Format

Validation rules are documented in engineering specifications as:

| Rule ID | Description |
|---------|-------------|
| V-{ENTITY}-{NN} | Validation rule description |

Example:

| Rule | Description |
|------|-------------|
| V-AY-01 | Name: required, 1â€“50 chars, unique within Institution |
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
- Authorization flow: JwtAuthGuard â†’ TenantGuard â†’ InstitutionGuard â†’ ResourceGuard â†’ ModuleLicenseGuard â†’ controller execution

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
5. Phase 1 â€” Domain Analysis (entities, lifecycle, business rules, events, assumptions)
6. Phase 2 â€” Domain Design (aggregates, relationships, services, invariants, policies, validation rules, read models)
7. Phase 3 â€” Database Design (table catalogue, column catalogue, constraints, indexes)
8. Phase 4 â€” Prisma Schema (enums, models, validation)
9. Phase 5 â€” Backend Implementation (modules, repositories, services, controllers, guards, events, transactions, key flows)
10. Phase 6 â€” API Design (endpoint catalogue, common parameters, resource groups)
11. Phase 7 â€” Testing & Verification (test categories, scenarios, production readiness)
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
| 1.0.0 | 2026-07-20 | Initial creation â€” Platform-wide engineering standards derived from 10 approved V1 domain specifications |

---

*This document is the engineering constitution for OpenSchool ERP. All engineering specifications and implementations must comply with this standard. Changes require architecture review.*



---

# PAGE BREAK

---


# OpenSchool ERP â€” Cross-Domain Integration Specification

**Platform-Wide Integration Reference**

| Aspect | Detail |
|--------|--------|
| Document | Cross-Domain Integration Specification |
| Scope | All domain-to-domain communication, event flows, workflows, and boundary rules |
| Status | Approved â€” Frozen for Implementation |
| Version | 1.0.0 |
| Effective Date | 2026-07-20 |
| Authority | Derived from 10 approved V1 domain specifications and Engineering Standards |
| Governing Standard | 01 Engineering Standards.md |

---

## Table of Contents

1. [Scope](#1-scope)
2. [Integration Principles](#2-integration-principles)
3. [Domain Ownership Matrix](#3-domain-ownership-matrix)
4. [Domain Dependency Matrix](#4-domain-dependency-matrix)
5. [Integration Patterns](#5-integration-patterns)
6. [Event-Driven Communication](#6-event-driven-communication)
7. [Transaction Boundaries](#7-transaction-boundaries)
8. [Cross-Domain Workflows](#8-cross-domain-workflows)
9. [Read Models & Reporting](#9-read-models--reporting)
10. [Failure Handling](#10-failure-handling)
11. [External Integrations](#11-external-integrations)
12. [Security](#12-security)
13. [Performance](#13-performance)
14. [Architecture Decision Records](#14-architecture-decision-records)
15. [Integration Review Checklist](#15-integration-review-checklist)
16. [Future Expansion](#16-future-expansion)
17. [Revision History](#17-revision-history)

---

## 1. Scope

### 1.1 Purpose

This document is the single authoritative reference for all domain-to-domain communication in the OpenSchool ERP platform. It defines how the 10 V1 domains interact, which events flow between them, what data references cross domain boundaries, and how cross-domain workflows maintain consistency without violating domain boundaries.

### 1.2 Applicability

This specification applies to:

- All 10 approved V1 domain engineering specifications
- All future V2, V3, and V4 domain specifications
- All implementation code involving cross-domain communication
- All event producers and consumers
- All cross-domain foreign key references
- All cross-domain workflow implementations

### 1.3 Relationship to Domain Specifications

Domain engineering specifications define **what** each domain does â€” its entities, business rules, aggregates, and APIs. This document defines **how** domains talk to each other â€” the contracts, events, data references, and workflows that connect them.

When this document conflicts with a domain specification regarding integration behavior, this document takes precedence.

### 1.4 Relationship to Engineering Standards

This document complies with and extends `01 Engineering Standards.md`. It does not duplicate standards already defined there (naming conventions, entity standards, audit standards, event envelope format, etc.). Instead, it focuses exclusively on cross-domain concerns.

---

## 2. Integration Principles

### 2.1 Core Integration Rules

| Rule | Description |
|------|-------------|
| **No cross-domain DB queries** | Domains never query each other's database tables directly. All cross-domain data access uses domain events or application-level guards. |
| **No shared mutable tables** | No table is owned by more than one domain. Each table has exactly one owning domain. |
| **No distributed transactions** | Cross-domain consistency is achieved through eventual consistency via domain events, not two-phase commit. |
| **Events are the integration bus** | All cross-domain communication flows through domain events published via EventEmitter2. |
| **Consumer idempotency** | Every event consumer must be idempotent â€” processing the same event twice must produce the same result. |
| **Tenant isolation is absolute** | No cross-tenant data access, event consumption, or API calls under any circumstances. |
| **Domain ownership is sacred** | Each domain owns its data, its business rules, and its calculations. Finance owns all financial calculation. Communication owns all delivery. People owns all identity. |

### 2.2 Integration Architecture Overview

```mermaid
graph TB
    subgraph "Identity & Access"
        IA[Identity & Access]
    end
    subgraph "Institution Management"
        IM[Institution Management]
    end
    subgraph "People"
        P[People]
    end
    subgraph "Academic Management"
        AM[Academic Management]
    end
    subgraph "Finance"
        F[Finance]
    end
    subgraph "Communication"
        C[Communication]
    end
    subgraph "Operations"
        O[Operations]
    end
    subgraph "Documents & Learning"
        DL[Documents & Learning]
    end
    subgraph "Reporting & Analytics"
        RA[Reporting & Analytics]
    end
    subgraph "Platform Administration"
        PA[Platform Administration]
    end

    IA --> P
    IA --> AM
    IA --> F
    IA --> C
    IA --> O
    IA --> DL
    IA --> RA
    IA --> PA
    IM --> P
    IM --> AM
    IM --> F
    IM --> C
    IM --> O
    IM --> DL
    IM --> RA
    IM --> PA
    P --> AM
    P --> F
    P --> C
    P --> O
    P --> DL
    P --> RA
    P --> PA
    AM --> F
    AM --> C
    AM --> DL
    AM --> RA
    F --> C
    F --> O
    F --> DL
    F --> PA
    C --> RA
    O --> C
    O --> F
    O --> RA
    DL --> C
    DL --> RA
    RA --> PA
    PA --> C
```

### 2.3 Domain Role Classification

| Role | Domains | Description |
|------|---------|-------------|
| **Foundation** | Identity & Access, Institution Management | Provides authentication, authorization, tenant context, and institution configuration. All other domains depend on these. |
| **Core** | People, Academic Management, Finance | Manages the primary school operations: people, academics, and money. These are the most interconnected domains. |
| **Service** | Communication, Operations, Documents & Learning | Provides supporting services: messaging, logistics, and document management. Heavily consume events from core domains. |
| **Insight** | Reporting & Analytics, Platform Administration | Aggregates data from all domains for analytics, monitoring, and platform management. Read-only consumers of most domain data. |

---

## 3. Domain Ownership Matrix

### 3.1 Entity Ownership

Each entity is owned by exactly one domain. No entity may be shared or duplicated across domains.

| Domain | Owned Entities | Total |
|--------|---------------|-------|
| **Identity & Access** | users, roles, permissions, permission_groups, sessions, refresh_tokens, mfa_settings, audit_logs, api_keys, permission_groups_api_keys | 10 |
| **Institution Management** | institutions, organization_users, academic_calendars, institution_modules, module_licenses, institution_branding, domain_whitelists, institution_feature_flags | 8 |
| **People** | persons, person_institutions, students, student_enrollments, staff, staff_assignments, parents, parent_student_links, guardians, guardian_student_links, student_transfers | 11 |
| **Academic Management** | academic_years, academic_sessions, terms, grade_levels, departments, subjects, subject_groups, arms, student_class_enrollments, teaching_assignments, timetable_slots, attendance, academic_progression, assessment_types, assessments, assessment_scores, results, result_publishing_rules, report_card_templates, report_cards, summer_school_programs, summer_school_registrations, summer_school_results | 23 |
| **Finance** | financial_periods, fee_schedules, fee_schedule_items, fee_categories, bills, bill_items, invoices, invoice_items, payments, payment_allocations, discounts, discount_applications, overpayments, scholarships, scholarship_awards, scholarship_criteria, refunds, refund_items, installment_plans, installment_plan_items | 20 |
| **Communication** | notifications, notification_preferences, notification_templates, notification_groups, recipient_group_members, messages, conversations, conversation_members, campaigns, campaign_recipients, announcements, announcement_recipients, delivery_logs, digest_schedules | 14 |
| **Operations** | library_books, book_copies, borrowings, reservations, hostel_buildings, hostel_rooms, hostel_beds, hostel_room_allocations, transport_routes, transport_stops, transport_vehicles, transport_assignments, medical_records, clinic_visits, clinic_medications, incidents, incident_witnesses, incident_attachments, assets, asset_maintenance, inventory_items, inventory_transactions, maintenance_requests, work_orders | 24 |
| **Documents & Learning** | documents, document_versions, document_shares, document_permissions, document_access_logs, templates, generated_documents, learning_resources, learning_resource_links, assessment_contents, retention_policies, document_retention_schedules | 12 |
| **Reporting & Analytics** | report_definitions, report_executions, report_schedules, report_shares, report_bookmarks, dashboards, dashboard_widgets, dashboard_shares, kpi_definitions, kpi_alerts, analytics_snapshots, export_jobs | 12 |
| **Platform Administration** | tenants, tenant_subscriptions, licenses, license_usage, license_entitlements, feature_flags, feature_flag_overrides, integration_registries, integration_providers, tenant_integrations, api_keys, webhook_registrations, webhook_event_subscriptions, webhook_delivery_logs, platform_policies, policy_exceptions, policy_versions, automation_templates, automation_definitions, automation_executions | 20 |

### 3.2 Data Ownership Boundaries

```mermaid
graph LR
    subgraph "Foundation Layer"
        IA[Identity & Access<br/>Users, Roles, Permissions]
        IM[Institution Mgmt<br/>Institutions, Config]
    end

    subgraph "Core Layer"
        P[People<br/>Students, Staff, Parents]
        AM[Academic Mgmt<br/>Classes, Results, Attendance]
        F[Finance<br/>Bills, Payments, Invoices]
    end

    subgraph "Service Layer"
        C[Communication<br/>Notifications, Messages]
        O[Operations<br/>Library, Hostel, Transport]
        DL[Documents & Learning<br/>Documents, Resources]
    end

    subgraph "Insight Layer"
        RA[Reporting & Analytics<br/>Reports, Dashboards, KPIs]
        PA[Platform Admin<br/>Tenants, Subscriptions]
    end

    IA -.->|auth context| P
    IA -.->|auth context| AM
    IA -.->|auth context| F
    IM -.->|tenant context| P
    IM -.->|tenant context| AM
    IM -.->|tenant context| F

    P -.->|person records| AM
    P -.->|person records| F
    AM -.->|academic context| F

    C -.->|consumes events| P
    C -.->|consumes events| AM
    C -.->|consumes events| F
    O -.->|consumes events| P
    O -.->|consumes events| F
    DL -.->|consumes events| AM
    DL -.->|consumes events| F

    RA -.->|reads events| all[All Domains]
    PA -.->|reads events| all
```

---

## 4. Domain Dependency Matrix

### 4.1 Dependency Summary

| Dependent Domain | Depends On |
|-----------------|------------|
| **Identity & Access** | â€” (foundation) |
| **Institution Management** | Identity & Access |
| **People** | Identity & Access, Institution Management |
| **Academic Management** | Identity & Access, Institution Management, People, Finance (billing) |
| **Finance** | Identity & Access, Institution Management, People, Academic Management (sessions, terms) |
| **Communication** | Identity & Access, Institution Management, People, Academic Management (events), Finance (events) |
| **Operations** | Identity & Access, Institution Management, People, Academic Management (sessions), Finance (billing), Communication (notifications) |
| **Documents & Learning** | Identity & Access, Institution Management, People, Academic Management (subjects, results), Finance (invoices, payments) |
| **Reporting & Analytics** | Identity & Access, Institution Management, People (events), Academic Management (events), Finance (events), Communication (events), Operations (events), Documents & Learning (events), Platform Administration (events) |
| **Platform Administration** | Identity & Access, Institution Management, People (license counts), Finance (subscriptions), Communication (delivery) |

### 4.2 Dependency Depth

```mermaid
graph TD
    IA[Identity & Access] --> IM[Institution Management]
    IM --> P[People]
    P --> AM[Academic Management]
    P --> F[Finance]
    AM --> F
    P --> C[Communication]
    AM --> C
    F --> C
    P --> O[Operations]
    AM --> O
    F --> O
    AM --> DL[Documents & Learning]
    F --> DL
    C --> RA[Reporting & Analytics]
    O --> RA
    DL --> RA
    PA[Platform Administration] --> C

    style IA fill:#f9f,stroke:#333
    style IM fill:#f9f,stroke:#333
    style P fill:#bbf,stroke:#333
    style AM fill:#bbf,stroke:#333
    style F fill:#bbf,stroke:#333
    style C fill:#bfb,stroke:#333
    style O fill:#bfb,stroke:#333
    style DL fill:#bfb,stroke:#333
    style RA fill:#fdb,stroke:#333
    style PA fill:#fdb,stroke:#333
```

### 4.3 Most-Referenced External Tables

| Table | Referencing Domains | Count |
|-------|-------------------|-------|
| `institutions` | People, Academic Management, Finance, Communication, Operations, Documents & Learning, Reporting & Analytics, Platform Administration | 9 |
| `students` | Academic Management, Finance, Communication, Documents & Learning | 4 |
| `staff` | Academic Management, Communication | 2 |
| `parents` | Finance, Communication | 2 |
| `users` | Operations, Communication | 2 |
| `academic_sessions` | Finance, Documents & Learning | 2 |
| `terms` | Finance | 1 |
| `subjects` | Documents & Learning | 2 |
| `roles` | Reporting & Analytics | 1 |

---

## 5. Integration Patterns

### 5.1 Pattern Catalog

| Pattern | Description | When to Use |
|---------|-------------|-------------|
| **Domain Event Publishing** | Publisher emits an event after transaction commit; consumers react asynchronously | When a domain state change needs to trigger action in another domain |
| **Event Consumer** | Consumer class subscribes to specific events; processes them idempotently | When a domain needs to react to another domain's state changes |
| **Cross-Domain FK Reference** | Foreign key references a table in another domain; application-level guard prevents orphaned references | When a domain entity must reference a person, institution, or academic entity |
| **Read Model Projection** | Reporting & Analytics consumes events to build denormalized read models | When cross-domain queries would otherwise be required |
| **Application-Level Guard** | Service validates referenced entity exists and is in valid state before persistence | When creating or updating entities with cross-domain FK references |
| **Saga (Choreography)** | Multi-step workflow coordinated through event chains without a central coordinator | When a business process spans 3+ domains and requires sequential steps |

### 5.2 Pattern: Domain Event Publishing

```mermaid
sequenceDiagram
    participant Publisher as Publishing Domain
    participant DB as PostgreSQL
    participant EventBus as EventEmitter2
    participant Consumer as Consuming Domain

    Publisher->>DB: Begin transaction
    Publisher->>DB: Persist state change
    Publisher->>DB: Commit transaction
    Publisher->>EventBus: Publish event (after commit)
    EventBus->>Consumer: Deliver event
    Consumer->>Consumer: Validate idempotency
    Consumer->>Consumer: Process event
    Consumer->>DB: Persist reaction (own domain)
```

### 5.3 Pattern: Cross-Domain FK with Application Guard

```mermaid
sequenceDiagram
    participant API as API Layer
    participant Service as Domain Service
    participant Guard as Application Guard
    participant DB as PostgreSQL

    API->>Service: Create entity with cross-domain FK
    Service->>Guard: Validate referenced entity exists
    Guard->>DB: Query referenced entity (tenant-scoped)
    DB-->>Guard: Entity found or not found
    Guard-->>Service: Validation result
    alt Entity valid
        Service->>DB: Persist entity
        DB-->>Service: Persisted
        Service-->>API: Entity created
    else Entity not found
        Service-->>API: Error: Referenced entity not found
    end
```

### 5.4 Pattern: Saga (Choreography)

```mermaid
sequenceDiagram
    participant D1 as Domain A
    participant E1 as Event Bus
    participant D2 as Domain B
    participant E2 as Event Bus
    participant D3 as Domain C

    D1->>E1: DomainAActionCompleted
    E1->>D2: DomainAActionCompleted
    D2->>D2: Process action
    D2->>E2: DomainBActionCompleted
    E2->>D3: DomainBActionCompleted
    D3->>D3: Process action
    D3->>E2: DomainCActionCompleted
```

---

## 6. Event-Driven Communication

### 6.1 Event Infrastructure

All cross-domain events use the standard event envelope defined in `01 Engineering Standards.md` Section 7.2:

| Field | Type | Description |
|-------|------|-------------|
| eventId | uuid | Unique event identifier; deduplication key |
| eventVersion | int | Monotonically increasing per event type |
| schemaVersion | string | Payload schema version |
| occurredAt | timestamptz | When the event occurred |
| correlationId | uuid | Groups related events across a single user action |
| causationId | uuid | ID of the event or command that caused this event |
| tenantId | uuid | Tenant context |
| actorId | uuid | User who triggered the event |
| payload | jsonb | Event-specific data |

### 6.2 Event Publishing Rules

1. Events are published **after transaction commit**, never inside the transaction
2. Events are published **synchronously within the process** via EventEmitter2
3. Events carry **tenant context** in the envelope; consumers must respect tenant boundaries
4. Events carry **actor context**; consumers may log the original actor for audit purposes
5. Future migration to BullMQ/Redis is anticipated but not yet required

### 6.3 Event Consumer Rules

1. Consumers must be **idempotent** â€” check `eventId` before processing
2. Processed `eventId` values stored with minimum **72-hour TTL**
3. Consumers **may not query** the publisher's domain tables
4. Consumers **may read** data from their own domain that was previously populated by events
5. Consumers **must handle** out-of-order delivery (no ordering guarantee across aggregates)
6. Failed processing is retried with **exponential backoff** (max 3 retries)

### 6.4 Complete Event Catalog

#### 6.4.1 Identity & Access â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| UserCreated | New user account created | Communication (welcome email), People (person record sync) |
| UserUpdated | User profile updated | People (person sync) |
| UserDeactivated | User account deactivated | People (person status sync), Operations (asset return trigger) |
| PasswordResetRequested | Password reset requested | Communication (reset email) |
| MFAEnabled | MFA enabled on account | Communication (security notification) |
| AccountLocked | Account locked due to failed attempts | Communication (security alert) |
| PlatformAdminLogin | Platform admin logged in | Platform Administration (audit) |
| PlatformAdminLogout | Platform admin logged out | Platform Administration (audit) |

#### 6.4.2 Institution Management â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| InstitutionCreated | New institution provisioned | Communication (setup welcome), Documents & Learning (default templates) |
| AcademicCalendarConfigured | Academic calendar set up | Academic Management (session/term creation trigger) |
| UserInvited | User invited to institution | Communication (invitation email) |
| InstitutionSettingsUpdated | Institution settings changed | Communication (settings sync), Reporting & Analytics (cache refresh) |
| ModuleActivated | Institution module activated | Academic Management, Finance, Operations (enable module features) |
| ModuleDeactivated | Institution module deactivated | Academic Management, Finance, Operations (disable module features) |

#### 6.4.3 People â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| StudentEnrolled | Student enrollment created | Academic Management (class enrollment), Finance (fee assignment), Communication (welcome), Operations (medical record), Documents & Learning (document setup), Reporting & Analytics (enrollment count), Platform Administration (license count) |
| StudentTransferred | Student transferred between institutions | Academic Management (enrollment sync), Finance (billing adjustment), Communication (notification) |
| StudentWithdrawn | Student withdrawn from institution | Academic Management (enrollment removal), Finance (final billing), Communication (notification), Operations (checkout trigger), Documents & Learning (archival), Platform Administration (license count) |
| StudentGraduated | Student graduated | Academic Management (progression), Communication (notification), Operations (checkout trigger), Documents & Learning (archival) |
| StaffHired | Staff member hired | Academic Management (teaching assignment), Communication (onboarding), Operations (medical record, asset assignment), Reporting & Analytics (staff count), Platform Administration (license count) |
| StaffSeparated | Staff member separated | Academic Management (teaching assignment removal), Communication (notification), Operations (asset return), Documents & Learning (archival), Platform Administration (license count) |
| ParentLinked | Parent linked to student | Communication (notification) |

#### 6.4.4 Academic Management â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| TermActivated | Term status â†’ Active | Communication (term start notification) |
| TermClosed | Term status â†’ Closed | Documents & Learning (retention trigger), Reporting & Analytics (term metrics) |
| StudentClassEnrolled | Student enrolled in class | People (enrollment sync) |
| StudentClassTransferred | Student transferred between classes | People (enrollment sync) |
| AssignmentPublished | Assignment published to students | Communication (notification) |
| AssignmentSubmitted | Student submitted assignment | Communication (notification) |
| AssignmentReturned | Assignment returned with feedback | Communication (notification) |
| AssessmentPublished | Assessment published | Communication (notification) |
| ResultPublished | Results published to students | Communication (notification), Documents & Learning (report card), Reporting & Analytics (result metrics) |
| ReportCardGenerated | Report card generated | Communication (notification) |
| ReportCardPublished | Report card published | Communication (notification) |
| StudentPromoted | Student promoted to next grade | People (progression sync), Communication (notification) |
| StudentRetained | Student retained in current grade | Communication (notification) |
| StudentGraduated | Student graduated | People (graduation sync), Communication (notification), Documents & Learning (archival), Operations (checkout) |
| StudentWithdrawn | Student withdrawn from institution | People (withdrawal sync), Communication (notification) |
| StudentPlacedOnProbation | Student placed on academic probation | Communication (notification) |
| SummerSchoolRegistered | Student registered for Summer School | Communication (notification), Finance (billing trigger) |
| SummerSchoolResultPublished | Summer School result published | People (result sync), Communication (notification) |

#### 6.4.5 Finance â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| BillGenerated | Bill generated for student | Communication (notification) |
| InvoiceGenerated | Invoice created from bill | Communication (notification), Documents & Learning (invoice document) |
| InvoicePublished | Invoice finalized and sent | Communication (notification) |
| InvoiceOverdue | Invoice past due date | Communication (reminder), Operations (follow-up flag) |
| PaymentConfirmed | Payment verified and confirmed | Communication (receipt), Documents & Learning (receipt document), Operations (fine clearance) |
| PaymentFailed | Payment failed | Communication (alert) |
| OverpaymentCreated | Excess payment received | Communication (notification) |
| RefundProcessed | Refund completed | Communication (confirmation) |
| RefundRequested | Refund submitted | Communication (notification) |
| RefundRejected | Refund rejected | Communication (notification) |
| ScholarshipAwarded | Scholarship awarded to student | Communication (notification) |
| InstallmentOverdue | Installment past due | Communication (reminder) |
| SummerSchoolBillingRequested | Billing request from Academic Management | â€” |
| SummerSchoolInvoiceGenerated | Summer School invoice created | Communication (notification) |

#### 6.4.6 Communication â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| NotificationDispatched | Notification queued for delivery | Reporting & Analytics (delivery metrics) |
| NotificationDelivered | Provider confirms delivery | Reporting & Analytics (delivery metrics) |
| NotificationRead | Recipient opens in-app notification | Reporting & Analytics |
| NotificationFailed | All delivery attempts exhausted | Platform Administration (alerting) |
| CampaignCompleted | All campaign notifications delivered | Reporting & Analytics |
| AnnouncementPublished | Announcement made active | â€” |
| MessageSent | Conversation message delivered | â€” |

#### 6.4.7 Operations â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| BookBorrowed | Book copy checked out | Reporting & Analytics (library analytics) |
| BookReturned | Book copy returned | Finance (fine waiver), Reporting & Analytics |
| BookOverdue | Borrowing past due date | Communication (overdue reminder), Finance (fine creation) |
| RoomAllocated | Bed allocated to student | Communication (notification), Reporting & Analytics |
| RoomDeallocated | Bed released from student | Communication (notification) |
| TransportAssigned | Student/staff assigned to route | Communication (notification) |
| VisitorCheckedIn | Visitor badge activated | Reporting & Analytics (visitor analytics) |
| MedicalRecordUpdated | Medical record modified | Communication (alert if critical) |
| ClinicVisitRecorded | Clinic visit logged | Communication (parent notification) |
| IncidentReported | Incident report created | Communication (alert) |
| WorkOrderCompleted | Work order finished | Communication (notification), Reporting & Analytics |
| StockDroppedBelowReorder | Stock fell below threshold | Communication (reorder alert) |
| MaintenanceRequested | Maintenance request submitted | Communication (notification) |
| WorkOrderCreated | Work order authorised | Communication (notification) |

#### 6.4.8 Documents & Learning â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| DocumentPublished | Document status â†’ PUBLISHED | Communication (notification) |
| DocumentShared | Share record created | Communication (notification) |
| TemplatePublished | Template approved and published | Communication |
| GeneratedDocumentCreated | Document generated from template | Communication (delivery) |
| LearningResourcePublished | Resource published to students | Communication (notification) |
| AssessmentContentPublished | Assessment content published | Communication (notification) |
| RetentionEnforced | Background job enforced retention | â€” |

#### 6.4.9 Reporting & Analytics â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| ExportJobCompleted | Export file generated | Communication (delivery) |
| KpiThresholdBreached | KPI exceeded threshold | Communication (alert) |

#### 6.4.10 Platform Administration â€” Published Events

| Event | Trigger | Cross-Domain Consumers |
|-------|---------|----------------------|
| TenantProvisioned | Tenant successfully provisioned | Communication (welcome), Reporting & Analytics (analytics) |
| TenantActivated | Tenant transitions to ACTIVE | Communication (notification) |
| TenantSuspended | Tenant transitions to SUSPENDED | Communication (alert) |
| TenantArchived | Tenant transitions to ARCHIVED | Communication (alert) |
| TenantRestored | Tenant restored from ARCHIVED | Communication (notification) |
| TenantDeleted | Tenant permanently deleted | All domains (cleanup) |
| SubscriptionCreated | New subscription created | Finance (billing) |
| SubscriptionRenewed | Subscription renewed | Finance (billing) |
| SubscriptionExpired | Subscription past expiration date | Communication (alert) |
| LicenseLimitExceeded | Tenant exceeds license limit | Communication (alert) |
| SecurityAlertTriggered | Security event detected | Communication (urgent alert) |
| MaintenanceScheduled | Maintenance window scheduled | Communication (all tenants) |
| MaintenanceStarted | Maintenance window began | Communication (all tenants) |
| MaintenanceCompleted | Maintenance window ended | Communication (all tenants) |
| WebhookDeliveryFailed | Webhook delivery exhausted retries | Communication (alert) |
| PlatformPolicyChanged | Platform policy version updated | All domains (re-evaluate) |

### 6.5 Event Flow Matrix

The following matrix shows which domains consume events from which publishers:

| Consumer â†“ \ Publisher â†’ | IA | IM | P | AM | F | C | O | DL | RA | PA |
|--------------------------|----|----|---|----|----|----|----|-----|----|----|
| **Communication** | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | â€” | â€” | â€” | â€” | âœ“ |
| **Academic Management** | â€” | âœ“ | âœ“ | â€” | â€” | â€” | â€” | â€” | â€” | â€” |
| **Finance** | â€” | â€” | âœ“ | âœ“ | â€” | â€” | â€” | â€” | â€” | âœ“ |
| **People** | â€” | â€” | â€” | âœ“ | â€” | â€” | â€” | â€” | â€” | â€” |
| **Operations** | â€” | â€” | âœ“ | âœ“ | âœ“ | â€” | â€” | â€” | â€” | â€” |
| **Documents & Learning** | â€” | âœ“ | âœ“ | âœ“ | âœ“ | â€” | â€” | â€” | â€” | â€” |
| **Reporting & Analytics** | â€” | â€” | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | â€” | âœ“ |
| **Platform Administration** | â€” | â€” | âœ“ | â€” | âœ“ | âœ“ | â€” | â€” | â€” | â€” |

### 6.6 Event Count Summary

| Domain | Events Published | Events Consumed (unique bindings) |
|--------|-----------------|----------------------------------|
| Identity & Access | 8 | 0 |
| Institution Management | 6 | 0 |
| People | 7 | 1 (Identity & Access: UserCreated) |
| Academic Management | 18 | 5 (Institution, People, Finance, Academic self-consumers) |
| Finance | 14 | 4 (People, Academic, Finance self-consumers, Platform Admin) |
| Communication | 7 | 8 (Identity, Institution, People, Academic, Finance, Operations, Documents, Platform Admin) |
| Operations | 14 | 4 (People, Academic, Finance, Platform Admin) |
| Documents & Learning | 7 | 5 (Institution, People, Academic, Finance, Documents self-consumers) |
| Reporting & Analytics | 2 | 8 (all domains except Communication self-consumers) |
| Platform Administration | 16 | 4 (People, Finance, Communication, Platform Admin self-consumers) |

---

## 7. Transaction Boundaries

### 7.1 Single-Domain Transactions

Each domain operation executes within a single database transaction scoped to that domain. No operation spans multiple domain transactions.

```
Domain A Transaction:
  BEGIN
    -- Domain A state changes
    -- Domain A entity persistence
  COMMIT
  -- Events published AFTER commit
  EventBus.emit(EventA)
```

### 7.2 Cross-Domain Consistency

Cross-domain consistency is **eventually consistent** via domain events. There is no two-phase commit or distributed transaction.

| Consistency Level | Description | Example |
|-------------------|-------------|---------|
| **Strong** | Within a single aggregate, within a single domain | Student enrollment and class assignment in Academic Management |
| **Eventual** | Across domains, via event consumption | Student enrollment in People â†’ fee assignment in Finance |
| **Deferred** | Multi-step saga via event chains | Student graduation â†’ checkout (Finance â†’ Operations â†’ Communication â†’ Documents) |

### 7.3 Transaction Scope Rules

| Rule | Description |
|------|-------------|
| **One domain per transaction** | A single database transaction must not span multiple domain boundaries |
| **Events after commit** | Domain events are published only after the transaction commits successfully |
| **Consumer transactions are independent** | Each consumer processes events within its own transaction |
| **No event-driven rollback** | If a consumer fails, the publisher's transaction is not affected |
| **Idempotency over atomicity** | Cross-domain consistency is achieved through idempotent consumers, not distributed locks |

### 7.4 Compensation Pattern

When a downstream consumer cannot process an event (e.g., business rule violation), the consumer logs the failure and the publishing domain is not affected. Compensation is handled at the application level:

```
Consumer receives EventA
  â†’ Validates business rules
  â†’ If valid: processes and persists
  â†’ If invalid: logs failure, emits CompensationNeeded event
  â†’ Compensation handler notifies admin or triggers manual review
```

---

## 8. Cross-Domain Workflows

### 8.1 Workflow Index

| # | Workflow | Domains Involved | Trigger |
|---|----------|-----------------|---------|
| 1 | New Student Enrollment â†’ Fee Generation | People â†’ Finance â†’ Communication | StudentEnrolled event |
| 2 | Result Publication â†’ Report Card â†’ Notification | Academic â†’ Documents & Learning â†’ Communication | ResultPublished event |
| 3 | Payment Confirmation â†’ Receipt â†’ Notification | Finance â†’ Documents & Learning â†’ Communication | PaymentConfirmed event |
| 4 | Summer School Registration â†’ Billing â†’ Invoice | Academic â†’ Finance â†’ Communication | SummerSchoolRegistered event |
| 5 | Staff Hiring â†’ Onboarding Cascade | People â†’ Academic, Communication, Operations, Platform Admin | StaffHired event |
| 6 | Student Graduation â†’ Checkout Cascade | People â†’ Academic, Finance, Operations, Communication, Documents & Learning | StudentGraduated event |
| 7 | Book Borrowing â†’ Fine â†’ Payment â†’ Clearance | Operations â†’ Finance â†’ Operations | BookOverdue â†’ PaymentConfirmed |
| 8 | Hostel Allocation â†’ Billing â†’ Confirmation | Operations â†’ Finance â†’ Communication | RoomAllocated event |
| 9 | Maintenance Request â†’ Work Order â†’ Completion | Operations â†’ Communication | MaintenanceRequested event |
| 10 | Incident Report â†’ Alert â†’ Follow-up | Operations â†’ Communication | IncidentReported event |
| 11 | Invoice Overdue â†’ Reminder â†’ Payment | Finance â†’ Communication | InvoiceOverdue event |
| 12 | Scholarship Award â†’ Fee Adjustment â†’ Notification | Finance â†’ Communication | ScholarshipAwarded event |
| 13 | Attendance Recording â†’ Analytics â†’ Alert | Academic â†’ Reporting & Analytics â†’ Communication | AttendanceRecorded event |
| 14 | Term Closure â†’ Report Card â†’ Analytics | Academic â†’ Documents & Learning, Reporting & Analytics, Communication | TermClosed event |
| 15 | Tenant Provisioning â†’ Setup â†’ Welcome | Platform Administration â†’ Communication, all domains | TenantProvisioned event |

### 8.2 Workflow 1: New Student Enrollment â†’ Fee Generation

```mermaid
sequenceDiagram
    participant P as People
    participant EB as Event Bus
    participant AM as Academic Management
    participant F as Finance
    participant C as Communication
    participant O as Operations
    participant DL as Documents & Learning
    participant RA as Reporting & Analytics
    participant PA as Platform Admin

    P->>P: Create student enrollment record
    P->>EB: StudentEnrolled event

    par Parallel consumers
        EB->>AM: StudentEnrolled
        AM->>AM: Create class enrollment record

        EB->>F: StudentEnrolled
        F->>F: Generate bill items from fee schedule
        F->>F: Create bill
        F->>EB: BillGenerated event

        EB->>O: StudentEnrolled
        O->>O: Create medical record, enable transport/hostel/library

        EB->>DL: StudentEnrolled
        DL->>DL: Create student document folder

        EB->>RA: StudentEnrolled
        RA->>RA: Update enrollment analytics

        EB->>PA: StudentEnrolled
        PA->>PA: Increment license usage count
    end

    F->>EB: BillGenerated
    EB->>C: BillGenerated
    C->>C: Send fee notification to parent
```

### 8.3 Workflow 2: Result Publication â†’ Report Card â†’ Notification

```mermaid
sequenceDiagram
    participant AM as Academic Management
    participant EB as Event Bus
    participant DL as Documents & Learning
    participant C as Communication
    participant RA as Reporting & Analytics

    AM->>AM: Publish results for term
    AM->>EB: ResultPublished event

    par Parallel consumers
        EB->>DL: ResultPublished
        DL->>DL: Trigger report card batch generation
        DL->>DL: Generate report cards from template
        DL->>EB: GeneratedDocumentCreated event

        EB->>RA: ResultPublished
        RA->>RA: Update result analytics, recalculate KPIs

        EB->>C: ResultPublished
        C->>C: Send result notification to students/parents
    end

    DL->>EB: GeneratedDocumentCreated
    EB->>C: GeneratedDocumentCreated
    C->>C: Deliver report card to parent inbox
```

### 8.4 Workflow 3: Payment Confirmation â†’ Receipt â†’ Notification

```mermaid
sequenceDiagram
    participant F as Finance
    participant EB as Event Bus
    participant DL as Documents & Learning
    participant C as Communication
    participant O as Operations

    F->>F: Verify payment, confirm allocation
    F->>EB: PaymentConfirmed event

    par Parallel consumers
        EB->>DL: PaymentConfirmed
        DL->>DL: Generate receipt document from template
        DL->>EB: GeneratedDocumentCreated event

        EB->>C: PaymentConfirmed
        C->>C: Send payment confirmation to parent

        EB->>O: PaymentConfirmed
        O->>O: Clear library fines, confirm hostel payment
    end

    DL->>EB: GeneratedDocumentCreated
    EB->>C: GeneratedDocumentCreated
    C->>C: Deliver receipt to parent inbox
```

### 8.5 Workflow 4: Summer School Registration â†’ Billing â†’ Invoice

```mermaid
sequenceDiagram
    participant AM as Academic Management
    participant EB as Event Bus
    participant F as Finance
    participant C as Communication

    AM->>AM: Register student for summer school
    AM->>EB: SummerSchoolRegistered event

    EB->>F: SummerSchoolRegistered
    F->>F: Generate billing from summer school fee schedule
    F->>F: Create bill and invoice
    F->>EB: SummerSchoolBillingRequested event
    F->>EB: SummerSchoolInvoiceGenerated event

    par Parallel consumers
        EB->>C: SummerSchoolBillingRequested
        C->>C: Send billing notification

        EB->>C: SummerSchoolInvoiceGenerated
        C->>C: Send invoice to parent
    end
```

### 8.6 Workflow 5: Staff Hiring â†’ Onboarding Cascade

```mermaid
sequenceDiagram
    participant P as People
    participant EB as Event Bus
    participant AM as Academic Management
    participant C as Communication
    participant O as Operations
    participant RA as Reporting & Analytics
    participant PA as Platform Admin

    P->>P: Create staff record
    P->>EB: StaffHired event

    par Parallel consumers
        EB->>AM: StaffHired
        AM->>AM: Enable teaching assignment capability

        EB->>C: StaffHired
        C->>C: Send onboarding welcome email

        EB->>O: StaffHired
        O->>O: Create medical record, enable asset/transport assignment

        EB->>RA: StaffHired
        RA->>RA: Update staff count analytics

        EB->>PA: StaffHired
        PA->>PA: Increment license usage count
    end
```

### 8.7 Workflow 6: Student Graduation â†’ Checkout Cascade

```mermaid
sequenceDiagram
    participant P as People
    participant EB as Event Bus
    participant AM as Academic Management
    participant F as Finance
    participant O as Operations
    participant C as Communication
    participant DL as Documents & Learning
    participant RA as Reporting & Analytics

    P->>P: Process student graduation
    P->>EB: StudentGraduated event

    par Parallel consumers
        EB->>AM: StudentGraduated
        AM->>AM: Update progression record

        EB->>F: StudentGraduated
        F->>F: Generate final billing, close outstanding invoices

        EB->>O: StudentGraduated
        O->>O: Trigger checkout workflow (hostel, transport, library)

        EB->>C: StudentGraduated
        C->>C: Send graduation notification

        EB->>DL: StudentGraduated
        DL->>DL: Archive student documents

        EB->>RA: StudentGraduated
        RA->>RA: Update graduation analytics
    end
```

### 8.8 Workflow 7: Book Borrowing â†’ Fine â†’ Payment â†’ Clearance

```mermaid
sequenceDiagram
    participant O as Operations
    participant EB as Event Bus
    participant F as Finance
    participant C as Communication

    O->>O: Book copy checked out
    O->>EB: BookBorrowed event
    EB->>C: BookBorrowed
    C->>C: Send checkout confirmation

    Note over O: Time passes... book becomes overdue

    O->>O: Cron job detects overdue borrowing
    O->>EB: BookOverdue event

    par
        EB->>C: BookOverdue
        C->>C: Send overdue reminder

        EB->>F: BookOverdue
        F->>F: Create fine record
        F->>F: Generate bill for fine
        F->>EB: BillGenerated event
    end

    F->>F: Parent makes payment
    F->>F: Confirm payment, clear fine
    F->>EB: PaymentConfirmed event

    par
        EB->>O: PaymentConfirmed
        O->>O: Clear library fine record

        EB->>C: PaymentConfirmed
        C->>C: Send payment confirmation
    end
```

### 8.9 Workflow 8: Hostel Allocation â†’ Billing â†’ Confirmation

```mermaid
sequenceDiagram
    participant O as Operations
    participant EB as Event Bus
    participant F as Finance
    participant C as Communication

    O->>O: Allocate bed to student
    O->>EB: RoomAllocated event

    par
        EB->>C: RoomAllocated
        C->>C: Send allocation confirmation

        EB->>F: RoomAllocated
        F->>F: Generate hostel fee bill
        F->>EB: BillGenerated event
    end

    F->>EB: BillGenerated
    EB->>C: BillGenerated
    C->>C: Send hostel fee notification to parent
```

### 8.10 Workflow 9: Maintenance Request â†’ Work Order â†’ Completion

```mermaid
sequenceDiagram
    participant User as Requester
    participant O as Operations
    participant EB as Event Bus
    participant C as Communication

    User->>O: Submit maintenance request
    O->>O: Create maintenance request
    O->>EB: MaintenanceRequested event
    EB->>C: MaintenanceRequested
    C->>C: Send request acknowledgement

    O->>O: Admin authorizes work order
    O->>EB: WorkOrderCreated event
    EB->>C: WorkOrderCreated
    C->>C: Notify assigned staff

    O->>O: Work order completed
    O->>EB: WorkOrderCompleted event

    par
        EB->>C: WorkOrderCompleted
        C->>C: Notify requester of completion

        EB->>RA: WorkOrderCompleted
        RA->>RA: Update maintenance analytics
    end
```

### 8.11 Workflow 10: Incident Report â†’ Alert â†’ Follow-up

```mermaid
sequenceDiagram
    participant O as Operations
    participant EB as Event Bus
    participant C as Communication

    O->>O: Create incident report
    O->>EB: IncidentReported event
    EB->>C: IncidentReported
    C->>C: Send incident alert to administration

    Note over O: Investigation and follow-up

    O->>O: Update incident status
    O->>EB: IncidentUpdated event
    EB->>C: IncidentUpdated
    C->>C: Notify relevant parties of resolution
```

### 8.12 Workflow 11: Invoice Overdue â†’ Reminder â†’ Payment

```mermaid
sequenceDiagram
    participant F as Finance
    participant EB as Event Bus
    participant C as Communication
    participant O as Operations

    F->>F: Cron job detects overdue invoice
    F->>EB: InvoiceOverdue event

    par
        EB->>C: InvoiceOverdue
        C->>C: Send overdue reminder to parent

        EB->>O: InvoiceOverdue
        O->>O: Flag for follow-up
    end

    Note over F: Parent makes payment

    F->>F: Process payment, update invoice
    F->>EB: PaymentConfirmed event

    par
        EB->>C: PaymentConfirmed
        C->>C: Send payment confirmation and receipt

        EB->>O: PaymentConfirmed
        O->>O: Clear follow-up flag
    end
```

### 8.13 Workflow 12: Scholarship Award â†’ Fee Adjustment â†’ Notification

```mermaid
sequenceDiagram
    participant F as Finance
    participant EB as Event Bus
    participant C as Communication

    F->>F: Award scholarship to student
    F->>F: Apply discount to outstanding bills
    F->>EB: ScholarshipAwarded event

    EB->>C: ScholarshipAwarded
    C->>C: Send scholarship award notification to student/parent
```

### 8.14 Workflow 13: Attendance Recording â†’ Analytics â†’ Alert

```mermaid
sequenceDiagram
    participant AM as Academic Management
    participant EB as Event Bus
    participant RA as Reporting & Analytics
    participant C as Communication

    AM->>AM: Record daily attendance
    AM->>EB: AttendanceRecorded event

    EB->>RA: AttendanceRecorded
    RA->>RA: Update attendance analytics
    RA->>RA: Check threshold rules
    alt Threshold breached
        RA->>EB: KpiThresholdBreached event
        EB->>C: KpiThresholdBreached
        C->>C: Send attendance alert to administration
    end
```

### 8.15 Workflow 14: Term Closure â†’ Report Card â†’ Analytics

```mermaid
sequenceDiagram
    participant AM as Academic Management
    participant EB as Event Bus
    participant DL as Documents & Learning
    participant RA as Reporting & Analytics
    participant C as Communication

    AM->>Close term and finalize results
    AM->>EB: TermClosed event

    par Parallel consumers
        EB->>DL: TermClosed
        DL->>DL: Trigger report card batch generation
        DL->>DL: Generate report cards
        DL->>EB: GeneratedDocumentCreated event

        EB->>RA: TermClosed
        RA->>RA: Snapshot term analytics
        RA->>RA: Recalculate KPIs

        EB->>C: TermClosed
        C->>C: Send term closure notification
    end

    DL->>EB: GeneratedDocumentCreated
    EB->>C: GeneratedDocumentCreated
    C->>C: Deliver report cards to parents
```

### 8.16 Workflow 15: Tenant Provisioning â†’ Setup â†’ Welcome

```mermaid
sequenceDiagram
    participant PA as Platform Administration
    participant EB as Event Bus
    participant C as Communication
    participant RA as Reporting & Analytics
    participant IM as Institution Management

    PA->>PA: Provision new tenant
    PA->>EB: TenantProvisioned event

    par Parallel consumers
        EB->>C: TenantProvisioned
        C->>C: Send platform welcome email

        EB->>RA: TenantProvisioned
        RA->>RA: Initialize analytics schema
    end

    PA->>PA: Activate tenant
    PA->>EB: TenantActivated event
    EB->>C: TenantActivated
    C->>C: Send activation confirmation
```

---

## 9. Read Models & Reporting

### 9.1 Reporting & Analytics as a Read Model

Reporting & Analytics is the primary consumer of cross-domain data for analytics purposes. It does not own entity data; instead, it consumes events from all domains to build denormalized read models.

| Source Domain | Events Consumed | Read Model Updated |
|---------------|----------------|-------------------|
| People | StudentEnrolled, StaffHired, StudentGraduated | Enrollment counts, staff counts, graduation metrics |
| Academic Management | ResultPublished, AttendanceMarked, TermClosed | Academic performance, attendance rates, term metrics |
| Finance | PaymentReceived, InvoiceGenerated, ScholarshipAwarded | Revenue, billing, scholarship metrics |
| Communication | NotificationDelivered | Delivery metrics, campaign effectiveness |
| Operations | BookBorrowed, RoomAllocated, VisitorCheckedIn, WorkOrderCompleted | Library, hostel, visitor, maintenance metrics |
| Documents & Learning | DocumentUploaded | Document usage metrics |
| Platform Administration | AuditLogCreated | Compliance metrics |

### 9.2 Reporting Query Pattern

```mermaid
graph LR
    A[API Request] --> B[Report Definition]
    B --> C{Report Type}
    C -->|Real-time| D[Query Source Domain API]
    C -->|Cached| E[Query Analytics Snapshot]
    C -->|Scheduled| F[Pre-computed Snapshot]

    D --> G[Format & Return]
    E --> G
    F --> G
```

### 9.3 Report Distribution

Reports can be distributed via Communication domain:
- Scheduled reports trigger ReportDistributionConsumer
- Export jobs trigger ExportJobCompleted event
- Communication delivers reports via email, in-app notification, or file download

### 9.4 Cross-Domain Data Access for Reporting

| Reporting Need | Data Source | Access Pattern |
|----------------|-------------|---------------|
| Student enrollment trends | People + Academic Management | Event consumption â†’ analytics snapshot |
| Financial performance | Finance | Event consumption â†’ analytics snapshot |
| Attendance analytics | Academic Management | Event consumption â†’ analytics snapshot |
| Library usage | Operations | Event consumption â†’ analytics snapshot |
| Communication delivery | Communication | Event consumption â†’ analytics snapshot |
| Platform health | All domains | Event consumption â†’ analytics snapshot |

---

## 10. Failure Handling

### 10.1 Failure Categories

| Category | Description | Impact | Recovery |
|----------|-------------|--------|----------|
| **Event Publishing Failure** | Publisher fails to emit event after commit | Downstream consumers never receive event | Retry with exponential backoff; dead letter queue |
| **Event Consumer Failure** | Consumer fails to process event | Domain state not updated | Retry with exponential backoff; manual compensation |
| **Cross-Domain FK Violation** | Referenced entity deleted or not found | Creating entity fails | Application guard prevents creation; admin notification |
| **Timeout** | Consumer takes too long to process | Event processing delayed | Timeout handling; async retry |
| **Duplicate Event** | Same event delivered twice | Potential duplicate processing | Idempotency check via eventId |

### 10.2 Retry Strategy

| Attempt | Delay | Description |
|---------|-------|-------------|
| 1 | Immediate | First processing attempt |
| 2 | 1 second | First retry |
| 3 | 5 seconds | Second retry |
| 4 | 30 seconds | Third retry (final) |
| Dead Letter | â€” | After max retries, event moved to dead letter queue |

### 10.3 Dead Letter Queue

Failed events that exhaust all retries are moved to a dead letter queue for:
- Manual inspection and resolution
- Replay capability (re-process from dead letter)
- Alerting (platform administrators notified)
- Audit trail (failure reason logged)

### 10.4 Compensation Workflows

| Failure Scenario | Compensation |
|-----------------|--------------|
| Finance fails to generate bill after StudentEnrolled | Admin notification; manual bill creation |
| Communication fails to send notification after PaymentConfirmed | Retry; fallback to in-app notification only |
| Operations fails to create medical record after StaffHired | Admin notification; manual record creation |
| Documents & Learning fails to generate report card after ResultPublished | Retry; manual report card generation |
| Reporting & Analytics fails to update snapshot | Next scheduled refresh corrects the data |

### 10.5 Circuit Breaker Pattern

For high-volume event consumers, circuit breaker pattern prevents cascade failures:

| State | Description |
|-------|-------------|
| Closed | Normal operation; events processed normally |
| Open | Too many failures; events queued for later processing |
| Half-Open | Testing if downstream is recovered; limited event processing |

---

## 11. External Integrations

### 11.1 External System Categories

| Category | Systems | Integration Pattern |
|----------|---------|-------------------|
| **Payment Gateways** | Paystack, Flutterwave | Webhook callbacks â†’ Finance domain |
| **SMS Providers** | Termii, Africa's Talking | API calls from Communication domain |
| **Email Providers** | SendGrid, AWS SES | API calls from Communication domain |
| **Push Notification** | Firebase Cloud Messaging | API calls from Communication domain |
| **File Storage** | AWS S3, MinIO | SDK calls from Platform Administration |
| **Authentication** | Google OAuth, Microsoft Entra | OAuth2 flows in Identity & Access |
| **Government Systems** | National ID verification | API calls from People domain |

### 11.2 External Integration Rules

1. **Communication owns all external messaging** â€” No domain sends emails, SMS, or push notifications directly
2. **Finance owns all payment processing** â€” No domain processes payments directly
3. **Platform Administration owns all storage** â€” No domain manages S3 buckets directly
4. **Identity & Access owns all authentication** â€” No domain handles OAuth flows directly
5. **Webhook callbacks are processed by the owning domain** â€” Payment webhooks â†’ Finance, SMS webhooks â†’ Communication

### 11.3 External Integration Event Flow

```mermaid
graph LR
    subgraph "External Systems"
        PG[Payment Gateway]
        SMS[SMS Provider]
        EM[Email Provider]
        FCM[Push Notifications]
        S3[File Storage]
    end

    subgraph "OpenSchool ERP"
        F[Finance]
        C[Communication]
        PA[Platform Administration]
        IA[Identity & Access]
    end

    PG -->|webhook| F
    F -->|API call| PG
    C -->|API call| SMS
    C -->|API call| EM
    C -->|API call| FCM
    PA -->|SDK call| S3
    IA -->|OAuth2| External[OAuth Provider]
```

---

## 12. Security

### 12.1 Cross-Domain Security Rules

| Rule | Description |
|------|-------------|
| **Tenant isolation** | No cross-tenant data access, event consumption, or API calls |
| **Event tenant scoping** | Events carry tenantId in envelope; consumers must validate tenant context |
| **Actor traceability** | Events carry actorId; consumers may log original actor for audit |
| **No credential sharing** | Domains never share API keys, tokens, or credentials |
| **Encrypted cross-domain data** | Sensitive data in event payloads is encrypted at rest |
| **Authorization at domain boundary** | Each domain validates authorization independently; no delegated auth |

### 12.2 Event Security

| Aspect | Implementation |
|--------|---------------|
| **Event integrity** | EventEmitter2 in-process delivery; no network interception |
| **Tenant isolation** | Events carry tenantId; consumers filter by tenant |
| **Payload sensitivity** | Sensitive fields encrypted in event payload |
| **Dead letter access** | Dead letter queue accessible only to platform administrators |
| **Replay security** | Replay operations require admin authorization and are logged |

### 12.3 Cross-Domain FK Security

| Aspect | Implementation |
|--------|---------------|
| **Tenant scoping** | All FK references validated within tenant scope |
| **Authorization check** | Application guard validates actor has permission to reference target entity |
| **Audit logging** | Cross-domain FK creation logged in audit trail |
| **Orphan prevention** | Application guards prevent orphaned references on entity deletion |

---

## 13. Performance

### 13.1 Event Processing Performance

| Metric | Target |
|--------|--------|
| Event publishing latency | < 100ms after transaction commit |
| Event consumer processing time | < 500ms per event |
| Event consumer throughput | > 1000 events/second per consumer |
| Dead letter queue processing | < 1 hour for manual review |

### 13.2 Cross-Domain Query Performance

| Pattern | Performance Target |
|---------|-------------------|
| Event consumption (in-process) | < 10ms |
| Application guard (FK validation) | < 50ms |
| Read model query (analytics snapshot) | < 200ms |
| Report generation | < 5 seconds |

### 13.3 Caching Strategy for Cross-Domain Data

| Data Type | Cache Strategy | TTL |
|-----------|---------------|-----|
| Person records (for FK validation) | Read-through cache | 5 minutes |
| Institution configuration | Read-through cache | 5 minutes |
| Academic calendar data | Read-through cache | 10 minutes |
| Analytics snapshots | Scheduled refresh | 15 minutes |
| Report definitions | Read-through cache | 30 minutes |

### 13.4 Index Strategy for Cross-Domain References

All cross-domain FK columns must be indexed. The complete index list is in the Cross-Domain FK Reference Summary (Section 4.3).

| Index Pattern | Purpose |
|--------------|---------|
| `idx_{table}_{fk_column}` | FK lookups for application guards |
| `idx_{table}_tenant_{fk_column}` | Tenant-scoped FK lookups |
| `idx_{table}_tenant_status` | Common query pattern for filtered queries |

---

## 14. Architecture Decision Records

### 14.1 Platform-Wide Integration ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-INT-01 | Cross-domain communication via domain events only | Prevents tight coupling; enables async processing; supports future migration to message queue |
| ADR-INT-02 | No cross-domain database queries | Enforces domain boundaries; prevents data leakage; simplifies tenant isolation |
| ADR-INT-03 | EventEmitter2 in-process events (V1) | Simpler than message queue for V1; sufficient for single-instance deployment; migration path defined |
| ADR-INT-04 | Eventual consistency for cross-domain data | Acceptable for school management use cases; no financial transaction requires sub-second cross-domain consistency |
| ADR-INT-05 | Consumer idempotency via eventId | Prevents duplicate processing; enables safe retries; 72-hour TTL sufficient |
| ADR-INT-06 | Application-level guards for cross-domain FK | No database-level cascade across domains; application validates reference existence and tenant scope |
| ADR-INT-07 | Communication domain owns all external messaging | Single point of integration for SMS, email, push; simplifies provider management; enables unified delivery tracking |
| ADR-INT-08 | Finance domain owns all financial calculation | No domain computes fees, bills, payments, or discounts; Finance is the single source of financial truth |
| ADR-INT-09 | Reporting & Analytics reads from events only | No direct cross-domain DB queries for analytics; event consumption provides audit trail; eventual consistency acceptable |
| ADR-INT-10 | Cross-domain FK references use RESTRICT on delete | Prevents accidental data loss; requires explicit cleanup before entity deletion |

### 14.2 Event Design ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-INT-11 | Events published after transaction commit | Prevents phantom events on rollback; consumers never see events for rolled-back transactions |
| ADR-INT-12 | Events carry tenantId and actorId in envelope | Enables tenant-scoped consumption; maintains actor traceability across domain boundaries |
| ADR-INT-13 | Event versioning via eventVersion and schemaVersion | Enables payload evolution without breaking consumers; consumers check schemaVersion for compatibility |
| ADR-INT-14 | No global event ordering guarantee | In-process EventEmitter2 does not guarantee cross-aggregate ordering; consumers must handle out-of-order delivery |

---

## 15. Integration Review Checklist

Use this checklist when reviewing any cross-domain integration point.

### 15.1 Event Design Review

- [ ] Event name follows `{Entity}{PastTenseVerb}` convention
- [ ] Event payload contains all data needed by consumers (no follow-up queries to publisher)
- [ ] Event envelope includes tenantId, actorId, correlationId, causationId
- [ ] Event is published AFTER transaction commit
- [ ] Event has at least one consumer (no orphan events)
- [ ] Event schema is versioned

### 15.2 Consumer Design Review

- [ ] Consumer is idempotent (checks eventId before processing)
- [ ] Consumer does not query publisher's domain tables
- [ ] Consumer handles out-of-order delivery
- [ ] Consumer has retry logic with exponential backoff
- [ ] Consumer logs failures for debugging
- [ ] Consumer respects tenant isolation (filters by tenantId)

### 15.3 Cross-Domain FK Review

- [ ] FK column is indexed
- [ ] Application guard validates referenced entity exists and is tenant-scoped
- [ ] Application guard validates actor authorization
- [ ] FK uses RESTRICT on delete (not CASCADE)
- [ ] FK creation is logged in audit trail
- [ ] Orphan prevention logic exists for entity deletion

### 15.4 Workflow Review

- [ ] Workflow steps are documented with event names
- [ ] Workflow has clear start trigger and end conditions
- [ ] Workflow handles partial failures (compensation)
- [ ] Workflow does not span multiple domain transactions
- [ ] Workflow is testable end-to-end
- [ ] Workflow has monitoring and alerting

### 15.5 Security Review

- [ ] Tenant isolation verified (events carry tenantId)
- [ ] Actor traceability maintained (events carry actorId)
- [ ] No cross-tenant data access in consumers
- [ ] Sensitive data encrypted in event payloads
- [ ] Cross-domain FK references are tenant-scoped
- [ ] Dead letter queue access is restricted to admins

### 15.6 Performance Review

- [ ] Event publishing latency < 100ms
- [ ] Consumer processing time < 500ms
- [ ] No N+1 query patterns in consumers
- [ ] Caching strategy documented for cross-domain reads
- [ ] Indexes cover all cross-domain FK lookups

---

## 16. Future Expansion

### 16.1 V2 Integration Enhancements

| Enhancement | Description | Prerequisite |
|-------------|-------------|--------------|
| **Message Queue Migration** | Replace EventEmitter2 with BullMQ/Redis for reliable, distributed event delivery | Single-instance deployment validated |
| **Event Sourcing** | Store all events in event store for audit, replay, and CQRS | Message queue migration complete |
| **CQRS Pattern** | Separate read and write models for high-traffic domains | Event sourcing implemented |
| **Saga Orchestrator** | Centralized saga coordination for complex multi-domain workflows | Message queue migration complete |

### 16.2 V3 Integration Enhancements

| Enhancement | Description | Prerequisite |
|-------------|-------------|--------------|
| **API Gateway** | Centralized API gateway for external integrations | All V1 domains implemented |
| **Webhook System** | Configurable webhooks for external system notifications | Platform Administration webhook infrastructure |
| **Integration Marketplace** | Third-party integration registration and management | Webhook system implemented |
| **Real-time Events** | WebSocket-based real-time event delivery to frontend | Message queue migration complete |

### 16.3 V4 Integration Enhancements

| Enhancement | Description | Prerequisite |
|-------------|-------------|--------------|
| **Cross-Tenant Analytics** | Aggregated, anonymized analytics across tenants | Platform Administration analytics infrastructure |
| **Multi-Region** | Multi-region deployment with event replication | Message queue migration complete |
| **Event Schema Registry** | Centralized schema registry for event version management | Event sourcing implemented |

---

## 17. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-20 | Initial creation â€” Cross-domain integration specification derived from 10 approved V1 domain specifications |

---

*This document is the authoritative reference for all domain-to-domain communication in OpenSchool ERP. All cross-domain integration points must comply with this specification. Changes require architecture review.*



---

# PAGE BREAK

---


# OpenSchool ERP — Platform Event Catalogue

**Authoritative Reference for All Domain Events**

| Aspect | Detail |
|--------|--------|
| Document | Platform Event Catalogue |
| Scope | All domain events across 10 V1 engineering specifications |
| Status | Approved — Frozen for Implementation |
| Version | 1.0.0 |
| Effective Date | 2026-07-20 |
| Authority | Derived from 10 approved V1 domain specifications |
| Governing Standards | 01 Engineering Standards.md, 02 Cross-Domain Integration Specification.md |

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Scope](#2-scope)
3. [Event Principles](#3-event-principles)
4. [Event Naming Standards](#4-event-naming-standards)
5. [Event Metadata Standard](#5-event-metadata-standard)
6. [Event Lifecycle](#6-event-lifecycle)
7. [Domain Event Catalogue](#7-domain-event-catalogue)
   - 7.1 [Identity and Access](#71-identity--access)
   - 7.2 [Institution Management](#72-institution-management)
   - 7.3 [People](#73-people)
   - 7.4 [Academic Management](#74-academic-management)
   - 7.5 [Finance](#75-finance)
   - 7.6 [Communication](#76-communication)
   - 7.7 [Operations](#77-operations)
   - 7.8 [Documents and Learning](#78-documents-and-learning)
   - 7.9 [Reporting and Analytics](#79-reporting-and-analytics)
   - 7.10 [Platform Administration](#710-platform-administration)
8. [Event Categories](#8-event-categories)
9. [Event Ordering](#9-event-ordering)
10. [Event Versioning](#10-event-versioning)
11. [Event Delivery](#11-event-delivery)
12. [Event Consumer Matrix](#12-event-consumer-matrix)
13. [Event Security](#13-event-security)
14. [Event Monitoring](#14-event-monitoring)
15. [Integration Rules](#15-integration-rules)
16. [Architecture Decision Records](#16-architecture-decision-records)
17. [Event Review Checklist](#17-event-review-checklist)
18. [Future Expansion](#18-future-expansion)
19. [Revision History](#19-revision-history)

---

## 1. Purpose

This document is the single authoritative catalogue for every domain event in the OpenSchool ERP platform. It defines all published business events, their ownership, payload contracts, consumers, lifecycle, and versioning strategy.

### 1.1 Intended Audience

| Audience | Use |
|----------|-----|
| **Developers** | Implement event publishers and consumers correctly |
| **Architects** | Review event design, coupling, and boundary compliance |
| **Integration Engineers** | Build external integrations that consume or produce events |
| **Event Consumers** | Understand payload contracts, idempotency, and retry behavior |
| **Background Workers** | Implement async processing triggered by events |
| **Reporting Projections** | Build analytics read models from event streams |
| **Future Smart Campus** | Extend the event catalogue for IoT and campus automation |
| **Future AI Services** | Consume event streams for predictive analytics and automation |

### 1.2 Relationship to Other Standards

| Document | Relationship |
|----------|-------------|
| 01 Engineering Standards.md | Defines event envelope, naming, publishing, and consumer standards. This catalogue applies those standards to every event. |
| 02 Cross-Domain Integration Specification.md | Defines how domains communicate. This catalogue documents every individual event that flows through those channels. |
| Domain Engineering Specifications | Define business rules, entities, and aggregates. This catalogue documents the events those domains publish and consume. |

---

## 2. Scope

### 2.1 In Scope

- All domain events published by the 10 V1 engineering specifications
- All cross-domain event consumers and their processing logic
- Event metadata, payload contracts, and versioning
- Event lifecycle from creation to archival
- Event delivery guarantees and failure handling
- Event security and tenant isolation

### 2.2 Out of Scope

- Internal domain events that do not cross domain boundaries (documented in domain specs)
- Database triggers and PostgreSQL notification channels
- Infrastructure events (server health, container restarts)
- Frontend state management events

### 2.3 Event Count Summary

| Domain | Events Published | Primary Consumers |
|--------|-----------------|-------------------|
| Identity and Access | 8 | Communication, People, Platform Administration |
| Institution Management | 6 | Academic Management, Communication, Documents and Learning, Reporting and Analytics |
| People | 7 | Academic Management, Finance, Communication, Operations, Documents and Learning, Reporting and Analytics, Platform Administration |
| Academic Management | 18 | People, Finance, Communication, Documents and Learning, Reporting and Analytics |
| Finance | 14 | Communication, Documents and Learning, Operations, Reporting and Analytics |
| Communication | 7 | Reporting and Analytics, Platform Administration |
| Operations | 14 | Finance, Communication, Reporting and Analytics |
| Documents and Learning | 7 | Communication |
| Reporting and Analytics | 2 | Communication |
| Platform Administration | 16 | Communication, Finance, Reporting and Analytics, all domains |
| **Total** | **99** | |

---

## 3. Event Principles

### 3.1 Event Types

| Type | Definition | Scope | Example |
|------|-----------|-------|---------|
| **Domain Event** | A fact about something that happened in the domain, expressed in business language | Cross-domain | StudentEnrolled, PaymentConfirmed |
| **Integration Event** | A domain event specifically designed for cross-domain consumption, carrying a defined payload contract | Cross-domain | All events in this catalogue |
| **Internal Event** | An event that stays within a single domain and does not cross domain boundaries | Intra-domain | GradingRuleEvaluated, TimetableConflictDetected |
| **External Event** | An event representing a state change in an external system, or an event published to an external system | External | PaymentWebhookReceived, SmsDeliveryReport |

### 3.2 Principles

| Principle | Description |
|-----------|-------------|
| **Events are facts** | Events describe something that already happened. They are not commands, requests, or intentions. |
| **One owner per event** | Each event has exactly one owning domain. Only the owning domain may publish that event. |
| **Business language** | Event names express business concepts, not technical implementation details. |
| **Minimal payload** | Events carry only the data consumers need. No excessive nesting or unnecessary fields. |
| **Idempotent consumers** | Every consumer must handle duplicate delivery gracefully. |
| **Eventually consistent** | Cross-domain consistency is achieved through events, not distributed transactions. |
| **After-commit delivery** | Events are published only after the publishing transaction commits successfully. |
| **Tenant-scoped** | Every event carries tenant context. Consumers must respect tenant boundaries. |

---

## 4. Event Naming Standards

### 4.1 Naming Convention

| Element | Convention | Example |
|---------|-----------|---------|
| Event Name | PascalCase, past tense | StudentEnrolled, InvoicePublished |
| Pattern | `{Entity}{PastTenseVerb}` | PaymentConfirmed, TermClosed |
| Prefix | Entity or aggregate name | Student, Invoice, Book, Notification |
| Verb | Past tense, business-focused | Enrolled, Promoted, Graduated, Published |

### 4.2 Naming Rules

1. Events use **past tense** because they describe something that already happened
2. Events include the **entity name as a prefix** for discoverability
3. Multi-word verbs use **clean past tense**: `StudentConditionallyPromoted` (not `ConditionalPromotion`)
4. Parallel entities use **consistent verbs**: `AcademicYearActivated` and `AcademicSessionActivated` (not `Opened` vs `Activated`)
5. Avoid abbreviations in event names: use `StudentGraduated` not `StudentGrad`
6. Avoid prefixes like `On`, `Before`, `After` -- events describe facts, not timing

### 4.3 Standard Verb Catalogue

| Verb | Usage | Examples |
|------|-------|---------|
| Created | Entity persisted for the first time | UserCreated, InstitutionCreated, BillGenerated |
| Updated | Entity data modified | UserUpdated, InstitutionSettingsUpdated |
| Activated | Entity transitioned to active state | TermActivated, ModuleActivated, TenantActivated |
| Deactivated | Entity transitioned from active state | ModuleDeactivated, UserDeactivated |
| Published | Content made visible or finalized | ResultPublished, ReportCardPublished, DocumentPublished |
| Generated | System-produced artifact created | BillGenerated, InvoiceGenerated, ReportCardGenerated |
| Confirmed | Verification or approval completed | PaymentConfirmed |
| Assigned | Resource linked to another entity | TransportAssigned, TeachingAssigned |
| Allocated | Resource reserved or assigned | RoomAllocated |
| Deallocated | Resource released | RoomDeallocated |
| Enrolled | Student registered in a context | StudentEnrolled, StudentClassEnrolled |
| Withdrawn | Student removed from a context | StudentWithdrawn |
| Promoted | Student advanced to next level | StudentPromoted |
| Retained | Student kept at current level | StudentRetained |
| Graduated | Student completed program | StudentGraduated |
| Transferred | Entity moved between contexts | StudentTransferred, StudentClassTransferred |
| Submitted | Work turned in | AssignmentSubmitted |
| Returned | Work returned with feedback | AssignmentReturned |
| Delivered | Communication successfully delivered | NotificationDelivered |
| Failed | Operation failed | PaymentFailed, NotificationFailed, WebhookDeliveryFailed |
| Requested | Action requested by user | PasswordResetRequested, MaintenanceRequested, RefundRequested |
| Processed | Action completed | RefundProcessed |
| Overdue | Deadline exceeded | InvoiceOverdue, BookOverdue, InstallmentOverdue |
| Awarded | Grant or scholarship given | ScholarshipAwarded |
| Reported | Incident or issue logged | IncidentReported |
| Completed | Work finished | WorkOrderCompleted |
| Scheduled | Future event planned | MaintenanceScheduled |
| Exceeded | Threshold crossed | LicenseLimitExceeded, KpiThresholdBreached |
| Read | Recipient opens notification | NotificationRead |
| Sent | Message dispatched | MessageSent, NotificationDispatched |

### 4.4 Ownership

- Each event is owned by exactly one domain
- Only the owning domain may publish the event
- Consumer domains may not modify the event payload or semantics
- Event ownership is documented in the catalogue entry and cannot be transferred without architecture review

---

## 5. Event Metadata Standard

### 5.1 Envelope Fields

Every domain event carries a versioned envelope as defined in `01 Engineering Standards.md` Section 7.2:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| eventId | uuid | Yes | Unique event identifier; primary deduplication key |
| eventName | string | Yes | Fully qualified event name (e.g., `academic.StudentEnrolled`) |
| eventVersion | int | Yes | Monotonically increasing per event type; incremented on payload schema changes |
| schemaVersion | string | Yes | Payload schema version (e.g., "1.0.0") |
| occurredAt | timestamptz | Yes | When the event occurred |
| correlationId | uuid | Yes | Groups related events across a single user action |
| causationId | uuid | Yes | ID of the event or command that caused this event |
| tenantId | uuid | Yes | Tenant context |
| institutionId | uuid | Yes | Institution context within the tenant |
| aggregateId | uuid | Yes | ID of the aggregate root that produced the event |
| aggregateType | string | Yes | Type of the aggregate root (e.g., "Student", "Invoice") |
| sourceDomain | string | Yes | Domain that published the event |
| actorId | uuid | Yes | User who triggered the event (system events use system actor UUID) |
| payload | jsonb | Yes | Event-specific data |

### 5.2 Event Name Format

Event names follow the pattern `{domain}.{EntityPastTenseVerb}`:

```
identity.UserCreated
institution.InstitutionCreated
people.StudentEnrolled
academic.ResultPublished
finance.PaymentConfirmed
communication.NotificationDelivered
operations.BookBorrowed
documents.DocumentPublished
reporting.ExportJobCompleted
platform.TenantProvisioned
```

### 5.3 Correlation and Causation

| Field | Purpose | Example |
|-------|---------|---------|
| correlationId | Groups all events produced by a single user action | User clicks "Enroll Student" and StudentEnrolled + BillGenerated share the same correlationId |
| causationId | Points to the event or command that caused this event | BillGenerated has causationId = StudentEnrolled.eventId |

---

## 6. Event Lifecycle

### 6.1 Lifecycle Stages

```mermaid
graph LR
    A[Created] --> B[Published]
    B --> C[Delivered]
    C --> D{Processed?}
    D -->|Yes| E[Completed]
    D -->|No| F[Retry]
    F --> D
    F -->|Max retries| G[Dead Letter]
    G --> H[Manual Review]
    H -->|Replay| B
    E --> I[Stored]
    I --> J[Expired]
    J --> K[Archived]
```

### 6.2 Stage Definitions

| Stage | Description | Duration |
|-------|-------------|----------|
| **Created** | Event entity persisted in event store after transaction commit | Immediate |
| **Published** | Event emitted via EventEmitter2 to registered consumers | Less than 100ms after commit |
| **Delivered** | Event received by consumer event handler | Less than 10ms in-process |
| **Processed** | Consumer successfully processed the event | Less than 500ms |
| **Completed** | Event marked as successfully processed | Immediate after processing |
| **Retry** | Consumer failed; event queued for retry | Exponential backoff (1s, 5s, 30s) |
| **Dead Letter** | Maximum retries exhausted; event moved to dead letter queue | After 4 attempts |
| **Manual Review** | Platform admin inspects and resolves dead-lettered events | Best effort |
| **Replayed** | Dead-lettered event reprocessed after resolution | On demand |
| **Stored** | Event retained for audit and replay | 72-hour minimum TTL |
| **Expired** | Event past retention period; eligible for cleanup | After 72 hours |
| **Archived** | Event moved to long-term storage for compliance | Optional |

### 6.3 Lifecycle Rules

1. Events are **never deleted** before retention expiry
2. Events in **Dead Letter** state require platform admin intervention
3. **Replay** must be idempotent -- same result as original processing
4. **Expired** events may be purged by background job after configurable TTL
5. **Archived** events are retained for compliance and audit purposes

---

## 7. Domain Event Catalogue

This section documents every cross-domain event published by each of the 10 V1 engineering domains.

### 7.1 Identity and Access

**Domain:** Identity and Access
**Aggregate:** User, Role, Permission, Session
**Specification Reference:** Identity and Access Engineering.md

---

#### 7.1.1 UserCreated

| Field | Value |
|-------|-------|
| **Owning Domain** | Identity and Access |
| **Aggregate** | User |
| **Trigger** | New user account created via registration, admin creation, or SSO provisioning |
| **Business Purpose** | Notifies downstream domains that a new user identity exists and may need person records, welcome communications, or license tracking |
| **Payload Summary** | userId, email, firstName, lastName, roleIds, institutionId, createdAt |
| **Event Version** | 1 |
| **Publisher** | UserService |
| **Consumers** | Communication (welcome email), People (person record sync) |
| **Ordering Requirements** | Must be processed after UserCreated completes; no ordering dependency with other events |
| **Idempotency Requirements** | Consumer must check eventId; duplicate delivery must not create duplicate person records or send duplicate welcome emails |
| **Retry Strategy** | Exponential backoff (1s, 5s, 30s, 120s); max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin; manual review required; person record creation may be deferred |
| **Security Considerations** | Payload contains email (PII); transmit over internal event bus only; no external exposure |
| **Audit Requirements** | Log event receipt in consumer audit trail; log original actorId |

---

#### 7.1.2 UserUpdated

| Field | Value |
|-------|-------|
| **Owning Domain** | Identity and Access |
| **Aggregate** | User |
| **Trigger** | User profile fields updated (name, email, phone) |
| **Business Purpose** | Synchronizes user profile changes to downstream person records |
| **Payload Summary** | userId, changedFields (array), previousValues, newValues, updatedAt |
| **Event Version** | 1 |
| **Publisher** | UserService |
| **Consumers** | People (person record sync) |
| **Ordering Requirements** | Out-of-order delivery acceptable; consumer applies latest state |
| **Idempotency Requirements** | Consumer must check eventId; version-based conflict resolution for person records |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin; profile sync deferred |
| **Security Considerations** | Payload contains PII (email, name); internal event bus only |
| **Audit Requirements** | Log event receipt; log field changes |

---

#### 7.1.3 UserDeactivated

| Field | Value |
|-------|-------|
| **Owning Domain** | Identity and Access |
| **Aggregate** | User |
| **Trigger** | User account deactivated by admin or automated policy |
| **Business Purpose** | Triggers downstream cleanup: asset return, status sync, access revocation |
| **Payload Summary** | userId, deactivatedBy, reason, deactivatedAt |
| **Event Version** | 1 |
| **Publisher** | UserService |
| **Consumers** | People (person status sync), Operations (asset return trigger) |
| **Ordering Requirements** | Must be processed after deactivation is committed |
| **Idempotency Requirements** | Consumer must check eventId; duplicate delivery must not trigger duplicate asset returns |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin and institution admin; manual asset return may be required |
| **Security Considerations** | Payload contains userId; internal event bus only |
| **Audit Requirements** | Log event receipt; log deactivation reason |

---

#### 7.1.4 PasswordResetRequested

| Field | Value |
|-------|-------|
| **Owning Domain** | Identity and Access |
| **Aggregate** | User |
| **Trigger** | User or admin requests password reset |
| **Business Purpose** | Triggers password reset email delivery via Communication |
| **Payload Summary** | userId, email, resetToken, expiresAt, requestedAt |
| **Event Version** | 1 |
| **Publisher** | AuthenticationService |
| **Consumers** | Communication (reset email) |
| **Ordering Requirements** | Independent; no ordering dependency |
| **Idempotency Requirements** | Consumer must check eventId; duplicate delivery must not send duplicate reset emails |
| **Retry Strategy** | Immediate retry; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin; user may retry reset request |
| **Security Considerations** | Payload contains resetToken (sensitive); encrypt at rest; never log token in plaintext |
| **Audit Requirements** | Log event receipt; log email delivery status |

---

#### 7.1.5 MFAEnabled

| Field | Value |
|-------|-------|
| **Owning Domain** | Identity and Access |
| **Aggregate** | User |
| **Trigger** | User enables multi-factor authentication |
| **Business Purpose** | Sends security notification confirming MFA activation |
| **Payload Summary** | userId, email, mfaMethod, enabledAt |
| **Event Version** | 1 |
| **Publisher** | AuthenticationService |
| **Consumers** | Communication (security notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin; notification may be deferred |
| **Security Considerations** | Payload contains email (PII); internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.1.6 AccountLocked

| Field | Value |
|-------|-------|
| **Owning Domain** | Identity and Access |
| **Aggregate** | User |
| **Trigger** | Account locked due to excessive failed login attempts |
| **Business Purpose** | Sends urgent security alert to user and platform admin |
| **Payload Summary** | userId, email, lockedAt, failedAttemptCount, lockDuration |
| **Event Version** | 1 |
| **Publisher** | AuthenticationService |
| **Consumers** | Communication (security alert) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Immediate retry; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin directly via monitoring |
| **Security Considerations** | Payload contains email and security event data; high-priority delivery |
| **Audit Requirements** | Log event receipt; log security event |

---

#### 7.1.7 PlatformAdminLogin

| Field | Value |
|-------|-------|
| **Owning Domain** | Identity and Access |
| **Aggregate** | Session |
| **Trigger** | Platform super admin successfully authenticated |
| **Business Purpose** | Platform audit trail for administrative access |
| **Payload Summary** | adminUserId, email, ipAddress, userAgent, loginAt |
| **Event Version** | 1 |
| **Publisher** | AuthenticationService |
| **Consumers** | Platform Administration (audit logging) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Best effort; non-critical |
| **Dead Letter Queue Behaviour** | Log warning; do not block admin login |
| **Security Considerations** | Payload contains IP address and user agent; store in audit log only |
| **Audit Requirements** | This event IS the audit record; store in append-only audit log |

---

#### 7.1.8 PlatformAdminLogout

| Field | Value |
|-------|-------|
| **Owning Domain** | Identity and Access |
| **Aggregate** | Session |
| **Trigger** | Platform super admin session terminated |
| **Business Purpose** | Platform audit trail for administrative access |
| **Payload Summary** | adminUserId, email, sessionDuration, logoutAt |
| **Event Version** | 1 |
| **Publisher** | AuthenticationService |
| **Consumers** | Platform Administration (audit logging) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Best effort; non-critical |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Low sensitivity; audit log only |
| **Audit Requirements** | This event IS the audit record |

---

### 7.2 Institution Management

**Domain:** Institution Management
**Aggregate:** Institution, AcademicCalendar, ModuleLicense
**Specification Reference:** Institution Management Engineering.md

---

#### 7.2.1 InstitutionCreated

| Field | Value |
|-------|-------|
| **Owning Domain** | Institution Management |
| **Aggregate** | Institution |
| **Trigger** | New institution provisioned within a tenant |
| **Business Purpose** | Triggers setup welcome, default template creation, and analytics initialization |
| **Payload Summary** | institutionId, institutionName, tenantId, adminUserId, createdAt |
| **Event Version** | 1 |
| **Publisher** | InstitutionService |
| **Consumers** | Communication (setup welcome), Documents and Learning (default templates) |
| **Ordering Requirements** | Must be first event for the institution; all subsequent institution events depend on this |
| **Idempotency Requirements** | Consumer must check eventId; duplicate delivery must not create duplicate templates |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin; manual setup may be required |
| **Security Considerations** | Payload contains institution name; internal bus only |
| **Audit Requirements** | Log event receipt; log template creation |

---

#### 7.2.2 AcademicCalendarConfigured

| Field | Value |
|-------|-------|
| **Owning Domain** | Institution Management |
| **Aggregate** | AcademicCalendar |
| **Trigger** | Academic calendar configured with sessions and terms |
| **Business Purpose** | Triggers Academic Management to create session and term records |
| **Payload Summary** | institutionId, calendarId, sessions (array), configuredAt |
| **Event Version** | 1 |
| **Publisher** | AcademicCalendarService |
| **Consumers** | Academic Management (session and term creation) |
| **Ordering Requirements** | Must be processed after institution setup is complete |
| **Idempotency Requirements** | Consumer must check eventId and calendarId; duplicate delivery must not create duplicate sessions |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert institution admin; academic setup may be deferred |
| **Security Considerations** | Low sensitivity; academic configuration data |
| **Audit Requirements** | Log event receipt; log session creation |

---

#### 7.2.3 UserInvited

| Field | Value |
|-------|-------|
| **Owning Domain** | Institution Management |
| **Aggregate** | OrganizationUser |
| **Trigger** | Institution admin invites a user to join the institution |
| **Business Purpose** | Sends invitation email with activation link |
| **Payload Summary** | institutionId, inviteeEmail, invitedBy, role, invitationToken, expiresAt |
| **Event Version** | 1 |
| **Publisher** | OrganizationUserService |
| **Consumers** | Communication (invitation email) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check; duplicate delivery must not send duplicate invitations |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert institution admin; user may be re-invited |
| **Security Considerations** | Payload contains email and invitation token (sensitive); encrypt token at rest |
| **Audit Requirements** | Log event receipt; log email delivery status |

---

#### 7.2.4 InstitutionSettingsUpdated

| Field | Value |
|-------|-------|
| **Owning Domain** | Institution Management |
| **Aggregate** | Institution |
| **Trigger** | Institution settings changed (name, timezone, locale, branding) |
| **Business Purpose** | Synchronizes settings to caches and triggers analytics refresh |
| **Payload Summary** | institutionId, changedFields, previousValues, newValues, updatedAt |
| **Event Version** | 1 |
| **Publisher** | InstitutionService |
| **Consumers** | Communication (settings sync), Reporting and Analytics (cache refresh) |
| **Ordering Requirements** | Out-of-order acceptable; consumer applies latest state |
| **Idempotency Requirements** | Standard eventId check; version-based conflict resolution |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin |
| **Security Considerations** | Low sensitivity; institution configuration |
| **Audit Requirements** | Log event receipt; log settings changes |

---

#### 7.2.5 ModuleActivated

| Field | Value |
|-------|-------|
| **Owning Domain** | Institution Management |
| **Aggregate** | InstitutionModule |
| **Trigger** | Institution activates a licensed module |
| **Business Purpose** | Enables module-specific features in downstream domains |
| **Payload Summary** | institutionId, moduleId, moduleKey, activatedAt |
| **Event Version** | 1 |
| **Publisher** | ModuleLicenseService |
| **Consumers** | Academic Management, Finance, Operations (enable module features) |
| **Ordering Requirements** | Must be processed after module license is validated |
| **Idempotency Requirements** | Standard eventId check; duplicate delivery must not re-enable already-enabled features |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert institution admin and platform admin |
| **Security Considerations** | Low sensitivity; module activation status |
| **Audit Requirements** | Log event receipt; log feature enablement |

---

#### 7.2.6 ModuleDeactivated

| Field | Value |
|-------|-------|
| **Owning Domain** | Institution Management |
| **Aggregate** | InstitutionModule |
| **Trigger** | Institution deactivates a module or license expires |
| **Business Purpose** | Disables module-specific features in downstream domains |
| **Payload Summary** | institutionId, moduleId, moduleKey, deactivatedAt, reason |
| **Event Version** | 1 |
| **Publisher** | ModuleLicenseService |
| **Consumers** | Academic Management, Finance, Operations (disable module features) |
| **Ordering Requirements** | Must be processed after deactivation is committed |
| **Idempotency Requirements** | Standard eventId check; duplicate must not re-disable already-disabled features |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin |
| **Security Considerations** | Low sensitivity; module deactivation status |
| **Audit Requirements** | Log event receipt; log feature disablement |

---

### 7.3 People

**Domain:** People
**Aggregate:** Person, Student, Staff, Parent, Guardian
**Specification Reference:** People Engineering.md

---

#### 7.3.1 StudentEnrolled

| Field | Value |
|-------|-------|
| **Owning Domain** | People |
| **Aggregate** | Student |
| **Trigger** | Student enrollment record created within an institution |
| **Business Purpose** | Core enrollment event; triggers class enrollment, fee assignment, medical record creation, document setup, analytics, and license counting across 7 domains |
| **Payload Summary** | studentId, personId, institutionId, academicSessionId, enrollmentType, enrollmentDate, gradeLevelId |
| **Event Version** | 1 |
| **Publisher** | StudentEnrollmentService |
| **Consumers** | Academic Management (class enrollment), Finance (fee assignment), Communication (welcome notification), Operations (medical record), Documents and Learning (document setup), Reporting and Analytics (enrollment count), Platform Administration (license count) |
| **Ordering Requirements** | Must be processed before any academic or financial operations on the student |
| **Idempotency Requirements** | Critical: 7 consumers. Each must check eventId. Duplicate delivery must not create duplicate records in any domain |
| **Retry Strategy** | Exponential backoff (1s, 5s, 30s, 120s); max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin and institution admin; manual intervention required for each failed consumer |
| **Security Considerations** | Payload contains student PII (personId, name); internal bus only; tenant-scoped |
| **Audit Requirements** | Log event receipt in all 7 consumer domains; log original actorId |

---

#### 7.3.2 StudentTransferred

| Field | Value |
|-------|-------|
| **Owning Domain** | People |
| **Aggregate** | StudentTransfer |
| **Trigger** | Student transferred between institutions |
| **Business Purpose** | Adjusts enrollment and billing in source and destination institutions |
| **Payload Summary** | studentId, sourceInstitutionId, destinationInstitutionId, transferDate, reason |
| **Event Version** | 1 |
| **Publisher** | StudentTransferService |
| **Consumers** | Academic Management (enrollment sync), Finance (billing adjustment), Communication (notification) |
| **Ordering Requirements** | Must be processed after transfer record is committed |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert institution admin in both institutions |
| **Security Considerations** | Payload contains cross-institution data; tenant-scoped validation required |
| **Audit Requirements** | Log event receipt in all consumer domains |

---

#### 7.3.3 StudentWithdrawn

| Field | Value |
|-------|-------|
| **Owning Domain** | People |
| **Aggregate** | Student |
| **Trigger** | Student withdrawn from institution (voluntary or administrative) |
| **Business Purpose** | Triggers enrollment removal, final billing, checkout, document archival, and license count update across 6 domains |
| **Payload Summary** | studentId, institutionId, withdrawnBy, reason, withdrawalDate |
| **Event Version** | 1 |
| **Publisher** | StudentEnrollmentService |
| **Consumers** | Academic Management (enrollment removal), Finance (final billing), Communication (notification), Operations (checkout trigger), Documents and Learning (archival), Platform Administration (license count) |
| **Ordering Requirements** | Must be processed after withdrawal is committed; triggers checkout saga |
| **Idempotency Requirements** | Critical: 6 consumers. Each must check eventId. Duplicate delivery must not trigger duplicate checkouts |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert platform admin and institution admin; manual checkout may be required |
| **Security Considerations** | Payload contains student PII; internal bus only |
| **Audit Requirements** | Log event receipt in all consumer domains |

---

#### 7.3.4 StudentGraduated

| Field | Value |
|-------|-------|
| **Owning Domain** | People |
| **Aggregate** | Student |
| **Trigger** | Student graduation confirmed |
| **Business Purpose** | Triggers progression, notification, checkout, document archival across 4+ domains |
| **Payload Summary** | studentId, institutionId, graduationDate, finalGrade, diplomaNumber |
| **Event Version** | 1 |
| **Publisher** | StudentEnrollmentService |
| **Consumers** | Academic Management (progression), Communication (notification), Operations (checkout trigger), Documents and Learning (archival) |
| **Ordering Requirements** | Must be processed after graduation record is committed |
| **Idempotency Requirements** | Critical: multiple consumers. Standard idempotency for each |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert institution admin; manual graduation processing |
| **Security Considerations** | Payload contains student PII and academic data; internal bus only |
| **Audit Requirements** | Log event receipt in all consumer domains |

---

#### 7.3.5 StaffHired

| Field | Value |
|-------|-------|
| **Owning Domain** | People |
| **Aggregate** | Staff |
| **Trigger** | Staff member hired and record created |
| **Business Purpose** | Triggers onboarding cascade: teaching assignment, welcome email, medical record, asset assignment, analytics, license count across 6 domains |
| **Payload Summary** | staffId, personId, institutionId, hireDate, department, position |
| **Event Version** | 1 |
| **Publisher** | StaffService |
| **Consumers** | Academic Management (teaching assignment), Communication (onboarding welcome), Operations (medical record, asset assignment), Reporting and Analytics (staff count), Platform Administration (license count) |
| **Ordering Requirements** | Must be processed after staff record is committed |
| **Idempotency Requirements** | Critical: 5+ consumers. Each must check eventId |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert institution admin; manual onboarding may be required |
| **Security Considerations** | Payload contains staff PII; internal bus only |
| **Audit Requirements** | Log event receipt in all consumer domains |

---

#### 7.3.6 StaffSeparated

| Field | Value |
|-------|-------|
| **Owning Domain** | People |
| **Aggregate** | Staff |
| **Trigger** | Staff member separated from institution |
| **Business Purpose** | Triggers teaching assignment removal, notification, asset return, document archival, license count update across 5 domains |
| **Payload Summary** | staffId, institutionId, separatedBy, reason, separationDate |
| **Event Version** | 1 |
| **Publisher** | StaffService |
| **Consumers** | Academic Management (teaching assignment removal), Communication (notification), Operations (asset return), Documents and Learning (archival), Platform Administration (license count) |
| **Ordering Requirements** | Must be processed after separation is committed |
| **Idempotency Requirements** | Standard eventId check across all consumers |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert institution admin; manual separation processing |
| **Security Considerations** | Payload contains staff PII; internal bus only |
| **Audit Requirements** | Log event receipt in all consumer domains |

---

#### 7.3.7 ParentLinked

| Field | Value |
|-------|-------|
| **Owning Domain** | People |
| **Aggregate** | ParentStudentLink |
| **Trigger** | Parent or guardian linked to a student record |
| **Business Purpose** | Notifies Communication to send parent onboarding notification |
| **Payload Summary** | parentId, studentId, institutionId, linkType, linkedAt |
| **Event Version** | 1 |
| **Publisher** | ParentService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning; notification may be deferred |
| **Security Considerations** | Payload contains parent and student IDs; internal bus only |
| **Audit Requirements** | Log event receipt |

---

### 7.4 Academic Management

**Domain:** Academic Management
**Aggregate:** Term, StudentClassEnrollment, Assignment, Assessment, Result, ReportCard, SummerSchool
**Specification Reference:** Academic Management Engineering.md

---

#### 7.4.1 TermActivated

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | Term |
| **Trigger** | Term status transitions to ACTIVE |
| **Business Purpose** | Notifies Communication to send term start notification |
| **Payload Summary** | termId, academicSessionId, name, startDate, institutionId |
| **Event Version** | 1 |
| **Publisher** | AcademicCalendarService |
| **Consumers** | Communication (term start notification) |
| **Ordering Requirements** | Must be processed after term activation is committed |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning; notification may be deferred |
| **Security Considerations** | Low sensitivity; academic calendar data |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.2 TermClosed

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | Term |
| **Trigger** | Term status transitions to CLOSED |
| **Business Purpose** | Triggers report card generation, analytics snapshot, and term closure notification across 3 domains |
| **Payload Summary** | termId, academicSessionId, name, closedAt, institutionId |
| **Event Version** | 1 |
| **Publisher** | AcademicCalendarService |
| **Consumers** | Documents and Learning (report card generation), Reporting and Analytics (term metrics), Communication (term closure notification) |
| **Ordering Requirements** | Must be processed after all results for the term are finalized |
| **Idempotency Requirements** | Standard eventId check across all consumers |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert institution admin; report card generation may be deferred |
| **Security Considerations** | Low sensitivity; academic calendar data |
| **Audit Requirements** | Log event receipt in all consumer domains |

---

#### 7.4.3 StudentClassEnrolled

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | StudentClassEnrollment |
| **Trigger** | Student enrolled in a specific class/arm |
| **Business Purpose** | Synchronizes enrollment state back to People domain |
| **Payload Summary** | enrollmentId, studentPersonId, classId, armId, academicSessionId, enrolledAt |
| **Event Version** | 1 |
| **Publisher** | ClassEnrollmentService |
| **Consumers** | People (enrollment sync) |
| **Ordering Requirements** | Must follow StudentEnrolled event from People |
| **Idempotency Requirements** | Standard eventId check; duplicate must not create duplicate enrollment in People |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert academic admin |
| **Security Considerations** | Contains student ID; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.4 StudentClassTransferred

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | StudentClassEnrollment |
| **Trigger** | Student transferred between classes |
| **Business Purpose** | Synchronizes transfer state back to People domain |
| **Payload Summary** | enrollmentId, studentPersonId, sourceClassId, destinationClassId, transferredAt |
| **Event Version** | 1 |
| **Publisher** | ClassEnrollmentService |
| **Consumers** | People (enrollment sync) |
| **Ordering Requirements** | Independent; out-of-order acceptable |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert academic admin |
| **Security Considerations** | Contains student ID; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.5 AssignmentPublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | Assignment |
| **Trigger** | Teacher publishes assignment to students |
| **Business Purpose** | Sends notification to students and parents about new assignment |
| **Payload Summary** | assignmentId, title, subjectId, classId, dueDate, publishedAt |
| **Event Version** | 1 |
| **Publisher** | AssignmentService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Low sensitivity; academic content metadata |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.6 AssignmentSubmitted

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | Assignment |
| **Trigger** | Student submits assignment |
| **Business Purpose** | Notifies teacher of submission |
| **Payload Summary** | assignmentId, studentPersonId, submittedAt |
| **Event Version** | 1 |
| **Publisher** | AssignmentService |
| **Consumers** | Communication (notification to teacher) |
| **Ordering Requirements** | Must follow AssignmentPublished |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains student ID; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.7 AssignmentReturned

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | Assignment |
| **Trigger** | Teacher returns graded assignment with feedback |
| **Business Purpose** | Notifies student of graded assignment |
| **Payload Summary** | assignmentId, studentPersonId, score, feedback, returnedAt |
| **Event Version** | 1 |
| **Publisher** | AssignmentService |
| **Consumers** | Communication (notification to student) |
| **Ordering Requirements** | Must follow AssignmentSubmitted |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains student ID and grade data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.8 AssessmentPublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | Assessment |
| **Trigger** | Assessment published for student participation |
| **Business Purpose** | Sends notification to students and parents about upcoming assessment |
| **Payload Summary** | assessmentId, title, type, subjectId, classId, scheduledDate, publishedAt |
| **Event Version** | 1 |
| **Publisher** | AssessmentService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Low sensitivity; academic content metadata |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.9 ResultPublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | Result |
| **Trigger** | Results published to students and parents |
| **Business Purpose** | Triggers report card generation, result notifications, and analytics update across 3 domains |
| **Payload Summary** | resultId, studentPersonId, termId, academicSessionId, totalScore, averageScore, position, publishedAt |
| **Event Version** | 1 |
| **Publisher** | ResultService |
| **Consumers** | Communication (result notification), Documents and Learning (report card generation), Reporting and Analytics (result metrics) |
| **Ordering Requirements** | Must be processed after result approval |
| **Idempotency Requirements** | Critical: 3 consumers. Standard idempotency for each |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert academic admin and institution admin |
| **Security Considerations** | Contains student grades (sensitive academic data); internal bus only |
| **Audit Requirements** | Log event receipt in all consumer domains |

---

#### 7.4.10 ReportCardGenerated

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | ReportCard |
| **Trigger** | Report card document generated from template |
| **Business Purpose** | Notifies parents that report card is ready for review |
| **Payload Summary** | reportCardId, studentPersonId, termId, generatedAt |
| **Event Version** | 1 |
| **Publisher** | ReportCardService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Must follow ResultPublished |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains student academic data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.11 ReportCardPublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | ReportCard |
| **Trigger** | Report card made visible to parents and students |
| **Business Purpose** | Sends final report card notification |
| **Payload Summary** | reportCardId, studentPersonId, termId, publishedAt |
| **Event Version** | 1 |
| **Publisher** | ReportCardService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Must follow ReportCardGenerated |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains student academic data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.12 StudentPromoted

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | AcademicProgression |
| **Trigger** | Student promoted to next grade level |
| **Business Purpose** | Synchronizes progression to People and sends notification |
| **Payload Summary** | studentPersonId, sourceGradeLevelId, destinationGradeLevelId, academicSessionId, promotedAt |
| **Event Version** | 1 |
| **Publisher** | AcademicProgressionService |
| **Consumers** | People (progression sync), Communication (notification) |
| **Ordering Requirements** | Must follow end-of-term processing |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert academic admin |
| **Security Considerations** | Contains student academic data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.13 StudentRetained

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | AcademicProgression |
| **Trigger** | Student retained in current grade level |
| **Business Purpose** | Sends notification to parents about retention decision |
| **Payload Summary** | studentPersonId, gradeLevelId, academicSessionId, reason, retainedAt |
| **Event Version** | 1 |
| **Publisher** | AcademicProgressionService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Must follow end-of-term processing |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains student academic data and retention reason (sensitive); internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.14 StudentGraduated

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | AcademicProgression |
| **Trigger** | Student graduation confirmed by academic system |
| **Business Purpose** | Synchronizes graduation to People and triggers checkout cascade |
| **Payload Summary** | studentPersonId, institutionId, finalGradeLevelId, graduationDate |
| **Event Version** | 1 |
| **Publisher** | AcademicProgressionService |
| **Consumers** | People (graduation sync), Communication (notification), Documents and Learning (archival), Operations (checkout) |
| **Ordering Requirements** | Must follow end-of-term processing; coordinates with People graduation event |
| **Idempotency Requirements** | Standard eventId check across all consumers |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert academic and institution admin |
| **Security Considerations** | Contains student academic data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.15 StudentWithdrawn

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | StudentClassEnrollment |
| **Trigger** | Student withdrawn from academic enrollment |
| **Business Purpose** | Synchronizes withdrawal to People and sends notification |
| **Payload Summary** | studentPersonId, classId, reason, withdrawnAt |
| **Event Version** | 1 |
| **Publisher** | ClassEnrollmentService |
| **Consumers** | People (withdrawal sync), Communication (notification) |
| **Ordering Requirements** | Coordinates with People withdrawal event |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert academic admin |
| **Security Considerations** | Contains student data and withdrawal reason; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.16 StudentPlacedOnProbation

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | AcademicProgression |
| **Trigger** | Student placed on academic probation based on performance criteria |
| **Business Purpose** | Sends notification to parents and student about probation status |
| **Payload Summary** | studentPersonId, reason, criteria, placedAt |
| **Event Version** | 1 |
| **Publisher** | AcademicProgressionService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains student academic data and probation reason (sensitive); internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.17 SummerSchoolRegistered

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | SummerSchoolRegistration |
| **Trigger** | Student registered for summer school program |
| **Business Purpose** | Sends notification and triggers Finance billing for summer school fees |
| **Payload Summary** | registrationId, studentPersonId, programId, courses (array), registeredAt |
| **Event Version** | 1 |
| **Publisher** | SummerSchoolService |
| **Consumers** | Communication (notification), Finance (billing trigger) |
| **Ordering Requirements** | Must be processed before summer school session begins |
| **Idempotency Requirements** | Standard eventId check; duplicate must not create duplicate billing |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert academic and finance admin |
| **Security Considerations** | Contains student data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.4.18 SummerSchoolResultPublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Academic Management |
| **Aggregate** | SummerSchoolResult |
| **Trigger** | Summer school results published |
| **Business Purpose** | Synchronizes result to People and sends notification |
| **Payload Summary** | resultId, studentPersonId, programId, scores, publishedAt |
| **Event Version** | 1 |
| **Publisher** | SummerSchoolService |
| **Consumers** | People (result sync), Communication (notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains student grades; internal bus only |
| **Audit Requirements** | Log event receipt |

---

### 7.5 Finance

**Domain:** Finance
**Aggregate:** Bill, Invoice, Payment, Refund, Scholarship, Discount
**Specification Reference:** Finance Engineering.md

---

#### 7.5.1 BillGenerated

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Bill |
| **Trigger** | Bill created for student (from fee schedule, summer school, or fine) |
| **Business Purpose** | Notifies Communication to send bill notification to parent |
| **Payload Summary** | billId, studentPersonId, parentPersonId, totalAmount, currency, dueDate, items (array), generatedAt |
| **Event Version** | 1 |
| **Publisher** | BillingService |
| **Consumers** | Communication (bill notification) |
| **Ordering Requirements** | Must be processed after bill is committed |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin |
| **Security Considerations** | Contains financial data (amounts); internal bus only; tenant-scoped |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.2 InvoiceGenerated

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Invoice |
| **Trigger** | Invoice created from bill, ready for payment |
| **Business Purpose** | Sends invoice notification and triggers invoice document generation in Documents and Learning |
| **Payload Summary** | invoiceId, billId, studentPersonId, parentPersonId, totalAmount, currency, dueDate, lineItems (array), generatedAt |
| **Event Version** | 1 |
| **Publisher** | InvoiceService |
| **Consumers** | Communication (invoice notification), Documents and Learning (invoice document generation) |
| **Ordering Requirements** | Must follow BillGenerated |
| **Idempotency Requirements** | Standard eventId check; duplicate must not create duplicate invoice documents |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin |
| **Security Considerations** | Contains financial data (amounts, line items); internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.3 InvoicePublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Invoice |
| **Trigger** | Invoice finalized and sent to parent |
| **Business Purpose** | Sends final invoice notification to parent |
| **Payload Summary** | invoiceId, studentPersonId, parentPersonId, totalAmount, publishedAt |
| **Event Version** | 1 |
| **Publisher** | InvoiceService |
| **Consumers** | Communication (invoice notification) |
| **Ordering Requirements** | Must follow InvoiceGenerated |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains financial data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.4 InvoiceOverdue

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Invoice |
| **Trigger** | Cron job detects invoice past due date |
| **Business Purpose** | Sends overdue reminder and flags for Operations follow-up |
| **Payload Summary** | invoiceId, studentPersonId, parentPersonId, totalAmount, dueDate, daysOverdue |
| **Event Version** | 1 |
| **Publisher** | InvoiceService |
| **Consumers** | Communication (overdue reminder), Operations (follow-up flag) |
| **Ordering Requirements** | Independent; triggered by cron |
| **Idempotency Requirements** | Standard eventId check; must not send duplicate reminders for same overdue period |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin |
| **Security Considerations** | Contains financial data and parent contact reference; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.5 PaymentConfirmed

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Payment |
| **Trigger** | Payment verified and confirmed by finance system or payment gateway |
| **Business Purpose** | Triggers receipt generation, payment confirmation, and fine clearance across 4 domains |
| **Payload Summary** | paymentId, invoiceId, studentPersonId, amount, currency, paymentMethod, confirmedAt |
| **Event Version** | 1 |
| **Publisher** | PaymentService |
| **Consumers** | Communication (receipt and confirmation), Documents and Learning (receipt document), Operations (fine clearance) |
| **Ordering Requirements** | Must be processed after payment allocation is committed |
| **Idempotency Requirements** | Critical: 3 consumers. Standard idempotency for each |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin and institution admin; payment received but downstream processing failed |
| **Security Considerations** | Contains payment data (amount, method); sensitive financial data; internal bus only |
| **Audit Requirements** | Log event receipt in all consumer domains; log payment details |

---

#### 7.5.6 PaymentFailed

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Payment |
| **Trigger** | Payment attempt failed (gateway rejection, insufficient funds, etc.) |
| **Business Purpose** | Sends payment failure alert to parent and finance admin |
| **Payload Summary** | paymentId, invoiceId, studentPersonId, amount, failureReason, failedAt |
| **Event Version** | 1 |
| **Publisher** | PaymentService |
| **Consumers** | Communication (failure alert) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin directly |
| **Security Considerations** | Contains payment data and failure reason; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.7 OverpaymentCreated

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Overpayment |
| **Trigger** | Payment exceeds outstanding invoice balance |
| **Business Purpose** | Notifies parent of overpayment and available credit |
| **Payload Summary** | overpaymentId, studentPersonId, amount, currency, invoiceId, createdAt |
| **Event Version** | 1 |
| **Publisher** | PaymentService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Must follow PaymentConfirmed |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains financial data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.8 RefundProcessed

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Refund |
| **Trigger** | Refund completed and funds returned to parent |
| **Business Purpose** | Sends refund confirmation to parent |
| **Payload Summary** | refundId, studentPersonId, amount, currency, refundMethod, processedAt |
| **Event Version** | 1 |
| **Publisher** | RefundService |
| **Consumers** | Communication (refund confirmation) |
| **Ordering Requirements** | Must follow RefundRequested |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin |
| **Security Considerations** | Contains refund data; sensitive financial data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.9 RefundRequested

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Refund |
| **Trigger** | Parent or admin submits refund request |
| **Business Purpose** | Notifies finance admin of refund request for review |
| **Payload Summary** | refundId, studentPersonId, amount, reason, requestedBy, requestedAt |
| **Event Version** | 1 |
| **Publisher** | RefundService |
| **Consumers** | Communication (notification to finance admin) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin directly |
| **Security Considerations** | Contains refund data and reason; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.10 RefundRejected

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Refund |
| **Trigger** | Refund request rejected by finance admin |
| **Business Purpose** | Notifies parent of refund rejection with reason |
| **Payload Summary** | refundId, studentPersonId, rejectionReason, rejectedBy, rejectedAt |
| **Event Version** | 1 |
| **Publisher** | RefundService |
| **Consumers** | Communication (rejection notification) |
| **Ordering Requirements** | Must follow RefundRequested |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains rejection reason; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.11 ScholarshipAwarded

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | ScholarshipAward |
| **Trigger** | Scholarship awarded to student |
| **Business Purpose** | Sends scholarship award notification and applies fee discount |
| **Payload Summary** | scholarshipAwardId, studentPersonId, scholarshipId, amount, discountPercentage, awardedAt |
| **Event Version** | 1 |
| **Publisher** | ScholarshipService |
| **Consumers** | Communication (award notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin |
| **Security Considerations** | Contains scholarship and financial data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.12 InstallmentOverdue

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | InstallmentPlan |
| **Trigger** | Installment payment past due date |
| **Business Purpose** | Sends installment overdue reminder to parent |
| **Payload Summary** | installmentId, planId, studentPersonId, amount, dueDate, daysOverdue |
| **Event Version** | 1 |
| **Publisher** | InstallmentPlanService |
| **Consumers** | Communication (overdue reminder) |
| **Ordering Requirements** | Independent; triggered by cron |
| **Idempotency Requirements** | Standard eventId check; must not send duplicate reminders |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin |
| **Security Considerations** | Contains financial data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.13 SummerSchoolBillingRequested

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Bill |
| **Trigger** | Billing request received from Academic Management for summer school |
| **Business Purpose** | Internal Finance acknowledgment of billing request (no cross-domain consumers) |
| **Payload Summary** | registrationId, studentPersonId, programId, courses, requestedAt |
| **Event Version** | 1 |
| **Publisher** | BillingService |
| **Consumers** | None (Finance internal acknowledgment) |
| **Ordering Requirements** | Must follow SummerSchoolRegistered from Academic Management |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | N/A (no external consumers) |
| **Dead Letter Queue Behaviour** | N/A |
| **Security Considerations** | Internal Finance event |
| **Audit Requirements** | Log event receipt |

---

#### 7.5.14 SummerSchoolInvoiceGenerated

| Field | Value |
|-------|-------|
| **Owning Domain** | Finance |
| **Aggregate** | Invoice |
| **Trigger** | Invoice generated for summer school enrollment |
| **Business Purpose** | Sends summer school invoice notification to parent |
| **Payload Summary** | invoiceId, studentPersonId, parentPersonId, programId, totalAmount, generatedAt |
| **Event Version** | 1 |
| **Publisher** | InvoiceService |
| **Consumers** | Communication (invoice notification) |
| **Ordering Requirements** | Must follow SummerSchoolBillingRequested |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert finance admin |
| **Security Considerations** | Contains financial data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

### 7.6 Communication

**Domain:** Communication
**Aggregate:** Notification, Campaign, Announcement, Message
**Specification Reference:** Communication Engineering.md

---

#### 7.6.1 NotificationDispatched

| Field | Value |
|-------|-------|
| **Owning Domain** | Communication |
| **Aggregate** | Notification |
| **Trigger** | Notification queued for delivery to provider (SMS, email, push) |
| **Business Purpose** | Tracks delivery pipeline metrics for Reporting and Analytics |
| **Payload Summary** | notificationId, channel, recipientCount, templateId, dispatchedAt |
| **Event Version** | 1 |
| **Publisher** | NotificationService |
| **Consumers** | Reporting and Analytics (delivery metrics) |
| **Ordering Requirements** | Must precede NotificationDelivered or NotificationFailed |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Best effort; non-critical for analytics |
| **Dead Letter Queue Behaviour** | Log warning; analytics may have slight delay |
| **Security Considerations** | Low sensitivity; delivery metadata |
| **Audit Requirements** | Log event receipt |

---

#### 7.6.2 NotificationDelivered

| Field | Value |
|-------|-------|
| **Owning Domain** | Communication |
| **Aggregate** | Notification |
| **Trigger** | Provider confirms successful delivery (email opened, SMS delivered, push received) |
| **Business Purpose** | Updates delivery metrics in Reporting and Analytics |
| **Payload Summary** | notificationId, channel, recipientId, deliveredAt, providerMessageId |
| **Event Version** | 1 |
| **Publisher** | DeliveryTrackerService |
| **Consumers** | Reporting and Analytics (delivery metrics) |
| **Ordering Requirements** | Must follow NotificationDispatched |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Best effort |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Low sensitivity; delivery metadata |
| **Audit Requirements** | Log event receipt |

---

#### 7.6.3 NotificationRead

| Field | Value |
|-------|-------|
| **Owning Domain** | Communication |
| **Aggregate** | Notification |
| **Trigger** | Recipient opens in-app notification |
| **Business Purpose** | Tracks read rates for analytics |
| **Payload Summary** | notificationId, recipientId, readAt |
| **Event Version** | 1 |
| **Publisher** | NotificationService |
| **Consumers** | Reporting and Analytics |
| **Ordering Requirements** | Must follow NotificationDelivered |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Best effort |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Low sensitivity |
| **Audit Requirements** | Log event receipt |

---

#### 7.6.4 NotificationFailed

| Field | Value |
|-------|-------|
| **Owning Domain** | Communication |
| **Aggregate** | Notification |
| **Trigger** | All delivery attempts exhausted without success |
| **Business Purpose** | Alerts Platform Administration of persistent delivery failures |
| **Payload Summary** | notificationId, channel, recipientId, failureReason, attemptCount, failedAt |
| **Event Version** | 1 |
| **Publisher** | DeliveryTrackerService |
| **Consumers** | Platform Administration (alerting) |
| **Ordering Requirements** | Must follow final retry attempt |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | N/A (this IS the failure endpoint) |
| **Dead Letter Queue Behaviour** | Alert platform admin; manual investigation required |
| **Security Considerations** | Contains failure reason; internal bus only |
| **Audit Requirements** | Log event receipt; log in delivery audit trail |

---

#### 7.6.5 CampaignCompleted

| Field | Value |
|-------|-------|
| **Owning Domain** | Communication |
| **Aggregate** | Campaign |
| **Trigger** | All campaign notifications delivered or failed |
| **Business Purpose** | Reports campaign completion metrics to Reporting and Analytics |
| **Payload Summary** | campaignId, totalRecipients, deliveredCount, failedCount, completedAt |
| **Event Version** | 1 |
| **Publisher** | CampaignService |
| **Consumers** | Reporting and Analytics (campaign metrics) |
| **Ordering Requirements** | Must follow all NotificationDelivered/NotificationFailed for the campaign |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Best effort |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Low sensitivity; aggregate campaign data |
| **Audit Requirements** | Log event receipt |

---

#### 7.6.6 AnnouncementPublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Communication |
| **Aggregate** | Announcement |
| **Trigger** | Announcement made active and visible to recipients |
| **Business Purpose** | Marks announcement as live (no cross-domain consumers required) |
| **Payload Summary** | announcementId, title, targetAudience, publishedAt |
| **Event Version** | 1 |
| **Publisher** | AnnouncementService |
| **Consumers** | None (Communication internal) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | N/A |
| **Dead Letter Queue Behaviour** | N/A |
| **Security Considerations** | Low sensitivity |
| **Audit Requirements** | Log event receipt |

---

#### 7.6.7 MessageSent

| Field | Value |
|-------|-------|
| **Owning Domain** | Communication |
| **Aggregate** | Message |
| **Trigger** | Conversation message delivered to recipient(s) |
| **Business Purpose** | Records message delivery for audit (no cross-domain consumers) |
| **Payload Summary** | messageId, conversationId, senderId, deliveredAt |
| **Event Version** | 1 |
| **Publisher** | MessageService |
| **Consumers** | None (Communication internal) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | N/A |
| **Dead Letter Queue Behaviour** | N/A |
| **Security Considerations** | Contains message metadata; internal bus only |
| **Audit Requirements** | Log event receipt |

---

### 7.7 Operations

**Domain:** Operations
**Aggregate:** Borrowing, RoomAllocation, Transport, MedicalRecord, Incident, WorkOrder, Stock
**Specification Reference:** Operations Engineering.md

---

#### 7.7.1 BookBorrowed

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | Borrowing |
| **Trigger** | Book copy checked out from library |
| **Business Purpose** | Updates library analytics in Reporting and Analytics |
| **Payload Summary** | borrowingId, bookCopyId, bookTitle, userId, dueDate, borrowedAt |
| **Event Version** | 1 |
| **Publisher** | LibraryService |
| **Consumers** | Reporting and Analytics (library analytics) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Best effort; non-critical |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains user ID; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.2 BookReturned

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | Borrowing |
| **Trigger** | Book copy returned to library |
| **Business Purpose** | Triggers fine waiver in Finance and updates analytics |
| **Payload Summary** | borrowingId, bookCopyId, userId, returnedAt, wasOverdue, fineWaived |
| **Event Version** | 1 |
| **Publisher** | LibraryService |
| **Consumers** | Finance (fine waiver), Reporting and Analytics |
| **Ordering Requirements** | Must follow BookBorrowed |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert operations admin |
| **Security Considerations** | Contains user ID and fine data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.3 BookOverdue

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | Borrowing |
| **Trigger** | Cron job detects book past due date |
| **Business Purpose** | Sends overdue reminder and triggers fine creation in Finance |
| **Payload Summary** | borrowingId, bookCopyId, bookTitle, userId, dueDate, daysOverdue |
| **Event Version** | 1 |
| **Publisher** | LibraryService |
| **Consumers** | Communication (overdue reminder), Finance (fine creation) |
| **Ordering Requirements** | Independent; triggered by cron |
| **Idempotency Requirements** | Standard eventId check; must not send duplicate reminders |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert operations admin |
| **Security Considerations** | Contains user ID; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.4 RoomAllocated

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | HostelRoomAllocation |
| **Trigger** | Bed allocated to student in hostel |
| **Business Purpose** | Sends allocation confirmation and triggers hostel fee billing |
| **Payload Summary** | allocationId, studentPersonId, hostelId, roomId, bedId, allocatedAt |
| **Event Version** | 1 |
| **Publisher** | HostelService |
| **Consumers** | Communication (allocation confirmation), Reporting and Analytics |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert operations admin |
| **Security Considerations** | Contains student ID and hostel data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.5 RoomDeallocated

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | HostelRoomAllocation |
| **Trigger** | Bed released from student (checkout, transfer, or withdrawal) |
| **Business Purpose** | Sends deallocation notification |
| **Payload Summary** | allocationId, studentPersonId, roomId, bedId, deallocatedAt, reason |
| **Event Version** | 1 |
| **Publisher** | HostelService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Must follow RoomAllocated |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains student ID; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.6 TransportAssigned

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | TransportAssignment |
| **Trigger** | Student or staff assigned to transport route |
| **Business Purpose** | Sends transport assignment notification |
| **Payload Summary** | assignmentId, personId, routeId, routeName, stopName, assignedAt |
| **Event Version** | 1 |
| **Publisher** | TransportService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains person ID and route data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.7 VisitorCheckedIn

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | Visitor |
| **Trigger** | Visitor badge activated at reception |
| **Business Purpose** | Updates visitor analytics in Reporting and Analytics |
| **Payload Summary** | visitorId, visitorName, visitingStudentId, purpose, checkedInAt |
| **Event Version** | 1 |
| **Publisher** | VisitorService |
| **Consumers** | Reporting and Analytics (visitor analytics) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Best effort |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains visitor PII (name); internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.8 MedicalRecordUpdated

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | MedicalRecord |
| **Trigger** | Medical record modified (new condition, medication update) |
| **Business Purpose** | Sends alert if update involves critical condition |
| **Payload Summary** | medicalRecordId, personId, updateType, isCritical, updatedAt |
| **Event Version** | 1 |
| **Publisher** | ClinicService |
| **Consumers** | Communication (alert if critical) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Immediate retry for critical alerts; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert operations and medical admin |
| **Security Considerations** | Contains medical data (sensitive PII); encrypted at rest; internal bus only; strict tenant isolation |
| **Audit Requirements** | Log event receipt; log medical record access |

---

#### 7.7.9 ClinicVisitRecorded

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | ClinicVisit |
| **Trigger** | Clinic visit logged for student or staff |
| **Business Purpose** | Sends parent notification for student clinic visits |
| **Payload Summary** | visitId, personId, isStudent, diagnosis, treatment, visitedAt |
| **Event Version** | 1 |
| **Publisher** | ClinicService |
| **Consumers** | Communication (parent notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains medical data (sensitive PII); encrypted at rest; internal bus only |
| **Audit Requirements** | Log event receipt; log medical data access |

---

#### 7.7.10 IncidentReported

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | Incident |
| **Trigger** | Incident report created (safety, discipline, or emergency) |
| **Business Purpose** | Sends urgent alert to administration |
| **Payload Summary** | incidentId, type, severity, location, description, reportedBy, reportedAt |
| **Event Version** | 1 |
| **Publisher** | IncidentService |
| **Consumers** | Communication (alert) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Immediate retry for high-severity; max 4 attempts |
| **Dead Letter Queue Behaviour** | Alert operations and institution admin directly |
| **Security Considerations** | Contains incident details (potentially sensitive); internal bus only |
| **Audit Requirements** | Log event receipt; log in incident audit trail |

---

#### 7.7.11 WorkOrderCompleted

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | WorkOrder |
| **Trigger** | Work order finished and verified |
| **Business Purpose** | Sends completion notification and updates analytics |
| **Payload Summary** | workOrderId, maintenanceRequestId, assignedTo, completedAt, notes |
| **Event Version** | 1 |
| **Publisher** | MaintenanceService |
| **Consumers** | Communication (notification), Reporting and Analytics |
| **Ordering Requirements** | Must follow WorkOrderCreated |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Low sensitivity; operations data |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.12 StockDroppedBelowReorder

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | InventoryItem |
| **Trigger** | Stock level fell below reorder threshold |
| **Business Purpose** | Sends reorder alert to operations admin |
| **Payload Summary** | itemId, itemName, currentQuantity, reorderThreshold, droppedAt |
| **Event Version** | 1 |
| **Publisher** | InventoryService |
| **Consumers** | Communication (reorder alert) |
| **Ordering Requirements** | Independent; triggered by inventory transaction |
| **Idempotency Requirements** | Standard eventId check; must not send duplicate alerts for same threshold breach |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Alert operations admin directly |
| **Security Considerations** | Low sensitivity; inventory data |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.13 MaintenanceRequested

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | MaintenanceRequest |
| **Trigger** | Maintenance request submitted by user |
| **Business Purpose** | Sends request acknowledgement to requester |
| **Payload Summary** | requestId, requestedBy, category, description, priority, requestedAt |
| **Event Version** | 1 |
| **Publisher** | MaintenanceService |
| **Consumers** | Communication (acknowledgement notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains requester ID; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.7.14 WorkOrderCreated

| Field | Value |
|-------|-------|
| **Owning Domain** | Operations |
| **Aggregate** | WorkOrder |
| **Trigger** | Work order authorized by admin for maintenance request |
| **Business Purpose** | Notifies assigned staff of new work order |
| **Payload Summary** | workOrderId, maintenanceRequestId, assignedTo, priority, createdAt |
| **Event Version** | 1 |
| **Publisher** | MaintenanceService |
| **Consumers** | Communication (assignment notification) |
| **Ordering Requirements** | Must follow MaintenanceRequested |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains assignee ID; internal bus only |
| **Audit Requirements** | Log event receipt |

---

### 7.8 Documents and Learning

**Domain:** Documents and Learning
**Aggregate:** Document, Template, LearningResource, GeneratedDocument
**Specification Reference:** Documents and Learning Engineering.md

---

#### 7.8.1 DocumentPublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Documents and Learning |
| **Aggregate** | Document |
| **Trigger** | Document status transitions to PUBLISHED |
| **Business Purpose** | Sends notification that document is available |
| **Payload Summary** | documentId, title, type, publishedBy, publishedAt |
| **Event Version** | 1 |
| **Publisher** | DocumentService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains document metadata; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.8.2 DocumentShared

| Field | Value |
|-------|-------|
| **Owning Domain** | Documents and Learning |
| **Aggregate** | DocumentShare |
| **Trigger** | Share record created for document |
| **Business Purpose** | Sends share notification to recipient |
| **Payload Summary** | shareId, documentId, sharedWithUserId, permission, sharedAt |
| **Event Version** | 1 |
| **Publisher** | DocumentShareService |
| **Consumers** | Communication (share notification) |
| **Ordering Requirements** | Must follow DocumentPublished |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue Behaviour** | Log warning |
| **Security Considerations** | Contains share recipient ID; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.8.3 TemplatePublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Documents and Learning |
| **Aggregate** | Template |
| **Trigger** | Template approved and published for use |
| **Business Purpose** | Notifies Communication that new template is available |
| **Payload Summary** | templateId, name, type, publishedBy, publishedAt |
| **Event Version** | 1 |
| **Publisher** | TemplateService |
| **Consumers** | Communication |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Best effort |
| **Dead Letter Queue behaviour** | Log warning |
| **Security Considerations** | Low sensitivity; template metadata |
| **Audit Requirements** | Log event receipt |

---

#### 7.8.4 GeneratedDocumentCreated

| Field | Value |
|-------|-------|
| **Owning Domain** | Documents and Learning |
| **Aggregate** | GeneratedDocument |
| **Trigger** | Document generated from template (invoice, receipt, report card) |
| **Business Purpose** | Delivers generated document to Communication for delivery |
| **Payload Summary** | generatedDocumentId, templateId, documentType, referenceId, fileUrl, generatedAt |
| **Event Version** | 1 |
| **Publisher** | DocumentGenerationService |
| **Consumers** | Communication (document delivery) |
| **Ordering Requirements** | Must follow the triggering event (InvoiceGenerated, PaymentConfirmed, ResultPublished) |
| **Idempotency Requirements** | Standard eventId check; duplicate must not create duplicate delivery |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue behaviour** | Alert institution admin; document generated but not delivered |
| **Security Considerations** | May contain financial or academic data; encrypted at rest; internal bus only |
| **Audit Requirements** | Log event receipt; log delivery status |

---

#### 7.8.5 LearningResourcePublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Documents and Learning |
| **Aggregate** | LearningResource |
| **Trigger** | Learning resource published to students |
| **Business Purpose** | Sends notification about new learning resource |
| **Payload Summary** | resourceId, title, subjectId, classId, publishedBy, publishedAt |
| **Event Version** | 1 |
| **Publisher** | LearningResourceService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Log warning |
| **Security Considerations** | Low sensitivity; academic content metadata |
| **Audit Requirements** | Log event receipt |

---

#### 7.8.6 AssessmentContentPublished

| Field | Value |
|-------|-------|
| **Owning Domain** | Documents and Learning |
| **Aggregate** | AssessmentContent |
| **Trigger** | Assessment content published for student access |
| **Business Purpose** | Sends notification about available assessment content |
| **Payload Summary** | contentId, assessmentId, title, publishedBy, publishedAt |
| **Event Version** | 1 |
| **Publisher** | AssessmentContentService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Log warning |
| **Security Considerations** | Low sensitivity; academic content metadata |
| **Audit Requirements** | Log event receipt |

---

#### 7.8.7 RetentionEnforced

| Field | Value |
|-------|-------|
| **Owning Domain** | Documents and Learning |
| **Aggregate** | RetentionPolicy |
| **Trigger** | Background job enforced retention policy on documents |
| **Business Purpose** | Records retention enforcement for compliance audit |
| **Payload Summary** | policyId, documentsArchived, documentsDeleted, enforcedAt |
| **Event Version** | 1 |
| **Publisher** | RetentionEnforcementService |
| **Consumers** | None (compliance record) |
| **Ordering Requirements** | Independent; triggered by cron |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | N/A |
| **Dead Letter Queue behaviour** | N/A |
| **Security Considerations** | Internal compliance event |
| **Audit Requirements** | This event IS the audit record |

---

### 7.9 Reporting and Analytics

**Domain:** Reporting and Analytics
**Aggregate:** ExportJob, KpiAlert
**Specification Reference:** Reporting and Analytics Engineering.md

---

#### 7.9.1 ExportJobCompleted

| Field | Value |
|-------|-------|
| **Owning Domain** | Reporting and Analytics |
| **Aggregate** | ExportJob |
| **Trigger** | Export file generated and ready for download |
| **Business Purpose** | Delivers export file via Communication |
| **Payload Summary** | exportJobId, fileType, fileSize, downloadUrl, completedAt |
| **Event Version** | 1 |
| **Publisher** | ExportService |
| **Consumers** | Communication (file delivery) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert reporting admin |
| **Security Considerations** | Contains download URL (time-limited, signed); internal bus only |
| **Audit Requirements** | Log event receipt; log file access |

---

#### 7.9.2 KpiThresholdBreached

| Field | Value |
|-------|-------|
| **Owning Domain** | Reporting and Analytics |
| **Aggregate** | KpiAlert |
| **Trigger** | KPI metric exceeded configured threshold |
| **Business Purpose** | Sends alert to administration about threshold breach |
| **Payload Summary** | kpiId, kpiName, currentValue, thresholdValue, breachType, breachedAt |
| **Event Version** | 1 |
| **Publisher** | KpiMonitoringService |
| **Consumers** | Communication (alert) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check; must not send duplicate alerts for same breach within cooldown period |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert reporting admin directly |
| **Security Considerations** | Contains KPI data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

### 7.10 Platform Administration

**Domain:** Platform Administration
**Aggregate:** Tenant, Subscription, License, Webhook, Policy, Automation
**Specification Reference:** Platform Administration Engineering.md

---

#### 7.10.1 TenantProvisioned

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | Tenant |
| **Trigger** | New tenant successfully provisioned |
| **Business Purpose** | Sends welcome email and initializes analytics |
| **Payload Summary** | tenantId, tenantName, adminEmail, planType, provisionedAt |
| **Event Version** | 1 |
| **Publisher** | TenantProvisioningService |
| **Consumers** | Communication (welcome email), Reporting and Analytics (analytics init) |
| **Ordering Requirements** | Must be first event for the tenant |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin; manual provisioning may be required |
| **Security Considerations** | Contains admin email (PII); internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.2 TenantActivated

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | Tenant |
| **Trigger** | Tenant transitions to ACTIVE status |
| **Business Purpose** | Sends activation confirmation |
| **Payload Summary** | tenantId, previousStatus, activatedAt |
| **Event Version** | 1 |
| **Publisher** | TenantLifecycleService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Must follow TenantProvisioned |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Low sensitivity; tenant status |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.3 TenantSuspended

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | Tenant |
| **Trigger** | Tenant transitions to SUSPENDED status |
| **Business Purpose** | Sends suspension alert to tenant admin |
| **Payload Summary** | tenantId, reason, suspendedAt |
| **Event Version** | 1 |
| **Publisher** | TenantLifecycleService |
| **Consumers** | Communication (alert) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Contains suspension reason; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.4 TenantArchived

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | Tenant |
| **Trigger** | Tenant transitions to ARCHIVED status |
| **Business Purpose** | Sends archival alert |
| **Payload Summary** | tenantId, archivedBy, reason, archivedAt |
| **Event Version** | 1 |
| **Publisher** | TenantLifecycleService |
| **Consumers** | Communication (alert) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Contains archival reason; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.5 TenantRestored

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | Tenant |
| **Trigger** | Tenant restored from ARCHIVED status |
| **Business Purpose** | Sends restoration notification |
| **Payload Summary** | tenantId, restoredBy, restoredAt |
| **Event Version** | 1 |
| **Publisher** | TenantLifecycleService |
| **Consumers** | Communication (notification) |
| **Ordering Requirements** | Must follow TenantArchived |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Low sensitivity |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.6 TenantDeleted

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | Tenant |
| **Trigger** | Tenant permanently deleted |
| **Business Purpose** | Triggers cleanup across all domains |
| **Payload Summary** | tenantId, deletedBy, reason, deletedAt |
| **Event Version** | 1 |
| **Publisher** | TenantLifecycleService |
| **Consumers** | All domains (cleanup) |
| **Ordering Requirements** | Must be final event for the tenant |
| **Idempotency Requirements** | Critical: all domains. Standard idempotency |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin; manual cleanup may be required |
| **Security Considerations** | Contains deletion reason; critical audit event |
| **Audit Requirements** | Log event receipt in ALL domains |

---

#### 7.10.7 SubscriptionCreated

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | TenantSubscription |
| **Trigger** | New subscription created for tenant |
| **Business Purpose** | Triggers billing setup in Finance |
| **Payload Summary** | subscriptionId, tenantId, planType, billingCycle, startDate, amount |
| **Event Version** | 1 |
| **Publisher** | SubscriptionService |
| **Consumers** | Finance (billing setup) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Contains subscription and billing data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.8 SubscriptionRenewed

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | TenantSubscription |
| **Trigger** | Subscription renewed for next billing period |
| **Business Purpose** | Triggers renewal billing in Finance |
| **Payload Summary** | subscriptionId, tenantId, renewalDate, newEndDate, amount |
| **Event Version** | 1 |
| **Publisher** | SubscriptionService |
| **Consumers** | Finance (renewal billing) |
| **Ordering Requirements** | Must follow SubscriptionCreated |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Contains billing data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.9 SubscriptionExpired

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | TenantSubscription |
| **Trigger** | Subscription past expiration date |
| **Business Purpose** | Sends expiration alert to tenant admin |
| **Payload Summary** | subscriptionId, tenantId, expiredAt, gracePeriodEndsAt |
| **Event Version** | 1 |
| **Publisher** | SubscriptionService |
| **Consumers** | Communication (alert) |
| **Ordering Requirements** | Independent; triggered by cron |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Contains subscription data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.10 LicenseLimitExceeded

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | License |
| **Trigger** | Tenant exceeds licensed user limit |
| **Business Purpose** | Sends urgent alert to tenant admin about license overage |
| **Payload Summary** | licenseId, tenantId, currentUsage, limit, exceededAt |
| **Event Version** | 1 |
| **Publisher** | LicenseService |
| **Consumers** | Communication (alert) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check; must not send duplicate alerts within cooldown |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Contains license usage data; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.11 SecurityAlertTriggered

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | SecurityAlert |
| **Trigger** | Security event detected (brute force, unusual access, etc.) |
| **Business Purpose** | Sends urgent security alert to platform admins |
| **Payload Summary** | alertId, alertType, severity, affectedTenantId, details, triggeredAt |
| **Event Version** | 1 |
| **Publisher** | SecurityMonitoringService |
| **Consumers** | Communication (urgent alert) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Immediate retry; max 4 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin directly via monitoring system |
| **Security Considerations** | Contains security event details; high-priority; restricted access |
| **Audit Requirements** | Log event receipt; log in security audit trail |

---

#### 7.10.12 MaintenanceScheduled

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | MaintenanceWindow |
| **Trigger** | Maintenance window scheduled |
| **Business Purpose** | Notifies all tenants of upcoming maintenance |
| **Payload Summary** | maintenanceId, scheduledStart, scheduledEnd, description, affectedServices |
| **Event Version** | 1 |
| **Publisher** | PlatformMaintenanceService |
| **Consumers** | Communication (all tenants notification) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Low sensitivity; maintenance schedule |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.13 MaintenanceStarted

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | MaintenanceWindow |
| **Trigger** | Maintenance window began |
| **Business Purpose** | Notifies all tenants that maintenance is in progress |
| **Payload Summary** | maintenanceId, startedAt |
| **Event Version** | 1 |
| **Publisher** | PlatformMaintenanceService |
| **Consumers** | Communication (all tenants notification) |
| **Ordering Requirements** | Must follow MaintenanceScheduled |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Low sensitivity |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.14 MaintenanceCompleted

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | MaintenanceWindow |
| **Trigger** | Maintenance window ended |
| **Business Purpose** | Notifies all tenants that maintenance is complete |
| **Payload Summary** | maintenanceId, completedAt, duration |
| **Event Version** | 1 |
| **Publisher** | PlatformMaintenanceService |
| **Consumers** | Communication (all tenants notification) |
| **Ordering Requirements** | Must follow MaintenanceStarted |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | Exponential backoff; max 3 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin |
| **Security Considerations** | Low sensitivity |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.15 WebhookDeliveryFailed

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | WebhookDeliveryLog |
| **Trigger** | Webhook delivery exhausted all retries |
| **Business Purpose** | Alerts platform admin of failed webhook delivery |
| **Payload Summary** | webhookId, eventType, targetUrl, failureReason, attemptCount, failedAt |
| **Event Version** | 1 |
| **Publisher** | WebhookDispatchService |
| **Consumers** | Communication (alert) |
| **Ordering Requirements** | Must follow final retry attempt |
| **Idempotency Requirements** | Standard eventId check |
| **Retry Strategy** | N/A (this IS the failure endpoint) |
| **Dead Letter Queue behaviour** | Alert platform admin; manual webhook investigation |
| **Security Considerations** | Contains webhook URL; internal bus only |
| **Audit Requirements** | Log event receipt |

---

#### 7.10.16 PlatformPolicyChanged

| Field | Value |
|-------|-------|
| **Owning Domain** | Platform Administration |
| **Aggregate** | PlatformPolicy |
| **Trigger** | Platform policy version updated |
| **Business Purpose** | Triggers policy re-evaluation across all domains |
| **Payload Summary** | policyId, policyType, previousVersion, newVersion, changedAt |
| **Event Version** | 1 |
| **Publisher** | PolicyService |
| **Consumers** | All domains (re-evaluate policy) |
| **Ordering Requirements** | Independent |
| **Idempotency Requirements** | Standard eventId check; each domain must handle gracefully |
| **Retry Strategy** | Exponential backoff; max 4 attempts |
| **Dead Letter Queue behaviour** | Alert platform admin; policy may not be applied in all domains |
| **Security Considerations** | Contains policy data; internal bus only |
| **Audit Requirements** | Log event receipt in all domains |

---

## 8. Event Categories

Events are classified into the following categories for organizational and filtering purposes.

### 8.1 Category Definitions

| Category | Description | Example Events |
|----------|-------------|---------------|
| **Lifecycle Events** | Entity state transitions (created, activated, archived, deleted) | UserCreated, InstitutionCreated, TenantProvisioned, TenantSuspended |
| **Academic Events** | Academic operations (enrollment, results, progression, assessments) | StudentEnrolled, ResultPublished, StudentPromoted, TermClosed |
| **Finance Events** | Financial operations (billing, payments, refunds, scholarships) | BillGenerated, PaymentConfirmed, RefundProcessed, ScholarshipAwarded |
| **Communication Events** | Message delivery lifecycle (dispatched, delivered, read, failed) | NotificationDelivered, NotificationFailed, CampaignCompleted |
| **Operational Events** | Operational resource management (library, hostel, transport, medical) | BookBorrowed, RoomAllocated, TransportAssigned, ClinicVisitRecorded |
| **Administrative Events** | Administrative operations (tenants, subscriptions, licenses, policies) | TenantProvisioned, SubscriptionCreated, LicenseLimitExceeded |
| **Integration Events** | External system integration (webhooks, API keys, third-party) | WebhookDeliveryFailed, ModuleActivated |
| **Reporting Events** | Analytics and reporting operations (exports, KPIs, snapshots) | ExportJobCompleted, KpiThresholdBreached |
| **Security Events** | Security-related operations (login, lock, MFA, alerts) | AccountLocked, MFAEnabled, SecurityAlertTriggered |
| **Platform Events** | Platform-wide operations (maintenance, policy changes) | MaintenanceScheduled, PlatformPolicyChanged |

### 8.2 Category Assignment Matrix

| Event | Category |
|-------|----------|
| UserCreated | Lifecycle |
| UserUpdated | Lifecycle |
| UserDeactivated | Lifecycle |
| PasswordResetRequested | Security |
| MFAEnabled | Security |
| AccountLocked | Security |
| PlatformAdminLogin | Security |
| PlatformAdminLogout | Security |
| InstitutionCreated | Lifecycle |
| AcademicCalendarConfigured | Academic |
| UserInvited | Lifecycle |
| InstitutionSettingsUpdated | Lifecycle |
| ModuleActivated | Integration |
| ModuleDeactivated | Integration |
| StudentEnrolled | Academic |
| StudentTransferred | Academic |
| StudentWithdrawn | Academic |
| StudentGraduated | Academic |
| StaffHired | Lifecycle |
| StaffSeparated | Lifecycle |
| ParentLinked | Academic |
| TermActivated | Academic |
| TermClosed | Academic |
| StudentClassEnrolled | Academic |
| StudentClassTransferred | Academic |
| AssignmentPublished | Academic |
| AssignmentSubmitted | Academic |
| AssignmentReturned | Academic |
| AssessmentPublished | Academic |
| ResultPublished | Academic |
| ReportCardGenerated | Academic |
| ReportCardPublished | Academic |
| StudentPromoted | Academic |
| StudentRetained | Academic |
| StudentPlacedOnProbation | Academic |
| SummerSchoolRegistered | Academic |
| SummerSchoolResultPublished | Academic |
| BillGenerated | Finance |
| InvoiceGenerated | Finance |
| InvoicePublished | Finance |
| InvoiceOverdue | Finance |
| PaymentConfirmed | Finance |
| PaymentFailed | Finance |
| OverpaymentCreated | Finance |
| RefundProcessed | Finance |
| RefundRequested | Finance |
| RefundRejected | Finance |
| ScholarshipAwarded | Finance |
| InstallmentOverdue | Finance |
| SummerSchoolBillingRequested | Finance |
| SummerSchoolInvoiceGenerated | Finance |
| NotificationDispatched | Communication |
| NotificationDelivered | Communication |
| NotificationRead | Communication |
| NotificationFailed | Communication |
| CampaignCompleted | Communication |
| AnnouncementPublished | Communication |
| MessageSent | Communication |
| BookBorrowed | Operational |
| BookReturned | Operational |
| BookOverdue | Operational |
| RoomAllocated | Operational |
| RoomDeallocated | Operational |
| TransportAssigned | Operational |
| VisitorCheckedIn | Operational |
| MedicalRecordUpdated | Operational |
| ClinicVisitRecorded | Operational |
| IncidentReported | Operational |
| WorkOrderCompleted | Operational |
| StockDroppedBelowReorder | Operational |
| MaintenanceRequested | Operational |
| WorkOrderCreated | Operational |
| DocumentPublished | Lifecycle |
| DocumentShared | Lifecycle |
| TemplatePublished | Lifecycle |
| GeneratedDocumentCreated | Integration |
| LearningResourcePublished | Academic |
| AssessmentContentPublished | Academic |
| RetentionEnforced | Lifecycle |
| ExportJobCompleted | Reporting |
| KpiThresholdBreached | Reporting |
| TenantProvisioned | Administrative |
| TenantActivated | Administrative |
| TenantSuspended | Administrative |
| TenantArchived | Administrative |
| TenantRestored | Administrative |
| TenantDeleted | Administrative |
| SubscriptionCreated | Administrative |
| SubscriptionRenewed | Administrative |
| SubscriptionExpired | Administrative |
| LicenseLimitExceeded | Administrative |
| SecurityAlertTriggered | Security |
| MaintenanceScheduled | Platform |
| MaintenanceStarted | Platform |
| MaintenanceCompleted | Platform |
| WebhookDeliveryFailed | Integration |
| PlatformPolicyChanged | Platform |

---

## 9. Event Ordering

### 9.1 Ordering Guarantees

| Level | Description | Scope |
|-------|-------------|-------|
| **Strict** | Events within a single aggregate are published in transaction order | Within one aggregate, one domain |
| **Best Effort** | Events from the same aggregate may arrive slightly out of order due to async processing | Across consumers of same aggregate |
| **Independent** | Events with no causal relationship may arrive in any order | Across aggregates, across domains |

### 9.2 Ordering Rules

1. Events within a **single aggregate** are published in **transaction order** -- strict guarantee
2. Events across **different aggregates** may arrive **out of order** -- consumers must handle this
3. Events across **different domains** have **no ordering guarantee** -- eventual consistency
4. Consumers **must not depend** on event ordering unless explicitly documented
5. Where ordering matters, the event entry documents the dependency (e.g., "Must follow InvoiceGenerated")

### 9.3 Event Dependency Chains

| Chain | Events | Dependency |
|-------|--------|-----------|
| **Enrollment to Billing** | StudentEnrolled -> BillGenerated -> InvoiceGenerated -> InvoicePublished | Each must follow the previous |
| **Payment to Receipt** | PaymentConfirmed -> GeneratedDocumentCreated | Receipt follows payment |
| **Result to Report Card** | ResultPublished -> ReportCardGenerated -> ReportCardPublished -> GeneratedDocumentCreated | Each must follow the previous |
| **Term Lifecycle** | TermActivated -> TermClosed | Activation precedes closure |
| **Summer School** | SummerSchoolRegistered -> SummerSchoolBillingRequested -> SummerSchoolInvoiceGenerated | Registration precedes billing |
| **Borrowing to Fine** | BookBorrowed -> BookOverdue -> BillGenerated | Borrowing precedes overdue |
| **Maintenance** | MaintenanceRequested -> WorkOrderCreated -> WorkOrderCompleted | Request precedes work order |
| **Tenant Lifecycle** | TenantProvisioned -> TenantActivated -> TenantSuspended -> TenantArchived | Sequential lifecycle |
| **Subscription** | SubscriptionCreated -> SubscriptionRenewed -> SubscriptionExpired | Sequential lifecycle |
| **Security** | MFAEnabled, AccountLocked (independent) | No dependency |

---

## 10. Event Versioning

### 10.1 Version Numbering

| Field | Format | Description |
|-------|--------|-------------|
| eventVersion | Integer (1, 2, 3...) | Monotonically increasing per event type; incremented on payload schema changes |
| schemaVersion | Semantic (MAJOR.MINOR.PATCH) | Payload schema version following semver conventions |

### 10.2 SchemaVersion Conventions

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| New event type | 1.0.0 | Initial publication |
| Optional field added | MINOR bump (1.1.0) | Adding optional metadata field |
| Required field added | MAJOR bump (2.0.0) | Adding required field to payload |
| Field removed | MAJOR bump (2.0.0) | Removing deprecated field |
| Field renamed | MAJOR bump (2.0.0) | Renaming payload field |
| Field type changed | MAJOR bump (2.0.0) | Changing string to UUID |
| Documentation update | PATCH bump (1.0.1) | Clarifying field description |

### 10.3 Backward Compatibility Rules

1. **Consumers must tolerate unknown fields** -- new fields added by publisher must not break existing consumers
2. **Consumers must tolerate missing fields** -- fields removed by publisher must not break existing consumers (after deprecation period)
3. **MAJOR version changes** require consumer updates before the new version is deployed
4. **MINOR version changes** are backward-compatible; consumers may ignore new fields
5. **PATCH version changes** are documentation-only; no consumer impact

### 10.4 Deprecation Process

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Mark field or event as deprecated in schema | Day 0 |
| 2 | Deploy new version alongside old version | Day 0 |
| 3 | Monitor consumer adoption of new version | Day 0-30 |
| 4 | Notify consumers of upcoming removal | Day 30 |
| 5 | Remove deprecated version | Day 60 |

### 10.5 Consumer Compatibility

- Consumers must check `schemaVersion` before processing
- Consumers must handle both current and previous major version during migration
- Consumers must not fail on unknown payload fields
- Consumers must log a warning for unknown fields (for future cleanup)

---

## 11. Event Delivery

### 11.1 Delivery Guarantee

| Guarantee | Level | Description |
|-----------|-------|-------------|
| **At-least-once** | V1 Default | Every event is delivered at least once; duplicates are possible |
| **At-most-once** | Not supported | Would require transactional outbox; not implemented in V1 |
| **Exactly-once** | Not supported | Would require idempotent writes + deduplication; approximated via consumer idempotency |

### 11.2 Duplicate Handling

- Consumers **must** be idempotent -- check `eventId` before processing
- Processed `eventId` values stored with **72-hour minimum TTL**
- Idempotency is enforced at the **consumer level**, not the publisher level
- Duplicate events are silently discarded after idempotency check

### 11.3 Retry Policy

| Attempt | Delay | Description |
|---------|-------|-------------|
| 1 | Immediate | First processing attempt |
| 2 | 1 second | First retry |
| 3 | 5 seconds | Second retry |
| 4 | 30 seconds | Third retry (final for standard events) |
| Dead Letter | -- | After max retries; moved to dead letter queue |

### 11.4 Dead Letter Queue

- Failed events that exhaust all retries are moved to a dead letter queue
- Dead letter queue is inspected by platform administrators
- Events in dead letter queue retain full envelope and payload
- Dead letter events may be replayed after issue resolution
- Dead letter queue has no automatic expiration (retained for debugging)

### 11.5 Replay Support

- All events are stored and can be replayed for debugging or recovery
- Replay must be **idempotent** -- same result as original processing
- Replay requires platform admin authorization
- Replay operations are logged in audit trail
- Replay may be partial (specific event) or batch (time range)

### 11.6 Event Retention

| Retention Period | Description |
|-----------------|-------------|
| **Active** | 72 hours -- events available for consumer retry and idempotency |
| **Extended** | 30 days -- events available for debugging and replay |
| **Archive** | 1 year -- events retained for compliance and audit |
| **Permanent** | Audit logs and security events -- never deleted |

---

## 12. Event Consumer Matrix

### 12.1 Full Consumer Matrix

| Event | Publisher Domain | Consumer Domains | Purpose |
|-------|-----------------|------------------|---------|
| UserCreated | Identity and Access | Communication, People | Welcome email, person sync |
| UserUpdated | Identity and Access | People | Profile sync |
| UserDeactivated | Identity and Access | People, Operations | Status sync, asset return |
| PasswordResetRequested | Identity and Access | Communication | Reset email |
| MFAEnabled | Identity and Access | Communication | Security notification |
| AccountLocked | Identity and Access | Communication | Security alert |
| PlatformAdminLogin | Identity and Access | Platform Administration | Audit logging |
| PlatformAdminLogout | Identity and Access | Platform Administration | Audit logging |
| InstitutionCreated | Institution Management | Communication, Documents and Learning | Welcome, default templates |
| AcademicCalendarConfigured | Institution Management | Academic Management | Session/term creation |
| UserInvited | Institution Management | Communication | Invitation email |
| InstitutionSettingsUpdated | Institution Management | Communication, Reporting and Analytics | Settings sync, cache refresh |
| ModuleActivated | Institution Management | Academic Management, Finance, Operations | Enable features |
| ModuleDeactivated | Institution Management | Academic Management, Finance, Operations | Disable features |
| StudentEnrolled | People | Academic Management, Finance, Communication, Operations, Documents and Learning, Reporting and Analytics, Platform Administration | Enrollment cascade (7 consumers) |
| StudentTransferred | People | Academic Management, Finance, Communication | Transfer sync |
| StudentWithdrawn | People | Academic Management, Finance, Communication, Operations, Documents and Learning, Platform Administration | Withdrawal cascade (6 consumers) |
| StudentGraduated | People | Academic Management, Communication, Operations, Documents and Learning | Graduation cascade (4 consumers) |
| StaffHired | People | Academic Management, Communication, Operations, Reporting and Analytics, Platform Administration | Onboarding cascade (5 consumers) |
| StaffSeparated | People | Academic Management, Communication, Operations, Documents and Learning, Platform Administration | Separation cascade (5 consumers) |
| ParentLinked | People | Communication | Notification |
| TermActivated | Academic Management | Communication | Term start notification |
| TermClosed | Academic Management | Documents and Learning, Reporting and Analytics, Communication | Report card, analytics, notification |
| StudentClassEnrolled | Academic Management | People | Enrollment sync |
| StudentClassTransferred | Academic Management | People | Transfer sync |
| AssignmentPublished | Academic Management | Communication | Notification |
| AssignmentSubmitted | Academic Management | Communication | Notification |
| AssignmentReturned | Academic Management | Communication | Notification |
| AssessmentPublished | Academic Management | Communication | Notification |
| ResultPublished | Academic Management | Communication, Documents and Learning, Reporting and Analytics | Report card, notification, analytics |
| ReportCardGenerated | Academic Management | Communication | Notification |
| ReportCardPublished | Academic Management | Communication | Notification |
| StudentPromoted | Academic Management | People, Communication | Progression sync, notification |
| StudentRetained | Academic Management | Communication | Notification |
| StudentGraduated | Academic Management | People, Communication, Documents and Learning, Operations | Graduation cascade |
| StudentWithdrawn | Academic Management | People, Communication | Withdrawal sync |
| StudentPlacedOnProbation | Academic Management | Communication | Notification |
| SummerSchoolRegistered | Academic Management | Communication, Finance | Notification, billing |
| SummerSchoolResultPublished | Academic Management | People, Communication | Result sync, notification |
| BillGenerated | Finance | Communication | Bill notification |
| InvoiceGenerated | Finance | Communication, Documents and Learning | Invoice notification, document |
| InvoicePublished | Finance | Communication | Invoice notification |
| InvoiceOverdue | Finance | Communication, Operations | Reminder, follow-up |
| PaymentConfirmed | Finance | Communication, Documents and Learning, Operations | Receipt, confirmation, fine clearance |
| PaymentFailed | Finance | Communication | Failure alert |
| OverpaymentCreated | Finance | Communication | Notification |
| RefundProcessed | Finance | Communication | Confirmation |
| RefundRequested | Finance | Communication | Notification |
| RefundRejected | Finance | Communication | Notification |
| ScholarshipAwarded | Finance | Communication | Notification |
| InstallmentOverdue | Finance | Communication | Reminder |
| SummerSchoolBillingRequested | Finance | None | Internal acknowledgment |
| SummerSchoolInvoiceGenerated | Finance | Communication | Notification |
| NotificationDispatched | Communication | Reporting and Analytics | Delivery metrics |
| NotificationDelivered | Communication | Reporting and Analytics | Delivery metrics |
| NotificationRead | Communication | Reporting and Analytics | Read metrics |
| NotificationFailed | Communication | Platform Administration | Alerting |
| CampaignCompleted | Communication | Reporting and Analytics | Campaign metrics |
| AnnouncementPublished | Communication | None | Internal |
| MessageSent | Communication | None | Internal |
| BookBorrowed | Operations | Reporting and Analytics | Library analytics |
| BookReturned | Operations | Finance, Reporting and Analytics | Fine waiver, analytics |
| BookOverdue | Operations | Communication, Finance | Reminder, fine creation |
| RoomAllocated | Operations | Communication, Reporting and Analytics | Notification, analytics |
| RoomDeallocated | Operations | Communication | Notification |
| TransportAssigned | Operations | Communication | Notification |
| VisitorCheckedIn | Operations | Reporting and Analytics | Visitor analytics |
| MedicalRecordUpdated | Operations | Communication | Alert if critical |
| ClinicVisitRecorded | Operations | Communication | Parent notification |
| IncidentReported | Operations | Communication | Alert |
| WorkOrderCompleted | Operations | Communication, Reporting and Analytics | Notification, analytics |
| StockDroppedBelowReorder | Operations | Communication | Reorder alert |
| MaintenanceRequested | Operations | Communication | Acknowledgement |
| WorkOrderCreated | Operations | Communication | Assignment notification |
| DocumentPublished | Documents and Learning | Communication | Notification |
| DocumentShared | Documents and Learning | Communication | Share notification |
| TemplatePublished | Documents and Learning | Communication | Notification |
| GeneratedDocumentCreated | Documents and Learning | Communication | Document delivery |
| LearningResourcePublished | Documents and Learning | Communication | Notification |
| AssessmentContentPublished | Documents and Learning | Communication | Notification |
| RetentionEnforced | Documents and Learning | None | Compliance record |
| ExportJobCompleted | Reporting and Analytics | Communication | File delivery |
| KpiThresholdBreached | Reporting and Analytics | Communication | Alert |
| TenantProvisioned | Platform Administration | Communication, Reporting and Analytics | Welcome, analytics init |
| TenantActivated | Platform Administration | Communication | Notification |
| TenantSuspended | Platform Administration | Communication | Alert |
| TenantArchived | Platform Administration | Communication | Alert |
| TenantRestored | Platform Administration | Communication | Notification |
| TenantDeleted | Platform Administration | All domains | Cleanup |
| SubscriptionCreated | Platform Administration | Finance | Billing setup |
| SubscriptionRenewed | Platform Administration | Finance | Renewal billing |
| SubscriptionExpired | Platform Administration | Communication | Alert |
| LicenseLimitExceeded | Platform Administration | Communication | Alert |
| SecurityAlertTriggered | Platform Administration | Communication | Urgent alert |
| MaintenanceScheduled | Platform Administration | Communication | All tenants notification |
| MaintenanceStarted | Platform Administration | Communication | All tenants notification |
| MaintenanceCompleted | Platform Administration | Communication | All tenants notification |
| WebhookDeliveryFailed | Platform Administration | Communication | Alert |
| PlatformPolicyChanged | Platform Administration | All domains | Policy re-evaluation |

### 12.2 Most Active Consumers

| Consumer Domain | Events Consumed | Description |
|----------------|----------------|-------------|
| **Communication** | 52 | Primary notification domain; consumes events from all other domains |
| **Reporting and Analytics** | 18 | Primary analytics domain; consumes events for read model projections |
| **People** | 7 | Syncs academic progression and enrollment changes |
| **Finance** | 5 | Handles billing triggers from Operations and Platform Administration |
| **Operations** | 3 | Handles follow-up flags and fine clearance |
| **Documents and Learning** | 5 | Generates documents from template triggers |
| **Academic Management** | 5 | Handles enrollment and calendar setup events |
| **Platform Administration** | 3 | Handles security alerts and audit logging |
| **All domains** | 2 | TenantDeleted, PlatformPolicyChanged |

---

## 13. Event Security

### 13.1 Sensitive Payload Classification

| Sensitivity Level | Description | Examples | Handling |
|-------------------|-------------|---------|----------|
| **Critical** | Payment data, medical data, security tokens | PaymentConfirmed, MedicalRecordUpdated, PasswordResetRequested | Encrypted at rest; no plaintext logging; strict tenant isolation |
| **Sensitive** | PII (names, emails, student IDs), academic grades | StudentEnrolled, ResultPublished, InvoiceGenerated | Encrypted at rest; masked in logs; tenant-scoped |
| **Internal** | System metadata, operational data | ModuleActivated, TermClosed, BookBorrowed | Standard encryption; internal bus only |
| **Public** | Non-sensitive aggregate data | KpiThresholdBreached, CampaignCompleted | Standard handling |

### 13.2 PII in Event Payloads

| Field | Classification | Events Containing |
|-------|---------------|-------------------|
| Email | Sensitive | UserCreated, UserUpdated, PasswordResetRequested, MFAEnabled |
| Student Name | Sensitive | StudentEnrolled, StudentTransferred, StudentWithdrawn |
| Staff Name | Sensitive | StaffHired, StaffSeparated |
| Payment Amount | Critical | BillGenerated, InvoiceGenerated, PaymentConfirmed, RefundProcessed |
| Medical Data | Critical | MedicalRecordUpdated, ClinicVisitRecorded |
| Reset Token | Critical | PasswordResetRequested |
| IP Address | Sensitive | PlatformAdminLogin |
| Incident Details | Sensitive | IncidentReported |

### 13.3 Encryption Requirements

| Requirement | Implementation |
|-------------|---------------|
| Payload encryption at rest | AES-256-GCM for Critical and Sensitive payloads |
| Transport encryption | EventEmitter2 in-process; no network transport in V1 |
| Token masking | PasswordResetRequested tokens encrypted at rest; never logged in plaintext |
| Medical data | MedicalRecordUpdated and ClinicVisitRecorded payloads encrypted at rest |

### 13.4 Tenant Isolation

- Every event carries `tenantId` in the envelope
- Consumers must validate `tenantId` before processing
- Cross-tenant event delivery is treated as a security violation
- Event store queries are always tenant-scoped

### 13.5 Access Restrictions

| Access Level | Description |
|-------------|-------------|
| **Event Publishing** | Only the owning domain may publish events |
| **Event Consumption** | Only registered consumers may receive events |
| **Event Store Access** | Platform administrators only for debugging |
| **Dead Letter Queue** | Platform administrators only |
| **Event Replay** | Platform administrators only; logged in audit trail |

---

## 14. Event Monitoring

### 14.1 Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| **Event Published Count** | Total events published per domain per hour | Deviation > 50% from baseline |
| **Event Processed Count** | Total events consumed per domain per hour | Deviation > 50% from baseline |
| **Event Processing Latency** | Time from publish to consumer completion | > 500ms average |
| **Event Failure Count** | Total events moved to dead letter queue | > 0 per hour |
| **Event Retry Count** | Total retry attempts across all consumers | > 10 per hour |
| **Dead Letter Queue Depth** | Number of events in dead letter queue | > 0 |
| **Idempotency Rejection Count** | Duplicate events detected and discarded | Log for analysis |

### 14.2 Failed Delivery Monitoring

- Failed event deliveries trigger alerts to platform administrators
- Dead letter queue depth is monitored continuously
- Events in dead letter queue are categorized by domain and event type
- Failed deliveries are logged with full context (event, consumer, error, stack trace)

### 14.3 Consumer Lag

- Consumer processing time is tracked per consumer per event type
- Consumer lag (time between event publication and consumer processing) is monitored
- High consumer lag triggers warnings to platform administrators
- Consumer lag metrics are available on the platform health dashboard

### 14.4 Replay Tracking

- All replay operations are logged with actor, timestamp, and event range
- Replay operations generate audit trail entries
- Replay metrics include count of events replayed, success rate, and duration

### 14.5 Throughput

- Event throughput (events per second) is tracked per domain
- Throughput metrics are available for capacity planning
- Throughput anomalies trigger alerts

### 14.6 Alerting

| Alert | Condition | Severity | Recipient |
|-------|-----------|----------|-----------|
| Dead Letter Queue Not Empty | Any event in DLQ | High | Platform Admin |
| Consumer Processing Time > 5s | Latency threshold exceeded | Medium | Platform Admin |
| Event Publishing Failure | Event not published after commit | Critical | Platform Admin + Domain Admin |
| Consumer Crash | Consumer throws unhandled exception | Critical | Platform Admin |
| Idempotency Violation | Duplicate event processed (should not happen) | Critical | Platform Admin |
| Throughput Anomaly | > 200% or < 50% of baseline | Medium | Platform Admin |
| Consumer Lag > 30s | Consumer falling behind | Medium | Platform Admin |

---

## 15. Integration Rules

### 15.1 Publishing Rules

1. Events are published **after transaction commit**, never inside the transaction
2. Events are published **synchronously within the process** via EventEmitter2
3. Events carry **tenant context** in the envelope; consumers must respect tenant boundaries
4. Events carry **actor context**; consumers may log the original actor for audit
5. Future migration to BullMQ/Redis is anticipated but not yet required

### 15.2 Consumer Rules

1. Consumers must be **idempotent** -- check `eventId` before processing
2. Processed `eventId` values stored with minimum **72-hour TTL**
3. Consumers **may not query** the publisher's domain tables
4. Consumers **may read** data from their own domain that was previously populated by events
5. Consumers **must handle** out-of-order delivery (no ordering guarantee across aggregates)
6. Failed processing is retried with **exponential backoff** (max 3 retries)

### 15.3 Event Bus Rules

1. EventEmitter2 is the **sole integration mechanism** for cross-domain communication
2. No domain may bypass the event bus for cross-domain data access
3. No domain may query another domain's database directly
4. Events are **never filtered or modified** by the event bus
5. All events are delivered to **all registered consumers** (no selective routing in V1)

### 15.4 Cross-Domain Reference Rules

1. Cross-domain FK references use **application-level guards** (not database constraints)
2. Application guards validate referenced entity exists and is tenant-scoped
3. Application guards validate actor authorization
4. Cross-domain FK references use `RESTRICT` on delete (not CASCADE)
5. Orphan prevention logic is required for entity deletion

---

## 16. Architecture Decision Records

### 16.1 Platform-Wide Event ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-EVT-01 | Events use past-tense PascalCase naming | Events describe facts that already happened; consistent with business language |
| ADR-EVT-02 | One owner per event; only the owning domain publishes | Prevents conflicting event semantics; clear accountability |
| ADR-EVT-03 | Event envelope carries tenantId and actorId | Enables tenant-scoped consumption; maintains actor traceability |
| ADR-EVT-04 | Events published after transaction commit | Prevents phantom events on rollback; consumers never see rolled-back events |
| ADR-EVT-05 | Consumer idempotency via eventId deduplication | Enables safe at-least-once delivery without exactly-once infrastructure |
| ADR-EVT-06 | 72-hour minimum TTL for processed eventId storage | Balances idempotency coverage with storage cost |
| ADR-EVT-07 | No global event ordering guarantee | EventEmitter2 does not guarantee cross-aggregate ordering; eventual consistency is acceptable |
| ADR-EVT-08 | Dead letter queue retains events indefinitely | Enables debugging and replay without time pressure |
| ADR-EVT-09 | Schema versioning follows semver conventions | MAJOR for breaking changes, MINOR for additions, PATCH for documentation |
| ADR-EVT-10 | Communication is the primary consumer of most domain events | Single notification domain simplifies integration; consumers emit events rather than sending messages directly |

### 16.2 Event Ownership ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-EVT-11 | Event ownership is documented per catalogue entry | Clear accountability for event design, payload, and consumer management |
| ADR-EVT-12 | Event ownership cannot be transferred without architecture review | Prevents ownership drift and ensures consumer compatibility |
| ADR-EVT-13 | Events without consumers are still catalogued | Maintains complete event inventory; consumers may be added later |
| ADR-EVT-14 | Internal events are not catalogued in this document | Reduces noise; internal events documented in domain specs |

### 16.3 Event Metadata ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-EVT-15 | correlationId groups events from a single user action | Enables end-to-end tracing of cross-domain workflows |
| ADR-EVT-16 | causationId points to the triggering event | Enables event chain reconstruction for debugging |
| ADR-EVT-17 | aggregateId and aggregateType included in envelope | Enables aggregate-level event filtering and replay |
| ADR-EVT-18 | sourceDomain included in envelope | Enables consumer validation of event source |

### 16.4 Delivery Guarantee ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-EVT-19 | At-least-once delivery is the V1 default | Simpler than exactly-once; consumer idempotency provides equivalent behavior |
| ADR-EVT-20 | Consumer idempotency is enforced at consumer level, not publisher level | Publisher cannot know all consumers; each consumer manages its own deduplication |
| ADR-EVT-21 | Retry uses exponential backoff with configurable max attempts | Prevents thundering herd; configurable per consumer criticality |
| ADR-EVT-22 | Dead letter queue has no automatic expiration | Events may need replay at any time; manual cleanup only |

### 16.5 Dead Letter Queue Strategy ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-EVT-23 | DLQ events retain full envelope and payload | Enables complete debugging without replay |
| ADR-EVT-24 | DLQ events are categorized by domain and event type | Enables prioritized resolution |
| ADR-EVT-25 | DLQ requires manual resolution by platform admin | Automated retry may cause cascading failures; human judgment required |

### 16.6 Replay Strategy ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-EVT-26 | Replay must be idempotent | Same result as original processing; no side effects |
| ADR-EVT-27 | Replay requires platform admin authorization | Prevents accidental or malicious event replay |
| ADR-EVT-28 | Replay operations are logged in audit trail | Full accountability for replay actions |

---

## 17. Event Review Checklist

Use this checklist when reviewing any new or modified platform event.

### 17.1 Event Design Review

- [ ] Event name follows `{Entity}{PastTenseVerb}` convention
- [ ] Event is owned by exactly one domain
- [ ] Event has clear business purpose (not technical artifact)
- [ ] Event payload contains all data consumers need (no follow-up queries to publisher)
- [ ] Event payload does not contain excessive or unnecessary fields
- [ ] Event is classified into correct category (Lifecycle, Academic, Finance, etc.)
- [ ] Event is catalogued in this document before implementation

### 17.2 Event Metadata Review

- [ ] Event envelope includes all required fields (eventId, eventName, eventVersion, schemaVersion, occurredAt, correlationId, causationId, tenantId, institutionId, aggregateId, aggregateType, sourceDomain, actorId, payload)
- [ ] eventVersion is set to 1 for new events
- [ ] schemaVersion follows semver conventions
- [ ] eventName follows `{domain}.{EntityPastTenseVerb}` format

### 17.3 Consumer Review

- [ ] All consumers are documented in catalogue entry
- [ ] Each consumer has idempotency check implemented
- [ ] Each consumer handles out-of-order delivery
- [ ] Each consumer has retry logic with exponential backoff
- [ ] Each consumer logs failures for debugging
- [ ] Each consumer respects tenant isolation (filters by tenantId)
- [ ] No consumer queries the publisher's domain tables

### 17.4 Security Review

- [ ] Payload sensitivity classified (Critical, Sensitive, Internal, Public)
- [ ] PII fields identified and encrypted at rest
- [ ] Sensitive tokens (reset tokens, invitation tokens) never logged in plaintext
- [ ] Medical data payloads encrypted at rest
- [ ] Tenant isolation verified (events carry tenantId)
- [ ] Actor traceability maintained (events carry actorId)

### 17.5 Performance Review

- [ ] Event publishing latency < 100ms after commit
- [ ] Consumer processing time < 500ms
- [ ] No N+1 query patterns in consumers
- [ ] Event payload size is reasonable (< 10KB)
- [ ] No unnecessary data in payload

### 17.6 Ordering Review

- [ ] Event ordering dependencies documented
- [ ] Events that must follow other events have ordering requirements specified
- [ ] Events with no ordering dependency marked as Independent
- [ ] Consumer handles out-of-order delivery where applicable

### 17.7 Versioning Review

- [ ] schemaVersion follows semver conventions
- [ ] Backward compatibility maintained
- [ ] Deprecation process documented for breaking changes
- [ ] Consumer migration path documented

---

## 18. Future Expansion

### 18.1 Reserved Event Categories

| Category | Description | Status |
|----------|-------------|--------|
| **Smart Campus Events** | IoT sensor data, campus automation, environmental monitoring | Reserved for V2 |
| **AI Events** | Predictive analytics, automated recommendations, anomaly detection | Reserved for V3 |
| **Enterprise Events** | Multi-tenant federation, cross-organization data sharing | Reserved for V4 |
| **Marketplace Events** | Third-party integration registration, marketplace transactions | Reserved for V2 |
| **Public API Events** | External API consumer events, webhook subscriptions | Reserved for V2 |

### 18.2 Extensibility Strategy

1. The event catalogue is designed to be **extended without breaking compatibility**
2. New event types can be added by any domain with architecture review
3. New consumer domains can subscribe to existing events without modification
4. Event payload fields can be added (MINOR version bump) without breaking consumers
5. Event payload fields can be removed only after deprecation period (MAJOR version bump)

### 18.3 Future Infrastructure Enhancements

| Enhancement | Description | Prerequisite |
|-------------|-------------|--------------|
| **Message Queue Migration** | Replace EventEmitter2 with BullMQ/Redis for reliable, distributed delivery | Single-instance deployment validated |
| **Event Sourcing** | Store all events in event store for audit, replay, and CQRS | Message queue migration complete |
| **Event Schema Registry** | Centralized schema registry for event version management | Event sourcing implemented |
| **Event Replay Dashboard** | Web UI for event replay and dead letter queue management | Platform Administration UI implemented |

---

## 19. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-20 | Initial creation -- Platform event catalogue derived from 10 approved V1 domain specifications |

---

*This document is the authoritative reference for all domain events in OpenSchool ERP. All event publishers and consumers must comply with this catalogue. Changes require architecture review.*



---

# PAGE BREAK

---


# OpenSchool ERP — Platform API Style Guide

**Authoritative Reference for All REST API Design**

| Aspect | Detail |
|--------|--------|
| **Document ID** | OPS-STD-API-004 |
| **Status** | Approved |
| **Version** | 1.0.0 |
| **Date** | 2026-07-20 |
| **Author** | Platform Architecture Team |
| **Supersedes** | None |
| **Review Cycle** | Quarterly |

---

## Document Status

| Status | Description |
|--------|-------------|
| **Draft** | Under active development |
| **Review** | Under architecture review |
| **Approved** | Approved for implementation |
| **Frozen** | Locked for current version |
| **Deprecated** | Pending replacement |

**Current Status:** Approved

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Scope](#2-scope)
3. [API Philosophy](#3-api-philosophy)
4. [URL Standards](#4-url-standards)
5. [HTTP Methods](#5-http-methods)
6. [Request Standards](#6-request-standards)
7. [Response Standards](#7-response-standards)
8. [Pagination](#8-pagination)
9. [Filtering & Searching](#9-filtering--searching)
10. [Sorting](#10-sorting)
11. [Bulk & Batch Operations](#11-bulk--batch-operations)
12. [Asynchronous Operations](#12-asynchronous-operations)
13. [Authentication & Authorization](#13-authentication--authorization)
14. [API Versioning](#14-api-versioning)
15. [Concurrency](#15-concurrency)
16. [Idempotency](#16-idempotency)
17. [Error Model](#17-error-model)
18. [Security Standards](#18-security-standards)
19. [File Upload Standards](#19-file-upload-standards)
20. [API Documentation Standards](#20-api-documentation-standards)
21. [Performance Standards](#21-performance-standards)
22. [Testing Standards](#22-testing-standards)
23. [Architecture Decision Records](#23-architecture-decision-records)
24. [API Review Checklist](#24-api-review-checklist)
25. [Appendix A: Complete Error Code Reference](#appendix-a-complete-error-code-reference)
26. [Appendix B: Standard HTTP Status Codes](#appendix-b-standard-http-status-codes)
27. [Revision History](#25-revision-history)

---

## 1. Purpose

This document is the authoritative REST API standard for the OpenSchool ERP platform. Every API developed for OpenSchool ERP must conform to this guide.

This guide defines:

- RESTful design conventions and resource-oriented architecture
- Request and response structures, including standard envelopes
- Pagination, filtering, sorting, and search patterns
- Authentication, authorization, and tenant isolation at the API layer
- API versioning strategy and backward compatibility rules
- Error model with standard error codes and response formats
- Security, performance, and documentation requirements

This document is used by every backend developer and AI coding assistant during implementation.

---

## 2. Scope

### 2.1 Applicability

This guide applies to all REST APIs in OpenSchool ERP:

- **Domain APIs** — CRUD operations for domain entities
- **Cross-Domain APIs** — Aggregated views spanning multiple domains
- **Platform APIs** — Administration, health checks, system operations
- **External Integration APIs** — Webhook receivers, third-party adapters

### 2.2 Relationship to Other Standards

| Standard | Relationship |
|----------|-------------|
| **01 Engineering Standards** | Defines platform-wide naming, entity, audit, and validation standards. This guide references those standards for API-specific implementation. |
| **02 Cross-Domain Integration Specification** | Defines cross-domain event patterns. This guide covers the synchronous API layer that complements event-driven integration. |
| **03 Platform Event Catalogue** | Defines event naming and envelope standards. This guide covers the request/response layer that precedes event publication. |
| **Domain Engineering Specs** | Define domain-specific API contracts. This guide governs the conventions those contracts must follow. |

### 2.3 Governance

- All API contracts must be reviewed against this guide before implementation
- Deviations require explicit architecture approval
- This guide is maintained by the Platform Architecture Team

---

## 3. API Philosophy

### 3.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **RESTful** | Resources are identified by URIs; operations use HTTP methods semantically |
| **Resource-Oriented** | APIs are organized around resources (nouns), not actions (verbs) |
| **Stateless** | Each request contains all information needed to process it; no server-side session |
| **Predictable** | Similar requests produce similar responses; patterns are consistent across domains |
| **Consistent Over Convenient** | Consistency across all APIs takes priority over domain-specific shortcuts |
| **Backward Compatible** | New fields may be added; existing fields and behavior are never removed without deprecation |

### 3.2 Design Priorities

1. **Developer Experience** — Intuitive, predictable, easy to integrate
2. **Correctness** — Valid inputs produce valid outputs; errors are clear and actionable
3. **Security** — Authentication, authorization, and tenant isolation enforced at every layer
4. **Performance** — Responses are fast, paginated, and cached where appropriate
5. **Maintainability** — Simple, consistent patterns that scale across 10+ domains

### 3.3 What REST Is Not

- REST is not a protocol; it is an architectural style
- REST does not require absolute purity; pragmatism is acceptable where justified
- REST does not replace events; synchronous APIs and asynchronous events are complementary
- REST does not define implementation; it defines the contract between client and server

---

## 4. URL Standards

### 4.1 Base URL Structure

All API endpoints follow a consistent base URL pattern:

```
https://{host}/api/v1/{domain}/{resource}
```

| Component | Description | Example |
|-----------|-------------|---------|
| `{host}` | API host | `api.openschool.io` |
| `api` | API prefix | Always `api` |
| `v1` | API version | Major version number |
| `{domain}` | Domain namespace | `academics`, `finance`, `people` |
| `{resource}` | Resource name | `calendar`, `invoices`, `students` |

### 4.2 Resource Naming Rules

| Rule | Description | Example |
|------|-------------|---------|
| **Plural nouns** | Resources are always plural | `/students` not `/student` |
| **Lowercase** | All lowercase, no capitalization | `/academic-years` not `/AcademicYears` |
| **Hyphenated** | Multi-word resources use hyphens | `/academic-years` not `/academic_years` |
| **No verbs** | Resources are nouns; verbs belong in methods | `/invoices` not `/createInvoice` |
| **No file extensions** | No `.json` or `.xml` suffixes | `/students` not `/students.json` |

### 4.3 Resource Hierarchy

Use nested resources to express parent-child relationships:

```
GET /api/v1/academics/calendar/years/{yearId}/terms/{termId}
```

**Nesting rules:**

| Rule | Description |
|------|-------------|
| Maximum depth | 3 levels of nesting |
| Parent ownership | Child resources are scoped to their parent |
| Independent access | Top-level resources are also accessible at root level |

**Examples:**

| Pattern | Resource |
|---------|----------|
| `/api/v1/academics/calendar/years` | Academic years |
| `/api/v1/academics/calendar/years/{id}` | Single academic year |
| `/api/v1/academics/calendar/years/{id}/terms` | Terms within an academic year |
| `/api/v1/academics/calendar/years/{id}/terms/{termId}` | Single term |

**Cross-domain references use query parameters, not nesting:**

```
GET /api/v1/finance/invoices?studentId={uuid}
```

Not:

```
GET /api/v1/people/students/{id}/invoices  (wrong — cross-domain)
```

### 4.4 Path Parameters

| Parameter | Format | Description |
|-----------|--------|-------------|
| `{id}` | UUID | Public business identifier |
| `{yearId}` | UUID | Academic year identifier |
| `{termId}` | UUID | Term identifier |

- Path parameters are always UUIDs (public business IDs)
- Internal database IDs are never exposed
- Path parameters are always required

### 4.5 Query Parameters

| Parameter | Format | Description |
|-----------|--------|-------------|
| `?status=ACTIVE` | String | Exact match filter |
| `?page=1&limit=20` | Integer | Pagination |
| `?search=keyword` | String | Full-text search |
| `?sortBy=name&sortOrder=asc` | String | Sorting |
| `?fields=id,name,email` | String | Sparse fieldsets |

### 4.6 Action Endpoints

Action endpoints are permitted only when the action cannot be expressed as a resource state change:

| Pattern | Example | Justification |
|---------|---------|---------------|
| `POST /api/v1/finance/invoices/{id}/send` | Send an invoice | State transition: DRAFT → SENT |
| `POST /api/v1/finance/payments/{id}/confirm` | Confirm a payment | State transition: PENDING → CONFIRMED |
| `POST /api/v1/people/students/{id}/enroll` | Enroll a student | Complex operation across domains |
| `POST /api/v1/platform/admin/tenants/{id}/deactivate` | Deactivate tenant | Terminal state transition |

**Action endpoint rules:**

| Rule | Description |
|------|-------------|
| Always POST | Action endpoints use POST, not GET or PUT |
| Resource-relative | Actions are sub-resources of the target entity |
| Documented justification | Each action endpoint must be documented with business justification |
| No CRUD alternatives | Only use action endpoints when standard CRUD is insufficient |

### 4.7 URL Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|-------------|---------|-----------------|
| `/api/v1/createStudent` | Verb in URL | `POST /api/v1/people/students` |
| `/api/v1/student` | Singular noun | `/api/v1/people/students` |
| `/api/v1/students/getAll` | Verb in URL | `GET /api/v1/people/students` |
| `/api/v1/students/{id}/update` | Verb in URL | `PUT /api/v1/people/students/{id}` |
| `/api/v1/students/{id}/delete` | Verb in URL | `DELETE /api/v1/people/students/{id}` |
| `/api/v1/students/{id}/profile` | Ambiguous sub-resource | `/api/v1/people/students/{id}` (profile is the student) |
| `/api/v1/students/{id}/invoices` | Cross-domain nesting | `GET /api/v1/finance/invoices?studentId={id}` |

---

## 5. HTTP Methods

### 5.1 Method Usage Matrix

| Method | Purpose | Request Body | Response Body | Idempotent | Safe |
|--------|---------|-------------|---------------|------------|------|
| **GET** | Retrieve resource(s) | No | Yes | Yes | Yes |
| **POST** | Create resource or trigger action | Yes | Yes | No | No |
| **PUT** | Replace resource entirely | Yes | Yes | Yes | No |
| **PATCH** | Partially update resource | Yes | Yes | No* | No |
| **DELETE** | Remove resource | No | Optional | Yes | No |

*PATCH is idempotent when using version-based conflict detection.

### 5.2 GET

**Purpose:** Retrieve one or more resources.

```
GET /api/v1/academics/calendar/years
GET /api/v1/academics/calendar/years/{id}
```

**Rules:**

| Rule | Description |
|------|-------------|
| Read-only | GET must not cause side effects |
| Cacheable | GET responses may include caching headers |
| No request body | GET requests must not include a body |
| Query parameters | Filtering, sorting, and pagination via query parameters |

### 5.3 POST

**Purpose:** Create a new resource or trigger an action.

```
POST /api/v1/people/students
POST /api/v1/finance/invoices/{id}/send
```

**Rules:**

| Rule | Description |
|------|-------------|
| Create or action | POST creates resources or triggers actions |
| Returns created resource | 201 Created with the created resource |
| No redirect | POST does not redirect to the created resource |
| Idempotency key | Clients may include an idempotency key for retry safety |

### 5.4 PUT

**Purpose:** Replace an entire resource.

```
PUT /api/v1/people/students/{id}
```

**Rules:**

| Rule | Description |
|------|-------------|
| Full replacement | PUT replaces the entire resource |
| All fields required | Client must send all fields (no partial updates) |
| Version header | Client must include `If-Match` header with current version |
| Returns updated resource | 200 OK with the updated resource |

### 5.5 PATCH

**Purpose:** Partially update a resource.

```
PATCH /api/v1/people/students/{id}
```

**Rules:**

| Rule | Description |
|------|-------------|
| Partial update | Only include fields that need to change |
| Version header | Client must include `If-Match` header with current version |
| Returns updated resource | 200 OK with the updated resource |
| JSON Merge Patch | Use JSON Merge Patch (RFC 7396) format |

### 5.6 DELETE

**Purpose:** Remove a resource.

```
DELETE /api/v1/people/students/{id}
```

**Rules:**

| Rule | Description |
|------|-------------|
| Soft delete | Resources are soft-deleted (not physically removed) |
| Returns confirmation | 200 OK with success confirmation |
| Version header | Client may include `If-Match` header |
| No body required | DELETE requests must not include a body |

### 5.7 Method Selection Guide

| Action | Method | Endpoint |
|--------|--------|----------|
| List students | GET | `/api/v1/people/students` |
| Get student | GET | `/api/v1/people/students/{id}` |
| Create student | POST | `/api/v1/people/students` |
| Update student | PATCH | `/api/v1/people/students/{id}` |
| Replace student | PUT | `/api/v1/people/students/{id}` |
| Delete student | DELETE | `/api/v1/people/students/{id}` |
| Enroll student | POST | `/api/v1/people/students/{id}/enroll` |
| List invoices | GET | `/api/v1/finance/invoices` |
| Send invoice | POST | `/api/v1/finance/invoices/{id}/send` |
| Confirm payment | POST | `/api/v1/finance/payments/{id}/confirm` |

---

## 6. Request Standards

### 6.1 Content Type

All requests and responses use JSON:

```
Content-Type: application/json
```

| Content Type | Usage |
|-------------|-------|
| `application/json` | Standard API requests and responses |
| `multipart/form-data` | File uploads only |
| `application/x-www-form-urlencoded` | Not used |

### 6.2 Required Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer {JWT}` token |
| `Content-Type` | Yes (with body) | `application/json` |
| `X-Tenant-ID` | Yes | Tenant public identifier |
| `X-Institution-ID` | Conditionally | Institution public identifier (if applicable) |
| `X-Correlation-ID` | Recommended | Client-generated correlation ID for request tracing |
| `X-Request-ID` | Auto-generated | Server-generated unique request identifier |
| `X-Idempotency-Key` | For writes | Client-generated idempotency key for POST/PUT/DELETE |
| `If-Match` | For updates | Current resource version for optimistic concurrency |

### 6.3 Authentication Header

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

- JWT token obtained from the Identity and Access domain
- Token must be included in every request except public endpoints
- Token contains tenantId, userId, roles, and permissions

### 6.4 Correlation IDs

Correlation IDs enable end-to-end request tracing across domains:

```
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

- Client-generated: Client creates correlation ID before sending request
- Propagated: Server propagates correlation ID to all downstream calls and events
- Logged: Correlation ID is included in all log entries for the request
- Returned: Correlation ID is included in the response headers

### 6.5 Idempotency Keys

Idempotency keys prevent duplicate operations on retry:

```
X-Idempotency-Key: 660e8400-e29b-41d4-a716-446655440001
```

- Required for all POST, PUT, and DELETE requests
- Generated by the client (UUID v4)
- Stored server-side with 24-hour TTL
- Duplicate requests within TTL return the original response
- After TTL, the request is processed as new

### 6.6 Request Body Format

All request bodies use JSON:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "dateOfBirth": "2010-05-15",
  "status": "ACTIVE"
}
```

**Body rules:**

| Rule | Description |
|------|-------------|
| UTF-8 | All text is UTF-8 encoded |
| No trailing commas | Valid JSON only |
| ISO 8601 dates | Dates in `YYYY-MM-DD` or full ISO 8601 format |
| UUIDs for IDs | Public business identifiers are UUIDs |
| No comments | JSON does not support comments |
| Max size | 1MB maximum request body |

### 6.7 Request Validation

Requests are validated at three layers:

| Layer | Validation | Error Response |
|-------|------------|----------------|
| **Syntactic** | Valid JSON, correct types | 400 Bad Request |
| **Structural** | Required fields present, field types match schema | 400 Bad Request with field errors |
| **Semantic** | Business rules satisfied, referenced entities exist | 400 Bad Request or 409 Conflict |

### 6.8 File Uploads

File uploads use multipart form data:

```
POST /api/v1/documents/files
Content-Type: multipart/form-data; boundary=----FormBoundary
```

- Maximum file size: 50MB (configurable per domain)
- Supported MIME types: Defined per endpoint
- Virus scanning: Automatic on upload
- Response returns file metadata (ID, name, size, type)

### 6.9 Empty Request Bodies

Endpoints that accept no body (GET, DELETE) must not include a request body:

```
GET /api/v1/people/students/{id}
DELETE /api/v1/people/students/{id}
```

If a GET or DELETE request includes a body, the body is ignored.

---

## 7. Response Standards

### 7.1 Standard Response Envelope

All responses follow a consistent envelope structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... },
  "errors": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | Yes | `true` if request succeeded |
| `data` | object/array/null | Yes | Response payload (null on errors) |
| `meta` | object/null | Yes | Metadata (pagination, correlations) |
| `errors` | array/null | Yes | Error details (null on success) |

### 7.2 Success Responses

**Single resource:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "status": "ACTIVE",
    "version": 1,
    "createdAt": "2026-07-20T10:00:00Z",
    "updatedAt": "2026-07-20T10:00:00Z"
  },
  "meta": {
    "correlationId": "550e8400-e29b-41d4-a716-446655440001",
    "requestId": "660e8400-e29b-41d4-a716-446655440002"
  },
  "errors": null
}
```

**Collection:**

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "...", "firstName": "John", "lastName": "Doe" },
      { "id": "...", "firstName": "Jane", "lastName": "Smith" }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrevious": false
  },
  "meta": {
    "correlationId": "...",
    "requestId": "..."
  },
  "errors": null
}
```

### 7.3 Create Response (201)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "status": "ACTIVE",
    "version": 1,
    "createdAt": "2026-07-20T10:00:00Z",
    "updatedAt": "2026-07-20T10:00:00Z"
  },
  "meta": {
    "correlationId": "...",
    "requestId": "..."
  },
  "errors": null
}
```

- 201 Created for successful resource creation
- `Location` header contains the URL of the created resource

### 7.4 Delete Response (200)

```json
{
  "success": true,
  "data": null,
  "meta": {
    "correlationId": "...",
    "requestId": "..."
  },
  "errors": null
}
```

- 200 OK with null data for successful deletion
- Confirmation message in response body if needed

### 7.5 Empty List Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 20,
    "hasNext": false,
    "hasPrevious": false
  },
  "meta": {
    "correlationId": "...",
    "requestId": "..."
  },
  "errors": null
}
```

### 7.6 Async Operation Response (202)

```json
{
  "success": true,
  "data": {
    "jobId": "770e8400-e29b-41d4-a716-446655440003",
    "status": "PENDING",
    "estimatedDuration": "30s",
    "statusUrl": "/api/v1/platform/jobs/770e8400-e29b-41d4-a716-446655440003"
  },
  "meta": {
    "correlationId": "...",
    "requestId": "..."
  },
  "errors": null
}
```

- 202 Accepted for operations that cannot complete synchronously
- `statusUrl` enables client polling
- Event notification on completion (if subscribed)

### 7.7 Response Field Rules

| Rule | Description |
|------|-------------|
| Always include `success` | Boolean flag for quick client checks |
| Always include `data` | Null when error; never omitted |
| Always include `meta` | Correlation IDs always present |
| Always include `errors` | Null when success; never omitted |
| Timestamps in UTC | ISO 8601 format: `2026-07-20T10:00:00Z` |
| IDs as UUIDs | Public business identifiers, not database IDs |
| No null surprises | If field may be null, always return null (never omit) |
| Consistent casing | camelCase for all response fields |

### 7.8 Response Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | Always `application/json` |
| `X-Request-ID` | Server-generated request identifier |
| `X-Correlation-ID` | Echoed from request or server-generated |
| `ETag` | Resource version for conditional requests |
| `Location` | URL of created resource (201 responses) |
| `Retry-After` | Seconds to wait before retry (429 responses) |
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | UTC timestamp when window resets |

---

## 8. Pagination

### 8.1 Offset Pagination (Default)

Offset pagination is the standard for OpenSchool ERP:

```
GET /api/v1/people/students?page=1&limit=20
```

**Parameters:**

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `page` | integer | 1 | ≥ 1 | Page number (1-indexed) |
| `limit` | integer | 20 | 1–100 | Items per page |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**When to use:**

- Standard list views with known total counts
- Admin dashboards with page controls
- Reports with predictable data volumes

### 8.2 Cursor Pagination (High-Volume)

Cursor pagination for large or infinite-scroll datasets:

```
GET /api/v1/communication/notifications?cursor=abc123&limit=20
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cursor` | string | null | Opaque cursor from previous response |
| `limit` | integer | 20 | Items per page |

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "nextCursor": "def456",
    "hasMore": true
  }
}
```

**When to use:**

- Infinite scroll UIs
- Real-time feeds (notifications, activity logs)
- Large datasets where total count is expensive

### 8.3 Pagination Rules

| Rule | Description |
|------|-------------|
| Default page size | 20 items |
| Maximum page size | 100 items |
| Total count | Included in offset pagination responses |
| Empty results | Return empty `items` array, not null |
| Page bounds | If `page` exceeds total pages, return empty items with `hasNext: false` |
| Consistency | Same pagination parameters across all list endpoints |

### 8.4 Pagination Metadata

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of matching records (offset pagination) |
| `page` | integer | Current page number |
| `limit` | integer | Items per page |
| `hasNext` | boolean | Whether more pages exist |
| `hasPrevious` | boolean | Whether previous pages exist |
| `nextCursor` | string | Cursor for next page (cursor pagination) |
| `hasMore` | boolean | Whether more items exist (cursor pagination) |

---

## 9. Filtering & Searching

### 9.1 Exact Match Filters

Filter by exact field value:

```
GET /api/v1/people/students?status=ACTIVE
GET /api/v1/finance/invoices?status=OVERDUE
GET /api/v1/academics/calendar/years?isCurrent=true
```

### 9.2 Multiple Value Filters

Filter by multiple values (OR logic):

```
GET /api/v1/people/students?status=ACTIVE,GRADUATED
GET /api/v1/finance/invoices?status=SENT,OVERDUE
```

- Values separated by commas
- Values are treated as OR (any match)
- No spaces after commas

### 9.3 Foreign Key Filters

Filter by related entity:

```
GET /api/v1/finance/invoices?studentId=550e8400-e29b-41d4-a716-446655440000
GET /api/v1/academics/calendar/years?institutionId=550e8400-e29b-41d4-a716-446655440001
GET /api/v1/people/attendance?classId=550e8400-e29b-41d4-a716-446655440002
```

### 9.4 Date Range Filters

Filter by date ranges:

```
GET /api/v1/finance/invoices?dueDateFrom=2026-08-01&dueDateTo=2026-08-31
GET /api/v1/communication/logs?sentAtFrom=2026-07-01T00:00:00Z&sentAtTo=2026-07-31T23:59:59Z
```

**Naming convention:**

| Pattern | Description |
|---------|-------------|
| `{field}From` | Inclusive lower bound |
| `{field}To` | Inclusive upper bound |

### 9.5 Full-Text Search

Search across multiple fields:

```
GET /api/v1/people/students?search=john
GET /api/v1/finance/invoices?search=INV-2026-001
```

- Search is case-insensitive
- Search matches partial words
- Search fields are defined per endpoint
- Search is not supported on all endpoints

### 9.6 Compound Filters

Combine multiple filters:

```
GET /api/v1/people/students?status=ACTIVE&classId=uuid&search=john
GET /api/v1/finance/invoices?status=OVERDUE&dueDateTo=2026-07-31&studentId=uuid
```

- All filters are AND logic
- Filters are applied in any order
- Filters are cumulative

### 9.7 Filter Rules

| Rule | Description |
|------|-------------|
| Parameter names | camelCase, matching field names |
| Filter types | Exact match by default; ranges use `From`/`To` suffix |
| Null handling | `?field=null` filters for null values |
| Boolean filters | `?isCurrent=true` (not `1` or `yes`) |
| No wildcard syntax | No `*` or `%` in filter values; use `search` for partial matching |

---

## 10. Sorting

### 10.1 Sort Parameters

```
GET /api/v1/people/students?sortBy=lastName&sortOrder=asc
GET /api/v1/finance/invoices?sortBy=dueDate&sortOrder=desc
```

| Parameter | Type | Default | Values |
|-----------|------|---------|--------|
| `sortBy` | string | `createdAt` | Field name to sort by |
| `sortOrder` | string | `desc` | `asc` or `desc` |

### 10.2 Multiple Sort Fields

Sort by multiple fields:

```
GET /api/v1/people/students?sortBy=lastName,firstName&sortOrder=asc,asc
GET /api/v1/finance/invoices?sortBy=dueDate,amount&sortOrder=desc,desc
```

- Fields separated by commas
- Orders separated by commas
- Applied left-to-right (primary sort, secondary sort, etc.)

### 10.3 Default Sort Order

| Endpoint Type | Default Sort |
|---------------|-------------|
| List endpoints | `createdAt` descending |
| Audit logs | `createdAt` descending |
| Financial records | `createdAt` descending |
| People | `lastName` ascending |

### 10.4 Sortable Fields

- Only fields explicitly marked as sortable may be used
- Sorting by `id` is always supported
- Sorting by `createdAt` is always supported
- Sorting by `updatedAt` is always supported
- Non-sortable fields return 400 Bad Request

---

## 11. Bulk & Batch Operations

### 11.1 Bulk Create

Create multiple resources in one request:

```
POST /api/v1/people/students/bulk
```

```json
{
  "items": [
    { "firstName": "John", "lastName": "Doe", "email": "john@example.com" },
    { "firstName": "Jane", "lastName": "Smith", "email": "jane@example.com" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "items": [
      { "id": "...", "firstName": "John", "lastName": "Doe", "status": "SUCCESS" },
      { "id": "...", "firstName": "Jane", "lastName": "Smith", "status": "SUCCESS" }
    ]
  }
}
```

### 11.2 Bulk Update

Update multiple resources in one request:

```
PATCH /api/v1/people/students/bulk
```

```json
{
  "items": [
    { "id": "uuid1", "status": "ACTIVE" },
    { "id": "uuid2", "status": "INACTIVE" }
  ]
}
```

### 11.3 Bulk Delete

Delete multiple resources in one request:

```
POST /api/v1/people/students/bulk-delete
```

```json
{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

### 11.4 Bulk Operation Rules

| Rule | Description |
|------|-------------|
| Maximum items | 100 items per bulk request |
| Atomicity | All-or-nothing: all succeed or all fail |
| Per-item results | Response includes success/failure status per item |
| Validation | All items are validated before any are processed |
| Events | One event per item (not one event for the batch) |
| Idempotency | Each item uses its own idempotency mechanism |
| Error handling | First validation error stops processing; returns all errors |

### 11.5 Partial Success

Partial success is not supported in V1. Bulk operations are atomic:

- If any item fails validation, all items are rejected
- If any item fails business rules, all items are rejected
- If any item fails database constraints, all items are rejected
- Partial success support is reserved for V2

---

## 12. Asynchronous Operations

### 12.1 When to Use Async

| Scenario | Approach |
|----------|----------|
| Operation completes in < 500ms | Synchronous (200 OK) |
| Operation takes 500ms–5s | Synchronous with timeout (200 OK or 408) |
| Operation takes > 5s | Asynchronous (202 Accepted) |
| Operation requires human approval | Async with event notification |
| Operation triggers external system | Async with callback/webhook |

### 12.2 Async Request

```
POST /api/v1/academics/reports/generate
```

```json
{
  "reportType": "TERM_REPORT_CARD",
  "termId": "uuid",
  "classIds": ["uuid1", "uuid2"]
}
```

**Response (202 Accepted):**

```json
{
  "success": true,
  "data": {
    "jobId": "770e8400-e29b-41d4-a716-446655440003",
    "status": "PENDING",
    "estimatedDuration": "30s",
    "statusUrl": "/api/v1/platform/jobs/770e8400-e29b-41d4-a716-446655440003",
    "createdAt": "2026-07-20T10:00:00Z"
  }
}
```

### 12.3 Job Status Endpoint

```
GET /api/v1/platform/jobs/{jobId}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "jobId": "770e8400-e29b-41d4-a716-446655440003",
    "status": "COMPLETED",
    "progress": {
      "total": 100,
      "completed": 100,
      "percentage": 100
    },
    "result": {
      "reportUrl": "/api/v1/documents/files/{fileId}"
    },
    "startedAt": "2026-07-20T10:00:01Z",
    "completedAt": "2026-07-20T10:00:25Z"
  }
}
```

### 12.4 Job Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Job is queued, not yet started |
| `IN_PROGRESS` | Job is running |
| `COMPLETED` | Job finished successfully |
| `FAILED` | Job failed (error details in response) |
| `CANCELLED` | Job was cancelled by user or system |

### 12.5 Polling Rules

| Rule | Description |
|------|-------------|
| Minimum interval | Clients must not poll more frequently than every 2 seconds |
| Maximum duration | Clients must stop polling after 5 minutes |
| Completion notification | Event published on job completion (preferred over polling) |
| Error details | Failed jobs include error message and retry guidance |

### 12.6 Event Notification

Preferred completion notification via domain events:

```
Event: ReportGenerated
{
  "jobId": "770e8400-e29b-41d4-a716-446655440003",
  "status": "COMPLETED",
  "reportUrl": "/api/v1/documents/files/{fileId}"
}
```

Clients may subscribe to completion events instead of polling.

---

## 13. Authentication & Authorization

### 13.1 Authentication Mechanism

OpenSchool ERP uses JWT-based authentication:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

- Token obtained from Identity and Access domain (`/api/v1/auth/login`)
- Token is a signed JWT containing tenantId, userId, roles, and permissions
- Token is validated on every request (except public endpoints)
- Token expiry is enforced; refresh tokens are used for renewal

### 13.2 JWT Token Structure

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "550e8400-e29b-41d4-a716-446655440001",
  "institutionId": "550e8400-e29b-41d4-a716-446655440002",
  "roles": ["ADMIN", "STAFF"],
  "permissions": ["students:read", "students:write", "invoices:read"],
  "iat": 1721481600,
  "exp": 1721485200
}
```

| Claim | Description |
|-------|-------------|
| `sub` | User public identifier |
| `tenantId` | Tenant public identifier (mandatory) |
| `institutionId` | Institution public identifier (if applicable) |
| `roles` | User's roles within the tenant |
| `permissions` | Granular permissions for API access |
| `iat` | Token issued-at timestamp |
| `exp` | Token expiry timestamp |

### 13.3 Tenant Isolation at API Layer

Every request must include tenant context:

```
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440001
```

| Rule | Description |
|------|-------------|
| Token claim | `tenantId` from JWT must match `X-Tenant-ID` header |
| Mismatch rejection | Requests with mismatched tenant context return 403 |
| Data scoping | All queries are automatically scoped to the authenticated tenant |
| Cross-tenant access | Forbidden; no API endpoint may return cross-tenant data |

### 13.4 Institution Isolation

For multi-institution tenants:

```
X-Institution-ID: 550e8400-e29b-41d4-a716-446655440002
```

- Institution isolation is enforced at the service layer
- Platform administrators may operate across institutions within a tenant
- Institution-scoped users can only access their institution's data

### 13.5 Authorization Levels

| Level | Description | Enforcement |
|-------|-------------|-------------|
| **Authentication** | Verify JWT is valid and not expired | API Gateway / Middleware |
| **Tenant Isolation** | Verify tenant context matches token | API Gateway / Middleware |
| **Role-Based Access** | Verify user has required role | Service Layer |
| **Permission-Based Access** | Verify user has required permission | Service Layer |
| **Resource Ownership** | Verify user owns the resource | Service Layer |

### 13.6 Authorization Headers Summary

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer JWT token |
| `X-Tenant-ID` | Yes | Tenant public identifier |
| `X-Institution-ID` | Conditionally | Institution public identifier |
| `X-Correlation-ID` | Recommended | Client-generated correlation ID |

### 13.7 Public Endpoints

Some endpoints do not require authentication:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/auth/login` | User authentication |
| `POST /api/v1/auth/refresh` | Token refresh |
| `POST /api/v1/auth/forgot-password` | Password reset request |
| `POST /api/v1/auth/reset-password` | Password reset confirmation |
| `GET /api/v1/health` | Health check |

Public endpoints are rate-limited and logged.

---

## 14. API Versioning

### 14.1 URI Versioning

Version is embedded in the URL:

```
/api/v1/academics/calendar/years
/api/v2/academics/calendar/years
```

| Rule | Description |
|------|-------------|
| Version format | `v{major}` (e.g., `v1`, `v2`) |
| Version location | Always in the URL path, after `/api/` |
| No minor versions | Only major versions in URLs |
| Current version | V1 is the current and only active version |

### 14.2 When to Create a New Version

A new major version is required when:

| Change | Version Bump |
|--------|-------------|
| Removing a field from a response | MAJOR |
| Renaming a field in a response | MAJOR |
| Changing field type (string → integer) | MAJOR |
| Changing URL structure | MAJOR |
| Changing pagination behavior | MAJOR |
| Changing error response format | MAJOR |
| Removing an endpoint | MAJOR |

A new major version is NOT required when:

| Change | Action |
|--------|--------|
| Adding a new field to a response | MINOR (no version bump) |
| Adding a new endpoint | MINOR (no version bump) |
| Adding optional query parameter | MINOR (no version bump) |
| Adding new enum value | MINOR (no version bump) |
| Fixing a bug in behavior | PATCH (no version bump) |

### 14.3 Backward Compatibility

New fields are added without breaking existing clients:

```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "newField": "value",
  "status": "ACTIVE"
}
```

| Rule | Description |
|------|-------------|
| Additive only | New fields may be added to responses |
| Optional fields | New fields may be null |
| Client resilience | Clients must ignore unknown fields |
| No breaking changes | Existing fields are never removed or renamed |

### 14.4 Deprecation Policy

| Phase | Duration | Description |
|-------|----------|-------------|
| **Announcement** | 0 days | Deprecation announced in API changelog |
| **Coexistence** | 90 days | Old and new versions both available |
| **Sunset** | After 90 days | Old version returns 410 Gone |
| **Removal** | After 120 days | Old version endpoints removed |

### 14.5 Sunset Header

Deprecated endpoints include:

```
Sunset: Sat, 20 Nov 2026 00:00:00 GMT
Deprecation: true
Link: <https://api.openschool.io/docs/v2>; rel="successor-version"
```

---

## 15. Concurrency

### 15.1 Optimistic Concurrency Control

All mutable resources use optimistic concurrency via version fields:

```
PATCH /api/v1/people/students/{id}
If-Match: 3
```

| Rule | Description |
|------|-------------|
| Version field | Every mutable entity has a `version` field (integer) |
| Client includes version | Client reads `version` from GET, includes in `If-Match` header |
| Server validates version | Server checks `version` matches current version before update |
| Version increments | Server increments `version` on every successful update |

### 15.2 Conflict Detection

On version mismatch:

```
HTTP/1.1 409 Conflict
```

```json
{
  "success": false,
  "data": null,
  "meta": {
    "correlationId": "...",
    "requestId": "..."
  },
  "errors": [
    {
      "code": "CONFLICT",
      "message": "The record has been modified by another user. Please refresh and retry.",
      "details": {
        "currentVersion": 5,
        "submittedVersion": 3
      }
    }
  ]
}
```

### 15.3 ETag Support

ETags provide an alternative concurrency mechanism:

```
GET /api/v1/people/students/{id}
```

Response:

```
ETag: "3"
```

Subsequent request:

```
PATCH /api/v1/people/students/{id}
If-Match: "3"
```

- ETag value matches the `version` field
- ETags are optional; `If-Match` header with version field is the primary mechanism

### 15.4 Conflict Resolution

| Scenario | Client Action |
|----------|--------------|
| 409 Conflict | Fetch latest version, merge changes, retry |
| Multiple conflicts | Alert user; manual resolution may be required |
| Concurrent bulk update | Each item is independently versioned |

---

## 16. Idempotency

### 16.1 Idempotent Operations

| Method | Idempotent by Default | Requires Idempotency Key |
|--------|----------------------|--------------------------|
| GET | Yes | No |
| PUT | Yes | Recommended |
| DELETE | Yes | Recommended |
| PATCH | Yes (with version) | Recommended |
| POST | No | Required |

### 16.2 Idempotency Key Mechanism

```
POST /api/v1/people/students
X-Idempotency-Key: 660e8400-e29b-41d4-a716-446655440001
```

**Server behavior:**

| Scenario | Server Action |
|----------|--------------|
| New key | Process request, store key with response for 24 hours |
| Existing key within TTL | Return stored response without processing |
| Existing key after TTL | Process request as new |

### 16.3 Idempotency Key Rules

| Rule | Description |
|------|-------------|
| Format | UUID v4 |
| Generation | Client generates before sending request |
| Storage | Server stores for 24 hours |
| Scope | Key is scoped to the endpoint and tenant |
| Response | Same response returned on retry (status code, body, headers) |

### 16.4 Retry Behavior

| Scenario | Retry Strategy |
|----------|---------------|
| Network timeout | Retry with same idempotency key |
| 408 Request Timeout | Retry with same idempotency key |
| 429 Too Many Requests | Retry after `Retry-After` header value |
| 500 Server Error | Retry with exponential backoff |
| 409 Conflict | Do not retry; fetch latest version first |
| 4xx Client Error | Do not retry; fix request |

### 16.5 Duplicate Prevention

| Mechanism | Layer | Description |
|-----------|-------|-------------|
| Idempotency key | API Layer | Prevents duplicate requests within 24 hours |
| Unique constraints | Database Layer | Prevents duplicate records at the database level |
| Event deduplication | Event Layer | Prevents duplicate event processing via eventId |

---

## 17. Error Model

### 17.1 Error Response Structure

All error responses follow the standard envelope with errors populated:

```json
{
  "success": false,
  "data": null,
  "meta": {
    "correlationId": "550e8400-e29b-41d4-a716-446655440001",
    "requestId": "660e8400-e29b-41d4-a716-446655440002"
  },
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Request validation failed",
      "details": [
        {
          "field": "email",
          "message": "Email is required",
          "rejectedValue": null
        },
        {
          "field": "firstName",
          "message": "First name must be at least 2 characters",
          "rejectedValue": "J"
        }
      ]
    }
  ]
}
```

### 17.2 Error Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Machine-readable error code |
| `message` | string | Yes | Human-readable error description |
| `details` | array | No | Field-level or context-specific error details |
| `details[].field` | string | No | Field that caused the error |
| `details[].message` | string | No | Field-specific error message |
| `details[].rejectedValue` | any | No | Value that was rejected |

### 17.3 HTTP Status Codes

| Code | Usage | Description |
|------|-------|-------------|
| **200** | OK | Successful GET, PUT, PATCH, DELETE |
| **201** | Created | Successful POST (resource created) |
| **202** | Accepted | Async operation accepted |
| **204** | No Content | Successful DELETE with no response body |
| **400** | Bad Request | Validation error, malformed request |
| **401** | Unauthorized | Authentication required or token invalid |
| **403** | Forbidden | Authenticated but not authorized |
| **404** | Not Found | Resource does not exist |
| **409** | Conflict | Version mismatch or resource conflict |
| **422** | Unprocessable Entity | Semantically invalid request |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unexpected server error |
| **502** | Bad Gateway | Upstream service unavailable |
| **503** | Service Unavailable | Temporary maintenance or overload |

### 17.4 Error Code Categories

| Category | Code Range | Examples |
|----------|-----------|----------|
| **Validation** | VALIDATION_* | `VALIDATION_ERROR`, `VALIDATION_REQUIRED_FIELD`, `VALIDATION_INVALID_FORMAT` |
| **Authentication** | AUTH_* | `AUTH_TOKEN_EXPIRED`, `AUTH_INVALID_TOKEN`, `AUTH_TOKEN_MISSING` |
| **Authorization** | FORBIDDEN_* | `FORBIDDEN_INSUFFICIENT_PERMISSIONS`, `FORBIDDEN_TENANT_MISMATCH` |
| **Resource** | NOT_FOUND_* | `NOT_FOUND_STUDENT`, `NOT_FOUND_INVOICE`, `NOT_FOUND_ACADEMIC_YEAR` |
| **Conflict** | CONFLICT_* | `CONFLICT_VERSION_MISMATCH`, `CONFLICT_DUPLICATE_EMAIL`, `CONFLICT_LIFECYCLE` |
| **Business Rule** | BUSINESS_* | `BUSINESS_RULE_VIOLATION`, `BUSINESS_INVALID_STATE_TRANSITION` |
| **Integration** | INTEGRATION_* | `INTEGRATION_TIMEOUT`, `INTEGRATION_UNAVAILABLE`, `INTEGRATION_RATE_LIMITED` |
| **Infrastructure** | SYSTEM_* | `SYSTEM_INTERNAL_ERROR`, `SYSTEM_SERVICE_UNAVAILABLE`, `SYSTEM_DATABASE_ERROR` |

### 17.5 Validation Error Details

For validation errors, include field-level details:

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "...", "requestId": "..." },
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Request validation failed",
      "details": [
        {
          "field": "email",
          "message": "Email is required",
          "rejectedValue": null
        },
        {
          "field": "dateOfBirth",
          "message": "Date must be in YYYY-MM-DD format",
          "rejectedValue": "15/05/2010"
        },
        {
          "field": "status",
          "message": "Status must be one of: ACTIVE, INACTIVE, GRADUATED, WITHDRAWN",
          "rejectedValue": "PENDING"
        }
      ]
    }
  ]
}
```

### 17.6 Authentication Error Examples

**Missing token:**

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "...", "requestId": "..." },
  "errors": [
    {
      "code": "AUTH_TOKEN_MISSING",
      "message": "Authentication token is required"
    }
  ]
}
```

**Expired token:**

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "...", "requestId": "..." },
  "errors": [
    {
      "code": "AUTH_TOKEN_EXPIRED",
      "message": "Authentication token has expired. Please refresh your token."
    }
  ]
}
```

### 17.7 Authorization Error Examples

**Insufficient permissions:**

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "...", "requestId": "..." },
  "errors": [
    {
      "code": "FORBIDDEN_INSUFFICIENT_PERMISSIONS",
      "message": "You do not have permission to perform this action"
    }
  ]
}
```

**Tenant mismatch:**

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "...", "requestId": "..." },
  "errors": [
    {
      "code": "FORBIDDEN_TENANT_MISMATCH",
      "message": "The requested resource does not belong to your tenant"
    }
  ]
}
```

### 17.8 Not Found Error Example

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "...", "requestId": "..." },
  "errors": [
    {
      "code": "NOT_FOUND_STUDENT",
      "message": "Student with ID 550e8400-e29b-41d4-a716-446655440000 was not found"
    }
  ]
}
```

### 17.9 Conflict Error Example

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "...", "requestId": "..." },
  "errors": [
    {
      "code": "CONFLICT_VERSION_MISMATCH",
      "message": "The record has been modified by another user. Please refresh and retry.",
      "details": {
        "currentVersion": 5,
        "submittedVersion": 3
      }
    }
  ]
}
```

### 17.10 Business Rule Error Example

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "...", "requestId": "..." },
  "errors": [
    {
      "code": "BUSINESS_INVALID_STATE_TRANSITION",
      "message": "Cannot send invoice in DRAFT status. Invoice must be finalized first.",
      "details": {
        "currentState": "DRAFT",
        "requestedAction": "SEND",
        "requiredState": "FINALIZED"
      }
    }
  ]
}
```

### 17.11 Rate Limit Error

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "...", "requestId": "..." },
  "errors": [
    {
      "code": "SYSTEM_RATE_LIMIT_EXCEEDED",
      "message": "Rate limit exceeded. Please retry after 30 seconds."
    }
  ]
}
```

Response headers:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1721485200
```

### 17.12 Error Response Rules

| Rule | Description |
|------|-------------|
| Always standard envelope | Error responses use the same envelope as success responses |
| `success: false` | Always `false` for error responses |
| `data: null` | Always `null` for error responses |
| `errors` array | Always non-empty; at least one error object |
| Machine-readable code | Error codes are stable; clients may switch on them |
| Human-readable message | Messages are descriptive but do not leak implementation details |
| No stack traces | Stack traces are never included in production responses |
| Correlation ID | Always included for debugging |
| Multiple errors | Return all validation errors in one response (not one at a time) |
| First error convention | If only one error is possible, return one; otherwise return all |

---

## 18. Security Standards

### 18.1 Sensitive Data Exposure

| Rule | Description |
|------|-------------|
| No secrets in URLs | Secrets must never appear in query parameters or URLs |
| No secrets in logs | Request/response logging must redact Authorization headers, passwords, tokens |
| PII masking | PII fields (email, phone, address) are masked in logs |
| Error messages | Error messages must not reveal internal implementation details |
| Stack traces | Stack traces are never returned in API responses |

### 18.2 Input Sanitization

| Rule | Description |
|------|-------------|
| SQL injection | All inputs are parameterized; no raw SQL from user input |
| XSS prevention | All output is HTML-encoded; JSON responses are not rendered as HTML |
| Path traversal | File paths are validated; no directory traversal in file operations |
| Command injection | No user input is used in shell commands |
| Length limits | All string inputs have maximum length enforcement |
| Type enforcement | All inputs are type-checked before processing |

### 18.3 Output Encoding

| Context | Encoding |
|---------|----------|
| JSON responses | UTF-8 encoded |
| HTML output | HTML entity encoding |
| URL parameters | URL encoding |
| File names | Sanitized (no path separators, no special characters) |

### 18.4 Rate Limiting

| Endpoint Category | Rate Limit | Window |
|-------------------|-----------|--------|
| Public endpoints | 10 requests | 1 minute |
| Authenticated endpoints | 100 requests | 1 minute |
| Bulk operations | 5 requests | 1 minute |
| File uploads | 10 requests | 1 minute |
| Admin endpoints | 50 requests | 1 minute |

**Rate limit headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1721485200
```

### 18.5 Request Throttling

| Scenario | Action |
|----------|--------|
| Within limit | Process normally |
| At limit | Return 429 with `Retry-After` header |
| Exceeded limit | Return 429; log for abuse analysis |
| Repeated violations | Temporary IP blocking (platform admin action) |

### 18.6 API Abuse Prevention

| Measure | Description |
|---------|-------------|
| Request size limit | Maximum 1MB per request body |
| URL length limit | Maximum 2048 characters per URL |
| Header size limit | Maximum 8KB per request |
| Timeout | Maximum 30 seconds per request |
| Concurrency limit | Maximum 10 concurrent requests per user |

### 18.7 Audit Requirements

| Event | Logged |
|-------|--------|
| Authentication success | Yes |
| Authentication failure | Yes |
| Authorization failure | Yes |
| Resource creation | Yes |
| Resource modification | Yes |
| Resource deletion | Yes |
| Bulk operations | Yes |
| File uploads | Yes |
| Admin actions | Yes |
| Rate limit violations | Yes |

Audit logs include: timestamp, userId, tenantId, action, resource, resourceId, ipAddress, userAgent, correlationId.

---

## 19. File Upload Standards

### 19.1 Upload Endpoint Pattern

```
POST /api/v1/documents/files
Content-Type: multipart/form-data
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fileName": "report-card-term-1.pdf",
    "originalName": "report-card-term-1.pdf",
    "mimeType": "application/pdf",
    "size": 1048576,
    "storageKey": "uploads/tenant-id/2026/07/20/report-card-term-1.pdf",
    "uploadedBy": "550e8400-e29b-41d4-a716-446655440001",
    "uploadedAt": "2026-07-20T10:00:00Z"
  }
}
```

### 19.2 File Validation

| Validation | Rule |
|------------|------|
| File size | Maximum 50MB (configurable per endpoint) |
| MIME type | Whitelist per endpoint |
| File extension | Must match MIME type |
| Virus scan | Automatic on upload |
| Name sanitization | Remove path separators, special characters |

### 19.3 MIME Type Whitelist

| Category | Allowed Types |
|----------|--------------|
| Documents | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.*` |
| Images | `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| Spreadsheets | `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.*` |
| Text | `text/csv`, `text/plain` |

### 19.4 Storage Abstraction

| Rule | Description |
|------|-------------|
| Storage key | Internal storage path; never exposed to client |
| Download URL | Temporary signed URL for download (expires in 1 hour) |
| Multi-tenant isolation | Files are stored in tenant-scoped paths |
| Backup | Files are included in tenant backup strategy |

### 19.5 Upload Response Metadata

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | File identifier |
| `fileName` | string | Sanitized file name |
| `originalName` | string | Original file name from client |
| `mimeType` | string | Detected MIME type |
| `size` | integer | File size in bytes |
| `storageKey` | string | Internal storage path (not exposed) |
| `uploadedBy` | UUID | User who uploaded the file |
| `uploadedAt` | ISO 8601 | Upload timestamp |

---

## 20. API Documentation Standards

### 20.1 OpenAPI Specification

All APIs must be documented using OpenAPI 3.1:

```yaml
openapi: 3.1.0
info:
  title: OpenSchool ERP API
  version: 1.0.0
```

### 20.2 Endpoint Documentation Requirements

Every endpoint must include:

| Field | Description |
|-------|-------------|
| Summary | Brief description of the endpoint |
| Description | Detailed description of the endpoint's purpose |
| Tags | Domain category for grouping |
| Parameters | All path, query, header, and body parameters |
| Request body | JSON schema for request body |
| Responses | All possible response codes with examples |
| Error responses | Error code examples for each error type |
| Security | Authentication and authorization requirements |

### 20.3 Schema Documentation

| Rule | Description |
|------|-------------|
| Field descriptions | Every field must have a description |
| Example values | Every field must have an example |
| Constraints | Document min/max, pattern, enum values |
| Nullable fields | Explicitly mark nullable fields |
| Read-only fields | Mark fields that are server-generated |
| Write-only fields | Mark fields that are only accepted on input |

### 20.4 Error Documentation

Every endpoint must document:

| Error Code | When It Occurs |
|-----------|---------------|
| `VALIDATION_ERROR` | Invalid request body |
| `NOT_FOUND_*` | Resource does not exist |
| `CONFLICT_*` | Version mismatch or business rule violation |
| `FORBIDDEN_*` | Insufficient permissions |

### 20.5 Version Documentation

| Rule | Description |
|------|-------------|
| Version in title | Include version in API title |
| Version in URL | Major version in URL path |
| Changelog | Maintain API changelog for each version |
| Migration guide | Provide migration guide for version upgrades |

### 20.6 Swagger UI

Swagger UI is available at:

```
https://{host}/api/docs
```

- Swagger UI is available in development and staging environments
- Swagger UI is disabled in production
- OpenAPI spec is always available at `/api/docs/openapi.json`

---

## 21. Performance Standards

### 21.1 Response Size Limits

| Response Type | Maximum Size |
|---------------|-------------|
| Single resource | 100KB |
| Collection (20 items) | 1MB |
| Collection (100 items) | 5MB |
| File download | 50MB |

### 21.2 Pagination Thresholds

| Threshold | Value |
|-----------|-------|
| Default page size | 20 |
| Maximum page size | 100 |
| Recommended page size | 20–50 |

### 21.3 Caching Headers

| Header | Description |
|--------|-------------|
| `Cache-Control` | Caching directives for the response |
| `ETag` | Resource version for conditional requests |
| `Last-Modified` | Last modification timestamp |

**Cache-Control rules:**

| Endpoint Type | Cache-Control |
|---------------|--------------|
| Single resource (GET) | `private, max-age=300` (5 minutes) |
| Collection (GET) | `private, max-age=60` (1 minute) |
| Mutating operations | `no-store` |
| Static assets | `public, max-age=86400` (1 day) |

### 21.4 Compression

| Rule | Description |
|------|-------------|
| Gzip | Responses > 1KB are gzip-compressed |
| Brotli | Brotli compression if client supports it |
| Content-Encoding | Response includes `Content-Encoding` header |

### 21.5 Query Optimization

| Rule | Description |
|------|-------------|
| Pagination | All list queries use LIMIT/OFFSET or cursor |
| Indexing | Filtered and sorted fields must be indexed |
| N+1 prevention | No N+1 queries; use eager loading or batch queries |
| Select fields | Return only required fields; avoid `SELECT *` |

### 21.6 Timeout Guidance

| Operation Type | Timeout |
|---------------|---------|
| Simple GET | 5 seconds |
| Complex GET (aggregation) | 10 seconds |
| POST/PUT/PATCH | 10 seconds |
| DELETE | 10 seconds |
| File upload | 60 seconds |
| Async job submission | 30 seconds |

### 21.7 Performance Monitoring

| Metric | Target |
|--------|--------|
| API response time (p50) | < 100ms |
| API response time (p95) | < 500ms |
| API response time (p99) | < 1000ms |
| Error rate | < 0.1% |
| Availability | > 99.9% |

---

## 22. Testing Standards

### 22.1 Test Pyramid

| Layer | Coverage Target | Description |
|-------|----------------|-------------|
| **Unit tests** | 80% | Service logic, validation, business rules |
| **Integration tests** | 60% | API endpoints, database queries, event publishing |
| **Contract tests** | 100% | API contract validation against OpenAPI spec |
| **E2E tests** | Critical paths | Complete user workflows |

### 22.2 API Test Requirements

Every API endpoint must have:

| Test Type | Description |
|-----------|-------------|
| Success test | Valid request produces expected response |
| Validation test | Invalid request produces correct error |
| Authorization test | Unauthenticated request returns 401 |
| Permission test | Unauthorized request returns 403 |
| Tenant isolation test | Cross-tenant request returns 403 |
| Concurrency test | Version mismatch returns 409 |
| Idempotency test | Duplicate request returns same response |

### 22.3 Test Naming Convention

```
describe('Students API', () => {
  describe('POST /api/v1/people/students', () => {
    it('should create a student with valid data', () => {});
    it('should return 400 when email is missing', () => {});
    it('should return 401 when token is missing', () => {});
    it('should return 403 when user lacks students:write permission', () => {});
    it('should return 409 when email already exists', () => {});
  });
});
```

### 22.4 Test Data Management

| Rule | Description |
|------|-------------|
| Factory pattern | Use factory functions for test data generation |
| Cleanup | Tests clean up after themselves |
| Isolation | Tests do not depend on other tests |
| Deterministic | Tests produce the same result every time |

### 22.5 Contract Testing

API contracts are validated against the OpenAPI specification:

- All request/response schemas match the OpenAPI definition
- All documented status codes are tested
- All documented error codes are tested
- Contract tests run on every API change

---

## 23. Architecture Decision Records

### 23.1 REST Architecture ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-API-01 | URI versioning over header versioning | Simpler for clients; visible in logs; easier debugging |
| ADR-API-02 | Resource-oriented over action-oriented | RESTful consistency; predictable URL patterns |
| ADR-API-03 | JSON over XML | Simpler parsing; smaller payloads; industry standard |
| ADR-API-04 | Plural nouns for resources | Consistency; "students" not "student" |
| ADR-API-05 | Hyphens over underscores in URLs | URL convention; easier to read |

### 23.2 Versioning ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-API-06 | Major version only in URL | No minor version complexity; additive changes don't need version bump |
| ADR-API-07 | 90-day deprecation window | Balances stability with innovation; gives clients time to migrate |
| ADR-API-08 | Backward compatible by default | New fields are additive; existing fields are never removed |

### 23.3 Error Model ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-API-09 | Single error envelope | Consistent error handling; clients use one pattern |
| ADR-API-10 | Machine-readable error codes | Clients may switch on codes; enables automated error handling |
| ADR-API-11 | Multiple errors in one response | Reduces round trips; clients see all issues at once |
| ADR-API-12 | No stack traces in responses | Security; prevents information leakage |

### 23.4 Pagination ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-API-13 | Offset pagination as default | Simple; predictable; supports page-based UIs |
| ADR-API-14 | Cursor pagination for high-volume | Better performance for large datasets; no offset drift |
| ADR-API-15 | Maximum page size of 100 | Prevents excessive payload sizes; encourages proper filtering |

### 23.5 Concurrency ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-API-16 | Optimistic concurrency via version field | No pessimistic locking overhead; works with event-driven architecture |
| ADR-API-17 | If-Match header for version | HTTP-standard mechanism; explicit version control |

### 23.6 Idempotency ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-API-18 | Client-generated idempotency keys | Client knows best when to retry; no server-side state needed |
| ADR-API-19 | 24-hour idempotency TTL | Balances safety with storage cost; covers most retry scenarios |

---

## 24. API Review Checklist

Use this checklist when reviewing any new or modified API endpoint.

### 24.1 URL Design Review

- [ ] Resource name is plural, lowercase, hyphenated
- [ ] URL follows `/api/v1/{domain}/{resource}` pattern
- [ ] Nesting depth ≤ 3 levels
- [ ] No verbs in URL (except action endpoints with justification)
- [ ] Cross-domain references use query parameters, not nesting
- [ ] Action endpoints use POST with documented justification

### 24.2 HTTP Method Review

- [ ] GET for read-only operations (no side effects)
- [ ] POST for creation and actions
- [ ] PUT for full replacement
- [ ] PATCH for partial updates
- [ ] DELETE for removal (soft delete)
- [ ] Method matches operation semantics

### 24.3 Request Review

- [ ] Content-Type is `application/json` (or `multipart/form-data` for uploads)
- [ ] All required headers documented
- [ ] Request body validated (syntactic, structural, semantic)
- [ ] Maximum request body size enforced (1MB)
- [ ] File uploads validated (MIME type, size, virus scan)
- [ ] Idempotency key required for POST/PUT/DELETE

### 24.4 Response Review

- [ ] Standard envelope used (`success`, `data`, `meta`, `errors`)
- [ ] 201 Created for resource creation
- [ ] 202 Accepted for async operations
- [ ] 200 OK for successful mutations
- [ ] Consistent field naming (camelCase)
- [ ] Timestamps in ISO 8601 UTC
- [ ] IDs as UUIDs
- [ ] Null fields explicitly included (not omitted)

### 24.5 Pagination Review

- [ ] List endpoints support pagination
- [ ] Default page size is 20
- [ ] Maximum page size is 100
- [ ] Response includes `total`, `page`, `limit`, `hasNext`, `hasPrevious`
- [ ] Empty results return empty array, not null

### 24.6 Filtering Review

- [ ] Exact match filters use query parameters
- [ ] Date range filters use `{field}From`/`{field}To` naming
- [ ] Multiple values use comma separation
- [ ] Full-text search uses `search` parameter

### 24.7 Sorting Review

- [ ] Default sort is `createdAt` descending
- [ ] `sortBy` and `sortOrder` parameters documented
- [ ] Sortable fields explicitly listed
- [ ] Non-sortable fields return 400

### 24.8 Error Review

- [ ] All error responses use standard envelope
- [ ] Error codes are machine-readable
- [ ] Error messages are human-readable
- [ ] Validation errors include field-level details
- [ ] No stack traces in responses
- [ ] No internal implementation details in messages
- [ ] All documented error codes have examples

### 24.9 Security Review

- [ ] Authentication required (except public endpoints)
- [ ] Authorization checked (roles and permissions)
- [ ] Tenant isolation enforced
- [ ] Rate limiting configured
- [ ] Input sanitization implemented
- [ ] Sensitive data not exposed in responses
- [ ] Audit logging configured

### 24.10 Performance Review

- [ ] Response size within limits
- [ ] Caching headers configured
- [ ] Pagination prevents unbounded queries
- [ ] No N+1 query patterns
- [ ] Timeout configured appropriately
- [ ] Indexes support filtered/sorted queries

### 24.11 Documentation Review

- [ ] OpenAPI spec updated
- [ ] Endpoint summary and description provided
- [ ] All parameters documented with examples
- [ ] All response codes documented with examples
- [ ] All error codes documented with examples
- [ ] Security requirements documented

### 24.12 Testing Review

- [ ] Unit tests for service logic
- [ ] Integration tests for API endpoint
- [ ] Validation error tests
- [ ] Authentication/authorization tests
- [ ] Tenant isolation tests
- [ ] Concurrency conflict tests
- [ ] Idempotency tests
- [ ] Contract tests against OpenAPI spec

---

## Appendix A: Complete Error Code Reference

| Code | HTTP Status | Category | Description |
|------|------------|----------|-------------|
| `VALIDATION_ERROR` | 400 | Validation | Request validation failed |
| `VALIDATION_REQUIRED_FIELD` | 400 | Validation | Required field is missing |
| `VALIDATION_INVALID_FORMAT` | 400 | Validation | Field value format is invalid |
| `VALIDATION_INVALID_ENUM` | 400 | Validation | Field value is not a valid enum value |
| `VALIDATION_STRING_TOO_LONG` | 400 | Validation | String exceeds maximum length |
| `VALIDATION_NUMBER_TOO_SMALL` | 400 | Validation | Number is below minimum |
| `VALIDATION_NUMBER_TOO_LARGE` | 400 | Validation | Number exceeds maximum |
| `AUTH_TOKEN_MISSING` | 401 | Authentication | Authorization header is missing |
| `AUTH_TOKEN_INVALID` | 401 | Authentication | Token is malformed or invalid |
| `AUTH_TOKEN_EXPIRED` | 401 | Authentication | Token has expired |
| `AUTH_INVALID_CREDENTIALS` | 401 | Authentication | Email or password is incorrect |
| `AUTH_ACCOUNT_LOCKED` | 401 | Authentication | Account is locked due to failed attempts |
| `FORBIDDEN_INSUFFICIENT_PERMISSIONS` | 403 | Authorization | User lacks required permission |
| `FORBIDDEN_TENANT_MISMATCH` | 403 | Authorization | Resource does not belong to user's tenant |
| `FORBIDDEN_INSTITUTION_MISMATCH` | 403 | Authorization | Resource does not belong to user's institution |
| `FORBIDDEN_ROLE_REQUIRED` | 403 | Authorization | User lacks required role |
| `NOT_FOUND_RESOURCE` | 404 | Resource | Resource does not exist |
| `NOT_FOUND_STUDENT` | 404 | Resource | Student not found |
| `NOT_FOUND_STAFF` | 404 | Resource | Staff not found |
| `NOT_FOUND_ACADEMIC_YEAR` | 404 | Resource | Academic year not found |
| `NOT_FOUND_TERM` | 404 | Resource | Term not found |
| `NOT_FOUND_INVOICE` | 404 | Resource | Invoice not found |
| `NOT_FOUND_PAYMENT` | 404 | Resource | Payment not found |
| `CONFLICT_VERSION_MISMATCH` | 409 | Conflict | Resource has been modified by another user |
| `CONFLICT_DUPLICATE_EMAIL` | 409 | Conflict | Email address already exists |
| `CONFLICT_DUPLICATE_ENTRY` | 409 | Conflict | Duplicate entry violates unique constraint |
| `CONFLICT_LIFECYCLE` | 409 | Conflict | Invalid state transition for entity |
| `BUSINESS_RULE_VIOLATION` | 422 | Business | Business rule validation failed |
| `BUSINESS_INVALID_STATE_TRANSITION` | 422 | Business | Entity cannot transition to requested state |
| `BUSINESS_INSUFFICIENT_BALANCE` | 422 | Business | Insufficient balance for operation |
| `BUSINESS_ENTITY_DEPENDENCY` | 422 | Business | Entity has dependent records |
| `SYSTEM_INTERNAL_ERROR` | 500 | Infrastructure | Unexpected server error |
| `SYSTEM_SERVICE_UNAVAILABLE` | 503 | Infrastructure | Service temporarily unavailable |
| `SYSTEM_DATABASE_ERROR` | 500 | Infrastructure | Database operation failed |
| `SYSTEM_RATE_LIMIT_EXCEEDED` | 429 | Infrastructure | Rate limit exceeded |
| `SYSTEM_REQUEST_TIMEOUT` | 408 | Infrastructure | Request timed out |
| `SYSTEM_PAYLOAD_TOO_LARGE` | 413 | Infrastructure | Request body exceeds size limit |

---

## Appendix B: Standard HTTP Status Codes

| Code | Text | Usage in OpenSchool ERP |
|------|------|------------------------|
| **200** | OK | Successful GET, PUT, PATCH, DELETE |
| **201** | Created | Successful POST (resource created) |
| **202** | Accepted | Async operation accepted for processing |
| **204** | No Content | Successful DELETE with no response body |
| **400** | Bad Request | Validation error, malformed JSON, missing required field |
| **401** | Unauthorized | Missing or invalid authentication token |
| **403** | Forbidden | Authenticated but not authorized for this action |
| **404** | Not Found | Resource does not exist |
| **408** | Request Timeout | Client took too long to send request |
| **409** | Conflict | Version mismatch, duplicate entry, lifecycle violation |
| **413** | Payload Too Large | Request body exceeds size limit |
| **415** | Unsupported Media Type | Content-Type is not application/json |
| **422** | Unprocessable Entity | Semantically invalid (valid JSON, invalid business rules) |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unexpected server error |
| **502** | Bad Gateway | Upstream service error |
| **503** | Service Unavailable | Temporary maintenance or overload |

---

## Appendix C: Standard Response Headers

| Header | Direction | Description |
|--------|-----------|-------------|
| `Content-Type` | Response | Always `application/json` |
| `X-Request-ID` | Request/Response | Unique request identifier |
| `X-Correlation-ID` | Request/Response | Correlation ID for distributed tracing |
| `X-Tenant-ID` | Request | Tenant public identifier |
| `X-Institution-ID` | Request | Institution public identifier |
| `X-Idempotency-Key` | Request | Idempotency key for write operations |
| `If-Match` | Request | Resource version for optimistic concurrency |
| `ETag` | Response | Resource version for conditional requests |
| `Location` | Response | URL of created resource (201 responses) |
| `Retry-After` | Response | Seconds to wait before retry (429 responses) |
| `X-RateLimit-Limit` | Response | Maximum requests per window |
| `X-RateLimit-Remaining` | Response | Requests remaining in current window |
| `X-RateLimit-Reset` | Response | UTC timestamp when window resets |
| `Cache-Control` | Response | Caching directives |
| `Sunset` | Response | Deprecation sunset date |
| `Deprecation` | Response | Deprecation flag |
| `Link` | Response | Related resource links |

---

## 25. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-20 | Initial creation — Platform API Style Guide derived from 01 Engineering Standards and domain specification API contracts |

---

*This document is the authoritative API standard for the OpenSchool ERP platform. Every API developed for OpenSchool ERP must conform to this guide. Changes require architecture review.*



---

# PAGE BREAK

---


# OpenSchool ERP — Development Standards

**Authoritative Reference for All Software Development Practices**

| Aspect | Detail |
|--------|--------|
| **Document ID** | OPS-STD-DEV-005 |
| **Status** | Approved |
| **Version** | 1.0.0 |
| **Date** | 2026-07-20 |
| **Author** | Platform Architecture Team |
| **Supersedes** | None |
| **Review Cycle** | Quarterly |

---

## Document Status

| Status | Description |
|--------|-------------|
| **Draft** | Under active development |
| **Review** | Under architecture review |
| **Approved** | Approved for implementation |
| **Frozen** | Locked for current version |
| **Deprecated** | Pending replacement |

**Current Status:** Approved

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Scope](#2-scope)
3. [Development Philosophy](#3-development-philosophy)
4. [Project Structure](#4-project-structure)
5. [Backend Standards](#5-backend-standards)
6. [Prisma Standards](#6-prisma-standards)
7. [Frontend Standards](#7-frontend-standards)
8. [Shared Component Standards](#8-shared-component-standards)
9. [Validation Standards](#9-validation-standards)
10. [Logging Standards](#10-logging-standards)
11. [Testing Standards](#11-testing-standards)
12. [Documentation Standards](#12-documentation-standards)
13. [Git Standards](#13-git-standards)
14. [Code Review Standards](#14-code-review-standards)
15. [Security Standards](#15-security-standards)
16. [Performance Standards](#16-performance-standards)
17. [Quality Gates](#17-quality-gates)
18. [AI-Assisted Development Standards](#18-ai-assisted-development-standards)
19. [Architecture Decision Records](#19-architecture-decision-records)
20. [Development Review Checklist](#20-development-review-checklist)
21. [Appendix A: File Naming Quick Reference](#appendix-a-file-naming-quick-reference)
22. [Appendix B: Common NestJS Patterns](#appendix-b-common-nestjs-patterns)
23. [Revision History](#21-revision-history)

---

## 1. Purpose

This document is the authoritative software development standard for the OpenSchool ERP platform. Every developer and AI coding assistant contributing to OpenSchool ERP must follow this guide.

This guide defines:

- Coding architecture, project organization, and file structure
- Backend implementation conventions (NestJS, TypeScript, Prisma)
- Frontend implementation conventions (Flutter, Dart)
- Database schema and migration conventions
- Testing strategy, coverage expectations, and test patterns
- Code review standards and quality gates
- Security, performance, and logging practices
- Git workflow and collaboration standards
- AI-assisted development guidelines

This document removes ambiguity from implementation decisions and ensures consistency across all domains.

---

## 2. Scope

### 2.1 Applicability

This guide applies to all software development in OpenSchool ERP:

- **Backend services** — NestJS APIs, domain services, event consumers
- **Frontend applications** — Flutter mobile apps, Next.js web dashboards
- **Shared libraries** — Common utilities, type definitions, validation schemas
- **Database schemas** — Prisma models, migrations, seeds
- **Infrastructure** — Docker configurations, CI/CD pipelines
- **Documentation** — Code comments, API docs, ADRs

### 2.2 Relationship to Other Standards

| Standard | Relationship |
|----------|-------------|
| **01 Engineering Standards** | Defines platform-wide naming, entity, audit, and validation standards. This guide defines implementation patterns that realize those standards. |
| **02 Cross-Domain Integration Specification** | Defines event flows and workflow patterns. This guide defines how to implement event publishers and consumers. |
| **03 Platform Event Catalogue** | Defines event naming and envelope standards. This guide defines how to implement event-emitting services. |
| **04 API Style Guide** | Defines REST contract conventions. This guide defines the controller and service code that fulfills those contracts. |
| **Domain Engineering Specs** | Define domain-specific business rules and entities. This guide governs the code structure that implements those specifications. |

### 2.3 Governance

- All code must conform to this guide before merging to main
- Deviations require architecture review approval
- This guide is maintained by the Platform Architecture Team

---

## 3. Development Philosophy

### 3.1 Core Principles

| Principle | Description | Application |
|-----------|-------------|-------------|
| **Clean Architecture** | Domain logic is independent of infrastructure. Dependencies point inward toward the domain core. | Services depend on interfaces, not implementations. Controllers depend on services, not databases. |
| **Domain-Driven Design** | Every bounded context is self-contained with its own aggregates, services, and persistence. | Finance owns invoicing. People owns student profiles. No domain duplicates another's logic. |
| **SOLID** | Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. | Each service handles one aggregate. Each module owns one responsibility. |
| **DRY** | Don't Repeat Yourself. Shared logic belongs in shared libraries. | Common validators, utilities, and type definitions live in shared packages. |
| **KISS** | Keep It Simple, Stupid. Prefer straightforward solutions over clever abstractions. | Simple code that works is better than complex code that might be faster. |
| **YAGNI** | You Aren't Gonna Need It. Don't build features until they're required. | Implement only what domain specs define. No speculative features. |
| **Separation of Concerns** | Each layer handles one aspect. Controllers handle HTTP. Services handle business logic. Repositories handle data access. | No business logic in controllers. No SQL in controllers. No HTTP concerns in services. |
| **Composition over Inheritance** | Prefer composable utilities and mixins over class hierarchies. | Use function composition and module imports over deep inheritance chains. |
| **Dependency Injection** | Dependencies are declared and injected, not created internally. | Use NestJS DI container. Never use `new` for service instantiation. |
| **Testability** | Code is designed to be testable. Dependencies are mockable. Side effects are isolated. | Services depend on interfaces. External calls are wrapped in injectable clients. |

### 3.2 Implementation Priorities

1. **Correctness** — Code implements domain specs accurately
2. **Readability** — Code is clear and self-documenting
3. **Testability** — Code can be unit and integration tested
4. **Maintainability** — Code is easy to modify and extend
5. **Performance** — Code meets performance requirements (not premature optimization)

### 3.3 What This Philosophy Is Not

- This is not a framework tutorial; it assumes familiarity with NestJS, Prisma, and Flutter
- This is not a design pattern catalog; it specifies which patterns to use where
- This is not an architecture document; domain specs define architecture
- This is an implementation guide; it tells you how to code, not what to build

### 3.4 Technology Stack

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Runtime | Node.js | >=22.0.0 | LTS release |
| Backend Framework | NestJS | ^11.0.0 | Modular monolith architecture |
| ORM | Prisma | ^6.12.0 | Schema-first, one file per domain |
| Language | TypeScript | ^5.8.3 | Strict mode enabled |
| Frontend (Mobile) | Flutter | Latest stable | Dart-based, single codebase |
| Frontend (Web) | Next.js | Latest stable | React-based admin dashboards |
| UI Components | shadcn/ui + Tailwind CSS | Latest stable | For Next.js dashboards |
| Database | PostgreSQL | 16+ | Primary data store |
| Queue | BullMQ | Latest stable | Background job processing |
| Cache | Redis | 7+ | Session, caching, event bus (future) |
| Containerization | Docker | Latest stable | Development and deployment |
| Object Storage | S3-compatible | — | File uploads, documents |
| CI/CD | GitHub Actions | Latest stable | Build, test, deploy pipelines |
| Validation | class-validator + class-transformer | Latest stable | DTO validation |
| Testing | Jest | ^30.0.0 | Unit and integration testing |
| API Documentation | Swagger/OpenAPI | ^7.0.0 | Auto-generated from decorators |
| Authentication | JWT + bcrypt | — | Token-based authentication |

### 3.5 Architecture Style

OpenSchool ERP uses a **Modular Monolith** architecture:

| Property | Description |
|----------|-------------|
| Module isolation | Each domain is a NestJS module with its own controllers, services, and repositories |
| Shared database | All domains share a single PostgreSQL database |
| Schema separation | Each domain has its own Prisma schema file; merged at build time |
| In-process events | EventEmitter2 for cross-domain communication (no external message broker in V1) |
| API gateway | Single NestJS application serves all domain APIs |
| Future migration | Designed for extraction into services if scaling requires it |

---

## 4. Project Structure

### 4.1 Monorepo Layout

```
openschool-erp/
├── apps/
│   ├── backend/                    # NestJS API application
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── domains/            # Domain modules
│   │   │   ├── shared/             # Shared libraries
│   │   │   └── config/             # Configuration
│   │   ├── test/                   # Integration tests
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── mobile/                     # Flutter application
│   │   ├── lib/
│   │   │   ├── main.dart
│   │   │   ├── app/
│   │   │   ├── features/
│   │   │   ├── shared/
│   │   │   └── core/
│   │   ├── test/
│   │   ├── pubspec.yaml
│   │   └── Dockerfile
│   └── web/                        # Next.js admin dashboard
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── lib/
│       │   └── types/
│       ├── public/
│       ├── package.json
│       └── Dockerfile
├── packages/
│   ├── shared-types/               # Shared TypeScript types
│   ├── shared-validation/          # Shared validation schemas
│   └── shared-utils/               # Shared utility functions
├── prisma/
│   ├── schemas/                    # Per-domain Prisma schemas
│   │   ├── identity.prisma
│   │   ├── institution.prisma
│   │   ├── people.prisma
│   │   ├── academics.prisma
│   │   ├── finance.prisma
│   │   ├── communication.prisma
│   │   ├── operations.prisma
│   │   ├── documents.prisma
│   │   ├── analytics.prisma
│   │   └── platform.prisma
│   ├── migrations/
│   └── seed.ts
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── nginx.conf
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── release.yml
├── docs/
│   ├── adr/
│   └── api/
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── README.md
```

### 4.2 Backend Directory Structure

```
apps/backend/src/
├── main.ts                         # Application entry point
├── app.module.ts                   # Root module
├── config/
│   ├── configuration.ts            # Environment configuration
│   ├── validation.schema.ts        # Config validation
│   └── constants.ts                # Application constants
├── domains/
│   ├── identity/
│   │   ├── identity.module.ts      # Domain module definition
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── user.service.ts
│   │   ├── repositories/
│   │   │   ├── user.repository.ts
│   │   │   └── role.repository.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── permission.guard.ts
│   │   ├── interceptors/
│   │   │   └── audit.interceptor.ts
│   │   ├── filters/
│   │   │   └── identity-exception.filter.ts
│   │   ├── events/
│   │   │   ├── user-created.event.ts
│   │   │   └── user-created.handler.ts
│   │   ├── consumers/
│   │   │   └── password-reset.handler.ts
│   │   ├── jobs/
│   │   │   └── send-invitation.job.ts
│   │   └── __tests__/
│   │       ├── auth.service.spec.ts
│   │       ├── user.controller.spec.ts
│   │       └── user.repository.spec.ts
│   ├── institution/
│   │   └── ... (same structure)
│   ├── people/
│   │   └── ... (same structure)
│   ├── academics/
│   │   └── ... (same structure)
│   ├── finance/
│   │   └── ... (same structure)
│   ├── communication/
│   │   └── ... (same structure)
│   ├── operations/
│   │   └── ... (same structure)
│   ├── documents/
│   │   └── ... (same structure)
│   ├── analytics/
│   │   └── ... (same structure)
│   └── platform/
│       └── ... (same structure)
└── shared/
    ├── decorators/
    │   ├── current-user.decorator.ts
    │   ├── tenant-id.decorator.ts
    │   └── public-id.decorator.ts
    ├── interceptors/
    │   ├── correlation-id.interceptor.ts
    │   ├── response-transform.interceptor.ts
    │   └── logging.interceptor.ts
    ├── filters/
    │   └── global-exception.filter.ts
    ├── guards/
    │   ├── tenant.guard.ts
    │   └── rate-limit.guard.ts
    ├── pipes/
    │   ├── validation.pipe.ts
    │   └── parse-uuid.pipe.ts
    ├── interfaces/
    │   ├── repository.interface.ts
    │   ├── event-publisher.interface.ts
    │   └── service.interface.ts
    ├── utils/
    │   ├── id-generator.ts
    │   ├── date-utils.ts
    │   └── encryption.ts
    └── types/
        ├── domain.types.ts
        ├── event.types.ts
        └── api.types.ts
```

### 4.3 Frontend Directory Structure (Flutter)

```
apps/mobile/lib/
├── main.dart                       # Application entry point
├── app/
│   ├── app.dart                    # MaterialApp configuration
│   ├── router.dart                 # Route definitions
│   ├── theme.dart                  # Theme configuration
│   └── constants.dart              # App constants
├── core/
│   ├── network/
│   │   ├── api_client.dart         # HTTP client configuration
│   │   ├── interceptors.dart       # Auth, logging interceptors
│   │   └── endpoints.dart          # API endpoint constants
│   ├── storage/
│   │   └── secure_storage.dart     # Token storage
│   ├── error/
│   │   ├── failures.dart           # Failure types
│   │   └── exceptions.dart         # Exception types
│   └── utils/
│       ├── validators.dart         # Form validators
│       ├── formatters.dart         # Date/number formatters
│       └── extensions.dart         # Extension methods
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── user_model.dart
│   │   │   ├── datasources/
│   │   │   │   └── auth_remote_datasource.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/
│   │   │       ├── login.dart
│   │   │       └── logout.dart
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── auth_bloc.dart
│   │       │   ├── auth_event.dart
│   │       │   └── auth_state.dart
│   │       ├── pages/
│   │       │   ├── login_page.dart
│   │       │   └── forgot_password_page.dart
│   │       └── widgets/
│   │           ├── login_form.dart
│   │           └── password_field.dart
│   ├── students/
│   │   └── ... (same structure)
│   ├── finance/
│   │   └── ... (same structure)
│   └── ...
├── shared/
│   ├── widgets/
│   │   ├── app_bar.dart
│   │   ├── loading_indicator.dart
│   │   ├── error_widget.dart
│   │   ├── empty_state.dart
│   │   └── confirm_dialog.dart
│   ├── models/
│   │   └── paginated_response.dart
│   └── extensions/
│       └── context_extensions.dart
└── generated/
    └── assets.gen.dart             # Generated asset references
```

### 4.4 Layer Responsibilities

| Layer | Responsibility | Dependencies |
|-------|---------------|-------------|
| **Controller** | Handle HTTP request/response, validate input, delegate to service | Service |
| **Service** | Execute business logic, orchestrate domain operations | Repository, EventPublisher |
| **Repository** | Abstract data access, translate between ORM and domain entities | Prisma Client |
| **DTO** | Define request/response shapes, validation rules | None (pure data) |
| **Entity** | Represent domain objects | None (pure data) |
| **Guard** | Enforce authentication and authorization | JWT service, Permission service |
| **Interceptor** | Cross-cutting concerns (logging, correlation, audit) | Logger |
| **Filter** | Handle and transform exceptions | Logger |
| **Event** | Represent something that happened in the domain | None (pure data) |
| **Handler** | React to events (side effects, cross-domain updates) | Service, Repository |
| **Job** | Define background task structure | Service |

### 4.5 Dependency Flow

```
HTTP Request
    ↓
Controller (input validation, response formatting)
    ↓
Service (business logic, orchestration)
    ↓
Repository (data access abstraction)
    ↓
Prisma Client (ORM)
    ↓
PostgreSQL (database)
```

**Rules:**

| Rule | Description |
|------|-------------|
| Unidirectional | Dependencies flow downward; never upward |
| No skip layers | Controllers never call repositories directly |
| No cross-domain DB | Services never query another domain's tables |
| Interface boundaries | Services depend on repository interfaces, not implementations |
| DI injection | All dependencies are injected via NestJS DI container |

---

## 5. Backend Standards

### 5.1 Module Structure

Every domain is a NestJS module with a consistent internal structure:

```typescript
// identity.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';

@Module({
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService, UserRepository, RoleRepository],
  exports: [AuthService, UserService],
})
export class IdentityModule {}
```

**Module rules:**

| Rule | Description |
|------|-------------|
| One module per domain | Each domain gets its own NestJS module |
| Explicit exports | Only export services needed by other domains |
| No circular dependencies | Domains must not depend on each other in both directions |
| Root module registration | Domain modules registered in `AppModule` |

### 5.2 Controllers

Controllers handle HTTP concerns only. No business logic in controllers.

```typescript
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { TenantId } from '../../shared/decorators/tenant-id.decorator';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/v1/identity/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Duplicate email' })
  async create(
    @TenantId() tenantId: string,
    @Body() dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findOne(tenantId, id);
  }
}
```

**Controller rules:**

| Rule | Description |
|------|-------------|
| No business logic | Controllers delegate to services immediately |
| Input validation | Use DTOs with class-validator decorators |
| Response formatting | Return DTOs, not raw database entities |
| Swagger decorators | Every endpoint has `@ApiOperation`, `@ApiResponse` |
| Guard usage | `@UseGuards` for authentication and authorization |
| Parameter extraction | Use custom decorators for `tenantId`, `userId`, etc. |
| Error handling | Let exceptions propagate to global exception filter |

### 5.3 Services

Services contain all business logic. They orchestrate domain operations.

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { EventPublisher } from '../../shared/interfaces/event-publisher.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async create(tenantId: string, dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(tenantId, dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.userRepository.create(tenantId, {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    await this.eventPublisher.publish('identity.UserCreated', {
      aggregateId: user.id,
      tenantId,
      payload: { email: user.email, firstName: user.firstName },
    });

    return UserResponseDto.fromEntity(user);
  }

  async findOne(tenantId: string, id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(tenantId, id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} was not found`);
    }
    return UserResponseDto.fromEntity(user);
  }
}
```

**Service rules:**

| Rule | Description |
|------|-------------|
| Injectable | Always decorated with `@Injectable()` |
| Single responsibility | One service per aggregate or bounded capability |
| No HTTP concerns | Services never reference Request/Response objects |
| No database queries | Services call repositories, not Prisma client directly |
| Business validation | Services enforce business rules; DTOs enforce structural validation |
| Event publishing | Services publish events after successful state changes |
| Error propagation | Services throw domain-specific exceptions |
| DTO conversion | Services return DTOs, not raw entities |

### 5.4 Repositories

Repositories abstract data access. They translate between Prisma and domain entities.

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/services/prisma.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        tenantId,
        publicId: generatePublicId(),
      },
    });
  }

  async findById(tenantId: string, id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async findByEmail(tenantId: string, email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, tenantId, deletedAt: null },
    });
  }
}
```

**Repository rules:**

| Rule | Description |
|------|-------------|
| Injectable | Always decorated with `@Injectable()` |
| Tenant scoping | Every query includes `tenantId` in the WHERE clause |
| Soft delete filter | Every query includes `deletedAt: null` |
| No business logic | Repositories only handle data access |
| Return entities | Repositories return domain entities, not raw Prisma types |
| One repository per aggregate | One repository class per domain aggregate |

### 5.5 DTOs (Data Transfer Objects)

DTOs define request and response shapes with validation:

```typescript
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;
}
```

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.publicId;
    dto.email = entity.email;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.status = entity.status;
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
```

**DTO rules:**

| Rule | Description |
|------|-------------|
| Separate DTOs | Create, Update, and Response DTOs are separate classes |
| Validation decorators | Every field has appropriate class-validator decorators |
| Swagger decorators | Every field has `@ApiProperty` for documentation |
| No database IDs | Response DTOs use `publicId`, not database `id` |
| Static factory | Response DTOs include `fromEntity()` static method |
| No nested entities | Response DTOs return flat structures; nested data via separate endpoints |

### 5.6 Guards

Guards enforce authentication and authorization:

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../services/permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return this.permissionService.hasPermissions(user.id, requiredPermissions);
  }
}
```

**Guard rules:**

| Rule | Description |
|------|-------------|
| Composable | Guards are composable via `@UseGuards` |
| Single purpose | One guard per concern (auth, permission, tenant) |
| Fast execution | Guards must not make expensive database queries |
| Clear errors | Guards throw 401 or 403 with descriptive messages |

### 5.7 Interceptors

Interceptors handle cross-cutting concerns:

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggingService } from '../../shared/services/logging.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const userId = request.user?.id;
    const tenantId = request.user?.tenantId;

    return next.handle().pipe(
      tap(() => {
        this.loggingService.log({
          category: 'audit',
          method,
          url,
          userId,
          tenantId,
          timestamp: new Date().toISOString(),
        });
      }),
    );
  }
}
```

### 5.8 Exception Filters

Global exception filter transforms errors into standard API responses:

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const correlationId = request.headers['x-correlation-id'] || generateId();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      response.status(status).json({
        success: false,
        data: null,
        meta: { correlationId, requestId: request.id },
        errors: Array.isArray(exceptionResponse)
          ? exceptionResponse
          : [{ code: exception.name, message: exception.message }],
      });
    } else {
      this.logger.error('Unhandled exception', exception);
      response.status(500).json({
        success: false,
        data: null,
        meta: { correlationId, requestId: request.id },
        errors: [{ code: 'SYSTEM_INTERNAL_ERROR', message: 'An unexpected error occurred' }],
      });
    }
  }
}
```

### 5.9 Dependency Injection

All dependencies are injected via NestJS DI container:

| Rule | Description |
|------|-------------|
| Constructor injection | Use constructor parameters with `@Inject()` or type inference |
| No `new` for services | Never instantiate services manually |
| No static method calls | Services use instance methods, not static methods |
| Interface binding | Bind interfaces using `useClass` or `useFactory` providers |
| Scoped providers | Use `@Injectable()` with default scope (singleton) |

### 5.10 Configuration

Environment configuration uses `@nestjs/config`:

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
}));
```

**Configuration rules:**

| Rule | Description |
|------|-------------|
| Environment variables | All secrets and environment-specific values from env vars |
| No hardcoded secrets | Never commit secrets to source code |
| Validation | Validate configuration on application startup |
| Type safety | Use typed configuration objects |
| Defaults | Provide sensible defaults for non-critical values |

### 5.11 Background Jobs

Background jobs use BullMQ with NestJS integration:

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email')
export class EmailConsumer {
  @Process('send-invitation')
  async handleSendInvitation(job: Job<{ userId: string; email: string }>) {
    const { userId, email } = job.data;
    // Send invitation email
    return { success: true };
  }
}
```

**Job rules:**

| Rule | Description |
|------|-------------|
| Named jobs | Every job has a descriptive name |
| Typed data | Job data is strongly typed |
| Error handling | Failed jobs are retried with exponential backoff |
| Logging | Job start, completion, and failure are logged |
| Timeout | Jobs have maximum execution time (default: 5 minutes) |

### 5.12 Event Publishing

Events are published after transaction commit:

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly userRepository: UserRepository,
  ) {}

  async create(tenantId: string, dto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(tenantId, dto);

    this.eventEmitter.emit('identity.UserCreated', {
      eventId: generateEventId(),
      eventName: 'identity.UserCreated',
      eventVersion: 1,
      schemaVersion: '1.0.0',
      occurredAt: new Date().toISOString(),
      correlationId: generateId(),
      causationId: null,
      tenantId,
      institutionId: null,
      aggregateId: user.publicId,
      aggregateType: 'User',
      sourceDomain: 'identity',
      actorId: dto.createdBy,
      payload: { email: user.email, firstName: user.firstName },
    });

    return user;
  }
}
```

**Event publishing rules:**

| Rule | Description |
|------|-------------|
| After commit | Events published after database commit succeeds |
| Full envelope | Events carry complete envelope (see 03 Platform Event Catalogue) |
| One event per change | One event per state change, not one per batch |
| Failure isolation | Event publishing failure does not roll back the transaction |
| Logging | Event publication is logged for debugging |

### 5.13 Transactions

Single-domain transactions use Prisma interactive transactions:

```typescript
async enrollStudent(tenantId: string, dto: EnrollStudentDto): Promise<Enrollment> {
  return this.prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: dto.studentId, tenantId },
    });

    const enrollment = await tx.enrollment.create({
      data: {
        studentId: dto.studentId,
        classId: dto.classId,
        academicYearId: dto.academicYearId,
        tenantId,
        status: 'ACTIVE',
      },
    });

    return enrollment;
  });
}
```

**Transaction rules:**

| Rule | Description |
|------|-------------|
| Single-domain only | Transactions span only one domain's tables |
| Interactive transactions | Use Prisma's `$transaction` for multi-query atomicity |
| No cross-domain transactions | Cross-domain consistency via events, not transactions |
| Short-lived | Transactions must be short; no external calls inside transactions |
| Error handling | Rollback on any error within the transaction |

### 5.14 Logging

Structured logging using NestJS Logger:

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async create(tenantId: string, dto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user for tenant ${tenantId}`);

    try {
      const user = await this.userRepository.create(tenantId, dto);
      this.logger.log(`User created: ${user.publicId}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user`, error.stack);
      throw error;
    }
  }
}
```

**Logging rules:**

| Rule | Description |
|------|-------------|
| Structured | Log objects, not concatenated strings |
| Context name | Every logger has a context name (class name) |
| Correlation ID | Include correlation ID in all log entries |
| Sensitive data | Never log passwords, tokens, or PII |
| Levels | Use appropriate levels: log, warn, error, debug |

See [Section 10: Logging Standards](#10-logging-standards) for comprehensive logging guidance.

---

## 6. Prisma Standards

### 6.1 Schema Organization

One Prisma schema file per domain, merged at build time:

```
prisma/
├── schemas/
│   ├── identity.prisma
│   ├── institution.prisma
│   ├── people.prisma
│   ├── academics.prisma
│   ├── finance.prisma
│   ├── communication.prisma
│   ├── operations.prisma
│   ├── documents.prisma
│   ├── analytics.prisma
│   └── platform.prisma
├── migrations/
├── schema.prisma              # Merged schema (generated)
└── seed.ts
```

**Merge rules:**

| Rule | Description |
|------|-------------|
| One file per domain | Each domain owns its own `.prisma` file |
| No cross-file references | Domain schemas are independent |
| Merge script | Build script merges all files into `schema.prisma` |
| No manual edits | Never edit `schema.prisma` directly |

### 6.2 Model Naming

Follow naming conventions from 01 Engineering Standards Section 3.2:

| Element | Convention | Example |
|---------|-----------|---------|
| Model name | PascalCase, singular | `Student`, `AcademicYear`, `InvoiceItem` |
| Field name | camelCase | `firstName`, `academicYearId`, `createdAt` |
| Table name | snake_case, plural | `students`, `academic_years`, `invoice_items` |
| Enum name | PascalCase | `StudentStatus`, `InvoiceStatus` |
| Enum value | SCREAMING_SNAKE_CASE | `ACTIVE`, `GRADUATED`, `OVERDUE` |

### 6.3 Model Example

```prisma
model Student {
  id            String   @id @default(uuid())
  publicId      String   @unique
  tenantId      String
  institutionId String?
  firstName     String   @db.VarChar(100)
  lastName      String   @db.VarChar(100)
  email         String?  @db.VarChar(255)
  dateOfBirth   DateTime @db.Date
  status        StudentStatus @default(ACTIVE)
  version       Int      @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdBy     String?
  updatedBy     String?
  deletedAt     DateTime?
  deletedBy     String?

  // Relations
  enrollments   Enrollment[]

  // Indexes
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, email])
  @@map("students")
}

enum StudentStatus {
  ACTIVE
  INACTIVE
  GRADUATED
  WITHDRAWN
  TRANSFERRED
}
```

### 6.4 Field Standards

| Standard | Description |
|----------|-------------|
| Primary key | `id String @id @default(uuid())` — always UUID |
| Public ID | `publicId String @unique` — business-facing identifier |
| Tenant ID | `tenantId String` — mandatory for all tenant-scoped entities |
| Institution ID | `institutionId String?` — optional for institution-scoped entities |
| Version | `version Int @default(1)` — optimistic concurrency control |
| Timestamps | `createdAt`, `updatedAt` — standard Prisma timestamps |
| Audit fields | `createdBy`, `updatedBy` — who made changes |
| Soft delete | `deletedAt DateTime?`, `deletedBy String?` — soft delete pattern |
| String length | Use `@db.VarChar(N)` for strings with length constraints |
| Decimal precision | Use `Decimal` for monetary values; specify precision |

### 6.5 Relations

| Pattern | Description |
|---------|-------------|
| One-to-many | Parent has `[]`, child has optional parent reference |
| Many-to-many | Use explicit join table (no implicit many-to-many) |
| Cross-domain | No Prisma relations; application-level guards |
| Cascade | Use `Restrict` for delete; never cascade across domains |

**One-to-many example:**

```prisma
model AcademicYear {
  id     String   @id @default(uuid())
  // ... fields
  terms  Term[]
}

model Term {
  id              String  @id @default(uuid())
  academicYearId  String
  academicYear    AcademicYear @relation(fields: [academicYearId], references: [id])
  // ... fields

  @@index([academicYearId])
}
```

### 6.6 Indexes

| Rule | Description |
|------|-------------|
| Tenant ID | Every tenant-scoped model has `@@index([tenantId])` |
| Foreign keys | Every foreign key field has `@@index([field])` |
| Composite | Frequently queried combinations get composite indexes |
| Unique constraints | Use `@unique` for natural unique keys |
| Performance | Indexes support WHERE, ORDER BY, and JOIN operations |

**Index naming convention:**

```prisma
@@index([tenantId, status])       // Composite index
@@index([tenantId, createdAt])    // Sort index
@@index([academicYearId])          // FK index
@@unique([tenantId, email])        // Unique constraint
```

### 6.7 Migrations

| Rule | Description |
|------|-------------|
| Descriptive names | Migration names describe the change: `add-student-email-index` |
| Backward compatible | Migrations must not break existing data |
| Reversible | Prefer reversible migrations when possible |
| Review required | All migrations require code review before applying |
| Production safety | Test migrations on staging before production |

### 6.8 Seeding

```typescript
// seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default tenant
  await prisma.tenant.create({
    data: {
      name: 'Default Institution',
      slug: 'default',
      status: 'ACTIVE',
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Seeding rules:**

| Rule | Description |
|------|-------------|
| Idempotent | Seeds can be run multiple times without errors |
| Deterministic | Same seeds produce same data |
| Development only | Production seeding requires explicit approval |
| No secrets | Seed data never contains real credentials |

### 6.9 Query Optimization

| Pattern | Description |
|---------|-------------|
| Select specific fields | Use `select` to return only needed fields |
| Avoid N+1 | Use `include` for eager loading related data |
| Pagination | Always use `take` and `skip` for list queries |
| Filtering | Use `where` clauses that leverage indexes |
| Ordering | Use indexed fields for `orderBy` |

**N+1 prevention:**

```typescript
// BAD — N+1 queries
const students = await this.prisma.student.findMany({ where: { tenantId } });
for (const student of students) {
  student.enrollments = await this.prisma.enrollment.findMany({
    where: { studentId: student.id },
  });
}

// GOOD — Single query with include
const students = await this.prisma.student.findMany({
  where: { tenantId },
  include: { enrollments: true },
});
```

---

## 7. Frontend Standards

### 7.1 Architecture

Flutter applications follow a feature-first architecture with clean architecture layers:

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | UI widgets, BLoC state management | `features/{name}/presentation/` |
| **Domain** | Entities, repositories (interfaces), use cases | `features/{name}/domain/` |
| **Data** | Models, datasources, repository implementations | `features/{name}/data/` |
| **Core** | Network, storage, error handling, utilities | `core/` |
| **Shared** | Reusable widgets, models, extensions | `shared/` |

### 7.2 Feature Module Structure

Each feature follows the same internal structure:

```
features/auth/
├── data/
│   ├── models/
│   │   └── user_model.dart              # API response model
│   ├── datasources/
│   │   └── auth_remote_datasource.dart   # API client calls
│   └── repositories/
│       └── auth_repository_impl.dart     # Repository implementation
├── domain/
│   ├── entities/
│   │   └── user.dart                     # Domain entity
│   ├── repositories/
│   │   └── auth_repository.dart          # Repository interface
│   └── usecases/
│       ├── login.dart                    # Business operation
│       └── logout.dart
└── presentation/
    ├── bloc/
    │   ├── auth_bloc.dart                # State management
    │   ├── auth_event.dart               # Events
    │   └── auth_state.dart               # States
    ├── pages/
    │   ├── login_page.dart               # Screen widgets
    │   └── forgot_password_page.dart
    └── widgets/
        ├── login_form.dart               # Reusable widgets
        └── password_field.dart
```

### 7.3 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Feature name | snake_case | `auth`, `student_management`, `fee_collection` |
| Page file | `{name}_page.dart` | `login_page.dart`, `student_list_page.dart` |
| Widget file | `{name}_widget.dart` | `login_form.dart`, `password_field.dart` |
| BLoC file | `{name}_bloc.dart` | `auth_bloc.dart`, `student_bloc.dart` |
| Entity file | `{name}.dart` | `user.dart`, `student.dart` |
| Model file | `{name}_model.dart` | `user_model.dart`, `student_model.dart` |
| Datasource file | `{name}_datasource.dart` | `auth_remote_datasource.dart` |
| Repository file | `{name}_repository_impl.dart` | `auth_repository_impl.dart` |

### 7.4 State Management (BLoC)

All state management uses BLoC (Business Logic Component):

```dart
// auth_bloc.dart
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase loginUseCase;
  final LogoutUseCase logoutUseCase;

  AuthBloc({
    required this.loginUseCase,
    required this.logoutUseCase,
  }) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await loginUseCase(
        LoginParams(email: event.email, password: event.password),
      );
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }
}
```

**BLoC rules:**

| Rule | Description |
|------|-------------|
| One BLoC per feature | Each feature has its own BLoC |
| Typed events | Events are strongly typed classes |
| Typed states | States are strongly typed classes |
| Initial state | Every BLoC starts with an Initial state |
| Loading state | Every async operation shows Loading state |
| Error state | Every error is caught and emits Error state |
| No UI logic | BLoCs contain no UI code |

### 7.5 Navigation

Navigation uses named routes with a central router:

```dart
// router.dart
class AppRouter {
  static const String login = '/login';
  static const String home = '/home';
  static const String students = '/students';
  static const String studentDetail = '/students/:id';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case login:
        return MaterialPageRoute(builder: (_) => LoginPage());
      case home:
        return MaterialPageRoute(builder: (_) => HomePage());
      case students:
        return MaterialPageRoute(builder: (_) => StudentListPage());
      case studentDetail:
        final id = settings.arguments as String;
        return MaterialPageRoute(builder: (_) => StudentDetailPage(id: id));
      default:
        return MaterialPageRoute(builder: (_) => LoginPage());
    }
  }
}
```

### 7.6 API Client

API client uses Dio with interceptors:

```dart
class ApiClient {
  late final Dio _dio;

  ApiClient({required String baseUrl, required SecureStorage storage}) {
    _dio = Dio(BaseOptions(baseUrl: baseUrl));
    _dio.interceptors.add(AuthInterceptor(storage: storage));
    _dio.interceptors.add(LoggingInterceptor());
    _dio.interceptors.add(CorrelationInterceptor());
  }

  Future<Response> get(String path, {Map<String, dynamic>? query}) {
    return _dio.get(path, queryParameters: query);
  }

  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }
}
```

### 7.7 Error Handling

```dart
// failures.dart
abstract class Failure {
  final String message;
  const Failure({required this.message});
}

class ServerFailure extends Failure {
  const ServerFailure({required super.message});
}

class NetworkFailure extends Failure {
  const NetworkFailure({required super.message});
}

class CacheFailure extends Failure {
  const CacheFailure({required super.message});
}
```

**Error handling rules:**

| Rule | Description |
|------|-------------|
| Failure types | All errors mapped to typed Failure objects |
| User-friendly messages | Display human-readable error messages |
| Retry options | Provide retry button for network errors |
| Graceful degradation | Show cached data when available |

### 7.8 Loading States

Every async operation follows the pattern:

```dart
class StudentListPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<StudentBloc, StudentState>(
      builder: (context, state) {
        if (state is StudentLoading) {
          return const LoadingIndicator();
        }
        if (state is StudentError) {
          return ErrorWidget(message: state.message);
        }
        if (state is StudentLoaded && state.students.isEmpty) {
          return const EmptyState(message: 'No students found');
        }
        if (state is StudentLoaded) {
          return StudentList(students: state.students);
        }
        return const SizedBox.shrink();
      },
    );
  }
}
```

**Loading state rules:**

| Rule | Description |
|------|-------------|
| Loading indicator | Show progress indicator during async operations |
| Empty state | Show friendly empty state when no data |
| Error state | Show error message with retry option |
| Skeleton loading | Use skeleton placeholders for list items |

### 7.9 Form Validation

```dart
class LoginForm extends StatefulWidget {
  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            decoration: const InputDecoration(labelText: 'Email'),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Email is required';
              }
              if (!value.contains('@')) {
                return 'Invalid email format';
              }
              return null;
            },
          ),
          ElevatedButton(
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                // Submit
              }
            },
            child: const Text('Login'),
          ),
        ],
      ),
    );
  }
}
```

### 7.10 Responsive Design

| Breakpoint | Width | Strategy |
|-----------|-------|----------|
| Mobile | < 600px | Single column, bottom navigation |
| Tablet | 600–1200px | Two columns, side navigation |
| Desktop | > 1200px | Three columns, persistent side navigation |

### 7.11 Localization

```dart
// Using flutter_localizations
MaterialApp(
  localizationsDelegates: [
    AppLocalizations.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ],
  supportedLocales: [
    Locale('en', 'US'),
    Locale('fr', 'FR'),
    Locale('ar', 'SA'),
  ],
);
```

### 7.12 Theming

```dart
class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF1A73E8),
      brightness: Brightness.light,
    ),
    // ... additional theme configuration
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF1A73E8),
      brightness: Brightness.dark,
    ),
  );
}
```

---

## 8. Shared Component Standards

### 8.1 Shared Widget Principles

| Principle | Description |
|-----------|-------------|
| Single purpose | Each widget does one thing well |
| Configurable | Widgets accept parameters for customization |
| Themeable | Widgets use theme colors and styles |
| Accessible | Widgets follow accessibility guidelines |
| Tested | Widgets have unit and widget tests |

### 8.2 Standard Shared Widgets

| Widget | Purpose | Location |
|--------|---------|----------|
| `AppButton` | Standard button with loading state | `shared/widgets/app_button.dart` |
| `AppTextField` | Standard text field with validation | `shared/widgets/app_text_field.dart` |
| `LoadingIndicator` | Centered progress indicator | `shared/widgets/loading_indicator.dart` |
| `ErrorWidget` | Error display with retry | `shared/widgets/error_widget.dart` |
| `EmptyState` | Empty state with message | `shared/widgets/empty_state.dart` |
| `ConfirmDialog` | Confirmation dialog | `shared/widgets/confirm_dialog.dart` |
| `PaginatedList` | List with pagination controls | `shared/widgets/paginated_list.dart` |
| `SearchBar` | Search input with debounce | `shared/widgets/search_bar.dart` |
| `FilterChip` | Filter selection chips | `shared/widgets/filter_chip.dart` |
| `StatusBadge` | Status indicator badge | `shared/widgets/status_badge.dart` |

### 8.3 Widget Composition

```dart
class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool isLoading;
  final ButtonType type;
  final IconData? icon;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.type = ButtonType.primary,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      child: isLoading
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 18),
                  const SizedBox(width: 8),
                ],
                Text(label),
              ],
            ),
    );
  }
}
```

### 8.4 Widget Documentation

Every shared widget must have:

```dart
/// A standard button component for the OpenSchool ERP application.
///
/// Supports primary, secondary, and danger button types.
/// Shows a loading indicator when [isLoading] is true.
///
/// Example:
/// ```dart
/// AppButton(
///   label: 'Save',
///   onPressed: () => save(),
///   isLoading: isSaving,
/// )
/// ```
class AppButton extends StatelessWidget { ... }
```

### 8.5 Widget Testing

Every shared widget must have widget tests:

```dart
void main() {
  group('AppButton', () {
    testWidgets('should render label', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: AppButton(label: 'Save', onPressed: () {}),
        ),
      );
      expect(find.text('Save'), findsOneWidget);
    });

    testWidgets('should show loading when isLoading is true', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: AppButton(
            label: 'Save',
            onPressed: () {},
            isLoading: true,
          ),
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('should call onPressed when tapped', (tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        MaterialApp(
          home: AppButton(
            label: 'Save',
            onPressed: () => pressed = true,
          ),
        ),
      );
      await tester.tap(find.text('Save'));
      expect(pressed, isTrue);
    });
  });
}
```

---

## 9. Validation Standards

### 9.1 Validation Layers

| Layer | Where | What | Example |
|-------|-------|------|---------|
| **DTO Validation** | Controller | Structural validation (types, formats, lengths) | `@IsEmail()`, `@MinLength(2)` |
| **Business Validation** | Service | Business rules (state transitions, uniqueness) | "Cannot deactivate active students" |
| **Domain Validation** | Domain | Domain invariants (aggregate consistency) | "Invoice total must equal sum of items" |
| **Database Validation** | Prisma | Constraints (unique, not null, foreign keys) | `@unique`, `@db.VarChar(100)` |
| **Client Validation** | Frontend | UX validation (immediate feedback) | Form field validators in Flutter |

### 9.2 DTO Validation (Backend)

Use class-validator decorators on DTOs:

```typescript
import { IsString, IsEmail, IsEnum, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsEnum(StudentStatus)
  status: StudentStatus;

  @IsUUID()
  classId: string;
}
```

**Common validators:**

| Decorator | Purpose |
|-----------|---------|
| `@IsString()` | Must be a string |
| `@IsEmail()` | Must be a valid email |
| `@IsNumber()` | Must be a number |
| `@IsBoolean()` | Must be a boolean |
| `@IsEnum()` | Must be a valid enum value |
| `@IsUUID()` | Must be a valid UUID |
| `@MinLength(N)` | Minimum string length |
| `@MaxLength(N)` | Maximum string length |
| `@Min(N)` | Minimum numeric value |
| `@Max(N)` | Maximum numeric value |
| `@IsOptional()` | Field is optional |
| `@IsDateString()` | Must be a valid ISO date string |
| `@ValidateNested()` | Validate nested objects |
| `@IsArray()` | Must be an array |
| `@ArrayMaxSize(N)` | Maximum array length |

### 9.3 Business Validation (Services)

Business validation in services uses domain-specific exceptions:

```typescript
async sendInvoice(tenantId: string, invoiceId: string): Promise<void> {
  const invoice = await this.invoiceRepository.findById(tenantId, invoiceId);

  if (!invoice) {
    throw new NotFoundException('Invoice not found');
  }

  if (invoice.status !== 'DRAFT') {
    throw new ConflictException('Cannot send invoice in DRAFT status. Invoice must be finalized first.');
  }

  if (invoice.items.length === 0) {
    throw new BadRequestException('Cannot send invoice with no items');
  }

  await this.invoiceRepository.updateStatus(tenantId, invoiceId, 'SENT');
}
```

### 9.4 Validation Response Format

Validation errors return structured responses per 04 API Style Guide:

```json
{
  "success": false,
  "data": null,
  "meta": { "correlationId": "..." },
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Request validation failed",
      "details": [
        { "field": "email", "message": "Email is required", "rejectedValue": null },
        { "field": "firstName", "message": "First name must be at least 2 characters", "rejectedValue": "J" }
      ]
    }
  ]
}
```

### 9.5 Client Validation (Flutter)

```dart
String? validateEmail(String? value) {
  if (value == null || value.isEmpty) {
    return 'Email is required';
  }
  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
    return 'Invalid email format';
  }
  return null;
}

String? validateRequired(String? value, String fieldName) {
  if (value == null || value.trim().isEmpty) {
    return '$fieldName is required';
  }
  return null;
}
```

**Client validation rules:**

| Rule | Description |
|------|-------------|
| Mirror backend | Client validators mirror backend DTO validators |
| Immediate feedback | Validate on field blur, not just on submit |
| Clear messages | Show human-readable error messages |
| Not authoritative | Client validation is UX only; server is authoritative |

---

## 10. Logging Standards

### 10.1 Log Levels

| Level | When to Use | Example |
|-------|------------|---------|
| **ERROR** | Unrecoverable errors requiring attention | Database connection failed, unhandled exception |
| **WARN** | Recoverable issues that may need attention | Rate limit approaching, deprecated API usage |
| **LOG** | Normal business operations | User logged in, student created, payment processed |
| **DEBUG** | Detailed diagnostic information | SQL queries, API request/response bodies |

### 10.2 Structured Logging

All logs are structured JSON objects:

```json
{
  "timestamp": "2026-07-20T10:00:00.000Z",
  "level": "log",
  "context": "UserService",
  "message": "User created successfully",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440003",
    "email": "john.doe@example.com"
  }
}
```

### 10.3 Log Context

Every log entry includes:

| Field | Required | Description |
|-------|----------|-------------|
| `timestamp` | Yes | ISO 8601 UTC timestamp |
| `level` | Yes | Log level |
| `context` | Yes | Class or module name |
| `message` | Yes | Human-readable message |
| `correlationId` | Yes | Request correlation ID |
| `tenantId` | When applicable | Tenant context |
| `userId` | When applicable | User context |
| `data` | Optional | Additional structured data |

### 10.4 Sensitive Data Masking

| Data | Treatment |
|------|-----------|
| Passwords | Never logged; replaced with `[REDACTED]` |
| JWT tokens | Never logged; log only token presence |
| Email addresses | Masked in debug logs: `j***@example.com` |
| Phone numbers | Masked: `***-***-1234` |
| Credit card numbers | Never logged |
| Medical records | Never logged |
| API keys | Never logged; replaced with `[REDACTED]` |

### 10.5 Audit Logging

Audit logs are written for all state-changing operations:

```json
{
  "timestamp": "2026-07-20T10:00:00.000Z",
  "level": "log",
  "context": "Audit",
  "category": "audit",
  "message": "Resource created",
  "correlationId": "...",
  "tenantId": "...",
  "userId": "...",
  "data": {
    "action": "CREATE",
    "resource": "Student",
    "resourceId": "...",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Audit log requirements:**

| Event | Logged |
|-------|--------|
| Authentication success/failure | Yes |
| Authorization failure | Yes |
| Resource CRUD operations | Yes |
| Bulk operations | Yes |
| File uploads | Yes |
| Admin actions | Yes |
| Configuration changes | Yes |

---

## 11. Testing Standards

### 11.1 Test Pyramid

| Layer | Coverage Target | Description | Tool |
|-------|----------------|-------------|------|
| **Unit tests** | 80% | Service logic, validation, utilities | Jest (backend), flutter_test (frontend) |
| **Integration tests** | 60% | API endpoints, database queries, events | Jest + Supertest |
| **Contract tests** | 100% | API contract matches OpenAPI spec | Pact or custom validators |
| **E2E tests** | Critical paths | Complete user workflows | Cypress or Playwright (web), integration_test (Flutter) |

### 11.2 Unit Testing

Unit tests isolate a single class or function:

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(() => {
    repository = { create: jest.fn(), findByEmail: jest.fn() } as any;
    eventPublisher = { publish: jest.fn() } as any;
    service = new UserService(repository, eventPublisher);
  });

  describe('create', () => {
    it('should create a user when email is unique', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue({ id: '1', publicId: 'pub-1', email: 'test@example.com' });

      const result = await service.create('tenant-1', {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.id).toBe('pub-1');
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(eventPublisher.publish).toHaveBeenCalledWith('identity.UserCreated', expect.any(Object));
    });

    it('should throw ConflictException when email already exists', async () => {
      repository.findByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        service.create('tenant-1', { email: 'test@example.com', firstName: 'John', lastName: 'Doe' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
```

**Unit test rules:**

| Rule | Description |
|------|-------------|
| Arrange-Act-Assert | Tests follow AAA pattern |
| One assertion per test | Each test verifies one behavior |
| Descriptive names | Test names describe the expected behavior |
| No database | Unit tests mock all external dependencies |
| Fast execution | Unit tests complete in < 100ms |

### 11.3 Integration Testing

Integration tests verify real interactions:

```typescript
describe('Students API (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/people/students', () => {
    it('should create a student with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/people/students')
        .set('Authorization', `Bearer ${validToken}`)
        .set('X-Tenant-ID', tenantId)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          dateOfBirth: '2010-05-15',
          status: 'ACTIVE',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('John');
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/people/students')
        .set('Authorization', `Bearer ${validToken}`)
        .set('X-Tenant-ID', tenantId)
        .send({ firstName: 'John', lastName: 'Doe' })
        .expect(400);
    });
  });
});
```

### 11.4 Test Naming Convention

```
describe('{Feature}', () => {
  describe('{Method or Endpoint}', () => {
    it('should {expected behavior} when {condition}', () => {});
    it('should return {status} when {error condition}', () => {});
  });
});
```

**Examples:**

| Test Name | What It Tests |
|-----------|--------------|
| `should create a student with valid data` | Happy path creation |
| `should return 400 when email is missing` | Validation error |
| `should return 401 when token is missing` | Authentication error |
| `should return 403 when user lacks permission` | Authorization error |
| `should return 404 when student not found` | Resource not found |
| `should return 409 when email already exists` | Conflict error |

### 11.5 Test Data Factories

```typescript
// factories/student.factory.ts
export const createStudent = (overrides?: Partial<CreateStudentDto>) => ({
  firstName: 'John',
  lastName: 'Doe',
  email: `john.doe.${Date.now()}@example.com`,
  dateOfBirth: '2010-05-15',
  status: 'ACTIVE',
  ...overrides,
});
```

### 11.6 Flutter Testing

```dart
void main() {
  group('LoginPage', () {
    testWidgets('should display login form', (tester) async {
      await tester.pumpWidget(MaterialApp(home: LoginPage()));

      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.text('Login'), findsOneWidget);
    });

    testWidgets('should show error when submitting empty form', (tester) async {
      await tester.pumpWidget(MaterialApp(home: LoginPage()));

      await tester.tap(find.text('Login'));
      await tester.pump();

      expect(find.text('Email is required'), findsOneWidget);
    });
  });
}
```

### 11.7 Coverage Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Line coverage (unit) | 80% | 90% |
| Branch coverage (unit) | 75% | 85% |
| Line coverage (integration) | 60% | 75% |
| API endpoint coverage | 100% | 100% |
| Critical path E2E | 100% | 100% |

---

## 12. Documentation Standards

### 12.1 Code Comments

| Type | When | Example |
|------|------|---------|
| **File header** | Every file | Purpose, author, date |
| **JSDoc/TSDoc** | Every public method | Parameters, returns, throws |
| **Inline** | Complex logic only | Explain why, not what |
| **TODO** | Known technical debt | `// TODO: Remove after V2 migration` |
| **FIXME** | Known bugs | `// FIXME: Temporary workaround for issue #123` |

**Do not comment:**

| Anti-pattern | Reason |
|-------------|--------|
| Obvious code | `// Increment counter` before `counter++` |
| Restating code | Comments that rephrase the code |
| Commented-out code | Remove it; use version control |
| Large comment blocks | Refactor code to be self-documenting |

### 12.2 JSDoc Convention

```typescript
/**
 * Creates a new student record within the specified tenant.
 *
 * @param tenantId - The tenant identifier for data scoping
 * @param dto - The student creation data
 * @returns The created student entity
 * @throws ConflictException - If email already exists within the tenant
 * @throws BadRequestException - If referenced class does not exist
 */
async create(tenantId: string, dto: CreateStudentDto): Promise<Student> {
  // Implementation
}
```

### 12.3 README Requirements

Every package and application must have a README with:

| Section | Description |
|---------|-------------|
| Overview | What this package/application does |
| Setup | How to install and configure |
| Usage | How to use the main features |
| Testing | How to run tests |
| Contributing | How to contribute |

### 12.4 ADR Standards

Architecture Decision Records follow a standard format:

```markdown
# ADR-{DOMAIN}-{NUMBER}: {Title}

## Status
{Proposed | Accepted | Deprecated | Superseded}

## Date
{YYYY-MM-DD}

## Context
{What is the issue that we're seeing that motivates this decision?}

## Decision
{What is the change that we're proposing or have agreed to implement?}

## Consequences
{What becomes easier or more difficult to do because of this change?}
```

See [Section 19: Architecture Decision Records](#19-architecture-decision-records) for comprehensive ADR guidance.

### 12.5 Changelog

Every domain maintains a CHANGELOG.md:

```markdown
# Changelog

## [1.2.0] - 2026-07-20

### Added
- Student transfer feature
- Bulk enrollment endpoint

### Changed
- Improved report card generation performance

### Fixed
- Fixed attendance calculation for half-day sessions

### Deprecated
- Legacy enrollment endpoint (use new enrollment flow)
```

### 12.6 API Documentation

All APIs are documented via OpenAPI (Swagger):

```typescript
@ApiTags('Students')
@ApiBearerAuth()
@Controller('api/v1/people/students')
export class StudentController {
  @Post()
  @ApiOperation({ summary: 'Create a new student' })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ status: 201, description: 'Student created', type: StudentResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Duplicate email' })
  async create(@Body() dto: CreateStudentDto): Promise<StudentResponseDto> {
    // Implementation
  }
}
```

---

## 13. Git Standards

### 13.1 Branch Strategy

OpenSchool ERP uses a simplified Git Flow:

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| `main` | Production-ready code | Permanent |
| `develop` | Integration branch for next release | Permanent |
| `feature/{domain}-{description}` | New feature development | Temporary |
| `fix/{domain}-{description}` | Bug fixes | Temporary |
| `hotfix/{description}` | Urgent production fixes | Temporary |
| `release/{version}` | Release preparation | Temporary |

**Examples:**

| Branch | Description |
|--------|-------------|
| `feature/people-student-transfer` | Student transfer feature |
| `feature/finance-bulk-invoice` | Bulk invoice generation |
| `fix/academics-attendance-calculation` | Attendance calculation bug |
| `hotfix/payment-timeout` | Payment processing timeout |

### 13.2 Commit Message Convention

Follow Conventional Commits:

```
{type}({scope}): {description}

[optional body]

[optional footer(s)]
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring (no feature or fix) |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, tooling |
| `perf` | Performance improvement |

**Scope:**

| Scope | Domain |
|-------|--------|
| `identity` | Identity & Access |
| `institution` | Institution Management |
| `people` | People |
| `academics` | Academic Management |
| `finance` | Finance |
| `communication` | Communication |
| `operations` | Operations |
| `documents` | Documents & Learning |
| `analytics` | Reporting & Analytics |
| `platform` | Platform Administration |
| `api` | Cross-cutting API changes |
| `infra` | Infrastructure changes |

**Examples:**

| Commit Message | Description |
|---------------|-------------|
| `feat(people): add student transfer endpoint` | New feature in People domain |
| `fix(finance): correct invoice total calculation` | Bug fix in Finance domain |
| `docs(api): update pagination documentation` | Documentation update |
| `refactor(academics): extract grading service` | Refactoring in Academics |
| `test(finance): add payment confirmation tests` | Test addition |
| `chore(infra): update Docker base image` | Infrastructure change |
| `perf(analytics): optimize attendance query` | Performance improvement |

### 13.3 Pull Request Standards

Every PR must include:

| Section | Description |
|---------|-------------|
| Title | Conventional commit format |
| Description | What this PR does and why |
| Related ADR | Link to relevant ADR if applicable |
| Testing | How this was tested |
| Checklist | Review checklist completed |

**PR template:**

```markdown
## Description
{What this PR does and why}

## Related Issue
Closes #{issue-number}

## Related ADR
{Link to ADR if applicable}

## Changes
- {Change 1}
- {Change 2}

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### 13.4 Merge Strategy

| Scenario | Strategy |
|----------|----------|
| Feature → develop | Squash merge (clean history) |
| develop → main | Merge commit (preserve history) |
| hotfix → main | Merge commit |
| hotfix → develop | Cherry-pick or merge |

### 13.5 Release Tagging

```
v{major}.{minor}.{patch}
```

| Change | Version Bump | Example |
|--------|-------------|---------|
| Breaking change | MAJOR | v2.0.0 |
| New feature | MINOR | v1.1.0 |
| Bug fix | PATCH | v1.0.1 |

### 13.6 Hotfix Process

1. Create `hotfix/{description}` from `main`
2. Fix the issue
3. Add tests
4. Create PR to `main`
5. After merge, cherry-pick to `develop`
6. Tag the release

---

## 14. Code Review Standards

### 14.1 Review Principles

| Principle | Description |
|-----------|-------------|
| Respectful | Critique code, not people |
| Constructive | Suggest improvements, not just problems |
| Educational | Help reviewers learn |
| Timely | Complete reviews within 24 hours |
| Thorough | Review all aspects, not just functionality |

### 14.2 Review Focus Areas

| Area | What to Check |
|------|--------------|
| **Architecture** | Does the code follow Clean Architecture and DDD? |
| **Correctness** | Does the code implement the domain spec correctly? |
| **Security** | Are there security vulnerabilities? |
| **Performance** | Are there performance issues? |
| **Maintainability** | Is the code readable and maintainable? |
| **Testing** | Are there adequate tests? |
| **Documentation** | Is the code well-documented? |
| **Backward Compatibility** | Does this change break existing clients? |

### 14.3 Review Checklist

| Category | Item |
|----------|------|
| **Architecture** | |
| | Code follows layer boundaries (Controller → Service → Repository) |
| | No business logic in controllers |
| | No database queries in services (only through repositories) |
| | Dependencies flow inward (no circular dependencies) |
| **Security** | |
| | Authentication and authorization are enforced |
| | Input is validated (DTO + business rules) |
| | Sensitive data is not exposed in responses |
| | No secrets in code or logs |
| | SQL injection is prevented |
| **Performance** | |
| | No N+1 query patterns |
| | Pagination is used for list endpoints |
| | Database queries are indexed |
| | No unnecessary database queries |
| **Testing** | |
| | Unit tests for business logic |
| | Integration tests for API endpoints |
| | Test coverage meets minimum threshold |
| | Tests are descriptive and isolated |
| **Documentation** | |
| | JSDoc/TSDoc on public methods |
| | Swagger decorators on API endpoints |
| | README updated if applicable |
| | ADR created for architectural decisions |

### 14.4 Review Workflow

1. Author creates PR with description and checklist
2. Assign reviewer(s)
3. Reviewer completes checklist
4. Author addresses feedback
5. Reviewer approves
6. Author squash merges (feature → develop)

---

## 15. Security Standards

### 15.1 Secrets Management

| Rule | Description |
|------|-------------|
| Environment variables | All secrets stored in environment variables |
| No hardcoded secrets | Never commit secrets to source code |
| .env.example | Provide example env file without real values |
| Secret scanning | CI/CD scans for accidental secret exposure |
| Rotation | Secrets are rotated regularly |

### 15.2 Authentication Implementation

```typescript
// JWT validation guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }
}
```

**Authentication rules:**

| Rule | Description |
|------|-------------|
| JWT validation | Validate token signature and expiry on every request |
| Token refresh | Implement refresh token flow |
| Password hashing | Use bcrypt with salt rounds ≥ 12 |
| MFA support | Design for multi-factor authentication |
| Session management | Invalidate refresh tokens on logout |

### 15.3 Authorization Implementation

```typescript
// Permission-based guard
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );
  }
}

// Usage
@Post()
@UseGuards(PermissionGuard)
@SetMetadata('permissions', ['students:write'])
async create(@Body() dto: CreateStudentDto) { ... }
```

### 15.4 Input Sanitization

| Threat | Prevention |
|--------|-----------|
| SQL injection | Use Prisma parameterized queries |
| XSS | Escape output; use Content-Security-Policy headers |
| Path traversal | Validate and sanitize file paths |
| Command injection | Never use user input in shell commands |
| CSRF | Use CSRF tokens for state-changing operations |

### 15.5 Output Encoding

| Context | Encoding |
|---------|----------|
| JSON responses | UTF-8 |
| HTML responses | HTML entity encoding |
| URL parameters | URL encoding |
| HTTP headers | Header value encoding |

### 15.6 Dependency Management

| Rule | Description |
|------|-------------|
| Audit | Run `npm audit` / `flutter pub audit` regularly |
| Updates | Update dependencies monthly |
| Vulnerabilities | Fix critical vulnerabilities within 24 hours |
| Lock files | Commit lock files (package-lock.json, pubspec.lock) |
| Minimal dependencies | Only add dependencies that are truly needed |

### 15.7 Secure Coding Practices

| Practice | Description |
|----------|-------------|
| Least privilege | Grant minimum required permissions |
| Defense in depth | Multiple security layers |
| Fail securely | Errors must not expose sensitive information |
| Don't trust input | Validate all input at every layer |
| Don't trust output | Sanitize all output |
| Separation of duties | Different users for different roles |
| Logging | Log security events for audit |

---

## 16. Performance Standards

### 16.1 Query Optimization

| Rule | Description |
|------|-------------|
| Index support | All filtered and sorted fields are indexed |
| Select only needed | Use Prisma `select` to return only required fields |
| Avoid N+1 | Use `include` for eager loading |
| Pagination | Always paginate list queries |
| Connection pooling | Use Prisma connection pooling |

### 16.2 Lazy Loading (Frontend)

```dart
// Lazy load images
CachedNetworkImage(
  imageUrl: 'https://...',
  placeholder: (context, url) => const CircularProgressIndicator(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
);

// Lazy load lists
ListView.builder(
  itemCount: students.length,
  itemBuilder: (context, index) => StudentTile(student: students[index]),
);
```

### 16.3 Caching Strategy

| Layer | What to Cache | TTL |
|-------|--------------|-----|
| Redis | Session data, frequent queries | 5–60 minutes |
| HTTP | API responses (GET) | 1–5 minutes |
| Client | Reference data, UI state | Until invalidated |
| Prisma | Query results (if using accelerate) | Varies |

### 16.4 Async Processing

| Operation | Approach |
|-----------|----------|
| Email sending | Background job (BullMQ) |
| File processing | Background job |
| Report generation | Background job with polling |
| Analytics computation | Background job, scheduled |
| Bulk operations | Background job with progress tracking |

### 16.5 Resource Limits

| Resource | Limit |
|----------|-------|
| Request body | 1MB |
| Query results | 100 items per page |
| File upload | 50MB |
| Database connection pool | 10 connections |
| Request timeout | 30 seconds |
| Job timeout | 5 minutes |

### 16.6 Performance Monitoring

| Metric | Target |
|--------|--------|
| API response time (p50) | < 100ms |
| API response time (p95) | < 500ms |
| API response time (p99) | < 1000ms |
| Database query time (p95) | < 100ms |
| Error rate | < 0.1% |
| Availability | > 99.9% |

---

## 17. Quality Gates

### 17.1 Pre-Merge Requirements

No code may be merged to `develop` or `main` without passing all quality gates:

| Gate | Required | Blocking |
|------|----------|----------|
| **Build passes** | Yes | Yes |
| **Linting passes** | Yes | Yes |
| **Type checking passes** | Yes | Yes |
| **Unit tests pass** | Yes | Yes |
| **Integration tests pass** | Yes | Yes |
| **Test coverage meets minimum** | Yes | Yes |
| **Code review approved** | Yes | Yes |
| **No security vulnerabilities** | Yes | Yes |
| **Documentation updated** | Yes | No |
| **Changelog updated** | Yes | No |

### 17.2 Build Requirements

| Requirement | Description |
|-------------|-------------|
| TypeScript compilation | No TypeScript errors |
| NestJS build | Application builds successfully |
| Flutter build | Application compiles without errors |
| Prisma generate | Prisma client generates successfully |
| Docker build | Docker image builds successfully |

### 17.3 Linting Requirements

**Backend (ESLint):**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn"
  }
}
```

**Frontend (Flutter):**

```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - prefer_const_constructors
    - prefer_const_declarations
    - avoid_print
    - prefer_single_quotes
```

### 17.4 Type Checking Requirements

| Requirement | Description |
|-------------|-------------|
| Strict mode | TypeScript strict mode enabled |
| No any | `any` type is forbidden (use `unknown` if necessary) |
| Null checks | Strict null checks enabled |
| No implicit any | All types must be explicit |

### 17.5 Test Coverage Requirements

| Metric | Minimum | Enforcement |
|--------|---------|-------------|
| Line coverage (new code) | 80% | CI gate |
| Branch coverage (new code) | 75% | CI gate |
| API endpoint coverage | 100% | Review gate |
| Critical path E2E | 100% | Review gate |

### 17.6 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration
      - run: npm run build
```

---

## 18. AI-Assisted Development Standards

### 18.1 General Principles

AI coding assistants (such as OpenCode) are tools that assist developers. They must follow the same standards as human developers.

| Principle | Description |
|-----------|-------------|
| **Standards compliance** | AI-generated code must follow all platform standards |
| **Architecture respect** | AI must not introduce architectural changes without human approval |
| **Specification adherence** | AI must reference domain specs, not invent business rules |
| **Human review** | All AI-generated code requires human review |
| **Consistency** | AI must match existing code patterns and conventions |

### 18.2 What AI May Do Autonomously

| Action | Condition |
|--------|-----------|
| Generate boilerplate code | Following existing patterns in the codebase |
| Write unit tests | For existing service/controller logic |
| Fix linting errors | When the fix is straightforward |
| Update imports | When refactoring moves modules |
| Add validation decorators | When DTO patterns exist |
| Generate Swagger decorators | For new API endpoints |
| Write JSDoc comments | For public methods |
| Create DTOs | Following existing DTO patterns |
| Fix formatting | Prettier/eslint auto-fixes |

### 18.3 What AI Must Not Do Without Human Approval

| Action | Why |
|--------|-----|
| Create new NestJS modules | Architectural decision |
| Change database schema | Affects all consumers |
| Modify event contracts | Affects cross-domain consumers |
| Add new dependencies | Security and maintenance implications |
| Change authentication/authorization | Security implications |
| Modify API contracts | Breaking change potential |
| Create new domain services | Architectural decision |
| Change configuration | Environment implications |
| Modify CI/CD pipelines | Infrastructure implications |
| Create ADRs | Architectural decision |

### 18.4 AI Code Generation Rules

| Rule | Description |
|------|-------------|
| Reference existing patterns | AI must examine existing code before generating new code |
| Follow naming conventions | Use the same naming patterns as the rest of the codebase |
| Match code style | Use the same formatting, commenting, and structure |
| Use existing utilities | Don't create new utilities when existing ones serve the purpose |
| Maintain consistency | Generated code should be indistinguishable from hand-written code |
| Avoid duplication | Check if similar code exists before generating |
| Include tests | Generate tests alongside implementation code |

### 18.5 AI Review Requirements

When AI generates code, the human reviewer must verify:

| Check | Description |
|-------|-------------|
| Correctness | Code implements the intended functionality |
| Security | No security vulnerabilities introduced |
| Performance | No performance regressions |
| Architecture | Code follows Clean Architecture and DDD |
| Testing | Adequate test coverage |
| Documentation | Code is properly documented |
| Standards compliance | Code follows all platform standards |

### 18.6 AI Prompt Guidelines

When using AI assistants, provide context:

| Context | Why |
|---------|-----|
| Domain spec reference | So AI understands the business rules |
| Existing code patterns | So AI matches conventions |
| Technology stack | So AI uses correct frameworks |
| File structure | So AI places files correctly |
| Naming conventions | So AI uses consistent names |

---

## 19. Architecture Decision Records

### 19.1 Development Philosophy ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-DEV-01 | Clean Architecture over MVC | Domain logic independence from infrastructure; testability |
| ADR-DEV-02 | DDD over anemic domain model | Rich domain behavior; business rules close to data |
| ADR-DEV-03 | SOLID principles at all layers | Maintainability; testability; flexibility |
| ADR-DEV-04 | Composition over inheritance | Flexibility; simpler code; easier testing |
| ADR-DEV-05 | Dependency injection via NestJS DI | Loose coupling; testability; configurability |

### 19.2 Repository Pattern ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-DEV-06 | Repository pattern for all data access | Abstraction; testability; single source of truth |
| ADR-DEV-07 | One repository per aggregate | Aggregate consistency; clear ownership |
| ADR-DEV-08 | Prisma as sole ORM | Type safety; schema-first; migration support |

### 19.3 Project Structure ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-DEV-09 | Monorepo for all applications | Shared code; atomic commits; consistent tooling |
| ADR-DEV-10 | Feature-first frontend architecture | Scalability; clear feature boundaries |
| ADR-DEV-11 | Domain-first backend architecture | DDD alignment; clear domain boundaries |
| ADR-DEV-12 | Shared packages for common code | DRY; consistency; single source of truth |

### 19.4 Testing Strategy ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-DEV-13 | Test pyramid (unit > integration > E2E) | Balance of coverage, speed, and cost |
| ADR-DEV-14 | Jest for backend testing | NestJS native; fast; good DX |
| ADR-DEV-15 | flutter_test for frontend testing | Native testing framework |
| ADR-DEV-16 | 80% minimum unit test coverage | Quality baseline; prevent regressions |

### 19.5 Git Workflow ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-DEV-17 | Conventional Commits | Consistent history; automated changelogs |
| ADR-DEV-18 | Squash merge for features | Clean history; one commit per feature |
| ADR-DEV-19 | PR review required | Knowledge sharing; quality assurance |

### 19.6 AI-Assisted Development ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-DEV-20 | AI follows all human standards | Consistency; quality; no exceptions |
| ADR-DEV-21 | Human review required for AI code | Quality assurance; architectural integrity |
| ADR-DEV-22 | AI cannot make architectural decisions | Architecture requires human judgment and context |

---

## 20. Development Review Checklist

Use this checklist for every feature and pull request.

### 20.1 Architecture Review

- [ ] Code follows Clean Architecture layers
- [ ] No business logic in controllers
- [ ] No database queries in services (only through repositories)
- [ ] Dependencies flow inward (no circular dependencies)
- [ ] Module boundaries respected
- [ ] Domain spec is followed accurately

### 20.2 Code Quality Review

- [ ] Code is readable and self-documenting
- [ ] Naming conventions are followed
- [ ] No code duplication
- [ ] Functions are small and focused
- [ ] No magic numbers or strings
- [ ] Error handling is comprehensive

### 20.3 Security Review

- [ ] Authentication is enforced
- [ ] Authorization is enforced
- [ ] Input is validated (DTO + business rules)
- [ ] Sensitive data is not exposed in responses
- [ ] No secrets in code or logs
- [ ] SQL injection is prevented
- [ ] Rate limiting is configured

### 20.4 Performance Review

- [ ] No N+1 query patterns
- [ ] Pagination is used for lists
- [ ] Database queries are indexed
- [ ] No unnecessary database queries
- [ ] Caching is used where appropriate
- [ ] Async processing for long operations

### 20.5 Testing Review

- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Test coverage meets minimum (80%)
- [ ] Tests are descriptive and isolated
- [ ] Test data factories are used
- [ ] Edge cases are tested

### 20.6 Documentation Review

- [ ] JSDoc/TSDoc on public methods
- [ ] Swagger decorators on API endpoints
- [ ] README updated if applicable
- [ ] ADR created for architectural decisions
- [ ] Changelog updated

### 20.7 Database Review

- [ ] Prisma schema follows naming conventions
- [ ] Indexes support queries
- [ ] Soft deletes are implemented
- [ ] Version field for optimistic concurrency
- [ ] Tenant isolation is enforced
- [ ] Migrations are backward compatible

### 20.8 Event Review

- [ ] Event naming follows conventions
- [ ] Event envelope is complete
- [ ] Events published after transaction commit
- [ ] Consumer idempotency is implemented
- [ ] Event is documented in Event Catalogue

### 20.9 API Review

- [ ] URL follows naming conventions
- [ ] HTTP method is correct
- [ ] Request/response follows standard envelope
- [ ] Error responses follow error model
- [ ] Pagination is implemented
- [ ] Filtering and sorting work correctly
- [ ] Idempotency key is supported

### 20.10 Frontend Review (Flutter)

- [ ] Feature-first architecture is followed
- [ ] BLoC pattern is used for state management
- [ ] Loading, empty, and error states are handled
- [ ] Form validation provides immediate feedback
- [ ] Responsive design is implemented
- [ ] Accessibility is considered
- [ ] Shared widgets are reused

---

## Appendix A: File Naming Quick Reference

### Backend Files

| File Type | Convention | Example |
|-----------|-----------|---------|
| Module | `{name}.module.ts` | `identity.module.ts` |
| Controller | `{name}.controller.ts` | `user.controller.ts` |
| Service | `{name}.service.ts` | `user.service.ts` |
| Repository | `{name}.repository.ts` | `user.repository.ts` |
| DTO (input) | `create-{name}.dto.ts`, `update-{name}.dto.ts` | `create-user.dto.ts` |
| DTO (output) | `{name}-response.dto.ts` | `user-response.dto.ts` |
| Entity | `{name}.entity.ts` | `user.entity.ts` |
| Guard | `{name}.guard.ts` | `jwt-auth.guard.ts` |
| Interceptor | `{name}.interceptor.ts` | `audit.interceptor.ts` |
| Filter | `{name}.filter.ts` | `global-exception.filter.ts` |
| Event | `{name}.event.ts` | `user-created.event.ts` |
| Handler | `{name}.handler.ts` | `user-created.handler.ts` |
| Job | `{name}.job.ts` | `send-invitation.job.ts` |
| Spec | `{name}.spec.ts` | `user.service.spec.ts` |

### Frontend Files (Flutter)

| File Type | Convention | Example |
|-----------|-----------|---------|
| Page | `{name}_page.dart` | `login_page.dart` |
| Widget | `{name}_widget.dart` | `login_form.dart` |
| BLoC | `{name}_bloc.dart` | `auth_bloc.dart` |
| Entity | `{name}.dart` | `user.dart` |
| Model | `{name}_model.dart` | `user_model.dart` |
| Datasource | `{name}_datasource.dart` | `auth_remote_datasource.dart` |
| Repository | `{name}_repository.dart` | `auth_repository.dart` |
| Use case | `{name}.dart` | `login.dart` |
| Failure | `{name}_failure.dart` | `server_failure.dart` |

---

## Appendix B: Common NestJS Patterns

### Service with Dependency Injection

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}
}
```

### Controller with Guards

```typescript
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('api/v1/identity/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
```

### Repository with Prisma

```typescript
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(tenantId: string, id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }
}
```

### Event Publishing

```typescript
this.eventEmitter.emit('domain.EventName', {
  eventId: generateEventId(),
  eventName: 'domain.EventName',
  eventVersion: 1,
  schemaVersion: '1.0.0',
  occurredAt: new Date().toISOString(),
  correlationId,
  causationId: null,
  tenantId,
  institutionId: null,
  aggregateId: entity.publicId,
  aggregateType: 'EntityName',
  sourceDomain: 'domain',
  actorId,
  payload: { /* event data */ },
});
```

### Validation Pipe

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

---

## 21. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-20 | Initial creation — Platform Development Standards derived from 01 Engineering Standards and domain specification implementation patterns |

---

*This document is the authoritative development standard for the OpenSchool ERP platform. Every developer and AI coding assistant contributing to the project must follow this guide. Changes require architecture review.*



---

# PAGE BREAK

---


# OpenSchool ERP — DevOps & Deployment Standards

**Authoritative Reference for Infrastructure, Deployment, and Operations**

| Aspect | Detail |
|--------|--------|
| **Document ID** | OPS-STD-OPS-006 |
| **Status** | Approved |
| **Version** | 1.0.0 |
| **Date** | 2026-07-20 |
| **Author** | Platform Architecture Team |
| **Supersedes** | None |
| **Review Cycle** | Quarterly |

---

## Document Status

| Status | Description |
|--------|-------------|
| **Draft** | Under active development |
| **Review** | Under architecture review |
| **Approved** | Approved for implementation |
| **Frozen** | Locked for current version |
| **Deprecated** | Pending replacement |

**Current Status:** Approved

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Scope](#2-scope)
3. [DevOps Philosophy](#3-devops-philosophy)
4. [Environment Strategy](#4-environment-strategy)
5. [Configuration Management](#5-configuration-management)
6. [Secrets Management](#6-secrets-management)
7. [Containerization Standards](#7-containerization-standards)
8. [CI/CD Standards](#8-cicd-standards)
9. [Database Deployment](#9-database-deployment)
10. [Release Management](#10-release-management)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Logging Standards](#12-logging-standards)
13. [Security Operations](#13-security-operations)
14. [Backup & Disaster Recovery](#14-backup--disaster-recovery)
15. [Scalability Standards](#15-scalability-standards)
16. [Operational Runbooks](#16-operational-runbooks)
17. [Maintenance Windows](#17-maintenance-windows)
18. [Business Continuity](#18-business-continuity)
19. [Future Expansion](#19-future-expansion)
20. [Architecture Decision Records](#20-architecture-decision-records)
21. [Operational Review Checklist](#21-operational-review-checklist)
22. [Appendix A: Environment Variable Reference](#appendix-a-environment-variable-reference)
23. [Appendix B: Docker Compose Reference](#appendix-b-docker-compose-reference)
24. [Revision History](#22-revision-history)

---

## 1. Purpose

This document is the authoritative DevOps and deployment standard for the OpenSchool ERP platform. Every deployment, infrastructure change, and operational procedure must conform to this guide.

This guide defines:

- Infrastructure architecture and containerization standards
- CI/CD pipeline design and quality gates
- Environment management and configuration
- Secrets management and security operations
- Monitoring, logging, and observability
- Backup, disaster recovery, and business continuity
- Release management and deployment procedures
- Operational runbooks and maintenance procedures

This document eliminates ambiguity during deployment and production operations.

---

## 2. Scope

### 2.1 Applicability

This guide applies to all operational aspects of OpenSchool ERP:

- **Infrastructure** — Docker, cloud services, networking, storage
- **Deployment** — CI/CD pipelines, release management, rollback
- **Operations** — Monitoring, logging, alerting, incident response
- **Security** — Vulnerability management, patching, access control
- **Reliability** — Backup, disaster recovery, business continuity

### 2.2 Relationship to Other Standards

| Standard | Relationship |
|----------|-------------|
| **01 Engineering Standards** | Defines naming, entity, and event standards. This guide defines how to deploy and operate the code that implements those standards. |
| **02 Cross-Domain Integration Specification** | Defines event flows and workflows. This guide defines infrastructure that supports those flows. |
| **03 Platform Event Catalogue** | Defines event contracts. This guide defines infrastructure for event delivery (Redis, BullMQ). |
| **04 API Style Guide** | Defines API contracts. This guide defines how APIs are deployed and exposed. |
| **05 Development Standards** | Defines code patterns. This guide defines how code is built, tested, and deployed. |

### 2.3 Governance

- All infrastructure changes require code review
- All production deployments require approval
- This guide is maintained by the Platform Architecture Team

---

## 3. DevOps Philosophy

### 3.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Infrastructure as Code** | All infrastructure is defined in code (Docker Compose, Terraform, GitHub Actions). No manual server configuration. |
| **Immutable Deployments** | Deployments create new containers, never modify running ones. Rollback is container replacement. |
| **Automation First** | Every manual process is a candidate for automation. Manual steps are exceptions, not rules. |
| **Repeatable Deployments** | Any deployment can be reproduced identically. Environment parity is maintained. |
| **Zero-Downtime Deployments** | Deployments do not cause user-facing downtime. Rolling updates or blue-green strategies. |
| **High Availability** | Single points of failure are eliminated. Services run in multiple instances where critical. |
| **Operational Simplicity** | Simple, observable systems over complex, opaque ones. Prefer standard tools. |
| **Security by Default** | Security is built into every layer. No deployment without security verification. |
| **Least Privilege** | Every service, user, and process has minimum required permissions. |
| **Continuous Improvement** | Operational practices are regularly reviewed and improved. Post-incident reviews drive changes. |

### 3.2 Deployment Priorities

1. **Safety** — Never deploy without rollback capability
2. **Reliability** — Deployments must not cause outages
3. **Speed** — Fast feedback loops; quick deployment cycles
4. **Visibility** — Every deployment is observable and auditable
5. **Simplicity** — Simple processes that humans can understand and execute

### 3.3 What This Philosophy Is Not

- This is not a cloud provider tutorial; it assumes Docker and container orchestration familiarity
- This is not a Kubernetes manual; V1 uses Docker Compose
- This is not a monitoring tool guide; it specifies what to monitor, not how to configure tools
- This is an operational standards guide; it defines rules, not implementation tutorials

---

## 4. Environment Strategy

### 4.1 Environment Overview

OpenSchool ERP uses five standard environments:

| Environment | Purpose | Data | Access |
|-------------|---------|------|--------|
| **Local Development** | Individual developer work | Synthetic/test data | Developer only |
| **Shared Development** | Team integration | Shared test data | Development team |
| **Testing/QA** | Quality assurance | Test data | QA team + developers |
| **Staging** | Pre-production validation | Production-like data (anonymized) | DevOps + stakeholders |
| **Production** | Live user traffic | Real data | Operations team |

### 4.2 Local Development

| Property | Value |
|----------|-------|
| **Purpose** | Individual developer coding and testing |
| **Data** | Synthetic data from seed scripts |
| **Configuration** | `.env.local` with local overrides |
| **Access** | Developer's machine only |
| **Deployment** | Docker Compose on developer machine |
| **Database** | Local PostgreSQL container |
| **Cache** | Local Redis container |
| **Queue** | Local BullMQ (in-process) |

**Local development rules:**

| Rule | Description |
|------|-------------|
| Docker Compose | Use `docker-compose.dev.yml` for local services |
| Seed data | Run seed scripts for consistent test data |
| No production data | Never use production data locally |
| Environment file | `.env.local` overrides defaults |
| Hot reload | Enable NestJS and Flutter hot reload |

### 4.3 Shared Development

| Property | Value |
|----------|-------|
| **Purpose** | Team integration and collaborative testing |
| **Data** | Shared test data, reset weekly |
| **Configuration** | Environment variables in shared config |
| **Access** | All developers |
| **Deployment** | Automatic on push to `develop` branch |
| **Database** | Shared PostgreSQL instance |
| **Cache** | Shared Redis instance |
| **URL** | `dev.openschool.io` |

**Shared development rules:**

| Rule | Description |
|------|-------------|
| Auto-deploy | Deploy on every merge to `develop` |
| Data reset | Test data reset every Monday |
| No debugging | Do not leave debug tools enabled |
| Shared seed | Use consistent seed data |

### 4.4 Testing/QA

| Property | Value |
|----------|-------|
| **Purpose** | Quality assurance and regression testing |
| **Data** | Test scenarios, comprehensive test data |
| **Configuration** | Production-like configuration |
| **Access** | QA team, developers |
| **Deployment** | Automatic on release branch creation |
| **Database** | Dedicated PostgreSQL instance |
| **Cache** | Dedicated Redis instance |
| **URL** | `qa.openschool.io` |

**Testing rules:**

| Rule | Description |
|------|-------------|
| Production parity | Same Docker images as production |
| Test data | Comprehensive test scenarios |
| Automation | Automated test suites run on deploy |
| Performance | Performance tests run weekly |

### 4.5 Staging

| Property | Value |
|----------|-------|
| **Purpose** | Pre-production validation and smoke testing |
| **Data** | Anonymized production data snapshot |
| **Configuration** | Production-equivalent configuration |
| **Access** | DevOps, QA, stakeholders |
| **Deployment** | Manual approval required |
| **Database** | Dedicated PostgreSQL instance |
| **Cache** | Dedicated Redis instance |
| **URL** | `staging.openschool.io` |

**Staging rules:**

| Rule | Description |
|------|-------------|
| Production mirror | Identical infrastructure to production |
| Anonymized data | Production data with PII anonymized |
| Final validation | All smoke tests pass before production |
| Performance | Load tests match production expectations |

### 4.6 Production

| Property | Value |
|----------|-------|
| **Purpose** | Live user traffic and business operations |
| **Data** | Real tenant data |
| **Configuration** | Production secrets and configuration |
| **Access** | Operations team, authorized personnel |
| **Deployment** | Manual approval + deployment window |
| **Database** | Production PostgreSQL cluster |
| **Cache** | Production Redis cluster |
| **URL** | `api.openschool.io` |

**Production rules:**

| Rule | Description |
|------|-------------|
| Approval required | All deployments require approval |
| Deployment window | Deployments only during approved windows |
| Rollback ready | Rollback plan required before deployment |
| Monitoring | Enhanced monitoring during deployments |
| No direct access | No direct database or server access |

---

## 5. Configuration Management

### 5.1 Environment Variables

All configuration uses environment variables:

```bash
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api

# Database
DATABASE_URL=postgresql://user:password@host:5432/openschool

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secret

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
S3_BUCKET=openschool-documents
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=access-key
AWS_SECRET_ACCESS_KEY=secret-key

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password

# Logging
LOG_LEVEL=log
LOG_FORMAT=json

# CORS
CORS_ORIGIN=https://app.openschool.io
```

### 5.2 Configuration Hierarchy

Configuration is resolved in this order (highest priority first):

| Priority | Source | Description |
|----------|--------|-------------|
| 1 | Environment variables | Runtime overrides |
| 2 | `.env.{environment}` | Environment-specific file |
| 3 | `.env` | Default values |
| 4 | Application defaults | Hardcoded defaults |

### 5.3 Configuration Validation

Application configuration is validated on startup:

```typescript
import { z } from 'zod';

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'testing', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
});

export const validateConfig = (config: Record<string, unknown>) => {
  const result = configSchema.safeParse(config);
  if (!result.success) {
    console.error('Invalid configuration:', result.error.format());
    process.exit(1);
  }
  return result.data;
};
```

**Validation rules:**

| Rule | Description |
|------|-------------|
| Fail fast | Application exits immediately on invalid configuration |
| Clear errors | Error messages identify which variable is invalid |
| Type coercion | Numbers and booleans are coerced from strings |
| Defaults | Non-critical values have sensible defaults |
| No secrets in logs | Configuration logs must not include secret values |

### 5.4 Feature Flags

Feature flags control feature rollout:

```typescript
// Feature flag configuration
const featureFlags = {
  ENABLE_STUDENT_TRANSFER: process.env.ENABLE_STUDENT_TRANSFER === 'true',
  ENABLE_BULK_ENROLLMENT: process.env.ENABLE_BULK_ENROLLMENT === 'true',
  ENABLE_ANALYTICS_DASHBOARD: process.env.ENABLE_ANALYTICS_DASHBOARD === 'true',
};
```

**Feature flag rules:**

| Rule | Description |
|------|-------------|
| Environment-based | Feature flags are environment variables |
| Default off | New features default to disabled |
| Gradual rollout | Enable features incrementally per tenant |
| Cleanup | Remove feature flags after full rollout |
| Documentation | Document what each flag controls |

### 5.5 Configuration Versioning

| Configuration Type | Versioning |
|-------------------|-----------|
| Environment variables | Tracked in deployment scripts |
| Docker Compose | Version controlled in Git |
| CI/CD pipelines | Version controlled in Git |
| Feature flags | Documented in release notes |

---

## 6. Secrets Management

### 6.1 Secrets Inventory

| Secret | Usage | Rotation |
|--------|-------|----------|
| `JWT_SECRET` | Token signing | Every 90 days |
| `DATABASE_URL` | Database connection | On compromise |
| `REDIS_PASSWORD` | Redis authentication | Every 90 days |
| `AWS_ACCESS_KEY_ID` | S3 access | Every 90 days |
| `AWS_SECRET_ACCESS_KEY` | S3 secret | Every 90 days |
| `SMTP_PASSWORD` | Email sending | Every 90 days |
| `ENCRYPTION_KEY` | Data encryption | Every 180 days |
| `WEBHOOK_SECRET` | Webhook verification | On compromise |

### 6.2 Storage Rules

| Rule | Description |
|------|-------------|
| Environment variables | Primary storage for secrets |
| Never in source code | Secrets must never appear in Git |
| Never in logs | Secrets must never be logged |
| Never in Dockerfiles | Secrets must not be baked into images |
| Docker secrets | Use Docker secrets for compose deployments |
| Cloud secrets | Use cloud provider secret managers in production |

### 6.3 Secret Access Policies

| Environment | Secret Storage | Access |
|-------------|---------------|--------|
| Local Development | `.env.local` (not committed) | Developer only |
| Shared Development | Environment variables in CI/CD | Development team |
| Testing | Environment variables in CI/CD | QA team |
| Staging | Cloud secret manager | DevOps team |
| Production | Cloud secret manager | Operations team |

### 6.4 Secret Rotation

**Rotation process:**

1. Generate new secret
2. Update secret in secret manager
3. Deploy application with new secret
4. Verify application works with new secret
5. Revoke old secret
6. Document rotation in audit log

**Rotation schedule:**

| Secret Type | Rotation Frequency |
|------------|-------------------|
| JWT signing key | Every 90 days |
| Database password | Every 90 days |
| API keys | Every 90 days |
| Encryption keys | Every 180 days |
| On compromise | Immediately |

### 6.5 Emergency Secret Rotation

When a secret is compromised:

1. **Immediately** revoke the compromised secret
2. **Notify** all stakeholders
3. **Generate** new secret
4. **Update** all systems using the secret
5. **Verify** all systems work with new secret
6. **Audit** access logs for unauthorized usage
7. **Document** the incident and response

### 6.6 Docker Secrets

```yaml
# docker-compose.yml
services:
  backend:
    secrets:
      - database_url
      - jwt_secret

secrets:
  database_url:
    file: ./secrets/database_url.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### 6.7 .gitignore Requirements

The following must never be committed:

```
.env
.env.local
.env.*.local
secrets/
*.pem
*.key
*.cert
```

---

## 7. Containerization Standards

### 7.1 Docker Image Structure

Every application has a dedicated Dockerfile:

```
docker/
├── docker-compose.yml            # Production compose
├── docker-compose.dev.yml        # Development compose
├── docker-compose.test.yml       # Testing compose
└── nginx.conf                    # Reverse proxy config
```

Application Dockerfiles:

```
apps/backend/Dockerfile
apps/mobile/Dockerfile           # If containerized
apps/web/Dockerfile
```

### 7.2 Multi-Stage Builds

All Dockerfiles use multi-stage builds:

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S openschool && \
    adduser -S openschool -u 1001
COPY --from=builder --chown=openschool:openschool /app/dist ./dist
COPY --from=builder --chown=openschool:openschool /app/node_modules ./node_modules
COPY --from=builder --chown=openschool:openschool /app/package.json ./
USER openschool
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
CMD ["node", "dist/main.js"]
```

### 7.3 Multi-Stage Build Rules

| Rule | Description |
|------|-------------|
| Minimal stages | Use fewest stages necessary |
| Cache optimization | Copy package files before source for layer caching |
| Non-root user | Run as non-root user in production |
| Health check | Include HEALTHCHECK directive |
| No dev dependencies | Production stage excludes dev dependencies |
| No source code | Production stage contains only build artifacts |

### 7.4 Image Versioning

| Pattern | Example | Description |
|---------|---------|-------------|
| `latest` | `openschool-backend:latest` | Latest development build |
| `v{major}.{minor}.{patch}` | `openschool-backend:v1.2.3` | Semantic version |
| `v{major}.{minor}` | `openschool-backend:v1.2` | Minor version (latest patch) |
| `sha-{hash}` | `openschool-backend:sha-abc123` | Git commit SHA |

**Versioning rules:**

| Rule | Description |
|------|-------------|
| Never use `latest` in production | Production always uses specific versions |
| Immutable tags | Once pushed, image tags are never overwritten |
| Git SHA for CI | CI builds use Git commit SHA |
| Semantic version for releases | Released versions use semantic version tags |

### 7.5 Base Image Policy

| Base Image | Usage | Policy |
|-----------|-------|--------|
| `node:22-alpine` | Backend, Web | Always use Alpine for minimal size |
| `flutter:stable` | Mobile builds | Official Flutter image for CI |
| `postgres:16-alpine` | Database | Always use Alpine |
| `redis:7-alpine` | Cache | Always use Alpine |
| `nginx:alpine` | Reverse proxy | Always use Alpine |

**Base image rules:**

| Rule | Description |
|------|-------------|
| Alpine only | Always use Alpine variants for minimal size |
| Specific versions | Never use `latest` for base images |
| Regular updates | Update base images monthly for security patches |
| Security scanning | Scan base images for vulnerabilities |

### 7.6 Image Security

| Rule | Description |
|------|-------------|
| Non-root user | All production images run as non-root |
| Read-only filesystem | Containers use read-only filesystem where possible |
| No secrets | No secrets baked into image layers |
| Minimal packages | Only required packages installed |
| Security scan | Images scanned before deployment |
| Signed images | Images signed with Docker Content Trust |

### 7.7 Image Optimization

| Technique | Description |
|-----------|-------------|
| Multi-stage builds | Separate build and runtime stages |
| Alpine base | Minimal base image |
| Layer caching | Order Dockerfile commands for optimal caching |
| `.dockerignore` | Exclude unnecessary files from build context |
| Dependency pruning | Remove unused dependencies |
| Build args | Use ARG for build-time variables |

**.dockerignore:**

```
node_modules
.git
.github
*.md
.env
.env.*
dist
coverage
.test
__tests__
```

---

## 8. CI/CD Standards

### 8.1 Pipeline Overview

```
Push to branch
    ↓
Build & Compile
    ↓
Static Analysis (Lint + Type Check)
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
Security Scan
    ↓
Docker Build
    ↓
Deploy to Environment
    ↓
Smoke Tests
```

### 8.2 Pipeline Stages

| Stage | Trigger | Environment | Action |
|-------|---------|-------------|--------|
| **Build** | Every push | CI | Compile TypeScript, build Flutter |
| **Lint** | Every push | CI | ESLint, Dart analysis |
| **Type Check** | Every push | CI | TypeScript strict, Dart analysis |
| **Unit Tests** | Every push | CI | Jest unit tests, Flutter tests |
| **Integration Tests** | PR to `develop` | CI | API integration tests |
| **Security Scan** | Every push | CI | npm audit, dependency scan |
| **Docker Build** | Merge to `develop` | CI | Build Docker images |
| **Deploy Dev** | Merge to `develop` | Dev | Auto-deploy to shared development |
| **Deploy QA** | Release branch | QA | Auto-deploy to testing |
| **Deploy Staging** | Manual approval | Staging | Deploy to staging |
| **Deploy Production** | Manual approval + window | Production | Deploy to production |

### 8.3 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: openschool_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npm run typecheck

      - name: Unit Tests
        run: npm run test:unit -- --coverage

      - name: Integration Tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/openschool_test
          REDIS_HOST: localhost
          JWT_SECRET: test-secret-key-for-ci-only

      - name: Build
        run: npm run build

      - name: Security Audit
        run: npm audit --audit-level=high
```

### 8.4 Deployment Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options: [staging, production]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: docker build -t openschool-backend:${{ github.sha }} ./apps/backend
      - name: Deploy to Staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: docker build -t openschool-backend:${{ github.sha }} ./apps/backend
      - name: Deploy to Production
        run: |
          # Deploy to production environment
          echo "Deploying to production..."
```

### 8.5 Quality Gates

| Gate | Requirement | Blocking |
|------|-------------|----------|
| Build succeeds | No compilation errors | Yes |
| Lint passes | No linting errors | Yes |
| Type check passes | No type errors | Yes |
| Unit tests pass | All unit tests green | Yes |
| Integration tests pass | All integration tests green | Yes |
| Coverage ≥ 80% | Line coverage threshold | Yes |
| Security scan clean | No high/critical vulnerabilities | Yes |
| Docker build succeeds | Image builds without error | Yes |
| Smoke tests pass | Post-deploy verification | Yes |

### 8.6 Rollback Workflow

```yaml
# Manual rollback trigger
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options: [staging, production]

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - name: Rollback Deployment
        run: |
          # Rollback to specified version
          echo "Rolling back to ${{ inputs.version }}..."
```

---

## 9. Database Deployment

### 9.1 Migration Strategy

OpenSchool ERP uses Prisma Migrate for database schema management:

```bash
# Create migration
npx prisma migrate dev --name add-student-email-index

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### 9.2 Migration Rules

| Rule | Description |
|------|-------------|
| Descriptive names | Migration names describe the change |
| Backward compatible | Migrations must not break running code |
| Reversible | Prefer reversible migrations |
| Tested on staging | All migrations tested before production |
| Backup before | Backup database before applying migrations |
| Atomic | Each migration is atomic (all or nothing) |

### 9.3 Migration Review Checklist

| Check | Description |
|-------|-------------|
| Naming | Migration name is descriptive |
| Reversibility | Migration can be rolled back |
| Data safety | No data loss without explicit intent |
| Index impact | New indexes do not lock tables excessively |
| Column type | Column types are appropriate |
| Default values | Default values are correct |
| Constraints | Constraints are correct |
| Rollback plan | Rollback procedure is documented |

### 9.4 Zero-Downtime Migration Principles

| Principle | Description |
|-----------|-------------|
| Additive changes | Add columns, not modify existing ones |
| Backward compatible | New schema works with old code |
| Expand-contract | Add new structure, migrate data, remove old structure |
| No large locks | Avoid migrations that lock tables for extended periods |
| Batch updates | Large data updates done in batches |

**Expand-contract pattern:**

1. **Expand**: Add new column/table (backward compatible)
2. **Migrate**: Copy data from old to new structure
3. **Switch**: Update application to use new structure
4. **Contract**: Remove old column/table (after verification)

### 9.5 Migration Rollback

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "20260720_add_student_email_index"

# Rollback to specific migration
npx prisma migrate deploy --to 20260719_initial
```

**Rollback rules:**

| Rule | Description |
|------|-------------|
| Test rollback | Test rollback procedure before production |
| Data preservation | Rollback must preserve data |
| Application compatibility | Rollback must not break running application |
| Documented | Rollback procedure documented for each migration |

### 9.6 Data Integrity Validation

After migration:

```sql
-- Verify row counts
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM enrollments;

-- Verify constraints
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'students'::regclass;

-- Verify indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'students';
```

---

## 10. Release Management

### 10.1 Release Versioning

Follows semantic versioning (01 Engineering Standards, ADR-ENG-12):

```
v{major}.{minor}.{patch}
```

| Change | Version Bump | Example |
|--------|-------------|---------|
| Breaking API change | MAJOR | v2.0.0 |
| New feature | MINOR | v1.1.0 |
| Bug fix | PATCH | v1.0.1 |

### 10.2 Release Process

```
1. Create release branch from develop
   git release/v1.2.0

2. Final QA validation on staging

3. Create PR to main
   - Release notes
   - Changelog updated
   - Version bumped

4. Merge to main
   - CI builds Docker images
   - Tags release in Git

5. Deploy to production
   - During deployment window
   - With rollback plan

6. Post-deployment verification
   - Smoke tests
   - Monitor for errors

7. Merge main back to develop
```

### 10.3 Release Candidates

For major releases:

| Phase | Duration | Description |
|-------|----------|-------------|
| RC1 | 1 week | First release candidate; full QA testing |
| RC2 | 1 week | Bug fixes from RC1; regression testing |
| GA | — | General availability; production deployment |

### 10.4 Deployment Windows

| Environment | Window | Approval |
|-------------|--------|----------|
| Development | Any time | None (auto-deploy) |
| QA | Any time | None (auto-deploy) |
| Staging | Business hours | DevOps lead |
| Production | Tue–Thu, 10:00–14:00 UTC | Operations lead + stakeholder |

**Deployment window rules:**

| Rule | Description |
|------|-------------|
| No Friday deploys | Avoid deployments before weekends |
| No holiday deploys | Avoid deployments before holidays |
| Enhanced monitoring | Double monitoring during deployment window |
| Rollback window | 2 hours after deployment for rollback |

### 10.5 Emergency Releases

When critical fixes are needed outside deployment windows:

| Step | Action |
|------|--------|
| 1 | Assess severity (data loss, security breach, complete outage) |
| 2 | Get emergency approval from Operations lead |
| 3 | Create hotfix branch from main |
| 4 | Implement and test fix |
| 5 | Deploy to staging, verify |
| 6 | Deploy to production with enhanced monitoring |
| 7 | Document in incident report |

### 10.6 Hotfix Process

```
1. Create hotfix branch from main
   git hotfix/payment-timeout

2. Implement fix
   - Minimal changes only
   - Add regression test

3. Create PR to main
   - Incident reference
   - Root cause analysis
   - Fix description

4. Merge to main
   - CI builds and tests
   - Tags release

5. Deploy to production
   - Emergency window
   - Enhanced monitoring

6. Cherry-pick to develop
   - Ensure fix is in next release

7. Post-incident review
   - Document lessons learned
```

### 10.7 Rollback Criteria

| Criterion | Action |
|-----------|--------|
| Error rate > 5% | Immediate rollback |
| P99 latency > 5s | Investigate; rollback if not resolved in 10 min |
| Data corruption detected | Immediate rollback |
| Security vulnerability introduced | Immediate rollback |
| Critical feature broken | Rollback if fix not available in 30 min |

### 10.8 Changelog

Every release includes a changelog:

```markdown
# Changelog

## [1.2.0] - 2026-07-20

### Added
- Student transfer feature (People domain)
- Bulk enrollment endpoint (People domain)
- Invoice overdue reminders (Finance domain)

### Changed
- Improved report card generation performance
- Updated API pagination to support cursor mode

### Fixed
- Fixed attendance calculation for half-day sessions
- Fixed invoice total rounding error

### Deprecated
- Legacy enrollment endpoint (use new enrollment flow)

### Security
- Updated JWT library to fix CVE-2026-XXXX
```

---

## 11. Monitoring & Observability

### 11.1 Monitoring Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| **Metrics** | Prometheus | Collect and store time-series metrics |
| **Dashboards** | Grafana | Visualize metrics and alerts |
| **Logging** | ELK Stack / Loki | Centralized log aggregation |
| **Tracing** | Jaeger / OpenTelemetry | Distributed request tracing |
| **Alerting** | Prometheus Alertmanager | Alert routing and notification |
| **Uptime** | External monitoring | External availability checks |

### 11.2 Application Monitoring

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| **API Latency (p50)** | Median response time | > 200ms |
| **API Latency (p95)** | 95th percentile response time | > 500ms |
| **API Latency (p99)** | 99th percentile response time | > 1000ms |
| **Error Rate** | Percentage of 5xx responses | > 1% |
| **Request Rate** | Requests per second | Anomaly detection |
| **Active Connections** | Current concurrent connections | > 1000 |

### 11.3 Infrastructure Monitoring

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| **CPU Utilization** | Server CPU usage | > 80% for 5 min |
| **Memory Utilization** | Server memory usage | > 85% for 5 min |
| **Disk Utilization** | Server disk usage | > 85% |
| **Network I/O** | Network traffic in/out | Anomaly detection |
| **Container Count** | Running containers | Unexpected change |

### 11.4 Database Monitoring

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| **Connection Count** | Active database connections | > 80% of max |
| **Query Latency (p95)** | Slow query performance | > 200ms |
| **Slow Queries** | Queries exceeding threshold | > 0 per minute |
| **Lock Wait Time** | Time waiting for locks | > 1s |
| **Replication Lag** | Primary-replica lag | > 5s |
| **Database Size** | Total database size | > 80% capacity |

### 11.5 Cache Monitoring

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| **Hit Rate** | Cache hit percentage | < 80% |
| **Memory Usage** | Redis memory usage | > 80% of max |
| **Connected Clients** | Active Redis connections | > 100 |
| **Eviction Rate** | Keys evicted per second | > 0 |

### 11.6 Queue Monitoring

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| **Queue Depth** | Pending jobs in queue | > 100 |
| **Job Processing Time** | Average job processing time | > 30s |
| **Job Failure Rate** | Failed jobs per hour | > 5 |
| **Worker Count** | Active queue workers | < expected |

### 11.7 Health Check Endpoints

```
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-07-20T10:00:00Z",
  "version": "1.2.0",
  "checks": {
    "database": { "status": "healthy", "latency": "5ms" },
    "redis": { "status": "healthy", "latency": "2ms" },
    "queue": { "status": "healthy", "pending": 0 }
  }
}
```

**Health check rules:**

| Rule | Description |
|------|-------------|
| Always available | Health endpoint requires no authentication |
| Include dependencies | Check all critical dependencies |
| Latency included | Report latency of each dependency |
| Status codes | 200 for healthy, 503 for unhealthy |

### 11.8 Alerting Rules

| Alert | Condition | Severity | Notification |
|-------|-----------|----------|-------------|
| API High Error Rate | > 5% errors for 5 min | Critical | PagerDuty + Slack |
| API High Latency | p95 > 1s for 5 min | High | Slack |
| Database Connection Pool | > 80% for 5 min | High | Slack |
| Queue Depth High | > 100 for 10 min | Medium | Slack |
| Disk Space Low | > 85% | High | Slack |
| Memory High | > 85% for 5 min | High | Slack |
| Certificate Expiry | < 30 days | Medium | Email |
| Deployment Complete | Successful deploy | Info | Slack |

### 11.9 Dashboards

| Dashboard | Purpose |
|-----------|---------|
| **Application Overview** | API latency, error rate, request rate |
| **Infrastructure** | CPU, memory, disk, network |
| **Database** | Connections, query latency, locks |
| **Queue** | Queue depth, processing time, failures |
| **Deployment** | Deployment history, rollback events |
| **Business** | Active users, API usage per tenant |

---

## 12. Logging Standards

### 12.1 Log Levels (Operational)

| Level | When to Use | Retention |
|-------|------------|-----------|
| **ERROR** | System errors requiring attention | 90 days |
| **WARN** | Recoverable issues | 30 days |
| **LOG** | Business operations | 7 days |
| **DEBUG** | Diagnostic information | 3 days |

### 12.2 Structured Logging

All logs are structured JSON:

```json
{
  "timestamp": "2026-07-20T10:00:00.000Z",
  "level": "log",
  "context": "UserService",
  "message": "User created",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "tenantId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "data": { "studentId": "..." },
  "http": {
    "method": "POST",
    "url": "/api/v1/people/students",
    "statusCode": 201,
    "latency": "45ms"
  }
}
```

### 12.3 Correlation IDs

Correlation IDs enable distributed tracing across services:

| Rule | Description |
|------|-------------|
| Client-generated | Client creates correlation ID |
| Propagated | Server propagates to all downstream calls |
| Included in events | Correlation ID included in event envelope |
| Logged | Correlation ID in all log entries |
| Returned | Correlation ID in response headers |

### 12.4 Sensitive Data Masking

| Data | Treatment |
|------|-----------|
| Passwords | `[REDACTED]` |
| JWT tokens | `[REDACTED]` |
| Email | `j***@example.com` |
| Phone | `***-***-1234` |
| Credit cards | `[REDACTED]` |
| Medical data | `[REDACTED]` |
| API keys | `[REDACTED]` |

### 12.5 Centralized Log Storage

| Environment | Log Destination | Retention |
|-------------|----------------|-----------|
| Development | Local stdout | Session only |
| Shared Development | Centralized logging | 7 days |
| QA | Centralized logging | 30 days |
| Staging | Centralized logging | 30 days |
| Production | Centralized logging | 90 days |

### 12.6 Log Retention Policy

| Log Type | Retention | Archival |
|----------|-----------|----------|
| Application logs | 90 days | Archive to cold storage |
| Audit logs | 365 days | Archive to cold storage |
| Access logs | 30 days | Archive to cold storage |
| Security logs | 365 days | Archive to cold storage |
| Debug logs | 3 days | Delete |

---

## 13. Security Operations

### 13.1 Vulnerability Management

| Activity | Frequency | Description |
|----------|-----------|-------------|
| Dependency audit | Weekly | `npm audit`, `flutter pub audit` |
| Container scan | Every build | Scan Docker images for CVEs |
| Static analysis | Every build | SAST scanning |
| Penetration testing | Annually | Third-party security audit |
| Security review | Quarterly | Review security practices |

### 13.2 Dependency Updates

| Priority | Timeframe | Description |
|----------|-----------|-------------|
| Critical | 24 hours | Remote code execution, data breach |
| High | 7 days | Authentication bypass, privilege escalation |
| Medium | 30 days | XSS, CSRF, information disclosure |
| Low | 90 days | Minor vulnerabilities, code quality |

### 13.3 Security Scanning

| Scan | Tool | Frequency |
|------|------|-----------|
| npm audit | npm | Every build |
| Container scan | Trivy | Every build |
| SAST | Semgrep | Every build |
| Secret scanning | GitGuardian | Every push |
| License compliance | License-checker | Weekly |

### 13.4 Patch Management

| System | Patch Frequency | Process |
|--------|----------------|---------|
| Application dependencies | Weekly | Automated PR + review |
| Base Docker images | Monthly | Rebuild with updated base |
| OS packages | Monthly | Rebuild Docker images |
| Database | Quarterly | Apply minor version updates |

### 13.5 Incident Response

| Phase | Actions |
|-------|---------|
| **Detection** | Alert triggers; on-call engineer notified |
| **Triage** | Assess severity; determine impact |
| **Containment** | Isolate affected systems; prevent spread |
| **Eradication** | Remove root cause |
| **Recovery** | Restore service; verify functionality |
| **Post-Incident** | Document incident; conduct review; implement improvements |

**Severity levels:**

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|---------|
| **P1 — Critical** | Complete outage, data loss | 15 minutes | Database down, security breach |
| **P2 — High** | Major feature unavailable | 1 hour | Payment processing failure |
| **P3 — Medium** | Minor feature degraded | 4 hours | Slow query, intermittent error |
| **P4 — Low** | Cosmetic or minor issue | 24 hours | UI glitch, non-critical log error |

### 13.6 Access Reviews

| Review | Frequency | Description |
|--------|-----------|-------------|
| User access review | Quarterly | Verify all users have appropriate access |
| Admin access review | Monthly | Review admin-level access |
| API key review | Quarterly | Rotate and review API keys |
| Service account review | Quarterly | Review service account permissions |

### 13.7 Audit Logging

Audit logs track all security-relevant events:

| Event | Logged |
|-------|--------|
| Authentication success/failure | Yes |
| Authorization failure | Yes |
| Admin actions | Yes |
| Configuration changes | Yes |
| Data access (sensitive) | Yes |
| Deployment events | Yes |
| Secret access | Yes |
| Security scanning results | Yes |

---

## 14. Backup & Disaster Recovery

### 14.1 Backup Strategy

| Component | Backup Method | Frequency | Retention |
|-----------|--------------|-----------|-----------|
| **PostgreSQL** | pg_dump (full) | Daily | 30 days |
| **PostgreSQL** | WAL archiving (continuous) | Continuous | 7 days |
| **Redis** | RDB snapshots | Every 6 hours | 7 days |
| **S3 Files** | Cross-region replication | Real-time | Indefinite |
| **Configuration** | Git version control | Every change | Indefinite |
| **Secrets** | Cloud secret manager | Versioned | 90 days |

### 14.2 Backup Rules

| Rule | Description |
|------|-------------|
| Automated | All backups are automated; no manual backups |
| Encrypted | All backups are encrypted at rest |
| Tested | Backup restoration tested monthly |
| Documented | Restoration procedures documented |
| Off-site | Backups stored in different region than primary |
| Verified | Backup integrity verified after creation |

### 14.3 Recovery Objectives

| Metric | V1 Target | Description |
|--------|-----------|-------------|
| **RPO (Recovery Point Objective)** | 1 hour | Maximum acceptable data loss |
| **RTO (Recovery Time Objective)** | 4 hours | Maximum acceptable downtime |
| **MTTR (Mean Time To Recovery)** | 2 hours | Average time to restore service |

### 14.4 Backup Retention

| Backup Type | Retention | Storage |
|-------------|-----------|---------|
| Daily full backup | 30 days | Warm storage |
| Weekly full backup | 90 days | Cold storage |
| Monthly full backup | 1 year | Cold storage |
| WAL archives | 7 days | Warm storage |
| S3 versioning | Indefinite | Standard storage |

### 14.5 Disaster Recovery Testing

| Test | Frequency | Description |
|------|-----------|-------------|
| Backup restoration | Monthly | Restore database from backup; verify integrity |
| Full DR drill | Quarterly | Simulate complete failure; measure RTO |
| Failover test | Quarterly | Test failover to backup region |
| Tabletop exercise | Semi-annually | Walk through DR scenarios with team |

### 14.6 Restoration Procedures

**Database restoration:**

```bash
# Restore from backup
pg_restore -h localhost -U postgres -d openschool backup_2026-07_20.dump

# Verify restoration
psql -h localhost -U postgres -d openschool -c "SELECT COUNT(*) FROM students;"
```

**Restoration rules:**

| Rule | Description |
|------|-------------|
| Verify backup integrity | Check backup file before restoration |
| Stop application | Stop application during restoration |
| Restore to clean environment | Restore to fresh database instance |
| Verify data integrity | Run data validation after restoration |
| Resume application | Restart application after verification |
| Monitor closely | Enhanced monitoring for 24 hours post-restoration |

---

## 15. Scalability Standards

### 15.1 Horizontal Scaling

| Component | Scaling Strategy | Trigger |
|-----------|-----------------|---------|
| **Backend API** | Add container instances | CPU > 70% or request rate > threshold |
| **Queue Workers** | Add worker instances | Queue depth > 100 |
| **Redis** | Cluster mode | Memory > 80% |
| **PostgreSQL** | Read replicas | Read latency > threshold |

### 15.2 Stateless Services

| Rule | Description |
|------|-------------|
| No local state | Backend services store no local state |
| External sessions | Sessions stored in Redis, not memory |
| External cache | Cache stored in Redis, not memory |
| Load balancer | Any instance can handle any request |

### 15.3 Load Balancing

| Strategy | Description |
|----------|-------------|
| Round-robin | Default for HTTP requests |
| Least connections | For long-lived connections |
| IP hash | For sticky sessions (if needed) |

### 15.4 Database Scaling

| Strategy | When to Apply |
|----------|--------------|
| Read replicas | High read volume |
| Connection pooling | Many concurrent connections |
| Query optimization | Slow queries |
| Partitioning | Very large tables |
| Archival | Historical data growth |

### 15.5 Cache Scaling

| Strategy | Description |
|----------|-------------|
| Redis Cluster | Distribute data across nodes |
| Cache warming | Pre-populate cache on deployment |
| Cache invalidation | Invalidate on data change |
| TTL management | Appropriate TTLs per data type |

### 15.6 Queue Scaling

| Strategy | Description |
|----------|-------------|
| Worker scaling | Add workers based on queue depth |
| Priority queues | Prioritize critical jobs |
| Rate limiting | Limit job processing rate |
| Dead letter handling | Process failed jobs separately |

### 15.7 Storage Growth

| Component | Growth Rate | Monitoring |
|-----------|------------|------------|
| PostgreSQL | ~1GB/month | Daily size check |
| S3 Files | ~10GB/month | Monthly review |
| Redis | ~500MB/month | Daily memory check |
| Logs | ~5GB/month | Daily size check |

---

## 16. Operational Runbooks

### 16.1 Deployment Runbook

**Pre-deployment:**

1. Verify all tests pass in staging
2. Verify backup exists (database)
3. Verify rollback plan is documented
4. Notify stakeholders of deployment window
5. Confirm deployment approval

**Deployment:**

1. Pull latest code from main
2. Build Docker images
3. Push images to registry
4. Update docker-compose with new image tags
5. Run database migrations (if applicable)
6. Restart backend containers
7. Verify health check endpoints
8. Run smoke tests

**Post-deployment:**

1. Monitor error rates for 30 minutes
2. Monitor API latency for 30 minutes
3. Verify key user flows
4. Confirm deployment in monitoring dashboard
5. Document deployment in changelog

### 16.2 Rollback Runbook

**When to rollback:**

- Error rate > 5% after deployment
- Critical feature broken
- Data corruption detected
- Security vulnerability introduced

**Rollback procedure:**

1. Stop deployment process
2. Revert to previous Docker image tag
3. Rollback database migration (if applicable)
4. Restart containers with previous image
5. Verify health checks
6. Run smoke tests
7. Monitor for stability
8. Document rollback and root cause

### 16.3 Database Migration Failure Runbook

**When migration fails:**

1. Stop application traffic (if possible)
2. Assess migration failure impact
3. Check migration logs for errors
4. If partial completion:
   - Manually fix schema to consistent state
   - Mark migration as applied/rolled back
5. If data corruption:
   - Restore from backup
   - Re-apply migration with fix
6. If reversible:
   - Run rollback migration
   - Verify schema consistency
7. Resume application traffic
8. Document incident

### 16.4 Queue Failure Runbook

**When queue fails:**

1. Check Redis connectivity
2. Check queue depth and processing rate
3. Restart queue workers
4. If Redis is down:
   - Restart Redis service
   - Verify data integrity
   - Reprocess failed jobs
5. If worker is stuck:
   - Kill stuck worker
   - Start new worker
   - Reprocess failed jobs
6. Monitor queue health for 1 hour

### 16.5 Service Outage Runbook

**When service is down:**

1. Confirm outage (check health endpoints)
2. Assess impact (which services affected)
3. Check infrastructure (CPU, memory, disk)
4. Check dependencies (database, Redis, S3)
5. Restart affected services
6. If infrastructure issue:
   - Scale resources if needed
   - Contact infrastructure provider
7. Verify service recovery
8. Communicate status to stakeholders
9. Conduct post-incident review

### 16.6 Third-Party Provider Failure Runbook

**When external provider fails:**

1. Identify affected provider
2. Check provider status page
3. Implement circuit breaker (if not automatic)
4. Enable fallback behavior (if available)
5. Notify affected users
6. Monitor for provider recovery
7. Verify functionality after recovery
8. Document impact and response

### 16.7 High Resource Utilization Runbook

**When resources are high:**

1. Identify resource bottleneck (CPU, memory, disk)
2. Identify cause (traffic spike, memory leak, runaway query)
3. If traffic spike:
   - Scale horizontally (add instances)
   - Scale vertically (increase resources)
4. If memory leak:
   - Restart affected service
   - Identify and fix leak
5. If slow query:
   - Identify query
   - Add index or optimize
6. Monitor until stable

### 16.8 Incident Escalation

| Level | When | Who | Actions |
|-------|------|-----|---------|
| **L1** | First alert | On-call engineer | Investigate, attempt resolution |
| **L2** | L1 unresolved after 30 min | Senior engineer | Deep investigation, escalation |
| **L3** | L2 unresolved after 1 hour | Engineering lead + Ops lead | Major incident response |
| **L4** | Complete outage | CTO + all hands | Emergency response |

---

## 17. Maintenance Windows

### 17.1 Scheduled Maintenance

| Type | Frequency | Window | Duration | Notification |
|------|-----------|--------|----------|-------------|
| **Planned maintenance** | Monthly | 1st Saturday, 02:00–06:00 UTC | 4 hours | 7 days advance |
| **Security patching** | Monthly | 3rd Tuesday, 02:00–04:00 UTC | 2 hours | 3 days advance |
| **Database maintenance** | Weekly | Sunday, 03:00–04:00 UTC | 1 hour | 1 day advance |
| **Infrastructure update** | Quarterly | 2nd Saturday, 02:00–06:00 UTC | 4 hours | 14 days advance |

### 17.2 User Communication

| Phase | Communication | Channel |
|-------|--------------|---------|
| **7 days before** | Maintenance announcement | Email + in-app banner |
| **1 day before** | Reminder notification | Email + in-app banner |
| **1 hour before** | Final warning | In-app banner |
| **During maintenance** | Status page update | Status page |
| **After maintenance** | Completion notice | Email + in-app banner |

### 17.3 Maintenance Procedures

**Pre-maintenance:**

1. Verify backup exists (within last 24 hours)
2. Notify stakeholders
3. Enable maintenance mode banner
4. Drain active connections (graceful shutdown)

**During maintenance:**

1. Apply updates/migrations
2. Verify system health
3. Run smoke tests
4. Check monitoring dashboards

**Post-maintenance:**

1. Disable maintenance mode banner
2. Verify all services are healthy
3. Monitor error rates for 30 minutes
4. Confirm completion to stakeholders

### 17.4 Downtime Procedures

For maintenance requiring downtime:

1. **5 minutes before**: Display "system down for maintenance" page
2. **During**: Apply changes
3. **After**: Remove maintenance page
4. **Verify**: Run smoke tests
5. **Monitor**: Enhanced monitoring for 1 hour

---

## 18. Business Continuity

### 18.1 Infrastructure Failures

| Scenario | Impact | Response |
|----------|--------|----------|
| Single container failure | Service degraded | Auto-restart via Docker |
| Host machine failure | Service unavailable | Failover to another host |
| Network failure | Partial connectivity | Switch to backup network |
| Complete infrastructure failure | Full outage | Activate DR plan |

### 18.2 Database Failures

| Scenario | Impact | Response |
|----------|--------|----------|
| Single query failure | Request error | Retry with backoff |
| Connection pool exhaustion | Request queuing | Scale connections |
| Database crash | All queries fail | Restart database; restore from backup |
| Data corruption | Data integrity risk | Restore from backup; verify integrity |

### 18.3 Cloud Provider Outages

| Scenario | Impact | Response |
|----------|--------|----------|
| Single service outage | Feature unavailable | Enable fallback behavior |
| Multi-service outage | Partial platform impact | Notify users; wait for recovery |
| Complete region outage | Full platform outage | Activate multi-region DR |

### 18.4 Security Incidents

| Scenario | Impact | Response |
|----------|--------|----------|
| Data breach | Data exposure | Contain; notify; investigate |
| DDoS attack | Service degradation | Enable rate limiting; CDN |
| Ransomware | Data encryption | Isolate; restore from backup |
| Unauthorized access | Potential data access | Revoke access; audit logs |

### 18.5 Data Recovery

| Scenario | Recovery Method | RTO |
|----------|----------------|-----|
| Accidental deletion | Restore from backup | 1 hour |
| Data corruption | Restore from backup | 2 hours |
| Database failure | Failover to replica | 15 minutes |
| Complete data loss | Full restoration from backup | 4 hours |

---

## 19. Future Expansion

### 19.1 V2 Operational Enhancements

| Enhancement | Description | Prerequisite |
|-------------|-------------|--------------|
| **Kubernetes migration** | Move from Docker Compose to Kubernetes | Single-instance validated |
| **Multi-region deployment** | Deploy across multiple regions | Kubernetes migration |
| **Service mesh** | Istio or Linkerd for service communication | Kubernetes migration |
| **Advanced monitoring** | APM tools (Datadog, New Relic) | Budget approval |

### 19.2 V3 Operational Enhancements

| Enhancement | Description | Prerequisite |
|-------------|-------------|--------------|
| **Smart Campus infrastructure** | IoT device management, edge computing | Smart Campus domain |
| **AI workload infrastructure** | GPU-enabled compute for ML models | AI domain |
| **Real-time analytics infrastructure** | Stream processing (Kafka, Kinesis) | Analytics V2 |

### 19.3 V4 Operational Enhancements

| Enhancement | Description | Prerequisite |
|-------------|-------------|--------------|
| **Enterprise multi-tenant** | Dedicated infrastructure per enterprise tenant | Enterprise domain |
| **Global deployment** | Multi-continental deployment | Multi-region V2 |
| **Compliance infrastructure** | SOC2, GDPR compliance tooling | Enterprise requirements |

---

## 20. Architecture Decision Records

### 20.1 Infrastructure ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-OPS-01 | Docker Compose for V1 | Simple; sufficient for single-instance; easy local dev |
| ADR-OPS-02 | Multi-stage Docker builds | Smaller images; better security; faster pulls |
| ADR-OPS-03 | Alpine base images | Minimal size; reduced attack surface |
| ADR-OPS-04 | PostgreSQL 16+ | JSONB support; partitioning; maturity |

### 20.2 CI/CD ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-OPS-05 | GitHub Actions for CI/CD | Integrated with GitHub; sufficient for V1 |
| ADR-OPS-06 | Squash merge for features | Clean history; one commit per feature |
| ADR-OPS-07 | Quality gates before deployment | Prevent broken code from reaching production |
| ADR-OPS-08 | Manual approval for production | Human oversight for critical deployments |

### 20.3 Backup ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-OPS-09 | Daily full backups | RPO of 1 hour achievable with WAL + daily |
| ADR-OPS-10 | 30-day retention | Balance storage cost with recovery needs |
| ADR-OPS-11 | Off-site backups | Protect against regional disasters |
| ADR-OPS-12 | Monthly restoration tests | Verify backups are actually restorable |

### 20.4 Monitoring ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-OPS-13 | Prometheus + Grafana | Open source; sufficient for V1; no license cost |
| ADR-OPS-14 | Structured JSON logging | Machine-parseable; centralized aggregation |
| ADR-OPS-15 | Correlation IDs | End-to-end tracing across services |
| ADR-OPS-16 | Alertmanager for alerts | Integration with Prometheus; multi-channel routing |

### 20.5 Deployment ADRs

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-OPS-17 | Immutable deployments | Replace containers, never modify; simple rollback |
| ADR-OPS-18 | Deployment windows | Reduce risk; predictable maintenance schedule |
| ADR-OPS-19 | Rollback over fix-forward | Faster recovery; less risk |
| ADR-OPS-20 | Semantic versioning | Clear communication of change scope |

---

## 21. Operational Review Checklist

Use this checklist before any production deployment.

### 21.1 Infrastructure Readiness

- [ ] Docker images built successfully
- [ ] Images scanned for vulnerabilities
- [ ] Images tagged with correct version
- [ ] Images pushed to registry
- [ ] Docker Compose updated with new image tags
- [ ] Infrastructure resources adequate (CPU, memory, disk)

### 21.2 Security Verification

- [ ] No secrets in Docker images
- [ ] Security scan clean (no high/critical CVEs)
- [ ] Authentication and authorization verified
- [ ] Rate limiting configured
- [ ] CORS configured correctly
- [ ] TLS certificates valid

### 21.3 Backup Verification

- [ ] Database backup exists (within 24 hours)
- [ ] Backup integrity verified
- [ ] Restoration procedure documented
- [ ] File storage backup current
- [ ] Configuration backup current

### 21.4 Monitoring Verification

- [ ] Health check endpoints responding
- [ ] Alert rules configured for new features
- [ ] Dashboard updated for new metrics
- [ ] Log aggregation working
- [ ] Correlation IDs functioning

### 21.5 Deployment Validation

- [ ] All tests pass (unit, integration, E2E)
- [ ] Test coverage meets minimum threshold
- [ ] Smoke tests pass in staging
- [ ] Performance tests pass in staging
- [ ] Load tests pass (if applicable)

### 21.6 Rollback Readiness

- [ ] Previous version Docker images available
- [ ] Rollback procedure documented
- [ ] Database rollback procedure documented (if applicable)
- [ ] Rollback tested in staging
- [ ] Rollback approval process defined

### 21.7 Post-Deployment Validation

- [ ] Health checks passing after deployment
- [ ] Error rate within acceptable range
- [ ] API latency within acceptable range
- [ ] Key user flows verified
- [ ] Monitoring dashboards reviewed
- [ ] Deployment documented in changelog
- [ ] Stakeholders notified of completion

---

## Appendix A: Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | — | Environment (development/testing/staging/production) |
| `PORT` | No | 3000 | Application port |
| `API_PREFIX` | No | api | API route prefix |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_HOST` | No | localhost | Redis host |
| `REDIS_PORT` | No | 6379 | Redis port |
| `REDIS_PASSWORD` | No | — | Redis password |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `JWT_EXPIRES_IN` | No | 1h | JWT expiry duration |
| `JWT_REFRESH_EXPIRES_IN` | No | 7d | Refresh token expiry |
| `S3_BUCKET` | Yes | — | S3 bucket name |
| `S3_REGION` | Yes | — | S3 region |
| `AWS_ACCESS_KEY_ID` | Yes | — | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | — | AWS secret key |
| `SMTP_HOST` | Yes | — | SMTP server host |
| `SMTP_PORT` | No | 587 | SMTP server port |
| `SMTP_USER` | Yes | — | SMTP username |
| `SMTP_PASSWORD` | Yes | — | SMTP password |
| `LOG_LEVEL` | No | log | Logging level |
| `CORS_ORIGIN` | No | * | Allowed CORS origins |
| `ENABLE_*` | No | false | Feature flags |

---

## Appendix B: Docker Compose Reference

### Development Compose

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: ./apps/backend
      target: builder
    volumes:
      - ./apps/backend/src:/app/src
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://openschool:password@postgres:5432/openschool
      - REDIS_HOST=redis
      - JWT_SECRET=dev-secret-key-minimum-32-characters
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: openschool
      POSTGRES_USER: openschool
      POSTGRES_PASSWORD: password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

### Production Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    image: openschool/backend:${VERSION}
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    secrets:
      - database_url
      - jwt_secret
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 3s
      retries: 3
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/certs:/etc/nginx/certs
    depends_on:
      - backend

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: openschool
      POSTGRES_USER: openschool
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

secrets:
  database_url:
    file: ./secrets/database_url.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt

volumes:
  postgres_data:
  redis_data:
```

---

## 22. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-20 | Initial creation — Platform DevOps & Deployment Standards derived from 01 Engineering Standards and infrastructure requirements |

---

*This document is the authoritative DevOps and deployment standard for the OpenSchool ERP platform. All infrastructure changes, deployments, and operational procedures must conform to this guide. Changes require architecture review.*



---


*End of Consolidated Platform Standards — Version 1.0.0 — 2026-07-20*
