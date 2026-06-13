---
description: "Generates a new component in lib/retro/ following the library's structural and coding conventions: standalone OnPush component, BEM styles, typed inputs/outputs, spec with 90% coverage target, and initial README. Use when the user wants to add a new retro component ('crea el componente retro', 'genera el componente en la lib', 'nuevo componente retro')."
argument-hint: '[name]'
---

Argument: $ARGUMENTS — component name without the `retro-` prefix, in kebab-case (e.g. `badge`, `progress-bar`, `tooltip`). The final component will be named `retro-<name>`.

## Structural rules

See CLAUDE.md — "Estructura de carpetas en lib/retro/" for the full folder layout rules.

Quick summary:

- Root folder: `lib/retro/retro-<name>/`.
- Only these files live at the root:
  - `retro-<name>.component.ts`
  - `retro-<name>.component.html`
  - `retro-<name>.component.scss`
  - `retro-<name>.component.spec.ts`
  - `retro-<name>.types.ts` (only if the component exposes public types: variants, sizes, modes, etc.)
  - `README.md`
- Everything else (child components, directives, interfaces, constants, tokens) goes in subdirectories: `components/retro-<name>-xxx/`, `directive/`, `interfaces/`, `constants/`, `tokens/`.
- `lib/retro/` must not import anything from `src/` or use `@/*` aliases. Only `@retro/*`, `@retro/testing/*`, or npm packages. Enforced by ESLint.

## Component conventions (.component.ts)

See CLAUDE.md — "Orden en componentes Angular" and "Convenciones de nombrado" for member ordering, naming, and JSDoc rules.

Additional lib-specific rules:

- `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`.
- Exact selector: `retro-<name>`.
- Inputs with `input<T>()` or `input.required<T>()`, explicitly typed as `InputSignal<T>`.
- Outputs with `output<T>()`, explicitly typed as `OutputEmitterRef<T>`.
- Computed signals with `computed<T>()`, typed as `Signal<T>`.
- JSDoc on the class header: what it does, available slots, mobile behavior if applicable.
- JSDoc on each input, output, and public signal (one line).

## Template conventions (.component.html)

- BEM class with block `retro-<name>`, elements `retro-<name>__element`, modifiers `retro-<name>--modifier` applied with `[class.retro-<name>--xxx]="condition()"`.
- Slots with `<ng-content select="[slot=xxx]" />` and semantic names (`start`, `end`, `header`, `footer`).
- Conditional ARIA attributes based on interactivity.

## Style conventions (.component.scss)

See CLAUDE.md — "SCSS" for spacing units, BEM class norms, and `@media` block placement.

Additional lib-specific rules:

- `:host { display: contents; }` unless the component needs to be a container with its own dimensions.
- Custom properties with prefix `--retro-<name>-xxx` for public tokens consumable from outside.

## Types conventions (.types.ts)

Only if the component exposes public variants/sizes/modes. Each type carries a brief JSDoc.

## Spec conventions (.component.spec.ts)

- `TestBed.configureTestingModule({ imports: [RetroXxxComponent] })`.
- One `it` per input/variant/modifier: checks the corresponding BEM class is present.
- If there are outputs: one `it` that triggers the action and verifies `emit`.
- If there are slots: a nested `describe('named slots')` with a `TestHost` per slot checking projection.
- If there are disabled/loading states: one `it` per state.
- Coverage target: 90% (lib threshold).

## Initial README.md

Follow the template at `.claude/skills/retro-readme/references/readme-template.md` for the exact section order, headings, and formatting rules.

For a brand-new component the minimum required sections are:

- Component name heading and one-sentence description.
- Metadata line: `**Selector:** \`retro-<name>\` · **Standalone:** yes · **CVA:** no/yes`.
- `## When to use / When NOT to use`
- `## API — Inputs` (if there are public inputs).
- `## Minimal example`

Omit any other section that does not apply yet; never leave empty sections or tables with no rows.

## Final steps

1. Add the export to `lib/retro/public-api.ts` in the `Componentes` section (preserve the existing grouped order).
2. If the component exposes public types, add them in the `Tipos expuestos a consumidores externos` section with `export type { ... }`.
3. List the created files for the user.
4. Do **not** commit or push. Do **not** run lint/tests unless the user explicitly asks.

## References in the repo

- Simple component with types: `lib/retro/retro-button/`.
- Component with computed signals and handlers: `lib/retro/retro-card/`.
- Component with dependent icon and computed size: `lib/retro/retro-chip/`.
