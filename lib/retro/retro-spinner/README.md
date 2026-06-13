# retro-spinner

Reusable ASCII spinner for Terminal Collector. Pure CSS animation with discrete frames on `::before`; no Material, no SVG.

**Selector:** `retro-spinner` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: a loading state needs to be indicated — both full-screen (`md`/`lg`) and inline inside a button or text (`inline`/`sm`).
- Do NOT use when: the loading state is already handled by `retro-button` with `loading="true"` — that component includes a built-in spinner.

## API — Inputs

| Name        | Angular type                     | Default     | Description                                                                                    |
| ----------- | -------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `size`      | `InputSignal<LibSpinnerSize>`    | `'md'`      | Size: `'inline'` (1em, inside a button/line), `'sm'` (1.125rem), `'md'` (2rem), `'lg'` (3rem). |
| `variant`   | `InputSignal<LibSpinnerVariant>` | `'bars'`    | Animated glyph: `'bars'` (`\|/-\\`), `'dots'` (`....`), `'blocks'` (`▖▘▝▗`).                   |
| `ariaLabel` | `InputSignal<string>`            | `'Loading'` | Accessible label for screen readers (`aria-label` on `role="status"`).                         |

## Exported Types

- `LibSpinnerSize` — `'inline' \| 'sm' \| 'md' \| 'lg'`
- `LibSpinnerVariant` — `'bars' \| 'dots' \| 'blocks'`

## Minimal example

```html
<!-- Full-screen loading -->
<retro-spinner size="md" variant="bars" ariaLabel="Loading" />

<!-- Inline inside text or a custom button -->
<retro-spinner size="inline" variant="dots" />
```

## Gotchas

- **`prefers-reduced-motion`**: when the system has reduced-motion preference enabled, the animation is disabled (`animation: none`) and `::before` shows the static frame `...`. The component remains visible and accessible.
- **Responsive sizes**: on mobile (≤ 768px) `md` and `lg` sizes are automatically reduced (`md`: 2rem → 1.75rem, `lg`: 3rem → 2.25rem). `inline` and `sm` sizes do not change.
- **`bars` variant**: animates via `transform: rotate()` on the `|` character instead of changing `content` on `::before`. This ensures compatibility with browsers that do not support `content` animations.
- The component has `display: inline-block` and does not generate a block box — it can be used directly inside flowing text or flex containers without extra adjustments.
