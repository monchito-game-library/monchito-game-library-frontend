# retro-input

Self-contained Terminal Collector text field. Internalises `retro-form-field` + label + native input and manages them as a single unit.

**Selector:** `retro-input` · **Standalone:** yes · **CVA:** yes

## When to use / When NOT to use

- Use when: you need a single-line text field with an integrated label, reactive validation, and support for `formControlName` / `ngModel`.
- Do NOT use when: the text is multi-line — use `retro-textarea`. For search with autocomplete, use `retro-search`.

## API — Inputs

| Name             | Angular type                                                                 | Default     | Description                                                                             |
| ---------------- | ---------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`                                                        | `''`        | Label text. If empty, the label is not rendered.                                        |
| `placeholder`    | `InputSignal<string>`                                                        | `''`        | Native input placeholder.                                                               |
| `hint`           | `InputSignal<string \| null>`                                                | `null`      | Helper message below the field.                                                         |
| `error`          | `InputSignal<string \| null>`                                                | `null`      | Error message below the field.                                                          |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>`                                          | `'lg'`      | Field height: sm (32px), md (40px), lg (44px).                                          |
| `prefixIcon`     | `InputSignal<string \| null>`                                                | `null`      | Decorative Material icon name in the prefix area. Mutually exclusive with `prefixText`. |
| `prefixText`     | `InputSignal<string \| null>`                                                | `null`      | Short terminal prompt text (e.g. `"$ "`). Mutually exclusive with `prefixIcon`.         |
| `suffixIcon`     | `InputSignal<string \| null>`                                                | `null`      | Decorative Material icon name in the suffix area.                                       |
| `clearable`      | `InputSignal<boolean>`                                                       | `false`     | Shows the X clear button when the field has a value.                                    |
| `clearAriaLabel` | `InputSignal<string>`                                                        | `'Limpiar'` | `aria-label` for the clear button.                                                      |
| `hideSubscript`  | `InputSignal<boolean>`                                                       | `false`     | Hides the subscript block (hint/error). Useful for fields without visible validation.   |
| `type`           | `InputSignal<'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'>` | `'text'`    | Native input type.                                                                      |
| `autocomplete`   | `InputSignal<string>`                                                        | `'off'`     | `autocomplete` attribute of the native input.                                           |
| `maxlength`      | `InputSignal<number \| null>`                                                | `null`      | Maximum character length. `null` = no limit.                                            |
| `readonly`       | `InputSignal<boolean>`                                                       | `false`     | The input is read-only (not editable, but its value is included in the form).           |

## API — Outputs

| Name      | Angular type                      | Description                               |
| --------- | --------------------------------- | ----------------------------------------- |
| `cleared` | `OutputEmitterRef<void>`          | Emitted when the clear button is pressed. |
| `blur`    | `OutputEmitterRef<FocusEvent>`    | Blur event from the native input.         |
| `focus`   | `OutputEmitterRef<FocusEvent>`    | Focus event from the native input.        |
| `enter`   | `OutputEmitterRef<KeyboardEvent>` | Enter key press on the input.             |

## Slots

| Selector        | Expected content              | Description                                                                                                               |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `[retroPrefix]` | icon, button or other element | Content with its own behaviour in the prefix area (e.g. `retro-icon-button`). Rendered after `prefixIcon` / `prefixText`. |
| `[retroSuffix]` | icon, button or other element | Content with its own behaviour in the suffix area. Rendered after `suffixIcon`.                                           |

## CVA Contract

- `writeValue(value)`: accepts `string | null`; `null` normalises to `''` internally.
- `registerOnChange`: emits `string` (`emptyValue: ''` — never emits `null` to the form).
- `setDisabledState`: reflects `disabled`.

## Minimal example

```html
<retro-input
  label="Email"
  formControlName="email"
  type="email"
  placeholder="user@example.com"
  [clearable]="true"
  prefixIcon="mail"
  [error]="emailError()" />
```

```html
<!-- With custom retroSuffix slot -->
<retro-input label="URL" formControlName="url">
  <retro-icon-button retroSuffix icon="open_in_new" (clicked)="openUrl()" />
</retro-input>
```

```html
<!-- With terminal prompt prefix -->
<retro-input label="Command" formControlName="command" prefixText="$ " placeholder="npm install" />
```

## Gotchas

- When the field is cleared (manual deletion or clear button), the form receives `''`, not `null`. `Validators.required` correctly detects the empty field.
- `prefixIcon` and `prefixText` are mutually exclusive in the template: if both have a value, `prefixText` takes priority.
- The `[retroPrefix]` slot is always rendered, even when `prefixIcon` or `prefixText` is also present. Use one or the other to avoid visual duplicates.
