# retro-card

Contenedor neutro Terminal Collector. Rectángulo 1px sin sombras ni border-radius.

## Componente — RetroCardComponent

- **Selector:** `retro-card`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `interactive` | `boolean` | `false` | Activa hover, focus y emite `cardClicked`. |
| `padded` | `boolean` | `true` | Aplica padding 1rem y gap 0.75rem entre hijos. |
| `variant` | `'default' \| 'accent' \| 'muted'` | `'default'` | Variante visual. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `cardClicked` | `MouseEvent` | Click/Enter/Espacio cuando `interactive=true`. |

### Slots / ng-content

- Default: contenido proyectado libremente.

### Types

- `LibCardVariant` en `retro-card.types.ts`.

## Ejemplo

```html
<retro-card [interactive]="true" variant="accent" (cardClicked)="onSelect()">
  <p>Contenido</p>
</retro-card>
```
