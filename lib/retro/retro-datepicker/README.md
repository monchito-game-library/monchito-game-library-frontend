# retro-datepicker

Datepicker Terminal Collector — componente self-contained (APG Date Picker Dialog Grid Pattern).
Implementa `ControlValueAccessor` — compatible con `formControlName` y `ngModel`.

## Selector

`retro-datepicker`

## Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | — (requerido) | Texto del label del campo. |
| `placeholder` | `string` | `''` | Placeholder del input nativo. |
| `hint` | `string \| null` | `null` | Mensaje de ayuda bajo el campo. |
| `error` | `string \| null` | `null` | Mensaje de error bajo el campo. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` | Altura del campo (32/40/44px). |
| `prefixIcon` | `string \| null` | `null` | Nombre de icono Material decorativo en prefix. |
| `clearable` | `boolean` | `false` | Muestra botón X para limpiar cuando hay fecha. |
| `clearAriaLabel` | `string` | `'Limpiar'` | `aria-label` del botón limpiar. |
| `hideSubscript` | `boolean` | `false` | Oculta el bloque subscript (hint/error) del form-field interno. Útil en campos de búsqueda sin validación visible. |
| `min` | `Date \| null` | `null` | Fecha mínima seleccionable. |
| `max` | `Date \| null` | `null` | Fecha máxima seleccionable. |

## Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `cleared` | `void` | Emite al pulsar el botón limpiar. |

## Contrato del FormControl

- `writeValue` acepta `Date` o string ISO (`YYYY-MM-DD`). Los strings se parsean como fecha local.
- El valor emitido a `registerOnChange` es siempre `Date` — compatible con `FormControl<Date | null>`.
- El texto visible en el input es `dd/MM/yyyy`.

## A11y

- Toggle: `<retro-icon-button>` con `aria-label="Abrir calendario"` en suffix; accesible por teclado (Tab + Enter/Space).
- Dialog: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (mes + año).
- Grid: `role="grid"`, `aria-current="date"`, `aria-selected`.
- Teclado en grid: ArrowKeys (navega días), Enter/Space (selecciona), Escape (cierra), PageUp/Down (mes anterior/siguiente), Shift+PageUp/Down (año anterior/siguiente), Home/End (inicio/fin de semana).

## Slots

Los slots `[retroPrefix]` y `[retroSuffix]` **no están disponibles** en `retro-datepicker`. El suffix lo utiliza internamente el toggle del calendario (`retro-icon-button`). Para añadir un icono decorativo al prefix, usa el input `prefixIcon`.

## Constantes (`constants/`)

- `RETRO_DATEPICKER_DAY_HEADERS` — `['L', 'M', 'X', 'J', 'V', 'S', 'D']`.

## Interfaces (`interfaces/`)

- `RetroDatepickerDay` — modelo de celda del grid.

## Ejemplo

```html
<retro-datepicker
  label="Fecha de compra"
  formControlName="purchaseDate"
  [min]="minDate"
  [clearable]="true" />
```
