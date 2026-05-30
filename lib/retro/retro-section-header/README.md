# retro-section-header

Cabecera de sección estilo terminal de la lib Terminal Collector. Muestra `> SECTION_NAME [count]` con borde inferior 1px. Acepta acciones proyectadas a la derecha.

**Selector:** `retro-section-header` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita delimitar visualmente una sección de contenido con título y contador opcional, en estilo terminal.
- NO usar cuando: se necesita una cabecera de página completa con navegación — en ese caso usar el componente de cabecera de page correspondiente.

## API — Inputs

| Nombre  | Tipo Angular                            | Default | Descripción                                               |
| ------- | --------------------------------------- | ------- | --------------------------------------------------------- |
| `label` | `InputSignal<string> (required)`        | —       | Texto de la sección. Se muestra en uppercase en pantalla. |
| `count` | `InputSignal<number \| string \| null>` | `null`  | Contador opcional mostrado entre corchetes `[N]`.         |

## Slots

| Selector         | Tipo esperado             | Descripción                                                                |
| ---------------- | ------------------------- | -------------------------------------------------------------------------- |
| `[slot=actions]` | botones, iconos de acción | Proyectado al extremo derecho de la cabecera mediante `margin-left: auto`. |

## Ejemplo mínimo

```html
<!-- Sin contador ni acciones -->
<retro-section-header label="JUEGOS" />

<!-- Con contador -->
<retro-section-header label="JUEGOS" [count]="games().length" />

<!-- Con acciones a la derecha -->
<retro-section-header label="HARDWARE" [count]="consoles().length">
  <retro-button slot="actions" label="AÑADIR" variant="primary" (clicked)="onAdd()" />
</retro-section-header>
```
