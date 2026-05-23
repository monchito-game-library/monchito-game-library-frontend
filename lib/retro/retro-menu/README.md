# retro-menu

Menú contextual Terminal Collector (APG menu pattern + ListKeyManager).

## Componente — RetroMenuComponent

- **Selector:** `retro-menu`
- **A11y:** `role="menu"`.

### Slots: se proyectan `<retro-menu-item>`.

### API pública: `templateRef`, `menuItems`.

## Componente — RetroMenuItemComponent

- **Selector:** `retro-menu-item`

### Inputs: `icon?: string`, `isDisabled: boolean` (default `false`).

### Outputs: `clicked: MouseEvent`.

### Slots: Default (label).

## Directiva — RetroMenuTriggerDirective (`directive/`)

- **Selector:** `[retroMenuTriggerFor]`
- **Inputs:** `retroMenuTriggerFor: RetroMenuComponent` (required).
- **Hace:** abre overlay CDK, gestiona ArrowUp/Down/Home/End/Enter/Escape, type-ahead, retorno de foco.
- **A11y:** `aria-haspopup="menu"`, `aria-expanded` reactivo.
- **Anclaje:** la directiva puede aplicarse sobre elementos nativos (`<button>`, `<a>`, `[tabindex]`) o sobre componentes Angular envoltorio (ej. `<retro-icon-button>`). En el segundo caso, resuelve automáticamente el primer descendiente `button | a | [tabindex]` como punto de anclaje del overlay, por lo que el menú se posiciona correctamente aunque el `:host` del componente tenga `display: contents`.

## Constantes (`constants/`)

- `RETRO_MENU_POSITIONS: ConnectedPosition[]` — 4 posiciones (bottom-start, top-start, bottom-end, top-end).

## Ejemplo

```html
<retro-icon-button icon="more_vert" ariaLabel="Acciones" [retroMenuTriggerFor]="menu" />
<retro-menu #menu>
  <retro-menu-item icon="edit" (clicked)="onEdit()">Editar</retro-menu-item>
  <retro-menu-item icon="delete" (clicked)="onDelete()">Eliminar</retro-menu-item>
</retro-menu>
```
