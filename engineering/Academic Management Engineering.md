# Academic Management Engineering Specification

**Domain:** Academic Management
**Scope:** Academic Calendar, Curriculum, Class Structure, Student Academic Placement, Staff Academic Assignment, Timetable Management, Attendance, Assignments, Assessments, Grading, Results, Academic Progression, Summer School, Academic Policies
**Created:** 2026-07-17
**Status:** Approved — Frozen for Implementation
**Last Updated:** 2026-07-20

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
12. [Academic Progression Policy Engine](#12-academic-progression-policy-engine)
13. [Summer School Extension](#13-summer-school-extension)
14. [Academic Policies Configuration](#14-academic-policies-configuration)
15. [Outstanding Items](#15-outstanding-items)
16. [Revision History](#16-revision-history)

---

## 1. Overview

Academic Management is the operational core of the platform, governing the complete academic lifecycle of an institution — from calendar and curriculum definition through teaching, assessment, grading, and student progression.

| Aspect | Approach |
|--------|----------|
| Identity | Institution-scoped; every entity belongs to one Institution |
| Calendar | Hierarchical: Academic Year → Sessions → Terms |
| Curriculum | Subjects organized by Departments, grouped by Streams |
| Classes | GradeLevel → Class → Arm with configurable capacity |
| Assessment | Continuous Assessment + Exams with configurable weighting |
| Grading | Configurable grade scales with boundaries and remarks |
| Progression | Policy-driven promotion, retention, graduation, withdrawal |
| Summer School | Optional institutional extension with configurable rules |
| Communication | Publishes events; does not own messaging or notifications |

**In Scope:** Academic calendar management, curriculum definition, class structure, student enrollment and class placement, subject registration, staff teaching assignments, timetable scheduling, attendance tracking, assignment creation and grading, assessment configuration and scoring, grade scale management, result compilation and publication, report card generation, academic progression (promotion, retention, graduation, withdrawal), academic probation, Summer School management, configurable academic policies

**Out of Scope:** Authentication, Authorization, Roles, Permissions, MFA, Sessions (Identity & Access), Person profiles (People), Institution configuration (Institution Management), Billing, Payments, Invoices (Finance), Messaging, Notifications, Email, SMS (Communication), CBT delivery engine, Learning content repository, Document storage (Platform Services), RFID / smart attendance hardware (Smart Campus)

---

## 2. Engineering Principles

### Core Philosophy

- **Calendar as Temporal Backbone:** Every academic operation is anchored to a specific Academic Year, Session, and Term; no entity exists outside the calendar hierarchy
- **Configuration over Customization:** Academic policies, grading rules, and progression criteria are institution-configurable via policy records; no code changes required
- **Institution-Specific Overrides:** Platform defaults exist for every policy; institutions can override at any level
- **Domain-First Architecture:** Each bounded context is self-contained with its own aggregates, services, and persistence
- **Multi-Tenant Isolation by Default:** Every query scoped to tenant context; cross-tenant access = security violation
- **Institution Scoping:** Every entity is scoped to one Institution; a Tenant may contain multiple Institutions
- **Event-Driven Communication:** Cross-service communication via domain events; eventual consistency
- **Soft Delete by Default:** All mutable core entities support restore within retention period
- **Business Status vs Soft Delete:** Status enums represent business states (e.g., ACTIVE, DRAFT, PUBLISHED); deletion is controlled by `deleted_at` / `deleted_by` columns exclusively
- **Optimistic Concurrency:** Version column on mutable entities; 409 Conflict on version mismatch
- **Immutable Audit Logging:** Append-only audit logs; never update or delete
- **Referential Integrity over Cascade:** Foreign keys enforce relationships; application logic prevents orphaned records
- **Result Immutability:** Once published, results are never modified; corrections create new result records with audit trail
- **People Domain Integration:** Student and Staff records are owned by the People domain; Academic Management references them via IDs and consumes their domain events

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Database tables | snake_case, plural | academic_years, subjects, classes |
| Columns | snake_case | academic_year_id, max_score |
| Enums | SCREAMING_SNAKE_CASE | ACTIVE, DRAFT, PUBLISHED |
| Classes | PascalCase | AcademicYearAggregate |
| Methods | camelCase | createAcademicYear |
| API responses | camelCase | success, academicYearId |
| Events | PascalCase, past tense | AcademicYearCreated |
| Errors | PascalCase + Error | AcademicYearNotFoundError |
| Permissions | `{domain}:{resource}:{action}` | academics:subject:read |

### Tenant Isolation

- Tenant ID extracted from JWT and passed to repository methods as first parameter
- Application-level filtering (no Postgres Row-Level Security)
- Every query must include tenant filter
- Institution ID further scopes queries within a tenant

### Soft Delete

- All mutable core entities use soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status (e.g., ACTIVE, DRAFT, PUBLISHED) is a separate concern from deletion
- 30-day restore window before permanent deletion
- Restore reverts `deleted_at`, clears `deleted_by`, sets `is_active` = true
- Permanent deletion only via admin job after retention period
- Published Results and Report Cards are never soft-deleted; they are immutable once published

### Audit Logging

Every state-changing operation generates an append-only audit log entry with: entity_type, entity_id, action, actor_id, actor_email, changes (JSON diff), context_ip, context_user_agent, timestamp.

### Error Handling

- Structured error responses: `{ success: false, error: { code, message, details[] } }`
- Domain-specific error classes; never expose internal details
- Full error context logged server-side

### Prisma Schema Principles

- UUID `@default(uuid())` for all primary keys
- `@unique` constraints for business keys
- `@map` for snake_case column names
- Soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status via `status` enum (never a deletion marker)
- Optimistic locking via `version` (Int @default(1))
- Audit fields: created_at, created_by, updated_at, updated_by
- JSON columns for flexible data (configuration, metadata)
- Prisma enums mapped to database types
- Cascade deletes: child entities cascade from parent aggregate root; cross-aggregate references use application-level guards

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
| ADR-001 | Calendar hierarchy: Year → Session → Term | Maps to real-world academic structures; supports institutions with varying calendar formats |
| ADR-002 | Subjects are Institution-scoped, not global | Different Institutions offer different subjects; no cross-Institution subject sharing |
| ADR-003 | Grade scales are Institution-configurable | Grading standards vary widely; institutions must define their own scales |
| ADR-004 | Result publication is immutable | Published results are authoritative; corrections create new versioned records |
| ADR-005 | Academic policies override platform defaults | Institutions must customize progression, grading, and attendance rules without code changes |
| ADR-006 | Timetable operates at Class level | Timetables are class-specific; teacher and room views are projections |
| ADR-007 | Attendance is per-subject-per-day | Granular attendance tracking enables subject-level attendance reports |
| ADR-008 | Assignments reference Platform Services for file storage | Assignment attachments are file references; storage belongs to Platform Services |
| ADR-009 | Assessments belong to a Term and Subject | Assessment scoring is term-bound; no cross-term assessments |
| ADR-010 | Class is the primary enrollment unit | Students enroll in a Class (not directly in subjects); subject registration follows class enrollment |
| ADR-011 | Teaching assignments are term-scoped | Staff-to-subject/class mappings change each term |
| ADR-012 | Summer School is an optional institutional extension | Not all institutions run Summer School; enabled via configuration |
| ADR-013 | Summer School results do not replace original results | Summer School is a supplementary pathway; original results are preserved |
| ADR-014 | Application-level tenant isolation (no RLS) | Consistent with Identity & Access and Institution Management |
| ADR-015 | Domain events via EventEmitter2 (in-process) | Decouples services; supports async processing; future migration to MQ |
| ADR-016 | Optimistic concurrency (version column) | Prevents lost updates; no pessimistic locking overhead |
| ADR-017 | Immutable audit logs (append-only) | Tamper-proof audit trail; compliance requirement |
| ADR-018 | Report Cards are generated artifacts, not source data | Report Cards are derived from Results; they are read-optimized projections |
| ADR-019 | Academic progression is policy-driven | Promotion, retention, graduation criteria vary by institution; all configurable |
| ADR-020 | Department is a curriculum grouping, not an org structure | Departments organize subjects; they do not model institutional org charts |
| ADR-021 | Streams represent academic tracks (Science, Arts, Commercial) | Streams determine elective subject availability and class composition |
| ADR-022 | Homeroom is a class-level concept | A Homeroom links a class to a class teacher; it is not a physical room |
| ADR-023 | Timetable clash detection is application-level | Clash detection runs on publish; no database-level constraint for slot overlaps |
| ADR-024 | Prerequisite satisfaction checked at registration time | Subject prerequisites are validated when a student registers, not at enrollment |
| ADR-025 | Assessment weights sum to 100% per category | Continuous Assessment and Examination weights are validated per grade scale |
| ADR-026 | StudentClassEnrollment is term-scoped | Students re-enroll each term; no open-ended enrollment |
| ADR-027 | Academic periods map to terms | AcademicPeriod is the operational unit within a term; supports half-terms, midterms |
| ADR-028 | Elective selection is class-and-stream-scoped | Electives are offered per stream; students select from available options |
| ADR-029 | Graduation requires policy-defined criteria | Graduation eligibility is configurable; includes credit requirements, attendance, and conduct |
| ADR-030 | Academic Policy records are versioned | Policy changes are tracked; historical policies are preserved for audit |
| ADR-031 | People domain events drive academic enrollment | StudentEnrolled and StaffHired events from People trigger academic record creation |
| ADR-032 | Academic entities use internal UUIDs only | Academic entities are internal-facing; external display uses Person-level public IDs (P-, STU-, EMP-) from the People domain |
| ADR-033 | GradeScale is the Aggregate Root for grading | GradeBoundary and Remark are child entities; they cannot exist without a GradeScale |
| ADR-034 | Conditional promotion is a first-class progression state | Not all students meet full promotion criteria; conditional promotion supports partial progression |
| ADR-035 | Attendance percentage is calculated per term, not cumulative | Term-based calculation enables clean term-over-term comparison |

---

## 4. Engineering Status

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 1 — Domain Analysis | Complete | 31 entities, 55+ domain events, 30 business rules |
| Phase 2 — Domain Design | Complete | 15 aggregates, 30 invariants, 20 policies, 12 validation rule sets |
| Phase 3 — Database Design | Complete | 35 tables, 50+ indexes, 20 unique constraints |
| Phase 4 — Prisma Schema | Complete | 35 models, 12 enums, 2-pass validation |
| Phase 5 — Backend Implementation | Complete | 15 modules, 15 repositories, 15 domain services, 14 controllers, 8 event consumers |
| Phase 6 — API Design | Complete | 110+ endpoints |
| Phase 7 — Testing & Verification | Complete | 18 test categories, ~240+ test scenarios |

**Overall Status:** Approved — Frozen for Implementation.

---

## 5. Phase 1 — Domain Analysis

### 5.1 Domain Purpose

Academic Management owns the complete academic lifecycle of an institution. Every academic operation — calendar definition, curriculum design, class scheduling, teaching assignment, attendance, assessment, grading, result compilation, and student progression — is governed by this domain.

The domain operates within strict institutional boundaries: each Institution defines its own calendar, curriculum, grading standards, and progression policies. Platform defaults exist, but institutions can override at any level.

### 5.2 Domain Responsibilities

| Responsibility | Description |
|----------------|-------------|
| Academic Calendar | Define and manage Academic Years, Sessions, and Terms with lifecycle transitions |
| Curriculum Management | Define Subjects, Subject Groups, Departments, and Streams |
| Class Structure | Define Grade Levels, Classes, Arms, and Homerooms with capacity rules |
| Student Placement | Enroll students in classes, register subjects, manage elective selection |
| Staff Assignment | Assign subject teachers, class teachers, department heads; manage workload |
| Timetable Management | Create and publish school, class, and teacher timetables; detect clashes |
| Attendance | Track student and staff attendance per subject per day |
| Assignments | Create assignments, manage submission windows, grade, provide feedback |
| Assessments | Configure and manage tests, exams, CA, practical and oral assessments |
| Grading | Define grade scales, boundaries, and remarks per institution |
| Results | Compile results from assessments, approve, publish, generate report cards |
| Academic Progression | Promote, retain, graduate, withdraw students based on configurable policies |
| Summer School | Configure and manage optional Summer School programs |
| Academic Policies | Define and version configurable policies for all academic operations |

### 5.3 Domain Boundaries

**In Scope:** Academic calendar, curriculum, class structure, student enrollment and placement, staff teaching assignments, timetable, attendance, assignments, assessments, grading, results, report cards, academic progression, Summer School, academic policies

**Out of Scope:** See §1 Overview.

### 5.4 Dependencies

| Dependency | Nature | Direction |
|------------|--------|-----------|
| Identity & Access | User authentication, authorization context | Reads |
| Institution Management | Institution context, tenant isolation, module licensing | Reads |
| People | Student and Staff person records, lifecycle events | Reads |
| Finance | Fee assignment references, payment status; creates fee assignments via SummerSchoolRegistered event | Reads + Writes |
| Communication | Notification delivery, messaging | Writes (references) |
| Platform Services | File storage for attachments, audit logging, event bus | Writes |

### 5.5 Core Entities

| Entity | Type | Description |
|--------|------|-------------|
| AcademicYear | Core | Academic year: name, start date, end date, status |
| AcademicSession | Core | Session within a year: name, start date, end date, status |
| Term | Core | Term within a session: name, start date, end date, status |
| Subject | Core | Subject definition: name, code, department, description, status |
| SubjectGroup | Supporting | Logical grouping of subjects (e.g., Science subjects, Arts subjects) |
| Department | Core | Organizational unit for subjects (e.g., Mathematics, English, Sciences) |
| Stream | Supporting | Academic track (Science, Arts, Commercial) determining elective availability |
| GradeLevel | Core | Grade level definition (e.g., JSS1, SS2, Year 1) |
| Class | Core | Class within a grade: name, arm, capacity, homeroom teacher |
| Arm | Supporting | Subdivision of a class (A, B, C) |
| Homeroom | Supporting | Class teacher assignment to a class |
| TeachingAssignment | Core | Staff-to-subject-class assignment for a term |
| Timetable | Core | Weekly timetable for a class or school |
| TimetableSlot | Supporting | Individual time slot within a timetable |
| StudentClassEnrollment | Core | Student enrolled in a class for a term |
| SubjectRegistration | Core | Student registered for specific subjects within enrollment |
| Attendance | Core | Student or staff attendance record per subject per day |
| Assignment | Core | Homework, project, or task with submission window |
| AssignmentSubmission | Supporting | Student submission for an assignment |
| Assessment | Core | Test, exam, or CA with scoring criteria |
| AssessmentResult | Core | Student score on a specific assessment |
| GradeScale | Core | Grading system definition (e.g., A-F, 0-100) |
| GradeBoundary | Supporting | Mark range → grade mapping within a scale |
| Remark | Supporting | Textual remark for grade ranges |
| Result | Core | Compiled result per student per term per subject |
| ReportCard | Core | Generated report card for a student per term |
| AcademicProgression | Core | Student promotion, retention, graduation, or withdrawal record |
| AcademicPolicy | Core | Configurable policy record (versioned) |
| SummerSchoolSession | Core | A Summer School offering for a specific term |
| SummerSchoolRegistration | Core | Student enrollment in a Summer School session |
| SummerSchoolResult | Core | Result after Summer School rewrite |

### 5.6 Lifecycle States

*Parenthesized states indicate terminal or exceptional transitions outside the primary lifecycle.*

**AcademicYear:** Draft → Active → Closed

**AcademicSession:** Draft → Active → Closed

**Term:** Draft → Active → Closed

**Subject:** Draft → Active → Inactive

**Department:** Active → Inactive

**GradeLevel:** Active → Inactive

**Class:** Draft → Active → Inactive

**TeachingAssignment:** Draft → Active → Revoked

**Timetable:** Draft → Published → Archived

**StudentClassEnrollment:** Enrolled → Active → (Transferred) → (Withdrawn)

**SubjectRegistration:** Registered → Active → (Dropped)

**Attendance:** Recorded → (Corrected)

**Assignment:** Draft → Published → Closed

**AssignmentSubmission:** Submitted → Graded → (Returned for Revision)

**Assessment:** Draft → Published → Graded

**GradeScale:** Draft → Active → Inactive

**Result:** Compiled → Approved → Published

**ReportCard:** Generated → Published

**AcademicProgression:** Pending → Promoted / Retained / Graduated / Withdrawn / Conditionally Promoted

**AcademicPolicy:** Draft → Active → Superseded

**SummerSchoolSession:** Configured → Open → Registration Closed → In Progress → Completed (enum: CONFIGURED, OPEN, REGISTRATION_CLOSED, IN_PROGRESS, COMPLETED)

**SummerSchoolRegistration:** Registered → Active → Completed

**SummerSchoolResult:** Compiled → Published

### 5.7 Business Rules

| ID | Rule | Scope |
|----|------|-------|
| BR-01 | Every entity is tenant-scoped and institution-scoped | Global |
| BR-02 | Academic Year name must be unique within Institution | Calendar |
| BR-03 | Academic Session belongs to exactly one Academic Year | Calendar |
| BR-04 | Term belongs to exactly one Academic Session | Calendar |
| BR-05 | Term start date must be before end date; end dates must not overlap within a session | Calendar |
| BR-06 | Subject must belong to one Department | Curriculum |
| BR-07 | GradeScale name must be unique within Institution | Grading |
| BR-08 | GradeBoundaries within a GradeScale must not overlap | Grading |
| BR-09 | Assessment weights within a category must sum to 100% | Assessment |
| BR-10 | Class belongs to one GradeLevel within one Institution | Class |
| BR-11 | Class capacity is enforced on StudentClassEnrollment | Enrollment |
| BR-12 | Student can be enrolled in one Class per Term per Institution | Enrollment |
| BR-13 | StudentSubjectRegistration is only valid if the subject is offered for the student's class and stream | Enrollment |
| BR-14 | Elective subjects must be available for the student's stream | Enrollment |
| BR-15 | Prerequisites must be satisfied before SubjectRegistration | Enrollment |
| BR-16 | TeachingAssignment links one Staff to one Subject + Class combination per Term | Assignment |
| BR-17 | Timetable slots cannot overlap for the same Class or the same Teacher | Timetable |
| BR-18 | Attendance can only be marked for active StudentClassEnrollments | Attendance |
| BR-19 | Assignments must have a valid submission window (start ≤ end) | Assignment |
| BR-20 | Assessment scores must be non-negative and ≤ max_score | Assessment |
| BR-21 | Results can only be compiled after all relevant assessments are graded | Result |
| BR-22 | Result approval requires designated authority role | Result |
| BR-23 | Published results are immutable; corrections create new versioned records | Result |
| BR-24 | Report Cards are generated from compiled and approved Results | Result |
| BR-25 | Promotion requires meeting configurable policy criteria | Progression |
| BR-26 | Summer School requires institutional configuration to be enabled | Summer School |
| BR-27 | Summer School maximum attainable grade is configurable per Institution | Summer School |
| BR-28 | Summer School results supplement, not replace, original term results | Summer School |
| BR-29 | Academic Policy changes are versioned; historical policies preserved | Policy |
| BR-30 | DepartmentHead assignment is one per Department per Institution per Term | Assignment |

### 5.8 Domain Events

| Event | Trigger | Consumers |
|-------|---------|-----------|
| AcademicYearCreated | Year created | AuditModule |
| AcademicYearActivated | Year status → Active | AuditModule |
| AcademicYearClosed | Year status → Closed | AuditModule |
| AcademicSessionCreated | Session created | AuditModule |
| AcademicSessionActivated | Session status → Active | AuditModule |
| AcademicSessionClosed | Session status → Closed | AuditModule |
| TermCreated | Term created | AuditModule |
| TermActivated | Term status → Active | AuditModule, TimetableModule |
| TermClosed | Term status → Closed | AuditModule, AttendanceModule, ResultModule |
| SubjectCreated | Subject created | AuditModule |
| SubjectUpdated | Subject modified | AuditModule |
| SubjectDeactivated | Subject status → Inactive | AuditModule |
| DepartmentCreated | Department created | AuditModule |
| GradeLevelCreated | Grade level created | AuditModule |
| ClassCreated | Class created | AuditModule |
| ClassUpdated | Class modified | AuditModule |
| TeachingAssignmentCreated | Staff assigned to subject+class | AuditModule |
| TeachingAssignmentRevoked | Assignment revoked | AuditModule |
| TimetablePublished | Timetable published | AuditModule |
| StudentClassEnrolled | Student enrolled in class | AuditModule, AttendanceModule, PeopleModule |
| StudentClassTransferred | Student transferred between classes | AuditModule, AttendanceModule, PeopleModule |
| SubjectRegistered | Student registered for subject | AuditModule |
| SubjectDropped | Student dropped from subject | AuditModule |
| AttendanceMarked | Attendance recorded | AuditModule |
| AttendanceCorrected | Attendance corrected | AuditModule |
| AssignmentCreated | Assignment created | AuditModule |
| AssignmentPublished | Assignment published to students | AuditModule, NotificationModule |
| AssignmentGraded | All submissions graded | AuditModule |
| AssignmentSubmitted | Student submitted assignment | AuditModule, NotificationModule |
| AssignmentReturned | Assignment returned with feedback | AuditModule, NotificationModule |
| AssessmentCreated | Assessment created | AuditModule |
| AssessmentPublished | Assessment published | AuditModule, NotificationModule |
| AssessmentGraded | All scores entered | AuditModule, ResultModule |
| GradeScaleCreated | Grade scale created | AuditModule |
| GradeScaleUpdated | Grade scale modified | AuditModule |
| ResultCompiled | Results compiled for student/term/subject | AuditModule, NotificationModule |
| ResultApproved | Results approved by authority | AuditModule, NotificationModule |
| ResultPublished | Results published to students | AuditModule, NotificationModule, PeopleModule |
| ReportCardGenerated | Report card generated | AuditModule, NotificationModule |
| ReportCardPublished | Report card published | AuditModule, NotificationModule |
| StudentPromoted | Student promoted to next grade | AuditModule, PeopleModule, NotificationModule |
| StudentRetained | Student retained in current grade | AuditModule, NotificationModule |
| StudentGraduated | Student graduated | AuditModule, PeopleModule, NotificationModule |
| StudentWithdrawn | Student withdrawn from institution | AuditModule, PeopleModule, NotificationModule |
| StudentPlacedOnProbation | Student placed on academic probation | AuditModule, NotificationModule |
| StudentRemovedFromProbation | Student removed from probation | AuditModule, NotificationModule |
| StudentConditionallyPromoted | Student conditionally promoted | AuditModule, NotificationModule |
| SummerSchoolSessionCreated | Summer School session created | AuditModule |
| SummerSchoolRegistrationOpened | Registration period opened | AuditModule, NotificationModule |
| SummerSchoolRegistered | Student registered for Summer School | AuditModule, NotificationModule |
| SummerSchoolResultPublished | Summer School result published | AuditModule, NotificationModule, PeopleModule |
| AcademicPolicyCreated | Policy created | AuditModule |
| AcademicPolicyUpdated | Policy updated (new version) | AuditModule |

### 5.9 Assumptions

1. Multi-tenant is the default deployment model
2. Every entity is institution-scoped
3. Student and Staff person records are owned by the People domain
4. Calendar hierarchy is Year → Session → Term
5. Grade scales are institution-configurable
6. Academic policies override platform defaults
7. Timetables are class-specific; teacher views are projections
8. Attendance is per-subject-per-day
9. Assignments reference Platform Services for file storage
10. Assessments belong to a Term and Subject
11. Students enroll in Classes, not directly in subjects
12. Teaching assignments are term-scoped
13. Summer School is optional and institution-configurable
14. Summer School results supplement, not replace, original results
15. Published results are immutable
16. Report Cards are generated artifacts derived from Results
17. Academic progression is policy-driven
18. Department is a curriculum grouping, not an org structure
19. Streams determine elective availability
20. Prerequisites are checked at registration time
21. Conditional promotion is a first-class progression state
22. Academic Policy records are versioned
23. People domain events (StudentEnrolled, StaffHired) trigger academic record creation
24. Attendance percentage is calculated per term
25. Class capacity is enforced on enrollment

---

## 6. Phase 2 — Domain Design

### 6.1 Aggregates

| Aggregate | Root Entity | Entities | Value Objects |
|-----------|------------|----------|---------------|
| AcademicCalendar | AcademicYear | AcademicSession, Term | CalendarStatus, DateRange |
| Curriculum | Subject | SubjectGroup, Department, Stream | SubjectCode, SubjectStatus |
| ClassStructure | GradeLevel | Class, Arm, Homeroom | ClassName, Capacity |
| TeachingAssignment | TeachingAssignment | — | AssignmentRole, Workload |
| Timetable | Timetable | TimetableSlot | DayOfWeek, TimeSlot, Room |
| StudentClassEnrollment | StudentClassEnrollment | SubjectRegistration | EnrollmentStatus, RegistrationStatus |
| Attendance | Attendance | — | AttendanceStatus, AttendanceType |
| Assignment | Assignment | AssignmentSubmission | SubmissionWindow, Feedback |
| Assessment | Assessment | AssessmentResult | AssessmentType, Score |
| Grading | GradeScale | GradeBoundary, Remark | ScaleType, MarkRange |
| Result | Result | ReportCard | ResultStatus, TermResult |
| AcademicProgression | AcademicProgression | — | ProgressionType, ProgressionCriteria |
| SummerSchool | SummerSchoolSession | SummerSchoolRegistration, SummerSchoolResult | CostModel, MaxGrade |
| AcademicPolicy | AcademicPolicy | — | PolicyType, PolicyValue |

### 6.2 Entity Relationships

| Relationship | Cardinality | Description |
|-------------|-------------|-------------|
| AcademicYear → AcademicSession | 1:N | A year has multiple sessions |
| AcademicSession → Term | 1:N | A session has multiple terms |
| AcademicYear → Term (flat) | 1:N | Direct access to all terms in a year |
| Department → Subject | 1:N | A department organizes multiple subjects |
| Subject → SubjectGroup | N:M | Subjects can belong to multiple groups |
| GradeLevel → Class | 1:N | A grade level has multiple classes |
| Class → Arm | 1:N | A class can have multiple arms |
| Class → Homeroom | 1:1 | A class has one homeroom teacher |
| GradeLevel → Stream | 1:N | A grade level can have multiple streams |
| Class → Stream | N:1 | A class belongs to one stream |
| StudentClassEnrollment → Class | N:1 | Enrollment in a class |
| StudentClassEnrollment → Term | N:1 | Enrollment for a term |
| SubjectRegistration → StudentClassEnrollment | N:1 | Subject registration within enrollment |
| SubjectRegistration → Subject | N:1 | Registration for a subject |
| TeachingAssignment → Subject | N:1 | Staff assigned to teach a subject |
| TeachingAssignment → Class | N:1 | Staff assigned to a class |
| TeachingAssignment → Term | N:1 | Assignment for a term |
| Timetable → Class | N:1 | Timetable for a class |
| TimetableSlot → Timetable | N:1 | Slot within a timetable |
| Attendance → StudentClassEnrollment | N:1 | Attendance for an enrollment |
| Attendance → Subject | N:1 | Attendance for a subject |
| Assignment → Subject | N:1 | Assignment for a subject |
| Assignment → Class | N:1 | Assignment for a class |
| AssignmentSubmission → Assignment | N:1 | Submission for an assignment |
| Assessment → Subject | N:1 | Assessment for a subject |
| Assessment → Term | N:1 | Assessment for a term |
| AssessmentResult → Assessment | N:1 | Score on an assessment |
| GradeBoundary → GradeScale | N:1 | Boundary within a scale |
| Remark → GradeScale | N:1 | Remark within a scale |
| Result → StudentClassEnrollment | N:1 | Result for an enrollment |
| Result → Subject | N:1 | Result for a subject |
| Result → Term | N:1 | Result for a term |
| ReportCard → Result (multiple) | N:M | Report card aggregates multiple results |
| AcademicProgression → StudentClassEnrollment | 1:1 | Progression based on enrollment |
| SummerSchoolSession → Term | N:1 | Summer School for a term |
| SummerSchoolRegistration → SummerSchoolSession | N:1 | Registration in a session |
| SummerSchoolResult → SummerSchoolRegistration | 1:1 | Result for a registration |

### 6.3 Domain Services

| Service | Responsibility |
|---------|---------------|
| AcademicCalendarService | Year, Session, Term CRUD and lifecycle transitions |
| CurriculumService | Subject, SubjectGroup, Department, Stream CRUD |
| ClassStructureService | GradeLevel, Class, Arm, Homeroom CRUD and capacity management |
| TeachingAssignmentService | Staff-to-subject/class assignment, workload management |
| TimetableService | Timetable CRUD, slot management, clash detection, publishing |
| StudentPlacementService | Enrollment, class placement, subject registration, elective selection |
| AttendanceService | Attendance marking, correction, report generation |
| AssignmentService | Assignment CRUD, submission management, grading, feedback |
| AssessmentService | Assessment CRUD, score entry, validation |
| GradingService | GradeScale, GradeBoundary, Remark CRUD and validation |
| ResultService | Result compilation, approval, publication, report card generation |
| AcademicProgressionService | Promotion, retention, graduation, withdrawal, probation management |
| SummerSchoolService | Session management, registration, result compilation |
| AcademicPolicyService | Policy CRUD, versioning, retrieval |
| AcademicSearchService | Search across academic entities with tenant isolation |

### 6.4 Aggregate Invariants

| ID | Invariant | Enforcement |
|----|-----------|-------------|
| I-01 | AcademicYear name must be unique within Institution | DB UNIQUE + Application validation |
| I-02 | AcademicSession belongs to exactly one AcademicYear | FK constraint + Application validation |
| I-03 | Term belongs to exactly one AcademicSession | FK constraint + Application validation |
| I-04 | Term dates must not overlap within a Session | Application validation |
| I-05 | Subject must belong to one Department | FK constraint |
| I-06 | GradeBoundary marks must not overlap within a GradeScale | DB UNIQUE + Application validation |
| I-07 | Class belongs to one GradeLevel | FK constraint |
| I-08 | Student can be enrolled in one Class per Term per Institution | DB UNIQUE + Application validation |
| I-09 | SubjectRegistration references an active Subject | Application validation |
| I-10 | TeachingAssignment is unique per Staff + Subject + Class + Term | DB UNIQUE |
| I-11 | Timetable slot times must not overlap for same Class | Application validation (clash detection) |
| I-12 | Timetable slot times must not overlap for same Teacher | Application validation (clash detection) |
| I-13 | Attendance references an active StudentClassEnrollment | Application validation |
| I-14 | Assessment scores must be non-negative and ≤ max_score | Application validation |
| I-15 | Assessment weights sum to 100% per category within a GradeScale | Application validation |
| I-16 | Result references active enrollment, subject, and term | Application validation |
| I-17 | Published Results are immutable | Application guard (no update/delete) |
| I-18 | ReportCard references approved Results only | Application validation |
| I-19 | AcademicProgression references valid enrollment and term | Application validation |
| I-20 | SummerSchoolSession requires enabled institution config | Application guard |
| I-21 | SummerSchoolResult max grade does not exceed institution configured maximum | Application validation |
| I-22 | AcademicPolicy version number is monotonically increasing per policy type | DB constraint + Application validation |
| I-23 | Class capacity is positive integer | Application validation |
| I-24 | Prerequisites checked at SubjectRegistration time | Application validation |
| I-25 | Elective subjects must be available for student's stream | Application validation |
| I-26 | DepartmentHead is one per Department per Institution per Term | DB UNIQUE |
| I-27 | Attendance date must fall within an active Term | Application validation |
| I-28 | Assignment submission window start ≤ end | Application validation |
| I-29 | GradeScale name unique within Institution | DB UNIQUE |
| I-30 | AcademicYear dates must not overlap within Institution | Application validation |

### 6.5 Configurable Policies

| ID | Policy | Default | Range |
|----|--------|---------|-------|
| P-01 | Max students per class | 40 | 10–100 |
| P-02 | Max arms per class | 5 | 1–10 |
| P-03 | Max subjects per student per term | 12 | 5–20 |
| P-04 | Max assessments per subject per term | 10 | 3–20 |
| P-05 | Max assignments per subject per term | 20 | 5–50 |
| P-06 | Attendance threshold for promotion (%) | 75 | 50–100 |
| P-07 | Pass mark (%) | 50 | 30–70 |
| P-08 | CA weight (%) | 40 | 20–60 |
| P-09 | Exam weight (%) | 60 | 40–80 |
| P-10 | Max late submission days | 3 | 0–14 |
| P-11 | Late submission penalty (% per day) | 10 | 0–50 |
| P-12 | Result approval authority | CLASS_TEACHER | CLASS_TEACHER, HEAD_TEACHER, PRINCIPAL |
| P-13 | Promotion attendance requirement (%) | 75 | 50–100 |
| P-14 | Promotion minimum average (%) | 50 | 30–70 |
| P-15 | Max conditional promotions per student | 1 | 0–3 |
| P-16 | Academic probation threshold (%) | 40 | 20–60 |
| P-17 | Summer School max grade | C | A, B, C, D |
| P-18 | Summer School registration fee model | PER_STUDENT | PER_STUDENT, PER_SUBJECT, FREE |
| P-19 | Soft delete retention (days) | 30 | 7–90 |
| P-20 | Search results max | 100 | 20–500 |

### 6.6 Validation Rules

#### Academic Year (V-AY)

| Rule | Description |
|------|-------------|
| V-AY-01 | Name: required, 1–50 chars, unique within Institution |
| V-AY-02 | Start date: required, valid date |
| V-AY-03 | End date: required, valid date, must be after start date |
| V-AY-04 | Status: required, valid enum (DRAFT, ACTIVE, CLOSED) |

#### Term (V-TR)

| Rule | Description |
|------|-------------|
| V-TR-01 | Name: required, 1–50 chars |
| V-TR-02 | Academic session ID: required, must exist and be active |
| V-TR-03 | Start date: required, valid date |
| V-TR-04 | End date: required, valid date, must be after start date |
| V-TR-05 | Dates must not overlap with other terms in the same session |
| V-TR-06 | Status: required, valid enum (DRAFT, ACTIVE, CLOSED) |

#### Subject (V-SU)

| Rule | Description |
|------|-------------|
| V-SU-01 | Name: required, 1–100 chars |
| V-SU-02 | Code: required, 1–20 chars, unique within Institution |
| V-SU-03 | Department ID: required, must exist and be active |
| V-SU-04 | Status: required, valid enum (DRAFT, ACTIVE, INACTIVE) |

#### GradeLevel (V-GL)

| Rule | Description |
|------|-------------|
| V-GL-01 | Name: required, 1–50 chars, unique within Institution |
| V-GL-02 | Display order: required, positive integer |
| V-GL-03 | Status: required, valid enum (ACTIVE, INACTIVE) |

#### Class (V-CL)

| Rule | Description |
|------|-------------|
| V-CL-01 | Name: required, 1–50 chars |
| V-CL-02 | Grade level ID: required, must exist and be active |
| V-CL-03 | Stream ID: optional, must exist if provided |
| V-CL-04 | Capacity: required, positive integer, ≤ institution max |
| V-CL-05 | Status: required, valid enum (DRAFT, ACTIVE, INACTIVE) |

#### TeachingAssignment (V-TA)

| Rule | Description |
|------|-------------|
| V-TA-01 | Staff person ID: required, must reference active Staff in People domain |
| V-TA-02 | Subject ID: required, must exist and be active |
| V-TA-03 | Class ID: required, must exist and be active |
| V-TA-04 | Term ID: required, must exist and be active |
| V-TA-05 | Unique per staff + subject + class + term |

#### Timetable (V-TT)

| Rule | Description |
|------|-------------|
| V-TT-01 | Class ID: required, must exist and be active |
| V-TT-02 | Term ID: required, must exist and be active |
| V-TT-03 | Status: required, valid enum (DRAFT, PUBLISHED, ARCHIVED) |
| V-TT-04 | Slot: day of week, start time, end time, subject, teacher |
| V-TT-05 | No overlapping slots for same class or same teacher |

#### StudentClassEnrollment (V-SCE)

| Rule | Description |
|------|-------------|
| V-SCE-01 | Student person ID: required, must reference active Student in People domain |
| V-SCE-02 | Class ID: required, must exist and be active |
| V-SCE-03 | Term ID: required, must exist and be active |
| V-SCE-04 | Unique per student + class + term |
| V-SCE-05 | Class capacity must not be exceeded |

#### SubjectRegistration (V-SR)

| Rule | Description |
|------|-------------|
| V-SR-01 | Student class enrollment ID: required |
| V-SR-02 | Subject ID: required, must exist and be active |
| V-SR-03 | Subject must be offered for student's class and stream |
| V-SR-04 | Prerequisites must be satisfied |
| V-SR-05 | Max subjects per student per term not exceeded |

#### Attendance (V-AT)

| Rule | Description |
|------|-------------|
| V-AT-01 | Student class enrollment ID or staff person ID: required |
| V-AT-02 | Subject ID: required |
| V-AT-03 | Date: required, must fall within an active Term |
| V-AT-04 | Status: required, valid enum (PRESENT, ABSENT, LATE, EXCUSED) |
| V-AT-05 | Attendance type: required, STUDENT or STAFF |

#### Assignment (V-AS)

| Rule | Description |
|------|-------------|
| V-AS-01 | Title: required, 1–200 chars |
| V-AS-02 | Subject ID: required |
| V-AS-03 | Class ID: required |
| V-AS-04 | Term ID: required |
| V-AS-05 | Submission start: required, valid date |
| V-AS-06 | Submission end: required, must be ≥ start |
| V-AS-07 | Max score: required, positive number |
| V-AS-08 | Status: required, valid enum (DRAFT, PUBLISHED, CLOSED) |

#### Assessment (V-AM)

| Rule | Description |
|------|-------------|
| V-AM-01 | Title: required, 1–200 chars |
| V-AM-02 | Assessment type: required, valid enum (CONTINUOUS_ASSESSMENT, TEST, EXAMINATION, PRACTICAL, ORAL) |
| V-AM-03 | Subject ID: required |
| V-AM-04 | Term ID: required |
| V-AM-05 | Max score: required, positive number |
| V-AM-06 | Weight: required, 0–100, must sum to 100% per category |
| V-AM-07 | Status: required, valid enum (DRAFT, PUBLISHED, GRADED) |

#### GradeScale (V-GS)

| Rule | Description |
|------|-------------|
| V-GS-01 | Name: required, 1–50 chars, unique within Institution |
| V-GS-02 | Description: optional, max 500 chars |
| V-GS-03 | Status: required, valid enum (DRAFT, ACTIVE, INACTIVE) |
| V-GS-04 | Boundaries: at least one boundary required when active |

#### Result (V-RES)

| Rule | Description |
|------|-------------|
| V-RES-01 | Student class enrollment ID: required |
| V-RES-02 | Subject ID: required |
| V-RES-03 | Term ID: required |
| V-RES-04 | Total score: required, calculated from assessment results |
| V-RES-05 | Grade: required, determined by grade boundary lookup |
| V-RES-06 | Unique per enrollment + subject + term |
| V-RES-07 | Status: required, valid enum (COMPILED, APPROVED, PUBLISHED) |

### 6.7 Read Models

| Model | Key Fields |
|-------|------------|
| AcademicYearSummary | id, name, startDate, endDate, status, sessionCount, createdAt |
| TermSummary | id, academicYearId, academicYearName, name, startDate, endDate, status |
| SubjectSummary | id, name, code, departmentId, departmentName, status |
| DepartmentSummary | id, name, subjectCount, status |
| GradeLevelSummary | id, name, displayOrder, classCount, status |
| ClassSummary | id, name, gradeLevelId, gradeLevelName, streamName, capacity, enrolledCount, homeroomTeacherName, status |
| TeachingAssignmentSummary | id, staffPersonId, staffName, subjectId, subjectName, classId, className, termId, termName |
| TimetableSummary | id, className, termName, slotCount, status |
| StudentClassEnrollmentSummary | id, studentPersonId, studentName, classId, className, termId, termName, status |
| AttendanceSummary | id, studentPersonId, studentName, className, subjectName, date, status, attendanceType |
| AssignmentSummary | id, title, subjectName, className, submissionStart, submissionEnd, maxScore, status |
| AssessmentSummary | id, title, assessmentType, subjectName, termName, maxScore, weight, status |
| GradeScaleSummary | id, name, boundaryCount, status |
| ResultSummary | id, studentName, subjectName, termName, totalScore, grade, remark, status |
| ReportCardSummary | id, studentName, className, termName, averageScore, position, status |
| AcademicProgressionSummary | id, studentName, className, termName, progressionType, newClassName, status |
| SummerSchoolSessionSummary | id, termName, eligibleStudents, registeredCount, status |
| AcademicPolicySummary | id, policyType, policyKey, value, version, status |

---

## 7. Phase 3 — Database Design

### 7.1 Table Catalogue

| Table | Description | Tenant Scoped | Soft Delete |
|-------|-------------|---------------|-------------|
| academic_years | Academic year records | Yes | Yes |
| academic_sessions | Sessions within years | Yes | Yes |
| terms | Terms within sessions | Yes | Yes |
| subjects | Subject definitions | Yes | Yes |
| subject_groups | Subject groupings | Yes | Yes |
| departments | Department definitions | Yes | Yes |
| streams | Academic streams | Yes | Yes |
| grade_levels | Grade level definitions | Yes | Yes |
| classes | Class definitions | Yes | Yes |
| arms | Class arm subdivisions | Yes | Yes |
| homerooms | Class teacher assignments | Yes | Yes |
| teaching_assignments | Staff-to-subject-class mappings | Yes | Yes |
| timetables | Timetable definitions | Yes | Yes |
| timetable_slots | Individual time slots | Yes | Yes |
| student_class_enrollments | Student enrollment in classes | Yes | Yes |
| subject_registrations | Student subject registrations | Yes | Yes |
| attendance | Attendance records | Yes | No |
| assignments | Assignment definitions | Yes | Yes |
| assignment_submissions | Student submissions | Yes | Yes |
| assessments | Assessment definitions | Yes | Yes |
| assessment_results | Student scores on assessments | Yes | Yes |
| grade_scales | Grading system definitions | Yes | Yes |
| grade_boundaries | Mark range → grade mappings | Yes | Yes |
| remarks | Grade-range remarks | Yes | Yes |
| results | Compiled student results | Yes | No |
| report_cards | Generated report cards | Yes | No |
| academic_progressions | Student progression records | Yes | Yes |
| academic_policies | Configurable policy records | Yes | Yes |
| summer_school_sessions | Summer School offerings | Yes | Yes |
| summer_school_registrations | Summer School enrollments | Yes | Yes |
| summer_school_results | Summer School results | Yes | No |

### 7.2 Column Catalogue

**Common columns** (all mutable tables): `id` (uuid PK), `tenant_id` (uuid FK), `institution_id` (uuid FK), `created_at` (timestamptz), `created_by` (uuid), `updated_at` (timestamptz), `updated_by` (uuid), `deleted_at` (timestamptz nullable), `deleted_by` (uuid nullable), `version` (int, default 1)

#### academic_years

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(50) | UNIQUE per institution, e.g., "2025/2026" |
| start_date | date | |
| end_date | date | must be > start_date |
| status | academic_year_status enum | DRAFT, ACTIVE, CLOSED |
| is_active | boolean | default true |

#### academic_sessions

| Column | Type | Notes |
|--------|------|-------|
| academic_year_id | uuid FK → academic_years | |
| name | varchar(50) | e.g., "First Semester" |
| start_date | date | |
| end_date | date | must be > start_date |
| status | session_status enum | DRAFT, ACTIVE, CLOSED |

UNIQUE (tenant_id, institution_id, academic_year_id, name).

#### terms

| Column | Type | Notes |
|--------|------|-------|
| academic_session_id | uuid FK → academic_sessions | |
| name | varchar(50) | e.g., "Term 1" |
| start_date | date | |
| end_date | date | must be > start_date |
| status | term_status enum | DRAFT, ACTIVE, CLOSED |

UNIQUE (tenant_id, institution_id, academic_session_id, name).

#### subjects

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(100) | |
| code | varchar(20) | UNIQUE per institution |
| department_id | uuid FK → departments | |
| description | varchar(500) | nullable |
| status | subject_status enum | DRAFT, ACTIVE, INACTIVE |

#### subject_groups

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(100) | UNIQUE per institution |
| description | varchar(500) | nullable |

Subject-to-subject_group is many-to-many via `subject_subject_groups` join table.

#### subject_subject_groups

| Column | Type | Notes |
|--------|------|-------|
| subject_id | uuid FK → subjects | |
| subject_group_id | uuid FK → subject_groups | |

UNIQUE (tenant_id, subject_id, subject_group_id). No soft delete.

#### departments

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(100) | UNIQUE per institution |
| head_staff_id | uuid FK → (People domain Staff) | nullable |
| status | department_status enum | ACTIVE, INACTIVE |

#### streams

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(100) | UNIQUE per institution, e.g., "Science", "Arts", "Commercial" |
| grade_level_id | uuid FK → grade_levels | |

UNIQUE (tenant_id, institution_id, name, grade_level_id).

#### grade_levels

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(50) | UNIQUE per institution, e.g., "JSS1", "SS2" |
| display_order | integer | ordering within institution |
| status | grade_level_status enum | ACTIVE, INACTIVE |

#### classes

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(50) | e.g., "JSS1A" |
| grade_level_id | uuid FK → grade_levels | |
| stream_id | uuid FK → streams | nullable |
| capacity | integer | max students |
| status | class_status enum | DRAFT, ACTIVE, INACTIVE |

UNIQUE (tenant_id, institution_id, grade_level_id, name).

#### arms

| Column | Type | Notes |
|--------|------|-------|
| class_id | uuid FK → classes | |
| name | varchar(10) | e.g., "A", "B", "C" |
| staff_person_id | uuid FK → (People domain Staff) | nullable, arm teacher |

UNIQUE (tenant_id, class_id, name).

#### homerooms

| Column | Type | Notes |
|--------|------|-------|
| class_id | uuid FK → classes | UNIQUE |
| staff_person_id | uuid FK → (People domain Staff) | class teacher |
| assigned_at | timestamptz | default now() |

#### teaching_assignments

| Column | Type | Notes |
|--------|------|-------|
| staff_person_id | uuid FK → (People domain Staff) | |
| subject_id | uuid FK → subjects | |
| class_id | uuid FK → classes | |
| term_id | uuid FK → terms | |
| role | teaching_role enum | SUBJECT_TEACHER, CLASS_TEACHER, DEPARTMENT_HEAD |
| workload_hours | integer | nullable, weekly hours |

UNIQUE (tenant_id, staff_person_id, subject_id, class_id, term_id).

#### timetables

| Column | Type | Notes |
|--------|------|-------|
| class_id | uuid FK → classes | |
| term_id | uuid FK → terms | |
| status | timetable_status enum | DRAFT, PUBLISHED, ARCHIVED |

UNIQUE (tenant_id, institution_id, class_id, term_id).

#### timetable_slots

| Column | Type | Notes |
|--------|------|-------|
| timetable_id | uuid FK → timetables | |
| day_of_week | day_of_week enum | MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY |
| start_time | time | |
| end_time | time | must be > start_time |
| subject_id | uuid FK → subjects | |
| staff_person_id | uuid FK → (People domain Staff) | |
| room | varchar(100) | nullable |

UNIQUE (tenant_id, timetable_id, day_of_week, start_time).

#### student_class_enrollments

| Column | Type | Notes |
|--------|------|-------|
| student_person_id | uuid FK → (People domain Student) | |
| class_id | uuid FK → classes | |
| term_id | uuid FK → terms | |
| enrollment_date | date | |
| status | enrollment_status enum | ENROLLED, ACTIVE, TRANSFERRED, WITHDRAWN |

UNIQUE (tenant_id, student_person_id, class_id, term_id).

#### subject_registrations

| Column | Type | Notes |
|--------|------|-------|
| student_class_enrollment_id | uuid FK → student_class_enrollments | |
| subject_id | uuid FK → subjects | |
| registered_at | timestamptz | default now() |
| status | registration_status enum | REGISTERED, ACTIVE, DROPPED |

UNIQUE (tenant_id, student_class_enrollment_id, subject_id).

#### attendance

| Column | Type | Notes |
|--------|------|-------|
| student_class_enrollment_id | uuid FK → student_class_enrollments | nullable |
| staff_person_id | uuid FK → (People domain Staff) | nullable |
| subject_id | uuid FK → subjects | |
| date | date | |
| status | attendance_status enum | PRESENT, ABSENT, LATE, EXCUSED |
| attendance_type | attendance_type enum | STUDENT, STAFF |
| notes | varchar(500) | nullable |
| corrected | boolean | default false |
| corrected_by | uuid | nullable |
| corrected_at | timestamptz | nullable |

CHECK: exactly one of student_class_enrollment_id or staff_person_id must be non-null.
UNIQUE (tenant_id, student_class_enrollment_id, subject_id, date) WHERE attendance_type = STUDENT.

#### assignments

| Column | Type | Notes |
|--------|------|-------|
| title | varchar(200) | |
| description | text | nullable |
| subject_id | uuid FK → subjects | |
| class_id | uuid FK → classes | |
| term_id | uuid FK → terms | |
| submission_start | timestamptz | |
| submission_end | timestamptz | must be ≥ submission_start |
| max_score | decimal(10,2) | |
| attachments | json | nullable, file references |
| status | assignment_status enum | DRAFT, PUBLISHED, CLOSED |

#### assignment_submissions

| Column | Type | Notes |
|--------|------|-------|
| assignment_id | uuid FK → assignments | |
| student_class_enrollment_id | uuid FK → student_class_enrollments | |
| submitted_at | timestamptz | |
| content | text | nullable |
| attachments | json | nullable, file references |
| score | decimal(10,2) | nullable |
| feedback | text | nullable |
| graded_by | uuid | nullable |
| graded_at | timestamptz | nullable |
| status | submission_status enum | SUBMITTED, GRADED, RETURNED |

UNIQUE (tenant_id, assignment_id, student_class_enrollment_id).

#### assessments

| Column | Type | Notes |
|--------|------|-------|
| title | varchar(200) | |
| assessment_type | assessment_type enum | CONTINUOUS_ASSESSMENT, TEST, EXAMINATION, PRACTICAL, ORAL |
| subject_id | uuid FK → subjects | |
| term_id | uuid FK → terms | |
| max_score | decimal(10,2) | |
| weight | decimal(5,2) | percentage, must sum to 100% per category |
| date | date | nullable |
| status | assessment_status enum | DRAFT, PUBLISHED, GRADED |

#### assessment_results

| Column | Type | Notes |
|--------|------|-------|
| assessment_id | uuid FK → assessments | |
| student_class_enrollment_id | uuid FK → student_class_enrollments | |
| score | decimal(10,2) | must be ≥ 0 and ≤ max_score |
| graded_by | uuid | |
| graded_at | timestamptz | |
| notes | varchar(500) | nullable |

UNIQUE (tenant_id, assessment_id, student_class_enrollment_id).

#### grade_scales

| Column | Type | Notes |
|--------|------|-------|
| name | varchar(50) | UNIQUE per institution |
| description | varchar(500) | nullable |
| status | grade_scale_status enum | DRAFT, ACTIVE, INACTIVE |

#### grade_boundaries

| Column | Type | Notes |
|--------|------|-------|
| grade_scale_id | uuid FK → grade_scales | |
| grade | varchar(10) | e.g., "A", "B+", "C" |
| min_score | decimal(10,2) | inclusive |
| max_score | decimal(10,2) | inclusive, must be ≥ min_score |
| remark | varchar(200) | nullable |
| display_order | integer | |

UNIQUE (tenant_id, grade_scale_id, grade).
CHECK: boundaries must not overlap within a grade_scale_id.

#### remarks

| Column | Type | Notes |
|--------|------|-------|
| grade_scale_id | uuid FK → grade_scales | |
| min_score | decimal(10,2) | inclusive |
| max_score | decimal(10,2) | inclusive |
| remark_text | varchar(500) | |

#### results

| Column | Type | Notes |
|--------|------|-------|
| student_class_enrollment_id | uuid FK → student_class_enrollments | |
| subject_id | uuid FK → subjects | |
| term_id | uuid FK → terms | |
| total_score | decimal(10,2) | calculated |
| grade | varchar(10) | determined by grade boundary lookup |
| remark | varchar(200) | nullable |
| rank | integer | nullable, within class per subject |
| ca_score | decimal(10,2) | continuous assessment subtotal |
| exam_score | decimal(10,2) | examination subtotal |
| grade_scale_id | uuid FK → grade_scales | |
| status | result_status enum | COMPILED, APPROVED, PUBLISHED |
| version_number | integer | default 1, incremented on corrections |

UNIQUE (tenant_id, student_class_enrollment_id, subject_id, term_id). No soft delete.

#### report_cards

| Column | Type | Notes |
|--------|------|-------|
| student_class_enrollment_id | uuid FK → student_class_enrollments | |
| term_id | uuid FK → terms | |
| average_score | decimal(10,2) | |
| position | integer | nullable, class position |
| total_score | decimal(10,2) | sum of all subject scores |
| remarks | text | nullable, overall remarks |
| generated_at | timestamptz | |
| published_at | timestamptz | nullable |
| status | report_card_status enum | GENERATED, PUBLISHED |

UNIQUE (tenant_id, student_class_enrollment_id, term_id). No soft delete.

#### academic_progressions

| Column | Type | Notes |
|--------|------|-------|
| student_person_id | uuid FK → (People domain Student) | |
| from_class_id | uuid FK → classes | |
| to_class_id | uuid FK → classes | nullable, null for withdrawal |
| term_id | uuid FK → terms | |
| progression_type | progression_type enum | PROMOTED, CONDITIONALLY_PROMOTED, RETAINED, GRADUATED, WITHDRAWN |
| criteria_met | json | snapshot of criteria evaluation |
| notes | varchar(500) | nullable |
| approved_by | uuid | nullable |
| approved_at | timestamptz | nullable |

UNIQUE (tenant_id, student_person_id, term_id).

#### academic_policies

| Column | Type | Notes |
|--------|------|-------|
| policy_type | varchar(50) | PROMOTION, GRADING, ATTENDANCE, GRADUATION, RANKING, SUMMER_SCHOOL, etc. |
| policy_key | varchar(100) | e.g., "pass_mark", "attendance_threshold" |
| value | json | policy value (number, string, boolean, or complex object) |
| description | varchar(500) | nullable |
| version | integer | default 1 |
| effective_from | date | |
| effective_to | date | nullable, null = currently active |
| status | policy_status enum | DRAFT, ACTIVE, SUPERSEDED |

UNIQUE (tenant_id, institution_id, policy_type, policy_key, version).

#### summer_school_sessions

| Column | Type | Notes |
|--------|------|-------|
| term_id | uuid FK → terms | summer school for this term |
| name | varchar(100) | |
| registration_start | date | |
| registration_end | date | must be ≥ registration_start |
| start_date | date | |
| end_date | date | must be ≥ start_date |
| exam_start_date | date | nullable |
| exam_end_date | date | nullable |
| cost_model | cost_model_enum | PER_STUDENT, PER_SUBJECT, FREE |
| cost_amount | decimal(10,2) | nullable, used if cost_model != FREE |
| max_grade | varchar(10) | configurable, e.g., "C" |
| eligible_grades | json | list of grades that qualify for summer school |
| status | summer_school_status enum | CONFIGURED, OPEN, REGISTRATION_CLOSED, IN_PROGRESS, COMPLETED |

UNIQUE (tenant_id, institution_id, term_id, name).

#### summer_school_registrations

| Column | Type | Notes |
|--------|------|-------|
| summer_school_session_id | uuid FK → summer_school_sessions | |
| student_person_id | uuid FK → (People domain Student) | |
| registered_at | timestamptz | default now() |
| payment_status | varchar(50) | nullable, PENDING, COMPLETED, WAIVED |
| status | ss_registration_status enum | REGISTERED, ACTIVE, COMPLETED |

UNIQUE (tenant_id, summer_school_session_id, student_person_id).

#### summer_school_results

| Column | Type | Notes |
|--------|------|-------|
| summer_school_registration_id | uuid FK → summer_school_registrations | |
| subject_id | uuid FK → subjects | |
| original_grade | varchar(10) | grade from original term |
| new_score | decimal(10,2) | nullable |
| new_grade | varchar(10) | nullable, capped at session max_grade |
| published | boolean | default false |
| published_at | timestamptz | nullable |

UNIQUE (tenant_id, summer_school_registration_id, subject_id). No soft delete.

### 7.3 Constraints

| Table | Type | Columns |
|-------|------|---------|
| academic_years | UNIQUE | (tenant_id, institution_id, name) |
| academic_sessions | UNIQUE | (tenant_id, institution_id, academic_year_id, name) |
| terms | UNIQUE | (tenant_id, institution_id, academic_session_id, name) |
| subjects | UNIQUE | (tenant_id, institution_id, code) |
| subject_groups | UNIQUE | (tenant_id, institution_id, name) |
| departments | UNIQUE | (tenant_id, institution_id, name) |
| streams | UNIQUE | (tenant_id, institution_id, name, grade_level_id) |
| grade_levels | UNIQUE | (tenant_id, institution_id, name) |
| classes | UNIQUE | (tenant_id, institution_id, grade_level_id, name) |
| arms | UNIQUE | (tenant_id, class_id, name) |
| homerooms | UNIQUE | (class_id) |
| teaching_assignments | UNIQUE | (tenant_id, staff_person_id, subject_id, class_id, term_id) |
| timetables | UNIQUE | (tenant_id, institution_id, class_id, term_id) |
| timetable_slots | UNIQUE | (tenant_id, timetable_id, day_of_week, start_time) |
| student_class_enrollments | UNIQUE | (tenant_id, student_person_id, class_id, term_id) |
| subject_registrations | UNIQUE | (tenant_id, student_class_enrollment_id, subject_id) |
| assignment_submissions | UNIQUE | (tenant_id, assignment_id, student_class_enrollment_id) |
| assessment_results | UNIQUE | (tenant_id, assessment_id, student_class_enrollment_id) |
| grade_scales | UNIQUE | (tenant_id, institution_id, name) |
| grade_boundaries | UNIQUE | (tenant_id, grade_scale_id, grade) |
| results | UNIQUE | (tenant_id, student_class_enrollment_id, subject_id, term_id) |
| report_cards | UNIQUE | (tenant_id, student_class_enrollment_id, term_id) |
| academic_progressions | UNIQUE | (tenant_id, student_person_id, term_id) |
| academic_policies | UNIQUE | (tenant_id, institution_id, policy_type, policy_key, version) |
| summer_school_sessions | UNIQUE | (tenant_id, institution_id, term_id, name) |
| summer_school_registrations | UNIQUE | (tenant_id, summer_school_session_id, student_person_id) |
| summer_school_results | UNIQUE | (tenant_id, summer_school_registration_id, subject_id) |

### 7.4 Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| academic_years | idx_ay_tenant_institution | (tenant_id, institution_id) | Institution years |
| academic_years | idx_ay_status | (tenant_id, status) | Status filtering |
| academic_sessions | idx_as_tenant_year | (tenant_id, academic_year_id) | Year's sessions |
| terms | idx_terms_tenant_session | (tenant_id, academic_session_id) | Session's terms |
| subjects | idx_subjects_tenant_institution | (tenant_id, institution_id) | Institution subjects |
| subjects | idx_subjects_department | (department_id) | Department's subjects |
| subjects | idx_subjects_status | (tenant_id, status) | Status filtering |
| departments | idx_departments_tenant | (tenant_id, institution_id) | Institution departments |
| classes | idx_classes_tenant_grade | (tenant_id, grade_level_id) | Grade's classes |
| classes | idx_classes_tenant_institution | (tenant_id, institution_id) | Institution classes |
| teaching_assignments | idx_ta_staff | (staff_person_id) | Staff assignments |
| teaching_assignments | idx_ta_class | (class_id) | Class assignments |
| teaching_assignments | idx_ta_subject | (subject_id) | Subject assignments |
| teaching_assignments | idx_ta_term | (term_id) | Term assignments |
| timetables | idx_tt_class | (class_id) | Class timetable |
| timetables | idx_tt_term | (term_id) | Term timetables |
| timetable_slots | idx_ts_timetable | (timetable_id) | Timetable slots |
| student_class_enrollments | idx_sce_student | (student_person_id) | Student enrollments |
| student_class_enrollments | idx_sce_class | (class_id) | Class enrollments |
| student_class_enrollments | idx_sce_term | (term_id) | Term enrollments |
| subject_registrations | idx_sr_enrollment | (student_class_enrollment_id) | Enrollment registrations |
| attendance | idx_att_student_date | (student_class_enrollment_id, date) | Student attendance lookup |
| attendance | idx_att_staff_date | (staff_person_id, date) | Staff attendance lookup |
| attendance | idx_att_subject_date | (subject_id, date) | Subject attendance lookup |
| assignments | idx_asg_class | (class_id) | Class assignments |
| assignments | idx_asg_subject | (subject_id) | Subject assignments |
| assignments | idx_asg_term | (term_id) | Term assignments |
| assessment_results | idx_ar_enrollment | (student_class_enrollment_id) | Student scores |
| assessment_results | idx_ar_assessment | (assessment_id) | Assessment scores |
| results | idx_res_enrollment | (student_class_enrollment_id) | Student results |
| results | idx_res_term_subject | (term_id, subject_id) | Term/subject results |
| report_cards | idx_rc_student | (student_class_enrollment_id) | Student report cards |
| academic_progressions | idx_ap_student | (student_person_id) | Student progression history |
| academic_policies | idx_ap_type_key | (tenant_id, institution_id, policy_type, policy_key) | Policy lookup |
| summer_school_registrations | idx_ssr_session | (summer_school_session_id) | Session registrations |

---

## 8. Phase 4 — Prisma Schema

**File:** `prisma/schema.prisma` within the academic management service.

### Enums

| Enum | Values |
|------|--------|
| AcademicYearStatus | DRAFT, ACTIVE, CLOSED |
| SessionStatus | DRAFT, ACTIVE, CLOSED |
| TermStatus | DRAFT, ACTIVE, CLOSED |
| SubjectStatus | DRAFT, ACTIVE, INACTIVE |
| DepartmentStatus | ACTIVE, INACTIVE |
| GradeLevelStatus | ACTIVE, INACTIVE |
| ClassStatus | DRAFT, ACTIVE, INACTIVE |
| TeachingRole | SUBJECT_TEACHER, CLASS_TEACHER, DEPARTMENT_HEAD |
| TimetableStatus | DRAFT, PUBLISHED, ARCHIVED |
| DayOfWeek | MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY |
| EnrollmentStatus | ENROLLED, ACTIVE, TRANSFERRED, WITHDRAWN |
| RegistrationStatus | REGISTERED, ACTIVE, DROPPED |
| AttendanceStatus | PRESENT, ABSENT, LATE, EXCUSED |
| AttendanceType | STUDENT, STAFF |
| AssignmentStatus | DRAFT, PUBLISHED, CLOSED |
| SubmissionStatus | SUBMITTED, GRADED, RETURNED |
| AssessmentType | CONTINUOUS_ASSESSMENT, TEST, EXAMINATION, PRACTICAL, ORAL |
| AssessmentStatus | DRAFT, PUBLISHED, GRADED |
| GradeScaleStatus | DRAFT, ACTIVE, INACTIVE |
| ResultStatus | COMPILED, APPROVED, PUBLISHED |
| ReportCardStatus | GENERATED, PUBLISHED |
| ProgressionType | PROMOTED, CONDITIONALLY_PROMOTED, RETAINED, GRADUATED, WITHDRAWN |
| PolicyStatus | DRAFT, ACTIVE, SUPERSEDED |
| SummerSchoolStatus | CONFIGURED, OPEN, REGISTRATION_CLOSED, IN_PROGRESS, COMPLETED |
| SSRegistrationStatus | REGISTERED, ACTIVE, COMPLETED |
| CostModel | PER_STUDENT, PER_SUBJECT, FREE |

### Models

35 models: AcademicYear, AcademicSession, Term, Subject, SubjectGroup, SubjectSubjectGroup, Department, Stream, GradeLevel, Class, Arm, Homeroom, TeachingAssignment, Timetable, TimetableSlot, StudentClassEnrollment, SubjectRegistration, Attendance, Assignment, AssignmentSubmission, Assessment, AssessmentResult, GradeScale, GradeBoundary, Remark, Result, ReportCard, AcademicProgression, AcademicPolicy, SummerSchoolSession, SummerSchoolRegistration, SummerSchoolResult, and 3 join/lookup tables.

**Schema Principles:**
- UUID `@default(uuid())` for all primary keys
- `@unique` constraints for business keys
- `@map` for snake_case column names
- Soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status via `status` enum (never a deletion marker)
- Optimistic locking via `version` (Int @default(1))
- Audit fields: created_at, created_by, updated_at, updated_by
- JSON columns for flexible data (attachments, criteria snapshots, policy values)
- Prisma enums mapped to database types
- Cascade deletes: child entities cascade from parent aggregate root
- Published Results, ReportCards, Attendance, and SummerSchoolResults: no soft delete (immutable records)
- Cross-domain references (Staff, Student) use uuid FK without DB constraint to People domain tables

**Validation:** 2-pass check — all validation checks PASS.

---

## 9. Phase 5 — Backend Implementation

### 9.1 Module Structure

| Module | Responsibility |
|--------|---------------|
| AcademicManagementModule | Root module, orchestrates sub-modules |
| AcademicCalendarModule | Year, Session, Term CRUD and lifecycle |
| CurriculumModule | Subject, SubjectGroup, Department, Stream CRUD |
| ClassStructureModule | GradeLevel, Class, Arm, Homeroom CRUD and capacity |
| TeachingAssignmentModule | Staff assignment to subjects and classes |
| TimetableModule | Timetable CRUD, slot management, clash detection, publishing |
| StudentPlacementModule | Enrollment, class placement, subject registration |
| AttendanceModule | Attendance marking, correction, reports |
| AssignmentModule | Assignment CRUD, submission, grading, feedback |
| AssessmentModule | Assessment CRUD, score entry |
| GradingModule | GradeScale, GradeBoundary, Remark CRUD |
| ResultModule | Result compilation, approval, publication, report card generation |
| AcademicProgressionModule | Promotion, retention, graduation, withdrawal, probation |
| SummerSchoolModule | Session management, registration, result compilation |
| AcademicPolicyModule | Policy CRUD, versioning, retrieval |

### 9.2 Repository Layer

| Repository | Entities | Key Operations |
|-----------|----------|----------------|
| AcademicCalendarRepository | AcademicYear, AcademicSession, Term | CRUD, findActiveYear, findActiveTerm, findTermsBySession |
| CurriculumRepository | Subject, SubjectGroup, Department, Stream | CRUD, findByDepartment, findByInstitution, findByCode |
| ClassStructureRepository | GradeLevel, Class, Arm, Homeroom | CRUD, findByGradeLevel, findByInstitution, countEnrolled |
| TeachingAssignmentRepository | TeachingAssignment | CRUD, findByStaff, findByClass, findByTerm, findOverlapping |
| TimetableRepository | Timetable, TimetableSlot | CRUD, findByClass, findByTerm, findByStaff, checkClashes |
| StudentPlacementRepository | StudentClassEnrollment, SubjectRegistration | CRUD, findByStudent, findByClass, findByTerm, findByEnrollment |
| AttendanceRepository | Attendance | CRUD, findByEnrollment, findByStaff, findByDate, findBySubject |
| AssignmentRepository | Assignment, AssignmentSubmission | CRUD, findByClass, findBySubject, findByStudent, findByTerm |
| AssessmentRepository | Assessment, AssessmentResult | CRUD, findBySubject, findByTerm, findByStudent, findByAssessment |
| GradingRepository | GradeScale, GradeBoundary, Remark | CRUD, findActiveScale, findBoundaries, findByInstitution |
| ResultRepository | Result, ReportCard | CRUD, findByEnrollment, findByTerm, findBySubject, compile, approve |
| AcademicProgressionRepository | AcademicProgression | CRUD, findByStudent, findByTerm, findPending |
| SummerSchoolRepository | SummerSchoolSession, SummerSchoolRegistration, SummerSchoolResult | CRUD, findByTerm, findEligible, findBySession |
| AcademicPolicyRepository | AcademicPolicy | CRUD, findActive, findByType, findVersioned, supersede |

All repositories receive `tenantId` and `institutionId` as first parameters.

### 9.3 Domain Services

| Service | Responsibility |
|---------|---------------|
| AcademicCalendarService | Year, Session, Term CRUD and lifecycle transitions; date overlap validation |
| CurriculumService | Subject, SubjectGroup, Department, Stream CRUD |
| ClassStructureService | GradeLevel, Class, Arm, Homeroom CRUD; capacity checks |
| TeachingAssignmentService | Staff assignment; workload management; overlap detection |
| TimetableService | Timetable CRUD; slot management; clash detection; publishing |
| StudentPlacementService | Enrollment; class placement; subject registration; prerequisite checks; elective validation |
| AttendanceService | Attendance marking; correction; percentage calculation; report generation |
| AssignmentService | Assignment CRUD; submission management; late submission handling; grading |
| AssessmentService | Assessment CRUD; score entry; weight validation; score aggregation |
| GradingService | GradeScale CRUD; boundary validation; grade lookup |
| ResultService | Result compilation from assessments; approval workflow; publication; report card generation; ranking |
| AcademicProgressionService | Policy evaluation; promotion, retention, graduation, withdrawal processing; probation management |
| SummerSchoolService | Session management; eligibility checks; registration; result compilation; grade capping |
| AcademicPolicyService | Policy CRUD; versioning; supersede workflow; default fallback |
| AcademicSearchService | Search across academic entities with tenant and institution isolation |

### 9.4 Controllers

| Controller | Route Prefix | Endpoints |
|-----------|-------------|-----------|
| AcademicCalendarController | /api/v1/academics/calendar | Year CRUD + Session CRUD + Term CRUD |
| CurriculumController | /api/v1/academics/curriculum | Subject CRUD + SubjectGroup + Department + Stream |
| ClassStructureController | /api/v1/academics/classes | GradeLevel CRUD + Class CRUD + Arm + Homeroom |
| TeachingAssignmentController | /api/v1/academics/teaching-assignments | CRUD + bulk assignment |
| TimetableController | /api/v1/academics/timetables | CRUD + slots + publish + clash detection |
| StudentPlacementController | /api/v1/academics/enrollments | Enrollment + SubjectRegistration + ElectiveSelection |
| AttendanceController | /api/v1/academics/attendance | Mark + Correct + Reports + Bulk |
| AssignmentController | /api/v1/academics/assignments | CRUD + Submissions + Grading |
| AssessmentController | /api/v1/academics/assessments | CRUD + ScoreEntry + BulkGrading |
| GradingController | /api/v1/academics/grading | GradeScale CRUD + Boundary + Remark |
| ResultController | /api/v1/academics/results | Compile + Approve + Publish + ReportCards + Rankings |
| AcademicProgressionController | /api/v1/academics/progression | Promote + Retain + Graduate + Withdraw + Probation |
| SummerSchoolController | /api/v1/academics/summer-school | Session CRUD + Registration + Results |
| AcademicPolicyController | /api/v1/academics/policies | CRUD + Version + Supersede |

### 9.5 Guards

| Guard | Purpose |
|-------|---------|
| JwtAuthGuard | Validate JWT and extract user |
| TenantGuard | Validate tenant context from JWT |
| InstitutionGuard | Validate user has access to requested Institution |
| AcademicAccessGuard | Validate user has access to requested academic entity |
| ModuleLicenseGuard | Check if Institution has Academic Management module enabled |
| AcademicAuthorityGuard | Validate user has authority for approval operations (result approval, progression) |

**Authorization flow:** JwtAuthGuard → TenantGuard → InstitutionGuard → AcademicAccessGuard → ModuleLicenseGuard → controller execution.
For approval operations: AcademicAuthorityGuard is added before controller execution.

### 9.6 Event Publishing & Consumers

- Events published via EventEmitter2 (in-process) after transaction commit
- Event naming: `{Entity}{PastTenseVerb}` (e.g., AcademicYearCreated)
- Every event carries a versioned envelope: `eventId`, `eventVersion`, `schemaVersion`, `occurredAt`, `correlationId`, `causationId`, `tenantId`, `actorId`
- **Idempotency:** `eventId` is the deduplication key; consumers check before processing

| Consumer | Events Handled | Action |
|----------|---------------|--------|
| AuditLogConsumer | All state-change events | Create audit log entry |
| PeopleConsumer | StudentClassEnrolled, StudentClassTransferred, StudentPromoted, StudentGraduated, StudentWithdrawn | Update People domain enrollment records |
| NotificationConsumer | AssignmentPublished, AssessmentPublished, ResultPublished, ReportCardPublished, StudentPromoted | Send notifications |
| FinanceConsumer | SummerSchoolRegistered | Create fee assignment |
| AttendanceConsumer | TermActivated, TermClosed | Initialize/finalize attendance records |
| ProgressionConsumer | ResultPublished | Trigger progression evaluation |
| SummerSchoolConsumer | TermClosed | Check Summer School eligibility |
| PolicyConsumer | AcademicPolicyUpdated | Invalidate cached policies |

### 9.7 Transaction Management

- All multi-entity operations wrapped in Prisma Interactive Transactions
- Optimistic concurrency: catch Prisma P2025 error for version conflicts; return 409 Conflict
- Event publishing deferred until transaction commit
- **Event idempotency tracking:** processed `eventId` values stored with TTL (minimum 72 hours)

### 9.8 Key Flows

**Academic Year Lifecycle:**
1. Admin creates Academic Year (DRAFT) with date range
2. Admin creates Sessions and Terms within the Year
3. Admin activates Year → Year status = ACTIVE
4. Admin activates first Session → Session status = ACTIVE
5. Admin activates first Term → Term status = ACTIVE
6. Throughout the term: attendance, assignments, assessments, grading
7. Admin closes Term → Term status = CLOSED
8. Result compilation triggered → Results compiled → Approved → Published
9. Academic progression triggered → Students promoted/retained/graduated
10. Next Term activated → cycle repeats
11. All Terms closed → Session closed → Next Session activated
12. All Sessions closed → Year closed

**Student Enrollment Flow:**
1. Student exists in People domain (StudentEnrolled event or manual)
2. Admin creates StudentClassEnrollment for student + class + term
3. Student registers for subjects (SubjectRegistration)
4. Prerequisites validated at registration time
5. Elective selection validated against stream availability
6. Class capacity checked on enrollment
7. StudentClassEnrolled event published
8. AttendanceModule initializes attendance tracking

**Result Compilation Flow:**
1. Assessments created and published throughout term
2. Teachers enter scores for each assessment
3. AssessmentGraded event published per assessment
4. ResultService aggregates scores: CA scores + Exam scores
5. Grade lookup: total_score → GradeBoundary → grade + remark
6. Result compiled (status = COMPILED)
7. Class teacher / head teacher reviews and approves → status = APPROVED
8. Results published → status = PUBLISHED
9. ReportCard generated from approved results
10. ReportCard published → students and parents notified

**Academic Progression Flow:**
1. After results are published, progression evaluation triggered
2. For each student: evaluate promotion criteria against AcademicPolicy
3. Criteria: average score ≥ pass mark, attendance ≥ threshold, no retention flag
4. Outcome: PROMOTED, CONDITIONALLY_PROMOTED, RETAINED, or WITHDRAWN
5. Graduation: if student completes final grade level criteria
6. AcademicProgression record created
7. StudentPromoted / StudentRetained / StudentGraduated event published
8. People domain notified via event consumption

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
| search | string | — | Text search (name, code) |
| sortBy | string | created_at | Sort field |
| sortOrder | string | desc | asc or desc |
| status | string | — | Filter by status |
| institutionId | uuid | — | Filter by Institution |
| academicYearId | uuid | — | Filter by Academic Year |
| termId | uuid | — | Filter by Term |

### 10.3 Endpoint Catalogue

#### Academic Years

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/calendar/years | List academic years | academics:calendar:read |
| GET | /api/v1/academics/calendar/years/:id | Get academic year | academics:calendar:read |
| POST | /api/v1/academics/calendar/years | Create academic year | academics:calendar:create |
| PUT | /api/v1/academics/calendar/years/:id | Update academic year | academics:calendar:update |
| POST | /api/v1/academics/calendar/years/:id/open | Open academic year | academics:calendar:manage |
| POST | /api/v1/academics/calendar/years/:id/close | Close academic year | academics:calendar:manage |

#### Academic Sessions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/calendar/years/:yearId/sessions | List sessions | academics:calendar:read |
| POST | /api/v1/academics/calendar/years/:yearId/sessions | Create session | academics:calendar:create |
| PUT | /api/v1/academics/calendar/years/:yearId/sessions/:id | Update session | academics:calendar:update |
| POST | /api/v1/academics/calendar/years/:yearId/sessions/:id/activate | Activate session | academics:calendar:manage |
| POST | /api/v1/academics/calendar/years/:yearId/sessions/:id/close | Close session | academics:calendar:manage |

#### Terms

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/calendar/sessions/:sessionId/terms | List terms | academics:calendar:read |
| POST | /api/v1/academics/calendar/sessions/:sessionId/terms | Create term | academics:calendar:create |
| PUT | /api/v1/academics/calendar/sessions/:sessionId/terms/:id | Update term | academics:calendar:update |
| POST | /api/v1/academics/calendar/sessions/:sessionId/terms/:id/activate | Activate term | academics:calendar:manage |
| POST | /api/v1/academics/calendar/sessions/:sessionId/terms/:id/close | Close term | academics:calendar:manage |

#### Subjects

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/curriculum/subjects | List subjects | academics:subject:read |
| GET | /api/v1/academics/curriculum/subjects/:id | Get subject | academics:subject:read |
| POST | /api/v1/academics/curriculum/subjects | Create subject | academics:subject:create |
| PUT | /api/v1/academics/curriculum/subjects/:id | Update subject | academics:subject:update |

#### Departments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/curriculum/departments | List departments | academics:department:read |
| GET | /api/v1/academics/curriculum/departments/:id | Get department | academics:department:read |
| POST | /api/v1/academics/curriculum/departments | Create department | academics:department:create |
| PUT | /api/v1/academics/curriculum/departments/:id | Update department | academics:department:update |

#### Grade Levels

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/classes/grade-levels | List grade levels | academics:grade_level:read |
| POST | /api/v1/academics/classes/grade-levels | Create grade level | academics:grade_level:create |
| PUT | /api/v1/academics/classes/grade-levels/:id | Update grade level | academics:grade_level:update |

#### Classes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/classes | List classes | academics:class:read |
| GET | /api/v1/academics/classes/:id | Get class | academics:class:read |
| POST | /api/v1/academics/classes | Create class | academics:class:create |
| PUT | /api/v1/academics/classes/:id | Update class | academics:class:update |
| GET | /api/v1/academics/classes/:id/students | List class students | academics:class:read |

#### Teaching Assignments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/teaching-assignments | List assignments | academics:teaching:read |
| POST | /api/v1/academics/teaching-assignments | Create assignment | academics:teaching:create |
| PUT | /api/v1/academics/teaching-assignments/:id | Update assignment | academics:teaching:update |
| DELETE | /api/v1/academics/teaching-assignments/:id | Revoke assignment | academics:teaching:delete |

#### Timetables

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/timetables | List timetables | academics:timetable:read |
| GET | /api/v1/academics/timetables/:id | Get timetable | academics:timetable:read |
| POST | /api/v1/academics/timetables | Create timetable | academics:timetable:create |
| PUT | /api/v1/academics/timetables/:id | Update timetable | academics:timetable:update |
| POST | /api/v1/academics/timetables/:id/publish | Publish timetable | academics:timetable:manage |
| POST | /api/v1/academics/timetables/:id/slots | Add slot | academics:timetable:update |
| PUT | /api/v1/academics/timetables/:id/slots/:slotId | Update slot | academics:timetable:update |
| DELETE | /api/v1/academics/timetables/:id/slots/:slotId | Remove slot | academics:timetable:update |
| GET | /api/v1/academics/timetables/teacher/:staffId | Teacher timetable | academics:timetable:read |

#### Enrollments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/enrollments | List enrollments | academics:enrollment:read |
| GET | /api/v1/academics/enrollments/:id | Get enrollment | academics:enrollment:read |
| POST | /api/v1/academics/enrollments | Create enrollment | academics:enrollment:create |
| DELETE | /api/v1/academics/enrollments/:id | Withdraw enrollment | academics:enrollment:delete |
| POST | /api/v1/academics/enrollments/:id/subjects | Register subjects | academics:enrollment:update |
| DELETE | /api/v1/academics/enrollments/:id/subjects/:subjectId | Drop subject | academics:enrollment:update |

#### Attendance

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/attendance | List attendance records | academics:attendance:read |
| POST | /api/v1/academics/attendance | Mark attendance | academics:attendance:create |
| PUT | /api/v1/academics/attendance/:id | Correct attendance | academics:attendance:update |
| POST | /api/v1/academics/attendance/bulk | Bulk mark attendance | academics:attendance:create |
| GET | /api/v1/academics/attendance/report | Attendance report | academics:attendance:read |

#### Assignments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/assignments | List assignments | academics:assignment:read |
| GET | /api/v1/academics/assignments/:id | Get assignment | academics:assignment:read |
| POST | /api/v1/academics/assignments | Create assignment | academics:assignment:create |
| PUT | /api/v1/academics/assignments/:id | Update assignment | academics:assignment:update |
| POST | /api/v1/academics/assignments/:id/publish | Publish assignment | academics:assignment:manage |
| GET | /api/v1/academics/assignments/:id/submissions | List submissions | academics:assignment:read |
| POST | /api/v1/academics/assignments/:id/submissions | Submit assignment | academics:assignment:submit |
| PUT | /api/v1/academics/assignments/:id/submissions/:submissionId/grade | Grade submission | academics:assignment:grade |

#### Assessments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/assessments | List assessments | academics:assessment:read |
| GET | /api/v1/academics/assessments/:id | Get assessment | academics:assessment:read |
| POST | /api/v1/academics/assessments | Create assessment | academics:assessment:create |
| PUT | /api/v1/academics/assessments/:id | Update assessment | academics:assessment:update |
| POST | /api/v1/academics/assessments/:id/publish | Publish assessment | academics:assessment:manage |
| POST | /api/v1/academics/assessments/:id/results | Enter score | academics:assessment:grade |
| POST | /api/v1/academics/assessments/:id/results/bulk | Bulk enter scores | academics:assessment:grade |

#### Grading

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/grading/scales | List grade scales | academics:grading:read |
| GET | /api/v1/academics/grading/scales/:id | Get grade scale | academics:grading:read |
| POST | /api/v1/academics/grading/scales | Create grade scale | academics:grading:create |
| PUT | /api/v1/academics/grading/scales/:id | Update grade scale | academics:grading:update |
| POST | /api/v1/academics/grading/scales/:id/boundaries | Add boundary | academics:grading:update |
| PUT | /api/v1/academics/grading/scales/:id/boundaries/:boundaryId | Update boundary | academics:grading:update |
| DELETE | /api/v1/academics/grading/scales/:id/boundaries/:boundaryId | Remove boundary | academics:grading:update |

#### Results

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/results | List results | academics:result:read |
| GET | /api/v1/academics/results/:id | Get result | academics:result:read |
| POST | /api/v1/academics/results/compile | Compile results | academics:result:compile |
| POST | /api/v1/academics/results/:id/approve | Approve result | academics:result:approve |
| POST | /api/v1/academics/results/publish | Publish results | academics:result:publish |
| GET | /api/v1/academics/results/report-cards | List report cards | academics:result:read |
| GET | /api/v1/academics/results/report-cards/:id | Get report card | academics:result:read |
| POST | /api/v1/academics/results/report-cards/generate | Generate report cards | academics:result:generate |
| POST | /api/v1/academics/results/report-cards/:id/publish | Publish report card | academics:result:publish |
| GET | /api/v1/academics/results/rankings | Class rankings | academics:result:read |

#### Academic Progression

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/progression | List progression records | academics:progression:read |
| GET | /api/v1/academics/progression/pending | List pending progression | academics:progression:read |
| POST | /api/v1/academics/progression/evaluate | Evaluate progression | academics:progression:evaluate |
| POST | /api/v1/academics/progression/:id/approve | Approve progression | academics:progression:approve |
| POST | /api/v1/academics/progression/promote | Batch promote | academics:progression:manage |
| POST | /api/v1/academics/progression/retain | Batch retain | academics:progression:manage |
| GET | /api/v1/academics/progression/probation | List probation students | academics:progression:read |

#### Summer School

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/summer-school/sessions | List sessions | academics:summer_school:read |
| GET | /api/v1/academics/summer-school/sessions/:id | Get session | academics:summer_school:read |
| POST | /api/v1/academics/summer-school/sessions | Create session | academics:summer_school:create |
| PUT | /api/v1/academics/summer-school/sessions/:id | Update session | academics:summer_school:update |
| POST | /api/v1/academics/summer-school/sessions/:id/open | Open registration | academics:summer_school:manage |
| GET | /api/v1/academics/summer-school/sessions/:id/registrations | List registrations | academics:summer_school:read |
| POST | /api/v1/academics/summer-school/sessions/:id/register | Register student | academics:summer_school:register |
| POST | /api/v1/academics/summer-school/sessions/:id/results/compile | Compile results | academics:summer_school:compile |
| POST | /api/v1/academics/summer-school/sessions/:id/results/publish | Publish results | academics:summer_school:publish |

#### Academic Policies

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/academics/policies | List policies | academics:policy:read |
| GET | /api/v1/academics/policies/:id | Get policy | academics:policy:read |
| POST | /api/v1/academics/policies | Create policy | academics:policy:create |
| PUT | /api/v1/academics/policies/:id | Update policy (new version) | academics:policy:update |
| GET | /api/v1/academics/policies/history | Policy version history | academics:policy:read |

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
| Academic Calendar (CAL) | 20 | Year/Session/Term CRUD, lifecycle transitions, date overlap validation |
| Curriculum (CUR) | 15 | Subject, Department, Stream CRUD; subject-group membership |
| Class Structure (CLS) | 15 | GradeLevel, Class, Arm, Homeroom CRUD; capacity checks |
| Teaching Assignment (TCH) | 12 | CRUD, overlap detection, workload validation |
| Timetable (TBL) | 15 | CRUD, slot management, clash detection, publishing |
| Student Enrollment (ENR) | 18 | Enrollment, subject registration, prerequisites, electives, capacity |
| Attendance (ATT) | 15 | Mark, correct, bulk, percentage calculation, date validation |
| Assignments (ASG) | 15 | CRUD, publish, submission, late submission, grading, feedback |
| Assessments (ASM) | 15 | CRUD, publish, score entry, weight validation, bulk grading |
| Grading (GRD) | 10 | GradeScale CRUD, boundary validation, grade lookup, overlap detection |
| Results (RES) | 18 | Compile, approve, publish, report card generation, ranking, immutability |
| Academic Progression (PRG) | 15 | Promote, retain, graduate, withdraw, probation, policy evaluation |
| Summer School (SS) | 12 | Session CRUD, registration, eligibility, result compilation, grade capping |
| Academic Policies (POL) | 8 | CRUD, versioning, supersede, default fallback |
| Tenant Isolation (TENANT) | 12 | Cross-tenant access prevention, institution scoping |
| Authorization (AUTHZ) | 10 | Academic access guard, authority guard, module license guard |
| Edge Cases (EDGE) | 10 | Concurrent updates, race conditions, invalid state transitions |
| Performance (PERF) | 8 | List queries <200ms, timetable generation <500ms, result compilation <2s |
| **Total** | **~240+** | |

### 11.3 Tenant Isolation Verification

| Test | Description | Expected |
|------|-------------|----------|
| TI-001 | Institution A queries Institution B's data (same tenant) | 404 or empty |
| TI-002 | User accesses academic entity in unassigned Institution | 403 |
| TI-003 | Cross-tenant year/term access | 404 or empty |
| TI-004 | Cross-tenant enrollment data | Isolated per tenant |
| TI-005 | Cross-tenant result data | Isolated per tenant |
| TI-006 | Cross-tenant timetable data | Isolated per tenant |
| TI-007 | Cross-tenant attendance data | Isolated per tenant |
| TI-008 | Cross-tenant policy data | Isolated per tenant |

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
- [ ] Result immutability verified
- [ ] Clash detection accuracy verified
- [ ] Academic progression policy evaluation verified

---

## 12. Academic Progression Policy Engine

Academic progression is the most policy-sensitive operation in the domain. This section defines the configurable engine that evaluates student progression after each term.

### 12.1 Progression Criteria

| Criterion | Configurable | Default | Description |
|-----------|-------------|---------|-------------|
| Minimum average score | Yes | 50% | Student must achieve at least this average across all subjects |
| Minimum subject score | Yes | 40% | Student must pass each core subject individually |
| Attendance threshold | Yes | 75% | Student must attend at least this percentage of school days |
| Max failed subjects | Yes | 2 | Student may fail up to this many subjects and still be promoted |
| Core subject requirement | Yes | All core subjects passed | Core subjects (Math, English, etc.) must be passed |
| Conditional promotion limit | Yes | 1 | Max times a student can be conditionally promoted consecutively |

### 12.2 Progression Outcomes

| Outcome | Criteria |
|---------|----------|
| PROMOTED | All criteria fully met |
| CONDITIONALLY_PROMOTED | Most criteria met but within conditional tolerance (e.g., 1 failed non-core subject) |
| RETAINED | Criteria not met and no conditional tolerance remaining |
| GRADUATED | Final grade level completed with all graduation requirements met |
| WITHDRAWN | Student withdrawn by parent/admin or exceeded probation period |

### 12.3 Policy Evaluation Flow

1. All results for the term must be published
2. For each enrolled student, retrieve all results for the term
3. Calculate average score across all subjects
4. Check individual subject scores against minimum thresholds
5. Retrieve attendance percentage for the term
6. Evaluate each criterion against configured thresholds
7. Determine outcome based on worst-case criterion
8. Create AcademicProgression record with criteria snapshot
9. Publish progression event

---

## 13. Summer School Extension

Summer School is an optional institutional extension that allows students to rewrite specific subjects to improve their grades.

### 13.1 Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| Enabled | Whether Summer School is available | false |
| Cost model | PER_STUDENT, PER_SUBJECT, or FREE | PER_SUBJECT |
| Max attainable grade | Highest grade achievable (e.g., "C") | C |
| Eligible grades | Minimum grade to qualify for rewrite | Students with D or below |
| Registration period | Start and end dates for registration | Configurable |
| Exam schedule | Summer School examination dates | Configurable |
| Promotion after Summer School | Whether improved grades affect progression | true |

### 13.2 Summer School Flow

1. Institution configures Summer School session for a term
2. Registration opens; eligible students register
3. Payment processed (if applicable) via Finance domain
4. Summer School instruction period
5. Summer School examinations conducted
6. Results compiled: original_grade + new_score + new_grade
7. new_grade capped at session max_grade (e.g., even if student scores A, max grade is C)
8. Results published; events sent to People domain
9. If promotion-after-SS enabled: progression re-evaluated with Summer School results
10. AcademicProgression updated if outcome changes

### 13.3 Integration Rules

- Summer School results do NOT replace original term results
- Original results remain as-is; Summer School results are supplementary
- Report Cards may optionally display Summer School results as a separate section
- Academic progression evaluates both original and Summer School results when SS-after-promotion is enabled
- Students with existing Summer School registrations cannot re-register for the same subject in the same session

---

## 14. Academic Policies Configuration

Academic policies are versioned records that govern platform behavior at the Institution level.

### 14.1 Policy Categories

| Category | Examples |
|----------|---------|
| PROMOTION | pass_mark, attendance_threshold, max_failed_subjects, conditional_promotion_limit |
| GRADING | grade_scale, ca_weight, exam_weight, pass_mark |
| ATTENDANCE | attendance_threshold, allow_excused_absence, max_consecutive_absences |
| GRADUATION | graduation_requirements, minimum_credits, conduct_requirement |
| RANKING | ranking_method (by_average, by_total), tie_breaking_rule |
| SUMMER_SCHOOL | enabled, max_grade, eligible_grades, cost_model |
| ENROLLMENT | max_subjects_per_term, max_students_per_class, allow_late_enrollment |
| ASSESSMENT | max_assessments_per_subject, late_submission_penalty, late_submission_max_days |

### 14.2 Policy Versioning

- Each policy update creates a new version (incrementing `version` field)
- The previous version is marked as SUPERSEDED with an `effective_to` date
- Only one version per policy_type + policy_key can be ACTIVE at a time
- Policy evaluation always uses the currently ACTIVE version
- Historical versions are preserved for audit and retrospective evaluation

### 14.3 Default Fallback

- If no institution-specific policy exists for a given policy_type + policy_key, the platform default is used
- Platform defaults are documented in §6.5 (Configurable Policies)
- Institutions can override any platform default by creating an ACTIVE policy record

---

## 15. Outstanding Items

| Priority | Item | Status |
|----------|------|--------|
| High | Bulk enrollment (CSV/Excel import) | Future |
| High | Timetable auto-generation algorithm | Future |
| High | Report card PDF generation | Implementation |
| High | Result compilation performance optimization | Implementation |
| Medium | Student ranking visualization | Future |
| Medium | Attendance analytics dashboard | Future |
| Medium | Teacher workload balance report | Future |
| Medium | Grade distribution analytics | Future |
| Medium | Academic calendar template system | Future |
| Low | Parent portal result viewing | Future |
| Low | Student self-service subject selection | Future |
| Low | Assignment plagiarism detection integration | Future |
| Low | Custom report card template designer | Future |
| Planned | Rate limiting middleware | Implementation |
| Planned | Security headers middleware | Implementation |

---

## 16. Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-17 | Initial creation — All 7 phases complete |
| 1.1.0 | 2026-07-17 | Architecture Review — Correct Phase 6 endpoint count (85+ → 110+) |
| 1.2.0 | 2026-07-20 | Final Refinement — Terminology standardization (Aggregate Root), event naming consistency (ConditionalPromotion → StudentConditionallyPromoted, AcademicYearOpened → AcademicYearActivated), lifecycle notation clarification, enum example correction, cross-domain reference clarification, test count correction, Out of Scope deduplication |

---

*This document is the permanent engineering specification for the Academic Management domain. It is approved and frozen for implementation. All architectural decisions, business rules, validation constraints, and verification criteria are captured here. Refer to source code for implementation details.*
