# retro-badge

Reusable Terminal Collector numeric badge. 1px border in the semantic colour, monospaced uppercase label, no border-radius. Designed to show a numeric level (1–5) representing priority or quantity.

**Selector:** `retro-badge` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: a compact visual indicator of a numeric priority, level, or quantity is needed (wishlist priority P1–P5, stock counters, ranking positions, etc.).
- Do NOT use when: a textual label is needed — use `retro-chip`. For interactive controls, use `retro-button` or `retro-icon-button`.

## API — Inputs

| Name      | Angular type                              | Default     | Description                                                                                                                                  |
| --------- | ----------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`   | `InputSignal<number> (required)`          | —           | Numeric value to display (typically 1–5).                                                                                                    |
| `variant` | `InputSignal<RetroBadgeVariant \| undef>`  | `undefined` | Semantic colour for the border and text. If omitted, auto-mapped from `value` (see below).                                                 |
| `size`    | `InputSignal<RetroBadgeSize>`             | `'md'`      | Size: `'sm'` (h=1rem, fs=10px), `'md'` (h=1.25rem, fs=11px), `'lg'` (h=1.5rem, fs=12px).                                                    |
| `tooltip` | `InputSignal<string \| undefined>`        | `undefined` | Tooltip text. If omitted, the displayed label (`P{value}` or `{value}`) is used.                                                            |
| `bare`    | `InputSignal<boolean>`                    | `false`     | If `true`, renders the raw number (`1`) instead of the priority form (`P1`).                                                                 |

## Auto-mapped variant (default)

When `variant` is not provided, `effectiveVariant` is derived from `value`:

| `value` | `effectiveVariant` |
| ------- | ------------------ |
| `1`     | `rose`             |
| `2–3`   | `amber`            |
| `4–5`   | `green`            |

This matches the common "P1 = highest priority, P5 = lowest" semantic. Override with an explicit `variant` input when needed.

## Exported Types

- `RetroBadgeVariant` — `'primary' \| 'green' \| 'amber' \| 'rose' \| 'blue' \| 'neutral'`
- `RetroBadgeSize` — `'sm' \| 'md' \| 'lg'`

## Minimal example

```html
<retro-badge [value]="1" />
<retro-badge [value]="3" size="lg" />
<retro-badge [value]="5" variant="neutral" />
<retro-badge [value]="1" bare="true" tooltip="Prioridad alta" />
```

## Gotchas

- `effectiveVariant`, `displayLabel` and `iconSize` are internal `computed` signals — they are not configurable from the call site.
- The badge is `display: inline-flex`; place it inside a flex container to align it with siblings.
- The `title` attribute is used as a fallback tooltip (no `retro-tooltip` integration).
