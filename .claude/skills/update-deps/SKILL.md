---
description: "Updates project dependencies to their latest safe versions: auto-applies patches and minors, stops at majors or incompatible peer-deps for user decision, enforces exact versions (no ^ or ~), and verifies build/test/lint/knip before finishing. Use when the user wants to update dependencies ('actualiza las dependencias', 'sube las deps', 'update dependencies')."
argument-hint: '[package1 package2...]'
---

> Flow context: `CLAUDE.md` section "npm Dependencies" / "Dependency update process". Reason: the process repeats every few weeks (detect → classify → ng update vs npm install → pin exact versions → build/test/lint/knip → commit) and has project-specific rules that cannot be delegated to `npm update`.

Argument: $ARGUMENTS — optional. If the user passes a list of packages, limit the update to those. Without an argument, update everything safe.

## Step 1 — Create branch

From an updated `master`:

```bash
git checkout master && git pull --ff-only origin master
git checkout -b chore/dependency-updates-<month-year>
```

Example: `chore/dependency-updates-may-2026`. If a branch like this already exists, ask the user whether to reuse it or create a new one.

## Step 2 — Detect candidates

Run in parallel:

```bash
npm outdated
npx ng update
```

`npm outdated` lists all dependencies with a new version available. `npx ng update` lists those in the Angular ecosystem that can be managed atomically by that tool.

## Step 3 — Classify by risk

For each package with an update, classify it using this table:

| Category                    | Criterion                                                                | Action                                                 |
| --------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| **A — Angular patch/minor** | Within the same major (21.x → 21.y), manageable via `ng update`          | Update in bulk via `ng update`                         |
| **B — Other patch/minor**   | `npm outdated` shows a change within the same major                      | Install with `--save-exact`                            |
| **C — Major**               | Change from `X.y.z` → `(X+1).0.0` or higher                              | **STOP** — generate report and ask user for a decision |
| **D — Blocked by peer-dep** | Conflict with `@angular/build` or equivalent that Vercel does not accept | **STOP** — document and discard                        |

### Project knowledge to apply when classifying

Before marking a package as category B, check whether it has a peer-dep that would push it into D:

- **TypeScript >= 6**: blocked by `@angular/build` (peer `typescript: ">=5.9 <6.0"`). Vercel does not accept `--legacy-peer-deps`. Wait for Angular 22.
- **typescript-eslint** must be compatible with the installed TS version (check peer `typescript: ">=4.8.4 <X"`).
- **knip 6.10+** introduces a strict check for exports used only inside their own file. If you upgrade to this range and it was not already enabled, add `ignoreExportsUsedInFile: true` to `knip.config.ts` (project convention is to export all DB schema types for self-documentation).

When a package falls into C or D, **show the user** a block with: package, current version, candidate version, reason for the block or risk, and ask whether they want to skip it or try anyway.

## Step 4 — Apply safe updates

### 4a — Category A (Angular ecosystem)

A single atomic invocation so `ng update` resolves peer-deps in one pass:

```bash
npx ng update @angular/cli @angular/core @angular/material angular-eslint
```

Add or remove packages from the list based on what `npx ng update` reported.

### 4b — Category B (rest)

```bash
npm install --save-exact package-1@version package-2@version ...
```

One single invocation with all packages so npm resolves in a single pass. **`--save-exact` is mandatory** — see exact-versions rule below.

## Step 5 — Remove `^` and `~` ranges

After both installations, open `package.json` and verify that **no** dependency has `^` or `~`. If npm added any, remove them manually. Repeat until the grep is clean:

```bash
grep -E '"\^|"~' package.json
```

## Step 6 — Sync lock file

```bash
npm install
```

Without arguments, so `package-lock.json` stays consistent with the updated `package.json`.

## Step 7 — Verify

Run in this order, stopping at the first failure:

```bash
npm run build
npm test
npm run lint
npm run check:unused
```

- **Build**: the production bundle must compile.
- **Tests**: 100% green.
- **Lint**: 0 errors and 0 warnings.
- **Knip**: clean.

### If knip fails after upgrading knip itself

Expected when upgrading `knip` to a version with a new check (e.g. exports used only within their own file). Before touching code, validate the findings:

1. For each flagged export, check whether it is used in another file (`grep -rn "\bSymbol\b" src --include="*.ts"`).
2. If it is **only used in its own file** as a base for derived types (`extends`, `Pick<X>`, `Partial<X>`, property of another interface), this is the "redundant export by project convention" pattern — the fix is to add `ignoreExportsUsedInFile: true` to `knip.config.ts`, **not** to remove the `export`.
3. If it is **not used anywhere**, it is real dead code — delete it.
4. If it is **duplicated** (identical definition in two files), unify by importing from the canonical one.

## Step 8 — Report and leave ready for PR

Summarise for the user in a single message:

- Category A updated (Angular X.Y.Z → X.Y.W).
- Category B updated (compact list).
- Category C / D skipped and why (one paragraph per package).
- Result of the 4 verification checks.
- Additional changes applied (knip config, dedups, etc.).

Do not commit or push. The user decides when to open a PR (`/pr`).

## Rules

- **Exact versions always.** No `^` or `~`. This is the project convention and the only way to prevent Vercel build failures caused by peer-dep mismatches between environments.
- **Angular ecosystem only via `ng update`.** Never `npm install` directly for `@angular/*`, `@angular-devkit/*`, or `@angular-eslint/*` — `ng update` resolves peer-deps atomically in a way npm cannot replicate.
- **Majors are never applied automatically.** Even if they look harmless. Every major requires reading the CHANGELOG and validation.
- **Never `--legacy-peer-deps`.** Vercel forbids it; if a package cannot install without that flag, it goes to category D.
- **No commit or push.** The skill leaves the branch ready; the user runs `/pr` when ready.
