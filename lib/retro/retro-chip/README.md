# retro-chip

Chip/badge reutilizable Terminal Collector. Borde 1px del color semántico, mono uppercase, sin border-radius. Soporta icono opcional, variante rellena y botón de cierre.

**Selector:** `retro-chip` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita una etiqueta visual para tags de filtro activos, estados semánticos (plataforma, estado de juego), categorías o badges en tablas y listas.
- NO usar cuando: se necesita una acción primaria con texto — usar `retro-button`. Para iconos de acción sin texto, usar `retro-icon-button`.

## API — Inputs

| Nombre     | Tipo Angular                       | Default     | Descripción                                                                                            |
| ---------- | ---------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `label`    | `InputSignal<string> (required)`   | —           | Texto visible del chip; se muestra en uppercase.                                                       |
| `icon`     | `InputSignal<string \| undefined>` | `undefined` | Nombre del icono Material Icons (opcional). Si no se pasa, el icono no se renderiza.                   |
| `color`    | `InputSignal<RetroChipColor>`      | `'neutral'` | Color semántico del borde y texto: `'primary'`, `'green'`, `'amber'`, `'rose'`, `'blue'`, `'neutral'`. |
| `size`     | `InputSignal<RetroChipSize>`       | `'md'`      | Tamaño: `'sm'` (h=1rem, 10px), `'md'` (h=1.25rem, 11px), `'lg'` (h=1.5rem, 12px).                      |
| `filled`   | `InputSignal<boolean>`             | `false`     | Si `true`, aplica fondo sólido del color y texto `--bg-void`. Útil para overlays hero.                 |
| `closable` | `InputSignal<boolean>`             | `false`     | Si `true`, muestra un botón `×` y emite el evento `closed` al pulsarlo.                                |

## API — Outputs

| Nombre   | Tipo Angular             | Descripción                                                                         |
| -------- | ------------------------ | ----------------------------------------------------------------------------------- |
| `closed` | `OutputEmitterRef<void>` | Emite cuando el usuario hace clic en el botón de cierre. Solo activo si `closable`. |

## Tipos exportados

- `RetroChipColor` — `'primary' \| 'green' \| 'amber' \| 'rose' \| 'blue' \| 'neutral'`
- `RetroChipSize` — `'sm' \| 'md' \| 'lg'`

## Ejemplo mínimo

```html
<retro-chip label="ACTIVE" color="green" />
<retro-chip label="PS5" color="primary" size="sm" icon="sports_esports" />
<retro-chip label="HERO" color="amber" size="lg" [filled]="true" />
<retro-chip label="Filtro aplicado" [closable]="true" (closed)="onRemove()" />
```

## Gotchas

- `iconSize` es un `Signal<LibIconSize>` calculado internamente (`computed`): `'xs'` si `size !== 'lg'`, `'sm'` si `size === 'lg'`. No es configurable desde el call-site.
- El botón de cierre solo aparece en el DOM cuando `closable` es `true`. El evento `closed` también detiene la propagación del clic (`$event.stopPropagation()`), por lo que no burbujea al contenedor padre.
- En mobile (≤ 768px) el touch target del botón de cierre se amplía a `1.5rem × 1.5rem` para cumplir el mínimo táctil.
