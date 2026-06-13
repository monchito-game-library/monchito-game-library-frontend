# retro-icon-button

Reusable Terminal Collector icon button. Native `<button>` with an internal `<retro-icon>`. 1px border on hover, no ripple and no Material Buttons.

**Selector:** `retro-icon-button` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: the action only needs an icon with no visible text (delete row, close panel, copy, inline edit).
- Do NOT use when: the button must show visible text alongside the icon — use `retro-button` with a `[slot=start]` slot.

## API — Inputs

| Name        | Angular type                        | Default    | Description                                                     |
| ----------- | ----------------------------------- | ---------- | --------------------------------------------------------------- |
| `icon`      | `InputSignal<string> (required)`    | —          | Material Icons icon name (webfont ligature).                    |
| `ariaLabel` | `InputSignal<string> (required)`    | —          | Required accessible label — there is no visible text on screen. |
| `variant`   | `InputSignal<LibIconButtonVariant>` | `'ghost'`  | Visual variant: `'primary'`, `'ghost'`, `'danger'`.             |
| `size`      | `InputSignal<LibIconButtonSize>`    | `'md'`     | Button size: `sm` (32px), `md` (40px), `lg` (44px).             |
| `disabled`  | `InputSignal<boolean>`              | `false`    | Disables the button.                                            |
| `type`      | `InputSignal<LibButtonType>`        | `'button'` | Native `<button>` HTML type: `'button'`, `'submit'`, `'reset'`. |

## API — Outputs

| Name      | Angular type                   | Description                                              |
| --------- | ------------------------------ | -------------------------------------------------------- |
| `clicked` | `OutputEmitterRef<MouseEvent>` | Emits the `MouseEvent` on click; only when not disabled. |

## Exposed CSS Tokens

| Variable                    | Default | Description                                                                                                                                                                            |
| --------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--retro-btn-bottom-offset` | `0`     | Adjusts `margin-bottom` to vertically align with the control box of a sibling `retro-form-field` in a flex row. Typical value: `1.25rem`. Set on the parent container, not the button. |

## Exported Types

- `LibIconButtonVariant` — `'primary' \| 'ghost' \| 'danger'`
- `LibIconButtonSize` — `'sm' \| 'md' \| 'lg'`
- `LibButtonType` — `'button' \| 'submit' \| 'reset'` (imported from `retro-button`)

## Minimal example

```html
<retro-icon-button icon="delete" ariaLabel="Delete" variant="danger" size="sm" (clicked)="onDelete()" />
```

## Gotchas

- `ariaLabel` is required because there is no visible text: without it the button would be inaccessible to screen readers.
- The host uses `display: contents`, meaning it generates no box of its own. Overlays anchored to the component (e.g. `matTooltip`, `matMenuTriggerFor`) are resolved against the inner `<button>`. If you need the `<button>` anchor from an external overlay, use `querySelector('button')` on the host element.
- On mobile (≤ 768px) the `sm` and `md` sizes are automatically promoted to 44px to meet the minimum touch target requirement.
