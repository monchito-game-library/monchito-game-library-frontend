# retro-data-row

`ls -la`-style data row. Displays a LABEL (mono uppercase) on the left, a dotted separator, and a VALUE (mono) on the right.

**Selector:** `retro-data-row` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: static label/value pairs need to be displayed (detail sheet, game metadata, object properties).
- Do NOT use when: the row needs interactivity, actions, or leading/trailing zones — use `retro-list-item` instead.

## API — Inputs

| Name         | Angular type                            | Default     | Description                                                              |
| ------------ | --------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `label`      | `InputSignal<string> (required)`        | —           | Field label. Displayed in uppercase on screen.                           |
| `value`      | `InputSignal<string \| number \| null>` | `null`      | Field value. If `null`, the `ng-content` is rendered instead.            |
| `icon`       | `InputSignal<string \| undefined>`      | `undefined` | Material Icons icon name displayed next to the label. Optional.          |
| `emphasized` | `InputSignal<boolean>`                  | `false`     | If `true`, the value is rendered at a larger size and weight (emphasis). |

## Slots

| Selector    | Expected content             | Description                                                         |
| ----------- | ---------------------------- | ------------------------------------------------------------------- |
| _(default)_ | free block (chips, stars...) | Visible only when `value` is `null`. Replaces the plain-text value. |

## Minimal example

```html
<retro-data-row label="PLATFORM" [value]="game.platform" />
<retro-data-row label="ID" [value]="game.id" icon="badge" />
<retro-data-row label="RATING" [emphasized]="true" [value]="game.score" />

<!-- Complex value: ng-content when value is null -->
<retro-data-row label="RATING">
  <span class="stars">★★★★☆</span>
</retro-data-row>
```

## Gotchas

- On narrow screens (< 480px) the dotted separator is hidden to prevent clipping; label and value remain aligned via grid without a visual separator.
- The default slot is only projected when `value()` is `null`. If `value` is passed alongside projected content, the projected content is hidden.
