# retro-menu

Contextual menu panel for Terminal Collector following the APG menu pattern with CDK ListKeyManager. It consists of three pieces: `RetroMenuComponent` (the panel), `RetroMenuItemComponent` (each option) and `RetroMenuTriggerDirective` (the trigger).

## When to use / When NOT to use

- Use when: you need a contextual action menu (e.g. "Edit / Delete") anchored to a trigger button.
- Do NOT use when: you need to select a form value — use `retro-select` instead.

---

## RetroMenuComponent

**Selector:** `retro-menu` · **Standalone:** yes · **CVA:** no

### API — Inputs

| Name             | Angular type                       | Default     | Description                                                                    |
| ---------------- | ---------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `ariaLabelledBy` | `InputSignal<string \| undefined>` | `undefined` | ID of the element that labels this menu for accessibility (`aria-labelledby`). |

### Slots

| Selector    | Expected content   | Description                                             |
| ----------- | ------------------ | ------------------------------------------------------- |
| _(default)_ | `retro-menu-item`s | Menu items projected as children of `<ul role="menu">`. |

---

## RetroMenuItemComponent

**Selector:** `retro-menu-item` · **Standalone:** yes · **CVA:** no

### API — Inputs

| Name         | Angular type                       | Default     | Description                                            |
| ------------ | ---------------------------------- | ----------- | ------------------------------------------------------ |
| `icon`       | `InputSignal<string \| undefined>` | `undefined` | Material Icons icon name to display next to the label. |
| `isDisabled` | `InputSignal<boolean>`             | `false`     | Disables the item when `true`.                         |

### API — Outputs

| Name      | Angular type                   | Description                                                  |
| --------- | ------------------------------ | ------------------------------------------------------------ |
| `clicked` | `OutputEmitterRef<MouseEvent>` | Emits the `MouseEvent` on click if the item is not disabled. |

### Slots

| Selector    | Expected content | Description                |
| ----------- | ---------------- | -------------------------- |
| _(default)_ | text             | Visible label of the item. |

---

## RetroMenuTriggerDirective

**Selector:** `[retroMenuTriggerFor]` · **Standalone:** yes

Turns any element into the trigger for a `RetroMenuComponent`. Manages CDK overlay open/close, keyboard navigation and a11y attributes (`aria-haspopup="menu"`, reactive `aria-expanded`).

### API — Inputs

| Name                  | Angular type                                 | Default | Description                                                          |
| --------------------- | -------------------------------------------- | ------- | -------------------------------------------------------------------- |
| `retroMenuTriggerFor` | `InputSignal<RetroMenuComponent> (required)` | —       | Reference to the `RetroMenuComponent` that this directive will open. |

---

## Minimal example

```html
<retro-icon-button icon="more_vert" ariaLabel="Actions" [retroMenuTriggerFor]="menu" />
<retro-menu #menu ariaLabelledBy="my-trigger-id">
  <retro-menu-item icon="edit" (clicked)="onEdit()">Edit</retro-menu-item>
  <retro-menu-item icon="delete" (clicked)="onDelete()">Delete</retro-menu-item>
</retro-menu>
```

---

## Gotchas

- **CDK anchoring with `display:contents`**: the directive can be applied to wrapper components (e.g. `<retro-icon-button>`) whose `:host` has `display:contents`, which would cause `getBoundingClientRect()` to return a `0x0` rect. The directive resolves this automatically by finding the first descendant `button | a | [tabindex]` as the real anchor point — no extra action needed.
- **Type-ahead**: the `ActiveDescendantKeyManager` has `withTypeAhead()` active. Typing characters while the menu is open moves focus to the first item whose text starts with those letters.
- **Focus restoration**: when the menu closes (Escape, Tab, backdrop click or item selection), focus automatically returns to the original trigger element.
- **Disabled items**: the `KeyManager` skips them during arrow-key navigation thanks to the `Highlightable` interface. The `clicked` output does not emit if `isDisabled` is `true`.
