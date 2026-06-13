# retro-icon

Material Icons (webfont) wrapper for the Terminal Collector lib. Renders a `<span class="material-icons">` using the webfont already loaded in `index.html`. Functional parity with `mat-icon` without a dependency on `@angular/material/icon`.

**Selector:** `retro-icon` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: a Material Icons icon is needed anywhere in the UI (buttons, chips, lists, empty states).
- Do NOT use when: a custom SVG or an icon from another source is needed — in that case manage the `<img>`/`<svg>` element directly.

## API — Inputs

| Name         | Angular type                     | Default | Description                                                                                                                    |
| ------------ | -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `name`       | `InputSignal<string> (required)` | —       | Material Icons ligature (icon name in snake_case, e.g. `'save'`, `'check_circle'`).                                            |
| `size`       | `InputSignal<LibIconSize>`       | `'md'`  | Size: `'xs'` (chip/data-row), `'sm'` (button/tabs), `'md'` (menus), `'lg'` (headers), `'xl'` (topbar), `'2xl'` (empty states). |
| `ariaHidden` | `InputSignal<boolean>`           | `true`  | `aria-hidden="true"` by default (decorative). Pass `false` for informative icons.                                              |

## Exported Types

- `LibIconSize` — `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'`

## Minimal example

```html
<retro-icon name="save" size="sm" />
<retro-icon name="check_circle" size="lg" [ariaHidden]="false" />
<retro-icon class="my-custom" name="star" size="md" />
```

## Gotchas

- The host applies individual classes via separate bindings (`[class.retro-icon-host--xs]`, etc.), **not** with a single `@HostBinding('class')` getter. This ensures external classes added by the call-site (`<retro-icon class="my-class" ...>`) are preserved across all change detection cycles.
- Host classes and their conditions:

  | Class                  | Condition        |
  | ---------------------- | ---------------- |
  | `retro-icon-host`      | always           |
  | `retro-icon-host--xs`  | `size === 'xs'`  |
  | `retro-icon-host--sm`  | `size === 'sm'`  |
  | `retro-icon-host--md`  | `size === 'md'`  |
  | `retro-icon-host--lg`  | `size === 'lg'`  |
  | `retro-icon-host--xl`  | `size === 'xl'`  |
  | `retro-icon-host--2xl` | `size === '2xl'` |

- `aria-hidden="true"` is the default because most uses are decorative. For icons that convey semantic information (without alternative text at the call-site), pass `[ariaHidden]="false"` and ensure the parent container has an `aria-label`.
