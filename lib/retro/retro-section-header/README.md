# retro-section-header

Terminal Collector terminal-style section header. Displays `> SECTION_NAME [count]` with a 1px bottom border. Accepts actions projected to the right.

**Selector:** `retro-section-header` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: a content section needs to be visually delimited with a title and optional counter, in terminal style.
- Do NOT use when: a full page header with navigation is needed — use the appropriate page header component instead.

## API — Inputs

| Name    | Angular type                            | Default | Description                                          |
| ------- | --------------------------------------- | ------- | ---------------------------------------------------- |
| `label` | `InputSignal<string> (required)`        | —       | Section text. Displayed in uppercase on screen.      |
| `count` | `InputSignal<number \| string \| null>` | `null`  | Optional counter displayed in square brackets `[N]`. |

## Slots

| Selector         | Expected content      | Description                                                       |
| ---------------- | --------------------- | ----------------------------------------------------------------- |
| `[slot=actions]` | buttons, action icons | Projected to the far right of the header via `margin-left: auto`. |

## Minimal example

```html
<!-- Without counter or actions -->
<retro-section-header label="GAMES" />

<!-- With counter -->
<retro-section-header label="GAMES" [count]="games().length" />

<!-- With actions on the right -->
<retro-section-header label="HARDWARE" [count]="consoles().length">
  <retro-button slot="actions" label="ADD" variant="primary" (clicked)="onAdd()" />
</retro-section-header>
```
