---
description: "Synchronizes the README.md of a retro component with its current public API by reading the source files and generating the standard AI-oriented format. Use when the user needs to update a component's documentation after API changes ('actualiza el README del componente', 'sincroniza el readme retro', 'regenera la documentacion del componente')."
argument-hint: '[component]'
---

Argument: $ARGUMENTS — component name with or without the `retro-` prefix (e.g. `button`, `retro-card`). If empty, infer the component from context (last file read/edited, current branch, user message). If inference is not possible, ask the user.

## Goal

The pre-commit hook (`scripts/check-retro-readme-sync.mjs`) blocks commits that touch API files (`.component.ts`, `.types.ts`, `.component.html`) without updating `README.md`. This skill ensures the README reflects the real API in the standard AI-oriented format.

## Steps

### 1. Locate the component folder

- Expected path: `lib/retro/retro-<name>/`.
- If the component has sub-components with their own README, ask the user which one(s) to sync, or sync all affected ones.

### 2. Read the sources of truth

Read in this order and extract the API:

- `retro-<name>.component.ts`:
  - Exact selector from the decorator.
  - `standalone` (confirm in the decorator; always `yes` in this lib but verify).
  - CVA: look for `ControlValueAccessor` in `implements` or `NG_VALUE_ACCESSOR` in `providers`.
  - Each `input<T>()` / `input.required<T>()`: name, correct Angular type (see type rules in the reference template), default (if applicable), JSDoc description.
  - Each `output<T>()`: name, payload type, JSDoc description.
  - Publicly exposed computed signals (no `_` prefix, no `@internal`): type `Signal<T>`.
  - If CVA: how `writeValue` works, what `registerOnChange` emits, whether `setDisabledState` is reflected.
- `retro-<name>.types.ts` (if it exists): list exported types with their possible values.
- `retro-<name>.component.html`:
  - `<ng-content select="[slot=xxx]" />`: each named slot.
  - `<ng-content />` (no select): default slot.
  - Conditional slot behavior (e.g. hidden during `loading`).
- `retro-<name>.component.scss`:
  - Custom properties consumed via `var(--retro-<name>-xxx, default)`: document as public tokens.
  - Ignore internal variables that are not external customization points.

Ignore everything marked `@internal` or prefixed with `_` (internal).

### 3. Build the README

Use the canonical skeleton and rules defined in:

> `.claude/skills/retro-readme/references/readme-template.md`

That file contains: the full section skeleton, section rules (which sections to omit), Angular type rules, and formatting rules. Do not duplicate any of those rules here.

### 4. Verify before writing

- Compare input by input, output by output, slot by slot: remove anything in the README that no longer exists in the code; add anything in the code that is missing from the README.
- Do not include members marked `@internal` or with a `_` prefix.
- Confirm the `**Selector:**` line uses the exact selector from the `@Component` decorator.

## Final steps

1. Overwrite `lib/retro/retro-<name>/README.md` with the synchronized content.
2. Show the user a brief summary of what changed (fields added/removed/updated, sections added or removed).
3. Do **not** commit or push. Do **not** run lint/test unless explicitly requested.

## References in the repo

- Canonical example (no CVA, no tokens): `lib/retro/retro-button/README.md`.
- Example with custom properties: `lib/retro/retro-card/README.md`.
- See CLAUDE.md section "Libreria retro — sincronia de README" for project-level sync rules and commit requirements.
