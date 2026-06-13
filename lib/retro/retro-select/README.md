# retro-select

Accessible Terminal Collector select (combobox + listbox pattern, APG). A self-contained component that internalises the label, hint, and error — the consumer only needs to provide the options and wire up the control.

**Selector:** `retro-select` · **Standalone:** yes · **CVA:** yes

## When to use / When NOT to use

- Use when: the user must choose a value from a closed list of options (platform, status, category, etc.).
- Do NOT use when: you need text-based search over the options — use `retro-search` instead.

## API — Inputs

| Name             | Angular type                        | Default     | Description                                                                                    |
| ---------------- | ----------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`               | `''`        | Label text for the field.                                                                      |
| `placeholder`    | `InputSignal<string>`               | `''`        | Placeholder text when no option is selected.                                                   |
| `hint`           | `InputSignal<string \| null>`       | `null`      | Helper message below the field.                                                                |
| `error`          | `InputSignal<string \| null>`       | `null`      | Error message below the field.                                                                 |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>` | `'lg'`      | Field height: `sm` (32px), `md` (40px), `lg` (44px).                                           |
| `prefixIcon`     | `InputSignal<string \| null>`       | `null`      | Decorative Material icon name in the prefix.                                                   |
| `suffixIcon`     | `InputSignal<string \| null>`       | `null`      | Decorative Material icon name in the suffix.                                                   |
| `clearable`      | `InputSignal<boolean>`              | `false`     | Shows an X button to clear the selection when a value is selected.                             |
| `clearAriaLabel` | `InputSignal<string>`               | `'Limpiar'` | `aria-label` for the clear button.                                                             |
| `hideSubscript`  | `InputSignal<boolean>`              | `false`     | Hides the subscript block (hint/error). Useful for search fields without visible validation.   |
| `value`          | `InputSignal<unknown>`              | `undefined` | Value in standalone mode (without `formControlName`). Equivalent to `[value]` on `mat-select`. |

## API — Outputs

| Name              | Angular type                | Description                                          |
| ----------------- | --------------------------- | ---------------------------------------------------- |
| `selectionChange` | `OutputEmitterRef<unknown>` | Emits the new value when the user selects an option. |
| `cleared`         | `OutputEmitterRef<void>`    | Emits when the user presses the clear button.        |

## Slots

| Selector        | Expected content       | Description                                                              |
| --------------- | ---------------------- | ------------------------------------------------------------------------ |
| _(default)_     | `<retro-option>` nodes | Options projected into the listbox. Required.                            |
| `[retroPrefix]` | element with directive | Elements with their own behaviour in the prefix (buttons, badges, etc.). |
| `[retroSuffix]` | element with directive | Elements with their own behaviour in the suffix.                         |

## Subcomponent — `<retro-option>`

**Selector:** `retro-option` · **Standalone:** yes · **Required inside `retro-select`.**

| Name       | Angular type                                            | Default | Description                                             |
| ---------- | ------------------------------------------------------- | ------- | ------------------------------------------------------- |
| `value`    | `InputSignalWithTransform<unknown, unknown> (required)` | —       | Opaque value emitted when this option is selected.      |
| `disabled` | `InputSignalWithTransform<boolean, unknown>`            | `false` | Disables the option. Accepts `boolean` or empty string. |

Content projected into the default slot of `<retro-option>` is used as the visible label. `<retro-icon>` and `.material-icons` elements are automatically excluded from the label text so the trigger does not display the icon name.

## CVA Contract

- `writeValue(value: unknown)`: accepts any value; `null` and `undefined` clear the selection.
- `registerOnChange`: emits `unknown` (the value of the selected option, or `null` when cleared).
- `setDisabledState`: reflects `disabled` via the internal `_isDisabled` signal.

## Minimal example

Reactive mode (form):

```html
<retro-select label="Status" formControlName="status" placeholder="Select...">
  @for (s of statuses; track s.code) {
  <retro-option [value]="s.code">{{ s.label }}</retro-option>
  }
</retro-select>
```

Standalone mode (without form):

```html
<retro-select label="Platform" [value]="selectedPlatform" (selectionChange)="onPlatformChange($event)">
  @for (p of platforms; track p.id) {
  <retro-option [value]="p">{{ p.name }}</retro-option>
  }
</retro-select>
```

With a complex object — if the option `value` is an object and you want to display a specific property in the trigger, pass the visible text directly as the content of `<retro-option>`:

```html
<!-- The trigger displays the textContent of the selected retro-option -->
<retro-option [value]="game">{{ game.title }}</retro-option>
```

## Gotchas

- **Panel rendered outside the select DOM**: the listbox is inserted via CDK Overlay into a root `<div>` of the document (not inside `retro-select`). Panel styles go in the global `styles.scss` under `.retro-select__panel`, not in the component's `.scss`.
- **`[value]=undefined` clears the selection**: in standalone mode, passing `undefined` or `null` to the `value` input are equivalent — both clear the current selection. This is symmetric with the `writeValue` behaviour.
- **Objects as value**: `displayValue` looks for the option whose `value()` strictly matches (`===`) the current value. If you pass objects, the reference must be the same instance; otherwise the trigger will show `String(value)` as a fallback. To avoid this, use primitives (id, code) as the option `value` and display the label only as projected content.
- **`disabled` on `retro-option` as an attribute**: the input accepts `booleanAttribute` transform, so `<retro-option disabled>` (without a value) activates the flag correctly in addition to `[disabled]="true"`.
- **Keyboard navigation**: ArrowDown/Up moves the highlight, Enter/Space confirms the active option, Escape closes without changing the value, Tab confirms the active option and closes, Home/End jumps to the first/last item.
