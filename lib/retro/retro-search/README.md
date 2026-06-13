# retro-search

Self-contained Terminal Collector autocomplete search field. Internalises `retro-form-field` + native input + overlay panel. The consumer projects `<retro-option>` elements and the component manages panel opening.

**Selector:** `retro-search` · **Standalone:** yes · **CVA:** yes

## When to use / When NOT to use

- Use when: a text field with autocomplete is needed where the parent controls the filtered option list and the component manages the overlay panel.
- Do NOT use when: a closed selector (no free text) is needed — use `retro-select` instead.

## API — Inputs

| Name             | Angular type                                        | Default     | Description                                                                                  |
| ---------------- | --------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`                               | `''`        | Field label text.                                                                            |
| `placeholder`    | `InputSignal<string>`                               | `''`        | Native input placeholder.                                                                    |
| `hint`           | `InputSignal<string \| null>`                       | `null`      | Help message below the field.                                                                |
| `error`          | `InputSignal<string \| null>`                       | `null`      | Error message below the field.                                                               |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>`                 | `'lg'`      | Field height: sm (32px), md (40px), lg (44px).                                               |
| `prefixIcon`     | `InputSignal<string \| null>`                       | `'search'`  | Material icon name in the prefix. Shows the search icon by default.                          |
| `suffixIcon`     | `InputSignal<string \| null>`                       | `null`      | Decorative Material icon name in the suffix.                                                 |
| `clearable`      | `InputSignal<boolean>`                              | `false`     | Shows the X button to clear when there is a value or text.                                   |
| `clearAriaLabel` | `InputSignal<string>`                               | `'Limpiar'` | `aria-label` of the clear button.                                                            |
| `hideSubscript`  | `InputSignal<boolean>`                              | `false`     | Hides the subscript block (hint/error) of the internal form-field.                           |
| `displayWith`    | `InputSignal<((value: unknown) => string) \| null>` | `null`      | Function to convert the selected value into the visible text shown in the input.             |
| `minChars`       | `InputSignal<number>`                               | `0`         | Minimum number of characters required to open the panel. With `0`, the panel opens on focus. |

## API — Outputs

| Name             | Angular type                | Description                                                                      |
| ---------------- | --------------------------- | -------------------------------------------------------------------------------- |
| `queryChange`    | `OutputEmitterRef<string>`  | Emits the current text each time the user types. The parent filters the options. |
| `optionSelected` | `OutputEmitterRef<unknown>` | Emits the value of the selected option.                                          |
| `cleared`        | `OutputEmitterRef<void>`    | Emits when the clear button is pressed.                                          |

## Slots

| Selector        | Expected content               | Description                                                             |
| --------------- | ------------------------------ | ----------------------------------------------------------------------- |
| _(default)_     | `<retro-option>`               | Autocomplete options. Come from `retro-select/components/retro-option`. |
| `[retroPrefix]` | icon, button, or other element | Additional content in the prefix area (after `prefixIcon`).             |
| `[retroSuffix]` | icon, button, or other element | Additional content in the suffix area (after `suffixIcon`).             |

## CVA Contract

- `writeValue(value)`: accepts `unknown`; `null`/`undefined` clears the visible text and the selected value. If `displayWith` is set, it is applied to the received value to update the visible text.
- `registerOnChange`: emits `unknown` (the value of the selected option).
- `setDisabledState`: reflects `disabled`.

## Minimal example

```html
<retro-search
  label="Plataforma"
  formControlName="platform"
  placeholder="Escribe para buscar..."
  [displayWith]="displayPlatformLabel"
  [clearable]="true"
  (queryChange)="filterPlatforms($event)">
  @for (p of filteredPlatforms(); track p.code) {
  <retro-option [value]="p.code">{{ p.labelKey | transloco }}</retro-option>
  }
</retro-search>
```

## Gotchas

- `displayWith` must be `(value: unknown) => string` — the `value` type is `unknown` by design. Cast inside the function: `(v) => (v as PlatformCode) ? platformsMap.get(v as PlatformCode)?.label ?? '' : ''`.
- Projected options are `<retro-option>` from the `retro-select` module (confirmed reuse). Do not confuse with a standard HTML element.
- The panel has two independent states: `_displayValue` (what the user types) and `_selectedValue` (the actual `FormControl` value). Typing text does not change the form value until an option is selected.
- When clearing (`onClear`), the form receives `null` (unlike `retro-input`, which emits `''`).
- Keyboard navigation is active: `ArrowDown` / `ArrowUp` navigates options, `Enter` selects, `Escape` closes, `Home` / `End` go to first / last option.
- If options are loaded asynchronously after a value is already selected, the component automatically updates the visible text when the list changes (via `displayWith` or value lookup).
