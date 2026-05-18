# retro-data-row

Fila de datos estilo `ls -la`. LABEL a la izquierda, dots punteados, VALUE a la derecha.

## Componente — RetroDataRowComponent

- **Selector:** `retro-data-row`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` (required) | — | Etiqueta (uppercase). |
| `value` | `string \| number \| null` | `null` | Valor. Si es `null`, se renderiza el `ng-content`. |
| `icon` | `string \| undefined` | `undefined` | Material Icons junto al label. |
| `emphasized` | `boolean` | `false` | Value con mayor tamaño/peso. |

### Slots / ng-content

- Default: cuando `value()` es `null`, se proyecta contenido custom (chips, estrellas, etc).

### Dependencias

- `RetroIconComponent`.

## Ejemplo

```html
<retro-data-row label="ID" [value]="game.id" icon="badge" />
<retro-data-row label="RATING">
  <span class="stars">★★★★☆</span>
</retro-data-row>
```
