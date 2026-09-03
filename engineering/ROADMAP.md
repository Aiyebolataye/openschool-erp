# OpenSchool ERP — Engineering Roadmap

## Phase Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Approved — Frozen |
| 📝 | Phase Complete — Under Review |
| ⏳ | In Progress |
| ⬜ | Pending |

## Engineering Domains — Version 1

### Completed

| Domain | P1 | P2 | P3 | P4 | P5 | P6 | P7 | Status |
|---|---|---|---|---|---|---|---|---|
| Identity & Access | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |
| Institution Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |
| People | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |
| Academic Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |
| Finance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |
| Communication | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |
| Operations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |
| Documents & Learning | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |
| Reporting & Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |
| Platform Administration | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Approved & Frozen |

### Remaining

_No remaining V1 domains. All 10 domains are complete._

### Domain Notes

| Domain | Scope | Notes |
|--------|-------|-------|
| Academic Management | Includes Admissions | Admissions is not an independent specification; it is part of Academic Management |
| Operations | Library, Hostel, Transport, School Clinic / Health, Visitor Management, Asset Management, Inventory Management, Lost & Found | Single consolidated engineering specification |
| Documents & Learning | Document management, templates, learning resources, CBT content, storage abstraction | 13 bounded contexts |
| Reporting & Analytics | Cross-domain analytics, dashboards, reports | Renamed from Reporting |
| Platform Administration | Tenant lifecycle, subscriptions, licensing, feature flags, branding, integrations, API keys, webhooks, monitoring, automation, audit, security, policies | Renamed from Platform Services — 15 bounded contexts, 62 tables, 55 Prisma models, ~137 API endpoints |

---

## Future Engineering Specifications

### Version 2 — Smart Campus Engineering

| Domain | Status |
|--------|--------|
| Smart Campus Engineering | Future — Not yet scoped |

### Version 3 — AI & Intelligence Engineering

| Domain | Status |
|--------|--------|
| AI & Intelligence Engineering | Future — Not yet scoped |

### Version 4 — Enterprise Engineering

| Domain | Status |
|--------|--------|
| Enterprise Engineering | Future — Not yet scoped |

---

## Phase Definitions

| Phase | Name | Description |
|-------|------|-------------|
| P1 | Domain Analysis | Responsibilities, boundaries, dependencies, entities, events, business rules |
| P2 | Domain Design | Entity relationships, aggregates, domain events, Mermaid ER diagrams |
| P3 | Database Design | PostgreSQL schema, indexes, constraints, foreign keys |
| P4 | Prisma | Prisma models, relationships, enums, constraints |
| P5 | NestJS Module | Module, controllers, services, repositories, DTOs, guards, events |
| P6 | API Design | REST endpoints, request/response models, pagination, filtering |
| P7 | Testing | Unit tests, integration tests, validation tests |

---

## Engineering Document Index

| Domain | Document | Size | ADRs | Status |
|--------|----------|------|------|--------|
| Identity & Access | `Identity & Access Engineering.md` | ~919 lines | 30 | Approved & Frozen |
| Institution Management | `Institution Management Engineering.md` | ~1,112 lines | 30 | Approved & Frozen |
| People | `People Engineering.md` | ~1,433 lines | 44 | Approved & Frozen |
| Academic Management | `Academic Management Engineering.md` | ~1,600 lines | 35 | Under Review |
| Finance | `Finance Engineering.md` | ~1,495 lines | 35 | Under Review |
| Communication | `Communication Engineering.md` | ~2,531 lines | 35 | Under Review |
| Operations | `Operations Engineering.md` | ~2,279 lines | 35 | Under Review |
| Documents & Learning | `Documents & Learning Engineering.md` | ~1,693 lines | 35 | Under Review |
| Reporting & Analytics | `Reporting & Analytics Engineering.md` | ~1,616 lines | 35 | Under Review |
| Platform Administration | `Platform Administration Engineering.md` | ~3,159 lines | 35 | Under Review |

---

## Session Log

| Date | Domain | Phase | Action | Status |
|------|--------|-------|--------|--------|
| 2026-07-14 | Identity & Access | P1 | Domain Analysis approved | Approved & Frozen |
| 2026-07-14 | Identity & Access | P2 | Domain Design refined (10 architecture improvements) | Approved & Frozen |
| 2026-07-14 | Identity & Access | P3 | Database Design complete (19 tables, 15 sections) | Approved & Frozen |
| 2026-07-15 | Identity & Access | P4 | Prisma Schema complete (19 models, 12 enums, ~144 columns, 43 indexes) | Approved & Frozen |
| 2026-07-15 | Identity & Access | — | Consolidated engineering document created (Phases 1–4 archived) | Approved & Frozen |
| 2026-07-15 | Identity & Access | P5 | Backend Implementation complete (18 sections, pending approval) | Approved & Frozen |
| 2026-07-15 | Identity & Access | P6 | API Design complete (13 sections, pending approval) | Approved & Frozen |
| 2026-07-15 | Identity & Access | P7 | Testing & Verification complete (14 sections, pending approval) | Approved & Frozen |
| 2026-07-16 | Identity & Access | — | Final optimization complete (919 lines, document frozen) | Approved & Frozen |
| 2026-07-16 | Institution Management | P1 | Domain Analysis complete (pending approval) | Approved & Frozen |
| 2026-07-16 | Institution Management | P2–P7 | All phases complete — consolidated engineering document created | Approved & Frozen |
| 2026-07-17 | People | P1–P7 | All phases complete — consolidated engineering document created | Approved & Frozen |
| 2026-07-17 | People | — | Refinement #1 complete (Person as root aggregate, cardinality, merge, ADRs) | Approved & Frozen |
| 2026-07-17 | People | — | Refinement #2 complete (Public IDs, event versioning, idempotency, ADRs 040–044) | Approved & Frozen |
| 2026-07-17 | Academic Management | P1–P7 | All phases complete — consolidated engineering document created (1,940 lines) | Approved & Frozen |
| 2026-07-17 | Finance | P1–P7 | All phases complete — consolidated engineering document created (1,807 lines) | Approved & Frozen |
| 2026-07-17 | Communication | P1–P7 | All phases complete — consolidated engineering document created (2,960 lines) | Approved & Frozen |
| 2026-07-17 | Operations | P1–P7 | All phases complete — consolidated engineering document created (2,631 lines) | Approved & Frozen |
| 2026-07-17 | Documents & Learning | P1–P7 | All phases complete — consolidated engineering document created (2,010 lines) | Approved & Frozen |
| 2026-07-17 | Reporting & Analytics | P1–P7 | All phases complete — consolidated engineering document created (~2,200 lines) | Approved & Frozen |
| 2026-07-17 | Platform Administration | P1–P7 | All phases complete — consolidated engineering document created (~3,159 lines) | Approved & Frozen |
| 2026-07-17 | — | — | Engineering folder reorganization — flattened directory, consolidated README, updated paths | — |
| 2026-07-17 | — | — | Engineering Roadmap restructured (Version 1 consolidated, future roadmap added) | — |
| 2026-07-20 | All 7 domains | — | Final refinement pass — terminology, lifecycle, events, API, metadata, encoding consistency | Approved & Frozen |
| 2026-07-20 | All 7 domains | — | All 10 V1 domains approved and frozen for implementation | Approved & Frozen |
