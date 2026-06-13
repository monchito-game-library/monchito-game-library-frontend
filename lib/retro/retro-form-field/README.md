> **@internal** — This piece is for internal use within the retro library. Do not use it directly in your application; use the self-contained components instead: `retro-input`, `retro-select`, `retro-search`, `retro-datepicker`.

# retro-form-field

Terminal Collector form field container. Groups a label, a projected control (input, select, search, datepicker…), error messages, and hint text. No floating label.

**Selector:** `retro-form-field` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: you need to wrap a native control (`input retroInput`) or a self-contained control that does not have an integrated label. Also used internally by `retro-input`, `retro-select`, `retro-search`, and `retro-datepicker`.
- Do NOT use when: you can use `retro-input`, `retro-textarea`, `retro-select`, or `retro-search` directly — these already internalize the form-field.

## API — Inputs

| Name             | Angular type                                 | Default     | Description                                                                                  |
| ---------------- | -------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `controlRef`     | `InputSignal<RetroFormFieldControl \| null>` | `null`      | Control injected in self-contained mode. Takes priority over the contentChild.               |
| `disabled`       | `InputSignal<boolean>`                       | `false`     | Visually disables the field (no pointer-events, reduced opacity).                            |
| `multiline`      | `InputSignal<boolean>`                       | `false`     | Enables multiline mode: vertical stretch, no min-height, clear button at absolute top-right. |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>`          | `'lg'`      | Field height: sm (32px), md (40px), lg (44px).                                               |
| `clearable`      | `InputSignal<boolean>`                       | `false`     | Shows the clear (X) button when the control has a value.                                     |
| `clearAriaLabel` | `InputSignal<string>`                        | `'Limpiar'` | `aria-label` of the clear button.                                                            |
| `hideSubscript`  | `InputSignal<boolean>`                       | `false`     | Hides the subscript block (hint/error). Use for fields without visible validation.           |

## API — Outputs

| Name      | Angular type             | Description                                                                                         |
| --------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| `cleared` | `OutputEmitterRef<void>` | Emits when the clear button is pressed. The internal control is responsible for clearing the value. |

## Slots

| Selector                    | Expected content               | Description                                                                   |
| --------------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `retro-label, [retroLabel]` | `<retro-label>`                | Field label. Always above the control.                                        |
| `[retroPrefix]`             | icon, text, or other element   | Content before the control (inside the border).                               |
| _(default)_                 | native control or directive    | The main control (`input retroInput`, etc.).                                  |
| `[retroSuffix]`             | icon, button, or other element | Content after the control (inside the border).                                |
| `retro-error, [retroError]` | `<retro-error>`                | Error message. Only visible when the control is invalid and has been touched. |
| `retro-hint, [retroHint]`   | `<retro-hint>`                 | Help text. Only visible when the control is valid.                            |

## Exposed CSS Tokens

| Variable                    | Default | Description                                                                                                                              |
| --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--retro-btn-bottom-offset` | `0`     | Vertical offset to align adjacent buttons with the bottom border of the control. Available inside the `.retro-form-field__control` area. |

## Minimal example

```html
<retro-form-field [size]="'md'">
  <retro-label [required]="true">Email</retro-label>
  <input retroInput type="email" formControlName="email" />
  @if (form.controls.email.hasError('required')) {
  <retro-error>Required field</retro-error>
  }
  <retro-hint>Use your corporate email</retro-hint>
</retro-form-field>
```

## Gotchas

- The clear button only appears in the DOM when `clearable` is `true` and the control has a value (`!empty`). It is hidden when the control is disabled.
- The projected control is discovered via the `RETRO_FORM_FIELD_CONTROL` token. Any control that implements `RetroFormFieldControl` and provides the token integrates automatically.
- `controlRef` (self-contained mode) takes priority over the contentChild. Components like `retro-input`, `retro-select`, etc. pass `[controlRef]="this"` so that the internal form-field discovers them even when they are not projected content.
- `retro-error` and `retro-hint` are mutually exclusive: if the control is in an invalid state the error is shown; if it is valid, the hint is shown. Only one is visible at a time.
