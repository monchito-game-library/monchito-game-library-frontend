# retro-list

Component family for Terminal Collector lists. `retro-list` is the required parent container; `retro-list-item` is the child row that only works inside it.

**Selector:** `retro-list` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: a list of rows with a homogeneous layout (title, metadata, actions) in terminal style is needed.
- Do NOT use when: the data is tabular with fixed columns and headers — use a semantic HTML table instead.

## Slots

| Selector    | Expected content                      | Description                              |
| ----------- | ------------------------------------- | ---------------------------------------- |
| _(default)_ | `retro-list-item` or other free block | List items. Typically `retro-list-item`. |

## Exposed CSS Tokens

| Variable           | Default  | Description                 |
| ------------------ | -------- | --------------------------- |
| `--retro-list-gap` | `0.5rem` | Spacing between list items. |

## Minimal example

```html
<retro-list>
  @for (game of games(); track game.id; let i = $index) {
  <retro-list-item [interactive]="true" [staggered]="true" [style.--i]="i" (itemClicked)="onSelect(game)">
    <strong>{{ game.title }}</strong>
  </retro-list-item>
  }
</retro-list>
```

## Parent-child contract

`RetroListComponent` provides itself under the internal token `RETRO_LIST_PARENT`. `RetroListItemComponent` requires it in the constructor — if not found, it throws:

> RetroListItemComponent must be used inside a \<retro-list\> container.

This mechanism allows shared configuration (density, default padding) to be exposed in the future without changing the external API.

## Gotchas

- `retro-list` does not manage states (loading, empty, error). The consumer handles them externally with `@if`/`@for` and components such as `retro-empty-state`.
- When a `<retro-list-item [interactive]="true">` contains a clickable element in the `[retroListItemTrailing]` slot (button, icon-button, link…), keyboard events bubble up to the item. If the user focuses the trailing button and presses `Enter` or `Space`, both the button click and the item's `itemClicked` are fired. To prevent this, wrap the trailing content in a `<div>` that stops propagation:

```html
<div
  retroListItemTrailing
  (click)="$event.stopPropagation()"
  (keydown.enter)="$event.stopPropagation()"
  (keydown.space)="$event.stopPropagation()">
  <retro-icon-button icon="delete" (clicked)="onDelete($event)" />
</div>
```

---

# retro-list-item

Terminal Collector list row. Horizontal layout: leading | body | trailing. 1px border, `--bg-surface` background, no border-radius.

**Selector:** `retro-list-item` · **Standalone:** yes · **CVA:** no

> **Requirement:** must always be used inside a `<retro-list>`. Using it without a parent throws a runtime error.

## When to use / When NOT to use

- Use when: a list row with distinct leading/body/trailing zones is needed, optionally interactive.
- Do NOT use when: the row is a static label/value pair — use `retro-data-row` instead.

## API — Inputs

| Name          | Angular type                                    | Default     | Description                                                                                                                                  |
| ------------- | ----------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `interactive` | `InputSignal<boolean>`                          | `false`     | Enables clickable row behaviour (role=button, hover, focus). Emits `itemClicked` on click, Enter or Space.                                   |
| `hoverable`   | `InputSignal<boolean>`                          | `false`     | Enables `border-color` hover without requiring `interactive`. Overridden by `disabled=true`. Does not add `role` or emit clicks.             |
| `disabled`    | `InputSignal<boolean>`                          | `false`     | Marks the row as disabled: `opacity: 0.5`, `cursor: not-allowed`, `aria-disabled="true"`. Blocks `itemClicked` even when `interactive=true`. |
| `padding`     | `InputSignal<'none' \| 'sm' \| 'md' \| 'lg'>`   | `'sm'`      | Internal padding. `none`=0, `sm`=0.5rem 0.75rem, `md`=0.75rem 1rem, `lg`=1rem 1.25rem.                                                       |
| `selected`    | `InputSignal<boolean>`                          | `false`     | Visual selection state (inset 2px box-shadow `--border-active` + `--bg-surface-hi` background).                                              |
| `variant`     | `InputSignal<'default' \| 'accent' \| 'muted'>` | `'default'` | Visual variant. `accent` colours the border with `--primary`. `muted` makes the background transparent.                                      |
| `staggered`   | `InputSignal<boolean>`                          | `false`     | Enables staggered entry animation. Requires `[style.--i]="index"` in the `@for`. Respects `prefers-reduced-motion`.                          |

## API — Outputs

| Name          | Angular type                   | Description                                                   |
| ------------- | ------------------------------ | ------------------------------------------------------------- |
| `itemClicked` | `OutputEmitterRef<MouseEvent>` | Click/Enter/Space when `interactive=true` and not `disabled`. |

## Slots

| Selector                  | Expected content          | Description                                    |
| ------------------------- | ------------------------- | ---------------------------------------------- |
| `[retroListItemLeading]`  | icon, avatar, checkbox    | Left column. Automatically hidden when empty.  |
| _(default)_               | title, subtitle, metadata | Main body of the row.                          |
| `[retroListItemTrailing]` | action, badge, chevron    | Right column. Automatically hidden when empty. |

## Exposed CSS Tokens

| Variable                         | Default                | Description                                               |
| -------------------------------- | ---------------------- | --------------------------------------------------------- |
| `--retro-list-item-hover-border` | `var(--border-active)` | Border colour on hover when `hoverable` or `interactive`. |

## Exported Types

- `RetroListItemVariant` — `'default' \| 'accent' \| 'muted'`
- `RetroListItemPadding` — `'none' \| 'sm' \| 'md' \| 'lg'`

## Minimal example

```html
<retro-list>
  @for (game of games(); track game.id; let i = $index) {
  <retro-list-item [interactive]="true" [staggered]="true" [style.--i]="i" (itemClicked)="onSelect(game)">
    <img retroListItemLeading [src]="game.coverUrl" alt="" />
    <strong>{{ game.title }}</strong>
    <span>{{ game.platform }}</span>
    <retro-badge retroListItemTrailing [label]="game.status" />
  </retro-list-item>
  }
</retro-list>
```
