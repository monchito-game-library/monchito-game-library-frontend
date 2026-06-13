# retro-card

Neutral container from the Terminal Collector lib. 1px border rectangle, `--bg-surface` background, no shadows or border-radius. Supports visual variants, configurable padding, selection state, hover, and interactive mode.

**Selector:** `retro-card` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: content needs to be grouped in a delimited visual block (game card, detail panel, collection card).
- Do NOT use when: the content unit is a row inside a list — use `retro-list-item` instead.

## API — Inputs

| Name          | Angular type                                    | Default     | Description                                                                                                                                                                                          |
| ------------- | ----------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interactive` | `InputSignal<boolean>`                          | `false`     | Enables clickable card behaviour: `role=button`, hover, focus-visible, and `cardClicked` emission.                                                                                                   |
| `hoverable`   | `InputSignal<boolean>`                          | `false`     | Activates `border-color` hover without requiring `interactive`. Implicitly active when `interactive=true`. Overridden by `disabled=true`.                                                            |
| `disabled`    | `InputSignal<boolean>`                          | `false`     | Disables the card: `opacity: 0.5`, `cursor: not-allowed`, `aria-disabled="true"`, no hover or focus-visible. `tabindex="-1"` if also interactive. Takes priority over `interactive` and `hoverable`. |
| `padding`     | `InputSignal<'none' \| 'sm' \| 'md' \| 'lg'>`   | `'md'`      | Inner padding. `none`=0, `sm`=0.75rem, `md`=1rem (mobile 0.875rem), `lg`=1.5rem/1rem (mobile 1rem).                                                                                                  |
| `padded`      | `InputSignal<boolean \| undefined>`             | `undefined` | **Deprecated** — use `padding`. `true` → `'md'`, `false` → `'none'`.                                                                                                                                 |
| `selected`    | `InputSignal<boolean>`                          | `false`     | Visual selection state: 2px inset box-shadow with `--border-active` + `--bg-surface-hi` background.                                                                                                  |
| `variant`     | `InputSignal<'default' \| 'accent' \| 'muted'>` | `'default'` | Visual variant. `accent` colours the border with `--primary`. `muted` makes the background transparent.                                                                                              |

## API — Outputs

| Name          | Angular type                   | Description                                                                                                 |
| ------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `cardClicked` | `OutputEmitterRef<MouseEvent>` | Emits the `MouseEvent` when `interactive=true` and not `disabled`. Click, Enter, or Space trigger emission. |

## Slots

| Selector    | Expected content | Description                    |
| ----------- | ---------------- | ------------------------------ |
| _(default)_ | free block       | Projected content of the card. |

## Exposed CSS Tokens

| Variable                    | Default                | Description                                                                                                      |
| --------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--retro-card-hover-border` | `var(--border-active)` | Border colour on hover when `hoverable` or `interactive`. The consumer can override it (e.g. `--dominant-glow`). |

## Exported Types

- `LibCardVariant` — `'default' \| 'accent' \| 'muted'`
- `RetroCardPadding` — `'none' \| 'sm' \| 'md' \| 'lg'`

## Minimal example

```html
<!-- Interactive card with accent variant -->
<retro-card [interactive]="true" variant="accent" (cardClicked)="onSelect()">
  <p>Content</p>
</retro-card>

<!-- Hover without click (card navigable via inner link) -->
<retro-card [hoverable]="true">
  <a routerLink="/detail">View detail</a>
</retro-card>

<!-- Disabled state while loading -->
<retro-card [interactive]="true" [disabled]="isLoading()" (cardClicked)="onSelect()">
  <p>Not clickable while loading</p>
</retro-card>
```

## Gotchas

- `padded` is deprecated. Migrate it to `padding="md"` or `padding="none"` according to the boolean value it used.
- `disabled` takes full priority over `interactive` and `hoverable`: it blocks clicks, removes hover, and takes the card out of the tab order (`tabindex="-1"`).
- `selected` is independent of `interactive`: a card can appear selected without being clickable.
