# retro-icon

Wrapper de Material Icons (webfont) para la lib Terminal Collector. Renderiza un `<span class="material-icons">` usando la webfont ya cargada en `index.html`. Paridad funcional con `mat-icon` sin dependencia de `@angular/material/icon`.

**Selector:** `retro-icon` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita un icono de Material Icons en cualquier punto de la UI (botones, chips, listas, vacíos de estado).
- NO usar cuando: se necesita un SVG personalizado o un icono de otra fuente — en ese caso gestionar el elemento `<img>`/`<svg>` directamente.

## API — Inputs

| Nombre       | Tipo Angular                     | Default | Descripción                                                                                                                     |
| ------------ | -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `name`       | `InputSignal<string> (required)` | —       | Liga del icono Material Icons (nombre en snake_case, p. ej. `'save'`, `'check_circle'`).                                        |
| `size`       | `InputSignal<LibIconSize>`       | `'md'`  | Tamaño: `'xs'` (chip/data-row), `'sm'` (botón/tabs), `'md'` (menús), `'lg'` (headers), `'xl'` (topbar), `'2xl'` (empty states). |
| `ariaHidden` | `InputSignal<boolean>`           | `true`  | `aria-hidden="true"` por defecto (decorativo). Pasar `false` para iconos informativos.                                          |

## Tipos exportados

- `LibIconSize` — `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'`

## Ejemplo mínimo

```html
<retro-icon name="save" size="sm" />
<retro-icon name="check_circle" size="lg" [ariaHidden]="false" />
<retro-icon class="my-custom" name="star" size="md" />
```

## Gotchas

- El host aplica clases individuales mediante bindings separados (`[class.retro-icon-host--xs]`, etc.), **no** con un único getter `@HostBinding('class')`. Esto garantiza que las clases externas añadidas por el call-site (`<retro-icon class="my-class" ...>`) se preservan en todos los ciclos de detección de cambios.
- Las clases host y sus condiciones son:

  | Clase                  | Condición        |
  | ---------------------- | ---------------- |
  | `retro-icon-host`      | siempre          |
  | `retro-icon-host--xs`  | `size === 'xs'`  |
  | `retro-icon-host--sm`  | `size === 'sm'`  |
  | `retro-icon-host--md`  | `size === 'md'`  |
  | `retro-icon-host--lg`  | `size === 'lg'`  |
  | `retro-icon-host--xl`  | `size === 'xl'`  |
  | `retro-icon-host--2xl` | `size === '2xl'` |

- `aria-hidden="true"` es el default porque la mayoría de usos son decorativos. Para iconos que transmiten información semántica (sin texto alternativo en el call-site), pasar `[ariaHidden]="false"` y asegurarse de que el contenedor padre tenga `aria-label`.
