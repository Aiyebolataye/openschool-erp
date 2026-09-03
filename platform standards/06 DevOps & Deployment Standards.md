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
