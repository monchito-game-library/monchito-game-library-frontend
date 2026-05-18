# retro-empty-state

Estado vacío estilo terminal ASCII.

## Componente — RetroEmptyStateComponent

- **Selector:** `retro-empty-state`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` (required) | — | Título principal (uppercase). |
| `subtitle` | `string` | `''` | Subtítulo/descripción. |
| `hint` | `string` | `'$ try a different query'` | Hint estilo prompt. |

### Slots / ng-content

- Default: botones de acción tras el hint.

## Ejemplo

```html
<retro-empty-state title="NO HAY JUEGOS" subtitle="Tu biblioteca está vacía">
  <retro-button label="AÑADIR" variant="primary" (clicked)="onAdd()" />
</retro-empty-state>
```
