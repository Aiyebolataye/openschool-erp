# PHASE_2_SCOPE_VERIFICATION_REPORT

**Mode:** READ-ONLY. No source changes. No schema/migration/config change. No tests. No deps. No commits. No PR. No Phase-2 implementation begun.
**Basis (re-derived from committed tree + frozen docs, not from prior summaries):**
- `MASTER_SMS_ROADMAP.md` Phase 2 (lines 374–440): P2.1–P2.5 + Phase 2 gate ("NB no domain phase proceeds until tenant isolation and authorization tests pass").
- Frozen `engineering/Identity & Access Engineering.md`: authorization model, permission catalogue, RBAC, ADR-019 (role hierarchy/inheritance), ADR-003 (tenant isolation), delegation §6/configurable policies P-xx, validation rules, hierarchy invariants I-25.
- Frozen `engineering/Platform Administration Engineering.md`: platform-level authority, exactly-one platform admin, tenant lifecycle, platform-only actions.
- Frozen `engineering/Institution Management Engineering.md`: org-scoped vs institution-scoped authority, built-in roles (I-10), tenant isolation, admin hierarchy.
- Frozen `engineering/People Engineering.md` + `Institution Management Engineering.md` §§83/86–86 (tenancy, inet vs varchar), used only for lifecycle/ownership references.
- Released tree: commit `878c300` (`878c3000466bf09d11df968e3ab734b08bd1ba3e`, `phase/0-foundation` → `main` PR #1 open/clean); Phase 1 security gate PASS (B6).

---

## A. Exact Phase 2 objective

> **Build and prove the security boundary that all domain APIs will use.**

More precisely (roadmap lines 374–440): Phase 2 = **RBAC, authorization & multi-tenant isolation**. Its gate-mandated proof:

> No domain phase proceeds until tenant isolation and authorization tests pass.

Phase 2 is the **authorization/tenant-isolation gate** that every later domain (Academic, Finance, People, Institution, Ops, Documents, Communication, Reporting) depends on. It is NOT a domain-design phase and NOT a frontend phase. It delivers: (P2.1) authoritative role/permission matrix extracted from the frozen spec + seeded; (P2.2) permission enforcement wired server-side and unbypassable; (P2.3) tenant/institution isolation with no client-trusted tenant IDs; (P2.4) object-level authorization preventing IDOR/BOLA/IDOB; (P2.5) security tests proving isolation + horizontal/vertical escalation.

---

## B. Every Phase 2 task/batch defined by the roadmap

| Graph-task (roadmap) | Requirement (verbatim distilled) | Phase-2 owner |
|---|---|---|
| P2.1 | Extract authoritative permission model from frozen spec; compare vs Prisma; seed permissions + role-permission relationships; define platform-level vs institution-level permissions; define role-specific restrictions; document resulting matrix. Do not invent permissions where the spec defines them. | §C.1/F |
| P2.2 | Wire permission enforcement to applicable routes; ensure server-side enforcement cannot be bypassed by alternate routes; test allowed/denied; test horizontal + vertical privilege escalation. | §F.2, F.3 |
| P2.3 | Tenant isolation: define authoritative tenant/institution resolution from authenticated context + approved platform operations (never arbitrary tenant IDs from clients); tenant-scoped service/repository patterns; apply consistently to DB access; review existing auth queries; define platform-admin exceptions explicitly. | §J |
| P2.4 | Object-level authorization: verify ownership/tenant membership, role permission, resource relationship; prevent IDOR/BOLA; test guessed IDs from another tenant+role. | §F.4 |
| P2.5 | Security tests: A-cannot-B read/update/delete; institution users can't platform-only; users can't escalate roles; users can't modify own protected auth fields; unauthorized resources safe errors; direct API calls can't bypass UI restrictions. | §N |

**Batch breakdown (proposal, not a roadmap change):** RBAC-1 permission model extraction+seed, RBAC-2 role CRUD+CRUD custom roles, RBAC-3 PermissionGuard wiring + service-layer authz, RBAC-4 tenant isolation + scoping review, RBAC-5 security tests + Phase-2 gate. No roadmap-adjacent "B6" equivalent; roadmap Phase 2 ends at its own gate (line 436).

---

## C. Exact frozen specification sections governing each task

All authority = frozen `Identity & Access Engineering.md` unless noted; roadmap P2.x references preserve the spec.

| Task | Frozen spec sections (authoritative) |
|---|---|
| P2.1 | §3 ADR table (ADR-019 role hierarchy/inheritance), §5.4 authorization hierarchy, §6 configurable policies P-xx, §7 role/permission catalogues + tables (`roles`, `permissions`, `permission_groups`, `role_permissions`, `user_role_assignments`, `role_permission_assignments`, `permission_group_permissions`, `user_permission_groups`, `delegations`), validation V-R/V-P/V-PG, permissions list "Do not invent permissions" |
| P2.2 | §8 authorization flow (JwtAuthGuard → RolesGuard/PermissionsGuard resolve effective permissions → compare → 403), §9.6 PermissionGuard, ADR-003 (server-side enforcement) |
| P2.3 | §2 Multi-Tenant Isolation by Default, §5.4/5.5 tenant-scoped hierarchy, ADR-003 (tenant isolation at application level, no RLS) |
| P2.4 | §5.4 authorization hierarchy; I-11/I-12 role deletion; §6.3 delegation; object ownership invariants |
| P2.5 | Roadmap P2.5 + Phase 2 gate; identity invocation-only tests; Institution Management §10 tenant isolation verification; ADR-003/016 |

---

## D. Existing Phase 1 capabilities Phase 2 must build on (released 878c300)

| Phase-1 capability (evidence) | Phase-2 dependency |
|---|---|
| JwtAuthGuard + authenticated tenant context | Authoritative tenant resolution base (P2.3) |
| `Permission`/`Role`/`RolePermission`/`UserRoleAssignment`/`PermissionGroup` Prisma models + global guard scaffolding | P2.1 seed + P2.2 wiring — no re-invention |
| D-07 envelope + correlation + error filter (B1/B5) | Reused for all Phase-2 authz responses (403/404 envelopes) |
| Tenant-scoped `users`/`sessions`/`invitations`/`audit_logs` | P2.3 scoping already partially proven |
| Login-protection + lockout + audit (B3/B5) | P2.5 security test foundation |
| Envelope-security e2e + 101/101 test gate | Extends to P2.2/P2.4/P2.5 authz suites |

---

## E. What was explicitly deferred from Phase 1 into Phase 2

(From B1 scope decision D-G6, roadmap §4, B1_RECONCILIATION.md, frozen roadmap DEFER list — authoritative.)

- **Custom roles / RBAC role CRUD** — deferred from Phase 1 (no Phase-1 batch owns role CRUD). Phase-2 owner: PRIMARY_INSTITUTION_ADMIN.
- **Full permission-matrix extraction + seed + enforcement** — Phase 2 P2.1/P2.2 (Phase 1 only had auth server-side, not permission matrix).
- **Object-level authorization / IDOR-BOLA suite** — Phase 2 P2.4.
- **Tenant-scoped uniqueness `(tenant_id, name)` for roles/permissions** — Phase 2 schema work (global `@@unique([name])` is known deviation; D-G6 reconciliation row note).
- **Custom-role delegation + inheritance semantics** — Phase 2 (ADR-019; identity spec §6.3).
- **Platform-admin exceptions list + platform-only endpoint gate** — Phase 2 P2.3.

---

## F. RBAC architecture (per frozen spec — authoritative)

### F.1 Built-in roles

Frozen Identity spec catalogue + ADR-019 + B1 D-G6. Build/seed at minimum:
- Platform: **PLATFORM_ADMIN** (exactly-one platform super-admin; platform-scoped only — cannot be created via app-flow; D-G5).
- Organization: **ORG_ADMIN** (org-scoped authority; manages org-level users/membership across institutions).
- Institution: **PRIMARY_INSTITUTION_ADMIN** (primary institution admin, full authority within institution; manages custom roles), **INSTITUTION_ADMIN** (additional institution admin), and any other built-ins in the frozen role table (STAFF/STUDENT/etc. per People/People engineering as defined by frozen catalogue).
- System roles immutable (`is_system_role`), not deletable (I-11/I-12).

### F.2 Custom roles

- Created/owned by **PRIMARY_INSTITUTION_ADMIN** per frozen RBAC rollout (roadmap P2.1/§31 custom role rules). Custom roles scoped to institution; global platform roles cannot be created via app flow.
- Custom-role CRUD: list/create/read/update/delete/restore (append audit; server-side permission gating `identity:role:*`).

### F.3 Permission model

- `Permission` immutable, unique `(tenant_id, resource, action)`; bound via `role_permission_assignments`; users bound via `user_role_assignments`.
- Effective permissions = direct + role-inherited (ADR-019 hierarchy) + delegation (ADR-003 §6.3) — enforced server-side; never client-supplied (P2.2).

### F.4 Authorization hierarchy (frozen §5.4)

1. API key/PermissionGroup → Permissions
2. User → Roles (with hierarchy inheritance) 
3. Effective = direct ∪ role-inherited ∪ delegation ∪ permission-group membership
4. Backend is final authority; no client-side trust; no bypass via alternate routes (P2.2/P2.4).

### F.5 Role naming & scope

- Roles tenant-scoped; custom roles institution-scoped where applicable; name uniqueness per tenant `(tenant_id, name)` (spec) — global `@@unique([name])` must be migration-corrected in Phase 2 (§L).

---

## G. Organization administration

Per frozen `Institution Management Engineering.md` (§11/ADR) + Roadmap P2.3/G-*:

- **Organization provisioning:** tenant + org + institution with default primary admin (provision-to-activate flow; platform-only).
- **Institution creation/lifecycle:** org-level institution CRUD, status transitions (inception → provisioning → active → suspended → archived), config categories, branding, module enablement.
- **Organization-level users / membership:** org-level user management, org-scoped roles, cross-institution staff within an org (org admins may span institutions).
- **Transferring users/institutions:** platform-only; conveys membership; preserves tenant-scoped audit.
- **Org-level data sharing:** non-default; configurable; strict tenant boundaries; audit on change.

---

## H. Institution administration

- **Institution Administrator (primary):** full authority within institution — user provisioning, module enablement, config, custom-role CRUD; cannot cross into other institutions/org/platform.
- **Additional institution admins:** delegated by primary; institution-scoped; cannot manage custom roles or platform permissions.
- **Staff/role management:** institution-scoped staff + role assignment (server-side); permission restrictions enforced server-side (never UI-only).
- **Institutional boundaries:** every query tenant/institution-scoped; cross-institution access blocked (IDOR/BOLA).

---

## I. User/membership lifecycle implications

- User lifecycle (B1: invite→active→locked→soft-deleted→restored/permanent-delete) + memberships (`institution_memberships`, `user_role_assignments`).
- Role assignment impacts deactivation cascade; role deletion restricted (I-11/I-12); role reassignment during active membership requires service-layer cascade checks.
- Delegations time-bounded (≤365d), revocable, audited.

---

## J. Tenant/isolation implications

- **Tenant identity derives ONLY from authenticated context (JWT) + approved platform operations — never from client-supplied tenant IDs (P2.3).**
- App-level tenant isolation (ADR-003), no RLS.
- Every query tenant-scoped; cross-tenant = security violation; platform-admin exceptions explicit (P2.3).
- Reuse Phase-1 audit/session/envelope tenant scoping; extend to all authz reads.

---

## K. API / endpoints required

Per frozen Identity spec endpoint catalogue (identity/roles/permissions/user-role/delegations) + roadmap P2.1:

| Method | Endpoint | Auth permission |
|---|---|---|
| GET | /api/v1/roles, /roles/:id | identity:role:list/read |
| POST/PUT/DELETE | /roles, /roles/:id, /roles/:id | identity:role:create/update/delete |
| GET/POST/DELETE | /roles/:roleId/permissions | identity:role:assign |
| GET | /permissions, /permissions/:id | identity:permission:list/read |
| GET/POST/DELETE | /users/:userId/roles | identity:user:assign |
| GET/POST/DELETE | /users/:userId/permission-groups | identity:user:assign |
| GET/POST/DELETE | /delegations | identity:delegation:list/create/cancel |

All require JWT + PermissionGuard; tenant-scoped in queries.

---

## L. Database/schema/migration changes required

- Resolve global `@@unique([name])` on roles/permissions → tenant-scoped `(tenant_id, name)` / `(tenant_id, resource, action)` (spec §7.3; deviation flagged §5.2). New migration.
- Seed permission + role-permission relationships + built-in roles (system roles) per frozen catalogue.
- As-needed delegation/permission-group table additions if not already present in schema.
- No schema change without prior review (frozen roadmap §5 rules).

---

## M. Security invariants and abuse cases

- Privilege escalation (horizontal + vertical) blocked — tested.
- Cross-tenant read/update/delete blocked (School A ∕ School B).
- Institution users cannot platform-only actions.
- Users cannot escalate roles / self-assign privileged roles.
- Users cannot modify own protected auth fields.
- Unauthorized resources return safe errors.
- Direct API calls cannot bypass UI restrictions.
- IDOR/BOLA on guessed IDs from another tenant/role.

---

## N. Required unit/E2E/security tests

Reusable security tests required by roadmap P2.5 + Phase-2 gate:
- [ ] School A cannot read/update/delete School B.
- [ ] Institution users cannot perform platform-only actions.
- [ ] Users cannot escalate roles.
- [ ] Users cannot modify their own protected authorization fields.
- [ ] Unauthorized resources return safe errors.
- [ ] Direct API calls cannot bypass UI restrictions.

Unit: permission-matrix resolution, role-hierarchy acyclicity, delegation overlap/expiry.
E2E: full RBAC CRUD flows, custom-role permission enforcement, cross-tenant isolation.

---

## O. Dependencies on later phases

- All domain phases (academic/finance/people/institution/ops/docs/communication) depend on Phase 2 clean gate.
- Frontend (Phase 11) depends on RBAC for role-aware nav; Finance on tenant isolation (P2.3).
- Phase 4+ domain engineering references the RBAC matrix built in Phase 2.

---

## P. Ambiguous/contradictory items requiring my decision

1. **Global uniqueness vs spec `(tenant_id, name)`** — Prisma `@@unique([name])` on roles/permissions vs spec tenant-scoped. Requires migration decision (Phase 2).
2. **Custom-role CRUD scope** — institution-scoped only vs full platform permission set for PRIMARY_INSTITUTION_ADMIN.
3. **Platform-admin exceptions list** — explicit allow-list of platform-only endpoints; does platform admin bypass tenant scoping via allow-list?
4. **Delegation security** — who may delegate; max duration; overlap rule on same role+user.
5. **`PRIMARY_INSTITUTION_ADMIN` vs `TENANT_ADMIN` alias** — naming decision (D-G6).
6. **Seed completeness** — confirm frozen role/permission matrix + built-in set is complete before RBAC coding (do not invent).

---

## Q. Explicitly deferred — must NOT be pulled into Phase 2

- Custom-role CRUD is Phase 2 — but do NOT implement Phase 3+ (backend reliability/observability), Phase 4+ domain APIs, Phase 5+ academic, Phase 6 finance, Phase 9+ comms, Phase 11 web, Phase 12+ e2e/perf, Phase 13 production infra.
- No email/SMS/push providers.
- No Paystack/finance processing.
- No multi-region/campus features.
- No frontend/UI.
- No CI/CD, observability, retry/backoff infrastructure (Phase 3).
- No nested role-delegation advanced features (only required lifecycle).

---

## R. Recommended Phase 2 batch breakdown (proposal — not a roadmap change)

| Batch | Scope (derived from P2.1–P2.5) |
|---|---|
| RBAC-1 | Permission model extraction + comparison + seed (P2.1) |
| RBAC-2 | Role CRUD + custom roles + role hierarchy + delegation (P2.1); permission assignment APIs (K) |
| RBAC-3 | PermissionGuard wiring + service-layer authz (P2.2); object-level authz (P2.4) |
| RBAC-4 | Tenant isolation + resolution + scoping review (P2.3) |
| RBAC-5 | Security tests + Phase-2 gate + completion report |

---

## Final verdict

**PHASE 2 READY — DECISIONS REQUIRED** — every P2.1–P2.5 task maps to a frozen spec owner; no BLOCKER on scope. Six decision points (P.1–P.6 above) require explicit approval before RBAC implementation begins. READ-ONLY COMPLETE — no source changes, no commits, no PR, no migrations, no Phase-2 implementation.
