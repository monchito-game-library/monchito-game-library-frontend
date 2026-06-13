# retro-checkbox

Reusable terminal `[X]` / `[ ]` checkbox with a monochrome visual pattern. Supports standalone mode (direct binding) and CVA mode (reactive forms).

**Selector:** `retro-checkbox` · **Standalone:** yes · **CVA:** yes

## When to use / When NOT to use

- Use when: a boolean selection control is needed with checkbox semantics (`role="checkbox"`).
- Do NOT use when: a visual on/off toggle is needed to enable/disable a setting — consider `retro-toggle` if it exists in the lib.

## API — Inputs

| Name       | Angular type                       | Default     | Description                                                                 |
| ---------- | ---------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `checked`  | `InputSignal<boolean>`             | `false`     | Checked state in standalone mode. Ignored when `formControlName` is active. |
| `label`    | `InputSignal<string \| undefined>` | `undefined` | Optional label to the right of the control (mono uppercase).                |
| `size`     | `InputSignal<LibCheckboxSize>`     | `'md'`      | Glyph size: `'sm'` (0.875rem) or `'md'` (1rem).                             |
| `disabled` | `InputSignal<boolean>`             | `false`     | Disables the control in standalone mode. CVA uses `setDisabledState`.       |

## API — Outputs

| Name      | Angular type                | Description                                                                              |
| --------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| `changed` | `OutputEmitterRef<boolean>` | Emits the new boolean value after each toggle. Emitted in both standalone and CVA modes. |

## CVA Contract

- `writeValue(value)`: accepts `boolean`; any falsy value normalises to `false` (`!!v`).
- `registerOnChange`: emits `boolean`.
- `setDisabledState`: reflects `disabled`.

## Exported Types

- `LibCheckboxSize` — `'sm' \| 'md'`

## Minimal example

```html
<!-- CVA mode with reactive form -->
<retro-checkbox formControlName="includeArchived" label="SHOW ARCHIVED" />
```

```html
<!-- Standalone mode -->
<retro-checkbox [checked]="isSelected()" (changed)="onToggle($event)" label="FAVOURITE" />
```

## Gotchas

- The visual glyph is `[X]` (checked) and `[ ]` (unchecked) — a discrete change with no transition animation (Terminal Collector rule).
- ARIA: the root element has `role="checkbox"` and `aria-checked` bound to the internal value. Do not use as a semantic on/off switch.
- In CVA mode, the `[checked]` binding and the `disabled` input are ignored — the control gets its state exclusively from `writeValue` / `setDisabledState`.
- On mobile the minimum touch target is 44×44px even if the glyph is visually smaller.
