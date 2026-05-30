# retro-search

Campo de búsqueda con autocomplete self-contained Terminal Collector. Internaliza `retro-form-field` + input nativo + panel overlay. El consumidor proyecta `<retro-option>` y el componente gestiona la apertura del panel.

**Selector:** `retro-search` · **Standalone:** sí · **CVA:** sí

## Cuándo usar / Cuándo NO usar

- Usar cuando: necesitas un campo de texto con autocomplete donde el padre controla la lista filtrada de opciones y el componente gestiona el panel overlay.
- NO usar cuando: necesitas un selector cerrado (sin escritura libre) — usar `retro-select`.

## API — Inputs

| Nombre           | Tipo Angular                                        | Default     | Descripción                                                                             |
| ---------------- | --------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`                               | `''`        | Texto del label del campo.                                                              |
| `placeholder`    | `InputSignal<string>`                               | `''`        | Placeholder del input nativo.                                                           |
| `hint`           | `InputSignal<string \| null>`                       | `null`      | Mensaje de ayuda bajo el campo.                                                         |
| `error`          | `InputSignal<string \| null>`                       | `null`      | Mensaje de error bajo el campo.                                                         |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>`                 | `'lg'`      | Altura del campo: sm (32px), md (40px), lg (44px).                                      |
| `prefixIcon`     | `InputSignal<string \| null>`                       | `'search'`  | Nombre de icono Material en el prefix. Por defecto muestra la lupa.                     |
| `suffixIcon`     | `InputSignal<string \| null>`                       | `null`      | Nombre de icono Material decorativo en el suffix.                                       |
| `clearable`      | `InputSignal<boolean>`                              | `false`     | Muestra el botón X para limpiar cuando hay valor o texto.                               |
| `clearAriaLabel` | `InputSignal<string>`                               | `'Limpiar'` | `aria-label` del botón limpiar.                                                         |
| `hideSubscript`  | `InputSignal<boolean>`                              | `false`     | Oculta el bloque subscript (hint/error) del form-field interno.                         |
| `displayWith`    | `InputSignal<((value: unknown) => string) \| null>` | `null`      | Función para convertir el valor seleccionado en el texto visible del input.             |
| `minChars`       | `InputSignal<number>`                               | `0`         | Número mínimo de caracteres para abrir el panel. Con `0`, el panel abre al hacer focus. |

## API — Outputs

| Nombre           | Tipo Angular                | Descripción                                                                          |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| `queryChange`    | `OutputEmitterRef<string>`  | Emite el texto actual cada vez que el usuario escribe. El padre filtra las opciones. |
| `optionSelected` | `OutputEmitterRef<unknown>` | Emite el valor de la opción seleccionada.                                            |
| `cleared`        | `OutputEmitterRef<void>`    | Emite al pulsar el botón limpiar.                                                    |

## Slots

| Selector        | Tipo esperado                | Descripción                                                                  |
| --------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| _(default)_     | `<retro-option>`             | Opciones del autocomplete. Vienen de `retro-select/components/retro-option`. |
| `[retroPrefix]` | icono, botón u otro elemento | Contenido adicional en el área de prefix (después del `prefixIcon`).         |
| `[retroSuffix]` | icono, botón u otro elemento | Contenido adicional en el área de suffix (después del `suffixIcon`).         |

## Contrato CVA

- `writeValue(value)`: acepta `unknown`; `null`/`undefined` limpia el texto visible y el valor seleccionado. Si hay `displayWith`, lo aplica al valor recibido para actualizar el texto visible.
- `registerOnChange`: emite `unknown` (el valor de la opción seleccionada).
- `setDisabledState`: refleja `disabled`.

## Ejemplo mínimo

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

## Gotchas

- `displayWith` debe ser `(value: unknown) => string` — el tipo de `value` es `unknown` por diseño. Castear dentro de la función: `(v) => (v as PlatformCode) ? platformsMap.get(v as PlatformCode)?.label ?? '' : ''`.
- Las opciones proyectadas son `<retro-option>` del módulo `retro-select` (reutilización confirmada). No confundir con un elemento HTML estándar.
- El panel tiene dos estados independientes: `_displayValue` (lo que escribe el usuario) y `_selectedValue` (el valor real del FormControl). Escribir texto no cambia el valor del formulario hasta que se selecciona una opción.
- Al limpiar (`onClear`), el formulario recibe `null` (a diferencia de `retro-input` que emite `''`).
- La navegación por teclado está activa: `ArrowDown` / `ArrowUp` navega opciones, `Enter` selecciona, `Escape` cierra, `Home` / `End` van a primera / última opción.
- Si las opciones se cargan de forma asíncrona después de que ya hay un valor seleccionado, el componente actualiza automáticamente el texto visible cuando la lista cambia (vía `displayWith` o búsqueda por valor).
