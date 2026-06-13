---
description: "Improves test coverage to the maximum achievable level for the selected scope (retro or app), respecting documented exclusions registered in the in-skill catalog (reference/exclusions.md). Use when the user wants to increase test coverage or fix coverage gaps ('mejora la cobertura', 'sube la cobertura de tests', 'aumenta el coverage')."
argument-hint: '[retro|app]'
---

The project has two independent scopes:

| Scope                  | Coverage script               | Threshold              | Reference doc                                             |
| ---------------------- | ----------------------------- | ---------------------- | --------------------------------------------------------- |
| `retro` — `lib/retro/` | `npm run test:retro:coverage` | 90% (statements/lines) | `.claude/skills/improve-coverage/reference/exclusions.md` |
| `app` — `src/`         | `npm run test:app:coverage`   | 80% (statements/lines) | `.claude/skills/improve-coverage/reference/exclusions.md` |

> Both coverage passes write to `coverage/monchito-game-library/`. **Never use `npm run test:coverage`** (it chains both passes and the second overwrites the first's lcov). Always run only the script for the scope you are improving.

## Step 0 — Choose scope

If `$ARGUMENTS` is not specified, default to **`app`**: `retro` is already at its practical ceiling (documented in `reference/exclusions.md`). Any remaining gap in `retro` falls into the documented exclusion categories below. If `$ARGUMENTS` is `retro`, read `reference/exclusions.md` § retro exclusions first to confirm the detected gap is not already classified as an exclusion — if it is, stop and report to the user instead of investing effort.

## Step 1 — Generate the coverage report

Run the appropriate script for the chosen scope:

- `retro` → `npm run test:retro:coverage`
- `app` → `npm run test:app:coverage`

The lcov report is written to `coverage/monchito-game-library/lcov.info` and reflects only the executed scope.

## Step 2 — Identify real gaps

Read `coverage/monchito-game-library/lcov.info` and extract entries with a `0` counter:

- `BRDA:line,block,branch,0` — uncovered branch
- `DA:line,0` — unexecuted line
- `FNDA:0,name` — uncalled function

Before acting on each gap, classify it using the exclusion table below (canonical reference for both scopes; per-scope details live in `reference/exclusions.md`):

| Category                                      | Description                                                                         | Action    |
| --------------------------------------------- | ----------------------------------------------------------------------------------- | --------- |
| **Cat. 1** — V8 artifacts on `export class`   | Phantom branches on the class-declaration line                                      | Ignore    |
| **Cat. 2** — Dead code / unreachable branches | Conditions whose alternate side can never occur by code contract                    | Ignore    |
| **Cat. 3** — Angular signals artifacts        | `?.` / `??` inside `computed()` or `effect()` that V8 does not instrument correctly | Ignore    |
| **Deliberately untested logic**               | Items listed in `reference/exclusions.md`                                           | Ignore    |
| **Everything else**                           | Real logic without coverage                                                         | **Cover** |

Categories 1–3 apply equally in `lib/retro/`. If you encounter a new artifact not yet documented, register it in `reference/exclusions.md` when closing. When in doubt, compare the line number against `export class` or a `computed()`/`effect()` block. If still uncertain, write the test: if it passes but the branch remains uncovered, it is an artifact.

## Shared mocks

Los mocks reutilizables viven en `src/testing/`. **Antes de declarar un mock inline, comprobar si ya existe aquí.**

| Fichero                                    | Exporta              | Uso                                                                                                                  |
| ------------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `activated-route.mock.ts`                  | `mockActivatedRoute` | `{ provide: ActivatedRoute, useValue: mockActivatedRoute }`                                                          |
| `dialog.mock.ts`                           | `mockDialog`         | `{ provide: RetroDialogService, useValue: mockDialog }`                                                              |
| `lib/retro/testing/retro-snackbar.mock.ts` | `mockRetroSnackbar`  | `{ provide: RetroSnackbarService, useValue: mockRetroSnackbar }` — importar con `@retro/testing/retro-snackbar.mock` |
| `location.mock.ts`                         | `mockLocation`       | `{ provide: Location, useValue: mockLocation }`                                                                      |
| `router.mock.ts`                           | `mockRouter`         | `{ provide: Router, useValue: mockRouter }`                                                                          |
| `transloco.mock.ts`                        | `mockTransloco`      | `{ provide: TranslocoService, useValue: mockTransloco }`                                                             |
| `user-context.mock.ts`                     | `mockUserContext`    | `{ provide: UserContextService, useValue: mockUserContext }`                                                         |

Si se necesita un nuevo mock reutilizable, añadirlo a esta carpeta y actualizar la tabla.

> Los mocks de `lib/retro/` viven en `lib/retro/testing/` y se importan con `@retro/testing/*`. Los mocks de la app siguen en `src/testing/`.

## Step 3 — Write the tests

For each real gap:

1. Locate the corresponding `.spec.ts` file (same path, `.spec.ts` extension).
2. Read the existing spec to understand the pattern: mocks, helpers, `TestBed`, breakpoint subjects, etc.
3. Read the source file at the gap's line.
4. Add the minimal `it(...)` blocks needed to cover that branch or line.

Mandatory conventions:

- Shared mocks by scope:
  - `src/` specs → check `src/testing/` before declaring an inline mock.
  - `lib/retro/` specs → check `lib/retro/testing/` before declaring an inline mock.
- `vi.clearAllMocks()` in `beforeEach`.
- Test names in Spanish, descriptive of the covered case.
- Do not add JSDoc inside `it(...)` or inner `describe(...)`.
- Do not modify existing passing tests.

## Step 4 — Verify

1. Run the scope's test script for fast feedback: `npm run test:retro` or `npm run test:app`.
2. Before closing, run `npm test` to confirm the other scope is still green.

If a gap remains uncovered after the test passes, it is an artifact — document it under the correct category in `reference/exclusions.md` and continue.

## Step 5 — Update the exclusions catalog

Sync `reference/exclusions.md` with any new findings from this run:

1. Run the scope's coverage script and note the final coverage values from the Vitest summary.
   - `retro` → `npm run test:retro:coverage`. Verify the threshold matches `angular.json` → `configurations.retro-coverage.coverageThresholds`.
   - `app` → `npm run test:app:coverage`. Verify the threshold matches `angular.json`.
   - If the threshold in `angular.json` and the measured value differ, notify the user.
2. If any previously excluded item has become covered, remove or mark it as resolved in `reference/exclusions.md`.
3. If new non-testable gaps were confirmed as artifacts during this run, add them to the correct category in `reference/exclusions.md` with a brief analysis.

> Never use `npm run test:coverage` here: it chains both passes and the second overwrites the first's lcov.

Do not commit or push.
