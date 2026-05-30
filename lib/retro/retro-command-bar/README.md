# retro-command-bar

Barra de prompt de terminal decorativa estilo `PATH $ --flag1 --flag2 ▋`. Puramente decorativa, solo visible en desktop (≥ 1024px); oculta en tablet y mobile vía CSS.

**Selector:** `retro-command-bar` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se quiere reforzar la estética terminal de una vista mostrando el contexto de navegación como un prompt de shell.
- NO usar cuando: se necesita una barra de acciones funcional o un campo de entrada — este componente es `aria-hidden` y no es interactivo.

## API — Inputs

| Nombre   | Tipo Angular                     | Default                | Descripción                                         |
| -------- | -------------------------------- | ---------------------- | --------------------------------------------------- |
| `path`   | `InputSignal<string>`            | `'monchito ~/library'` | Texto del segmento de ruta mostrado antes del `$`.  |
| `flags`  | `InputSignal<readonly string[]>` | `[]`                   | Array de flags mostrados como `--flag` tras el `$`. |
| `cursor` | `InputSignal<boolean>`           | `true`                 | Si `true`, muestra el cursor de bloque parpadeante. |

## Ejemplo mínimo

```html
<retro-command-bar path="monchito ~/games" [flags]="['list', 'verbose']" />
```

## Gotchas

- El componente tiene `aria-hidden="true"`: es invisible para lectores de pantalla y no debe contener información funcional.
- Solo visible a partir de 1024px de ancho; por debajo de ese breakpoint el componente se oculta con `display: none` vía CSS.
- Con `prefers-reduced-motion: reduce`, la animación de parpadeo del cursor se desactiva.
