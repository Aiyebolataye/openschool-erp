-- Phase 1 — D-1: archive the legacy academic table set.
-- docs/PHASE_5_MIGRATION_REPORT.md §6 (phase-1 spec) + §2.1 (inventory).
--
-- 1) Drop every FK constraint that references a legacy academic table and that
--    lives on a NON-legacy consumer table (algorithmic over pg_constraint, so
--    exact legacy constraint names are not guessed). Archive-internal FKs
--    (legacy table -> legacy table) are retained so the archived relations
--    stay coherent.
-- 2) Rename the 12 legacy tables to `_academic_legacy_*` (data preserved).
--    Their `<table>_pkey` PRIMARY KEY backing indexes are renamed to the
--    `_academic_legacy_` prefix so Phase 2 can create the new same-named
--    tables (whose PK index names are `<table>_pkey`, which is schema-scoped
--    and would otherwise collide). No other legacy index name collides with
--    the Phase 2 index set, so only the PK indexes are renamed.

DO $p5$
DECLARE
  legacy TEXT[] := ARRAY[
    'academic_years','terms','curricula','subjects','classes','enrollments',
    'grades','results','departments','attendance','assignments','submissions'
  ];
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname AS con, cl.relname AS child
    FROM pg_constraint c
    JOIN pg_class cl ON cl.oid = c.conrelid
    JOIN pg_class cp ON cp.oid = c.confrelid
    WHERE c.contype = 'f'
      AND cp.relname = ANY(legacy)
      AND NOT (cl.relname = ANY(legacy))
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', r.child, r.con);
  END LOOP;
END
$p5$;

DO $p5$
DECLARE
  legacy TEXT[] := ARRAY[
    'academic_years','terms','curricula','subjects','classes','enrollments',
    'grades','results','departments','attendance','assignments','submissions'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY legacy
  LOOP
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = tbl AND relkind = 'r') THEN
      EXECUTE format('ALTER TABLE %I RENAME TO %I', tbl, '_academic_legacy_' || tbl);
    END IF;

    -- PK backing index: <tbl>_pkey (schema-scoped name, must be freed).
    IF EXISTS (
      SELECT 1 FROM pg_class c
      WHERE c.relkind = 'i'
        AND c.relname = tbl || '_pkey'
        AND EXISTS (
          SELECT 1 FROM pg_index ix
          JOIN pg_class t ON t.oid = ix.indrelid
          WHERE ix.indexrelid = c.oid
            AND t.relname = '_academic_legacy_' || tbl
        )
    ) THEN
      EXECUTE format('ALTER INDEX %I RENAME TO %I',
        tbl || '_pkey', '_academic_legacy_' || tbl || '_pkey');
    END IF;

    -- PK constraint (per-table name; renamed for consistency).
    IF EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      WHERE t.relname = '_academic_legacy_' || tbl
        AND c.conname = tbl || '_pkey'
    ) THEN
      EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I',
        '_academic_legacy_' || tbl,
        tbl || '_pkey',
        '_academic_legacy_' || tbl || '_pkey');
    END IF;
  END LOOP;
END
$p5$;