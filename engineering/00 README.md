# OpenSchool ERP — Engineering Specifications

## Overview

This directory contains the complete engineering specifications for the OpenSchool ERP platform. Each document covers all 7 engineering phases (Domain Analysis through Testing & Verification) for its respective domain.

## Documents

| Document | Scope | ADRs | Status |
|----------|-------|------|--------|
| [Identity & Access Engineering.md](Identity%20%26%20Access%20Engineering.md) | Authentication, authorization, users, roles, permissions, multi-tenancy | 30 | Approved & Frozen |
| [Institution Management Engineering.md](Institution%20Management%20Engineering.md) | Institutions, departments, academic structure, configuration, branding | 30 | Approved & Frozen |
| [People Engineering.md](People%20Engineering.md) | Students, staff, parents, guardians, applicants, person merge | 44 | Approved & Frozen |
| [Academic Management Engineering.md](Academic%20Management%20Engineering.md) | Sessions, terms, classes, subjects, enrollment, grading, report cards, timetable, attendance, admissions | 35 | Approved & Frozen |
| [Finance Engineering.md](Finance%20Engineering.md) | Fee structures, billing, invoicing, payments, refunds, scholarships, accounting | 35 | Approved & Frozen |
| [Communication Engineering.md](Communication%20Engineering.md) | Notifications, messaging, templates, delivery, preferences, surveys, announcements | 35 | Approved & Frozen |
| [Operations Engineering.md](Operations%20Engineering.md) | Library, hostel, transport, clinic, visitor management, assets, inventory, lost & found | 35 | Approved & Frozen |
| [Documents & Learning Engineering.md](Documents%20%26%20Learning%20Engineering.md) | Document management, templates, learning resources, CBT content, storage abstraction | 35 | Approved & Frozen |
| [Reporting & Analytics Engineering.md](Reporting%20%26%20Analytics%20Engineering.md) | Cross-domain analytics, dashboards, reports, data export | 35 | Approved & Frozen |
| [Platform Administration Engineering.md](Platform%20Administration%20Engineering.md) | Tenant lifecycle, subscriptions, licensing, feature flags, integrations, monitoring, audit | 35 | Approved & Frozen |

**Supporting files:**
- `ROADMAP.md` — Version 1 engineering roadmap with status tracking
- `identity-access.prisma` — Prisma schema for the Identity & Access domain

## Cross-Domain Dependencies

```
Identity & Access ← (all domains)
Institution Management ← (all domains, for tenant scoping)
People ← Academic Management, Finance, Communication
Academic Management ← Finance, Operations
Finance ← (standalone, publishes events for others)
Communication ← (consumed by all, owns no entity data)
Operations ← Academic Management, Documents & Learning
Documents & Learning ← Operations
Reporting & Analytics ← (reads from all domains)
Platform Administration ← (manages the platform itself)
```

## Conventions

- All specifications follow 7-phase engineering: Domain Analysis → Domain Design → Database Design → Prisma Schema → Backend Implementation → API Design → Testing & Verification
- Architecture Decision Records (ADRs) are numbered sequentially within each domain
- Approved & Frozen specs have completed all phases and are locked
- All 10 V1 domains are now approved and frozen for implementation
