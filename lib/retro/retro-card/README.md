# retro-card

Contenedor neutro Terminal Collector. Rectángulo 1px sin sombras ni border-radius.

## Componente — RetroCardComponent

- **Selector:** `retro-card`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `interactive` | `boolean` | `false` | Activa hover, focus y emite `cardClicked`. |
| `hoverable` | `boolean` | `false` | Activa hover de `border-color` sin requerir `interactive`. Si `interactive=true` se considera implícito. Anulado por `disabled=true`. No añade `role`, `tabindex` ni emite clicks. |
| `disabled` | `boolean` | `false` | Marca la tarjeta como deshabilitada: `opacity: 0.5`, `cursor: not-allowed`, `aria-disabled="true"`, sin hover ni focus-visible. Bloquea `cardClicked` aunque `interactive=true`. `tabindex="-1"` si además es interactiva. Prioridad sobre `interactive` y `hoverable`. |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding interno. none=0, sm=0.75rem, md=1rem (mobile 0.875rem), lg=1.5rem/1rem (mobile 1rem). |
| `padded` | `boolean` | `undefined` | **Deprecated** — usar `padding`. `true`→`md`, `false`→`none`. |
| `selected` | `boolean` | `false` | Estado visual de selección (box-shadow inset 2px `--border-active` + fondo `--bg-surface-hi`). Independiente de `interactive`. No compite con `border-color` del consumidor. |
| `variant` | `'default' \| 'accent' \| 'muted'` | `'default'` | Variante visual. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `cardClicked` | `MouseEvent` | Click/Enter/Espacio cuando `interactive=true`. |

### Slots / ng-content

- Default: contenido proyectado libremente.

### CSS custom properties

| Variable | Default | Descripción |
|---|---|---|
| `--retro-card-hover-border` | `var(--border-active)` | Color de borde en hover cuando `hoverable` o `interactive`. El consumidor puede sobreescribirla (p. ej. `game-card` usa `--dominant-glow`). |

### Types

- `LibCardVariant` en `retro-card.types.ts`.
- `RetroCardPadding` en `retro-card.types.ts`.

## Ejemplo

```html
<retro-card [interactive]="true" variant="accent" (cardClicked)="onSelect()">
  <p>Contenido</p>
</retro-card>
```

```html
<!-- Hover sin click (tarjeta navegable por enlace interno) -->
<retro-card [hoverable]="true">
  <a routerLink="/detalle">Ver detalle</a>
</retro-card>

<!-- Estado deshabilitado -->
<retro-card [interactive]="true" [disabled]="isLoading()" (cardClicked)="onSelect()">
  <p>No clicable mientras carga</p>
</retro-card>
```
