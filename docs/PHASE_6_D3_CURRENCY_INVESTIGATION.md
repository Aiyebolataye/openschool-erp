# Phase 6 — D-3 Investigation: `Institution.currency` Ownership and Treatment

> ## ✅ RESOLVED — 2026-09-29. FINANCE D-3 storage question answered by the owner.
>
> The owner has decided **FINANCE D-3**. The authoritative record is
> **`docs/FINANCE_OWNER_DECISIONS_RECORD.md` §2.5**; the decision is reconciled into
> **`engineering/Finance Engineering.md` §6.5.3 (CUR-01 … CUR-06)** and revision 1.8.0.
>
> **Decided (storage and disposition, which the terminology decision left open):**
>
> - **CUR-01** — the authoritative institution settlement currency is a **`FinancialPolicy` currency
>   row per institution**.
> - **CUR-02** — `Institution.currency` is retained for **display / compatibility only** and is
>   **not independently writable** as an authoritative Finance value. It is **not** deleted or
>   renamed; it is demoted.
> - **CUR-03** — there is **no second authoritative writer**.
> - **CUR-04** — the "fixed after first invoice" check (BR-015 / ADR-020 / I-13) is performed by
>   the **Finance-owned currency policy write path**, against Finance's **authoritative invoice
>   history** — never against a client-provided field.
> - **CUR-05** — the policy keeps its existing `DRAFT → ACTIVE → SUPERSEDED` lifecycle.
> - **CUR-06** — the effective settlement currency is **immutable for an institution once its first
>   invoice has been issued**; a later policy version must not silently change historical invoice
>   currency.
>
> **ADR-036's terminology lock is unchanged and is not reopened.** Only the storage and disposition
> questions it deliberately deferred are now answered.
>
> **Which findings below are addressed:** the §7 options are resolved by CUR-01/CUR-02 (Finance
> policy authoritative, column demoted). The §9 migration implications are answered *in principle*
> by CUR-02 — no authoritative rewrite of `Institution.currency` is required — but **no migration is
> performed and no schema change is made by the decision record**. The §10 components are answered:
> the authoritative column is named, `Institution.currency` is not deleted or renamed, the
> BR-015/ADR-020 enforcement point is named, and the multi-currency question remains Future
> (multi-currency support stays Future per Finance spec §14).
>
> **Still open, by design:** the `regional.*` currency-format keys (§5) are **not** affected — they
> remain Institution-owned display concerns per Institution Management ADR-031, and this decision
> does not touch them.
>
> **The findings below are preserved as written, as the point-in-time evidence record.**

| | |
|---|---|
| **Decision** | D-3 — ownership and treatment of `Institution.currency` |
| **Type** | Investigation / specification only |
| **Branch** | `phase/2-rbac` |
| **HEAD** | `aae6309` |
| **Date** | 2026-09-26 |
| **Code / schema / migration / test / architecture-doc changes** | **None.** This report is the only artifact produced. |
| **D-2 status** | Implemented and closed. Not reopened, not modified. |

> **Safe-stop determination: NOT triggered.** No two authoritative specifications issue
> *contradictory* decisions about `Institution.currency`. The Institution Management
> specification never defines the field at all, while the Finance specification claims
> currency authority without naming `Institution.currency` as its storage. These are
> complementary, not conflicting. Eight substantive ambiguities and three latent conflicts
> *are* recorded in §8 and require the D-3 decision; none of them is resolved here.

> ### ✅ Resolution status — terminology locked, implementation still open
>
> The terminology ambiguity identified in **§8.1** and recommended for resolution in **§11**
> has since been **decided by the architecture owner (D-3)**. Recorded in the authoritative
> Finance specification as **`Finance ADR-036`**, supported by the new *Currency Terminology*
> section (Finance §2, Engineering Principles) and the amended V-INV-07 rule.
>
> **Decided:** "institution default currency" means the institution's **Finance-owned
> settlement currency**. Settlement currency is distinct from currency formatting/display,
> and the existence of the `institution.currency` column does not confer ownership.
>
> **Still open — unchanged by that decision:** every implementation and design consequence
> listed in §7 (Options A–F), §9 (migration implications), and §10 (components 1, 2, 4, 5, 6)
> remains undecided. In particular the storage mechanism for Finance settlement currency,
> the disposition of `Institution.currency`, and the future of `regional.*` currency-format
> keys are **not** settled.
>
> *(The paragraph above describes the state after the terminology decision on 2026-09-26. The
> storage mechanism and the disposition of `Institution.currency` were subsequently **decided on
> 2026-09-29** — see the resolution banner at the head of this document. The `regional.*`
> currency-format keys remain unaffected and are still not settled by this decision.)*
>
> The findings below are preserved as written, as the point-in-time evidence record.

---

## 1. Current state

`Institution.currency` is in a materially different state from the `financial.*` namespace
retired by D-2:

| Property | Finding |
|---|---|
| Exists in database schema | **Yes** — `institution.prisma:72`, created by the init migration |
| Exists in application code | **Yes** — writable via the Institution create/update API |
| Writable through a public API | **Yes** — `POST /institutions`, `PATCH /institutions/:id` |
| Read by any business logic | **No** — zero functional consumers |
| Declared in any specification | **No** — absent from the Institution Management specification |
| Validated as an ISO 4217 code | **No** — free text, `@MaxLength(10)` |
| Data present | Seed value only (`'NGN'`); no consumer derives from it |

The field is therefore a **live, writable, specification-less column**. It is an
implementation artifact, not a specified concept.

Three findings dominate the decision:

1. **Finance already claims settlement-currency authority**, in six separate places
   (ADR-020, BR-015, business rule 9, invariant I-13, policy P-01, and
   `financial_policies.policy_type = CURRENCY`).
2. **Finance exists only as Prisma models.** There is no `finance` module, service, or
   controller, and no code anywhere references `prisma.invoice`, `prisma.payment`, or
   `feeStructure`. Finance's designated currency store — `financial_policies` — **does not
   exist in the database at all.**
3. **`Invoice` has no `currency` column**, although the Finance specification requires
   `invoices.currency varchar(3) ISO 4217`. The settlement record currently has nowhere to
   record its own currency.

Consequently there is no implemented settlement-currency authority today, in either domain.

---

## 2. Authoritative source references

### 2.1 Institution Management Engineering.md

| Line | Reference | Bearing on D-3 |
|---|---|---|
| 4 | Scope: "…Branding, **Regional Settings**" | Regional settings are in scope |
| 47 | In Scope: "…Provisioning, **Regional settings**" | Same |
| 201 | "Regional Settings \| Platform-level regional configuration, languages, time zones" | Describes regional concern; **does not mention currency** |
| 234 | "RegionalSettingsService \| Platform-level regional configuration" | **Unimplemented** — no such service exists |
| 325 | "17. Regional settings, time zones, and locale are configurable per Institution" | Does not mention currency |
| 373, 864 | `RegionalSettingsService` listed as a component | **Unimplemented** |
| **995** | **"\| Regional \| `regional.*` \| Institution Admin \| Time zone, locale, language, date format, currency format \|"** | **The only Institution-owned currency statement in the entire specification. Assigns *currency format* (display) — not a currency value.** |
| 1361 | "High \| Regional structure beneath Organization \| Future" | Regional work is deferred |
| 156 | ADR-031 — "…**Does not decide `Institution.currency` (separate decision, D-3)**" | D-2 explicitly defers this decision |
| 999–1012 | D-2 note — "`regional.*` currency **format** (display) is unaffected and remains Institution-owned; it is not settlement currency. Settlement currency authority is **not** decided here — that is a separate decision (D-3)." | Establishes the display/settlement distinction as the frame for D-3 |

**Negative finding (verified):** the string `currency` appears **8 times** in this
specification. Two are false positives ("optimistic **concurrency**", lines 61 and 912),
five are the D-2 additions (lines 156, 1002, 1010, 1011, 1012), and one is line 995.
**The specification contains no field, column, or entity definition for a currency value on
Institution.** There is no `currency` row in any Institution table.

### 2.2 Finance Engineering.md — the settlement-currency claim

| Line | Reference | Bearing on D-3 |
|---|---|---|
| 46 | In Scope: "configurable financial policies (**currency**, tax, numbering, penalties)" | Currency policy is Finance scope |
| 62 | "**Institution Scoping:** Every entity is scoped to one Institution; **currency**, tax rules, and numbering are institution-specific" | Currency is a Finance concept, institution-*scoped* (not institution-*stored*) |
| 103 | Audit log "additionally captures: amount, **currency**, balance_before, balance_after" | Currency is a financial record attribute |
| **165** | **"\| ADR-020 \| Currency is institution-scoped and fixed after first invoice \| Changing currency after invoices exist would break financial integrity \|"** | **The single most direct ownership statement. Finance ADR.** |
| 272 | "FinancialPolicy \| Core \| Configurable policy record (**currency**, tax, numbering, penalties)" | Names the intended entity |
| **338** | **"\| BR-015 \| Currency is institution-scoped and fixed after first invoice \| Global \|"** | Business rule, scope "Global" |
| **414** | **"9. Currency is institution-scoped and immutable after first invoice"** | Enumerated business rule |
| **510** | **"\| I-13 \| Currency fixed after first invoice for institution \| Application guard \|"** | **Assigns the enforcement mechanism to an application guard that does not exist** |
| **533** | **"\| P-01 \| Currency \| NGN \| ISO 4217 \|"** | **Finance's default currency is NGN, ISO 4217-constrained** |
| **590** | **"\| V-INV-07 \| Currency: institution default if not specified \|"** | **The ambiguous bridge term — see §8.1** |
| 834 | "invoices: `currency` \| varchar(3) \| **ISO 4217**" | **Required on Invoice — absent in code (§8.3)** |
| 869, 896 | fee_structures / payments: `currency` varchar(3) | Per-record currency |
| 1041 | "financial_policies: `policy_type` \| varchar(50) \| **CURRENCY**, TAX, NUMBERING, PENALTY, …" | **Finance's designated home for currency policy — table does not exist** |
| 1710–1714 | Gateway "Currency Support" matrix; Stripe = "Future / Multi-currency" | Gateway currency assumptions |
| 1789 | "Medium \| Multi-currency support \| **Future**" | **Multi-currency is explicitly not in scope** |

### 2.3 Platform Administration Engineering.md — a third currency concept

| Line | Reference | Bearing on D-3 |
|---|---|---|
| 163 | "ADR-007 \| Platform configuration uses global defaults with regional overrides \| … regional variations for **currency**, timezone, language" | Platform claims a currency default mechanism |
| 314 | "RegionalConfiguration \| Supporting \| Region-specific defaults (timezone, **currency**, language, date format)" | **A second regional configuration model, in a different specification** |
| 480 | "BR-PA-022 \| Regional overrides inherit from global defaults" | Inheritance rule |
| 622 | GlobalConfiguration → RegionalConfiguration (1:N) | Relationship |
| 646 | `PlatformConfigurationService` — setGlobal / setRegional / getEffective | **Unimplemented** |
| **952** | "subscription_plans: `currency` \| varchar(3) \| No \| **'USD'** \| ISO 4217 currency" | **This is SaaS subscription billing currency — a genuinely different concept with a conflicting default (USD vs NGN)** |
| 1788 | "`currency  String  @default(\"USD\") @db.VarChar(3)`" | **Not implemented in the database** |

### 2.4 Other specifications

| Source | Line | Reference | Bearing on D-3 |
|---|---|---|---|
| Operations | 1032–1033 | library_fines: "amount \| Calculated by **Finance**", "currency \| varchar(3) \| NGN" | Operations **defers the calculation to Finance** but stores a denormalized `NGN` default |
| Communication | 2368 | Payment-receipt template body: "…payment of `{{amount}} {{currency}}`" | A `{{currency}}` placeholder exists |
| Communication | 2372 | Template variable: `{"name": "currency", "type": "STRING", "required": true, "defaultValue": "NGN"}` | Template-level default, independent of `Institution.currency` |
| Reporting | 1090 | "unit \| varchar(20) \| %, count, **currency**, etc." | Currency as a *unit label*, not a field |

### 2.5 Roadmap / Phase 6 documents

`docs/PHASE_6_DECISION_BRIEF.md` and `docs/PHASE_6_SCOPE_VERIFICATION_REPORT.md` record
D-3 as an open decision and explicitly exclude `Institution.currency` from the D-2 change set.

---

## 3. Where `Institution.currency` is defined

| Artifact | Location | Definition |
|---|---|---|
| Prisma domain model | `apps/api/prisma/domains/institution.prisma:72` | `currency  String  @default("NGN")` |
| Prisma merged schema | `apps/api/schema.prisma:2071` | `currency  String  @default("NGN")` |
| Init migration | `apps/api/prisma/migrations/20260908180041_init/migration.sql:660` | `"currency" TEXT NOT NULL DEFAULT 'NGN'` |
| Create/Update DTO | `apps/api/src/modules/institutions/dto/institution.dto.ts:75–78` | `@IsOptional() @IsString() @MaxLength(10) currency?: string;` |
| Create service | `apps/api/src/modules/institutions/institutions.service.ts:85` | `currency: dto.currency,` |
| Update service | `apps/api/src/modules/institutions/institutions.service.ts:161` | `currency: dto.currency,` |
| Unit-test fixture | `apps/api/src/modules/institutions/institutions.service.spec.ts:51` | `currency: 'NGN',` |
| Seed data | `apps/api/prisma/seed.ts:76` | `currency: 'NGN',` |
| Swagger example only | `apps/api/src/modules/institutions/dto/institution-config.dto.ts:16` | `examples: [{ currency: 'NGN' }, …]` — documentation, not a consumer |

**Structural observation.** In `institution.prisma:66–72` the field sits in an unbroken run of
regional/locale attributes: `country` (`@default("NG")`), `timezone`
(`@default("Africa/Lagos")`), `currency` (`@default("NGN")`). It is a **column**, not a
`regional.*` configuration key. Note also that `language`, `locale`, and `dateFormat` — the
other members of the `regional.*` scope at line 995 — have **no columns and no keys at all**.

**Type observation.** All three currency columns in the database are unbounded `TEXT` with a
`'NGN'` default. The Finance specification mandates `varchar(3)` ISO 4217
(lines 533, 834, 869), and the DTO permits up to 10 arbitrary characters. There is **no ISO
4217 enum, regex, or validator anywhere in the repository** — `currency: "bananas"` is
currently accepted and persisted. The same gap applies to the two Finance columns.

---

## 4. Where it is consumed

**Nowhere, functionally.** Exhaustive search results:

| Consumer type | Result |
|---|---|
| Finance services / invoice calculation | **None** — no `finance` module exists |
| Payment gateways | **None** — no gateway code exists |
| Tax / numbering / financial policy | **None** — no such code or tables exist |
| Financial reports | **None** — no Finance reporting code |
| Frontend (`apps/web`) | **None** — the only `currency` hit is the phrase "energy currency" inside a biology lesson fixture (`apps/web/src/app/principal/academics/page.tsx:33`) |
| Other backend domains | **None** — People, Academics, and Operations code contain no currency reference |
| Institution Management business logic | **None** — no read of `institution.currency` for any purpose |

**It is readable only as incidental payload.** `institutions.service.ts` returns whole Prisma
rows with no `select` projection (`singleEnvelope(institution)` at lines 102, 129, 176, 207,
246), so `currency` is emitted in every Institution API response without ever being consulted.

**Existing stored data.** `institution.currency` is populated only by the seed (`'NGN'`).
Critically, the two Finance columns that *do* carry currency are written with **explicit
literals, not derived from the institution** — `seed.ts:1195–1197` sets
`currency: 'NGN'` directly on each `FeeStructure`. There is no inheritance, copy, or
fallback from `Institution.currency` anywhere.

**Consequence:** no stored financial record depends on `Institution.currency`, so no
financial data would be lost or reinterpreted by changing it. Equally, no behaviour depends
on it today, so changing it is behaviourally inert *except* for the public write surface,
which is live.

---

## 5. Relationship to `regional.*`

`regional.*` **already provides a legitimate, specification-backed home for currency
formatting** — Institution Management Engineering.md:995 assigns it "Time zone, locale,
language, date format, **currency format**", and the D-2 note at lines 1010–1011 confirms
that this is display formatting and "is not settlement currency."

Three qualifications, all of which bear on the decision:

1. **`regional.*` is entirely unimplemented.** There is no `RegionalSettingsService`, no
   `regional.*` row, and no regional module. The only occurrences of the literal `regional.*`
   in the codebase are two arbitrary example keys inside the D-2 guard test
   (`reserved-config-namespaces.spec.ts:79, 84`).
2. **The `timezone` half of `regional.*` was implemented as a column instead**
   (`institution.prisma:71`), not as a `regional.*` key. So the specification's
   `regional.*` design and the actual column design have already diverged for the one
   member that exists.
3. **`Institution.currency` is not a `regional.*` key.** It is a column. Whether it is
   reclassified as a `regional.*` format concern, kept as a column, or removed is precisely
   what D-3 must settle.

There is therefore a real possibility that `Institution.currency` and `regional.*` are
describing **the same concept by two different mechanisms** — which would make this a
de-duplication decision rather than an ownership transfer.

---

## 6. Relationship to Finance's settlement / financial configuration

Finance's claim is unambiguous and multiply stated: it owns currency as a financial policy,
scoped per institution, fixed after the first invoice, defaulting to NGN, constrained to
ISO 4217 (lines 62, 165, 272, 338, 414, 510, 533, 1041). "Institution-scoped" describes
**scope**, not storage — Finance's own tables are institution-scoped via `institution_id`
and its own storage for the value is `financial_policies` (line 1041).

The connective tissue between the two domains is a single undefined phrase:

> **V-INV-07 (Finance:590): "Currency: institution default if not specified"**

This is the only place in any specification where Finance's currency policy is bound to
something the *Institution* holds. "Institution default" is never defined, and the Finance
specification never says whether it means the `institution.currency` column or a
`financial_policies` record of type `CURRENCY`. **This single term is the crux of D-3.**

The structural picture today:

```
Finance intends:   financial_policies (policy_type=CURRENCY)   →  DOES NOT EXIST
                  invoices.currency                            →  column ABSENT from model
                  fee_structures.currency / payments.currency →  EXIST (TEXT, 'NGN', free text)

Institution has:  institution.currency                         →  EXISTS (TEXT, 'NGN', free text)
                  regional.* (currency format)                 →  DOES NOT EXIST

No consumer links any of these to any other.
```

Finance's authority claim is therefore currently **entirely aspirational**: the domain that
claims the concept has no application layer, no policy table, and a settlement record with
no currency field. `Institution.currency` is the only institution-level currency that
physically exists — but it is unowned by specification and unread by code.

---

## 7. Potential ownership options

Presented neutrally. **No option is selected or recommended here.** Each is stated with what
the repository currently supports and what it would require.

**Option A — Finance owns settlement currency in `financial_policies`; `Institution.currency` is removed; formatting stays in `regional.*`.**
Consistent with Finance ADR-020/BR-015/P-01 and with ADR-031's single-owner principle.
Requires building `financial_policies` (currently absent), removing the column, the DTO
field, and the two service assignments, and changing the seed and unit fixture. Leaves
formatting with no implemented home until `regional.*` is built.

**Option B — Finance owns settlement currency conceptually, but the value remains a column on the `institution` table.**
Matches Finance's "institution-scoped" language and V-INV-07's "institution default" with the
minimum of change; requires no migration. Cost: a Finance-owned concept physically stored in
an Institution-owned aggregate, with no enforcement boundary, and `Invoice` would still need
its own `currency` column per line 834.

**Option C — Deliberate split: `Institution.currency` becomes display/format only; Finance owns settlement.**
The split the D-2 note already anticipates (lines 1010–1011). Requires renaming or
redefining the field so it no longer implies a settlement value, adding format semantics
(there is no `format`/`locale`/`pattern` concept implemented anywhere), and building
Finance's settlement store. Most moving parts; cleanest final semantics.

**Option D — `Institution.currency` is retired as an orphan and settlement currency is
introduced only when Finance is built, with the "institution default" term resolved as a
Finance-owned `financial_policies` record.**
Removes the unspecified field without inventing a home now. Requires no Finance work in this
phase, but leaves V-INV-07 unimplementable until Finance exists.

**Option E — Status quo retained and documented: the field is recorded as Finance-owned in
specification only, with implementation deferred to the Finance phase.**
Smallest possible change (a specification clarification). Leaves a live, writable,
unvalidated free-text column on a public API with no owning specification, and leaves
Finance I-13 unenforced.

**Option F — Platform Administration supplies the currency default (ADR-007 /
`RegionalConfiguration`), with Finance inheriting it per institution.**
Supported by Platform Administration lines 163, 314, 480. Complicates ownership by adding a
third party, and its `'USD'` default (line 952) conflicts with Finance's `NGN`.

---

## 8. Conflicts or ambiguities discovered

**No safe-stop conflict.** No two authoritative specifications issue contradictory decisions
about `Institution.currency`. The items below are ambiguities, conformance gaps, and latent
conflicts — they inform the D-3 decision but none is resolved in this report.

### 8.1 The undefined term "institution default" (primary ambiguity)
- Finance:590 — "V-INV-07: Currency: institution default if not specified"
- Never defined in Finance; the Institution specification never uses the term.
- Either the `institution.currency` column, or a `financial_policies` CURRENCY record.
- **This is the decision on which the others depend.**

### 8.2 `Institution.currency` has no specification basis
- Implemented and publicly writable, but absent from every specification's field
  definitions (verified: 8 occurrences in the Institution Management spec, none a field
  definition; Finance never names the column).
- ADR-031 (Institution:156) claims Finance ownership of "financial configuration and
  financial policy — including settlement currency" (lines 1002–1003). Read strictly, that
  already covers this field — but ADR-031 explicitly defers D-3, so the point is
  **undecided by design**, not settled.

### 8.3 Finance specification requires `invoices.currency`; the model omits it
- Finance:834 — `invoices.currency varchar(3) ISO 4217`
- `finance.prisma:28–57` — the `Invoice` model has **no `currency` field**.
- The settlement record therefore cannot record its own currency, which is a prerequisite for
  Finance's own BR-015 / I-13 / ADR-020 immutability guarantees.

### 8.4 Finance I-13 has no implementing guard
- Finance:510 — "I-13: Currency fixed after first invoice for institution | **Application guard**"
- No such guard exists; `institution.currency` is freely mutable through
  `PATCH /institutions/:id` (`institutions.service.ts:161`), and there are no invoices to
  trigger it.
- A live implementation-vs-specification conformance gap, independent of ownership.

### 8.5 Type/validation divergence from ISO 4217
- Specified: `varchar(3)`, ISO 4217 (Finance:533, 834, 869).
- Implemented: unbounded `TEXT` (migration lines 460, 499, 660) and DTO `@MaxLength(10)` with
  no format check (`institution.dto.ts:75–78`).
- Applies to all three currency columns. Money-adjacent values are unvalidated free text.

### 8.6 Conflicting currency defaults: NGN vs USD
- Finance P-01 = `NGN` (Finance:533); Operations `library_fines` = `NGN` (Operations:1033);
  Communication template = `NGN` (line 2372); seed = `NGN`.
- Platform Administration `subscription_plans` = `'USD'` (line 952, 1788).
- Reconcilable only if these are recognized as different concepts (institution settlement
  vs SaaS billing). **If Platform's regional currency default is ever intended to seed
  institutions, a USD/NGN conflict becomes real.** Both surfaces are unimplemented.

### 8.7 Two competing "regional configuration" designs
- Institution Management: `regional.*` keys (line 995), owned by Institution Admin.
- Platform Administration: `RegionalConfiguration` rows (lines 314, 622), owned by Platform.
- Both claim timezone + language + date format + currency-format defaults for overlapping
  scopes, with different inheritance models. Both are unimplemented. ADR-031 does not
  adjudicate between them.

### 8.8 ADR identifier collision across specifications
- **Finance ADR-020** = "Currency is institution-scoped and fixed after first invoice" (line 165).
- **Platform Administration ADR-020** = "Optimistic concurrency (version column)" (line 176).
- Unqualified references to "ADR-020" are ambiguous across the frozen specifications. Relevant
  to how the D-3 decision is recorded.

### 8.9 `regional.*` coverage is partial and diverged
- `regional.*` promises timezone, locale, language, date format, currency format (line 995).
- Implemented: `timezone` and `currency` as **columns**; `locale`, `language`, `dateFormat`
  have no representation at all.

### 8.10 `Payment.currency` is denormalized with no stated authority
- `finance.prisma:64` and Finance:896 both carry `payments.currency`; the Operations fine
  (Operations:1033) and Communication template (line 2372) also carry independent `NGN`
  defaults. No specification states which value wins when a `Payment.currency` differs from
  the institution or invoice currency.

---

## 9. Migration implications

| Scenario | Data impact | Code / schema impact |
|---|---|---|
| Remove `Institution.currency` (Options A, D) | **None.** Only the seed's `'NGN'` literal; no consumer reads it, and `FeeStructure`/`Payment` currency values are independent literals (`seed.ts:1195–1197`). | Drop migration; remove DTO field (`institution.dto.ts:75–78`); remove `institutions.service.ts:85, 161`; update `institutions.service.spec.ts:51`; update seed. **No backfill required.** |
| Re-purpose as display/format (Option C) | None | No drop migration, but the field must be redefined; DTO validation must change; format/locale semantics have **no existing model** to build on. |
| Keep as a Finance-owned column (Options B, E) | None | No migration. Requires a specification note assigning cross-domain ownership, plus ISO 4217 validation to close §8.5. |
| Build `financial_policies` (Options A, C, D) | None — table does not exist | New Finance table + migration + service. This is Finance-phase work, not Institution-phase work. |
| Add `invoices.currency` (§8.3) | None | New column + migration on the `Invoice` model. Required by Finance:834 regardless of the D-3 outcome. |

**Migration risk is low in every scenario.** The blocking factor is not data — it is that
Finance's intended storage does not exist, so any option that gives Finance the value must
either build that storage or accept a cross-domain column.

---

## 10. Exact decision required for D-3

The decision is **not** a single yes/no. It has six components:

1. **Meaning.** Does `Institution.currency` denote a settlement currency, a display/format
   setting, or is it two separate values that have been conflated in one column? State the
   intended meaning of the existing column before deciding its fate.
2. **Settlement-currency authority.** Which domain owns the institution's settlement
   currency — Finance (per ADR-020/BR-015/P-01), Institution Management, Platform
   Administration, or a split?
3. **Definition of "institution default."** Resolve Finance:590 V-INV-07 explicitly: is the
   institution's settlement currency the `institution.currency` column, or a
   `financial_policies` record of type `CURRENCY`? **This is the gating question.**
4. **Formatting home.** Confirm whether `regional.*` (Institution:995) is the home for
   currency display format, whether it will be implemented as configuration keys, and how it
   relates to the existing `timezone`/`currency` columns and to Platform Administration's
   `RegionalConfiguration` (§8.7).
5. **Disposition of the existing artifact.** Remove the column, rename it, redefine it as
   format-only, or retain it as a documented Finance-owned column — and correspondingly the
   DTO field, the two service assignments, the seed, and the unit fixture.
6. **Enforcement and conformance.** Who enforces Finance I-13 ("currency fixed after first
   invoice", Finance:510), given that no guard exists and `Invoice` has no `currency` column
   (§8.3, §8.4)? Is ISO 4217 validation (P-01) in scope for D-3 (§8.5)?

---

## 11. Recommended smallest next decision point

**Recommended next step: decide component 3 alone — define "institution default currency"
(Finance:590, V-INV-07) — and record the answer as a D-3 amendment. Implement nothing.**

Rationale, based only on the evidence above:

- It is the **only ambiguity that blocks the others**. Components 1, 2, 5, and 6 all depend on
  whether the settlement value lives on `institution` or in `financial_policies` (§8.1).
- It is a **terminology decision, not an implementation**. It requires no schema change, no
  migration, and no code, so it can be made without touching the Finance build.
- It is **unblocked by no other decision**, and it unblocks all of them, so it is the
  cheapest node in the dependency graph.
- It resolves §8.1, and by doing so constrains §8.2, §8.3, §8.4, and §9.

Two items should be recorded alongside it, without implementation, because they are pure
specification facts rather than new design:

- §8.3 — `Invoice` lacks the `currency` column that Finance:834 requires. This is an existing
  Finance-side conformance gap, correctable inside the Finance phase and **not** a
  prerequisite for deciding D-3.
- §8.8 — the cross-specification ADR-020 collision, so the D-3 decision is recorded with a
  fully qualified reference (`Finance ADR-020`).

The D-2 implementation must not be revisited: the `financial.*` write-path guard and ADR-031
are correct as implemented and are independent of this decision.

---

## Appendix A — Checks performed

| Check | Method | Result |
|---|---|---|
| `Institution.currency` in Prisma | `grep currency` over `apps/api/prisma` | 3 columns + 1 migration + seed |
| `currency` in application code | `grep currency` over `apps/api/src` | DTO, 2 service writes, 1 fixture, 1 Swagger example; **0 business reads** |
| `currency` in frontend | `grep` over `apps/**/*.{ts,tsx,js,jsx}` | 1 false positive (biology lesson text) |
| `currency` in Institution Management spec | case-insensitive `grep currency`, file-scoped | 8 hits; **0 field definitions** |
| `settlement currency` repo-wide | `grep` | Only the D-2 additions |
| `ISO 4217` repo-wide | `grep 4217` | Finance:533/834/869, Platform:952 |
| `institution default` / `default currency` | `grep` over `engineering/` | Finance:590 is the only currency hit |
| Finance model inventory | `grep '^model \|^enum '` on `finance.prisma` | FeeStructure, Invoice, Payment, Scholarship, Refund — **no FinancialPolicy, no Invoice.currency** |
| Finance module existence | file search for `*finance*` under `apps/api/src` | **No files** |
| Finance model consumers | `Select-String 'prisma\.invoice\|prisma\.payment\|feeStructure'` over `apps/api/src` | **No references** |
| Implemented modules | directory listing of `apps/api/src/modules` | academics, audit, auth, delivery, events, identity, institutions, invitations, onboarding, people, session — **no finance, no platform, no operations** |
| Platform Admin implementation | `Select-String 'RegionalConfiguration\|PlatformConfigurationService\|SubscriptionPlan'` | **No matches — unimplemented** |
| Reporting currency | `grep currency` on Reporting spec | 1 hit, a `unit` label |
| Operations / Communication currency | targeted reads | Denormalized `NGN` defaults, not derived from `Institution` |

No builds, migrations, or test suites were run, because this investigation changed nothing.
No pre-existing failures were encountered; the only tooling limitation was that `rg` is not
installed on this machine, so `Select-String` and the search tool were used instead.

## Appendix B — Repository state

- **HEAD:** `aae6309` (unchanged; no commit, amend, or history rewrite)
- **Tracked files modified by this investigation:** **none**
- **Schema / migration / test / architecture-document changes:** **none**
- **Only artifact created:** `docs/PHASE_6_D3_CURRENCY_INVESTIGATION.md` (new, untracked)

The working tree also contains the completed D-2 change set from the previous task
(3 modified tracked files, 6 untracked files). Those are pre-existing and were not touched
here. The D-2 implementation was not reopened, modified, or re-verified.
