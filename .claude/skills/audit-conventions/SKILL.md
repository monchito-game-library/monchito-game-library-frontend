---
description: "Audits the project for convention violations that ESLint does not automatically detect, producing a natural-language report by category. Use when the user suspects non-lint-detectable issues or after running /qa ('audita las convenciones', 'busca violaciones de convenciones', 'revisa el estilo del proyecto')."
argument-hint: '[path]'
---

Optional argument: $ARGUMENTS — path to analyse. Defaults to `src/app` and `lib/retro/` with the rules applicable to each scope.

Run `/qa` first; use this skill only when you suspect violations the linter cannot catch.

## What to detect

ESLint already covers categories 1–3 from the original `detect-architecture-violations` (cross-layer imports, relative paths, private members without `_`). This skill focuses on what lint **does not** catch.

| #   | Category                                    | Scope                   | Pattern to search                                                   |
| --- | ------------------------------------------- | ----------------------- | ------------------------------------------------------------------- |
| 1   | Signals without explicit type               | `src/app`               | `= signal\(` without `WritableSignal<` on the same or previous line |
| 2   | JSDoc `@param` missing `{type}` braces      | `src/app`, `lib/retro/` | `@param (?!\{)` in `.ts` files                                      |
| 3   | SCSS spacing in `px` (should be `rem`)      | `src/app`, `lib/retro/` | `(gap\|margin\|padding):\s*\d+px` in `.scss` files                  |
| 4   | SCSS forbidden `&__element` nesting         | `src/app`, `lib/retro/` | `&__` in `.scss` files                                              |
| 5   | Interfaces/types declared inside components | `src/app`               | `^export (interface\|type) ` in `.component.ts` files               |
| 6   | `lib/retro/` isolation violation            | `lib/retro/`            | `from '@/` or `from '.*src/` inside `lib/retro/**/*.ts`             |

### Rule details

**1 — Signals without explicit type**

- `signal(` without an explicit `WritableSignal<T>` declaration.
- `computed(` without an explicit return type where it is not obvious.

**2 — JSDoc `@param` missing `{type}` braces**

- Methods with `@param name` but no `{type}` (standard JSDoc lint does not enforce the braces).

**3 — SCSS `px` spacing**

- `gap`, `margin`, `padding` values in `px` where `rem` is required.
- Accepted exception: decorative values on chips/badges (`padding: 2px 8px`).

**4 — SCSS `&__element` nesting**

- Pattern `&__element` that is not a `&--modifier`.
- Convention requires full class names (`.my-component__header`), not `&__header`.

**5 — Types inside components**

- `export interface` or `export type` in `.component.ts` files — they must live in `@/interfaces/` or `@/types/`.

**6 — `lib/retro/` isolation**

- Files under `lib/retro/` importing from `src/` or using `@/*` aliases (only `@retro/*`, `@retro/testing/*`, or npm packages are allowed).

## Report format

Group findings by category. For each violation include:

- File and line number
- Violation category (number from the table above)
- Affected code snippet
- Suggested fix

At the end, provide a summary with the total count per category. If a category has no violations, state it explicitly.
