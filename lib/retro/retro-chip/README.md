# retro-chip

Chip/badge Terminal Collector con borde 1px, mono uppercase, sin border-radius.

## Componente — RetroChipComponent

- **Selector:** `retro-chip`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` (required) | — | Texto del chip (uppercase). |
| `icon` | `string \| undefined` | `undefined` | Material Icons (opcional). |
| `color` | `'primary' \| 'green' \| 'amber' \| 'rose' \| 'blue' \| 'neutral'` | `'neutral'` | Color semántico. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | sm=denso 1rem, md=1.25rem, lg=destacado 1.5rem. |
| `filled` | `boolean` | `false` | Fondo sólido + texto void (para hero overlays). |
| `closable` | `boolean` | `false` | Muestra botón X y emite `closed`. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `closed` | `void` | Click en la X (si `closable=true`). |

### Types

- `RetroChipColor`, `RetroChipSize` en `retro-chip.types.ts`.

### Dependencias

- `RetroIconComponent`.

## Ejemplo

```html
<retro-chip label="ACTIVE" color="green" />
<retro-chip label="HERO" color="amber" size="lg" [filled]="true" />
<retro-chip label="Filtro" [closable]="true" (closed)="onRemove()" />
```
