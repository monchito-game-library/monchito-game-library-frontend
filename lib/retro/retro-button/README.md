# retro-button

Reusable Terminal Collector button with `[ LABEL ]` brackets on desktop (pseudo-elements hidden on mobile ≤ 768px). Accepts icon/content slots on both sides of the label.

**Selector:** `retro-button` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: an action button with visible text is needed (save, cancel, open dialog, submit form).
- Do NOT use when: the button carries only an icon with no text — use `retro-icon-button` instead.

## API — Inputs

| Name        | Angular type                     | Default    | Description                                                                                |
| ----------- | -------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `label`     | `InputSignal<string> (required)` | —          | Button text; displayed in uppercase.                                                       |
| `variant`   | `InputSignal<LibButtonVariant>`  | `'ghost'`  | Visual variant: `'primary'`, `'ghost'`, `'danger'`, `'success'`.                           |
| `size`      | `InputSignal<RetroButtonSize>`   | `'lg'`     | Button height: `sm` (32px), `md` (40px), `lg` (44px). On mobile ≤ 768px, `sm`/`md` → 44px. |
| `disabled`  | `InputSignal<boolean>`           | `false`    | Disables the button.                                                                       |
| `loading`   | `InputSignal<boolean>`           | `false`    | Shows a loading spinner and disables the button. Hides the `start` and `end` slots.        |
| `type`      | `InputSignal<LibButtonType>`     | `'button'` | Native `<button>` HTML type: `'button'`, `'submit'`, `'reset'`.                            |
| `fullWidth` | `InputSignal<boolean>`           | `false`    | If `true`, the button takes full available width (`width: 100%`).                          |

## API — Outputs

| Name      | Angular type                   | Description                                                         |
| --------- | ------------------------------ | ------------------------------------------------------------------- |
| `clicked` | `OutputEmitterRef<MouseEvent>` | Emits the `MouseEvent` on click; only when not disabled or loading. |

## Slots

| Selector       | Expected content        | Description                                                                       |
| -------------- | ----------------------- | --------------------------------------------------------------------------------- |
| `[slot=start]` | icon or text            | Content to the left of the label. Hidden when `loading` is `true`.                |
| `[slot=end]`   | icon, badge or keyboard | Content to the right of the label (chevrons, `<kbd>`, badges). Hidden on loading. |

## Exposed CSS Tokens

| Variable                    | Default | Description                                                                                                                                                                                                           |
| --------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--retro-btn-bottom-offset` | `0`     | Adjusts the `margin-bottom` of the button to vertically align it with the control box of a sibling `retro-form-field` in a flex row. Typical value: `1.25rem`. Set on the parent container, not on the button itself. |

## Exported Types

- `LibButtonVariant` — `'primary' \| 'ghost' \| 'danger' \| 'success'`
- `RetroButtonSize` — `'sm' \| 'md' \| 'lg'`
- `LibButtonType` — `'button' \| 'submit' \| 'reset'`

## Minimal example

```html
<retro-button label="Save" variant="primary" (clicked)="onSave($event)">
  <retro-icon slot="start" name="save" size="sm" />
</retro-button>
```

## Gotchas

- On mobile (≤ 768px) the `[ ]` bracket pseudo-elements are hidden; `sm` and `md` sizes are automatically promoted to 44px to meet the minimum touch target.
- When `loading` is `true`, the `[slot=start]` and `[slot=end]` slots are hidden and an internal spinner is shown; the button is also disabled.
- The host has `display: contents`, so the component does not generate its own box. The visible dimensions are dictated by the inner `<button>`.
