# retro-skeleton

Reusable Terminal Collector loading placeholder. A flat rectangle with no border-radius and a horizontal CRT shimmer. Used as a visual substitute for content while asynchronous data is loading.

**Selector:** `retro-skeleton` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: async content is loading (game list, card detail, image) and you want to avoid layout shift by showing a same-size placeholder.
- Do NOT use when: loading is instantaneous or the `retro-button` spinner with `loading` already covers the case.

## API — Inputs

| Name     | Angular type                    | Default  | Description                                                            |
| -------- | ------------------------------- | -------- | ---------------------------------------------------------------------- |
| `width`  | `InputSignal<string>`           | `'100%'` | CSS width of the block (e.g. `'120px'`, `'100%'`).                     |
| `height` | `InputSignal<string>`           | `'1rem'` | CSS height of the block (e.g. `'1rem'`, `'120px'`).                    |
| `shape`  | `InputSignal<LibSkeletonShape>` | `'line'` | Optional semantic alias. Does not alter geometry (always rectangular). |

## Exported Types

- `LibSkeletonShape` — `'line' \| 'square' \| 'block'`

## Minimal example

```html
<retro-skeleton width="200px" height="1.25rem" /> <retro-skeleton width="100%" height="120px" shape="block" />
```

## Gotchas

- Geometry is always rectangular (border-radius 0); the `shape` input is a semantic alias with no visual effect in this version — reserved for future tweaks.
- The shimmer uses a 4-stop gradient with a CRT violet tint `rgba(124, 58, 237, 0.14)` at the peak (40%), aligned with the Terminal Collector primary color. The tint is only perceptible during the animation (1.4s linear infinite).
- With `prefers-reduced-motion: reduce`, the animation stops completely and the tint disappears; the background becomes a flat `--bg-surface-hi`.
- The component emits `role="status"` with `aria-busy="true"` and `aria-live="polite"`, so screen readers will announce the change when the skeleton disappears and real content appears.
