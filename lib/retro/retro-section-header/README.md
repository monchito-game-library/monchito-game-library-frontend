# retro-section-header

Cabecera de sección estilo terminal: `> SECTION_NAME [count]` con borde inferior 1px.

## Componente — RetroSectionHeaderComponent

- **Selector:** `retro-section-header`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` (required) | — | Texto (uppercase). |
| `count` | `number \| string \| null` | `null` | Contador entre corchetes. |

### Slots / ng-content

- `[slot=actions]`: botones a la derecha.

## Ejemplo

```html
<retro-section-header label="JUEGOS" [count]="games.length">
  <retro-button slot="actions" label="AÑADIR" variant="primary" (clicked)="onAdd()" />
</retro-section-header>
```
