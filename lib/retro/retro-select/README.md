# retro-select

Select accesible Terminal Collector (combobox + listbox APG). Componente self-contained.
Implementa `ControlValueAccessor` — compatible con `formControlName` y `ngModel`.

## Selector

`retro-select`

## Inputs

| Nombre           | Tipo                   | Default       | Descripción                                                                                      |
| ---------------- | ---------------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| `label`          | `string`               | — (requerido) | Texto del label del campo.                                                                       |
| `placeholder`    | `string`               | `''`          | Texto cuando no hay selección.                                                                   |
| `hint`           | `string \| null`       | `null`        | Mensaje de ayuda bajo el campo.                                                                  |
| `error`          | `string \| null`       | `null`        | Mensaje de error bajo el campo.                                                                  |
| `size`           | `'sm' \| 'md' \| 'lg'` | `'lg'`        | Altura del campo (32/40/44px).                                                                   |
| `prefixIcon`     | `string \| null`       | `null`        | Nombre de icono Material decorativo en prefix.                                                   |
| `suffixIcon`     | `string \| null`       | `null`        | Nombre de icono Material decorativo en suffix.                                                   |
| `clearable`      | `boolean`              | `false`       | Muestra botón X para limpiar cuando hay selección.                                               |
| `clearAriaLabel` | `string`               | `'Limpiar'`   | `aria-label` del botón limpiar.                                                                  |
| `hideSubscript`  | `boolean`              | `false`       | Oculta el bloque subscript (hint/error); usar en campos sin validación visible (p.ej. búsqueda). |
| `value`          | `unknown`              | `undefined`   | Valor en modo standalone (sin formControlName).                                                  |

## Outputs

| Nombre            | Tipo      | Descripción                                     |
| ----------------- | --------- | ----------------------------------------------- |
| `selectionChange` | `unknown` | Emite el nuevo valor al seleccionar una opción. |
| `cleared`         | `void`    | Emite al pulsar el botón limpiar.               |

## Slots (ng-content)

| Selector        | Descripción                                                               |
| --------------- | ------------------------------------------------------------------------- |
| Default         | Se proyectan `<retro-option>` como opciones del listbox.                  |
| `[retroPrefix]` | Elementos con comportamiento propio en el prefix (botones, badges, etc.). |
| `[retroSuffix]` | Elementos con comportamiento propio en el suffix.                         |

## A11y

- Trigger: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, `aria-activedescendant`.
- Listbox: `role="listbox"`.
- Opciones: `role="option"`, `aria-selected`.
- Teclado: ArrowUp/Down, Home/End, Enter/Space, Escape, Tab.
- Disabled via `aria-disabled` (el trigger es un `<div>`, no un `<button>`).

## Componente — RetroOptionComponent

- **Selector:** `retro-option`
- **Inputs:** `value: unknown` (required), `disabled: boolean`.
- **Slots:** Default (label).

## Ejemplo

```html
<retro-select label="Estado" formControlName="status" placeholder="Selecciona...">
  @for (s of statuses; track s.code) {
  <retro-option [value]="s.code">{{ s.label }}</retro-option>
  }
</retro-select>
```

## Notas internas

- Las suscripciones al CDK overlay (`backdropClick`, `keydownEvents`) se guardan internamente y se desuscriben explícitamente en cada cierre del panel, además de usar `takeUntilDestroyed` como segunda barrera. Esto evita la acumulación de suscripciones en ciclos repetidos de apertura/cierre.
- `displayValue` es un `computed<string>()` signal que recalcula el label mostrado solo cuando `_value()` cambia, evitando el `Array.find` lineal en cada ciclo de CD.
- El input `[value]` en modo standalone limpia la selección tanto si recibe `null` como `undefined` (comportamiento simétrico con `writeValue`).
