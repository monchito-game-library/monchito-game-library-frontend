# retro-tooltip

Directiva de tooltip nativa sin CDK Overlay. Crea un `<div class="retro-tooltip">` en el `document.body` con `position: fixed` calculada desde `getBoundingClientRect()`.

**Selector:** `[retroTooltip]` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita mostrar texto de ayuda contextual al hacer hover o focus sobre un elemento interactivo.
- NO usar cuando: el contenido es rico (iconos, botones, HTML) — la directiva solo admite texto plano.

## API — Inputs

| Nombre              | Tipo Angular                     | Default | Descripción                                                         |
| ------------------- | -------------------------------- | ------- | ------------------------------------------------------------------- |
| `retroTooltip`      | `InputSignal<string> (required)` | —       | Texto del tooltip. Si está vacío, no se muestra nada.               |
| `retroTooltipDelay` | `InputSignal<number>`            | `500`   | Retardo en ms antes de mostrar el tooltip tras el mouseenter/focus. |

## Ejemplo mínimo

```html
<retro-icon-button
  icon="info"
  ariaLabel="Más información"
  [retroTooltip]="'Pulsa para ver detalles'"
  [retroTooltipDelay]="300" />
```

## Gotchas

- **Posicionado con `requestAnimationFrame`**: el panel se posiciona dos veces — inmediatamente al crearse y tras el primer frame de layout para usar las dimensiones reales. Esto evita el parpadeo de posición que ocurriría al posicionar antes de que el panel tenga tamaño.
- **Listeners scroll/resize activos mientras visible**: mientras el tooltip está visible, la directiva suscribe listeners `scroll` (capture) y `resize` en `window` para reposicionarlo. Se limpian automáticamente al ocultar el tooltip.
- **Focus en touch + teclado externo**: el tooltip aparece en `focusin` independientemente de si el dispositivo soporta hover. Esto cubre el caso de dispositivos táctiles con teclado externo conectado. En dispositivos táctiles sin teclado, el hover (`mouseenter`) se ignora porque `@media (hover: hover)` no coincide.
- **Posición por defecto bottom-center**: si el tooltip no cabe por debajo del host (desborda viewport), se mueve automáticamente a top-center.
- **Accesibilidad**: añade `role="tooltip"` al panel y `aria-describedby` al elemento host mientras está visible. Ambos atributos se eliminan al ocultar.
- El tooltip se destruye en `ngOnDestroy` — no quedan elementos huérfanos si el host se desmonta mientras el tooltip está visible.
