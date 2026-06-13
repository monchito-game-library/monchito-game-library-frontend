# retro-textarea

Self-contained Terminal Collector multiline text area. Internalizes `retro-form-field` + label + native textarea and manages them as a single unit.

**Selector:** `retro-textarea` · **Standalone:** yes · **CVA:** yes

## When to use / When NOT to use

- Use when: a multiline text field with an integrated label and support for `formControlName` / `ngModel` is needed.
- Do NOT use when: the text is single-line — use `retro-input`.

## API — Inputs

| Name             | Angular type                        | Default     | Description                                                                                          |
| ---------------- | ----------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`               | `''`        | Field label text.                                                                                    |
| `placeholder`    | `InputSignal<string>`               | `''`        | Native textarea placeholder.                                                                         |
| `hint`           | `InputSignal<string \| null>`       | `null`      | Help message below the field.                                                                        |
| `error`          | `InputSignal<string \| null>`       | `null`      | Error message below the field.                                                                       |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>` | `'lg'`      | Base reference height: sm (32px), md (40px), lg (44px). In multiline mode it acts as a design token. |
| `rows`           | `InputSignal<number>`               | `3`         | Number of visible lines in the textarea.                                                             |
| `clearable`      | `InputSignal<boolean>`              | `false`     | Shows the X button to clear the field when it has a value.                                           |
| `clearAriaLabel` | `InputSignal<string>`               | `'Limpiar'` | `aria-label` for the clear button.                                                                   |
| `maxlength`      | `InputSignal<number \| null>`       | `null`      | Maximum character length. `null` = no limit.                                                         |
| `readonly`       | `InputSignal<boolean>`              | `false`     | The textarea is read-only (not editable, but the value is included in the form).                     |

## API — Outputs

| Name      | Angular type                   | Description                               |
| --------- | ------------------------------ | ----------------------------------------- |
| `cleared` | `OutputEmitterRef<void>`       | Emitted when the clear button is pressed. |
| `blur`    | `OutputEmitterRef<FocusEvent>` | Blur event from the native textarea.      |
| `focus`   | `OutputEmitterRef<FocusEvent>` | Focus event from the native textarea.     |

## Slots

| Selector        | Expected content      | Description                                            |
| --------------- | --------------------- | ------------------------------------------------------ |
| `[retroPrefix]` | icon or other element | Content in the prefix area of the internal form-field. |
| `[retroSuffix]` | icon or other element | Content in the suffix area of the internal form-field. |

## CVA Contract

- `writeValue(value)`: accepts `string | null`; `null` normalizes to `''` internally.
- `registerOnChange`: emits `string` (`emptyValue: ''` — never emits `null` to the form, identical to `retro-input`).
- `setDisabledState`: reflects `disabled`.

## Minimal example

```html
<retro-textarea
  label="Notes"
  formControlName="notes"
  [rows]="4"
  placeholder="Type here..."
  [clearable]="true"
  [error]="notesError()" />
```

## Gotchas

- Clear behavior is identical to `retro-input`: the form receives `''`, never `null`. `Validators.required` correctly detects the empty field.
- Native textarea resize is disabled by design (`resize: none`).
- In multiline mode the clear button is absolutely positioned in the top-right corner of the textarea.
- There is no `hideSubscript` input — the subscript block is always rendered (unlike `retro-input`).
