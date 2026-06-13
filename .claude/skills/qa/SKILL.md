---
description: "Runs the full project quality pipeline in order: lint (retro first, then app), unused exports check, and tests (retro then app). Aborts if the retro lib fails before running app checks. Use when the user wants to validate the project before committing or opening a PR ('pasa el QA', 'ejecuta la pipeline de calidad', 'valida el proyecto')."
---

Runs the full quality pipeline: retro lib first (lint + coverage), then the app. If the retro lib fails, execution aborts — app checks do not run.

## 1. Lint

```
npm run lint:retro
```

If there are errors or warnings, fix them before continuing. If it passes, run:

```
npm run lint:app
```

Goal: 0 errors and 0 warnings in both scopes.

> Note on `@typescript-eslint/member-ordering`: ESLint classifies class arrow functions (`private readonly _fn = () => {}`) as `private-method`, not as `private-readonly-field`. If they appear out of order, move them to the private methods block at the end of the class, after all public methods.

## 2. Unused exports

```
npm run check:unused:retro
```

If there are unused exports/imports, remove them or justify why they should stay. If it passes:

```
npm run check:unused:app
```

## 3. Tests

```
npm run test:retro
```

All library tests must pass. If any fail, fix them before continuing. If it passes:

```
npm run test:app
```

All app tests must pass.

---

Report the result of each step. If all six pass without any errors or warnings, confirm that the project is ready for commit/PR.
Do not commit or push.
