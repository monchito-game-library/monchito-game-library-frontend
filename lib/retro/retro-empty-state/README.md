# retro-empty-state

Terminal ASCII-style empty state from the Terminal Collector lib. Displays a fixed ASCII art block + title + optional subtitle + prompt hint. Accepts projected action buttons after the hint.

**Selector:** `retro-empty-state` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: a list or section has no results to display and the empty state should be communicated to the user with a terminal style.
- Do NOT use when: the empty state is part of a loading process — show `retro-spinner` while `loading()` is `true` and reserve `retro-empty-state` for when loading has finished with zero results.

## API — Inputs

| Name       | Angular type                     | Default                     | Description                                                     |
| ---------- | -------------------------------- | --------------------------- | --------------------------------------------------------------- |
| `title`    | `InputSignal<string> (required)` | —                           | Main empty-state title. Displayed in uppercase.                 |
| `subtitle` | `InputSignal<string>`            | `''`                        | Subtitle or additional description. Hidden when empty string.   |
| `hint`     | `InputSignal<string>`            | `'$ try a different query'` | Hint in terminal prompt style (mono font, accent-green colour). |

## Slots

| Selector    | Expected content       | Description                                              |
| ----------- | ---------------------- | -------------------------------------------------------- |
| _(default)_ | buttons or other block | Actions projected after the hint (e.g. an "ADD" button). |

## Minimal example

```html
<!-- Minimal: title only -->
<retro-empty-state title="NO HAY RESULTADOS" />

<!-- With subtitle and custom hint -->
<retro-empty-state title="EMPTY LIBRARY" subtitle="You have not added any game yet." hint="$ get-started --add-game" />

<!-- With projected action -->
<retro-empty-state title="NO GAMES" subtitle="Your library is empty.">
  <retro-button label="ADD GAME" variant="primary" (clicked)="onAdd()" />
</retro-empty-state>
```

## Gotchas

- The ASCII block (`NO RESULTS / 0 RECORDS FOUND`) is fixed in the template and is not configurable via input or slot. If a different art is needed, create a derived component.
- `subtitle` is only rendered when it is not an empty string (guard `@if (subtitle())`). Passing `''` is equivalent to not passing it.
