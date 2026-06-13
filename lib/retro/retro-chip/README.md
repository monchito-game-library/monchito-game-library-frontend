# retro-chip

Reusable Terminal Collector chip/badge. 1px border in the semantic colour, mono uppercase, no border-radius. Supports an optional icon, filled variant, and close button.

**Selector:** `retro-chip` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: a visual label is needed for active filter tags, semantic states (platform, game status), categories, or badges in tables and lists.
- Do NOT use when: a primary action with text is needed — use `retro-button`. For action icons without text, use `retro-icon-button`.

## API — Inputs

| Name       | Angular type                       | Default     | Description                                                                                                  |
| ---------- | ---------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `label`    | `InputSignal<string> (required)`   | —           | Visible chip text; displayed in uppercase.                                                                   |
| `icon`     | `InputSignal<string \| undefined>` | `undefined` | Material Icons icon name (optional). If not provided, the icon is not rendered.                              |
| `color`    | `InputSignal<RetroChipColor>`      | `'neutral'` | Semantic colour for the border and text: `'primary'`, `'green'`, `'amber'`, `'rose'`, `'blue'`, `'neutral'`. |
| `size`     | `InputSignal<RetroChipSize>`       | `'md'`      | Size: `'sm'` (h=1rem, 10px), `'md'` (h=1.25rem, 11px), `'lg'` (h=1.5rem, 12px).                              |
| `filled`   | `InputSignal<boolean>`             | `false`     | If `true`, applies a solid background in the chip colour and `--bg-void` text. Useful for hero overlays.     |
| `closable` | `InputSignal<boolean>`             | `false`     | If `true`, shows a `×` button and emits the `closed` event when clicked.                                     |

## API — Outputs

| Name     | Angular type             | Description                                                               |
| -------- | ------------------------ | ------------------------------------------------------------------------- |
| `closed` | `OutputEmitterRef<void>` | Emits when the user clicks the close button. Only active when `closable`. |

## Exported Types

- `RetroChipColor` — `'primary' \| 'green' \| 'amber' \| 'rose' \| 'blue' \| 'neutral'`
- `RetroChipSize` — `'sm' \| 'md' \| 'lg'`

## Minimal example

```html
<retro-chip label="ACTIVE" color="green" />
<retro-chip label="PS5" color="primary" size="sm" icon="sports_esports" />
<retro-chip label="HERO" color="amber" size="lg" [filled]="true" />
<retro-chip label="Applied filter" [closable]="true" (closed)="onRemove()" />
```

## Gotchas

- `iconSize` is an internally computed `Signal<LibIconSize>` (`computed`): `'xs'` if `size !== 'lg'`, `'sm'` if `size === 'lg'`. It is not configurable from the call site.
- The close button only appears in the DOM when `closable` is `true`. The `closed` event also stops click propagation (`$event.stopPropagation()`), so it does not bubble to the parent container.
- On mobile (≤ 768px) the touch target of the close button is expanded to `1.5rem × 1.5rem` to meet the minimum touch requirement.
