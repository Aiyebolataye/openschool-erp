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
