# retro-search

Campo de búsqueda con autocomplete self-contained Terminal Collector.
Sucesor de `retro-autocomplete` — selector actualizado a `retro-search`.
Implementa `ControlValueAccessor` — compatible con `formControlName` y `ngModel`.

## Selector

`retro-search`

## Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | `''` | Texto del label del campo. |
| `placeholder` | `string` | `''` | Placeholder del input nativo. |
| `hint` | `string \| null` | `null` | Mensaje de ayuda bajo el campo. |
| `error` | `string \| null` | `null` | Mensaje de error bajo el campo. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` | Altura del campo (32/40/44px). |
| `prefixIcon` | `string \| null` | `'search'` | Nombre de icono Material decorativo en prefix. Por defecto muestra la lupa. |
| `suffixIcon` | `string \| null` | `null` | Nombre de icono Material decorativo en suffix. |
| `clearable` | `boolean` | `false` | Muestra botón X para limpiar cuando hay valor o texto. |
| `clearAriaLabel` | `string` | `'Limpiar'` | `aria-label` del botón limpiar. |
| `hideSubscript` | `boolean` | `false` | Oculta el bloque subscript (hint/error) del form-field interno. |
| `displayWith` | `((value: any) => string) \| null` | `null` | Convierte el valor seleccionado en el texto del input. |
| `minChars` | `number` | `0` | Mínimo de caracteres para abrir el panel. |

## Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `queryChange` | `string` | Emite el texto actual cada vez que el usuario escribe. |
| `optionSelected` | `unknown` | Emite el valor al seleccionar una opción. |
| `cleared` | `void` | Emite al pulsar el botón limpiar. |

## Slots (ng-content)

| Selector | Descripción |
|---|---|
| Default | Se proyectan `<retro-option>` como opciones del listbox. |
| `[retroPrefix]` | Elementos con comportamiento propio en el prefix (botones, badges, etc.). |
| `[retroSuffix]` | Elementos con comportamiento propio en el suffix. |

## Estados internos

- `_displayValue`: texto visible en el input (lo que escribe el usuario).
- `_selectedValue`: valor real del FormControl (solo cambia al seleccionar una opción).

Al blur sin selección, el texto permanece. Al volver a hacer focus, el panel reabre si se cumple `minChars`.

## A11y

- Input: `role="combobox"` implícito, `aria-autocomplete="list"`, `aria-controls`, `aria-expanded`.
- Listbox: `role="listbox"`.
- Teclado: ArrowUp/Down (navega opciones), Enter (selecciona activa), Escape (cierra panel).

## Ejemplo

```html
<retro-search
  label="Plataforma"
  formControlName="platform"
  placeholder="Escribe para buscar..."
  [displayWith]="displayPlatformLabel"
  [clearable]="true"
  (queryChange)="filterPlatforms($event)">
  @for (p of filteredPlatforms(); track p.code) {
    <retro-option [value]="p.code">{{ p.labelKey | transloco }}</retro-option>
  }
</retro-search>
```
