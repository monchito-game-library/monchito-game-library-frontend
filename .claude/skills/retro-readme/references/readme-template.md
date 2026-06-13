# README Template — retro components

This file is the canonical skeleton all retro component READMEs must follow.
A generator reading only this file knows the exact section order and headings to emit.

---

## Full skeleton

```markdown
# <component-name>

<one sentence: what it is + what it is for>

**Selector:** `<selector>` · **Standalone:** yes/no · **CVA:** yes/no

## When to use / When NOT to use

- Use when: <typical cases>.
- Do NOT use when: <alternative component in the same lib, if one exists>.

## API — Inputs

| Name  | Angular type                | Default | Description |
| ----- | --------------------------- | ------- | ----------- |
| `xxx` | `InputSignal<T>`            | `value` | ...         |
| `yyy` | `InputSignal<T> (required)` | —       | ...         |

## API — Outputs

| Name  | Angular type                | Description |
| ----- | --------------------------- | ----------- |
| `xxx` | `OutputEmitterRef<Payload>` | ...         |

## Slots

| Selector       | Expected content | Description |
| -------------- | ---------------- | ----------- |
| `[slot=start]` | icon or text     | ...         |
| _(default)_    | free block       | ...         |

## CVA Contract _(only if ControlValueAccessor is implemented)_

- `writeValue(value)`: accepts `<type>`; `null`/`undefined` normalize to `<value>`.
- `registerOnChange`: emits `<type>`.
- `setDisabledState`: reflects `disabled`.

## Exposed CSS Tokens _(only if tokens exist)_

| Variable | Default | Description |
| -------- | ------- | ----------- |

## Exported Types _(only if public types exist)_

- `RetroXxxVariant` — `'a' \| 'b'`

## Minimal example

\`\`\`html
<retro-x ... />
\`\`\`

## Gotchas

- <non-obvious behavior>.
```

---

## Section rules

Omit **completely** any section that does not apply. Never leave an empty section, "N/A", or a table with no rows:

- **API — Inputs**: omit if the component has no public inputs.
- **API — Outputs**: omit if the component has no public outputs.
- **Slots**: omit if there is no `<ng-content>` in the template.
- **CVA Contract**: include **ONLY** if the component implements `ControlValueAccessor` or has `NG_VALUE_ACCESSOR` in providers.
- **Exposed CSS Tokens**: include only if custom properties are consumed via `var(--retro-xxx, default)` in the `.scss`.
- **Exported Types**: include only if a `.types.ts` file with public types exists.
- **Gotchas**: include only if there are non-obvious behaviors detectable in `.ts`/`.html`/`.scss` (e.g., slots hidden in certain states, size promotion on mobile, context restrictions).

## Angular type rules

Use the correct Angular types in the "Angular type" column:

- `input()` → `InputSignal<T>`
- `input.required()` → `InputSignal<T> (required)` (Default = `—`)
- `output()` → `OutputEmitterRef<T>`
- `computed()` exposed publicly → `Signal<T>`
- Union types in tables: escape the pipe → `'a' \| 'b' \| 'c'`

## Formatting rules

- Compact metadata line: `**Selector:** \`xx\` · **Standalone:** yes · **CVA:** yes`(or`CVA: no`).
- "Default" column uses `—` for required inputs and the literal value for optional ones: `` `false` ``, `` `'lg'` ``.
- Pipes in markdown tables must be escaped: `` `'a' \| 'b'` ``.
- "When NOT to use" must point to an alternative component in the same lib when one exists.
- If an input is `@deprecated`, mark it in the Description column: **Deprecated** — use `xxx`.
- The minimal example must be functional with the real API. If a valid example already exists, keep it unless the API invalidates it.
- Do not include members marked `@internal` or with a `_` prefix (they are internal).
