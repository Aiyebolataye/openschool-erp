# Environment Variables — OpenSchool API

Source of truth: `apps/api/src/config/configuration.ts`.

Every variable below is referenced from a single place. `config.get()` reads from this file;
direct `process.env` reads outside of `configuration.ts` are disallowed by project convention.

---

## Required (boot fails if missing)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (include `?schema=public`) | `postgresql://openschool:openschool@localhost:5433/openschool_dev?schema=public` |
| `JWT_SECRET` | HS256 signing secret. **Must not be `'change-me'`. Minimum 32 chars in production.** | (generate with `openssl rand -base64 48`) |

---

## Development defaults (optional unless overridden)

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development` / `test` / `production` |
| `PORT` | `3000` | API listen port |
| `API_PREFIX` | `api/v1` | Global route prefix |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | *(empty)* | Redis auth password |
| `JWT_EXPIRES_IN` | `1h` | Access-token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh-token / session lifetime |

---

## Reserved / Phase-gated

These variables are read from `.env` and used by the typed config object, but their **consumers are not yet implemented**. They are reserved for future phases and must not be required at boot.

| Variable | Phase | Consumer |
|----------|-------|----------|
| `S3_ENDPOINT` | 8 — Documents | S3/MinIO client service |
| `S3_BUCKET` | 8 | *(default: `openschool-dev`)* |
| `S3_ACCESS_KEY` | 8 | S3/MinIO client |
| `S3_SECRET_KEY` | 8 | S3/MinIO client |
| `S3_REGION` | 8 | *(default: `us-east-1`)* |
| `PAYSTACK_SECRET_KEY` | 6 — Finance | Paystack client |
| `PAYSTACK_WEBHOOK_SECRET` | 6 | Webhook signature verification |
| `SMTP_HOST` | 9 — Communication | Email provider |
| `SMTP_PORT` | 9 | *(default: `1025`)* |
| `SMTP_USER` | 9 | Email auth |
| `SMTP_PASS` | 9 | Email auth |
| `SMS_PROVIDER` | 9 | SMS gateway (e.g., Africastalking, Termii) |
| `SMS_API_KEY` | 9 | SMS gateway auth |
| `THROTTLE_TTL` | 3 — Reliability | *(not consumed yet: `TenantRateLimitGuard` is global but uses hardcoded windowMs 1000 / maxRequests 100)* |
| `THROTTLE_LIMIT` | 3 | *(not consumed yet; see above)* |
| `CORS_ORIGINS` | 1 — Auth hardening | Allowed origins (currently `cors: true` globally) |

---

## File guidance

| File | Purpose | Committed |
|------|---------|-----------|
| `.env` | Local working copy | ❌ Never |
| `.env.example` | Full reference (copy to `.env`) | ✅ Yes |
| `.env.test` | Local test overrides | ❌ Never |
| `.env.test.example` | Test template for CI | ✅ Yes |

---

## Production (Phase 13)

In production:
- All required variables must be provided via secret management (not plain `.env`).
- `JWT_SECRET` must be ≥ 32 characters.
- Strong placeholder values (`change-me`, `changeme`, `secret`) are rejected at boot.
- Secrets must never appear in logs, error responses, or version control.