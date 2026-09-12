# Git Workflow (Phase 0 baseline)

> Adopted during Phase 0. This is the working strategy; refine it during review if needed.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production/stable baseline. Only reviewed, approved work lands here. |
| `phase/0-foundation` | Current working branch for Phase 0 (created 2026-09-08). |

- One working branch per roadmap phase: `phase/<n>-<slug>` (e.g., `phase/1-auth-hardening`).
- Feature branches may be created off the phase branch for isolated work, merged back after review.
- Do not push directly to `main` without the phase review and approval.

## Commits

- Follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- One logical change per commit.
- Never include secrets, `.env` files, build output, or credential dumps (all covered by `.gitignore`).
- Scope: prefix subjects with the app or area when cross-cutting, e.g. `feat(api): ...`.

## Commit discipline for pre-existing uncommitted work

At Phase 0 start the working tree contained ~88 modified/untracked files of pre-existing provenance
(frontend pages, `apps/api/`, plan/audit docs). These were **not** swept into a single commit.
Before committing them:

1. `git status` and review the full list (`append GIT-WORKFLOW review`).
2. Group changes into logical commits (e.g., `feat(web): platform admin pages`, `feat(api): scaffold ...`).
3. Keep generated/build artifacts out (already ignored).
4. Obtain review of the proposed commit plan.

## .gitignore policy

- Real `.env*` files are ignored; only `.env.example` and `.env.test.example` templates are committed.
- Build outputs, logs, coverage, and editor files are ignored.
- The development-only credential dump (`Greenfield-Academy-Users-Roles-Passwords.docx`) is ignored and must never be committed.

## Verification before commit

Run at minimum (in `apps/api`): typecheck, build, unit tests, integration tests.
Run (web): typecheck. Lint where configured.