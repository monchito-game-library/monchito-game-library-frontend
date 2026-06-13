# retro-command-bar

Decorative terminal prompt bar styled as `PATH $ --flag1 --flag2 ▋`. Purely decorative, only visible on desktop (≥ 1024px); hidden on tablet and mobile via CSS.

**Selector:** `retro-command-bar` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: you want to reinforce the terminal aesthetic of a view by displaying the navigation context as a shell prompt.
- Do NOT use when: you need a functional action bar or an input field — this component is `aria-hidden` and is not interactive.

## API — Inputs

| Name     | Angular type                     | Default                | Description                                         |
| -------- | -------------------------------- | ---------------------- | --------------------------------------------------- |
| `path`   | `InputSignal<string>`            | `'monchito ~/library'` | Text of the path segment displayed before the `$`.  |
| `flags`  | `InputSignal<readonly string[]>` | `[]`                   | Array of flags displayed as `--flag` after the `$`. |
| `cursor` | `InputSignal<boolean>`           | `true`                 | If `true`, shows the blinking block cursor.         |

## Minimal example

```html
<retro-command-bar path="monchito ~/games" [flags]="['list', 'verbose']" />
```

## Gotchas

- The component has `aria-hidden="true"`: it is invisible to screen readers and must not contain functional information.
- Only visible from 1024px width upward; below that breakpoint the component is hidden with `display: none` via CSS.
- With `prefers-reduced-motion: reduce`, the cursor blink animation is disabled.
