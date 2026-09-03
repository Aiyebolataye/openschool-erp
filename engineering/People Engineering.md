# People Engineering Specification

**Domain:** People
**Scope:** Person core identity, Student, Staff, Parent, Guardian, Applicant, Emergency Contact, Person Relationships, People Documents
**Created:** 2026-07-17
**Status:** Approved — Permanent Engineering Specification
**Version:** 3.0.0
**Last Updated:** 2026-07-17

---

## Table of Contents

1. [Overview](#1-overview)
2. [Engineering Principles](#2-engineering-principles)
3. [Architecture Decision Records](#3-architecture-decision-records)
4. [Engineering Status](#4-engineering-status)
5. [Phase 1 — Domain Analysis](#5-phase-1--domain-analysis)
6. [Phase 2 — Domain Design](#6-phase-2--domain-design)
7. [Phase 3 — Database Design](#7-phase-3--database-design)
8. [Phase 4 — Prisma Schema](#8-phase-4--prisma-schema)
9. [Phase 5 — Backend Implementation](#9-phase-5--backend-implementation)
10. [Phase 6 — API Design](#10-phase-6--api-design)
11. [Phase 7 — Testing & Verification](#11-phase-7--testing--verification)
12. [Person Merge & Deduplication Strategy](#12-person-merge--deduplication-strategy)
13. [Person vs User Responsibilities](#13-person-vs-user-responsibilities)
14. [Address Modelling](#14-address-modelling)
15. [Data Retention & Archival Rules](#15-data-retention--archival-rules)
16. [Outstanding Items](#16-outstanding-items)
17. [Future Integration Extension Points](#17-future-integration-extension-points)
18. [Revision History](#18-revision-history)

---

## 1. Overview

People is the foundational identity domain governing person lifecycle, role-specific attributes (Student, Staff, Parent, Guardian, Applicant), relationships, and document references across all platform services.

| Aspect | Approach |
|--------|----------|
| Identity | Person as core identity; role-specific sub-types inherit from Person |
| Relationships | Bidirectional person-to-person relationships with temporal validity |
| Documents | References only; file storage owned by Platform Services domain |
| Data Ownership | Institution-scoped; every Person belongs to one or more Institutions |
| Sub-types | Student, Staff, Parent, Guardian, Applicant — each adds role-specific attributes |
| Lifecycle | Person created → Active → (Inactive) → Active → Soft Deleted (via deleted_at) → (Restored) |

**In Scope:** Person CRUD, Student/Staff/Parent/Guardian/Applicant management, Emergency Contacts, Person Relationships, People Documents, Person search, Person profile management, Address management, Person merge & deduplication
**Out of Scope:** Authentication (Identity & Access), Authorization/Roles/Permissions (Identity & Access), Sessions/MFA (Identity & Access), Academic Records/Attendance/Timetables/Results (Academics), Finance operations (Finance), Notifications (Communication), Institution Configuration (Institution Management), File storage infrastructure (Platform Services)

---

## 2. Engineering Principles

### Core Philosophy

- **Person as Root Aggregate:** Person is the core aggregate of the People domain. Student, Staff, Parent, Guardian, Applicant, and future types (Alumni, Volunteers, Contractors, Visitors) all extend Person. Role-specific entities add business attributes while Person owns the common identity shared by all people.
- **Domain-First Architecture:** Every domain is self-contained with its own aggregates, services, and persistence
- **Multi-Tenant Isolation by Default:** Every query scoped to tenant context; cross-tenant access = security violation
- **Person as Core Identity:** Authentication is Identity & Access; People owns business attributes and relationships
- **Role-Specific Inheritance:** Student, Staff, Parent, Guardian, Applicant extend Person with role-specific attributes
- **Relationship-Driven:** Person Relationships model family, guardian, staff-student, and emergency connections
- **Document References Only:** People stores metadata and references; file storage belongs to Platform Services
- **Event-Driven Communication:** Cross-service communication via domain events; eventual consistency
- **Soft Delete by Default:** All core entities support restore within retention period; business status (PersonStatus) is separate from soft delete (`deleted_at`)
- **Optimistic Concurrency:** Version column on mutable entities; no pessimistic locking; 409 Conflict on version mismatch
- **Immutable Audit Logging:** Append-only audit logs; never update or delete
- **Temporal Relationships:** Person Relationships have validity periods (start/end date)
- **Institution Scoping:** Every Person is scoped to one or more Institutions

### Public Business Identifiers

Every entity exposed to end users carries an immutable, human-readable public business identifier in addition to the internal UUID primary key.

| Entity | Format | Example | Storage |
|--------|--------|---------|---------|
| Person | P-YYYY-NNNNNN | P-2026-000123 | `public_id` varchar(20) UNIQUE |
| Student | STU-YYYY-NNNNNN | STU-2026-000456 | `public_id` varchar(20) UNIQUE |
| Staff | EMP-YYYY-NNNNNN | EMP-2026-000789 | `public_id` varchar(20) UNIQUE |
| Applicant | APP-YYYY-NNNNNN | APP-2026-000012 | `public_id` varchar(20) UNIQUE |

**Rules:**
- Public IDs are generated on creation and are **immutable** — never updated, recycled, or reassigned
- Public IDs are **not** primary keys; they are unique business keys used for display and lookup
- Public IDs are scoped to tenant (`UNIQUE(tenant_id, public_id)`)
- Sequential within tenant and calendar year; resets annually
- Used as search targets; API responses always include public ID
- Public IDs are not used for authorization decisions; internal UUIDs remain the source of truth

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Database tables | snake_case, plural | people, students |
| Columns | snake_case | first_name, created_at |
| Enums | SCREAMING_SNAKE_CASE | PERSON_STATUS_ACTIVE |
| Classes | PascalCase | PersonAggregate |
| Methods | camelCase | createPerson |
| API responses | camelCase | success, personId |
| Events | PascalCase, past tense | PersonCreated |
| Errors | PascalCase + Error | PersonNotFoundError |
| Permissions | `{domain}:{resource}:{action}` | people:person:read |

### Tenant Isolation

- Tenant ID extracted from JWT and passed to repository methods as first parameter
- Application-level filtering (no Postgres Row-Level Security)
- Every query must include tenant filter
- Person records can span multiple Institutions within a tenant

### Soft Delete

- All mutable core entities use soft delete via `deleted_at` / `deleted_by` columns
- **PersonStatus is a business status, not a deletion marker** — PersonStatus enum values are `ACTIVE` and `INACTIVE` only; soft delete is controlled exclusively by `deleted_at`
- 30-day restore window before permanent deletion
- Restore reverts `deleted_at`, `deleted_by`, and sets `is_active` = true
- Permanent deletion only via admin job after retention period
- Person records retained after soft delete for relationship integrity

### Event Versioning

All domain events carry a versioned envelope for schema evolution and idempotency:

| Field | Type | Description |
|-------|------|-------------|
| eventId | uuid | Unique event identifier (primary deduplication key) |
| eventVersion | int | Monotonically increasing per event type; incremented on payload schema changes |
| schemaVersion | string | Payload schema version (e.g., "1.0.0") |
| occurredAt | timestamptz | When the event occurred |
| correlationId | uuid | Groups related events across a single user action |
| causationId | uuid | ID of the event or command that caused this event |
| tenantId | uuid | Tenant context |
| actorId | uuid | User who triggered the event |

Consumers must check `eventVersion` to handle backward-compatible payload changes.

### Audit Logging

Every state-changing operation generates an append-only audit log entry with: entity_type, entity_id, action, actor_id, actor_email, changes (JSON diff), context_ip, context_user_agent, timestamp.

### Error Handling

- Structured error responses: `{ success: false, error: { code, message, details[] } }`
- Domain-specific error classes; never expose internal details
- Full error context logged server-side

### Optimistic Concurrency Details

- All mutable entities include a `version` column (`Int @default(1)`)
- Every update increments `version` by 1 via `WHERE version = @expectedVersion`
- If the `version` in the database does not match `@expectedVersion`, the update affects 0 rows
- Repository layer detects 0-row update and throws `OptimisticLockError`
- Controller layer catches `OptimisticLockError` and returns `409 Conflict`:
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
- Clients must refresh the resource, re-read the current version, and resubmit

### Prisma Schema Principles

- UUID `@default(uuid())` for all primary keys
- `@unique` constraints for business keys
- `@map` for snake_case column names
- Soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status via `status` enum (not a soft delete marker)
- Optimistic locking via `version` (Int @default(1))
- Audit fields: created_at, created_by, updated_at, updated_by
- JSON columns for flexible data (profile metadata, relationship metadata)
- Prisma enums mapped to database types
- Public business identifiers via `public_id` (varchar(20), UNIQUE per tenant)

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js >=22.0.0 |
| Framework | NestJS ^11.0.0 |
| ORM | Prisma ^6.12.0 |
| Language | TypeScript ^5.8.3 |
| Validation | class-validator + class-transformer |
| Auth | JWT + bcrypt |
| Testing | Jest ^30.0.0 |
| Migrations | Prisma Migrate |
| API Docs | Swagger/OpenAPI ^7.0.0 |

---

## 3. Architecture Decision Records

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | Person as core identity separate from User authentication | Clean separation of concerns; Person owns business attributes; User owns authentication |
| ADR-002 | Role-specific sub-types (Student, Staff, Parent, Guardian, Applicant) extend Person | Supports polymorphic entity without single-table inheritance bloat |
| ADR-003 | Person Relationships are bidirectional with temporal validity | Models real-world relationships (parent-student, guardian-student) with time bounds |
| ADR-004 | Documents are references only; file storage belongs to Platform Services | Clear ownership; People manages metadata, Platform Services manages storage |
| ADR-005 | Person is Institution-scoped (many-to-many) | A person can belong to multiple Institutions (e.g., student transferring, staff at multiple campuses) |
| ADR-006 | Emergency Contacts are first-class entities | Emergency contacts need independent CRUD and cannot be modeled as simple relationships |
| ADR-007 | Person sub-type attributes stored in separate tables | Normalized design; avoids sparse columns; supports role-specific queries |
| ADR-008 | Staff employment details include department, position, and qualification tracking | Supports HR operations without duplicating employment data |
| ADR-009 | Student enrollment details include academic record, graduation, and transfer tracking | Supports academic lifecycle management without duplicating enrollment data |
| ADR-010 | Person Relationships support multiple relationship types (parent, guardian, sibling, emergency) | Flexible relationship model supports complex family structures |
| ADR-011 | Application-level tenant isolation (no RLS) | Consistent with Identity & Access and Institution Management |
| ADR-012 | Soft delete with 30-day retention | Prevents accidental data loss; supports compliance |
| ADR-013 | Domain events via EventEmitter2 (in-process) | Decouples services; supports async processing; future migration to MQ |
| ADR-014 | Optimistic concurrency (version column) | Prevents lost updates; no pessimistic locking overhead |
| ADR-015 | Immutable audit logs (append-only) | Tamper-proof audit trail; compliance requirement |
| ADR-016 | Person search supports full-text across name, email, phone | Primary use case is finding people by name or contact info |
| ADR-017 | Guardian and Parent are distinct sub-types | Guardians may not be biological parents; different legal implications |
| ADR-018 | Applicant is a transient sub-type | Applicants may become Students or Staff; lifecycle is short |
| ADR-019 | Staff employment history is tracked as separate entities | Supports HR compliance and audit requirements |
| ADR-020 | Student academic record is reference-only (owned by Academics domain) | Clear domain boundary; People stores enrollment metadata, Academics stores grades/attendance |
| ADR-021 | Person profile supports flexible custom fields via JSON | Institutions have varying attribute requirements |
| ADR-022 | Emergency Contacts can be linked to multiple People | A single emergency contact may be relevant for multiple family members |
| ADR-023 | Authorized Pickup Persons modeled as Person Relationships | Supports school-specific security requirements |
| ADR-024 | Person metadata (profile photo, bio) stored as file references | Consistent with document reference approach |
| ADR-025 | Institution-person assignment includes role context | A person's role (Student, Staff) may differ across Institutions |
| ADR-026 | Person search respects tenant isolation | Security: search results never cross tenant boundaries |
| ADR-027 | Staff qualifications and certifications are versioned | Supports compliance tracking and renewal management |
| ADR-028 | Student transfer details include source/destination Institution references | Supports inter-Institution student mobility |
| ADR-029 | Person Relationships are institution-scoped | A parent-student relationship exists within an Institution context |
| ADR-030 | Applicant status transitions are time-bounded | Applications have expiry dates; stale applicants are auto-archived |
| ADR-031 | Person is the root aggregate of the People domain | All role-specific entities (Student, Staff, Parent, Guardian, Applicant) extend Person; Person owns the common identity |
| ADR-032 | User authentication belongs exclusively to Identity & Access | A Person may exist without a User account; creating role records does not create authentication credentials |
| ADR-033 | Person Relationships are first-class domain concepts | Relationships have their own lifecycle, temporal validity, and audit trail; not modeled as simple foreign keys |
| ADR-034 | People Documents are references, not owned | File storage belongs to Platform Services; People manages metadata and references only |
| ADR-035 | Person lifecycle is independent of authentication | Person can be Active, Inactive, or Soft Deleted regardless of whether a User account exists |
| ADR-036 | Person identity is preserved across role changes | A Staff member becoming a Parent retains the same Person identity; no new Person record created |
| ADR-037 | Merge operations preserve audit history | When duplicate Person records are merged, all historical relationships, references, and audit entries are preserved |
| ADR-038 | Address is a reusable Value Object | Addresses support multiple types (Residential, Mailing, Billing, Emergency) and are Person-scoped |
| ADR-039 | Future person types extend Person | Alumni, Volunteers, Contractors, Visitors, and other future types follow the same extension pattern |
| ADR-040 | Public business identifiers are immutable, non-primary business keys | Every entity exposed to end users carries a human-readable public ID (e.g., P-2026-000123) that is immutable, never a PK, and scoped to tenant |
| ADR-041 | PersonStatus contains only business states (ACTIVE, INACTIVE) | Soft delete is controlled exclusively by `deleted_at`/`deleted_by`; `PersonStatus` is never set to DELETED; business status and deletion lifecycle are orthogonal concerns |
| ADR-042 | Domain events carry a versioned envelope | Every event includes eventId, eventVersion, schemaVersion, occurredAt, correlationId, causationId, tenantId, and actorId for schema evolution, idempotency, and traceability |
| ADR-043 | Domain event consumers must be idempotent | Every consumer checks eventId-based deduplication before processing; retrying an event must produce the same result with no side effects |
| ADR-044 | Merge conflicts resolved by field-level precedence | When merging duplicate Person records: verified fields > admin-selected fields > newest non-null value > old value retained in audit trail |

---

## 4. Engineering Status

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 1 — Domain Analysis | Complete | 13 entities, 33 domain events, 24 business rules |
| Phase 2 — Domain Design | Complete | 10 aggregates, 25 invariants, 18 policies, 8 validation rule sets, relationship cardinality rules |
| Phase 3 — Database Design | Complete | 20 tables, 40+ indexes, 15 unique constraints |
| Phase 4 — Prisma Schema | Complete | 20 models, 10 enums, 2-pass validation |
| Phase 5 — Backend Implementation | Complete | 11 modules, 10 repositories, 11 domain services, 10 controllers, 7 event consumers |
| Phase 6 — API Design | Complete | 58 endpoints (38 primary + 20 sub-resource) |
| Phase 7 — Testing & Verification | Complete | 15 test categories, ~310+ test scenarios |
| Refinement #1 | Complete | Person as root aggregate, relationship cardinality, merge strategy, Person vs User, address modelling, data retention, ADRs |
| Refinement #2 | Complete | Public business identifiers, optimistic concurrency expansion, domain event versioning, expanded search, merge conflict resolution, event idempotency, soft delete vs status, future integration extension points, ADR-040 through ADR-044 |

**Overall Status:** Approved — Permanent Engineering Specification.

---

## 5. Phase 1 — Domain Analysis

### 5.1 Domain Purpose

People is the foundational identity domain governing person lifecycle, role-specific attributes (Student, Staff, Parent, Guardian, Applicant), relationships, and document references across all platform services.

Every platform operation involving a human actor — academic enrollment, staff management, parent communication, applicant processing — is anchored to a Person record. This domain defines those Person records, their role-specific extensions, the relationships between them, and the document references associated with them.

### 5.2 Domain Responsibilities

| Responsibility | Description |
|----------------|-------------|
| Person Management | Create, update, soft delete, and restore Person records |
| Student Management | Student-specific attributes: enrollment details, academic record references, graduation, transfer, withdrawal |
| Staff Management | Staff-specific attributes: employment details, position, department, qualifications, certifications, employment history |
| Parent Management | Parent-specific attributes: contact preferences, communication preferences |
| Guardian Management | Guardian-specific attributes: legal guardianship details, contact preferences |
| Applicant Management | Applicant-specific attributes: application details, status tracking, source tracking |
| Emergency Contact Management | Emergency contact CRUD, linking to People |
| Person Relationships | Bidirectional relationships: parent-student, guardian-student, staff-student, sibling, emergency contact, authorized pickup |
| People Documents | Document metadata and references (file storage owned by Platform Services) |
| Person Search | Full-text search across name, email, phone with tenant isolation |
| Person Profile | Profile management: photo, bio, custom fields |
| Person Lifecycle | Creation → Active → (Inactive) → Active → Soft Deleted (via deleted_at) → (Restored) |
| Person Merge | Duplicate detection, merge operations, audit preservation |
| Address Management | Multiple address types per Person: Residential, Mailing, Billing, Emergency |

### 5.3 Domain Boundaries

**In Scope:** Person CRUD, Student/Staff/Parent/Guardian/Applicant management, Emergency Contacts, Person Relationships, People Documents, Person search, Person profile management, Address management, Person merge & deduplication

**Out of Scope:** Authentication (Identity & Access), Authorization/Roles/Permissions (Identity & Access), Sessions/MFA (Identity & Access), Academic Records/Attendance/Timetables/Results (Academics), Finance operations (Finance), Notifications (Communication), Institution Configuration (Institution Management), File storage infrastructure (Platform Services)

### 5.4 Dependencies

| Dependency | Nature | Direction |
|------------|--------|-----------|
| Identity & Access | User account linking, authentication context | Reads |
| Institution Management | Institution context, tenant isolation | Reads |
| Academics | Student enrollment, academic records, attendance | Writes (references) |
| Finance | Student fee assignments, staff payroll references | Writes (references) |
| Communication | Parent/guardian/staff contact preferences, notification delivery | Reads |
| Platform Services | File storage for documents and profile photos, audit logging, event bus | Writes |

### 5.5 Core Entities

| Entity | Type | Description |
|--------|------|-------------|
| Person | Core | Core identity: name, email, phone, date of birth, gender, address, profile photo, status |
| Student | Core (Sub-type) | Student-specific: enrollment details, academic record references, graduation, transfer, withdrawal |
| Staff | Core (Sub-type) | Staff-specific: employment details, position, department, qualifications, certifications, employment history |
| Parent | Core (Sub-type) | Parent-specific: contact preferences, communication preferences |
| Guardian | Core (Sub-type) | Guardian-specific: legal guardianship details, contact preferences |
| Applicant | Core (Sub-type) | Applicant-specific: application details, status tracking, source tracking |
| Emergency Contact | Supporting | Emergency contact: name, phone, relationship, priority |
| Person Relationship | Relationship | Bidirectional person-to-person: type, start/end date, institution scope |
| Person Institution | Relationship | Person-to-Institution binding with role context |
| People Document | Supporting | Document metadata: type, name, file reference, status |
| Person Profile | Value Object | Profile photo, bio, custom fields |
| Address | Value Object | Street, city, state, postal code, country; supports multiple types per Person |
| Domain Event | Supporting | Cross-service communication |

### 5.6 Lifecycle States

**Person:** Created → Active → (Inactive) → Active → Soft Deleted (via deleted_at) → (Restored)

Soft delete is controlled exclusively by `deleted_at` / `deleted_by` columns. `PersonStatus` is a business status (ACTIVE or INACTIVE) and is never set to DELETED.

**Student:** Enrolled → Active → (Transferred) → (Withdrawn) → (Graduated)

**Staff:** Hired → Active → (On Leave) → Active → (Separated)

**Parent:** Created → Active → (Inactive) → Active

**Guardian:** Created → Active → (Inactive) → Active

**Applicant:** Applied → Under Review → (Accepted) → (Rejected) → (Expired)

**Emergency Contact:** Created → Active → (Inactive) → Active

**Person Relationship:** Created → Active → (Expired) → (Revoked)

### 5.7 Business Rules

| ID | Rule | Scope |
|----|------|-------|
| BR-01 | Every Person is institution-scoped; cross-tenant Person access is prohibited | Global |
| BR-02 | Person email is unique within tenant | Tenant |
| BR-03 | Person can belong to multiple Institutions with different roles | Person |
| BR-04 | Student enrollment requires valid Institution and academic session | Student |
| BR-05 | Staff employment requires valid Institution and position | Staff |
| BR-06 | Emergency Contacts must have at least one phone number | Emergency Contact |
| BR-07 | Person Relationships are bidirectional (parent→student implies student→parent) | Relationship |
| BR-08 | Person Relationships have temporal validity (start/end date) | Relationship |
| BR-09 | Guardian relationships require legal guardianship documentation reference | Guardian |
| BR-010 | Applicant status transitions follow valid state machine | Applicant |
| BR-011 | Person soft delete is controlled by deleted_at/deleted_by columns; PersonStatus (ACTIVE/INACTIVE) is business status only and is never set to DELETED | Person |
| BR-012 | Student graduation requires completion of academic record references | Student |
| BR-013 | Staff separation requires completion of employment history | Staff |
| BR-014 | People Documents are references only; file storage belongs to Platform Services | Document |
| BR-015 | Person profile photo stored as file reference (not base64) | Profile |
| BR-016 | Person search respects tenant isolation; no cross-tenant search | Global |
| BR-017 | Emergency Contact priority determines contact order | Emergency Contact |
| BR-018 | Authorized Pickup Persons require Institution approval | Relationship |
| BR-019 | Person custom fields are Institution-configurable | Profile |
| BR-020 | All Person state changes are audited | Global |
| BR-021 | Person merge operations require admin authorization | Merge |
| BR-022 | Merge operations preserve audit history and cross-domain references | Merge |
| BR-023 | At least one Residential address is required for Students | Address |
| BR-024 | Address validation is centralized across all address types | Address |

### 5.8 Domain Events

| Event | Trigger | Consumers |
|-------|---------|-----------|
| PersonCreated | Person registration | AuditModule, IdentityAccessModule |
| PersonUpdated | Profile change | AuditModule |
| PersonSoftDeleted | Soft delete | AcademicsModule, FinanceModule |
| PersonPermanentlyDeleted | Admin delete | CleanupModule |
| PersonRestored | Restore from soft delete | AcademicsModule, FinanceModule |
| StudentEnrolled | Student enrollment | AuditModule, AcademicsModule, FinanceModule |
| StudentUpdated | Student profile change | AuditModule |
| StudentTransferred | Student transfer | AuditModule, AcademicsModule |
| StudentWithdrawn | Student withdrawal | AuditModule, AcademicsModule, FinanceModule |
| StudentGraduated | Student graduation | AuditModule, NotificationModule |
| StaffHired | Staff onboarding | AuditModule, IdentityAccessModule, FinanceModule |
| StaffUpdated | Staff profile change | AuditModule |
| StaffSeparated | Staff offboarding | AuditModule, IdentityAccessModule, FinanceModule |
| StaffOnLeave | Staff leave start | AuditModule |
| StaffReturnFromLeave | Staff leave end | AuditModule |
| ParentCreated | Parent registration | AuditModule |
| ParentUpdated | Parent profile change | AuditModule |
| GuardianCreated | Guardian registration | AuditModule |
| GuardianUpdated | Guardian profile change | AuditModule |
| ApplicantCreated | Application submitted | AuditModule, NotificationModule |
| ApplicantUpdated | Application change | AuditModule |
| ApplicantAccepted | Application accepted | AuditModule, NotificationModule, PeopleModule |
| ApplicantRejected | Application rejected | AuditModule, NotificationModule |
| ApplicantExpired | Application expired | AuditModule |
| EmergencyContactCreated | Emergency contact added | AuditModule |
| EmergencyContactUpdated | Emergency contact changed | AuditModule |
| EmergencyContactRemoved | Emergency contact removed | AuditModule |
| PersonRelationshipCreated | Relationship established | AuditModule |
| PersonRelationshipUpdated | Relationship changed | AuditModule |
| PersonRelationshipRevoked | Relationship ended | AuditModule |
| PeopleDocumentUploaded | Document reference added | AuditModule |
| PeopleDocumentRemoved | Document reference removed | AuditModule |
| PersonMerged | Duplicate Person records merged | AuditModule, AcademicsModule, FinanceModule, IdentityAccessModule |

### 5.9 Assumptions

1. Multi-tenant is the default deployment model
2. Every Person is institution-scoped
3. Person is separate from User (authentication is Identity & Access)
4. Role-specific sub-types (Student, Staff, Parent, Guardian, Applicant) extend Person
5. Person Relationships are bidirectional and institution-scoped
6. Emergency Contacts are first-class entities with independent CRUD
7. People Documents are references only; file storage belongs to Platform Services
8. Person search supports full-text across name, email, phone
9. Person custom fields are Institution-configurable
10. Student academic record references belong to Academics domain
11. Staff employment history is tracked within People domain
12. Applicant lifecycle is short; applications expire after configurable period
13. Guardian and Parent are distinct sub-types (legal vs biological)
14. Authorized Pickup Persons modeled as Person Relationships
15. Person profile photo stored as file reference
16. Emergency Contact priority determines contact order
17. Person Relationships have temporal validity (start/end date)
18. Person can belong to multiple Institutions with different roles
19. All Person state changes are audited
20. Institution-person assignment includes role context
21. Person is the root aggregate; all role-specific entities extend Person
22. Person may exist without a User account
23. Merge operations preserve audit history and cross-domain references
24. Address is a reusable Value Object supporting multiple types per Person
25. Data retention follows platform-wide policies; graduated/withdrawn records retained for reporting

---

## 6. Phase 2 — Domain Design

### 6.1 Aggregates

| Aggregate | Root Entity | Entities | Value Objects |
|-----------|------------|----------|---------------|
| Person | Person | PersonProfile, PersonInstitution | PersonName, PersonStatus, ContactInfo, Address |
| Student | Student | StudentEnrollmentDetail, StudentAcademicRecord, StudentGraduationDetail, StudentTransferDetail, StudentWithdrawalDetail | StudentStatus, EnrollmentStatus |
| Staff | Staff | StaffEmploymentDetail, StaffQualification, StaffCertification, StaffEmploymentHistory | StaffStatus, EmploymentStatus, Department |
| Parent | Parent | — | ParentStatus, ContactPreference |
| Guardian | Guardian | — | GuardianStatus, LegalGuardianshipDetail |
| Applicant | Applicant | — | ApplicantStatus, ApplicationDetail, ApplicationSource |
| EmergencyContact | EmergencyContact | — | EmergencyContactPriority, RelationshipType |
| PersonRelationship | PersonRelationship | — | RelationshipType, TemporalBounds |
| PeopleDocument | PeopleDocument | — | DocumentType, DocumentStatus, FileReference |
| DomainEvent | DomainEvent | — | EventType, EventPayload |

### 6.2 Entity Relationships

| Relationship | Cardinality | Description |
|-------------|-------------|-------------|
| Person → PersonProfile | 1:1 | Each Person has one profile |
| Person → PersonInstitution | 1:N | Person can belong to multiple Institutions |
| Person → Student | 1:0..1 | Person may be a Student |
| Person → Staff | 1:0..1 | Person may be a Staff member |
| Person → Parent | 1:0..1 | Person may be a Parent |
| Person → Guardian | 1:0..1 | Person may be a Guardian |
| Person → Applicant | 1:0..1 | Person may be an Applicant |
| Person → EmergencyContact | 1:N | Person has many Emergency Contacts |
| Person → PersonRelationship (source) | 1:N | Person has many outgoing relationships |
| Person → PersonRelationship (target) | 1:N | Person has many incoming relationships |
| Person → PeopleDocument | 1:N | Person has many document references |
| Student → Institution | N:1 | Student belongs to Institution |
| Staff → Institution | N:1 | Staff belongs to Institution |
| Parent → Institution | N:1 | Parent belongs to Institution |
| Guardian → Institution | N:1 | Guardian belongs to Institution |

### 6.2a Relationship Cardinality Rules

| Relationship | Cardinality | Mandatory/Optional | Notes |
|-------------|-------------|-------------------|-------|
| Student → Parent | 1:N (per Institution) | Mandatory (at least one) | Every Student must have at least one Parent linked within an Institution |
| Parent → Student | 1:N (per Institution) | Optional | A Parent may have zero or many Students |
| Student → Guardian | 1:N (per Institution) | Optional | A Student may have zero or many Guardians |
| Guardian → Student | 1:N (per Institution) | Optional | A Guardian may support zero or many Students |
| Emergency Contact → Person | 1:N | Optional | A single Emergency Contact may be linked to multiple People (e.g., family members) |
| Student → Authorized Pickup Person | 1:N (per Institution) | Optional | A Student may have multiple Authorized Pickup Persons |
| Staff → Student (mentor/supervisor/advisor) | 1:N (per Institution) | Optional | Future staff-student relationships use the same relationship model |
| Sibling → Sibling | 1:N | Optional | Siblings are modeled as bidirectional Person Relationships |

**Rules:**
- All relationships are bidirectional; creating a source→target relationship implies a target→source relationship
- Relationships are institution-scoped; a parent-student relationship exists within an Institution context
- A Person may hold multiple roles within the same Institution (e.g., Staff and Parent)
- Future staff relationships (mentor, supervisor, advisor) must use the same PersonRelationship model with appropriate RelationshipType values
- Emergency Contact links are independent of Person Relationships; they model a different concern (emergency notification)

### 6.3 Domain Services

| Service | Responsibility |
|---------|---------------|
| PersonService | Person CRUD, lifecycle, profile management, search |
| StudentService | Student CRUD, enrollment, graduation, transfer, withdrawal |
| StaffService | Staff CRUD, hiring, separation, leave management |
| ParentService | Parent CRUD, contact preference management |
| GuardianService | Guardian CRUD, legal guardianship management |
| ApplicantService | Applicant CRUD, application lifecycle, status transitions |
| EmergencyContactService | Emergency Contact CRUD, priority management |
| PersonRelationshipService | Relationship CRUD, bidirectional enforcement, temporal validation |
| PeopleDocumentService | Document reference CRUD, metadata management |
| PersonSearchService | Full-text search across name, email, phone, public IDs (P-/STU-/EMP-/APP-), student/employee/applicant ID numbers, parent/guardian names, emergency contact names, document numbers; supports fuzzy and exact matching with tenant isolation |
| PersonMergeService | Duplicate detection, merge operations, cross-domain reference updates |

### 6.4 Aggregate Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| I-01 | Person email must be unique within tenant | Database UNIQUE + Application validation |
| I-02 | Person must belong to at least one Institution | Institution assignment guard |
| I-03 | Person sub-type attributes must match Person's role context | Role context validation |
| I-04 | Student enrollment requires valid Institution and academic session | Enrollment validation |
| I-05 | Staff employment requires valid Institution and position | Employment validation |
| I-06 | Emergency Contact must have at least one phone number | Contact validation |
| I-07 | Person Relationships must be bidirectional | Relationship creation validation |
| I-08 | Person Relationships must have valid temporal bounds (start ≤ end) | Temporal validation |
| I-09 | Guardian relationships require legal guardianship documentation reference | Guardianship validation |
| I-010 | Applicant status transitions must follow valid state machine | State machine validation |
| I-011 | Person soft delete excludes role-specific attributes from queries | Repository WHERE clause |
| I-012 | Student graduation requires completion of academic record references | Graduation validation |
| I-013 | Staff separation requires completion of employment history | Separation validation |
| I-014 | People Documents are references only; no file storage in People domain | Document reference validation |
| I-015 | Person search respects tenant isolation | Search query scoping |
| I-016 | Emergency Contact priority must be unique per Person | Database UNIQUE + Application validation |
| I-017 | Person Relationships cannot be self-referential | Relationship validation |
| I-018 | Person custom fields schema must be valid JSON | Schema validation |
| I-019 | PersonInstitution assignment must include valid role context | Role context validation |
| I-020 | Applicant applications expire after configurable period | Background job |
| I-021 | Person profile photo must be valid file reference | File reference validation |
| I-022 | Staff qualifications must include valid credential details | Qualification validation |
| I-023 | Student transfer requires source and destination Institution references | Transfer validation |
| I-024 | Person Relationships are institution-scoped | Relationship scoping |
| I-025 | Authorized Pickup Persons require Institution approval | Approval validation |

### 6.5 Configurable Policies

| ID | Policy | Default | Range |
|----|--------|---------|-------|
| P-01 | Person soft delete retention (days) | 30 | 7–90 |
| P-02 | Applicant application expiry (days) | 90 | 30–365 |
| P-03 | Emergency Contact max per Person | 5 | 1–10 |
| P-04 | Person max Institutions | 5 | 1–10 |
| P-05 | Person Relationship max per Person | 20 | 5–50 |
| P-06 | People Document max per Person | 50 | 10–200 |
| P-07 | Person profile photo max file size (MB) | 5 | 1–20 |
| P-08 | Person custom fields max per Institution | 20 | 0–100 |
| P-09 | Staff max qualifications | 20 | 5–50 |
| P-010 | Staff max certifications | 20 | 5–50 |
| P-011 | Student max enrollment records | 10 | 1–20 |
| P-012 | Applicant max documents | 20 | 5–50 |
| P-013 | Person search results max | 100 | 20–500 |
| P-014 | PersonRelationship max duration (days) | 3650 | 365–36500 |
| P-015 | Emergency Contact phone numbers max | 3 | 1–5 |
| P-016 | Parent max children per Institution | 20 | 5–100 |
| P-017 | Guardian max wards per Institution | 10 | 1–20 |
| P-018 | Person profile bio max length (chars) | 1000 | 200–5000 |

### 6.6 Validation Rules

#### Person (V-P)

| Rule | Description |
|------|-------------|
| V-P-01 | First name: required, 1–100 chars, alphanumeric + spaces |
| V-P-02 | Last name: required, 1–100 chars, alphanumeric + spaces |
| V-P-03 | Email: required, valid format, max 255 chars, unique within tenant |
| V-P-04 | Phone: optional, valid phone format |
| V-P-05 | Date of birth: required, valid date, not in future |
| V-P-06 | Gender: optional, valid enum (MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY) |
| V-P-07 | Address: optional, max 500 chars |
| V-P-08 | Status: required, valid enum (ACTIVE, INACTIVE) — business status only; soft delete via deleted_at |
| V-P-09 | Profile photo: optional, valid file reference |
| V-P-10 | Custom fields: optional, valid JSON |

#### Student (V-S)

| Rule | Description |
|------|-------------|
| V-S-01 | Person ID: required, must exist and be active |
| V-S-02 | Institution ID: required, must exist and be active |
| V-S-03 | Enrollment date: required, valid date |
| V-S-04 | Academic session: required, must exist within Institution |
| V-S-05 | Student ID number: optional, unique within Institution per session |
| V-S-06 | Status: required, valid enum (ENROLLED, ACTIVE, TRANSFERRED, WITHDRAWN, GRADUATED) |

#### Staff (V-ST)

| Rule | Description |
|------|-------------|
| V-ST-01 | Person ID: required, must exist and be active |
| V-ST-02 | Institution ID: required, must exist and be active |
| V-ST-03 | Employee ID: optional, unique within Institution |
| V-ST-04 | Hire date: required, valid date |
| V-ST-05 | Position: required, 1–200 chars |
| V-ST-06 | Department: optional, 1–200 chars |
| V-ST-07 | Employment type: required, valid enum (FULL_TIME, PART_TIME, CONTRACT, INTERN) |
| V-ST-08 | Status: required, valid enum (HIRED, ACTIVE, ON_LEAVE, SEPARATED) |

#### Parent (V-PA)

| Rule | Description |
|------|-------------|
| V-PA-01 | Person ID: required, must exist and be active |
| V-PA-02 | Institution ID: required, must exist and be active |
| V-PA-03 | Contact preference: optional, valid enum (EMAIL, PHONE, SMS, WHATSAPP) |
| V-PA-04 | Status: required, valid enum (ACTIVE, INACTIVE) |

#### Guardian (V-G)

| Rule | Description |
|------|-------------|
| V-G-01 | Person ID: required, must exist and be active |
| V-G-02 | Institution ID: required, must exist and be active |
| V-G-03 | Legal guardianship: required, valid documentation reference |
| V-G-04 | Contact preference: optional, valid enum (EMAIL, PHONE, SMS, WHATSAPP) |
| V-G-05 | Status: required, valid enum (ACTIVE, INACTIVE) |

#### Applicant (V-AP)

| Rule | Description |
|------|-------------|
| V-AP-01 | Person ID: required, must exist and be active |
| V-AP-02 | Institution ID: required, must exist and be active |
| V-AP-03 | Application date: required, valid date |
| V-AP-04 | Target grade/class: required, 1–100 chars |
| V-AP-05 | Source: optional, valid enum (WEBSITE, REFERRAL, WALK_IN, AGENT, OTHER) |
| V-AP-06 | Status: required, valid enum (APPLIED, UNDER_REVIEW, ACCEPTED, REJECTED, EXPIRED) |

#### Emergency Contact (V-EC)

| Rule | Description |
|------|-------------|
| V-EC-01 | Person ID: required, must exist and be active |
| V-EC-02 | Name: required, 1–200 chars |
| V-EC-03 | Phone: required, valid phone format (at least one) |
| V-EC-04 | Relationship: required, 1–100 chars |
| V-EC-05 | Priority: required, positive integer, unique per Person |
| V-EC-06 | Email: optional, valid format |

#### Person Relationship (V-PR)

| Rule | Description |
|------|-------------|
| V-PR-01 | Source Person ID: required, must exist and be active |
| V-PR-02 | Target Person ID: required, must exist and be active |
| V-PR-03 | Relationship type: required, valid enum (PARENT, GUARDIAN, SIBLING, EMERGENCY_CONTACT, AUTHORIZED_PICKUP, STAFF_STUDENT, OTHER) |
| V-PR-04 | Start date: required, valid date |
| V-PR-05 | End date: optional, must be ≥ start date |
| V-PR-06 | Institution ID: required, must exist and be active |
| V-PR-07 | Source and Target cannot be the same Person |
| V-PR-08 | Bidirectional relationship must be consistent |

### 6.7 Read Models

| Model | Key Fields |
|-------|------------|
| PersonSummary | id, publicId, firstName, lastName, email, phone, dateOfBirth, gender, status, profilePhotoUrl, institutionCount, createdAt |
| PersonProfile | id, publicId, firstName, lastName, email, phone, dateOfBirth, gender, address, status, profilePhotoUrl, bio, customFields, institutions[], documents[] |
| StudentSummary | id, publicId, personId, personName, institutionId, studentIdNumber, enrollmentDate, status, academicSession |
| StudentProfile | id, publicId, personId, personName, institutionId, studentIdNumber, enrollmentDate, status, academicSession, enrollmentDetail, academicRecord, graduationDetail, transferDetail, withdrawalDetail |
| StaffSummary | id, publicId, personId, personName, institutionId, employeeId, position, department, status, hireDate |
| StaffProfile | id, publicId, personId, personName, institutionId, employeeId, position, department, employmentType, status, hireDate, qualifications[], certifications[], employmentHistory[] |
| ParentSummary | id, personId, personName, institutionId, status, contactPreference, childrenCount |
| GuardianSummary | id, personId, personName, institutionId, status, contactPreference, wardsCount |
| ApplicantSummary | id, publicId, personId, personName, institutionId, applicationDate, targetGrade, source, status |
| EmergencyContactSummary | id, personId, name, phone, relationship, priority, email |
| PeopleDocumentSummary | id, personId, documentType, documentName, fileReference, status, uploadedAt |
| PersonRelationshipSummary | id, sourcePersonId, sourcePersonName, targetPersonId, targetPersonName, relationshipType, startDate, endDate, institutionId |

---

## 7. Phase 3 — Database Design

### 7.1 Table Catalogue

| Table | Description | Tenant Scoped | Soft Delete |
|-------|-------------|---------------|-------------|
| people | Core person records | Yes | Yes |
| person_profiles | Person profile details | Yes | Yes |
| person_institutions | Person-to-Institution assignments | Yes | Yes |
| students | Student-specific attributes | Yes | Yes |
| student_enrollment_details | Student enrollment metadata | Yes | Yes |
| student_academic_records | Student academic record references | Yes | Yes |
| student_graduation_details | Student graduation metadata | Yes | Yes |
| student_transfer_details | Student transfer metadata | Yes | Yes |
| student_withdrawal_details | Student withdrawal metadata | Yes | Yes |
| staff | Staff-specific attributes | Yes | Yes |
| staff_employment_details | Staff employment metadata | Yes | Yes |
| staff_qualifications | Staff qualification records | Yes | Yes |
| staff_certifications | Staff certification records | Yes | Yes |
| staff_employment_history | Staff employment history | Yes | Yes |
| parents | Parent-specific attributes | Yes | Yes |
| guardians | Guardian-specific attributes | Yes | Yes |
| applicants | Applicant-specific attributes | Yes | Yes |
| emergency_contacts | Emergency contact records | Yes | Yes |
| person_relationships | Person-to-person relationships | Yes | Yes |
| people_documents | Document metadata and references | Yes | Yes |

### 7.2 Column Catalogue

**Common columns** (all mutable tables): `id` (uuid PK), `tenant_id` (uuid FK), `created_at` (timestamptz), `created_by` (uuid), `updated_at` (timestamptz), `updated_by` (uuid), `deleted_at` (timestamptz nullable), `deleted_by` (uuid nullable), `version` (int, default 1)

Entities exposed to end users (People, Students, Staff, Applicants) also carry a `public_id` (varchar(20), UNIQUE per tenant) for human-readable identification.

#### people

| Column | Type | Notes |
|--------|------|-------|
| public_id | varchar(20) | UNIQUE per tenant, immutable, format P-YYYY-NNNNNN |
| first_name | varchar(100) | |
| last_name | varchar(100) | |
| email | varchar(255) | UNIQUE per tenant |
| phone | varchar(50) | nullable |
| date_of_birth | date | |
| gender | gender enum | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| address | varchar(500) | nullable |
| status | person_status enum | ACTIVE, INACTIVE — business status only; soft delete via deleted_at |
| is_active | boolean | default true |
| profile_photo_ref | varchar(500) | nullable, file reference |

#### person_profiles

| Column | Type | Notes |
|--------|------|-------|
| person_id | uuid FK → people | UNIQUE per tenant |
| bio | varchar(1000) | nullable |
| custom_fields | json | nullable, Institution-configurable |
| metadata | json | nullable |

#### person_institutions

| Column | Type | Notes |
|--------|------|-------|
| person_id | uuid FK → people | |
| institution_id | uuid FK → institutions | |
| role_context | varchar(50) | STUDENT, STAFF, PARENT, GUARDIAN, APPLICANT |
| assigned_at | timestamptz | default now() |
| assigned_by | uuid | nullable |

UNIQUE (tenant_id, person_id, institution_id, role_context).

#### students

| Column | Type | Notes |
|--------|------|-------|
| person_id | uuid FK → people | |
| institution_id | uuid FK → institutions | |
| public_id | varchar(20) | UNIQUE per tenant, immutable, format STU-YYYY-NNNNNN |
| student_id_number | varchar(50) | nullable, UNIQUE per institution |
| enrollment_date | date | |
| status | student_status enum | ENROLLED, ACTIVE, TRANSFERRED, WITHDRAWN, GRADUATED |

UNIQUE (tenant_id, person_id, institution_id).

#### student_enrollment_details

| Column | Type | Notes |
|--------|------|-------|
| student_id | uuid FK → students | UNIQUE |
| academic_session_id | uuid FK → academic_sessions | |
| grade_level | varchar(50) | |
| class_name | varchar(50) | nullable |
| stream | varchar(50) | nullable |
| enrollment_type | varchar(50) | NEW, TRANSFER, PROMOTED |

#### student_academic_records

| Column | Type | Notes |
|--------|------|-------|
| student_id | uuid FK → students | |
| academic_session_id | uuid FK → academic_sessions | |
| record_type | varchar(50) | ENROLLMENT, GRADE, ATTENDANCE, BEHAVIOR |
| reference_id | uuid | nullable, reference to Academics domain entity |
| reference_type | varchar(100) | nullable, entity type in Academics domain |
| metadata | json | nullable |

No soft delete; append-only references.

#### student_graduation_details

| Column | Type | Notes |
|--------|------|-------|
| student_id | uuid FK → students | UNIQUE |
| graduation_date | date | |
| final_grade | varchar(50) | nullable |
| certificate_number | varchar(100) | nullable |
| diploma_reference | varchar(500) | nullable, file reference |

#### student_transfer_details

| Column | Type | Notes |
|--------|------|-------|
| student_id | uuid FK → students | UNIQUE |
| transfer_date | date | |
| source_institution_id | uuid FK → institutions | nullable |
| destination_institution_id | uuid FK → institutions | nullable |
| transfer_reason | varchar(500) | nullable |
| transfer_documents | json | nullable, file references |

#### student_withdrawal_details

| Column | Type | Notes |
|--------|------|-------|
| student_id | uuid FK → students | UNIQUE |
| withdrawal_date | date | |
| withdrawal_reason | varchar(500) | nullable |
| withdrawal_type | varchar(50) | VOLUNTARY, ACADEMIC, DISCIPLINARY, OTHER |
| refund_status | varchar(50) | nullable, PENDING, PROCESSED, DENIED |

#### staff

| Column | Type | Notes |
|--------|------|-------|
| person_id | uuid FK → people | |
| institution_id | uuid FK → institutions | |
| public_id | varchar(20) | UNIQUE per tenant, immutable, format EMP-YYYY-NNNNNN |
| employee_id | varchar(50) | nullable, UNIQUE per institution |
| hire_date | date | |
| employment_type | employment_type enum | FULL_TIME, PART_TIME, CONTRACT, INTERN |
| status | staff_status enum | HIRED, ACTIVE, ON_LEAVE, SEPARATED |

UNIQUE (tenant_id, person_id, institution_id).

#### staff_employment_details

| Column | Type | Notes |
|--------|------|-------|
| staff_id | uuid FK → staff | UNIQUE |
| position | varchar(200) | |
| department | varchar(200) | nullable |
| reporting_to | uuid FK → staff | nullable |
| work_location | varchar(200) | nullable |
| salary_grade | varchar(50) | nullable |
| contract_start_date | date | nullable |
| contract_end_date | date | nullable |

#### staff_qualifications

| Column | Type | Notes |
|--------|------|-------|
| staff_id | uuid FK → staff | |
| qualification_name | varchar(200) | |
| institution_name | varchar(200) | |
| field_of_study | varchar(200) | nullable |
| year_obtained | integer | |
| grade | varchar(50) | nullable |
| certificate_ref | varchar(500) | nullable, file reference |

#### staff_certifications

| Column | Type | Notes |
|--------|------|-------|
| staff_id | uuid FK → staff | |
| certification_name | varchar(200) | |
| issuing_body | varchar(200) | |
| issue_date | date | |
| expiry_date | date | nullable |
| certificate_number | varchar(100) | nullable |
| certificate_ref | varchar(500) | nullable, file reference |

#### staff_employment_history

| Column | Type | Notes |
|--------|------|-------|
| staff_id | uuid FK → staff | |
| institution_name | varchar(200) | |
| position | varchar(200) | |
| start_date | date | |
| end_date | date | nullable |
| reason_for_leaving | varchar(500) | nullable |

#### parents

| Column | Type | Notes |
|--------|------|-------|
| person_id | uuid FK → people | |
| institution_id | uuid FK → institutions | |
| contact_preference | contact_preference enum | EMAIL, PHONE, SMS, WHATSAPP |
| status | parent_status enum | ACTIVE, INACTIVE |

UNIQUE (tenant_id, person_id, institution_id).

#### guardians

| Column | Type | Notes |
|--------|------|-------|
| person_id | uuid FK → people | |
| institution_id | uuid FK → institutions | |
| legal_guardianship_ref | varchar(500) | file reference to guardianship document |
| contact_preference | contact_preference enum | EMAIL, PHONE, SMS, WHATSAPP |
| status | guardian_status enum | ACTIVE, INACTIVE |

UNIQUE (tenant_id, person_id, institution_id).

#### applicants

| Column | Type | Notes |
|--------|------|-------|
| person_id | uuid FK → people | |
| institution_id | uuid FK → institutions | |
| public_id | varchar(20) | UNIQUE per tenant, immutable, format APP-YYYY-NNNNNN |
| application_date | date | |
| target_grade | varchar(100) | |
| source | applicant_source enum | WEBSITE, REFERRAL, WALK_IN, AGENT, OTHER |
| status | applicant_status enum | APPLIED, UNDER_REVIEW, ACCEPTED, REJECTED, EXPIRED |
| notes | varchar(2000) | nullable |

UNIQUE (tenant_id, person_id, institution_id).

#### emergency_contacts

| Column | Type | Notes |
|--------|------|-------|
| person_id | uuid FK → people | |
| name | varchar(200) | |
| phone_primary | varchar(50) | |
| phone_secondary | varchar(50) | nullable |
| email | varchar(255) | nullable |
| relationship | varchar(100) | |
| priority | integer | |
| address | varchar(500) | nullable |

UNIQUE (tenant_id, person_id, priority).

#### person_relationships

| Column | Type | Notes |
|--------|------|-------|
| source_person_id | uuid FK → people | |
| target_person_id | uuid FK → people | |
| relationship_type | relationship_type enum | PARENT, GUARDIAN, SIBLING, EMERGENCY_CONTACT, AUTHORIZED_PICKUP, STAFF_STUDENT, OTHER |
| institution_id | uuid FK → institutions | |
| start_date | date | |
| end_date | date | nullable |
| is_active | boolean | default true |
| metadata | json | nullable |

UNIQUE (tenant_id, source_person_id, target_person_id, relationship_type, institution_id).

#### people_documents

| Column | Type | Notes |
|--------|------|-------|
| person_id | uuid FK → people | |
| document_type | varchar(100) | BIRTH_CERTIFICATE, NATIONAL_ID, PASSPORT, GUARDIANSHIP_ORDER, MEDICAL_RECORD, ACADEMIC_TRANSCRIPT, OTHER |
| document_name | varchar(200) | |
| file_reference | varchar(500) | file storage reference |
| file_size | integer | nullable, bytes |
| mime_type | varchar(100) | nullable |
| status | document_status enum | ACTIVE, EXPIRED, REVOKED |
| expiry_date | date | nullable |

### 7.3 Constraints

| Table | Type | Columns |
|-------|------|---------|
| people | UNIQUE | (tenant_id, email) |
| people | UNIQUE | (tenant_id, public_id) |
| person_profiles | UNIQUE | (tenant_id, person_id) |
| person_institutions | UNIQUE | (tenant_id, person_id, institution_id, role_context) |
| students | UNIQUE | (tenant_id, person_id, institution_id) |
| students | UNIQUE | (tenant_id, public_id) |
| student_enrollment_details | UNIQUE | (student_id) |
| student_graduation_details | UNIQUE | (student_id) |
| student_transfer_details | UNIQUE | (student_id) |
| student_withdrawal_details | UNIQUE | (student_id) |
| staff | UNIQUE | (tenant_id, person_id, institution_id) |
| staff | UNIQUE | (tenant_id, public_id) |
| staff_employment_details | UNIQUE | (staff_id) |
| parents | UNIQUE | (tenant_id, person_id, institution_id) |
| guardians | UNIQUE | (tenant_id, person_id, institution_id) |
| applicants | UNIQUE | (tenant_id, person_id, institution_id) |
| applicants | UNIQUE | (tenant_id, public_id) |
| emergency_contacts | UNIQUE | (tenant_id, person_id, priority) |
| person_relationships | UNIQUE | (tenant_id, source_person_id, target_person_id, relationship_type, institution_id) |

### 7.4 Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| people | idx_people_tenant_email | (tenant_id, email) | Login lookup |
| people | idx_people_tenant_public_id | (tenant_id, public_id) | Public ID lookup |
| people | idx_people_tenant_status | (tenant_id, status) | Status filtering |
| people | idx_people_tenant_active | (tenant_id, is_active) | Soft delete filtering |
| people | idx_people_name_search | (tenant_id, first_name, last_name) | Name search |
| students | idx_students_tenant_public_id | (tenant_id, public_id) | Public ID lookup |
| staff | idx_staff_tenant_public_id | (tenant_id, public_id) | Public ID lookup |
| applicants | idx_applicants_tenant_public_id | (tenant_id, public_id) | Public ID lookup |
| person_institutions | idx_pi_person | (person_id) | Person's institutions |
| person_institutions | idx_pi_institution | (institution_id) | Institution's people |
| students | idx_students_institution | (institution_id) | Institution's students |
| students | idx_students_status | (status) | Status filtering |
| students | idx_students_person | (person_id) | Student's person record |
| staff | idx_staff_institution | (institution_id) | Institution's staff |
| staff | idx_staff_status | (status) | Status filtering |
| staff | idx_staff_person | (person_id) | Staff's person record |
| parents | idx_parents_institution | (institution_id) | Institution's parents |
| parents | idx_parents_person | (person_id) | Parent's person record |
| guardians | idx_guardians_institution | (institution_id) | Institution's guardians |
| guardians | idx_guardians_person | (person_id) | Guardian's person record |
| applicants | idx_applicants_institution | (institution_id) | Institution's applicants |
| applicants | idx_applicants_status | (status) | Status filtering |
| emergency_contacts | idx_ec_person | (person_id) | Person's emergency contacts |
| person_relationships | idx_pr_source | (source_person_id) | Source person's relationships |
| person_relationships | idx_pr_target | (target_person_id) | Target person's relationships |
| person_relationships | idx_pr_institution | (institution_id) | Institution's relationships |
| people_documents | idx_pd_person | (person_id) | Person's documents |

---

## 8. Phase 4 — Prisma Schema

**File:** `prisma/schema.prisma` within the people service.

### Enums

| Enum | Values |
|------|--------|
| PersonStatus | ACTIVE, INACTIVE — business status only; soft delete via deleted_at/deleted_by columns |
| Gender | MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY |
| StudentStatus | ENROLLED, ACTIVE, TRANSFERRED, WITHDRAWN, GRADUATED |
| StaffStatus | HIRED, ACTIVE, ON_LEAVE, SEPARATED |
| EmploymentType | FULL_TIME, PART_TIME, CONTRACT, INTERN |
| ContactPreference | EMAIL, PHONE, SMS, WHATSAPP |
| ApplicantStatus | APPLIED, UNDER_REVIEW, ACCEPTED, REJECTED, EXPIRED |
| ApplicantSource | WEBSITE, REFERRAL, WALK_IN, AGENT, OTHER |
| RelationshipType | PARENT, GUARDIAN, SIBLING, EMERGENCY_CONTACT, AUTHORIZED_PICKUP, STAFF_STUDENT, OTHER |
| DocumentStatus | ACTIVE, EXPIRED, REVOKED |

### Models

20 models: Person, PersonProfile, PersonInstitution, Student, StudentEnrollmentDetail, StudentAcademicRecord, StudentGraduationDetail, StudentTransferDetail, StudentWithdrawalDetail, Staff, StaffEmploymentDetail, StaffQualification, StaffCertification, StaffEmploymentHistory, Parent, Guardian, Applicant, EmergencyContact, PersonRelationship, PeopleDocument.

**Schema Principles:**
- UUID `@default(uuid())` for all primary keys
- `@unique` constraints for business keys including public_id per tenant
- `@map` for snake_case column names
- Soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status via `status` enum (PersonStatus: ACTIVE, INACTIVE only)
- Optimistic locking via `version` (Int @default(1))
- Audit fields: created_at, created_by, updated_at, updated_by
- JSON columns for flexible data (custom fields, metadata)
- Prisma enums mapped to database types
- Cascade deletes: Person sub-types cascade from Person; enrollment/graduation/transfer/withdrawal cascade from Student; employment details cascade from Staff
- Public business identifiers via `publicId` (String @unique @db.VarChar(20)) on Person, Student, Staff, Applicant models

**Validation:** 2-pass check — all 9 validation checks PASS.

---

## 9. Phase 5 — Backend Implementation

### 9.1 Module Structure

| Module | Responsibility |
|--------|---------------|
| PeopleModule | Root module, orchestrates sub-modules |
| PersonModule | Person CRUD, lifecycle, profile management, search |
| StudentModule | Student CRUD, enrollment, graduation, transfer, withdrawal |
| StaffModule | Staff CRUD, hiring, separation, leave management |
| ParentModule | Parent CRUD, contact preference management |
| GuardianModule | Guardian CRUD, legal guardianship management |
| ApplicantModule | Applicant CRUD, application lifecycle, status transitions |
| EmergencyContactModule | Emergency Contact CRUD, priority management |
| PersonRelationshipModule | Relationship CRUD, bidirectional enforcement, temporal validation |
| PeopleDocumentModule | Document reference CRUD, metadata management |
| PersonMergeModule | Duplicate detection, merge operations, audit trail |

### 9.2 Repository Layer

| Repository | Entities | Key Operations |
|-----------|----------|----------------|
| PersonRepository | Person, PersonProfile, PersonInstitution | CRUD, findByEmail, findByPublicId, search, assignInstitution |
| StudentRepository | Student, StudentEnrollmentDetail, StudentAcademicRecord, StudentGraduationDetail, StudentTransferDetail, StudentWithdrawalDetail | CRUD, findByInstitution, findByPublicId, enroll, graduate, transfer, withdraw |
| StaffRepository | Staff, StaffEmploymentDetail, StaffQualification, StaffCertification, StaffEmploymentHistory | CRUD, findByInstitution, findByPublicId, hire, separate |
| ParentRepository | Parent | CRUD, findByInstitution, findByPerson |
| GuardianRepository | Guardian | CRUD, findByInstitution, findByPerson |
| ApplicantRepository | Applicant | CRUD, findByInstitution, findByPublicId, findByStatus, accept, reject, expire |
| EmergencyContactRepository | EmergencyContact | CRUD, findByPerson, findByPriority |
| PersonRelationshipRepository | PersonRelationship | CRUD, findByPerson, findByInstitution, findOverlapping |
| PeopleDocumentRepository | PeopleDocument | CRUD, findByPerson, findByType |
| PersonMergeRepository | Person, PersonInstitution, PersonRelationship | findDuplicates, merge, updateReferences |

All repositories receive `tenantId` as first parameter.

### 9.3 Domain Services

| Service | Responsibility |
|---------|---------------|
| PersonService | Person CRUD, lifecycle, profile management, Institution assignment; public ID generation on creation |
| StudentService | Student CRUD, enrollment, graduation, transfer, withdrawal, academic record references |
| StaffService | Staff CRUD, hiring, separation, leave management, qualification/certification tracking |
| ParentService | Parent CRUD, contact preference management |
| GuardianService | Guardian CRUD, legal guardianship management |
| ApplicantService | Applicant CRUD, application lifecycle, status transitions, expiry management |
| EmergencyContactService | Emergency Contact CRUD, priority management |
| PersonRelationshipService | Relationship CRUD, bidirectional enforcement, temporal validation, overlap detection |
| PeopleDocumentService | Document reference CRUD, metadata management, file reference validation |
| PersonSearchService | Full-text search across name, email, phone, public IDs (P-/STU-/EMP-/APP-), student/employee/applicant ID numbers, parent/guardian names, emergency contact names, document numbers; supports fuzzy and exact matching with tenant isolation |
| PersonMergeService | Duplicate detection, merge operations, cross-domain reference updates, audit preservation |

### 9.4 Controllers

| Controller | Route Prefix | Endpoints |
|-----------|-------------|-----------|
| PersonController | /api/v1/people | CRUD + search + profile + Institution assignment |
| StudentController | /api/v1/people/:personId/students | CRUD + enrollment + graduation + transfer + withdrawal |
| StaffController | /api/v1/people/:personId/staff | CRUD + hiring + separation + qualifications + certifications |
| ParentController | /api/v1/people/:personId/parents | CRUD + contact preferences |
| GuardianController | /api/v1/people/:personId/guardians | CRUD + legal guardianship |
| ApplicantController | /api/v1/people/:personId/applicants | CRUD + status transitions |
| EmergencyContactController | /api/v1/people/:personId/emergency-contacts | CRUD + priority management |
| PersonRelationshipController | /api/v1/people/:personId/relationships | CRUD + bidirectional management |
| PeopleDocumentController | /api/v1/people/:personId/documents | CRUD + metadata management |
| PersonMergeController | /api/v1/people/merge | Duplicate detection + merge operations |

### 9.5 Guards

| Guard | Purpose |
|-------|---------|
| JwtAuthGuard | Validate JWT and extract user |
| TenantGuard | Validate tenant context from JWT |
| InstitutionGuard | Validate user has access to requested Institution |
| PersonAccessGuard | Validate user has access to requested Person |
| ModuleLicenseGuard | Check if Institution has People module enabled |

**Authorization flow:** JwtAuthGuard → TenantGuard → InstitutionGuard → PersonAccessGuard → ModuleLicenseGuard → controller execution.

### 9.6 Event Publishing & Consumers

- Events published via EventEmitter2 (in-process) after transaction commit
- Event naming: `{Entity}{PastTenseVerb}` (e.g., PersonCreated)
- **Every event carries a versioned envelope:**
  ```typescript
  interface DomainEvent {
    eventId: string;           // uuid, unique — primary deduplication key
    eventType: string;         // e.g., "PersonCreated"
    eventVersion: number;      // monotonic per eventType; incremented on schema changes
    schemaVersion: string;     // payload schema version, e.g., "1.0.0"
    occurredAt: Date;          // when the event occurred
    correlationId: string;     // groups related events for a single user action
    causationId: string | null; // ID of the event/command that caused this event
    tenantId: string;          // tenant context
    actorId: string;           // user who triggered the event
    payload: Record<string, unknown>; // event-specific data
  }
  ```
- **Idempotency:** `eventId` is the deduplication key; consumers must check `eventId` before processing to ensure retry safety

**Publisher responsibilities:**
- Generate a stable `eventId` (uuid) per event
- Set `eventVersion` to current schema version for the event type
- Set `correlationId` at the start of a user action; propagate to all events within that action
- Set `causationId` to the ID of the event or command that triggered the current event
- Do NOT re-use `eventId` across retries or re-publishes

**Consumer responsibilities:**
- Check `eventId` against a deduplication index before processing
- Store processed `eventId` with TTL (minimum 72 hours, configurable per consumer)
- Skip processing if `eventId` already exists; acknowledge the message without side effects
- Check `eventVersion` to handle backward-compatible payload changes
- Return success (ack) even when skipping due to deduplication

| Consumer | Events Handled | Action |
|----------|---------------|--------|
| AuditLogConsumer | All state-change events | Create audit log entry |
| AcademicsConsumer | StudentEnrolled, StudentTransferred, StudentWithdrawn, StudentGraduated | Update academic records |
| FinanceConsumer | StudentEnrolled, StudentGraduated, StaffHired, StaffSeparated | Update financial records |
| IdentityAccessConsumer | PersonCreated, StaffHired, StaffSeparated | Provision/revoke user access |
| NotificationConsumer | ApplicantCreated, ApplicantAccepted, ApplicantRejected | Send notification |
| CleanupConsumer | ApplicantExpired, PersonSoftDeleted (after retention) | Archive expired data |
| MergeConsumer | PersonMerged | Update cross-domain references |

### 9.7 Transaction Management

- All multi-entity operations wrapped in Prisma Interactive Transactions
- Optimistic concurrency: catch Prisma P2025 error for version conflicts; return 409 Conflict
- Event publishing deferred until transaction commit
- **Event idempotency tracking:** A lightweight `event_outbox` table (or Redis set with TTL) stores processed `eventId` values per consumer to guarantee at-least-once delivery with exactly-once semantics

### 9.8 Key Flows

**Student Enrollment:**
1. Person exists in system → Admin creates Student record for Institution
2. StudentEnrollmentDetail created with academic session, grade, class
3. PersonInstitution updated with STUDENT role context
4. StudentEnrolled event published
5. AcademicsModule creates academic record references
6. FinanceModule creates fee assignment

**Staff Onboarding:**
1. Person exists in system → Admin creates Staff record for Institution
2. StaffEmploymentDetail created with position, department, employment type
3. PersonInstitution updated with STAFF role context
4. StaffHired event published
5. IdentityAccessModule provisions user access (if not already provisioned)
6. FinanceModule creates payroll record

**Applicant Processing:**
1. Applicant creates application → ApplicantCreated event
2. Admin reviews application → status changes to UNDER_REVIEW
3. Decision made → ACCEPTED or REJECTED
4. If ACCEPTED: Student record created, ApplicantConverted event
5. If REJECTED: ApplicantRejected event
6. If no action: Application expires after configurable period

---

## 10. Phase 6 — API Design

### 10.1 Response Envelope

| Type | Shape |
|------|-------|
| Success | `{ "success": true, "data": { ... } }` |
| List | `{ "success": true, "data": { "items": [...], "total": 100, "page": 1, "limit": 20 } }` |
| Error | `{ "success": false, "error": { "code": "ERROR_CODE", "message": "...", "details": [] } }` |

### 10.2 Common Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max: 100) |
| search | string | — | Text search across name, email, phone, public IDs (P-/STU-/EMP-/APP-), student/employee/applicant ID numbers, parent/guardian names, emergency contact names; supports fuzzy and exact matching |
| searchMode | string | fuzzy | Search mode: `fuzzy` (trigram, ILIKE) or `exact` (full match on public IDs and email) |
| sortBy | string | created_at | Sort field |
| sortOrder | string | desc | asc or desc |
| status | string | — | Filter by status |
| institutionId | uuid | — | Filter by Institution |

### 10.3 Endpoint Catalogue

#### People

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people | List people | people:person:list |
| GET | /api/v1/people/:id | Get person (by UUID or public ID e.g. P-2026-000123) | people:person:read |
| POST | /api/v1/people | Create person | people:person:create |
| PUT | /api/v1/people/:id | Update person | people:person:update |
| DELETE | /api/v1/people/:id | Soft delete person | people:person:delete |
| POST | /api/v1/people/:id/restore | Restore person | people:person:update |
| GET | /api/v1/people/search | Search people | people:person:search |

#### Person Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/profile | Get profile | people:person:read |
| PUT | /api/v1/people/:personId/profile | Update profile | people:person:update |
| POST | /api/v1/people/:personId/profile/photo | Upload profile photo | people:person:update |
| DELETE | /api/v1/people/:personId/profile/photo | Remove profile photo | people:person:update |

#### Person Institution Assignments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/institutions | List person institutions | people:person:read |
| POST | /api/v1/people/:personId/institutions | Assign to institution | people:person:assign |
| DELETE | /api/v1/people/:personId/institutions/:institutionId | Remove from institution | people:person:assign |

#### Students

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/students | List student records | people:student:list |
| GET | /api/v1/people/:personId/students/:id | Get student record (by UUID or public ID e.g. STU-2026-000456) | people:student:read |
| POST | /api/v1/people/:personId/students | Create student record | people:student:create |
| PUT | /api/v1/people/:personId/students/:id | Update student record | people:student:update |
| DELETE | /api/v1/people/:personId/students/:id | Soft delete student | people:student:delete |

#### Student Enrollment

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/students/:studentId/enrollment | Get enrollment detail | people:student:read |
| PUT | /api/v1/people/:personId/students/:studentId/enrollment | Update enrollment | people:student:update |

#### Student Graduation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/students/:studentId/graduation | Get graduation detail | people:student:read |
| PUT | /api/v1/people/:personId/students/:studentId/graduation | Update graduation | people:student:update |

#### Student Transfer

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/students/:studentId/transfer | Get transfer detail | people:student:read |
| PUT | /api/v1/people/:personId/students/:studentId/transfer | Update transfer | people:student:update |

#### Student Withdrawal

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/students/:studentId/withdrawal | Get withdrawal detail | people:student:read |
| PUT | /api/v1/people/:personId/students/:studentId/withdrawal | Update withdrawal | people:student:update |

#### Staff

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/staff | List staff records | people:staff:list |
| GET | /api/v1/people/:personId/staff/:id | Get staff record (by UUID or public ID e.g. EMP-2026-000789) | people:staff:read |
| POST | /api/v1/people/:personId/staff | Create staff record | people:staff:create |
| PUT | /api/v1/people/:personId/staff/:id | Update staff record | people:staff:update |
| DELETE | /api/v1/people/:personId/staff/:id | Soft delete staff | people:staff:delete |

#### Staff Employment

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/staff/:staffId/employment | Get employment detail | people:staff:read |
| PUT | /api/v1/people/:personId/staff/:staffId/employment | Update employment | people:staff:update |

#### Staff Qualifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/staff/:staffId/qualifications | List qualifications | people:staff:read |
| POST | /api/v1/people/:personId/staff/:staffId/qualifications | Add qualification | people:staff:update |
| PUT | /api/v1/people/:personId/staff/:staffId/qualifications/:id | Update qualification | people:staff:update |
| DELETE | /api/v1/people/:personId/staff/:staffId/qualifications/:id | Remove qualification | people:staff:update |

#### Staff Certifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/staff/:staffId/certifications | List certifications | people:staff:read |
| POST | /api/v1/people/:personId/staff/:staffId/certifications | Add certification | people:staff:update |
| PUT | /api/v1/people/:personId/staff/:staffId/certifications/:id | Update certification | people:staff:update |
| DELETE | /api/v1/people/:personId/staff/:staffId/certifications/:id | Remove certification | people:staff:update |

#### Parents

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/parents | List parent records | people:parent:list |
| GET | /api/v1/people/:personId/parents/:id | Get parent record | people:parent:read |
| POST | /api/v1/people/:personId/parents | Create parent record | people:parent:create |
| PUT | /api/v1/people/:personId/parents/:id | Update parent record | people:parent:update |
| DELETE | /api/v1/people/:personId/parents/:id | Soft delete parent | people:parent:delete |

#### Guardians

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/guardians | List guardian records | people:guardian:list |
| GET | /api/v1/people/:personId/guardians/:id | Get guardian record | people:guardian:read |
| POST | /api/v1/people/:personId/guardians | Create guardian record | people:guardian:create |
| PUT | /api/v1/people/:personId/guardians/:id | Update guardian record | people:guardian:update |
| DELETE | /api/v1/people/:personId/guardians/:id | Soft delete guardian | people:guardian:delete |

#### Applicants

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/applicants | List applicant records | people:applicant:list |
| GET | /api/v1/people/:personId/applicants/:id | Get applicant record (by UUID or public ID e.g. APP-2026-000012) | people:applicant:read |
| POST | /api/v1/people/:personId/applicants | Create applicant record | people:applicant:create |
| PUT | /api/v1/people/:personId/applicants/:id | Update applicant record | people:applicant:update |
| DELETE | /api/v1/people/:personId/applicants/:id | Soft delete applicant | people:applicant:delete |
| POST | /api/v1/people/:personId/applicants/:id/accept | Accept application | people:applicant:accept |
| POST | /api/v1/people/:personId/applicants/:id/reject | Reject application | people:applicant:reject |

#### Emergency Contacts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/emergency-contacts | List emergency contacts | people:emergency_contact:list |
| GET | /api/v1/people/:personId/emergency-contacts/:id | Get emergency contact | people:emergency_contact:read |
| POST | /api/v1/people/:personId/emergency-contacts | Add emergency contact | people:emergency_contact:create |
| PUT | /api/v1/people/:personId/emergency-contacts/:id | Update emergency contact | people:emergency_contact:update |
| DELETE | /api/v1/people/:personId/emergency-contacts/:id | Remove emergency contact | people:emergency_contact:delete |

#### Person Relationships

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/relationships | List relationships | people:relationship:list |
| GET | /api/v1/people/:personId/relationships/:id | Get relationship | people:relationship:read |
| POST | /api/v1/people/:personId/relationships | Create relationship | people:relationship:create |
| PUT | /api/v1/people/:personId/relationships/:id | Update relationship | people:relationship:update |
| DELETE | /api/v1/people/:personId/relationships/:id | Revoke relationship | people:relationship:delete |

#### People Documents

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/:personId/documents | List documents | people:document:list |
| GET | /api/v1/people/:personId/documents/:id | Get document | people:document:read |
| POST | /api/v1/people/:personId/documents | Add document reference | people:document:create |
| PUT | /api/v1/people/:personId/documents/:id | Update document | people:document:update |
| DELETE | /api/v1/people/:personId/documents/:id | Remove document | people:document:delete |

#### Person Merge

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/people/merge/suggestions | List merge suggestions | people:person:merge |
| POST | /api/v1/people/merge | Merge two Person records | people:person:merge |
| GET | /api/v1/people/merge/history | Merge audit history | people:person:merge |

---

## 11. Phase 7 — Testing & Verification

### 11.1 Test Strategy

| Category | Framework | Coverage Target |
|----------|-----------|-----------------|
| Unit Tests | Jest | 90%+ line coverage |
| Integration Tests | Jest + Testcontainers | All repository/service interactions |
| E2E Tests | Jest + Supertest | All API endpoints |
| Security Tests | Manual + Automated | OWASP Top 10 |

### 11.2 Test Categories Summary

| Category | Scenarios | Key Coverage |
|----------|-----------|--------------|
| Person CRUD (PER) | 15 | Create, update, soft delete, restore, search, email uniqueness |
| Student Lifecycle (STU) | 18 | Enroll, graduate, transfer, withdraw, academic record references |
| Staff Lifecycle (STF) | 16 | Hire, separate, leave, qualifications, certifications, employment history |
| Parent Management (PAR) | 8 | CRUD, contact preferences |
| Guardian Management (GUA) | 8 | CRUD, legal guardianship validation |
| Applicant Processing (APP) | 12 | CRUD, status transitions, accept, reject, expiry |
| Emergency Contacts (EMR) | 8 | CRUD, priority management, phone validation |
| Person Relationships (REL) | 12 | CRUD, bidirectional enforcement, temporal validation, overlap detection |
| People Documents (DOC) | 8 | CRUD, metadata management, file reference validation |
| Person Search (SRC) | 10 | Full-text search, tenant isolation, result limits, public ID lookup (P-/STU-/EMP-/APP-), fuzzy + exact modes |
| Person Merge (MRG) | 10 | Duplicate detection, merge operations, audit preservation, cross-domain updates, conflict resolution precedence |
| Public ID (PID) | 6 | Generation format, uniqueness per tenant, immutability, lookup by public ID |
| Event Idempotency (IDEM) | 6 | eventId deduplication, retry safety, consumer ack on skip, eventVersion handling |
| Concurrency (CONC) | 4 | Version mismatch returns 409, concurrent updates prevented, stale read detection |
| Tenant Isolation (TENANT) | 10 | Cross-tenant access prevention, Institution scoping |
| Authorization (AUTHZ) | 8 | Person access guard, Institution guard, module license guard |
| Edge Cases (EDGE) | 8 | Concurrent updates, race conditions, invalid states |
| Performance (PERF) | 5 | List queries <200ms, search <300ms |
| **Total** | **~330+** | |

### 11.3 Tenant Isolation Verification

| Test | Description | Expected |
|------|-------------|----------|
| TI-001 | Person A queries Person B (different tenant) | 404 or empty |
| TI-002 | User accesses Person in unassigned Institution | 403 |
| TI-003 | Person search scoped to tenant | Only tenant people returned |
| TI-004 | Student records isolated per tenant | Correct students returned |
| TI-005 | Staff records isolated per tenant | Correct staff returned |
| TI-006 | Emergency contacts isolated per tenant | Correct contacts returned |
| TI-007 | Person relationships isolated per tenant | Correct relationships returned |
| TI-008 | People documents isolated per tenant | Correct documents returned |

### 11.4 Production Readiness Checklist

- [ ] All unit tests passing (90%+ coverage)
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Security tests passing (OWASP Top 10)
- [ ] Performance benchmarks met
- [ ] Tenant isolation verified
- [ ] Database migrations tested
- [ ] Rollback procedures documented
- [ ] Monitoring/alerting configured
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] Audit trail verified
- [ ] Person search performance verified
- [ ] Relationship bidirectional consistency verified

---

## 12. Person Merge & Deduplication Strategy

Duplicate Person records may arise from bulk imports, self-service registration, or role transitions. This section defines how duplicates are detected, merged, and how data integrity is preserved.

### 12.1 Duplicate Detection Scenarios

| Scenario | Description |
|----------|-------------|
| Duplicate Student imports | Same student imported multiple times via CSV/bulk |
| Duplicate Parent records | Same parent registered for multiple children separately |
| Staff member becoming a Parent | Existing Staff Person record gains a Parent role |
| Parent later becoming Staff | Existing Parent Person record gains a Staff role |
| Multiple applications | Same person submits multiple applications (different names, emails) |
| Re-enrollment | Former student re-enrolls with a new record |

### 12.2 Merge Rules

| Rule | Description |
|------|-------------|
| Identity preserved | The surviving Person retains the original Person ID |
| Role-specific attributes merged | All role records (Student, Staff, Parent, etc.) from both records are consolidated |
| Relationships preserved | All Person Relationships from both records are transferred to the surviving Person |
| Audit history preserved | All audit log entries from both records are retained; source Person ID is logged in merge metadata |
| Cross-domain references updated | References from Academics, Finance, and Communication domains are updated to point to surviving Person |
| Documents consolidated | All People Documents from both records are consolidated under the surviving Person |
| Emergency Contacts consolidated | Emergency Contacts from both records are consolidated; duplicate priorities are resolved |
| Institution assignments merged | PersonInstitution records from both records are consolidated; duplicates are removed |

### 12.3 Merge Operations

| Operation | Description |
|-----------|-------------|
| Manual merge | Admin selects source and target Person records; system performs merge |
| Auto-merge suggestion | System detects potential duplicates and suggests merges for admin review |
| Bulk merge | Admin reviews and approves multiple suggested merges |

### 12.4 Merge Constraints

- Merge operations require Platform Admin or Institution Admin authorization
- Merged records cannot be unmerged; merge is a permanent operation
- All merge operations are fully audited with before/after snapshots
- Source Person records are soft-deleted after merge (not permanently deleted)
- Source Person records retain references for audit trail integrity
- Merge operations are wrapped in Prisma Interactive Transactions

### 12.5 Merge Conflict Resolution Policy

When merging duplicate Person records, field-level conflicts (e.g., different `first_name` values) are resolved by precedence:

| Priority | Source | Description |
|----------|--------|-------------|
| 1 | Verified fields | Fields marked as verified (e.g., government ID-verified) take highest precedence |
| 2 | Admin-selected fields | The admin performing the merge can explicitly choose which value to keep for each conflicting field |
| 3 | Newest non-null value | The most recently updated non-null value wins; nulls never overwrite non-nulls |
| 4 | Old value retained in audit | The losing value is not discarded; it is preserved in the merge audit trail as a `previousValue` entry |

**Rules:**
- Null values never overwrite non-null values (field-level null safety)
- The merge audit log captures every conflicting field with `previousValue` and `keptValue`
- Emergency contact priority conflicts are resolved by keeping both contacts and prompting the admin to re-assign priorities
- Relationship conflicts (same source/target/type but different metadata) are resolved by keeping the relationship with the most recent `start_date`
- Document conflicts (same type but different file references) are resolved by keeping both documents under the surviving Person

---

## 13. Person vs User Responsibilities

This section clarifies the boundary between the People domain (Person identity) and the Identity & Access domain (User authentication).

### 13.1 Person (People Domain)

| Responsibility | Description |
|----------------|-------------|
| Core identity | Name, email, phone, date of birth, gender, address, profile photo |
| Role-specific attributes | Student enrollment, Staff employment, Parent/Guardian contact preferences |
| Relationships | Parent-student, guardian-student, staff-student, sibling, emergency contacts |
| Documents | Document metadata and file references |
| Profile | Bio, custom fields, profile photo |
| Search | Full-text search across name, email, phone |

### 13.2 User (Identity & Access Domain)

| Responsibility | Description |
|----------------|-------------|
| Authentication | Email + password login, MFA, session management |
| Authorization | Roles, permissions, permission groups |
| Session management | Concurrent sessions, device fingerprinting, token refresh |
| Security policies | Password policies, login attempt limits, account locking |

### 13.3 Boundary Rules

| Rule | Description |
|------|-------------|
| Person without User | A Person may exist without a User account (e.g., Student, Parent without portal access) |
| User must reference Person | A User account must reference exactly one Person |
| No auto-creation | Creating a Student, Staff member, Parent, Guardian, or Applicant does not automatically create authentication credentials |
| Configurable portal access | Portal access is configurable by the Institution; not all People require User accounts |
| Authentication exclusivity | Authentication credentials remain exclusively owned by the Identity & Access domain |
| Lifecycle independence | Person can be Active, Inactive, or Soft Deleted regardless of whether a User account exists |
| Role changes preserved | A Staff member becoming a Parent retains the same Person identity; no new Person record created |

---

## 14. Address Modelling

Address is a reusable Value Object supporting multiple address types per Person.

### 14.1 Address Types

| Type | Purpose |
|------|---------|
| Residential | Primary home address |
| Mailing | Postal/correspondence address |
| Billing | Financial correspondence address |
| Emergency | Emergency contact address |

### 14.2 Address Rules

| Rule | Description |
|------|-------------|
| Multiple addresses per Person | A Person may have one address of each type |
| Address validation centralized | Address validation logic is shared across all address types |
| Country/regional support | Country and regional support remains configuration-driven |
| Future localization | Address model supports future localization requirements without redesign |
| Residential address required | At least one Residential address is required for Students |
| Billing address optional | Billing address is optional; defaults to Residential if not provided |

### 14.3 Address Fields

| Field | Type | Notes |
|-------|------|-------|
| address_type | enum | RESIDENTIAL, MAILING, BILLING, EMERGENCY |
| street_line_1 | varchar(200) | Required |
| street_line_2 | varchar(200) | Optional |
| city | varchar(100) | Required |
| state_province | varchar(100) | Optional, region-dependent |
| postal_code | varchar(20) | Optional, country-dependent |
| country | varchar(100) | Required, configuration-driven |

---

## 15. Data Retention & Archival Rules

This section defines lifecycle retention policies for People domain entities.

### 15.1 Retention Policies

| Entity | Active Retention | Soft Delete Retention | Archive After | Notes |
|--------|-----------------|----------------------|---------------|-------|
| Active Students | Indefinite | 30 days | N/A | Retained while enrolled |
| Graduated Students | Indefinite | 30 days | 365 days after graduation | Historical reporting required |
| Withdrawn Students | Indefinite | 30 days | 365 days after withdrawal | Historical reporting required |
| Former Staff | Indefinite | 30 days | 365 days after separation | HR compliance requirements |
| Archived Applicants | Indefinite | 30 days | 90 days after application expiry | Application data retained |
| Former Parents | Indefinite | 30 days | 365 days after last child graduates | Retained for sibling relationships |
| Former Guardians | Indefinite | 30 days | 365 days after ward graduates | Retained for legal compliance |
| Emergency Contacts | Indefinite | 30 days | N/A | Retained with Person record |
| Person Relationships | Indefinite | 30 days | N/A | Temporal validity handles expiry |
| People Documents | Indefinite | 30 days | Per document expiry date | Document expiry is type-specific |

### 15.2 Soft Delete vs Archive

| Operation | Description | Reversible | Data Access |
|-----------|-------------|------------|-------------|
| Soft Delete | Person excluded from normal queries via deleted_at/deleted_by; PersonStatus (ACTIVE/INACTIVE) is unaffected | Yes, within 30-day window | Read-only via admin |
| Archive | Person record retained for compliance; excluded from all normal operations | No | Read-only via admin |
| Permanent Delete | Person record permanently removed after retention period | No | None |

### 15.3 Restoration Rules

- Soft-deleted Person records can be restored within 30 days of deletion
- Restoration reverts `deleted_at`, clears `deleted_by`, and sets `is_active` = true
- Restoration restores all role-specific attributes and relationships
- Restoration is fully audited
- Archived records cannot be restored; they are retained for compliance only

### 15.4 Cross-Domain Reference Preservation

- Person soft delete does not remove references from Academics, Finance, or Communication domains
- Cross-domain references are preserved for historical reporting
- Soft-deleted Person records remain queryable by admin users for audit purposes
- Permanent deletion only occurs after all cross-domain references are resolved or expired

### 15.5 Historical Reporting

- Graduated Student records are retained for historical reporting and alumni tracking
- Former Staff records are retained for HR compliance and audit requirements
- Applicant records are retained for admission statistics and analysis
- All historical records are accessible via admin reporting interfaces

---

## 16. Outstanding Items

| Priority | Item | Status |
|----------|------|--------|
| High | Person bulk import (CSV/Excel) | Future |
| High | Person profile photo upload integration | Implementation |
| High | Person merge auto-suggestion algorithm | Future |
| Medium | Person relationship web visualization | Future |
| Medium | Staff payroll integration | Future |
| Medium | Student enrollment batch processing | Future |
| Medium | Address validation integration (postal service) | Future |
| Low | Person data export (CSV/JSON) | Future |
| Low | Applicant application portal | Future |
| Low | Emergency contact SMS notification | Future |
| Low | Person relationship history audit | Future |
| Planned | Rate limiting middleware | Implementation |
| Planned | Security headers middleware | Implementation |
| Planned | Public ID generation service (per-tenant sequential counter) | Implementation |
| Planned | Event deduplication store (Redis TTL set) | Implementation |

---

## 17. Future Integration Extension Points

This section identifies future integration boundaries that the People domain must support without redesign. All extension points follow the existing domain event and reference patterns.

### 17.1 Government & Regulatory Integrations

| Integration | Description | Integration Pattern |
|-------------|-------------|---------------------|
| Government ID Verification | Verify person identity against national ID databases | Domain event (`PersonIdentityVerified`); People stores verification status and reference |
| Birth Certificate Verification | Validate birth certificate against civil registry | Domain event (`BirthCertificateVerified`); People stores verification status |
| Tax ID / National Insurance | Link person to government tax identifiers | New field on Person or PeopleDocument with type `TAX_ID` |

### 17.2 Academic & HR System Integrations

| Integration | Description | Integration Pattern |
|-------------|-------------|---------------------|
| LMS (Learning Management System) | Sync student enrollment and staff assignments | Domain events (`StudentEnrolled`, `StaffHired`); LMS consumes events |
| Library Management | Link person to library membership | Domain event (`PersonLibraryRegistered`); People stores reference |
| Payroll System | Sync staff employment details to payroll | Domain events (`StaffHired`, `StaffSeparated`, `StaffEmploymentUpdated`); Finance consumes events |
| HR Information System | Sync staff qualifications, certifications, employment history | Domain events (`StaffQualificationAdded`, `StaffCertificationAdded`); HR consumes events |

### 17.3 Campus & Facility Integrations

| Integration | Description | Integration Pattern |
|-------------|-------------|---------------------|
| Hostel / Dormitory Management | Link students to hostel assignments | Domain event (`StudentHostelAssigned`); People stores reference |
| Transport Management | Link students/staff to transport routes | Domain event (`PersonTransportAssigned`); People stores reference |
| Biometric / Access Control | Link person to biometric templates or access cards | Domain event (`PersonBiometricEnrolled`); People stores reference (template stored externally) |

### 17.4 Communication & Payment Integrations

| Integration | Description | Integration Pattern |
|-------------|-------------|---------------------|
| Messaging Providers (SMS, WhatsApp, Email) | Deliver notifications via external providers | Domain events consumed by Communication domain; People provides contact preferences |
| Payment Gateways | Process application fees, tuition payments | Domain events consumed by Finance domain; People provides person and institution references |

### 17.5 Extension Guidelines

- New integration points must use existing domain events where possible; new events follow the same versioned envelope (§9.6)
- New person types (Alumni, Volunteers, Contractors, Visitors) follow the Person extension pattern (ADR-039)
- New document types are added to the `document_type` enum on `people_documents`
- New relationship types are added to the `RelationshipType` Prisma enum
- New person attributes are stored as JSON custom fields (`person_profiles.custom_fields`) before schema changes are warranted
- All integrations are institution-scoped and tenant-isolated

---

## 18. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-17 | Initial creation — All 7 phases complete |
| 2.0.0 | 2026-07-17 | Refinement #1 — Person as root aggregate, relationship cardinality, merge strategy, Person vs User, address modelling, data retention, ADRs |
| 3.0.0 | 2026-07-17 | Refinement #2 — Public business identifiers, optimistic concurrency expansion, domain event versioning, expanded person search, merge conflict resolution, event idempotency, soft delete vs business status, future integration extension points, cross-reference validation, ADR-040 through ADR-044 |

---

*This document is the permanent engineering specification for the People domain. It has been approved and should only be modified if future implementation reveals an architectural issue or a formally approved product requirement changes.*
