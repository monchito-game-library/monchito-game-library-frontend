# retro-datepicker

Self-contained datepicker (APG Date Picker Dialog Grid Pattern) that internalises `retro-form-field`, the native input, and the calendar panel. The consumer only declares the component with `formControlName`.

**Selector:** `retro-datepicker` · **Standalone:** yes · **CVA:** yes

## When to use / When NOT to use

- Use when: a specific date (day, month, and year) bound to a `FormControl` needs to be selected.
- Do NOT use when: the selection is month/year only with no day — consider a custom component in that case, as the day grid does not apply.

## API — Inputs

| Name             | Angular type                        | Default     | Description                                                                                    |
| ---------------- | ----------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`               | `''`        | Field label text.                                                                              |
| `placeholder`    | `InputSignal<string>`               | `''`        | Native input placeholder.                                                                      |
| `hint`           | `InputSignal<string \| null>`       | `null`      | Help message below the field.                                                                  |
| `error`          | `InputSignal<string \| null>`       | `null`      | Error message below the field.                                                                 |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>` | `'lg'`      | Field height: `sm` 32px, `md` 40px, `lg` 44px.                                                 |
| `prefixIcon`     | `InputSignal<string \| null>`       | `null`      | Decorative Material icon name in the prefix.                                                   |
| `clearable`      | `InputSignal<boolean>`              | `false`     | Shows an X button to clear when a date is selected.                                            |
| `clearAriaLabel` | `InputSignal<string>`               | `'Limpiar'` | `aria-label` of the clear button.                                                              |
| `hideSubscript`  | `InputSignal<boolean>`              | `false`     | Hides the subscript block (hint/error) of the internal `retro-form-field`.                     |
| `min`            | `InputSignal<Date \| null>`         | `null`      | Minimum selectable date. Days outside the range are disabled in the grid.                      |
| `max`            | `InputSignal<Date \| null>`         | `null`      | Maximum selectable date. Days outside the range are disabled in the grid.                      |
| `locale`         | `InputSignal<string>`               | `'es-ES'`   | BCP 47 locale for month names, weekday names and the display format of the input (dd/MM/yyyy). |

## API — Outputs

| Name      | Angular type             | Description                                   |
| --------- | ------------------------ | --------------------------------------------- |
| `cleared` | `OutputEmitterRef<void>` | Emits when the user presses the clear button. |

## CVA Contract

- `writeValue(value)`: accepts `Date`, ISO string (`YYYY-MM-DD`), or `null`/`undefined`. Strings are parsed as local dates (avoids UTC offset). `null`/`undefined` clears the selection.
- `registerOnChange`: emits `Date | null`. The returned value is always a `Date` built without a time component (local midnight), compatible with `FormControl<Date | null>`.
- `setDisabledState`: reflects `disabled` on the native input and blocks calendar opening.

## Integration with retro-form-field

`retro-datepicker` internally contains a `retro-form-field`. The inputs `label`, `hint`, `error`, `size`, `prefixIcon`, `clearable`, `hideSubscript` are forwarded directly to the internal `retro-form-field`. The suffix (calendar toggle button) is reserved internally — no `[retroPrefix]` or `[retroSuffix]` slots are exposed to the consumer. For a decorative icon in the prefix, use the `prefixIcon` input.

## Minimal example

```html
<retro-datepicker label="Fecha de compra" formControlName="purchaseDate" [min]="minDate" [clearable]="true" />
```

With English locale:

```html
<retro-datepicker label="Purchase date" formControlName="purchaseDate" locale="en-US" />
```

## Gotchas

- **ISO strings and UTC**: passing `'2024-06-15'` as a string to `writeValue` is parsed as a local date (not UTC midnight). If a `Date` is constructed with `new Date('2024-06-15')`, it is interpreted as UTC and may display the previous day in UTC- zones. Prefer constructing `Date` with `new Date(2024, 5, 15)` or letting the component parse the ISO string.
- **Emitted value is always `Date`**: even though `writeValue` accepts strings, `registerOnChange` always emits `Date`. Type the `FormControl` as `FormControl<Date | null>`.
- **Keyboard navigation respects min/max**: arrow keys, PageUp/Down, and Home/End cannot go beyond the `min`/`max` limits — focus is clamped at the range boundary.
- **`locale` affects month name and display format**: the calendar header ("mayo 2026", "May 2026") and the input text (`dd/MM/yyyy` for `es-ES`, `MM/dd/yyyy` for `en-US`) depend on the configured locale. Changing `locale` at runtime updates the display on the next `_rebuildCalendar`.
- **Panel via CDK Overlay**: the calendar is teleported to the CDK `OverlayContainer`, outside the host DOM tree. Tests that look for the day grid must search in `document.body` or use `OverlayContainer` from `@angular/cdk/overlay`.
- **Month/year selection**: the component does not expose month-only or year-only navigation. For that use case, build a custom component.
