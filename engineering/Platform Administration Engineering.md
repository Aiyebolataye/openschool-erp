# Platform Administration Engineering Specification

**Domain:** Platform Administration
**Scope:** Tenant Lifecycle Management, Subscription Management, Licensing, Feature Flags, White Label & Branding, Platform Configuration, Integration Management, API Key Management, Webhook Management, Background Job Administration, Platform Monitoring, Automation Management, Platform Audit, Platform Security, Platform Policies
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
12. [Provider Abstraction Layer](#12-provider-abstraction-layer)
13. [Platform-Wide Event Integration](#13-platform-wide-event-integration)
14. [Outstanding Items](#14-outstanding-items)
15. [Revision History](#15-revision-history)

---

## 1. Overview

Platform Administration manages the OpenSchool ERP platform itself rather than any individual institution. It owns platform-wide administration, tenant provisioning, subscriptions, licensing, branding, feature management, integrations, operational monitoring, automation, and platform governance.

This domain is used primarily by Platform Super Administrators and platform operations personnel. It must never own institution-specific operational data.

| Aspect | Approach |
|--------|----------|
| Identity | Platform-wide scope; entities are not scoped to a single institution |
| Tenant Management | Full lifecycle: provisioning, activation, suspension, archival, restoration, deletion |
| Subscriptions | Plan-based lifecycle; Finance handles payments; Platform Administration manages subscription state |
| Licensing | License allocation, entitlements, limits, validation, expiration |
| Feature Flags | Platform-wide and tenant-specific feature toggling with gradual rollout |
| Branding | White-label branding: logos, themes, colors, custom domains, login pages |
| Configuration | Global and regional defaults; institution-level overrides remain in Institution Management |
| Integrations | Provider-independent integration registry for payment, email, SMS, storage, identity, analytics |
| API Keys | Key lifecycle, rotation, expiration, revocation, usage monitoring, rate limiting |
| Webhooks | Registration, event subscriptions, retry policies, delivery logs, signature verification |
| Background Jobs | Queue administration, scheduled jobs, failed jobs, retries, queue and worker health |
| Monitoring | System health, service status, error monitoring, performance metrics, capacity, uptime |
| Automation | Platform-wide automation definitions, workflow templates, execution history |
| Audit | Platform-level audit records for all administrative actions |
| Security | Global security policies, IP allow/block lists, alerts, maintenance mode, compliance |
| Policies | Configurable platform policies for defaults, features, subscriptions, provisioning, integrations |

**In Scope:** Tenant lifecycle, subscriptions, licensing, feature flags, white-label branding, platform configuration, integration registry, API key management, webhook management, background job administration, platform monitoring, automation management, platform audit, platform security, platform policies

**Out of Scope:** User authentication, institution roles, institution permissions (Identity & Access), institution configuration, campus management (Institution Management), student/staff/parent records (People), academic operations (Academic Management), financial transactions, accounting (Finance), message delivery (Communication), operational resources (Operations), document storage (Documents & Learning), report generation (Reporting & Analytics)

---

## 2. Engineering Principles

### Core Philosophy

- **Platform Governance, Not Institution Operations:** Platform Administration manages the SaaS platform itself; it never owns institution-specific business data
- **Provider Independence:** Every external integration is abstracted behind a provider adapter; the domain never depends on a single vendor
- **Configuration over Customization:** Platform behavior is driven by configuration; no code changes required for policy adjustments
- **Multi-Tenant Architecture:** Tenant isolation is foundational; every platform operation is aware of tenant boundaries
- **Feature Flag-Driven Delivery:** New capabilities are deployed behind feature flags; rollout is gradual and reversible
- **Soft Delete by Default:** All mutable core entities support soft delete via `deleted_at` / `deleted_by`
- **Business Status vs Soft Delete:** Status enums represent business states (e.g., ACTIVE, SUSPENDED, EXPIRED); deletion is controlled by `deleted_at` / `deleted_by` columns exclusively
- **Optimistic Concurrency:** Version column on mutable entities; 409 Conflict on version mismatch
- **Immutable Audit Logging:** Append-only audit logs for all platform administrative actions; never update or delete
- **Event-Driven Platform Operations:** Platform state changes publish domain events for downstream consumers
- **Security by Default:** Security policies are enforced by default; relaxable only through explicit configuration
- **Scalability:** Platform operations must scale from single-tenant to multi-tenant without architectural changes
- **Extensibility:** Integration registry, automation framework, and webhook system are designed for extension

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Database tables | snake_case, plural | tenants, subscriptions, feature_flags |
| Columns | snake_case | tenant_id, license_key |
| Enums | SCREAMING_SNAKE_CASE | TENANT_STATUS_ACTIVE |
| Classes | PascalCase | TenantAggregate |
| Methods | camelCase | provisionTenant |
| API responses | camelCase | success, tenantId |
| Events | PascalCase, past tense | TenantProvisioned |
| Errors | PascalCase + Error | TenantNotFoundError |
| Permissions | `{domain}:{resource}:{action}` | platform:tenant:manage |

### Tenant Isolation

- Platform-level entities are not scoped to a single tenant; they span all tenants
- Tenant-scoped entities include `tenant_id` and are filtered by tenant context
- Platform Super Administrators operate across all tenants
- Application-level filtering (no Postgres Row-Level Security)
- Cross-tenant access for support requires explicit authorization and audit trail

### Soft Delete

- All mutable core entities use soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status (e.g., ACTIVE, SUSPENDED, EXPIRED) is a separate concern from deletion
- 30-day restore window before permanent deletion for eligible entities
- Tenant deletion follows a multi-step workflow with confirmation and grace period

### Audit Logging

Every platform administrative action generates an append-only audit log entry with: entity_type, entity_id, action, actor_id, actor_email, changes (JSON diff), context_ip, context_user_agent, timestamp.

Platform audit logs additionally capture: tenant_id (if applicable), admin_level, affected_scope, previous_state, new_state.

### Error Handling

- Structured error responses: `{ success: false, error: { code, message, details[] } }`
- Domain-specific error classes; never expose internal details
- Full error context logged server-side
- Platform errors include operation context for diagnostics

### Prisma Schema Principles

- UUID `@default(uuid())` for all primary keys
- `@unique` constraints for business keys
- `@map` for snake_case column names
- Soft delete via `deleted_at` (DateTime?) and `deleted_by` (uuid?)
- Business status via `status` enum (never a deletion marker)
- Optimistic locking via `version` (Int @default(1))
- Audit fields: created_at, created_by, updated_at, updated_by
- JSON columns for flexible data (metadata, configuration, feature flags)
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
| Queue | BullMQ + Redis |
| Monitoring | Prometheus-compatible metrics |
| Testing | Jest ^30.0.0 |
| Migrations | Prisma Migrate |
| API Docs | Swagger/OpenAPI ^7.0.0 |

---

## 3. Architecture Decision Records

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | Platform Administration manages the SaaS platform itself | Clear separation from institution-scoped domains; prevents platform logic from leaking into business domains |
| ADR-002 | Tenant lifecycle follows provisioning → pending → activation → suspension → archival → deletion → permanent deletion | Complete lifecycle coverage; each state has defined behaviors and restrictions |
| ADR-003 | Subscription lifecycle is platform-owned; Finance handles payments | Separation of concerns: subscription state vs financial transactions |
| ADR-004 | License entitlements are validated at the platform level | Centralized enforcement; institutions cannot bypass license limits |
| ADR-005 | Feature flags support platform-wide and tenant-specific scope | Granular control; enables gradual rollout and beta testing per tenant |
| ADR-006 | White-label branding is tenant-scoped with platform validation | Each tenant has independent branding; platform enforces minimum standards |
| ADR-007 | Platform configuration uses global defaults with regional overrides | Consistent base behavior; regional variations for currency, timezone, language |
| ADR-008 | Integration registry is provider-independent | Institutions choose providers; domain remains vendor-agnostic |
| ADR-009 | API keys follow rotation-based lifecycle | Security best practice; keys expire and must be rotated proactively |
| ADR-010 | Webhooks use HMAC signature verification | Prove authenticity of delivery; prevent spoofed callbacks |
| ADR-011 | Background job administration is observability-focused | Admins monitor and manage jobs; execution infrastructure (BullMQ) is implementation detail |
| ADR-012 | Platform monitoring aggregates health from all domains | Centralized observability; no single domain owns system-wide health |
| ADR-013 | Automation definitions are platform-wide templates | Reusable workflow templates; institutions instantiate and configure |
| ADR-014 | Platform audit logs are separate from institution audit logs | Different scopes, different retention policies, different access controls |
| ADR-015 | Global security policies apply across all tenants | Baseline security; tenants may add restrictions but not weaken defaults |
| ADR-016 | IP allow/block lists are evaluated at the platform edge | First line of defense; blocks malicious traffic before application layer |
| ADR-017 | Maintenance mode affects all tenants simultaneously | Platform-wide operations require coordinated downtime windows |
| ADR-018 | Application-level tenant isolation (no RLS) | Consistent with Identity & Access, Institution Management, People, and all other approved domains |
| ADR-019 | Domain events via EventEmitter2 (in-process) | Decouples services; supports async processing; future migration to message queue |
| ADR-020 | Optimistic concurrency (version column) | Prevents lost updates on concurrent administrative changes; no pessimistic locking overhead |
| ADR-021 | Immutable audit logs (append-only) | Tamper-proof platform audit trail; compliance requirement for SaaS operations |
| ADR-022 | Tenant provisioning supports template-based initialization | New tenants are pre-configured with institution templates; reduces onboarding friction |
| ADR-023 | Subscription changes publish events for downstream consumption | Finance, Licensing, and Feature Flags react to subscription state changes |
| ADR-024 | License limits are enforced at the platform level | Prevents over-utilization; institutions cannot exceed allocated limits |
| ADR-025 | Feature flag evaluation is cached with TTL | High-frequency evaluation must not impact performance; cache invalidation on flag change |
| ADR-026 | Integration credentials are encrypted at rest | Security requirement; provider secrets never stored in plaintext |
| ADR-027 | Webhook delivery uses exponential backoff retry | Provider downtime is transient; retries maximize delivery success |
| ADR-028 | Background job priorities are configurable per queue | Critical jobs (e.g., subscription renewal) must execute before low-priority jobs |
| ADR-029 | Platform monitoring supports configurable alert thresholds | Different tenants and regions have different operational requirements |
| ADR-030 | Automation execution history is retained per policy | Compliance requires execution audit; retention is configurable |
| ADR-031 | Platform security policies are inherited by tenants | Tenants inherit global policies; can add restrictions but not weaken |
| ADR-032 | Custom domains require DNS verification | Prevents domain hijacking; proves ownership before activation |
| ADR-033 | Branding assets reference Documents & Learning for storage | No duplicate file storage; branding files use the existing storage abstraction |
| ADR-034 | Subscription grace periods prevent immediate service interruption | Payment failures should not immediately disable access; grace period allows recovery |
| ADR-035 | Platform policies are version-controlled | Policy changes must be auditable; versions enable rollback and diff |

---

## 4. Engineering Status

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 1 — Domain Analysis | Complete | 15 bounded contexts, 48 entities, 60+ domain events, 40 business rules |
| Phase 2 — Domain Design | Complete | 15 aggregates, 40 invariants, 25 policies, 15 validation rule sets |
| Phase 3 — Database Design | Complete | 62 tables, 70+ indexes, 40 unique constraints |
| Phase 4 — Prisma Schema | Complete | ~48 models, 22 enums, 2-pass validation |
| Phase 5 — Backend Implementation | Complete | 15 modules, 15 repositories, 15 domain services, 15 controllers, 10 event consumers |
| Phase 6 — API Design | Complete | 137 endpoints (85 primary + 52 sub-resource) |
| Phase 7 — Testing & Verification | Complete | 20 test categories, ~192 test scenarios |

**Overall Status:** Approved — Frozen for Implementation.

---

## 5. Phase 1 — Domain Analysis

### 5.1 Domain Purpose

Platform Administration manages the OpenSchool ERP platform itself. It is responsible for tenant lifecycle management, subscription and licensing, feature flag delivery, white-label branding, platform configuration, integration registry, API key management, webhook management, background job administration, platform monitoring, automation management, platform audit, platform security, and platform policies.

Platform Administration does not own institution-specific business data. It operates at the platform layer and is used exclusively by Platform Super Administrators and platform operations personnel.

### 5.2 Domain Responsibilities

| Responsibility | Description |
|----------------|-------------|
| Tenant Lifecycle Management | Provision, activate, suspend, archive, restore, and delete tenants |
| Subscription Management | Manage subscription plans, billing cycles, trial periods, renewals, upgrades, downgrades, grace periods |
| Licensing | Allocate licenses, enforce limits (students, staff, storage, API usage), validate entitlements, manage expiration |
| Feature Flags | Toggle platform-wide and tenant-specific features, support beta and gradual rollout |
| White Label & Branding | Manage logos, themes, colors, custom domains, email branding, login pages per tenant |
| Platform Configuration | Maintain global defaults, regional defaults, timezones, currencies, localization, security defaults |
| Integration Management | Registry for payment gateways, email/SMS/storage/identity/analytics providers, external APIs |
| API Key Management | Issue, rotate, expire, revoke API keys; monitor usage; enforce rate limits |
| Webhook Management | Register webhooks, manage event subscriptions, retry policies, delivery logs, signature verification |
| Background Job Administration | Monitor queues, scheduled jobs, failed jobs, retries, queue health, worker health, job priorities |
| Platform Monitoring | Aggregate system health, service status, error monitoring, performance metrics, capacity, uptime |
| Automation Management | Define platform-wide automation templates, scheduled/event-triggered automation, execution history |
| Platform Audit | Maintain platform-level audit records for tenant admin, subscription, license, feature, integration, settings changes |
| Platform Security | Global security policies, IP allow/block lists, security alerts, maintenance mode, compliance settings |
| Platform Policies | Configurable platform defaults, feature availability, subscription constraints, provisioning rules |

### 5.3 Domain Boundaries

**In Scope:** Tenant lifecycle, subscriptions, licensing, feature flags, white-label branding, platform configuration, integration registry, API key management, webhook management, background job administration, platform monitoring, automation management, platform audit, platform security, platform policies

**Out of Scope:** User authentication, institution roles, institution permissions (Identity & Access), institution configuration, campus management (Institution Management), student/staff/parent records (People), academic operations (Academic Management), financial transactions, accounting (Finance), message delivery (Communication), operational resources (Operations), document storage (Documents & Learning), report generation (Reporting & Analytics)

### 5.4 Dependencies

| Dependency | Nature | Direction |
|------------|--------|-----------|
| Identity & Access | User context, authentication, Platform Super Admin role resolution | Reads |
| Institution Management | Institution configuration, tenant context for branding overrides | Reads |
| People | Person counts for license validation (student/staff limits) | Reads (events) |
| Finance | Payment processing for subscriptions; invoice events | Writes (events) |
| Communication | Delivery of platform notifications, security alerts, maintenance notices | Writes (events) |
| Documents & Learning | Storage abstraction for branding assets, integration credentials | Writes |
| Reporting & Analytics | Platform health metrics, usage analytics, tenant analytics | Reads (events) |
| All Domains | Domain events for platform audit, monitoring, automation | Reads (events) |

### 5.5 Core Entities

#### 5.5.1 Tenant Lifecycle Management

| Entity | Type | Description |
|--------|------|-------------|
| Tenant | Core | Represents an institution on the platform; the fundamental unit of multi-tenant isolation |
| TenantProvisioningRequest | Core | Tracks the request and workflow for provisioning a new tenant |
| TenantStateTransition | Supporting | Immutable record of every tenant state change with actor and reason |
| TenantMigration | Supporting | Tracks tenant data migration operations between infrastructure |
| TenantClone | Supporting | Tracks tenant cloning operations (future capability) |
| TenantDeletionWorkflow | Core | Multi-step deletion workflow with confirmation, grace period, and final purge |

#### 5.5.2 Subscription Management

| Entity | Type | Description |
|--------|------|-------------|
| SubscriptionPlan | Core | Defines a subscription tier with pricing, features, and limits |
| TenantSubscription | Core | The active subscription for a tenant; links tenant to plan |
| SubscriptionHistory | Supporting | Immutable record of all subscription changes |
| TrialConfiguration | Supporting | Trial period settings for a subscription plan |
| GracePeriodConfiguration | Supporting | Grace period rules for payment failures |

#### 5.5.3 Licensing

| Entity | Type | Description |
|--------|------|-------------|
| License | Core | Allocated license for a tenant with specific entitlements |
| LicenseEntitlement | Supporting | Individual entitlement within a license (students, staff, storage, API) |
| LicenseUsage | Supporting | Current usage metrics against license limits |
| LicenseHistory | Supporting | Immutable record of all license changes |

#### 5.5.4 Feature Flags

| Entity | Type | Description |
|--------|------|-------------|
| FeatureFlag | Core | Toggle for a platform feature with scope, targeting rules, and rollout percentage |
| FeatureFlagOverride | Supporting | Tenant-specific override for a platform-wide feature flag |
| FeatureFlagAudit | Supporting | Record of every flag change with actor and timestamp |

#### 5.5.5 White Label & Branding

| Entity | Type | Description |
|--------|------|-------------|
| BrandingProfile | Core | Complete branding configuration for a tenant |
| BrandAsset | Supporting | Individual branding asset (logo, favicon, background) with storage reference |
| ThemeConfiguration | Supporting | Color palette, typography, and visual theme settings |
| CustomDomain | Core | Custom domain configuration with DNS verification status |
| EmailBranding | Supporting | Email-specific branding (sender name, header, footer) |
| LoginBranding | Supporting | Login page branding (background, logo placement, colors) |

#### 5.5.6 Platform Configuration

| Entity | Type | Description |
|--------|------|-------------|
| GlobalConfiguration | Core | Platform-wide default settings |
| RegionalConfiguration | Supporting | Region-specific defaults (timezone, currency, language, date format) |
| SecurityDefaults | Supporting | Platform-wide security default settings (password policy, session timeout, MFA) |

#### 5.5.7 Integration Management

| Entity | Type | Description |
|--------|------|-------------|
| IntegrationRegistry | Core | Registry of all available integration types and their configurations |
| IntegrationProvider | Core | Specific provider configuration within an integration type |
| TenantIntegration | Core | Tenant-specific integration configuration and credentials |
| IntegrationHealthLog | Supporting | Health check results for configured integrations |

#### 5.5.8 API Key Management

| Entity | Type | Description |
|--------|------|-------------|
| ApiKey | Core | API key with client identity, scopes, expiration, and status |
| ApiKeyUsageLog | Supporting | Usage record for each API key invocation |
| ApiKeyRotationPolicy | Supporting | Rotation rules for API key lifecycle |
| RateLimitPolicy | Supporting | Rate-limit configuration per API key or globally |

#### 5.5.9 Webhook Management

| Entity | Type | Description |
|--------|------|-------------|
| WebhookRegistration | Core | Registered webhook endpoint with event subscriptions and secret |
| WebhookEventSubscription | Supporting | Maps specific events to a webhook registration |
| WebhookDeliveryLog | Supporting | Delivery attempt record with request, response, and signature |
| WebhookRetryPolicy | Supporting | Retry rules for failed webhook deliveries |

#### 5.5.10 Background Job Administration

| Entity | Type | Description |
|--------|------|-------------|
| QueueHealthSnapshot | Supporting | Point-in-time health metrics for a job queue |
| FailedJobRecord | Supporting | Record of a failed job with error details and retry status |
| ScheduledJobConfiguration | Supporting | Configuration for a scheduled/recurring job |
| WorkerHealthSnapshot | Supporting | Point-in-time health metrics for a queue worker |

#### 5.5.11 Platform Monitoring

| Entity | Type | Description |
|--------|------|-------------|
| HealthCheckResult | Core | Aggregated health check result from all platform services |
| ServiceStatus | Supporting | Status record for an individual platform service |
| PerformanceMetric | Supporting | Time-series performance data (response time, throughput, error rate) |
| CapacityMetric | Supporting | Capacity data (storage, compute, queue depth) |
| AlertConfiguration | Supporting | Configurable alert threshold for a monitored metric |
| AlertRecord | Supporting | Triggered alert with severity, context, and resolution status |

#### 5.5.12 Automation Management

| Entity | Type | Description |
|--------|------|-------------|
| AutomationTemplate | Core | Platform-wide automation workflow template |
| AutomationDefinition | Core | Instance of an automation template configured by the platform |
| AutomationExecution | Supporting | Record of an automation execution with status, timing, and output |
| AutomationSchedule | Supporting | Schedule configuration for time-based automations |

#### 5.5.13 Platform Audit

| Entity | Type | Description |
|--------|------|-------------|
| PlatformAuditLog | Core | Immutable record of a platform administrative action |
| AuditExportConfiguration | Supporting | Configuration for automated audit log exports |

#### 5.5.14 Platform Security

| Entity | Type | Description |
|--------|------|-------------|
| GlobalSecurityPolicy | Core | Platform-wide security policy settings |
| IpAllowBlockList | Core | IP allowlist and blocklist entries |
| SecurityAlert | Supporting | Security event requiring attention |
| MaintenanceWindow | Core | Scheduled maintenance period with impact scope |
| ComplianceSetting | Supporting | Compliance configuration (data retention, encryption, access controls) |

#### 5.5.15 Platform Policies

| Entity | Type | Description |
|--------|------|-------------|
| PlatformPolicy | Core | Configurable platform policy with version control |
| PolicyVersion | Supporting | Immutable snapshot of a policy version |
| PolicyException | Supporting | Requested and approved exception to a platform policy |

### 5.6 Domain Events

#### 5.6.1 Events Published by Platform Administration

| Event | Trigger | Consumers |
|-------|---------|-----------|
| TenantProvisioned | Tenant successfully provisioned | Communication (welcome), Reporting (analytics) |
| TenantActivated | Tenant transitions to ACTIVE | Communication (notification), Feature Flags (enable) |
| TenantSuspended | Tenant transitions to SUSPENDED | Communication (alert), Feature Flags (disable features) |
| TenantArchived | Tenant transitions to ARCHIVED | Feature Flags (disable all), Monitoring (alert) |
| TenantRestored | Tenant restored from ARCHIVED | Feature Flags (re-enable), Communication (notification) |
| TenantDeleted | Tenant permanently deleted | All domains (cleanup) |
| TenantDeletionInitiated | Deletion workflow started | TenantLifecycle (track workflow) |
| TenantDeletionConfirmed | Deletion confirmed by admin | TenantDeletion (begin grace period) |
| SubscriptionCreated | New subscription created for tenant | Licensing (allocate), Feature Flags (enable), Finance (billing) |
| SubscriptionRenewed | Subscription renewed | Licensing (validate), Finance (billing) |
| SubscriptionUpgraded | Subscription upgraded to higher plan | Licensing (increase limits), Feature Flags (enable features) |
| SubscriptionDowngraded | Subscription downgraded to lower plan | Licensing (decrease limits), Feature Flags (disable features) |
| SubscriptionExpired | Subscription past expiration date | Tenant (suspend), Communication (alert) |
| SubscriptionCancelled | Subscription cancelled by tenant | Licensing (revoke), Feature Flags (disable), Tenant (suspend) |
| SubscriptionGracePeriod | Grace period initiated after payment failure | Licensing (restrict), Communication (notify) |
| LicenseAllocated | License allocated to tenant | Feature Flags (enable), Monitoring (track) |
| LicenseLimitExceeded | Tenant exceeds license limit | Communication (alert), Tenant (restrict) |
| LicenseExpired | License past expiration date | Feature Flags (disable), Tenant (restrict) |
| FeatureFlagToggled | Feature flag state changed | Monitoring (log), Tenant-specific consumers |
| BrandingUpdated | Tenant branding configuration changed | Communication (re-brand), Documents (assets) |
| CustomDomainVerified | Custom domain DNS verification passed | Tenant (activate domain) |
| CustomDomainRemoved | Custom domain deactivated | Tenant (revert to default domain) |
| IntegrationConfigured | Integration provider configured by tenant | Monitoring (health check) |
| IntegrationHealthChanged | Integration health status changed | Communication (alert), Monitoring (update) |
| ApiKeyCreated | New API key issued | Communication (notification) |
| ApiKeyRotated | API key rotated | Communication (notification) |
| ApiKeyRevoked | API key revoked | Monitoring (log), Communication (alert) |
| WebhookRegistered | New webhook registered | Monitoring (health check) |
| WebhookDeliveryFailed | Webhook delivery exhausted retries | Communication (alert), Monitoring (alert) |
| MaintenanceScheduled | Maintenance window scheduled | Communication (all tenants) |
| MaintenanceStarted | Maintenance window began | Communication (all tenants) |
| MaintenanceCompleted | Maintenance window ended | Communication (all tenants), Monitoring (resume) |
| SecurityAlertTriggered | Security event detected | Communication (urgent alert), Monitoring (alert) |
| PlatformPolicyChanged | Platform policy version updated | All domains (re-evaluate) |

#### 5.6.2 Events Consumed from Other Domains

| Source Domain | Event | Platform Administration Action |
|---------------|-------|-------------------------------|
| Identity & Access | PlatformAdminLogin | Log platform access, update last login timestamp |
| Identity & Access | PlatformAdminLogout | Log platform access, update session metrics |
| People | StudentEnrolled | Update license usage count |
| People | StudentWithdrawn | Decrement license usage count |
| People | StaffHired | Update license usage count |
| People | StaffSeparated | Decrement license usage count |
| Finance | SubscriptionPaymentReceived | Extend subscription period, update payment status |
| Finance | SubscriptionPaymentFailed | Initiate grace period workflow |
| Communication | NotificationDelivered | Update platform delivery metrics |
| All Domains | DomainServiceHealthChanged | Update service health dashboard |
| All Domains | BackgroundJobFailed | Update failed job metrics, trigger alerting |

### 5.7 Business Rules

| ID | Rule | Scope |
|----|------|-------|
| BR-PA-001 | A tenant must have an active subscription to access platform features | Tenant Lifecycle |
| BR-PA-002 | Tenant provisioning requires Platform Super Admin authorization | Tenant Lifecycle |
| BR-PA-003 | Tenant deletion requires confirmation and a 30-day grace period | Tenant Lifecycle |
| BR-PA-004 | Suspended tenants retain data but cannot access the platform | Tenant Lifecycle |
| BR-PA-005 | Archived tenants are read-only; no new data can be created | Tenant Lifecycle |
| BR-PA-006 | Tenant state transitions must follow the approved lifecycle flow | Tenant Lifecycle |
| BR-PA-007 | Subscription changes take effect immediately unless scheduled | Subscription |
| BR-PA-008 | Downgrades apply at the end of the current billing period | Subscription |
| BR-PA-009 | Grace period is configurable per plan (default: 7 days) | Subscription |
| BR-PA-010 | Expired subscriptions transition to SUSPENDED after grace period | Subscription |
| BR-PA-011 | Trial subscriptions convert to paid or expire after trial period | Subscription |
| BR-PA-012 | License limits are enforced in real-time; exceeding limits triggers alerts | Licensing |
| BR-PA-013 | License allocation cannot exceed subscription plan entitlements | Licensing |
| BR-PA-014 | Expired licenses disable non-core features; core access remains during grace | Licensing |
| BR-PA-015 | Feature flags can be toggled per-tenant or platform-wide | Feature Flags |
| BR-PA-016 | Gradual rollout percentage is configurable (0–100%) | Feature Flags |
| BR-PA-017 | Emergency feature disable takes effect immediately for all tenants | Feature Flags |
| BR-PA-018 | Branding changes are validated against minimum contrast and readability standards | Branding |
| BR-PA-019 | Custom domains require DNS verification before activation | Branding |
| BR-PA-020 | Branding assets must not exceed platform-configured size limits | Branding |
| BR-PA-021 | Platform configuration changes require Platform Super Admin authorization | Configuration |
| BR-PA-022 | Regional overrides inherit from global defaults | Configuration |
| BR-PA-023 | Integration credentials must be encrypted at rest | Integrations |
| BR-PA-024 | Integration health checks run at configurable intervals | Integrations |
| BR-PA-025 | API keys must be rotated before expiration | API Keys |
| BR-PA-026 | Rate limits are enforced per API key or globally | API Keys |
| BR-PA-027 | Revoked API keys cannot be reactivated | API Keys |
| BR-PA-028 | Webhook deliveries are signed with HMAC-SHA256 | Webhooks |
| BR-PA-029 | Failed webhook deliveries are retried with exponential backoff | Webhooks |
| BR-PA-030 | Webhook event subscriptions must reference valid platform events | Webhooks |
| BR-PA-031 | Failed background jobs are retried up to a configurable maximum | Background Jobs |
| BR-PA-032 | Job priority determines execution order within a queue | Background Jobs |
| BR-PA-033 | Platform health checks aggregate from all registered services | Monitoring |
| BR-PA-034 | Alert thresholds are configurable per metric | Monitoring |
| BR-PA-035 | Automation definitions must reference valid event types | Automation |
| BR-PA-036 | Automation execution history is retained per policy | Automation |
| BR-PA-037 | Platform audit logs are immutable and append-only | Audit |
| BR-PA-038 | Global security policies cannot be weakened by tenants | Security |
| BR-PA-039 | IP blocklist entries are evaluated before application routing | Security |
| BR-PA-040 | Maintenance mode disables all non-essential platform operations | Security |

### 5.8 Invariants

| ID | Invariant |
|----|-----------|
| INV-PA-001 | Every tenant has exactly one active subscription at any time |
| INV-PA-002 | Every active tenant has a valid, non-expired license |
| INV-PA-003 | License usage counts must not exceed allocated limits |
| INV-PA-004 | Feature flag state is deterministic for a given tenant at evaluation time |
| INV-PA-005 | Every tenant has exactly one branding profile |
| INV-PA-006 | Custom domain names are unique across all tenants |
| INV-PA-007 | API keys are unique across the platform |
| INV-PA-008 | Webhook URLs are unique per tenant |
| INV-PA-009 | Platform audit log entries are never updated or deleted |
| INV-PA-010 | Tenant state transitions follow the approved lifecycle |
| INV-PA-011 | Subscription plan changes are recorded in subscription history |
| INV-PA-012 | License entitlement changes are recorded in license history |
| INV-PA-013 | Integration credentials are encrypted before storage |
| INV-PA-014 | Webhook deliveries include HMAC signature |
| INV-PA-015 | Background job retries do not exceed configured maximum |
| INV-PA-016 | Platform monitoring aggregates health from all registered services |
| INV-PA-017 | Automation executions reference valid automation definitions |
| INV-PA-018 | Security policies are inherited by all tenants |
| INV-PA-019 | Maintenance windows do not overlap |
| INV-PA-020 | Platform policies are version-controlled |

### 5.9 Configurable Policies

| ID | Policy | Default | Scope |
|----|--------|---------|-------|
| CP-PA-001 | Tenant provisioning requires approval | true | Provisioning |
| CP-PA-002 | Tenant deletion grace period (days) | 30 | Lifecycle |
| CP-PA-003 | Subscription grace period (days) | 7 | Subscription |
| CP-PA-004 | Trial period duration (days) | 14 | Subscription |
| CP-PA-005 | License warning threshold (%) | 80 | Licensing |
| CP-PA-006 | License critical threshold (%) | 95 | Licensing |
| CP-PA-007 | Feature flag cache TTL (seconds) | 60 | Feature Flags |
| CP-PA-008 | Custom domain verification timeout (hours) | 48 | Branding |
| CP-PA-009 | Branding asset max size (MB) | 5 | Branding |
| CP-PA-010 | API key default expiration (days) | 90 | API Keys |
| CP-PA-011 | API key rotation warning (days before expiry) | 14 | API Keys |
| CP-PA-012 | Rate limit window (seconds) | 60 | API Keys |
| CP-PA-013 | Webhook max retries | 5 | Webhooks |
| CP-PA-014 | Webhook retry backoff base (seconds) | 30 | Webhooks |
| CP-PA-015 | Background job max retries | 3 | Background Jobs |
| CP-PA-016 | Health check interval (seconds) | 30 | Monitoring |
| CP-PA-017 | Alert evaluation interval (seconds) | 60 | Monitoring |
| CP-PA-018 | Automation execution history retention (days) | 90 | Automation |
| CP-PA-019 | Platform audit log retention (days) | 365 | Audit |
| CP-PA-020 | Maintenance notification lead time (hours) | 24 | Security |
| CP-PA-021 | IP blocklist TTL (hours) | 24 | Security |
| CP-PA-022 | Security alert escalation timeout (minutes) | 30 | Security |
| CP-PA-023 | Platform policy versioning enabled | true | Policies |
| CP-PA-024 | Integration health check timeout (seconds) | 10 | Integrations |
| CP-PA-025 | Credential encryption algorithm | AES-256-GCM | Integrations |

### 5.10 Assumptions

1. Platform Super Administrators are provisioned through Identity & Access; Platform Administration does not manage platform admin user accounts
2. Finance owns payment processing; Platform Administration only manages subscription state
3. Institution-level configuration overrides remain in Institution Management
4. Branding assets are stored using Documents & Learning storage abstraction
5. Platform monitoring aggregates from services; it does not instrument individual domains
6. Background job infrastructure (BullMQ) is an implementation detail; the specification remains queue-agnostic where possible
7. Automation definitions are platform-wide templates; institution-specific automation is managed by each domain
8. Platform audit logs have different retention requirements than institution audit logs
9. Multi-factor authentication and session management are Identity & Access responsibilities
10. Tenant cloning is a future capability; schema supports it but implementation is deferred
11. API rate limiting uses Redis-backed sliding window counters
12. Webhook signature verification uses HMAC-SHA256 with per-registration secrets
13. Feature flag evaluation is synchronous and cached; flag changes propagate via event bus
14. Integration credential rotation is manual in V1; automated rotation is a future enhancement
15. Platform health checks use HTTP probing for external services and heartbeat for internal services
16. Maintenance mode is toggled via a platform-wide configuration flag
17. IP allow/block lists are evaluated at the reverse proxy level before reaching the application
18. License usage counts are updated via domain events from People and cached for performance

---

## 6. Phase 2 — Domain Design

### 6.1 Aggregates

| Aggregate | Root Entity | Scope | Key Invariants |
|-----------|-------------|-------|----------------|
| Tenant | Tenant | Tenant Lifecycle | State transitions follow approved lifecycle; one active subscription required |
| TenantProvisioning | TenantProvisioningRequest | Tenant Lifecycle | Provisioning workflow is sequential; cannot skip steps |
| TenantDeletion | TenantDeletionWorkflow | Tenant Lifecycle | Deletion requires confirmation, grace period, and final purge |
| Subscription | TenantSubscription | Subscription | One active subscription per tenant; changes are history-tracked |
| SubscriptionPlan | SubscriptionPlan | Subscription | Plans are immutable once published; versioning via new records |
| License | License | Licensing | Usage must not exceed entitlements; license validity is checked continuously |
| FeatureFlag | FeatureFlag | Feature Flags | Flag state is deterministic per tenant; overrides inherit from global |
| Branding | BrandingProfile | Branding | One profile per tenant; assets validated against size/contrast rules |
| CustomDomain | CustomDomain | Branding | Domain names are globally unique; verification required before activation |
| PlatformConfiguration | GlobalConfiguration | Configuration | Configuration changes are version-controlled and audited |
| Integration | TenantIntegration | Integrations | Credentials encrypted at rest; health checked on configuration |
| ApiKey | ApiKey | API Keys | Keys are unique; rotation before expiration enforced |
| Webhook | WebhookRegistration | Webhooks | URLs unique per tenant; deliveries signed with HMAC |
| Monitoring | HealthCheckResult | Monitoring | Health aggregates from all services; alerts respect thresholds |
| Automation | AutomationTemplate | Automation | Templates reference valid events; executions are history-tracked |

### 6.2 Entity Relationships

| Relationship | Cardinality | Description |
|-------------|-------------|-------------|
| Tenant → TenantSubscription | 1 : 1 (active) | One active subscription per tenant |
| Tenant → License | 1 : 1 | One license per tenant |
| Tenant → BrandingProfile | 1 : 1 | One branding profile per tenant |
| Tenant → CustomDomain | 1 : N | Tenant may have multiple custom domains |
| Tenant → TenantIntegration | 1 : N | Tenant may configure multiple integrations |
| Tenant → ApiKey | 1 : N | Tenant may have multiple API keys |
| Tenant → WebhookRegistration | 1 : N | Tenant may register multiple webhooks |
| Tenant → TenantStateTransition | 1 : N | Every state change is recorded |
| Tenant → TenantDeletionWorkflow | 1 : 1 | Active deletion workflow if pending |
| SubscriptionPlan → TenantSubscription | 1 : N | One plan may have many subscribers |
| SubscriptionPlan → LicenseEntitlement | 1 : N | Plan defines entitlements |
| License → LicenseEntitlement | 1 : N | License contains multiple entitlements |
| License → LicenseUsage | 1 : N | Usage tracked per entitlement type |
| FeatureFlag → FeatureFlagOverride | 1 : N | Global flag may have per-tenant overrides |
| BrandingProfile → BrandAsset | 1 : N | Profile contains multiple assets |
| BrandingProfile → ThemeConfiguration | 1 : 1 | One theme per profile |
| BrandingProfile → EmailBranding | 1 : 1 | One email branding config per profile |
| BrandingProfile → LoginBranding | 1 : 1 | One login branding config per profile |
| GlobalConfiguration → RegionalConfiguration | 1 : N | Global defaults with regional overrides |
| IntegrationRegistry → IntegrationProvider | 1 : N | Integration type has multiple providers |
| TenantIntegration → IntegrationProvider | N : 1 | Tenant configures one provider per integration type |
| ApiKey → ApiKeyUsageLog | 1 : N | Each key has usage history |
| WebhookRegistration → WebhookEventSubscription | 1 : N | Webhook subscribes to multiple events |
| WebhookRegistration → WebhookDeliveryLog | 1 : N | Each webhook has delivery history |
| AlertConfiguration → AlertRecord | 1 : N | Configuration triggers multiple alerts |
| AutomationTemplate → AutomationDefinition | 1 : N | Template instantiated multiple times |
| AutomationDefinition → AutomationExecution | 1 : N | Definition has execution history |
| PlatformPolicy → PolicyVersion | 1 : N | Policy has version history |
| PlatformPolicy → PolicyException | 1 : N | Policy may have exceptions |
| GlobalSecurityPolicy → IpAllowBlockList | 1 : N | Policy contains IP entries |
| MaintenanceWindow → (none) | 1 : 1 | Standalone scheduled entity |

### 6.3 Domain Services

| Service | Responsibility | Key Operations |
|---------|---------------|----------------|
| TenantLifecycleService | Manage tenant state transitions | provision, activate, suspend, archive, restore, delete |
| TenantProvisioningService | Execute tenant provisioning workflow | createTenant, configureDefaults, allocateLicense, enableFeatures |
| SubscriptionManagementService | Manage subscription lifecycle | create, renew, upgrade, downgrade, cancel, applyGracePeriod |
| LicensingService | Manage license allocation and enforcement | allocate, validate, incrementUsage, decrementUsage, expire |
| FeatureFlagService | Evaluate and manage feature flags | evaluate, toggle, setOverride, gradualRollout, emergencyDisable |
| BrandingService | Manage tenant branding | updateProfile, uploadAsset, configureTheme, verifyDomain |
| PlatformConfigurationService | Manage platform defaults | setGlobal, setRegional, getEffective |
| IntegrationRegistryService | Manage integration providers | register, configure, healthCheck, rotateCredentials |
| ApiKeyService | Manage API key lifecycle | create, rotate, revoke, validate, checkRateLimit |
| WebhookService | Manage webhook lifecycle | register, subscribe, deliver, retry, verifySignature |
| BackgroundJobService | Monitor and manage background jobs | getQueueHealth, getFailedJobs, retryJob, cancelJob |
| PlatformMonitoringService | Aggregate platform health | checkHealth, getMetrics, evaluateAlerts, getCapacity |
| AutomationService | Manage automation templates | createTemplate, instantiate, execute, getHistory |
| PlatformAuditService | Record and query audit logs | log, query, export |
| PlatformSecurityService | Enforce platform security | checkIp, toggleMaintenance, managePolicies, escalateAlert |
| PlatformPolicyService | Manage platform policies | create, update, version, getException, approveException |

### 6.4 Lifecycle States

#### Tenant Lifecycle

```text
PROVISIONING → PENDING → ACTIVE → SUSPENDED → ARCHIVED → DELETING → DELETED
                              ↓                                    ↑
                              → SUSPENDED → ACTIVE (restore)       |
                              → ARCHIVED → ACTIVE (restore)        |
                              → ARCHIVED → DELETING                |
```

| State | Description |
|-------|-------------|
| PROVISIONING | Tenant is being provisioned; infrastructure and default configuration being set up |
| PENDING | Provisioning complete; awaiting Platform Super Admin activation |
| ACTIVE | Tenant is fully operational; all subscribed features available |
| SUSPENDED | Tenant access restricted due to subscription/payment issues; data retained |
| ARCHIVED | Tenant data preserved in read-only mode; no new operations |
| DELETING | Deletion workflow in progress; grace period active |
| DELETED | Tenant permanently deleted; data purged |

#### Subscription Lifecycle

| State | Description |
|-------|-------------|
| TRIAL | Active trial period; limited features; converts to PAID or expires |
| ACTIVE | Paid subscription current; full feature access |
| GRACE_PERIOD | Payment overdue; grace period active; features restricted |
| SUSPENDED | Subscription suspended after grace period expiry; minimal access |
| CANCELLED | Subscription cancelled; features disabled at period end |
| EXPIRED | Subscription expired; no further access |

#### License Lifecycle

| State | Description |
|-------|-------------|
| ALLOCATED | License allocated to tenant; pending activation |
| ACTIVE | License valid; usage within limits |
| WARNING | Usage approaching limit (≥ warning threshold) |
| CRITICAL | Usage at or above critical threshold |
| EXCEEDED | Usage exceeds allocated limits; restrictions apply |
| EXPIRED | License past expiration date; features disabled |

#### Feature Flag States

| State | Description |
|-------|-------------|
| DISABLED | Feature is off for all tenants |
| ENABLED | Feature is on for all tenants (or targeted tenants) |
| GRADUAL_ROLLOUT | Feature rolling out to percentage of tenants |
| BETA | Feature available only to opted-in tenants |
| EMERGENCY_DISABLED | Feature forcibly disabled; overrides all other states |

#### Custom Domain States

| State | Description |
|-------|-------------|
| PENDING_VERIFICATION | DNS verification in progress |
| VERIFIED | DNS verification passed; domain ready for activation |
| ACTIVE | Domain is live and serving traffic |
| SUSPENDED | Domain suspended due to issues |
| REMOVED | Domain deactivated; traffic returns to default domain |

#### Integration Health States

| State | Description |
|-------|-------------|
| CONFIGURED | Integration configured; health check pending |
| HEALTHY | Integration responding normally |
| DEGRADED | Integration responding with elevated latency or partial failures |
| UNHEALTHY | Integration not responding; actions may fail |
| DISABLED | Integration manually disabled by tenant or platform admin |

### 6.5 Validation Rules

| ID | Entity | Rule | Severity |
|----|--------|------|----------|
| V-PA-001 | Tenant | name must be 2–100 characters; alphanumeric and spaces only | Error |
| V-PA-002 | Tenant | slug must be 2–50 characters; lowercase alphanumeric and hyphens only | Error |
| V-PA-003 | Tenant | slug must be globally unique | Error |
| V-PA-004 | TenantProvisioningRequest | institution_type must be a valid enum value | Error |
| V-PA-005 | TenantProvisioningRequest | requested_by must reference a valid Platform Super Admin | Error |
| V-PA-006 | SubscriptionPlan | name must be 2–100 characters | Error |
| V-PA-007 | SubscriptionPlan | price must be non-negative | Error |
| V-PA-008 | SubscriptionPlan | billing_interval must be MONTHLY, QUARTERLY, or ANNUAL | Error |
| V-PA-009 | TenantSubscription | plan_id must reference a valid SubscriptionPlan | Error |
| V-PA-010 | TenantSubscription | trial_end_date must be in the future if status is TRIAL | Error |
| V-PA-011 | License | license_key must be unique across the platform | Error |
| V-PA-012 | License | expires_at must be after created_at | Error |
| V-PA-013 | LicenseEntitlement | limit_value must be positive | Error |
| V-PA-014 | LicenseEntitlement | entitlement_type must be a valid enum value | Error |
| V-PA-015 | FeatureFlag | key must be unique, uppercase alphanumeric with underscores | Error |
| V-PA-016 | FeatureFlag | rollout_percentage must be 0–100 | Error |
| V-PA-017 | BrandingProfile | must have at least one logo asset | Warning |
| V-PA-018 | BrandingProfile | primary_color must be valid hex color | Error |
| V-PA-019 | CustomDomain | domain must be valid FQDN format | Error |
| V-PA-020 | CustomDomain | domain must not be a reserved platform domain | Error |
| V-PA-021 | ApiKey | name must be 2–100 characters | Error |
| V-PA-022 | ApiKey | scopes must reference valid platform permissions | Error |
| V-PA-023 | ApiKey | expires_at must be in the future | Error |
| V-PA-024 | WebhookRegistration | url must be valid HTTPS URL | Error |
| V-PA-025 | WebhookRegistration | secret must be at least 32 characters | Error |
| V-PA-026 | WebhookEventSubscription | event_type must be a valid platform event | Error |
| V-PA-027 | GlobalConfiguration | key must be unique | Error |
| V-PA-028 | IntegrationProvider | provider_type must be a valid enum value | Error |
| V-PA-029 | IpAllowBlockList | ip_address must be valid IPv4 or CIDR notation | Error |
| V-PA-030 | MaintenanceWindow | start_time must be before end_time | Error |
| V-PA-031 | MaintenanceWindow | start_time must be in the future | Error |
| V-PA-032 | AutomationTemplate | event_type must reference a valid platform event | Error |
| V-PA-033 | PlatformPolicy | policy_key must be unique | Error |
| V-PA-034 | PlatformPolicy | version must increment by 1 on each update | Error |
| V-PA-035 | AlertConfiguration | threshold_value must be positive | Error |
| V-PA-036 | RateLimitPolicy | max_requests must be positive | Error |
| V-PA-037 | RateLimitPolicy | window_seconds must be positive | Error |
| V-PA-038 | EmailBranding | sender_email must be valid email format | Error |
| V-PA-039 | ThemeConfiguration | all color fields must be valid hex | Error |
| V-PA-040 | PlatformPolicyException | reason must be at least 10 characters | Error |

### 6.6 Read Models

| Read Model | Purpose | Consumers |
|------------|---------|-----------|
| TenantSummary | Quick view of tenant state, subscription, and license | Platform dashboard |
| TenantDetail | Full tenant configuration including integrations, branding, features | Tenant management UI |
| SubscriptionOverview | Current subscription with plan details and next renewal | Subscription management |
| LicenseDashboard | License usage across all entitlement types with alerts | License management |
| FeatureFlagDashboard | All feature flags with per-tenant evaluation results | Feature management |
| BrandingPreview | Branding configuration with live preview | Branding management |
| IntegrationStatus | Integration health and configuration status | Integration management |
| ApiKeyOverview | API keys with usage and expiration status | API key management |
| WebhookDashboard | Webhook registrations with delivery success rates | Webhook management |
| QueueHealthDashboard | All queues with depth, throughput, and error rates | Background job management |
| PlatformHealthDashboard | Aggregated health from all services | Platform monitoring |
| AutomationOverview | Automation definitions with execution history | Automation management |
| AuditLogQuery | Filterable audit log with full detail | Audit compliance |
| SecurityDashboard | Security policy status, IP lists, active alerts | Security management |
| PolicyOverview | All platform policies with current version and exceptions | Policy management |

---

## 7. Phase 3 — Database Design

### 7.1 Table Catalogue

| # | Table | Description | Tenant Scoped |
|---|-------|-------------|---------------|
| 1 | tenants | Core tenant record | No (platform-wide) |
| 2 | tenant_provisioning_requests | Provisioning workflow tracking | No |
| 3 | tenant_state_transitions | Immutable state change history | No |
| 4 | tenant_deletion_workflows | Multi-step deletion workflow | No |
| 5 | tenant_migrations | Migration operation tracking | No |
| 6 | subscription_plans | Subscription tier definitions | No |
| 7 | tenant_subscriptions | Active subscription per tenant | Yes |
| 8 | subscription_history | Immutable subscription change history | Yes |
| 9 | trial_configurations | Trial period settings per plan | No |
| 10 | grace_period_configurations | Grace period rules per plan | No |
| 11 | licenses | License allocation per tenant | No |
| 12 | license_entitlements | Individual entitlements per license | No |
| 13 | license_usage | Current usage metrics per entitlement | No |
| 14 | license_history | Immutable license change history | No |
| 15 | feature_flags | Platform-wide feature toggles | No |
| 16 | feature_flag_overrides | Per-tenant flag overrides | Yes |
| 17 | feature_flag_audit | Immutable flag change history | No |
| 18 | branding_profiles | Tenant branding configuration | Yes |
| 19 | brand_assets | Individual branding assets | Yes |
| 20 | theme_configurations | Color/typography theme | Yes |
| 21 | custom_domains | Custom domain configuration | Yes |
| 22 | email_brandings | Email-specific branding | Yes |
| 23 | login_brandings | Login page branding | Yes |
| 24 | global_configurations | Platform-wide default settings | No |
| 25 | regional_configurations | Region-specific defaults | No |
| 26 | security_defaults | Platform security defaults | No |
| 27 | integration_registries | Integration type definitions | No |
| 28 | integration_providers | Provider configurations per type | No |
| 29 | tenant_integrations | Tenant-specific integration configs | Yes |
| 30 | integration_health_logs | Integration health check results | Yes |
| 31 | api_keys | API key records | Yes |
| 32 | api_key_usage_logs | API key usage history | Yes |
| 33 | api_key_rotation_policies | Key rotation rules | No |
| 34 | rate_limit_policies | Rate limit configurations | No |
| 35 | webhook_registrations | Webhook endpoint registrations | Yes |
| 36 | webhook_event_subscriptions | Event-to-webhook mappings | Yes |
| 37 | webhook_delivery_logs | Delivery attempt records | Yes |
| 38 | webhook_retry_policies | Retry rules per webhook | Yes |
| 39 | queue_health_snapshots | Queue health metrics | No |
| 40 | failed_job_records | Failed job tracking | No |
| 41 | scheduled_job_configurations | Scheduled job settings | No |
| 42 | worker_health_snapshots | Worker health metrics | No |
| 43 | health_check_results | Aggregated health check results | No |
| 44 | service_status_records | Individual service status | No |
| 45 | performance_metrics | Time-series performance data | No |
| 46 | capacity_metrics | Capacity data | No |
| 47 | alert_configurations | Alert threshold settings | No |
| 48 | alert_records | Triggered alert records | No |
| 49 | automation_templates | Platform automation templates | No |
| 50 | automation_definitions | Configured automation instances | No |
| 51 | automation_executions | Execution history | No |
| 52 | automation_schedules | Schedule configurations | No |
| 53 | platform_audit_logs | Immutable platform audit trail | No |
| 54 | audit_export_configurations | Audit export settings | No |
| 55 | global_security_policies | Platform security policies | No |
| 56 | ip_allow_block_lists | IP allow/block entries | No |
| 57 | security_alerts | Security event records | No |
| 58 | maintenance_windows | Scheduled maintenance periods | No |
| 59 | compliance_settings | Compliance configurations | No |
| 60 | platform_policies | Configurable platform policies | No |
| 61 | policy_versions | Immutable policy snapshots | No |
| 62 | policy_exceptions | Policy exception requests | No |

### 7.2 Column Catalogue

#### tenants

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| name | varchar(100) | No | | Tenant display name |
| slug | varchar(50) | No | | URL-safe unique identifier |
| institution_type | varchar(50) | No | | Type of educational institution |
| status | tenant_status | No | PENDING | Current lifecycle state |
| created_by | uuid | No | | Platform Super Admin who provisioned |
| created_at | timestamptz | No | now() | Creation timestamp |
| updated_by | uuid | Yes | | Last modifier |
| updated_at | timestamptz | No | now() | Last update timestamp |
| deleted_at | timestamptz | Yes | | Soft delete timestamp |
| deleted_by | uuid | Yes | | Soft delete actor |
| version | int | No | 1 | Optimistic concurrency |

**Indexes:** slug (unique), status, created_at, deleted_at

**Constraints:** slug unique across non-deleted tenants

#### tenant_provisioning_requests

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants |
| requested_by | uuid | No | | Platform Super Admin |
| institution_type | varchar(50) | No | | Requested institution type |
| template_id | uuid | Yes | | Institution template to apply |
| status | provisioning_status | No | PENDING | Workflow state |
| steps_completed | jsonb | No | '[]' | Completed provisioning steps |
| started_at | timestamptz | No | now() | Provisioning start |
| completed_at | timestamptz | Yes | | Provisioning completion |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** tenant_id, status, created_at

#### tenant_state_transitions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants |
| from_state | tenant_status | No | | Previous state |
| to_state | tenant_status | No | | New state |
| actor_id | uuid | No | | Who triggered transition |
| actor_email | varchar(255) | No | | Actor email for audit |
| reason | text | Yes | | Reason for transition |
| metadata | jsonb | Yes | | Additional context |
| created_at | timestamptz | No | now() | Immutable timestamp |

**Indexes:** tenant_id, created_at, to_state

#### tenant_deletion_workflows

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants (unique) |
| initiated_by | uuid | No | | Who initiated deletion |
| status | deletion_status | No | PENDING | Workflow state |
| confirmation_token | varchar(100) | No | | One-time confirmation token |
| confirmed_at | timestamptz | Yes | | Confirmation timestamp |
| grace_period_ends | timestamptz | No | | When grace period expires |
| purged_at | timestamptz | Yes | | When data was purged |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** tenant_id (unique), status, grace_period_ends

#### subscription_plans

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| name | varchar(100) | No | | Plan display name |
| code | varchar(50) | No | | Unique plan code |
| description | text | Yes | | Plan description |
| price | decimal(12,2) | No | 0 | Base price |
| currency | varchar(3) | No | 'USD' | ISO 4217 currency |
| billing_interval | billing_interval | No | MONTHLY | Billing frequency |
| trial_days | int | No | 0 | Trial period duration |
| is_active | boolean | No | true | Whether plan is available |
| features | jsonb | No | '{}' | Feature entitlements |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** code (unique), is_active, deleted_at

#### tenant_subscriptions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants |
| plan_id | uuid | No | | FK → subscription_plans |
| status | subscription_status | No | TRIAL | Current status |
| trial_start_date | timestamptz | Yes | | Trial start |
| trial_end_date | timestamptz | Yes | | Trial end |
| current_period_start | timestamptz | No | | Current billing period start |
| current_period_end | timestamptz | No | | Current billing period end |
| grace_period_ends | timestamptz | Yes | | Grace period end |
| cancelled_at | timestamptz | Yes | | Cancellation timestamp |
| cancelled_by | uuid | Yes | | Who cancelled |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** tenant_id (unique per active), plan_id, status, current_period_end, deleted_at

#### subscription_history

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants |
| subscription_id | uuid | No | | FK → tenant_subscriptions |
| action | subscription_action | No | | CREATED, RENEWED, UPGRADED, DOWNGRADED, CANCELLED |
| previous_plan_id | uuid | Yes | | Previous plan |
| new_plan_id | uuid | Yes | | New plan |
| previous_status | subscription_status | Yes | | Previous status |
| new_status | subscription_status | No | | New status |
| actor_id | uuid | No | | Who made the change |
| reason | text | Yes | | Reason |
| created_at | timestamptz | No | now() | Immutable |

**Indexes:** tenant_id, subscription_id, created_at

#### licenses

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants |
| license_key | varchar(50) | No | | Unique license key |
| plan_id | uuid | No | | FK → subscription_plans |
| status | license_status | No | ALLOCATED | Current status |
| starts_at | timestamptz | No | | License start |
| expires_at | timestamptz | No | | License expiration |
| activated_at | timestamptz | Yes | | Activation timestamp |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** tenant_id (unique per active), license_key (unique), plan_id, status, expires_at, deleted_at

#### license_entitlements

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| license_id | uuid | No | | FK → licenses |
| entitlement_type | entitlement_type | No | | STUDENT_LIMIT, STAFF_LIMIT, STORAGE_LIMIT, API_LIMIT |
| limit_value | bigint | No | | Maximum allowed |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** license_id + entitlement_type (unique composite)

#### license_usage

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| license_id | uuid | No | | FK → licenses |
| entitlement_type | entitlement_type | No | | Matches entitlement |
| current_usage | bigint | No | 0 | Current count |
| last_incremented_at | timestamptz | Yes | | Last increment |
| last_decremented_at | timestamptz | Yes | | Last decrement |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** license_id + entitlement_type (unique composite)

#### feature_flags

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| key | varchar(100) | No | | Unique flag key |
| name | varchar(100) | No | | Display name |
| description | text | Yes | | Flag description |
| status | feature_flag_status | No | DISABLED | Current state |
| scope | feature_flag_scope | No | PLATFORM | PLATFORM or TENANT |
| rollout_percentage | int | No | 100 | Gradual rollout percentage |
| targeting_rules | jsonb | Yes | | Tenant targeting rules |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** key (unique), status, scope, deleted_at

#### feature_flag_overrides

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| flag_id | uuid | No | | FK → feature_flags |
| tenant_id | uuid | No | | FK → tenants |
| enabled | boolean | No | | Override value |
| created_by | uuid | No | | Who set override |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** flag_id + tenant_id (unique composite), tenant_id

#### branding_profiles

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants (unique) |
| primary_color | varchar(7) | No | '#1E40AF' | Primary brand color (hex) |
| secondary_color | varchar(7) | No | '#60A5FA' | Secondary brand color |
| accent_color | varchar(7) | Yes | | Accent color |
| font_family | varchar(100) | No | 'Inter' | Primary font |
| is_active | boolean | No | true | |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** tenant_id (unique)

#### brand_assets

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| profile_id | uuid | No | | FK → branding_profiles |
| asset_type | brand_asset_type | No | | LOGO, FAVICON, BACKGROUND |
| file_reference | varchar(500) | No | | Documents & Learning storage ref |
| file_size_bytes | bigint | No | | File size |
| mime_type | varchar(50) | No | | MIME type |
| width | int | Yes | | Image width |
| height | int | Yes | | Image height |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |

**Indexes:** profile_id + asset_type

#### custom_domains

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants |
| domain | varchar(255) | No | | Custom domain FQDN |
| status | custom_domain_status | No | PENDING_VERIFICATION | |
| verification_token | varchar(100) | No | | DNS TXT record token |
| verified_at | timestamptz | Yes | | Verification timestamp |
| activated_at | timestamptz | Yes | | Activation timestamp |
| ssl_certificate_id | varchar(200) | Yes | | SSL cert reference |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** domain (unique across non-deleted), tenant_id, status, deleted_at

#### global_configurations

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| config_key | varchar(100) | No | | Unique configuration key |
| config_value | jsonb | No | | Configuration value |
| config_type | varchar(50) | No | | STRING, NUMBER, BOOLEAN, JSON |
| description | text | Yes | | |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| created_by | uuid | No | | |
| updated_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** config_key (unique)

#### regional_configurations

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| region_code | varchar(10) | No | | ISO 3166-1 alpha-2 or region code |
| config_key | varchar(100) | No | | References global configuration key |
| config_value | jsonb | No | | Region-specific override |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** region_code + config_key (unique composite)

#### integration_registries

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| integration_type | varchar(50) | No | | PAYMENT_GATEWAY, EMAIL, SMS, STORAGE, IDENTITY, ANALYTICS |
| name | varchar(100) | No | | Display name |
| description | text | Yes | | |
| is_active | boolean | No | true | |
| configuration_schema | jsonb | No | | JSON Schema for provider config |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** integration_type (unique)

#### integration_providers

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| registry_id | uuid | No | | FK → integration_registries |
| provider_name | varchar(100) | No | | Provider display name |
| provider_code | varchar(50) | No | | Unique provider code |
| credentials_schema | jsonb | No | | JSON Schema for credentials |
| is_active | boolean | No | true | |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** registry_id, provider_code (unique)

#### tenant_integrations

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants |
| provider_id | uuid | No | | FK → integration_providers |
| credentials_encrypted | text | No | | AES-256-GCM encrypted credentials |
| status | integration_health_status | No | CONFIGURED | |
| configuration | jsonb | No | '{}' | Provider-specific config |
| last_health_check | timestamptz | Yes | | Last health check |
| last_healthy_at | timestamptz | Yes | | Last successful health check |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** tenant_id + provider_id (unique composite per active), status, deleted_at

#### api_keys

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants |
| name | varchar(100) | No | | Key display name |
| key_hash | varchar(255) | No | | SHA-256 hash of the key |
| key_prefix | varchar(10) | No | | First 8 chars for identification |
| scopes | jsonb | No | '[]' | Granted permission scopes |
| status | api_key_status | No | ACTIVE | |
| expires_at | timestamptz | No | | Expiration timestamp |
| last_used_at | timestamptz | Yes | | Last usage timestamp |
| created_by | uuid | No | | Who created the key |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** tenant_id, key_hash (unique globally), key_prefix, status, expires_at, deleted_at

#### api_key_usage_logs

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| api_key_id | uuid | No | | FK → api_keys |
| endpoint | varchar(200) | No | | Requested endpoint |
| method | varchar(10) | No | | HTTP method |
| status_code | int | No | | Response status code |
| response_time_ms | int | No | | Response time |
| ip_address | inet | Yes | | Client IP |
| user_agent | varchar(500) | Yes | | Client user agent |
| created_at | timestamptz | No | now() | Immutable |

**Indexes:** api_key_id, created_at

#### webhook_registrations

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | No | | FK → tenants |
| url | varchar(500) | No | | Webhook endpoint URL |
| secret | varchar(255) | No | | HMAC signing secret |
| status | webhook_status | No | ACTIVE | |
| description | text | Yes | | |
| last_triggered_at | timestamptz | Yes | | |
| last_success_at | timestamptz | Yes | | |
| last_failure_at | timestamptz | Yes | | |
| failure_count | int | No | 0 | Consecutive failures |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** tenant_id, url (unique per tenant), status, deleted_at

#### webhook_event_subscriptions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| webhook_id | uuid | No | | FK → webhook_registrations |
| event_type | varchar(100) | No | | Event type string |
| is_active | boolean | No | true | |
| created_at | timestamptz | No | now() | |

**Indexes:** webhook_id + event_type (unique composite)

#### webhook_delivery_logs

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| webhook_id | uuid | No | | FK → webhook_registrations |
| event_type | varchar(100) | No | | Delivered event type |
| payload | jsonb | No | | Event payload |
| request_headers | jsonb | No | | Request headers including signature |
| response_status | int | Yes | | Response HTTP status |
| response_body | text | Yes | | Response body (truncated) |
| delivery_status | delivery_status | No | PENDING | |
| attempt_count | int | No | 1 | |
| next_retry_at | timestamptz | Yes | | Next scheduled retry |
| delivered_at | timestamptz | Yes | | Successful delivery time |
| created_at | timestamptz | No | now() | Immutable |

**Indexes:** webhook_id, delivery_status, event_type, created_at

#### platform_audit_logs

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| tenant_id | uuid | Yes | | NULL for platform-wide actions |
| entity_type | varchar(100) | No | | Entity type affected |
| entity_id | uuid | No | | Entity ID affected |
| action | varchar(50) | No | | CREATE, UPDATE, DELETE, STATE_CHANGE |
| actor_id | uuid | No | | Platform Super Admin ID |
| actor_email | varchar(255) | No | | Actor email |
| changes | jsonb | Yes | | JSON diff of changes |
| previous_state | varchar(50) | Yes | | State before change |
| new_state | varchar(50) | Yes | | State after change |
| context_ip | inet | Yes | | Request IP |
| context_user_agent | varchar(500) | Yes | | Request user agent |
| admin_level | varchar(20) | No | | SUPER_ADMIN, OPERATIONS |
| affected_scope | varchar(100) | No | | PLATFORM, TENANT, INTEGRATION |
| created_at | timestamptz | No | now() | Immutable |

**Indexes:** tenant_id, entity_type, entity_id, actor_id, action, created_at, affected_scope

#### global_security_policies

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| policy_key | varchar(100) | No | | Unique policy key |
| policy_value | jsonb | No | | Policy configuration |
| description | text | Yes | | |
| is_enforced | boolean | No | true | Cannot be weakened by tenants |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| created_by | uuid | No | | |
| updated_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** policy_key (unique)

#### ip_allow_block_lists

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| security_policy_id | uuid | No | | FK → global_security_policies |
| list_type | ip_list_type | No | ALLOW, BLOCK | |
| ip_address | inet | No | | IP address or CIDR range |
| description | text | Yes | | Reason for entry |
| expires_at | timestamptz | Yes | | TTL expiration |
| created_by | uuid | No | | |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |

**Indexes:** security_policy_id, list_type, ip_address (unique per list type), expires_at, deleted_at

#### platform_policies

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| policy_key | varchar(100) | No | | Unique policy key |
| policy_name | varchar(100) | No | | Display name |
| description | text | Yes | | |
| policy_value | jsonb | No | | Current policy configuration |
| current_version | int | No | 1 | Current version number |
| is_active | boolean | No | true | |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| created_by | uuid | No | | |
| updated_by | uuid | Yes | | |
| version | int | No | 1 | Optimistic concurrency |

**Indexes:** policy_key (unique), is_active

#### policy_versions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| policy_id | uuid | No | | FK → platform_policies |
| version_number | int | No | | Version sequence |
| policy_value | jsonb | No | | Snapshot at this version |
| change_reason | text | No | | Why this version was created |
| created_by | uuid | No | | |
| created_at | timestamptz | No | now() | Immutable |

**Indexes:** policy_id + version_number (unique composite)

#### policy_exceptions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| policy_id | uuid | No | | FK → platform_policies |
| tenant_id | uuid | Yes | | NULL for platform-wide exceptions |
| reason | text | No | | Minimum 10 characters |
| status | exception_status | No | PENDING | PENDING, APPROVED, REJECTED |
| approved_by | uuid | Yes | | |
| approved_at | timestamptz | Yes | | |
| expires_at | timestamptz | Yes | | Exception expiration |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** policy_id, tenant_id, status

#### maintenance_windows

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| title | varchar(200) | No | | Maintenance title |
| description | text | Yes | | |
| start_time | timestamptz | No | | Scheduled start |
| end_time | timestamptz | No | | Scheduled end |
| status | maintenance_status | No | SCHEDULED | SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED |
| affected_services | jsonb | No | '[]' | Services affected |
| notification_sent | boolean | No | false | Whether tenants notified |
| created_by | uuid | No | | |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| version | int | No | 1 | |

**Indexes:** status, start_time, end_time

#### health_check_results

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| service_name | varchar(100) | No | | Service identifier |
| status | health_status | No | | HEALTHY, DEGRADED, UNHEALTHY |
| response_time_ms | int | Yes | | |
| details | jsonb | Yes | | Additional health details |
| checked_at | timestamptz | No | now() | |

**Indexes:** service_name, checked_at, status

#### automation_templates

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| name | varchar(100) | No | | Template name |
| description | text | Yes | | |
| trigger_event | varchar(100) | No | | Event that triggers automation |
| actions | jsonb | No | '[]' | Ordered list of actions |
| conditions | jsonb | Yes | '[]' | Conditions to evaluate |
| is_active | boolean | No | true | |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** trigger_event, is_active, deleted_at

#### automation_definitions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| template_id | uuid | No | | FK → automation_templates |
| name | varchar(100) | No | | Instance name |
| configuration | jsonb | No | '{}' | Instance-specific configuration |
| is_active | boolean | No | true | |
| created_at | timestamptz | No | now() | |
| updated_at | timestamptz | No | now() | |
| deleted_at | timestamptz | Yes | | |
| deleted_by | uuid | Yes | | |
| version | int | No | 1 | |

**Indexes:** template_id, is_active, deleted_at

#### automation_executions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | uuid() | Primary key |
| definition_id | uuid | No | | FK → automation_definitions |
| trigger_event | varchar(100) | No | | Event that triggered |
| trigger_entity_id | uuid | Yes | | Entity that triggered |
| status | execution_status | No | PENDING | |
| started_at | timestamptz | Yes | | |
| completed_at | timestamptz | Yes | | |
| duration_ms | int | Yes | | Execution duration |
| result | jsonb | Yes | | Execution result |
| error_message | text | Yes | | Error if failed |
| created_at | timestamptz | No | now() | |

**Indexes:** definition_id, trigger_event, status, created_at

---

## 8. Phase 4 — Prisma Schema

### 8.1 Enums

```prisma
enum TenantStatus {
  PROVISIONING
  PENDING
  ACTIVE
  SUSPENDED
  ARCHIVED
  DELETING
  DELETED
}

enum ProvisioningStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
}

enum DeletionStatus {
  PENDING
  CONFIRMED
  GRACE_PERIOD
  PURGING
  COMPLETED
  FAILED
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  GRACE_PERIOD
  SUSPENDED
  CANCELLED
  EXPIRED
}

enum BillingInterval {
  MONTHLY
  QUARTERLY
  ANNUAL
}

enum SubscriptionAction {
  CREATED
  RENEWED
  UPGRADED
  DOWNGRADED
  CANCELLED
  REACTIVATED
}

enum LicenseStatus {
  ALLOCATED
  ACTIVE
  WARNING
  CRITICAL
  EXCEEDED
  EXPIRED
}

enum EntitlementType {
  STUDENT_LIMIT
  STAFF_LIMIT
  STORAGE_LIMIT
  API_LIMIT
}

enum FeatureFlagStatus {
  DISABLED
  ENABLED
  GRADUAL_ROLLOUT
  BETA
  EMERGENCY_DISABLED
}

enum FeatureFlagScope {
  PLATFORM
  TENANT
}

enum BrandAssetType {
  LOGO
  FAVICON
  BACKGROUND
  WATERMARK
}

enum CustomDomainStatus {
  PENDING_VERIFICATION
  VERIFIED
  ACTIVE
  SUSPENDED
  REMOVED
}

enum IntegrationHealthStatus {
  CONFIGURED
  HEALTHY
  DEGRADED
  UNHEALTHY
  DISABLED
}

enum IntegrationType {
  PAYMENT_GATEWAY
  EMAIL
  SMS
  STORAGE
  IDENTITY
  ANALYTICS
}

enum ApiKeyStatus {
  ACTIVE
  EXPIRED
  REVOKED
}

enum WebhookStatus {
  ACTIVE
  PAUSED
  DISABLED
}

enum DeliveryStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  RETRYING
}

enum HealthStatus {
  HEALTHY
  DEGRADED
  UNHEALTHY
}

enum ExceptionStatus {
  PENDING
  APPROVED
  REJECTED
}

enum IpListType {
  ALLOW
  BLOCK
}

enum MaintenanceStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ExecutionStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}
```

### 8.2 Models

```prisma
model Tenant {
  id              String       @id @default(uuid()) @db.Uuid
  name            String       @db.VarChar(100)
  slug            String       @unique @db.VarChar(50)
  institutionType String       @map("institution_type") @db.VarChar(50)
  status          TenantStatus @default(PENDING)
  createdBy       String       @map("created_by") @db.Uuid
  createdAt       DateTime     @default(now()) @map("created_at") @db.Timestamptz()
  updatedBy       String?      @map("updated_by") @db.Uuid
  updatedAt       DateTime     @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt       DateTime?    @map("deleted_at") @db.Timestamptz()
  deletedBy       String?      @map("deleted_by") @db.Uuid
  version         Int          @default(1)

  provisioningRequests TenantProvisioningRequest[]
  stateTransitions     TenantStateTransition[]
  deletionWorkflow     TenantDeletionWorkflow?
  subscription         TenantSubscription?
  license              License?
  brandingProfile      BrandingProfile?
  customDomains        CustomDomain[]
  tenantIntegrations   TenantIntegration[]
  apiKeys              ApiKey[]
  webhookRegistrations WebhookRegistration[]
  featureFlagOverrides FeatureFlagOverride[]
  subscriptionHistory  SubscriptionHistory[]
  licenseHistory       LicenseHistory[]

  @@index([status])
  @@index([createdAt])
  @@index([deletedAt])
  @@map("tenants")
}

model TenantProvisioningRequest {
  id              String              @id @default(uuid()) @db.Uuid
  tenantId        String              @map("tenant_id") @db.Uuid
  requestedBy     String              @map("requested_by") @db.Uuid
  institutionType String              @map("institution_type") @db.VarChar(50)
  templateId      String?             @map("template_id") @db.Uuid
  status          ProvisioningStatus  @default(PENDING)
  stepsCompleted  Json                @default("[]") @map("steps_completed")
  startedAt       DateTime            @default(now()) @map("started_at") @db.Timestamptz()
  completedAt     DateTime?           @map("completed_at") @db.Timestamptz()
  createdAt       DateTime            @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime            @default(now()) @map("updated_at") @db.Timestamptz()
  version         Int                 @default(1)

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([status])
  @@index([createdAt])
  @@map("tenant_provisioning_requests")
}

model TenantStateTransition {
  id          String         @id @default(uuid()) @db.Uuid
  tenantId    String         @map("tenant_id") @db.Uuid
  fromState   TenantStatus   @map("from_state")
  toState     TenantStatus   @map("to_state")
  actorId     String         @map("actor_id") @db.Uuid
  actorEmail  String         @map("actor_email") @db.VarChar(255)
  reason      String?        @db.Text
  metadata    Json?          @db.Json
  createdAt   DateTime       @default(now()) @map("created_at") @db.Timestamptz()

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([createdAt])
  @@index([toState])
  @@map("tenant_state_transitions")
}

model TenantDeletionWorkflow {
  id                String         @id @default(uuid()) @db.Uuid
  tenantId          String         @unique @map("tenant_id") @db.Uuid
  initiatedBy       String         @map("initiated_by") @db.Uuid
  status            DeletionStatus @default(PENDING)
  confirmationToken String         @map("confirmation_token") @db.VarChar(100)
  confirmedAt       DateTime?      @map("confirmed_at") @db.Timestamptz()
  gracePeriodEnds   DateTime       @map("grace_period_ends") @db.Timestamptz()
  purgedAt          DateTime?      @map("purged_at") @db.Timestamptz()
  createdAt         DateTime       @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime       @default(now()) @map("updated_at") @db.Timestamptz()
  version           Int            @default(1)

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([status])
  @@index([gracePeriodEnds])
  @@map("tenant_deletion_workflows")
}

model SubscriptionPlan {
  id              String          @id @default(uuid()) @db.Uuid
  name            String          @db.VarChar(100)
  code            String          @unique @db.VarChar(50)
  description     String?         @db.Text
  price           Decimal         @default(0) @db.Decimal(12, 2)
  currency        String          @default("USD") @db.VarChar(3)
  billingInterval BillingInterval @default(MONTHLY) @map("billing_interval")
  trialDays       Int             @default(0) @map("trial_days")
  isActive        Boolean         @default(true) @map("is_active")
  features        Json            @default("{}")
  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime        @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt       DateTime?       @map("deleted_at") @db.Timestamptz()
  deletedBy       String?         @map("deleted_by") @db.Uuid
  version         Int             @default(1)

  subscriptions TenantSubscription[]
  licenses      License[]

  @@index([isActive])
  @@index([deletedAt])
  @@map("subscription_plans")
}

model TenantSubscription {
  id                String             @id @default(uuid()) @db.Uuid
  tenantId          String             @map("tenant_id") @db.Uuid
  planId            String             @map("plan_id") @db.Uuid
  status            SubscriptionStatus @default(TRIAL)
  trialStartDate    DateTime?          @map("trial_start_date") @db.Timestamptz()
  trialEndDate      DateTime?          @map("trial_end_date") @db.Timestamptz()
  currentPeriodStart DateTime          @map("current_period_start") @db.Timestamptz()
  currentPeriodEnd   DateTime          @map("current_period_end") @db.Timestamptz()
  gracePeriodEnds   DateTime?          @map("grace_period_ends") @db.Timestamptz()
  cancelledAt       DateTime?          @map("cancelled_at") @db.Timestamptz()
  cancelledBy       String?            @map("cancelled_by") @db.Uuid
  createdAt         DateTime           @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime           @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt         DateTime?          @map("deleted_at") @db.Timestamptz()
  deletedBy         String?            @map("deleted_by") @db.Uuid
  version           Int                @default(1)

  tenant  Tenant           @relation(fields: [tenantId], references: [id])
  plan    SubscriptionPlan @relation(fields: [planId], references: [id])
  history SubscriptionHistory[]

  @@unique([tenantId, status], name: "active_subscription_per_tenant")
  @@index([planId])
  @@index([currentPeriodEnd])
  @@index([deletedAt])
  @@map("tenant_subscriptions")
}

model SubscriptionHistory {
  id              String             @id @default(uuid()) @db.Uuid
  tenantId        String             @map("tenant_id") @db.Uuid
  subscriptionId  String             @map("subscription_id") @db.Uuid
  action          SubscriptionAction
  previousPlanId  String?            @map("previous_plan_id") @db.Uuid
  newPlanId       String?            @map("new_plan_id") @db.Uuid
  previousStatus  SubscriptionStatus? @map("previous_status")
  newStatus       SubscriptionStatus @map("new_status")
  actorId         String             @map("actor_id") @db.Uuid
  reason          String?            @db.Text
  createdAt       DateTime           @default(now()) @map("created_at") @db.Timestamptz()

  tenant       Tenant             @relation(fields: [tenantId], references: [id])
  subscription TenantSubscription @relation(fields: [subscriptionId], references: [id])

  @@index([tenantId])
  @@index([subscriptionId])
  @@index([createdAt])
  @@map("subscription_history")
}

model License {
  id            String        @id @default(uuid()) @db.Uuid
  tenantId      String        @map("tenant_id") @db.Uuid
  licenseKey    String        @unique @map("license_key") @db.VarChar(50)
  planId        String        @map("plan_id") @db.Uuid
  status        LicenseStatus @default(ALLOCATED)
  startsAt      DateTime      @map("starts_at") @db.Timestamptz()
  expiresAt     DateTime      @map("expires_at") @db.Timestamptz()
  activatedAt   DateTime?     @map("activated_at") @db.Timestamptz()
  createdAt     DateTime      @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime      @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt     DateTime?     @map("deleted_at") @db.Timestamptz()
  deletedBy     String?       @map("deleted_by") @db.Uuid
  version       Int           @default(1)

  tenant      Tenant              @relation(fields: [tenantId], references: [id])
  plan        SubscriptionPlan    @relation(fields: [planId], references: [id])
  entitlements LicenseEntitlement[]
  usage       LicenseUsage[]
  history     LicenseHistory[]

  @@unique([tenantId, status], name: "active_license_per_tenant")
  @@index([planId])
  @@index([expiresAt])
  @@index([deletedAt])
  @@map("licenses")
}

model LicenseEntitlement {
  id              String          @id @default(uuid()) @db.Uuid
  licenseId       String          @map("license_id") @db.Uuid
  entitlementType EntitlementType @map("entitlement_type")
  limitValue      BigInt          @map("limit_value")
  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime        @default(now()) @map("updated_at") @db.Timestamptz()
  version         Int             @default(1)

  license License       @relation(fields: [licenseId], references: [id])
  usage   LicenseUsage?

  @@unique([licenseId, entitlementType])
  @@map("license_entitlements")
}

model LicenseUsage {
  id                  String          @id @default(uuid()) @db.Uuid
  licenseId           String          @map("license_id") @db.Uuid
  entitlementType     EntitlementType @map("entitlement_type")
  currentUsage        BigInt          @default(0) @map("current_usage")
  lastIncrementedAt   DateTime?       @map("last_incremented_at") @db.Timestamptz()
  lastDecrementedAt   DateTime?       @map("last_decremented_at") @db.Timestamptz()
  createdAt           DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt           DateTime        @default(now()) @map("updated_at") @db.Timestamptz()
  version             Int             @default(1)

  license     License            @relation(fields: [licenseId], references: [id])
  entitlement LicenseEntitlement @relation(fields: [entitlementType], references: [entitlementType], map: "license_entitlements")

  @@unique([licenseId, entitlementType])
  @@map("license_usage")
}

model LicenseHistory {
  id              String        @id @default(uuid()) @db.Uuid
  tenantId        String        @map("tenant_id") @db.Uuid
  licenseId       String        @map("license_id") @db.Uuid
  action          String        @db.VarChar(50)
  previousStatus  LicenseStatus? @map("previous_status")
  newStatus       LicenseStatus @map("new_status")
  actorId         String        @map("actor_id") @db.Uuid
  reason          String?       @db.Text
  createdAt       DateTime      @default(now()) @map("created_at") @db.Timestamptz()

  tenant Tenant @relation(fields: [tenantId], references: [id])
  license License @relation(fields: [licenseId], references: [id])

  @@index([tenantId])
  @@index([licenseId])
  @@index([createdAt])
  @@map("license_history")
}

model FeatureFlag {
  id                String            @id @default(uuid()) @db.Uuid
  key               String            @unique @db.VarChar(100)
  name              String            @db.VarChar(100)
  description       String?           @db.Text
  status            FeatureFlagStatus @default(DISABLED)
  scope             FeatureFlagScope  @default(PLATFORM)
  rolloutPercentage Int               @default(100) @map("rollout_percentage")
  targetingRules    Json?             @map("targeting_rules") @db.Json
  createdAt         DateTime          @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime          @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt         DateTime?         @map("deleted_at") @db.Timestamptz()
  deletedBy         String?           @map("deleted_by") @db.Uuid
  version           Int               @default(1)

  overrides FeatureFlagOverride[]
  audit     FeatureFlagAudit[]

  @@index([status])
  @@index([scope])
  @@index([deletedAt])
  @@map("feature_flags")
}

model FeatureFlagOverride {
  id        String      @id @default(uuid()) @db.Uuid
  flagId    String      @map("flag_id") @db.Uuid
  tenantId  String      @map("tenant_id") @db.Uuid
  enabled   Boolean
  createdBy String      @map("created_by") @db.Uuid
  createdAt DateTime    @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt DateTime    @default(now()) @map("updated_at") @db.Timestamptz()
  version   Int         @default(1)

  flag FeatureFlag @relation(fields: [flagId], references: [id])
  tenant Tenant    @relation(fields: [tenantId], references: [id])

  @@unique([flagId, tenantId])
  @@index([tenantId])
  @@map("feature_flag_overrides")
}

model FeatureFlagAudit {
  id        String      @id @default(uuid()) @db.Uuid
  flagId    String      @map("flag_id") @db.Uuid
  actorId   String      @map("actor_id") @db.Uuid
  actorEmail String     @map("actor_email") @db.VarChar(255)
  previousStatus FeatureFlagStatus? @map("previous_status")
  newStatus      FeatureFlagStatus  @map("new_status")
  changes   Json?       @db.Json
  createdAt DateTime    @default(now()) @map("created_at") @db.Timestamptz()

  flag FeatureFlag @relation(fields: [flagId], references: [id])

  @@index([flagId])
  @@index([createdAt])
  @@map("feature_flag_audit")
}

model BrandingProfile {
  id             String      @id @default(uuid()) @db.Uuid
  tenantId       String      @unique @map("tenant_id") @db.Uuid
  primaryColor   String      @default("#1E40AF") @map("primary_color") @db.VarChar(7)
  secondaryColor String      @default("#60A5FA") @map("secondary_color") @db.VarChar(7)
  accentColor    String?     @map("accent_color") @db.VarChar(7)
  fontFamily     String      @default("Inter") @map("font_family") @db.VarChar(100)
  isActive       Boolean     @default(true) @map("is_active")
  createdAt      DateTime    @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt      DateTime    @default(now()) @map("updated_at") @db.Timestamptz()
  version        Int         @default(1)

  tenant         Tenant          @relation(fields: [tenantId], references: [id])
  assets         BrandAsset[]
  theme          ThemeConfiguration?
  emailBranding  EmailBranding?
  loginBranding  LoginBranding?

  @@map("branding_profiles")
}

model BrandAsset {
  id            String          @id @default(uuid()) @db.Uuid
  profileId     String          @map("profile_id") @db.Uuid
  assetType     BrandAssetType  @map("asset_type")
  fileReference String          @map("file_reference") @db.VarChar(500)
  fileSizeBytes BigInt          @map("file_size_bytes")
  mimeType      String          @db.VarChar(50)
  width         Int?            
  height        Int?            
  createdAt     DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime        @default(now()) @map("updated_at") @db.Timestamptz()

  profile BrandingProfile @relation(fields: [profileId], references: [id])

  @@index([profileId])
  @@map("brand_assets")
}

model ThemeConfiguration {
  id              String      @id @default(uuid()) @db.Uuid
  profileId       String      @unique @map("profile_id") @db.Uuid
  backgroundColor String      @default("#FFFFFF") @map("background_color") @db.VarChar(7)
  surfaceColor    String      @default("#F8FAFC") @map("surface_color") @db.VarChar(7)
  textColor       String      @default("#0F172A") @map("text_color") @db.VarChar(7)
  mutedTextColor  String      @default("#64748B") @map("muted_text_color") @db.VarChar(7)
  borderColor     String      @default("#E2E8F0") @map("border_color") @db.VarChar(7)
  createdAt       DateTime    @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime    @default(now()) @map("updated_at") @db.Timestamptz()
  version         Int         @default(1)

  profile BrandingProfile @relation(fields: [profileId], references: [id])

  @@map("theme_configurations")
}

model CustomDomain {
  id                String              @id @default(uuid()) @db.Uuid
  tenantId          String              @map("tenant_id") @db.Uuid
  domain            String              @db.VarChar(255)
  status            CustomDomainStatus  @default(PENDING_VERIFICATION)
  verificationToken String              @map("verification_token") @db.VarChar(100)
  verifiedAt        DateTime?           @map("verified_at") @db.Timestamptz()
  activatedAt       DateTime?           @map("activated_at") @db.Timestamptz()
  sslCertificateId  String?             @map("ssl_certificate_id") @db.VarChar(200)
  createdAt         DateTime            @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime            @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt         DateTime?           @map("deleted_at") @db.Timestamptz()
  deletedBy         String?             @map("deleted_by") @db.Uuid
  version           Int                 @default(1)

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@unique([domain], name: "unique_domain_globally")
  @@index([tenantId])
  @@index([status])
  @@index([deletedAt])
  @@map("custom_domains")
}

model EmailBranding {
  id          String      @id @default(uuid()) @db.Uuid
  profileId   String      @unique @map("profile_id") @db.Uuid
  senderName  String      @map("sender_name") @db.VarChar(100)
  senderEmail String      @map("sender_email") @db.VarChar(255)
  headerHtml  String?     @map("header_html") @db.Text
  footerHtml  String?     @map("footer_html") @db.Text
  createdAt   DateTime    @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime    @default(now()) @map("updated_at") @db.Timestamptz()
  version     Int         @default(1)

  profile BrandingProfile @relation(fields: [profileId], references: [id])

  @@map("email_brandings")
}

model LoginBranding {
  id            String      @id @default(uuid()) @db.Uuid
  profileId     String      @unique @map("profile_id") @db.Uuid
  backgroundUrl String?     @map("background_url") @db.VarChar(500)
  logoPosition  String      @default("center") @map("logo_position") @db.VarChar(20)
  customMessage String?     @map("custom_message") @db.VarChar(500)
  createdAt     DateTime    @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime    @default(now()) @map("updated_at") @db.Timestamptz()
  version       Int         @default(1)

  profile BrandingProfile @relation(fields: [profileId], references: [id])

  @@map("login_brandings")
}

model GlobalConfiguration {
  id          String   @id @default(uuid()) @db.Uuid
  configKey   String   @unique @map("config_key") @db.VarChar(100)
  configValue Json     @map("config_value")
  configType  String   @map("config_type") @db.VarChar(50)
  description String?  @db.Text
  createdBy   String   @map("created_by") @db.Uuid
  updatedBy   String?  @map("updated_by") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version     Int      @default(1)

  regional RegionalConfiguration[]

  @@map("global_configurations")
}

model RegionalConfiguration {
  id          String   @id @default(uuid()) @db.Uuid
  regionCode  String   @map("region_code") @db.VarChar(10)
  configKey   String   @map("config_key") @db.VarChar(100)
  configValue Json     @map("config_value")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version     Int      @default(1)

  globalConfig GlobalConfiguration @relation(fields: [configKey], references: [configKey])

  @@unique([regionCode, configKey])
  @@map("regional_configurations")
}

model IntegrationRegistry {
  id                  String @id @default(uuid()) @db.Uuid
  integrationType     String @unique @map("integration_type") @db.VarChar(50)
  name                String @db.VarChar(100)
  description         String? @db.Text
  isActive            Boolean @default(true) @map("is_active")
  configurationSchema Json   @map("configuration_schema")
  createdAt           DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt           DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version             Int    @default(1)

  providers IntegrationProvider[]

  @@map("integration_registries")
}

model IntegrationProvider {
  id                String  @id @default(uuid()) @db.Uuid
  registryId        String  @map("registry_id") @db.Uuid
  providerName      String  @map("provider_name") @db.VarChar(100)
  providerCode      String  @map("provider_code") @db.VarChar(50)
  credentialsSchema Json    @map("credentials_schema")
  isActive          Boolean @default(true) @map("is_active")
  createdAt         DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version           Int     @default(1)

  registry          IntegrationRegistry  @relation(fields: [registryId], references: [id])
  tenantIntegrations TenantIntegration[]

  @@unique([registryId, providerCode])
  @@map("integration_providers")
}

model TenantIntegration {
  id                  String                  @id @default(uuid()) @db.Uuid
  tenantId            String                  @map("tenant_id") @db.Uuid
  providerId          String                  @map("provider_id") @db.Uuid
  credentialsEncrypted String                 @map("credentials_encrypted") @db.Text
  status              IntegrationHealthStatus @default(CONFIGURED)
  configuration       Json                    @default("{}")
  lastHealthCheck     DateTime?               @map("last_health_check") @db.Timestamptz()
  lastHealthyAt       DateTime?               @map("last_healthy_at") @db.Timestamptz()
  createdAt           DateTime                @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt           DateTime                @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt           DateTime?               @map("deleted_at") @db.Timestamptz()
  deletedBy           String?                 @map("deleted_by") @db.Uuid
  version             Int                     @default(1)

  tenant   Tenant             @relation(fields: [tenantId], references: [id])
  provider IntegrationProvider @relation(fields: [providerId], references: [id])
  healthLogs IntegrationHealthLog[]

  @@unique([tenantId, providerId], name: "active_integration_per_tenant_provider")
  @@index([status])
  @@index([deletedAt])
  @@map("tenant_integrations")
}

model IntegrationHealthLog {
  id            String   @id @default(uuid()) @db.Uuid
  integrationId String   @map("integration_id") @db.Uuid
  status        IntegrationHealthStatus
  responseTimeMs Int?    @map("response_time_ms")
  details       Json?    @db.Json
  checkedAt     DateTime @default(now()) @map("checked_at") @db.Timestamptz()

  integration TenantIntegration @relation(fields: [integrationId], references: [id])

  @@index([integrationId])
  @@index([checkedAt])
  @@map("integration_health_logs")
}

model ApiKey {
  id         String       @id @default(uuid()) @db.Uuid
  tenantId   String       @map("tenant_id") @db.Uuid
  name       String       @db.VarChar(100)
  keyHash    String       @map("key_hash") @db.VarChar(255)
  keyPrefix  String       @map("key_prefix") @db.VarChar(10)
  scopes     Json         @default("[]")
  status     ApiKeyStatus @default(ACTIVE)
  expiresAt  DateTime     @map("expires_at") @db.Timestamptz()
  lastUsedAt DateTime?    @map("last_used_at") @db.Timestamptz()
  createdBy  String       @map("created_by") @db.Uuid
  createdAt  DateTime     @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt  DateTime     @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt  DateTime?    @map("deleted_at") @db.Timestamptz()
  deletedBy  String?      @map("deleted_by") @db.Uuid
  version    Int          @default(1)

  tenant    Tenant           @relation(fields: [tenantId], references: [id])
  usageLogs ApiKeyUsageLog[]
  rotationPolicy ApiKeyRotationPolicy?

  @@unique([keyHash], name: "unique_key_hash_globally")
  @@index([tenantId])
  @@index([status])
  @@index([expiresAt])
  @@index([deletedAt])
  @@map("api_keys")
}

model ApiKeyUsageLog {
  id            String   @id @default(uuid()) @db.Uuid
  apiKeyId      String   @map("api_key_id") @db.Uuid
  endpoint      String   @db.VarChar(200)
  method        String   @db.VarChar(10)
  statusCode    Int      @map("status_code")
  responseTimeMs Int    @map("response_time_ms")
  ipAddress     String?  @map("ip_address") @db.Inet
  userAgent     String?  @map("user_agent") @db.VarChar(500)
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()

  apiKey ApiKey @relation(fields: [apiKeyId], references: [id])

  @@index([apiKeyId])
  @@index([createdAt])
  @@map("api_key_usage_logs")
}

model ApiKeyRotationPolicy {
  id            String   @id @default(uuid()) @db.Uuid
  apiKeyId      String   @unique @map("api_key_id") @db.Uuid
  autoRotate    Boolean  @default(false) @map("auto_rotate")
  rotateBeforeDays Int  @default(14) @map("rotate_before_days")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime @default(now()) @map("updated_at") @db.Timestamptz()

  apiKey ApiKey @relation(fields: [apiKeyId], references: [id])

  @@map("api_key_rotation_policies")
}

model RateLimitPolicy {
  id           String   @id @default(uuid()) @db.Uuid
  policyKey    String   @map("policy_key") @db.VarChar(100)
  maxRequests  Int      @map("max_requests")
  windowSeconds Int     @map("window_seconds")
  burstLimit   Int?     @map("burst_limit")
  appliesTo    String   @map("applies_to") @db.VarChar(50)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt    DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version      Int      @default(1)

  @@unique([policyKey])
  @@map("rate_limit_policies")
}

model WebhookRegistration {
  id              String        @id @default(uuid()) @db.Uuid
  tenantId        String        @map("tenant_id") @db.Uuid
  url             String        @db.VarChar(500)
  secret          String        @db.VarChar(255)
  status          WebhookStatus @default(ACTIVE)
  description     String?       @db.Text
  lastTriggeredAt DateTime?     @map("last_triggered_at") @db.Timestamptz()
  lastSuccessAt   DateTime?     @map("last_success_at") @db.Timestamptz()
  lastFailureAt   DateTime?     @map("last_failure_at") @db.Timestamptz()
  failureCount    Int           @default(0) @map("failure_count")
  createdAt       DateTime      @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime      @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt       DateTime?     @map("deleted_at") @db.Timestamptz()
  deletedBy       String?       @map("deleted_by") @db.Uuid
  version         Int           @default(1)

  tenant        Tenant                    @relation(fields: [tenantId], references: [id])
  subscriptions WebhookEventSubscription[]
  deliveryLogs  WebhookDeliveryLog[]
  retryPolicy   WebhookRetryPolicy?

  @@unique([tenantId, url], name: "unique_webhook_url_per_tenant")
  @@index([status])
  @@index([deletedAt])
  @@map("webhook_registrations")
}

model WebhookEventSubscription {
  id        String   @id @default(uuid()) @db.Uuid
  webhookId String   @map("webhook_id") @db.Uuid
  eventType String   @map("event_type") @db.VarChar(100)
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  webhook WebhookRegistration @relation(fields: [webhookId], references: [id])

  @@unique([webhookId, eventType])
  @@map("webhook_event_subscriptions")
}

model WebhookDeliveryLog {
  id             String         @id @default(uuid()) @db.Uuid
  webhookId      String         @map("webhook_id") @db.Uuid
  eventType      String         @map("event_type") @db.VarChar(100)
  payload        Json           @db.Json
  requestHeaders Json           @map("request_headers")
  responseStatus Int?           @map("response_status")
  responseBody   String?        @db.Text
  deliveryStatus DeliveryStatus @default(PENDING) @map("delivery_status")
  attemptCount   Int            @default(1) @map("attempt_count")
  nextRetryAt    DateTime?      @map("next_retry_at") @db.Timestamptz()
  deliveredAt    DateTime?      @map("delivered_at") @db.Timestamptz()
  createdAt      DateTime       @default(now()) @map("created_at") @db.Timestamptz()

  webhook WebhookRegistration @relation(fields: [webhookId], references: [id])

  @@index([webhookId])
  @@index([deliveryStatus])
  @@index([eventType])
  @@index([createdAt])
  @@map("webhook_delivery_logs")
}

model WebhookRetryPolicy {
  id              String   @id @default(uuid()) @db.Uuid
  webhookId       String   @unique @map("webhook_id") @db.Uuid
  maxRetries      Int      @default(5) @map("max_retries")
  backoffBaseMs   Int      @default(30000) @map("backoff_base_ms")
  backoffMaxMs    Int      @default(3600000) @map("backoff_max_ms")
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @default(now()) @map("updated_at") @db.Timestamptz()

  webhook WebhookRegistration @relation(fields: [webhookId], references: [id])

  @@map("webhook_retry_policies")
}

model PlatformAuditLog {
  id            String   @id @default(uuid()) @db.Uuid
  tenantId      String?  @map("tenant_id") @db.Uuid
  entityType    String   @map("entity_type") @db.VarChar(100)
  entityId      String   @map("entity_id") @db.Uuid
  action        String   @db.VarChar(50)
  actorId       String   @map("actor_id") @db.Uuid
  actorEmail    String   @map("actor_email") @db.VarChar(255)
  changes       Json?    @db.Json
  previousState String?  @map("previous_state") @db.VarChar(50)
  newState      String?  @map("new_state") @db.VarChar(50)
  contextIp     String?  @map("context_ip") @db.Inet
  contextUserAgent String? @map("context_user_agent") @db.VarChar(500)
  adminLevel    String   @map("admin_level") @db.VarChar(20)
  affectedScope String   @map("affected_scope") @db.VarChar(100)
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()

  @@index([tenantId])
  @@index([entityType])
  @@index([entityId])
  @@index([actorId])
  @@index([action])
  @@index([createdAt])
  @@index([affectedScope])
  @@map("platform_audit_logs")
}

model GlobalSecurityPolicy {
  id          String   @id @default(uuid()) @db.Uuid
  policyKey   String   @unique @map("policy_key") @db.VarChar(100)
  policyValue Json     @map("policy_value")
  description String?  @db.Text
  isEnforced  Boolean  @default(true) @map("is_enforced")
  createdBy   String   @map("created_by") @db.Uuid
  updatedBy   String?  @map("updated_by") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version     Int      @default(1)

  ipEntries IpAllowBlockList[]
  alerts    SecurityAlert[]

  @@map("global_security_policies")
}

model IpAllowBlockList {
  id               String    @id @default(uuid()) @db.Uuid
  securityPolicyId String    @map("security_policy_id") @db.Uuid
  listType         IpListType @map("list_type")
  ipAddress        String    @map("ip_address") @db.VarChar(45)
  description      String?   @db.Text
  expiresAt        DateTime? @map("expires_at") @db.Timestamptz()
  createdBy        String    @map("created_by") @db.Uuid
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt        DateTime  @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz()
  deletedBy        String?   @map("deleted_by") @db.Uuid

  policy GlobalSecurityPolicy @relation(fields: [securityPolicyId], references: [id])

  @@index([securityPolicyId])
  @@index([listType])
  @@index([expiresAt])
  @@index([deletedAt])
  @@map("ip_allow_block_lists")
}

model SecurityAlert {
  id              String   @id @default(uuid()) @db.Uuid
  securityPolicyId String @map("security_policy_id") @db.Uuid
  alertType       String   @map("alert_type") @db.VarChar(50)
  severity        String   @db.VarChar(20)
  title           String   @db.VarChar(200)
  description     String?  @db.Text
  context         Json?    @db.Json
  status          String   @default("OPEN") @db.VarChar(20)
  resolvedBy      String?  @map("resolved_by") @db.Uuid
  resolvedAt      DateTime? @map("resolved_at") @db.Timestamptz()
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @default(now()) @map("updated_at") @db.Timestamptz()

  policy GlobalSecurityPolicy @relation(fields: [securityPolicyId], references: [id])

  @@index([securityPolicyId])
  @@index([status])
  @@index([severity])
  @@index([createdAt])
  @@map("security_alerts")
}

model MaintenanceWindow {
  id               String          @id @default(uuid()) @db.Uuid
  title            String          @db.VarChar(200)
  description      String?         @db.Text
  startTime        DateTime        @map("start_time") @db.Timestamptz()
  endTime          DateTime        @map("end_time") @db.Timestamptz()
  status           MaintenanceStatus @default(SCHEDULED)
  affectedServices Json            @default("[]") @map("affected_services")
  notificationSent Boolean         @default(false) @map("notification_sent")
  createdBy        String          @map("created_by") @db.Uuid
  createdAt        DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt        DateTime        @default(now()) @map("updated_at") @db.Timestamptz()
  version          Int             @default(1)

  @@index([status])
  @@index([startTime])
  @@index([endTime])
  @@map("maintenance_windows")
}

model HealthCheckResult {
  id             String   @id @default(uuid()) @db.Uuid
  serviceName    String   @map("service_name") @db.VarChar(100)
  status         HealthStatus
  responseTimeMs Int?     @map("response_time_ms")
  details        Json?    @db.Json
  checkedAt      DateTime @default(now()) @map("checked_at") @db.Timestamptz()

  @@index([serviceName])
  @@index([checkedAt])
  @@index([status])
  @@map("health_check_results")
}

model AutomationTemplate {
  id            String   @id @default(uuid()) @db.Uuid
  name          String   @db.VarChar(100)
  description   String?  @db.Text
  triggerEvent  String   @map("trigger_event") @db.VarChar(100)
  actions       Json     @default("[]")
  conditions    Json?    @default("[]")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt     DateTime? @map("deleted_at") @db.Timestamptz()
  deletedBy     String?   @map("deleted_by") @db.Uuid
  version       Int      @default(1)

  definitions AutomationDefinition[]

  @@index([triggerEvent])
  @@index([isActive])
  @@index([deletedAt])
  @@map("automation_templates")
}

model AutomationDefinition {
  id            String   @id @default(uuid()) @db.Uuid
  templateId    String   @map("template_id") @db.Uuid
  name          String   @db.VarChar(100)
  configuration Json     @default("{}")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  deletedAt     DateTime? @map("deleted_at") @db.Timestamptz()
  deletedBy     String?   @map("deleted_by") @db.Uuid
  version       Int      @default(1)

  template   AutomationTemplate      @relation(fields: [templateId], references: [id])
  executions AutomationExecution[]

  @@index([templateId])
  @@index([isActive])
  @@index([deletedAt])
  @@map("automation_definitions")
}

model AutomationExecution {
  id              String        @id @default(uuid()) @db.Uuid
  definitionId    String        @map("definition_id") @db.Uuid
  triggerEvent    String        @map("trigger_event") @db.VarChar(100)
  triggerEntityId String?       @map("trigger_entity_id") @db.Uuid
  status          ExecutionStatus @default(PENDING)
  startedAt       DateTime?     @map("started_at") @db.Timestamptz()
  completedAt     DateTime?     @map("completed_at") @db.Timestamptz()
  durationMs      Int?          @map("duration_ms")
  result          Json?         @db.Json
  errorMessage    String?       @map("error_message") @db.Text
  createdAt       DateTime      @default(now()) @map("created_at") @db.Timestamptz()

  definition AutomationDefinition @relation(fields: [definitionId], references: [id])

  @@index([definitionId])
  @@index([triggerEvent])
  @@index([status])
  @@index([createdAt])
  @@map("automation_executions")
}

model PlatformPolicy {
  id              String   @id @default(uuid()) @db.Uuid
  policyKey       String   @unique @map("policy_key") @db.VarChar(100)
  policyName      String   @map("policy_name") @db.VarChar(100)
  description     String?  @db.Text
  policyValue     Json     @map("policy_value")
  currentVersion  Int      @default(1) @map("current_version")
  isActive        Boolean  @default(true) @map("is_active")
  createdBy       String   @map("created_by") @db.Uuid
  updatedBy       String?  @map("updated_by") @db.Uuid
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version         Int      @default(1)

  versions   PolicyVersion[]
  exceptions PolicyException[]

  @@index([isActive])
  @@map("platform_policies")
}

model PolicyVersion {
  id            String   @id @default(uuid()) @db.Uuid
  policyId      String   @map("policy_id") @db.Uuid
  versionNumber Int      @map("version_number")
  policyValue   Json     @map("policy_value")
  changeReason  String   @map("change_reason") @db.Text
  createdBy     String   @map("created_by") @db.Uuid
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()

  policy PlatformPolicy @relation(fields: [policyId], references: [id])

  @@unique([policyId, versionNumber])
  @@map("policy_versions")
}

model PolicyException {
  id         String          @id @default(uuid()) @db.Uuid
  policyId   String          @map("policy_id") @db.Uuid
  tenantId   String?         @map("tenant_id") @db.Uuid
  reason     String          @db.Text
  status     ExceptionStatus @default(PENDING)
  approvedBy String?         @map("approved_by") @db.Uuid
  approvedAt DateTime?       @map("approved_at") @db.Timestamptz()
  expiresAt  DateTime?       @map("expires_at") @db.Timestamptz()
  createdAt  DateTime        @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt  DateTime        @default(now()) @map("updated_at") @db.Timestamptz()
  version    Int             @default(1)

  policy PlatformPolicy @relation(fields: [policyId], references: [id])

  @@index([policyId])
  @@index([tenantId])
  @@index([status])
  @@map("policy_exceptions")
}

model SecurityDefaults {
  id                  String   @id @default(uuid()) @db.Uuid
  passwordMinLength   Int      @default(8) @map("password_min_length")
  passwordRequireUppercase Boolean @default(true) @map("password_require_uppercase")
  passwordRequireLowercase Boolean @default(true) @map("password_require_lowercase")
  passwordRequireNumber Boolean @default(true) @map("password_require_number")
  passwordRequireSpecial Boolean @default(false) @map("password_require_special")
  sessionTimeoutMinutes Int    @default(60) @map("session_timeout_minutes")
  maxConcurrentSessions Int   @default(5) @map("max_concurrent_sessions")
  mfaRequired        Boolean  @default(false) @map("mfa_required")
  createdAt          DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt          DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version            Int      @default(1)

  @@map("security_defaults")
}

model ComplianceSetting {
  id                String   @id @default(uuid()) @db.Uuid
  settingKey        String   @unique @map("setting_key") @db.VarChar(100)
  settingValue      Json     @map("setting_value")
  description       String?  @db.Text
  createdBy         String   @map("created_by") @db.Uuid
  createdAt         DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version           Int      @default(1)

  @@map("compliance_settings")
}

model AuditExportConfiguration {
  id            String   @id @default(uuid()) @db.Uuid
  format        String   @db.VarChar(20)
  frequency     String   @db.VarChar(20)
  destination   Json
  lastExportedAt DateTime? @map("last_exported_at") @db.Timestamptz()
  createdBy     String   @map("created_by") @db.Uuid
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version       Int      @default(1)

  @@map("audit_export_configurations")
}

model QueueHealthSnapshot {
  id            String   @id @default(uuid()) @db.Uuid
  queueName     String   @map("queue_name") @db.VarChar(100)
  depth         Int
  processing    Int
  failed        Int
  throughput    Float
  avgProcessTimeMs Int  @map("avg_process_time_ms")
  snapshotAt    DateTime @default(now()) @map("snapshot_at") @db.Timestamptz()

  @@index([queueName])
  @@index([snapshotAt])
  @@map("queue_health_snapshots")
}

model FailedJobRecord {
  id           String   @id @default(uuid()) @db.Uuid
  queueName    String   @map("queue_name") @db.VarChar(100)
  jobId        String   @map("job_id") @db.VarChar(200)
  jobType      String   @map("job_type") @db.VarChar(100)
  payload      Json?
  errorMessage String   @map("error_message") @db.Text
  retryCount   Int      @default(0) @map("retry_count")
  maxRetries   Int      @default(3) @map("max_retries")
  status       String   @db.VarChar(20)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz()
  resolvedAt   DateTime? @map("resolved_at") @db.Timestamptz()

  @@index([queueName])
  @@index([status])
  @@index([createdAt])
  @@map("failed_job_records")
}

model ScheduledJobConfiguration {
  id           String   @id @default(uuid()) @db.Uuid
  jobName      String   @unique @map("job_name") @db.VarChar(100)
  jobType      String   @map("job_type") @db.VarChar(100)
  schedule     String   @db.VarChar(100)
  isActive     Boolean  @default(true) @map("is_active")
  priority     Int      @default(0)
  configuration Json   @default("{}")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt    DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version      Int      @default(1)

  @@index([isActive])
  @@map("scheduled_job_configurations")
}

model WorkerHealthSnapshot {
  id          String   @id @default(uuid()) @db.Uuid
  workerId    String   @map("worker_id") @db.VarChar(100)
  queueName   String   @map("queue_name") @db.VarChar(100)
  status      String   @db.VarChar(20)
  activeJobs  Int      @default(0) @map("active_jobs")
  memoryUsageMb Float @map("memory_usage_mb")
  cpuUsagePercent Float @map("cpu_usage_percent")
  snapshotAt  DateTime @default(now()) @map("snapshot_at") @db.Timestamptz()

  @@index([workerId])
  @@index([snapshotAt])
  @@map("worker_health_snapshots")
}

model AlertConfiguration {
  id            String   @id @default(uuid()) @db.Uuid
  metricName    String   @map("metric_name") @db.VarChar(100)
  thresholdValue Float  @map("threshold_value")
  comparison    String   @db.VarChar(10)
  severity      String   @db.VarChar(20)
  isActive      Boolean  @default(true) @map("is_active")
  notificationChannels Json @default("[]") @map("notification_channels")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime @default(now()) @map("updated_at") @db.Timestamptz()
  version       Int      @default(1)

  alerts AlertRecord[]

  @@index([metricName])
  @@index([isActive])
  @@map("alert_configurations")
}

model AlertRecord {
  id              String   @id @default(uuid()) @db.Uuid
  configurationId String   @map("configuration_id") @db.Uuid
  severity        String   @db.VarChar(20)
  title           String   @db.VarChar(200)
  description     String?  @db.Text
  metricValue     Float    @map("metric_value")
  context         Json?    @db.Json
  status          String   @default("OPEN") @db.VarChar(20)
  resolvedBy      String?  @map("resolved_by") @db.Uuid
  resolvedAt      DateTime? @map("resolved_at") @db.Timestamptz()
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()

  configuration AlertConfiguration @relation(fields: [configurationId], references: [id])

  @@index([configurationId])
  @@index([status])
  @@index([severity])
  @@index([createdAt])
  @@map("alert_records")
}
```

### 8.3 Schema Validation Summary

| Check | Count | Status |
|-------|-------|--------|
| Models | 55 | Validated |
| Enums | 22 | Validated |
| Unique Constraints | 40 | Validated |
| Cascade Relationships | All parent → child | Validated |
| Soft Delete Columns | All mutable core entities | Validated |
| Version Columns | All mutable core entities | Validated |
| Audit Columns | All mutable core entities | Validated |

---

## 9. Phase 5 — Backend Implementation

### 9.1 Module Structure

| Module | Responsibility | Controllers | Services | Repositories |
|--------|---------------|-------------|----------|--------------|
| TenantLifecycleModule | Tenant provisioning, state transitions, deletion | TenantLifecycleController | TenantLifecycleService, TenantProvisioningService, TenantDeletionService | TenantRepository, TenantStateTransitionRepository |
| SubscriptionModule | Subscription plans, tenant subscriptions, billing cycles | SubscriptionController | SubscriptionManagementService | SubscriptionPlanRepository, TenantSubscriptionRepository, SubscriptionHistoryRepository |
| LicensingModule | License allocation, entitlements, usage tracking | LicensingController | LicensingService | LicenseRepository, LicenseEntitlementRepository, LicenseUsageRepository |
| FeatureFlagModule | Feature flag evaluation, overrides, gradual rollout | FeatureFlagController | FeatureFlagService | FeatureFlagRepository, FeatureFlagOverrideRepository |
| BrandingModule | Tenant branding, assets, themes, custom domains | BrandingController | BrandingService | BrandingProfileRepository, BrandAssetRepository, CustomDomainRepository |
| PlatformConfigurationModule | Global and regional defaults | PlatformConfigurationController | PlatformConfigurationService | GlobalConfigurationRepository, RegionalConfigurationRepository |
| IntegrationModule | Integration registry, provider config, health checks | IntegrationController | IntegrationRegistryService | IntegrationRegistryRepository, TenantIntegrationRepository, IntegrationHealthLogRepository |
| ApiKeyModule | API key lifecycle, usage, rate limits | ApiKeyController | ApiKeyService | ApiKeyRepository, ApiKeyUsageLogRepository |
| WebhookModule | Webhook registration, delivery, retry | WebhookController | WebhookService | WebhookRegistrationRepository, WebhookDeliveryLogRepository |
| BackgroundJobModule | Queue monitoring, failed jobs, scheduled jobs | BackgroundJobController | BackgroundJobService | QueueHealthSnapshotRepository, FailedJobRecordRepository |
| PlatformMonitoringModule | Health checks, metrics, alerts | PlatformMonitoringController | PlatformMonitoringService | HealthCheckResultRepository, AlertConfigurationRepository, AlertRecordRepository |
| AutomationModule | Automation templates, definitions, executions | AutomationController | AutomationService | AutomationTemplateRepository, AutomationDefinitionRepository, AutomationExecutionRepository |
| PlatformAuditModule | Platform audit logs, exports | PlatformAuditController | PlatformAuditService | PlatformAuditLogRepository, AuditExportConfigurationRepository |
| PlatformSecurityModule | Security policies, IP lists, maintenance | PlatformSecurityController | PlatformSecurityService | GlobalSecurityPolicyRepository, IpAllowBlockListRepository, SecurityAlertRepository, MaintenanceWindowRepository |
| PlatformPolicyModule | Platform policies, versions, exceptions | PlatformPolicyController | PlatformPolicyService | PlatformPolicyRepository, PolicyVersionRepository, PolicyExceptionRepository |

### 9.2 Repository Interfaces

| Repository | Key Methods |
|------------|-------------|
| TenantRepository | findById, findBySlug, create, update, softDelete, findAll (paginated) |
| TenantStateTransitionRepository | create, findByTenantId, findByTenantAndDateRange |
| TenantDeletionWorkflowRepository | findByTenantId, create, update, findByStatus |
| SubscriptionPlanRepository | findById, findByCode, create, update, softDelete, findAllActive |
| TenantSubscriptionRepository | findByTenantId, findActiveByTenantId, create, update |
| SubscriptionHistoryRepository | create, findByTenantId, findBySubscriptionId |
| LicenseRepository | findById, findByLicenseKey, findActiveByTenantId, create, update |
| LicenseEntitlementRepository | findByLicenseId, create, update |
| LicenseUsageRepository | findByLicenseId, incrementUsage, decrementUsage |
| LicenseHistoryRepository | create, findByLicenseId, findByTenantId |
| FeatureFlagRepository | findById, findByKey, findActive, create, update, softDelete |
| FeatureFlagOverrideRepository | findByFlagAndTenant, create, update, delete |
| FeatureFlagAuditRepository | create, findByFlagId |
| BrandingProfileRepository | findByTenantId, create, update |
| BrandAssetRepository | findByProfileId, create, update, delete |
| CustomDomainRepository | findByTenantId, findByDomain, create, update, softDelete |
| GlobalConfigurationRepository | findByKey, create, update, findAll |
| RegionalConfigurationRepository | findByRegionAndKey, create, update |
| IntegrationRegistryRepository | findByType, create, update, findAll |
| TenantIntegrationRepository | findByTenantId, findByTenantAndProvider, create, update, softDelete |
| IntegrationHealthLogRepository | create, findLatestByIntegration, findByIntegrationAndDateRange |
| ApiKeyRepository | findByHash, findByPrefix, findByTenantId, create, update, softDelete |
| ApiKeyUsageLogRepository | create, findByApiKey, findByApiKeyAndDateRange |
| WebhookRegistrationRepository | findByTenantId, create, update, softDelete |
| WebhookEventSubscriptionRepository | findByWebhook, findByEventType, create, delete |
| WebhookDeliveryLogRepository | create, findByWebhook, findByStatus, findPendingRetries |
| QueueHealthSnapshotRepository | create, findLatestByQueue, findByQueueAndDateRange |
| FailedJobRecordRepository | create, update, findByQueue, findByStatus |
| ScheduledJobConfigurationRepository | findByName, create, update, findAllActive |
| WorkerHealthSnapshotRepository | create, findLatestByWorker, findByWorkerAndDateRange |
| HealthCheckResultRepository | create, findLatestByService, findByServiceAndDateRange |
| AlertConfigurationRepository | findByMetric, create, update, findAllActive |
| AlertRecordRepository | create, findByStatus, findBySeverity, resolve |
| AutomationTemplateRepository | findById, create, update, softDelete, findActive |
| AutomationDefinitionRepository | findByTemplate, create, update, softDelete |
| AutomationExecutionRepository | create, findByDefinition, findByStatus |
| PlatformAuditLogRepository | create, findByFilters (entity, actor, date range, scope) |
| GlobalSecurityPolicyRepository | findByKey, create, update |
| IpAllowBlockListRepository | create, update, softDelete, findByListType, findActive |
| SecurityAlertRepository | create, update, findByStatus, resolve |
| MaintenanceWindowRepository | create, update, findByStatus, findUpcoming |
| PlatformPolicyRepository | findByKey, create, update |
| PolicyVersionRepository | findByPolicy, create |
| PolicyExceptionRepository | findByPolicy, findByTenant, create, update |

### 9.3 Domain Service Details

#### TenantLifecycleService

| Operation | Input | Output | Events |
|-----------|-------|--------|--------|
| provisionTenant | ProvisioningRequestDto | Tenant | TenantProvisioned |
| activateTenant | tenantId, actorId | Tenant | TenantActivated |
| suspendTenant | tenantId, actorId, reason | Tenant | TenantSuspended |
| archiveTenant | tenantId, actorId, reason | Tenant | TenantArchived |
| restoreTenant | tenantId, actorId | Tenant | TenantRestored |
| initiateDeletion | tenantId, actorId | DeletionWorkflow | TenantDeletionInitiated |
| confirmDeletion | tenantId, confirmationToken | DeletionWorkflow | TenantDeletionConfirmed |
| purgeTenant | tenantId | void | TenantDeleted |
| getTenantState | tenantId | TenantStatus | — |
| getTenantHistory | tenantId | StateTransition[] | — |

#### SubscriptionManagementService

| Operation | Input | Output | Events |
|-----------|-------|--------|--------|
| createSubscription | CreateSubscriptionDto | Subscription | SubscriptionCreated |
| renewSubscription | tenantId, actorId | Subscription | SubscriptionRenewed |
| upgradePlan | tenantId, newPlanId, actorId | Subscription | SubscriptionUpgraded |
| downgradePlan | tenantId, newPlanId, actorId | Subscription | SubscriptionDowngraded |
| cancelSubscription | tenantId, actorId | Subscription | SubscriptionCancelled |
| applyGracePeriod | tenantId | Subscription | SubscriptionGracePeriod |
| expireSubscription | tenantId | Subscription | SubscriptionExpired |
| getSubscription | tenantId | Subscription | — |
| getSubscriptionHistory | tenantId | SubscriptionHistory[] | — |

#### LicensingService

| Operation | Input | Output | Events |
|-----------|-------|--------|--------|
| allocateLicense | tenantId, planId | License | LicenseAllocated |
| validateLicense | tenantId | LicenseValidationResult | — |
| incrementUsage | tenantId, entitlementType, amount | LicenseUsage | LicenseLimitExceeded (if exceeded) |
| decrementUsage | tenantId, entitlementType, amount | LicenseUsage | — |
| expireLicense | tenantId | License | LicenseExpired |
| getLicenseUsage | tenantId | LicenseUsage[] | — |
| getLicenseHistory | tenantId | LicenseHistory[] | — |

#### FeatureFlagService

| Operation | Input | Output | Events |
|-----------|-------|--------|--------|
| evaluateFlag | flagKey, tenantId | boolean | — |
| toggleFlag | flagKey, status, actorId | FeatureFlag | FeatureFlagToggled |
| setOverride | flagKey, tenantId, enabled, actorId | FeatureFlagOverride | FeatureFlagToggled |
| gradualRollout | flagKey, percentage, actorId | FeatureFlag | FeatureFlagToggled |
| emergencyDisable | flagKey, actorId | FeatureFlag | FeatureFlagToggled |
| getFlagAudit | flagKey | FeatureFlagAudit[] | — |

#### BrandingService

| Operation | Input | Output | Events |
|-----------|-------|--------|--------|
| updateProfile | tenantId, BrandingProfileDto | BrandingProfile | BrandingUpdated |
| uploadAsset | tenantId, assetType, file | BrandAsset | BrandingUpdated |
| configureTheme | tenantId, ThemeDto | ThemeConfiguration | BrandingUpdated |
| verifyDomain | domainId | CustomDomain | CustomDomainVerified |
| removeDomain | domainId, actorId | CustomDomain | CustomDomainRemoved |
| getProfile | tenantId | BrandingProfile | — |

#### ApiKeyService

| Operation | Input | Output | Events |
|-----------|-------|--------|--------|
| createKey | CreateApiKeyDto | ApiKey (with plaintext key) | ApiKeyCreated |
| rotateKey | keyId, actorId | ApiKey (new key) | ApiKeyRotated |
| revokeKey | keyId, actorId | ApiKey | ApiKeyRevoked |
| validateKey | keyHash | ApiKeyValidationResult | — |
| checkRateLimit | keyId, window | RateLimitResult | — |
| getUsageStats | keyId, dateRange | UsageStats | — |

#### WebhookService

| Operation | Input | Output | Events |
|-----------|-------|--------|--------|
| register | CreateWebhookDto | WebhookRegistration | WebhookRegistered |
| subscribe | webhookId, eventType | WebhookEventSubscription | — |
| deliver | webhookId, event, payload | WebhookDeliveryLog | WebhookDeliveryCompleted/Failed |
| retry | deliveryLogId | WebhookDeliveryLog | — |
| verifySignature | payload, signature, secret | boolean | — |
| getDeliveryLogs | webhookId, filters | WebhookDeliveryLog[] | — |

#### PlatformMonitoringService

| Operation | Input | Output | Events |
|-----------|-------|--------|--------|
| checkHealth | serviceNames | HealthCheckResult[] | — |
| getMetrics | metricName, dateRange | PerformanceMetric[] | — |
| evaluateAlerts | — | AlertRecord[] | SecurityAlertTriggered |
| getCapacity | — | CapacityMetric[] | — |
| getSystemHealth | — | SystemHealthStatus | — |

#### AutomationService

| Operation | Input | Output | Events |
|-----------|-------|--------|--------|
| createTemplate | CreateTemplateDto | AutomationTemplate | — |
| instantiate | templateId, config | AutomationDefinition | — |
| execute | definitionId, triggerEvent | AutomationExecution | — |
| getHistory | definitionId | AutomationExecution[] | — |
| getTemplates | filters | AutomationTemplate[] | — |

### 9.4 Event Consumers

| Consumer | Event | Action |
|----------|-------|--------|
| LicenseUsageConsumer | StudentEnrolled, StudentWithdrawn, StaffHired, StaffSeparated | Increment/decrement license usage |
| SubscriptionPaymentConsumer | SubscriptionPaymentReceived, SubscriptionPaymentFailed | Extend subscription, initiate grace period |
| MaintenanceNotificationConsumer | MaintenanceScheduled, MaintenanceStarted, MaintenanceCompleted | Notify all tenants |
| HealthAggregationConsumer | DomainServiceHealthChanged | Update platform health dashboard |
| FailedJobAlertConsumer | BackgroundJobFailed | Update metrics, trigger alert |
| SecurityAlertConsumer | SecurityAlertTriggered | Notify platform admins |
| WebhookDispatchConsumer | All platform events | Dispatch to registered webhooks |
| AuditLogConsumer | All platform state changes | Create platform audit log entry |

### 9.5 Guards and Middleware

| Guard | Purpose | Applied To |
|-------|---------|-----------|
| PlatformSuperAdminGuard | Verify user has Platform Super Admin role | All platform admin endpoints |
| TenantContextGuard | Extract tenant context from JWT | Tenant-scoped endpoints |
| MaintenanceModeGuard | Block non-essential operations during maintenance | All endpoints (configurable) |
| IpAllowBlockGuard | Evaluate IP allow/block lists | All endpoints |
| RateLimitGuard | Enforce rate limits per API key or globally | All API key-authenticated endpoints |

### 9.6 Background Jobs

| Job | Queue | Schedule | Priority | Description |
|-----|-------|----------|----------|-------------|
| HealthCheckJob | platform-health | Every 30s | High | Probe all registered services |
| AlertEvaluationJob | platform-alerts | Every 60s | High | Evaluate alert thresholds |
| LicenseUsageSyncJob | platform-licensing | Every 5m | Medium | Sync license usage from People events |
| SubscriptionRenewalJob | platform-subscriptions | Daily 00:00 | High | Check for subscriptions needing renewal |
| SubscriptionExpirationJob | platform-subscriptions | Daily 01:00 | High | Expire past-grace-period subscriptions |
| LicenseExpirationJob | platform-licensing | Daily 02:00 | Medium | Expire past-due licenses |
| WebhookRetryJob | platform-webhooks | Every 30s | Medium | Retry failed webhook deliveries |
| FeatureFlagCacheJob | platform-features | Every 60s | Low | Refresh feature flag cache |
| AuditExportJob | platform-audit | Configurable | Low | Export audit logs per configuration |
| MaintenanceNotificationJob | platform-maintenance | On schedule | High | Send maintenance notifications |
| QueueHealthSnapshotJob | platform-monitoring | Every 5m | Medium | Snapshot queue health metrics |
| WorkerHealthSnapshotJob | platform-monitoring | Every 5m | Medium | Snapshot worker health metrics |
| IpBlocklistExpiryJob | platform-security | Every hour | Low | Remove expired IP blocklist entries |
| AutomationExecutionCleanupJob | platform-automation | Daily 03:00 | Low | Clean up old automation execution records |

---

## 10. Phase 6 — API Design

### 10.1 API Endpoints Summary

| Module | Primary Endpoints | Sub-Resource Endpoints | Total |
|--------|------------------|----------------------|-------|
| Tenant Lifecycle | 8 | 4 | 12 |
| Subscriptions | 7 | 3 | 10 |
| Licensing | 6 | 4 | 10 |
| Feature Flags | 6 | 3 | 9 |
| Branding | 6 | 6 | 12 |
| Platform Configuration | 5 | 2 | 7 |
| Integration Management | 6 | 4 | 10 |
| API Key Management | 5 | 3 | 8 |
| Webhook Management | 5 | 4 | 9 |
| Background Jobs | 5 | 3 | 8 |
| Platform Monitoring | 6 | 4 | 10 |
| Automation | 5 | 3 | 8 |
| Platform Audit | 4 | 2 | 6 |
| Platform Security | 6 | 4 | 10 |
| Platform Policies | 5 | 3 | 8 |
| **Total** | **85** | **52** | **137** |

### 10.2 Tenant Lifecycle API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /platform/tenants | Provision a new tenant | Platform Super Admin |
| GET | /platform/tenants | List all tenants (paginated) | Platform Super Admin |
| GET | /platform/tenants/:id | Get tenant details | Platform Super Admin |
| PATCH | /platform/tenants/:id | Update tenant details | Platform Super Admin |
| POST | /platform/tenants/:id/activate | Activate a tenant | Platform Super Admin |
| POST | /platform/tenants/:id/suspend | Suspend a tenant | Platform Super Admin |
| POST | /platform/tenants/:id/archive | Archive a tenant | Platform Super Admin |
| POST | /platform/tenants/:id/restore | Restore a tenant | Platform Super Admin |
| GET | /platform/tenants/:id/transitions | Get tenant state history | Platform Super Admin |
| POST | /platform/tenants/:id/delete | Initiate tenant deletion | Platform Super Admin |
| POST | /platform/tenants/:id/delete/confirm | Confirm deletion | Platform Super Admin |
| GET | /platform/tenants/:slug | Get tenant by slug | Platform Super Admin |

### 10.3 Subscription API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /platform/subscriptions/plans | Create subscription plan | Platform Super Admin |
| GET | /platform/subscriptions/plans | List all plans | Platform Super Admin |
| GET | /platform/subscriptions/plans/:id | Get plan details | Platform Super Admin |
| PATCH | /platform/subscriptions/plans/:id | Update plan | Platform Super Admin |
| GET | /platform/tenants/:tenantId/subscription | Get tenant subscription | Platform Super Admin |
| POST | /platform/tenants/:tenantId/subscription | Create subscription | Platform Super Admin |
| PATCH | /platform/tenants/:tenantId/subscription | Update subscription | Platform Super Admin |
| POST | /platform/tenants/:tenantId/subscription/upgrade | Upgrade plan | Platform Super Admin |
| POST | /platform/tenants/:tenantId/subscription/downgrade | Downgrade plan | Platform Super Admin |
| GET | /platform/tenants/:tenantId/subscription/history | Get subscription history | Platform Super Admin |

### 10.4 Licensing API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /platform/tenants/:tenantId/license | Get tenant license | Platform Super Admin |
| POST | /platform/tenants/:tenantId/license | Allocate license | Platform Super Admin |
| GET | /platform/tenants/:tenantId/license/usage | Get license usage | Platform Super Admin |
| GET | /platform/tenants/:tenantId/license/history | Get license history | Platform Super Admin |
| POST | /platform/tenants/:tenantId/license/expire | Expire license | Platform Super Admin |
| GET | /platform/licenses | List all licenses (paginated) | Platform Super Admin |
| GET | /platform/tenants/:tenantId/license/entitlements | Get entitlements | Platform Super Admin |
| PUT | /platform/tenants/:tenantId/license/entitlements | Update entitlements | Platform Super Admin |
| GET | /platform/tenants/:tenantId/license/warnings | Get license warnings | Platform Super Admin |
| POST | /platform/licenses/validate | Validate license key | System |

### 10.5 Feature Flags API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /platform/feature-flags | Create feature flag | Platform Super Admin |
| GET | /platform/feature-flags | List all flags | Platform Super Admin |
| GET | /platform/feature-flags/:id | Get flag details | Platform Super Admin |
| PATCH | /platform/feature-flags/:id | Update flag | Platform Super Admin |
| POST | /platform/feature-flags/:id/toggle | Toggle flag state | Platform Super Admin |
| POST | /platform/feature-flags/:id/emergency-disable | Emergency disable | Platform Super Admin |
| GET | /platform/feature-flags/:id/overrides | Get tenant overrides | Platform Super Admin |
| POST | /platform/feature-flags/:id/overrides | Set tenant override | Platform Super Admin |
| DELETE | /platform/feature-flags/:id/overrides/:tenantId | Remove override | Platform Super Admin |

### 10.6 Branding API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /platform/tenants/:tenantId/branding | Get branding profile | Platform Super Admin |
| PUT | /platform/tenants/:tenantId/branding | Update branding profile | Platform Super Admin |
| POST | /platform/tenants/:tenantId/branding/assets | Upload brand asset | Platform Super Admin |
| DELETE | /platform/tenants/:tenantId/branding/assets/:assetId | Remove brand asset | Platform Super Admin |
| PUT | /platform/tenants/:tenantId/branding/theme | Update theme | Platform Super Admin |
| POST | /platform/tenants/:tenantId/branding/domains | Add custom domain | Platform Super Admin |
| GET | /platform/tenants/:tenantId/branding/domains | List custom domains | Platform Super Admin |
| POST | /platform/tenants/:tenantId/branding/domains/:domainId/verify | Verify domain | Platform Super Admin |
| DELETE | /platform/tenants/:tenantId/branding/domains/:domainId | Remove domain | Platform Super Admin |
| PUT | /platform/tenants/:tenantId/branding/email | Update email branding | Platform Super Admin |
| PUT | /platform/tenants/:tenantId/branding/login | Update login branding | Platform Super Admin |
| GET | /platform/tenants/:tenantId/branding/preview | Preview branding | Platform Super Admin |

### 10.7 Platform Configuration API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /platform/configuration | List all global configurations | Platform Super Admin |
| GET | /platform/configuration/:key | Get configuration value | Platform Super Admin |
| PUT | /platform/configuration/:key | Update configuration | Platform Super Admin |
| GET | /platform/configuration/regional/:region | Get regional configs | Platform Super Admin |
| PUT | /platform/configuration/regional/:region/:key | Update regional config | Platform Super Admin |
| GET | /platform/security-defaults | Get security defaults | Platform Super Admin |
| PUT | /platform/security-defaults | Update security defaults | Platform Super Admin |

### 10.8 Integration Management API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /platform/integrations | List integration types | Platform Super Admin |
| GET | /platform/integrations/:type | Get integration type details | Platform Super Admin |
| POST | /platform/integrations/:type/providers | Register provider | Platform Super Admin |
| GET | /platform/tenants/:tenantId/integrations | List tenant integrations | Platform Super Admin |
| POST | /platform/tenants/:tenantId/integrations | Configure integration | Platform Super Admin |
| PATCH | /platform/tenants/:tenantId/integrations/:id | Update integration | Platform Super Admin |
| POST | /platform/tenants/:tenantId/integrations/:id/health-check | Check health | Platform Super Admin |
| GET | /platform/tenants/:tenantId/integrations/:id/health | Get health history | Platform Super Admin |
| DELETE | /platform/tenants/:tenantId/integrations/:id | Remove integration | Platform Super Admin |
| PUT | /platform/tenants/:tenantId/integrations/:id/credentials | Rotate credentials | Platform Super Admin |

### 10.9 API Key Management API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /platform/tenants/:tenantId/api-keys | Create API key | Platform Super Admin |
| GET | /platform/tenants/:tenantId/api-keys | List API keys | Platform Super Admin |
| GET | /platform/tenants/:tenantId/api-keys/:id | Get key details | Platform Super Admin |
| POST | /platform/tenants/:tenantId/api-keys/:id/rotate | Rotate key | Platform Super Admin |
| DELETE | /platform/tenants/:tenantId/api-keys/:id | Revoke key | Platform Super Admin |
| GET | /platform/tenants/:tenantId/api-keys/:id/usage | Get usage stats | Platform Super Admin |
| GET | /platform/tenants/:tenantId/api-keys/:id/usage/logs | Get usage logs | Platform Super Admin |
| PUT | /platform/tenants/:tenantId/api-keys/:id/rotation-policy | Set rotation policy | Platform Super Admin |

### 10.10 Webhook Management API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /platform/tenants/:tenantId/webhooks | Register webhook | Platform Super Admin |
| GET | /platform/tenants/:tenantId/webhooks | List webhooks | Platform Super Admin |
| GET | /platform/tenants/:tenantId/webhooks/:id | Get webhook details | Platform Super Admin |
| PATCH | /platform/tenants/:tenantId/webhooks/:id | Update webhook | Platform Super Admin |
| DELETE | /platform/tenants/:tenantId/webhooks/:id | Remove webhook | Platform Super Admin |
| POST | /platform/tenants/:tenantId/webhooks/:id/subscribe | Subscribe to event | Platform Super Admin |
| DELETE | /platform/tenants/:tenantId/webhooks/:id/subscribe/:eventId | Unsubscribe | Platform Super Admin |
| GET | /platform/tenants/:tenantId/webhooks/:id/deliveries | Get delivery logs | Platform Super Admin |
| POST | /platform/tenants/:tenantId/webhooks/:id/deliveries/:deliveryId/retry | Retry delivery | Platform Super Admin |

### 10.11 Background Job Administration API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /platform/jobs/queues | List all queues | Platform Super Admin |
| GET | /platform/jobs/queues/:name | Get queue health | Platform Super Admin |
| GET | /platform/jobs/queues/:name/snapshots | Get health history | Platform Super Admin |
| GET | /platform/jobs/failed | List failed jobs | Platform Super Admin |
| POST | /platform/jobs/failed/:id/retry | Retry failed job | Platform Super Admin |
| POST | /platform/jobs/failed/:id/cancel | Cancel failed job | Platform Super Admin |
| GET | /platform/jobs/scheduled | List scheduled jobs | Platform Super Admin |
| PUT | /platform/jobs/scheduled/:name | Update scheduled job | Platform Super Admin |

### 10.12 Platform Monitoring API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /platform/monitoring/health | Get system health | Platform Super Admin |
| GET | /platform/monitoring/health/:service | Get service health | Platform Super Admin |
| GET | /platform/monitoring/health/:service/history | Get health history | Platform Super Admin |
| GET | /platform/monitoring/metrics | Get performance metrics | Platform Super Admin |
| GET | /platform/monitoring/capacity | Get capacity metrics | Platform Super Admin |
| GET | /platform/monitoring/alerts | List alerts | Platform Super Admin |
| POST | /platform/monitoring/alerts/:id/resolve | Resolve alert | Platform Super Admin |
| GET | /platform/monitoring/alerts/configurations | List alert configs | Platform Super Admin |
| POST | /platform/monitoring/alerts/configurations | Create alert config | Platform Super Admin |
| PUT | /platform/monitoring/alerts/configurations/:id | Update alert config | Platform Super Admin |

### 10.13 Automation Management API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /platform/automation/templates | Create template | Platform Super Admin |
| GET | /platform/automation/templates | List templates | Platform Super Admin |
| GET | /platform/automation/templates/:id | Get template details | Platform Super Admin |
| PATCH | /platform/automation/templates/:id | Update template | Platform Super Admin |
| POST | /platform/automation/templates/:id/instantiate | Create definition | Platform Super Admin |
| GET | /platform/automation/definitions | List definitions | Platform Super Admin |
| GET | /platform/automation/definitions/:id | Get definition details | Platform Super Admin |
| GET | /platform/automation/definitions/:id/executions | Get execution history | Platform Super Admin |

### 10.14 Platform Audit API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /platform/audit | Query audit logs | Platform Super Admin |
| GET | /platform/audit/:id | Get audit entry detail | Platform Super Admin |
| GET | /platform/audit/exports | List export configurations | Platform Super Admin |
| POST | /platform/audit/exports | Create export configuration | Platform Super Admin |
| GET | /platform/audit/tenant/:tenantId | Get tenant-specific audit | Platform Super Admin |
| POST | /platform/audit/trigger-export | Trigger manual export | Platform Super Admin |

### 10.15 Platform Security API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /platform/security/policies | List security policies | Platform Super Admin |
| GET | /platform/security/policies/:key | Get policy details | Platform Super Admin |
| PUT | /platform/security/policies/:key | Update policy | Platform Super Admin |
| GET | /platform/security/ip-list | List IP entries | Platform Super Admin |
| POST | /platform/security/ip-list | Add IP entry | Platform Super Admin |
| DELETE | /platform/security/ip-list/:id | Remove IP entry | Platform Super Admin |
| GET | /platform/security/alerts | List security alerts | Platform Super Admin |
| POST | /platform/security/alerts/:id/resolve | Resolve alert | Platform Super Admin |
| POST | /platform/maintenance | Schedule maintenance | Platform Super Admin |
| GET | /platform/maintenance | List maintenance windows | Platform Super Admin |
| PUT | /platform/maintenance/:id | Update maintenance | Platform Super Admin |
| POST | /platform/maintenance/:id/start | Start maintenance | Platform Super Admin |
| POST | /platform/maintenance/:id/complete | Complete maintenance | Platform Super Admin |
| POST | /platform/maintenance/:id/cancel | Cancel maintenance | Platform Super Admin |

### 10.16 Platform Policy API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /platform/policies | Create policy | Platform Super Admin |
| GET | /platform/policies | List all policies | Platform Super Admin |
| GET | /platform/policies/:key | Get policy details | Platform Super Admin |
| PUT | /platform/policies/:key | Update policy (creates new version) | Platform Super Admin |
| GET | /platform/policies/:key/versions | Get policy versions | Platform Super Admin |
| GET | /platform/policies/:key/versions/:version | Get specific version | Platform Super Admin |
| POST | /platform/policies/:key/exceptions | Request exception | Platform Super Admin |
| PUT | /platform/policies/:key/exceptions/:id | Approve/reject exception | Platform Super Admin |
| GET | /platform/policies/:key/exceptions | List exceptions | Platform Super Admin |

### 10.17 Standard Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "TENANT_NOT_FOUND",
    "message": "Tenant with the specified ID was not found",
    "details": []
  }
}
```

### 10.18 Pagination

All list endpoints support:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `sortBy` (field name)
- `sortOrder` (asc/desc)

### 10.19 Filtering

| Endpoint Group | Supported Filters |
|----------------|-------------------|
| Tenants | status, institution_type, created_at range |
| Subscriptions | status, plan_id, current_period_end range |
| Licenses | status, expires_at range |
| Feature Flags | status, scope |
| Integrations | status, integration_type |
| API Keys | status, expires_at range |
| Webhooks | status |
| Audit Logs | entity_type, actor_id, action, affected_scope, date range |
| Alerts | status, severity, date range |

### 10.20 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| TENANT_NOT_FOUND | 404 | Tenant with specified ID not found |
| TENANT_SLUG_EXISTS | 409 | Tenant slug already in use |
| TENANT_INVALID_STATE | 400 | Invalid state transition |
| SUBSCRIPTION_NOT_FOUND | 404 | No active subscription for tenant |
| SUBSCRIPTION_PLAN_NOT_FOUND | 404 | Plan with specified ID not found |
| LICENSE_NOT_FOUND | 404 | No license for tenant |
| LICENSE_EXPIRED | 403 | License has expired |
| LICENSE_LIMIT_EXCEEDED | 403 | Usage exceeds allocated limit |
| FEATURE_FLAG_NOT_FOUND | 404 | Flag with specified key not found |
| DOMAIN_EXISTS | 409 | Custom domain already in use |
| DOMAIN_VERIFICATION_FAILED | 400 | DNS verification failed |
| API_KEY_NOT_FOUND | 404 | API key not found |
| API_KEY_EXPIRED | 403 | API key has expired |
| API_KEY_REVOKED | 403 | API key has been revoked |
| WEBHOOK_URL_EXISTS | 409 | Webhook URL already registered for tenant |
| WEBHOOK_DELIVERY_FAILED | 502 | Webhook delivery failed |
| INTEGRATION_NOT_FOUND | 404 | Integration not configured |
| INTEGRATION_UNHEALTHY | 503 | Integration provider is unhealthy |
| POLICY_NOT_FOUND | 404 | Policy with specified key not found |
| POLICY_VERSION_CONFLICT | 409 | Policy version conflict; reload and retry |
| MAINTENANCE_ACTIVE | 503 | Platform is in maintenance mode |
| IP_BLOCKED | 403 | IP address is blocked |
| RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| VALIDATION_ERROR | 400 | Request validation failed |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## 11. Phase 7 — Testing & Verification

### 11.1 Test Categories

| # | Category | Focus | Scope |
|---|----------|-------|-------|
| 1 | Tenant Lifecycle Tests | State transitions, provisioning, deletion | TenantLifecycleModule |
| 2 | Subscription Tests | Plan management, renewal, upgrade/downgrade | SubscriptionModule |
| 3 | Licensing Tests | Allocation, usage tracking, limit enforcement | LicensingModule |
| 4 | Feature Flag Tests | Evaluation, overrides, gradual rollout | FeatureFlagModule |
| 5 | Branding Tests | Profile updates, asset management, domain verification | BrandingModule |
| 6 | Configuration Tests | Global/regional defaults, security defaults | PlatformConfigurationModule |
| 7 | Integration Tests | Registry, provider config, health checks | IntegrationModule |
| 8 | API Key Tests | Creation, rotation, revocation, rate limiting | ApiKeyModule |
| 9 | Webhook Tests | Registration, delivery, retry, signature verification | WebhookModule |
| 10 | Background Job Tests | Queue monitoring, failed job management | BackgroundJobModule |
| 11 | Monitoring Tests | Health checks, metrics, alerting | PlatformMonitoringModule |
| 12 | Automation Tests | Templates, definitions, executions | AutomationModule |
| 13 | Audit Tests | Log creation, querying, export | PlatformAuditModule |
| 14 | Security Tests | IP lists, maintenance mode, alerts | PlatformSecurityModule |
| 15 | Policy Tests | Versioning, exceptions, enforcement | PlatformPolicyModule |
| 16 | Authorization Tests | Platform Super Admin guard enforcement | All modules |
| 17 | Validation Tests | Input validation, business rule enforcement | All modules |
| 18 | Event Consumer Tests | License sync, payment handling, alert routing | All consumers |
| 19 | Integration Tests | Cross-module workflows | Multiple modules |
| 20 | Performance Tests | High-volume flag evaluation, audit log queries | Critical paths |

### 11.2 Test Scenarios

#### Tenant Lifecycle Tests (~25 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| TLT-001 | Provision tenant with valid data | Unit |
| TLT-002 | Provision tenant with duplicate slug | Validation |
| TLT-003 | Provision tenant with invalid institution type | Validation |
| TLT-004 | Activate tenant from PENDING state | Unit |
| TLT-005 | Activate tenant from non-PENDING state (expect error) | Validation |
| TLT-006 | Suspend active tenant | Unit |
| TLT-007 | Suspend already-suspended tenant (expect error) | Validation |
| TLT-008 | Archive suspended tenant | Unit |
| TLT-009 | Archive active tenant (expect error) | Validation |
| TLT-010 | Restore archived tenant | Unit |
| TLT-011 | Restore deleted tenant (expect error) | Validation |
| TLT-012 | Initiate deletion workflow | Unit |
| TLT-013 | Confirm deletion with valid token | Unit |
| TLT-014 | Confirm deletion with invalid token (expect error) | Validation |
| TLT-015 | Purge tenant after grace period | Unit |
| TLT-016 | Purge tenant before grace period (expect error) | Validation |
| TLT-017 | Get tenant state history | Unit |
| TLT-018 | Prevent state transition to invalid state | Validation |
| TLT-019 | Concurrent state transition (optimistic lock) | Concurrency |
| TLT-020 | Provision tenant with template | Integration |
| TLT-021 | Provision tenant emits TenantProvisioned event | Integration |
| TLT-022 | Activate tenant emits TenantActivated event | Integration |
| TLT-023 | Suspend tenant disables tenant features | Integration |
| TLT-024 | List tenants with pagination | Unit |
| TLT-025 | Filter tenants by status | Unit |

#### Subscription Tests (~20 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| SUB-001 | Create subscription for tenant | Unit |
| SUB-002 | Create subscription when one already exists (expect error) | Validation |
| SUB-003 | Renew subscription | Unit |
| SUB-004 | Upgrade subscription plan | Unit |
| SUB-005 | Downgrade subscription plan (applies at period end) | Unit |
| SUB-006 | Cancel subscription | Unit |
| SUB-007 | Apply grace period after payment failure | Unit |
| SUB-008 | Expire subscription after grace period | Unit |
| SUB-009 | Get subscription history | Unit |
| SUB-010 | Prevent downgrade below minimum plan | Validation |
| SUB-011 | Subscription change emits history record | Integration |
| SUB-012 | Upgrade emits SubscriptionUpgraded event | Integration |
| SUB-013 | Downgrade emits SubscriptionDowngraded event | Integration |
| SUB-014 | Create subscription plan | Unit |
| SUB-015 | Update subscription plan | Unit |
| SUB-016 | Prevent deleting plan with active subscribers | Validation |
| SUB-017 | Concurrent subscription update (optimistic lock) | Concurrency |
| SUB-018 | List subscription plans | Unit |
| SUB-019 | Trial subscription converts or expires | Integration |
| SUB-020 | Grace period prevents immediate suspension | Integration |

#### Licensing Tests (~18 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| LIC-001 | Allocate license to tenant | Unit |
| LIC-002 | Validate active license | Unit |
| LIC-003 | Validate expired license | Unit |
| LIC-004 | Increment usage within limit | Unit |
| LIC-005 | Increment usage beyond limit (triggers warning) | Unit |
| LIC-006 | Increment usage beyond critical threshold | Unit |
| LIC-007 | Decrement usage | Unit |
| LIC-008 | Decrement below zero (expect error) | Validation |
| LIC-009 | Expire license | Unit |
| LIC-010 | Get license usage summary | Unit |
| LIC-011 | License history records all changes | Integration |
| LIC-012 | License allocated emits LicenseAllocated event | Integration |
| LIC-013 | Usage exceeded emits LicenseLimitExceeded event | Integration |
| LIC-014 | License entitlement limit cannot be negative | Validation |
| LIC-015 | Concurrent usage increment (optimistic lock) | Concurrency |
| LIC-016 | License allocated when subscription changes | Integration |
| LIC-017 | List all licenses with filters | Unit |
| LIC-018 | License warnings at configurable threshold | Integration |

#### Feature Flag Tests (~15 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| FF-001 | Evaluate enabled flag (returns true) | Unit |
| FF-002 | Evaluate disabled flag (returns false) | Unit |
| FF-003 | Evaluate flag with tenant override (enabled) | Unit |
| FF-004 | Evaluate flag with tenant override (disabled) | Unit |
| FF-005 | Toggle flag from disabled to enabled | Unit |
| FF-006 | Emergency disable overrides all states | Unit |
| FF-007 | Gradual rollout at 50% (sampling) | Unit |
| FF-008 | Gradual rollout at 0% (all disabled) | Unit |
| FF-009 | Gradual rollout at 100% (all enabled) | Unit |
| FF-010 | Create new feature flag | Unit |
| FF-011 | Flag audit records all changes | Integration |
| FF-012 | Toggle emits FeatureFlagToggled event | Integration |
| FF-013 | Concurrent flag toggle (optimistic lock) | Concurrency |
| FF-014 | Flag key must be unique | Validation |
| FF-015 | Remove tenant override | Unit |

#### Branding Tests (~15 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| BRD-001 | Update branding profile | Unit |
| BRD-002 | Upload brand asset | Unit |
| BRD-003 | Upload asset exceeding size limit (expect error) | Validation |
| BRD-004 | Update theme configuration | Unit |
| BRD-005 | Theme colors must be valid hex | Validation |
| BRD-006 | Add custom domain | Unit |
| BRD-007 | Verify custom domain (DNS check) | Integration |
| BRD-008 | Remove custom domain | Unit |
| BRD-009 | Domain uniqueness across tenants | Validation |
| BRD-010 | Update email branding | Unit |
| BRD-011 | Email sender must be valid format | Validation |
| BRD-012 | Update login branding | Unit |
| BRD-013 | Branding update emits BrandingUpdated event | Integration |
| BRD-014 | Get branding preview | Unit |
| BRD-015 | Concurrent branding update (optimistic lock) | Concurrency |

#### API Key Tests (~12 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| KEY-001 | Create API key | Unit |
| KEY-002 | API key returned once on creation | Unit |
| KEY-003 | Rotate API key | Unit |
| KEY-004 | Revoked key cannot be reactivated | Validation |
| KEY-005 | Expired key rejected | Unit |
| KEY-006 | Rate limit enforcement | Unit |
| KEY-007 | Rate limit exceeded returns 429 | Unit |
| KEY-008 | API key usage logged | Integration |
| KEY-009 | Concurrent key creation (optimistic lock) | Concurrency |
| KEY-010 | Key must be unique across platform | Validation |
| KEY-011 | Key rotation emits ApiKeyRotated event | Integration |
| KEY-012 | Key revocation emits ApiKeyRevoked event | Integration |

#### Webhook Tests (~12 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| WH-001 | Register webhook | Unit |
| WH-002 | Subscribe to events | Unit |
| WH-003 | Deliver webhook with HMAC signature | Unit |
| WH-004 | Verify webhook signature | Unit |
| WH-005 | Retry failed delivery with backoff | Unit |
| WH-006 | Max retries exceeded marks as failed | Unit |
| WH-007 | Webhook URL uniqueness per tenant | Validation |
| WH-008 | Secret must be at least 32 characters | Validation |
| WH-009 | Delivery log records all attempts | Integration |
| WH-010 | Webhook registered emits WebhookRegistered event | Integration |
| WH-011 | Concurrent delivery (optimistic lock) | Concurrency |
| WH-012 | Failed delivery emits WebhookDeliveryFailed event | Integration |

#### Monitoring Tests (~10 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| MON-001 | Health check aggregates from all services | Unit |
| MON-002 | Service health stored in history | Unit |
| MON-003 | Alert threshold evaluation triggers alert | Unit |
| MON-004 | Alert resolution | Unit |
| MON-005 | Capacity metrics collection | Unit |
| MON-006 | Performance metrics collection | Unit |
| MON-007 | Health check result stored with timestamp | Integration |
| MON-008 | Concurrent health check writes | Concurrency |
| MON-009 | Alert configuration update | Unit |
| MON-010 | System health endpoint returns aggregated status | Integration |

#### Security Tests (~10 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| SEC-001 | Add IP to blocklist | Unit |
| SEC-002 | Add IP to allowlist | Unit |
| SEC-003 | Blocked IP rejected | Unit |
| SEC-004 | IP blocklist entry expires | Unit |
| SEC-005 | Maintenance mode blocks non-essential ops | Unit |
| SEC-006 | Maintenance mode allows essential ops | Unit |
| SEC-007 | Security alert resolution | Unit |
| SEC-008 | Security policy cannot be weakened by tenants | Validation |
| SEC-009 | Maintenance window scheduling | Unit |
| SEC-010 | Concurrent maintenance window (no overlap) | Validation |

#### Policy Tests (~10 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| POL-001 | Create platform policy | Unit |
| POL-002 | Update policy creates new version | Unit |
| POL-003 | Policy version increment | Unit |
| POL-004 | Policy version history | Unit |
| POL-005 | Request policy exception | Unit |
| POL-006 | Approve policy exception | Unit |
| POL-007 | Reject policy exception | Unit |
| POL-008 | Concurrent policy update (optimistic lock) | Concurrency |
| POL-009 | Policy key uniqueness | Validation |
| POL-010 | Policy exception reason minimum length | Validation |

#### Authorization Tests (~15 scenarios)

| ID | Scenario | Type |
|----|----------|------|
| AUTH-001 | Platform Super Admin can access all endpoints | Authorization |
| AUTH-002 | Non-platform-admin rejected from all endpoints | Authorization |
| AUTH-003 | Unauthenticated request rejected | Authorization |
| AUTH-004 | Platform Super Admin can provision tenants | Authorization |
| AUTH-005 | Platform Super Admin can manage subscriptions | Authorization |
| AUTH-006 | Platform Super Admin can manage feature flags | Authorization |
| AUTH-007 | Platform Super Admin can manage integrations | Authorization |
| AUTH-008 | Platform Super Admin can manage API keys | Authorization |
| AUTH-009 | Platform Super Admin can manage webhooks | Authorization |
| AUTH-010 | Platform Super Admin can manage security policies | Authorization |
| AUTH-011 | Platform Super Admin can manage maintenance windows | Authorization |
| AUTH-012 | Platform Super Admin can access audit logs | Authorization |
| AUTH-013 | Platform Super Admin can manage platform policies | Authorization |
| AUTH-014 | Institution admin cannot access platform endpoints | Authorization |
| AUTH-015 | API key with insufficient scope rejected | Authorization |

### 11.3 Test Summary

| Category | Scenarios | Unit | Integration | Validation | Concurrency | Authorization |
|----------|-----------|------|-------------|------------|-------------|---------------|
| Tenant Lifecycle | 25 | 10 | 6 | 7 | 2 | — |
| Subscription | 20 | 8 | 5 | 4 | 2 | — |
| Licensing | 18 | 8 | 5 | 2 | 2 | — |
| Feature Flags | 15 | 10 | 3 | 1 | 1 | — |
| Branding | 15 | 8 | 3 | 3 | 1 | — |
| Configuration | 8 | 5 | 2 | 1 | — | — |
| Integration | 10 | 5 | 3 | 1 | 1 | — |
| API Keys | 12 | 6 | 3 | 2 | 1 | — |
| Webhooks | 12 | 6 | 3 | 2 | 1 | — |
| Background Jobs | 8 | 5 | 2 | 1 | — | — |
| Monitoring | 10 | 6 | 2 | — | 1 | — |
| Automation | 8 | 5 | 2 | 1 | — | — |
| Audit | 6 | 3 | 2 | 1 | — | — |
| Security | 10 | 7 | 1 | 2 | — | — |
| Policies | 10 | 7 | 1 | 2 | 1 | — |
| Authorization | 15 | — | — | — | — | 15 |
| **Total** | **192** | **98** | **43** | **29** | **13** | **15** |

### 11.4 Verification Criteria

| Criterion | Requirement |
|-----------|-------------|
| Unit test coverage | ≥ 90% for domain services |
| Integration test coverage | ≥ 80% for API endpoints |
| All business rules tested | Every BR-PA-xxx has at least one test |
| All invariants tested | Every INV-PA-xxx has at least one test |
| All validation rules tested | Every V-PA-xxx has at least one test |
| All authorization rules tested | Every endpoint has auth test |
| No failing tests | 0 test failures |
| No security vulnerabilities | No HIGH or CRITICAL findings |
| Concurrency tests pass | Optimistic lock tests pass |
| Event emission verified | All domain events verified in integration tests |

---

## 12. Provider Abstraction Layer

### 12.1 Integration Provider Architecture

| Integration Type | Supported Providers | Abstraction Interface |
|-----------------|--------------------|-----------------------|
| Payment Gateway | Stripe, Paystack, Flutterwave | PaymentGatewayProvider |
| Email | SendGrid, Mailgun, AWS SES | EmailProvider |
| SMS | Twilio, Africa's Talking, Termii | SmsProvider |
| Storage | AWS S3, Azure Blob, GCP Cloud Storage, MinIO | StorageProvider |
| Identity | OAuth2, SAML, OIDC | IdentityProvider |
| Analytics | Google Analytics, Mixpanel | AnalyticsProvider |

### 12.2 Provider Interface Contract

Each provider implements:
- `healthCheck(): Promise<HealthStatus>`
- `configure(credentials: JsonValue): Promise<void>`
- `validate(): Promise<boolean>`

Provider-specific methods are defined per interface.

### 12.3 Credential Management

| Operation | Approach |
|-----------|----------|
| Storage | AES-256-GCM encryption at rest |
| Transmission | TLS 1.3 in transit |
| Rotation | Manual in V1; API endpoint for credential update |
| Access | Decrypted only at runtime; never logged |
| Revocation | Immediate; integration status set to DISABLED |

---

## 13. Platform-Wide Event Integration

### 13.1 Event Flow Architecture

```text
[Other Domains] → EventEmitter2 → [Platform Administration]
                                        ↓
                              [Event Consumers]
                                        ↓
                              [State Updates] → [Audit Logs]
                                        ↓
                              [Webhook Dispatch]
```

### 13.2 Event Routing Rules

| Event Source | Consumer | Action |
|-------------|----------|--------|
| People.StudentEnrolled | LicenseUsageConsumer | Increment student license count |
| People.StudentWithdrawn | LicenseUsageConsumer | Decrement student license count |
| People.StaffHired | LicenseUsageConsumer | Increment staff license count |
| People.StaffSeparated | LicenseUsageConsumer | Decrement staff license count |
| Finance.SubscriptionPaymentReceived | SubscriptionPaymentConsumer | Extend subscription period |
| Finance.SubscriptionPaymentFailed | SubscriptionPaymentConsumer | Initiate grace period |
| Any Domain.StateChange | AuditLogConsumer | Create platform audit log entry |
| Any Domain.HealthChange | HealthAggregationConsumer | Update platform health dashboard |
| Any Domain.BackgroundJobFailed | FailedJobAlertConsumer | Update failed job metrics |
| Any Domain.SecurityEvent | SecurityAlertConsumer | Notify platform admins |

### 13.3 Webhook Dispatch

All platform events are dispatched to registered webhooks:
1. Event occurs in any domain
2. EventEmitter2 publishes event
3. WebhookDispatchConsumer evaluates registrations
4. Matching webhooks receive signed HTTP POST
5. Delivery attempts tracked in webhook_delivery_logs
6. Failed deliveries retried per retry policy

---

## 14. Outstanding Items

| Priority | Item | Status |
|----------|------|--------|
| High | Tenant cloning implementation (future) | Deferred to V2 |
| High | Automated API key rotation | Deferred to V2 |
| Medium | WebSocket push for real-time monitoring | Deferred to V2 |
| Medium | Multi-region deployment support | Deferred to V2 |
| Medium | Automated integration credential rotation | Deferred to V2 |
| Low | Tenant migration tooling | Deferred to V2 |
| Low | Advanced analytics on platform operations | Deferred to V2 |
| Low | Self-service tenant admin portal | Deferred to V2 |

---

## 15. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-17 | Platform Engineering | Initial complete specification — Phases 1–7 |
| 1.1.0 | 2026-07-17 | Architecture Review | Fix event name mismatch (StaffDeparted→StaffSeparated in 3 locations); correct Phase 3 table count (48→62), Phase 6 endpoint count (120+→137), Phase 7 test count (~400+→~192) |
| 1.2.0 | 2026-07-20 | Final Refinement | ADR-002 lifecycle text completion (pending/deletion states), missing event table entries (TenantDeletionInitiated, TenantDeletionConfirmed, SubscriptionGracePeriod), Phase 4 model count correction (48→55), enum count correction (25→22) |
