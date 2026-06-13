---
description: "Creates a versioned incremental SQL patch for the Supabase database and optionally applies it via npm run db:apply. Use when the user needs to modify the database schema, policies, or stored procedures ('crea el patch de BD', 'aplica el cambio en la base de datos', 'nuevo patch SQL')."
argument-hint: '[short-description]'
---

Argument: $ARGUMENTS — short description of the change (e.g. `tighten-rls-products` or `add-column-game-rating`). If empty, ask the user.

> Flow context: `docs/backend/patches/README.md`. The canonical schema `docs/backend/schema/supabase-schema-current.sql` is documentation only — incremental changes to an already-deployed database require a versioned patch.

## Steps

### 1. Determine the patch number

- List `docs/backend/patches/` (ignoring the `diagnostics/` subdirectory) and detect the last number used.
- The new patch uses the next integer, zero-padded to 3 digits: `003`, `004`, …

### 2. Ask the user for the SQL

- If the argument does not make the change clear, ask what they want to change (RLS, column, RPC, index, etc.).
- If the change affects existing tables, ask the user to paste the output of the relevant diagnostic from `docs/backend/patches/diagnostics/` in the SQL Editor before writing anything.

### 3. Create the patch file

Create `docs/backend/patches/NNN-<description>.sql` with this structure:

```sql
-- ============================================================
-- NNN — <human-readable description of the change>
-- ============================================================
-- <Context in 1-3 lines: what is changed and why.>
-- ============================================================

-- Idempotent SQL for the change here.

NOTIFY pgrst, 'reload schema';
```

**The SQL must always be idempotent** (re-runnable without breaking):

- Policies: `DROP POLICY IF EXISTS … ON …;` **before** each `CREATE POLICY …`. If renaming a policy, drop both the old name and the new name.
- Tables / columns: `CREATE TABLE IF NOT EXISTS …`, `ALTER TABLE … ADD COLUMN IF NOT EXISTS …`.
- One-off data: `INSERT … ON CONFLICT DO NOTHING` (or `DO UPDATE` if needed).
- Functions / views: `CREATE OR REPLACE …`.

### 4. Sync the canonical schema

If the change modifies the database contract (not just a minor fix), also update `docs/backend/schema/supabase-schema-current.sql` to reflect the new state. Both files go in the same PR.

### 5. Apply (optional — ask the user)

Ask whether they want to apply it now.

- **Yes:**
  1. Verify that `.env` exists and contains `SUPABASE_DB_URL=postgresql://…`. If not, instruct the user: copy from `.env.example` and paste the Session Pooler connection string from the Supabase Dashboard.
  2. Run: `npm run db:apply -- docs/backend/patches/NNN-<description>.sql`
  3. Report the result to the user.
- **No:** Provide the command to apply it later.

### 6. Post-apply verification

If the patch touched RLS or anything auditable, suggest running the relevant diagnostic from `docs/backend/patches/diagnostics/` in the SQL Editor.

## Rules

| Rule                                   | Detail                                                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No commit / push                       | The patch is left ready; the user decides when to open a PR (`/pr`).                                                                                                                                                               |
| Fix incomplete idempotency in the file | If applying the patch fails due to incomplete idempotency (e.g. forgetting to drop a renamed policy), fix the file — do not apply a manual workaround.                                                                             |
| Keep both files coherent               | If the change touches the canonical schema, both files must be coherent in the same PR.                                                                                                                                            |
| Network fallback                       | If the network blocks Postgres (corporate DPI, IPv6-only…), pasting the SQL in the Supabase SQL Editor is a valid alternative. The script is preferred but not mandatory.                                                          |
| Code changes in the same PR            | If the patch adds columns or changes the type contract, the code changes (DTO, mapper, model) must go in the same PR as the patch. Applying the patch without the code (or vice versa) can leave the app in an inconsistent state. |
