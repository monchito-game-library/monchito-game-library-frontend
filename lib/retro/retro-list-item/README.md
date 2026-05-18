# retro-list-item

Fila de lista Terminal Collector. Layout horizontal leading | cuerpo | trailing. Borde 1px, fondo `--bg-surface`, sin border-radius.

## Componente — RetroListItemComponent

- **Selector:** `retro-list-item`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `interactive` | `boolean` | `false` | Activa comportamiento de fila clicable (role=button, hover, focus). Emite `itemClicked` al hacer clic, Enter o Space. |
| `hoverable` | `boolean` | `false` | Activa hover de `border-color` sin requerir `interactive`. Si `interactive=true` se considera implícito. Anulado por `disabled=true`. No añade `role`, `tabindex` ni emite clicks. |
| `disabled` | `boolean` | `false` | Marca la fila como deshabilitada: `opacity: 0.5`, `cursor: not-allowed`, `aria-disabled="true"`, sin hover ni focus-visible. Bloquea `itemClicked` aunque `interactive=true`. `tabindex="-1"` si además es interactiva. Prioridad sobre `interactive` y `hoverable`. |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | Padding interno. none=0, sm=0.5rem 0.75rem, md=0.75rem 1rem, lg=1rem 1.25rem. |
| `selected` | `boolean` | `false` | Estado visual de selección (box-shadow inset 2px `--border-active` + fondo `--bg-surface-hi`). |
| `variant` | `'default' \| 'accent' \| 'muted'` | `'default'` | Variante visual. `accent` colorea el borde con `--primary`. `muted` hace el fondo transparente. |
| `staggered` | `boolean` | `false` | Activa animación de entrada escalonada. El consumidor debe asignar `[style.--i]="index"` en el `@for`. Respeta `prefers-reduced-motion`. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `itemClicked` | `MouseEvent` | Click/Enter/Espacio cuando `interactive=true` y no `disabled`. |

### Slots / ng-content

| Selector | Descripción |
|---|---|
| `[retroListItemLeading]` | Columna izquierda: avatar, icono, checkbox, etc. Se oculta automáticamente si está vacía (`:empty`). |
| *(default)* | Cuerpo principal: título, subtítulo, metadatos. Se proyecta en la columna central. |
| `[retroListItemTrailing]` | Columna derecha: acción, badge, chevron, etc. Se oculta automáticamente si está vacía (`:empty`). |

### CSS custom properties

| Variable | Default | Descripción |
|---|---|---|
| `--retro-list-item-hover-border` | `var(--border-active)` | Color de borde en hover cuando `hoverable` o `interactive`. El consumidor puede sobreescribirla. |

### Types

Definidos en `retro-list-item.types.ts`:

- `RetroListItemVariant` — `'default' | 'accent' | 'muted'`
- `RetroListItemPadding` — `'none' | 'sm' | 'md' | 'lg'`

## Ejemplos

### Uso básico con slots

```html
<retro-list-item [interactive]="true" padding="md" (itemClicked)="onSelect($event)">
  <mat-icon retroListItemLeading>videogame_asset</mat-icon>
  <span>The Legend of Zelda</span>
  <span>Nintendo Switch · 2017</span>
  <mat-icon retroListItemTrailing>chevron_right</mat-icon>
</retro-list-item>
```

### Lista con animación escalonada

```html
@for (game of games(); track game.id; let i = $index) {
  <retro-list-item
    [staggered]="true"
    [style.--i]="i"
    [interactive]="true"
    (itemClicked)="onGameClick(game)">
    <img retroListItemLeading [src]="game.coverUrl" alt="" />
    <strong>{{ game.title }}</strong>
    <span>{{ game.platform }}</span>
    <retro-badge retroListItemTrailing [label]="game.status" />
  </retro-list-item>
}
```
