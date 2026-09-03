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
