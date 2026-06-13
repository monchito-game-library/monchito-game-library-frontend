# retro-segmented

Exclusive segmented selection control (equivalent to a `radiogroup`) with terminal/neon aesthetics. Allows the user to choose one option from a set of segments; only one segment can be active at a time.

**Selector:** `retro-segmented` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: you need to select one option from a small, fixed set of mutually exclusive alternatives, visible at a glance.
- Do NOT use when: the set of options is large or dynamic — consider `retro-select` instead.

## API — Inputs

| Name        | Angular type                                                 | Default     | Description                                                     |
| ----------- | ------------------------------------------------------------ | ----------- | --------------------------------------------------------------- |
| `options`   | `InputSignal<readonly RetroSegmentedOption<T>[]>` (required) | —           | List of options to display as segments.                         |
| `value`     | `InputSignal<T \| undefined>`                                | `undefined` | Value of the currently selected segment.                        |
| `ariaLabel` | `InputSignal<string \| undefined>`                           | `undefined` | `aria-label` for the `[role=radiogroup]` container.             |
| `disabled`  | `InputSignal<boolean>`                                       | `false`     | When `true`, the control does not respond to user interactions. |

## API — Outputs

| Name      | Angular type          | Description                                                              |
| --------- | --------------------- | ------------------------------------------------------------------------ |
| `changed` | `OutputEmitterRef<T>` | Emits the value of the selected segment on click or keyboard navigation. |

## Exported Types

- `RetroSegmentedOption<T>` — interface for each control option:

```typescript
interface RetroSegmentedOption<T = string> {
  readonly value: T; // Value associated with the option
  readonly label: string; // Text visible in the segment
  readonly icon?: string; // Material Icons icon name (optional)
}
```

## Minimal example

```typescript
readonly viewOptions: readonly RetroSegmentedOption[] = [
  { value: 'grid', label: 'Grid', icon: 'grid_view' },
  { value: 'list', label: 'List', icon: 'list' },
];

selected = signal<string>('grid');
```

```html
<retro-segmented [options]="viewOptions" [value]="selected()" ariaLabel="View mode" (changed)="selected.set($event)" />
```

## Gotchas

- **ARIA semantics and keyboard navigation**: the container receives `role="radiogroup"` and each segment `role="radio"` with `aria-checked` reflecting the selection state. **Roving tabindex** is applied: only the active segment (or the first if no value is set) has `tabindex="0"`; the rest have `tabindex="-1"`.

| Key                        | Action                                                       |
| -------------------------- | ------------------------------------------------------------ |
| `ArrowRight` / `ArrowDown` | Next segment (with wrap-around) and automatic selection.     |
| `ArrowLeft` / `ArrowUp`    | Previous segment (with wrap-around) and automatic selection. |
| `Home`                     | First segment and automatic selection.                       |
| `End`                      | Last segment and automatic selection.                        |

- Navigation follows the APG **auto-activation** pattern: moving focus is equivalent to selecting. When the control is disabled, keyboard and mouse interactions have no effect.
