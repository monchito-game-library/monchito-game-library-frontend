# retro-datepicker

Datepicker self-contained (APG Date Picker Dialog Grid Pattern) que internaliza `retro-form-field`, el input nativo y el panel de calendario. El consumidor solo declara el componente con `formControlName`.

**Selector:** `retro-datepicker` · **Standalone:** sí · **CVA:** sí

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita seleccionar una fecha concreta (día, mes y año) vinculada a un `FormControl`.
- NO usar cuando: la selección es solo de mes/año sin día — en ese caso considerar un componente custom, ya que el grid de días no aplica.

## API — Inputs

| Nombre           | Tipo Angular                        | Default     | Descripción                                                                                   |
| ---------------- | ----------------------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`               | `''`        | Texto del label del campo.                                                                    |
| `placeholder`    | `InputSignal<string>`               | `''`        | Placeholder del input nativo.                                                                 |
| `hint`           | `InputSignal<string \| null>`       | `null`      | Mensaje de ayuda bajo el campo.                                                               |
| `error`          | `InputSignal<string \| null>`       | `null`      | Mensaje de error bajo el campo.                                                               |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>` | `'lg'`      | Altura del campo: `sm` 32px, `md` 40px, `lg` 44px.                                            |
| `prefixIcon`     | `InputSignal<string \| null>`       | `null`      | Nombre de icono Material decorativo en el prefix.                                             |
| `clearable`      | `InputSignal<boolean>`              | `false`     | Muestra botón X para limpiar cuando hay fecha seleccionada.                                   |
| `clearAriaLabel` | `InputSignal<string>`               | `'Limpiar'` | `aria-label` del botón limpiar.                                                               |
| `hideSubscript`  | `InputSignal<boolean>`              | `false`     | Oculta el bloque subscript (hint/error) del `retro-form-field` interno.                       |
| `min`            | `InputSignal<Date \| null>`         | `null`      | Fecha mínima seleccionable. Días fuera de rango quedan deshabilitados en el grid.             |
| `max`            | `InputSignal<Date \| null>`         | `null`      | Fecha máxima seleccionable. Días fuera de rango quedan deshabilitados en el grid.             |
| `locale`         | `InputSignal<string>`               | `'es-ES'`   | Locale BCP 47 para nombres de mes, día de semana y formato de display del input (dd/MM/yyyy). |

## API — Outputs

| Nombre    | Tipo Angular             | Descripción                            |
| --------- | ------------------------ | -------------------------------------- |
| `cleared` | `OutputEmitterRef<void>` | Emite cuando el usuario pulsa limpiar. |

## Contrato CVA

- `writeValue(value)`: acepta `Date`, `string` ISO (`YYYY-MM-DD`) o `null`/`undefined`. Los strings se parsean como fecha local (evita desfase UTC). `null`/`undefined` limpian la selección.
- `registerOnChange`: emite `Date | null`. El valor de retorno es siempre un `Date` construido sin componente horario (medianoche local), compatible con `FormControl<Date | null>`.
- `setDisabledState`: refleja `disabled` en el input nativo y bloquea la apertura del calendario.

## Integración con retro-form-field

`retro-datepicker` contiene internamente un `retro-form-field`. Los inputs `label`, `hint`, `error`, `size`, `prefixIcon`, `clearable`, `hideSubscript` se pasan directamente al `retro-form-field` interno. El suffix (botón de toggle del calendario) está reservado internamente — no expone slots `[retroPrefix]` ni `[retroSuffix]` al consumidor. Para un icono decorativo en el prefix usa el input `prefixIcon`.

## Ejemplo mínimo

```html
<retro-datepicker label="Fecha de compra" formControlName="purchaseDate" [min]="minDate" [clearable]="true" />
```

Con locale inglés:

```html
<retro-datepicker label="Purchase date" formControlName="purchaseDate" locale="en-US" />
```

## Gotchas

- **Strings ISO y UTC**: pasar `'2024-06-15'` como string a `writeValue` se parsea como fecha local (no UTC midnight). Si se pasa un `Date` construido con `new Date('2024-06-15')`, este se interpreta como UTC y puede mostrar el día anterior en zonas UTC-. Prefer construir `Date` con `new Date(2024, 5, 15)` o dejar que el componente parsee el string ISO.
- **Valor emitido siempre es `Date`**: aunque `writeValue` acepta string, `registerOnChange` emite siempre `Date`. Tipificar el `FormControl` como `FormControl<Date | null>`.
- **Navegación por teclado respeta min/max**: las teclas de flecha, PageUp/Down y Home/End no pueden sobrepasar los límites `min`/`max` — el foco queda clampeado en el borde del rango.
- **`locale` afecta nombre de mes y formato de display**: el header del calendario ("mayo 2026", "May 2026") y el texto del input (`dd/MM/yyyy` en `es-ES`, `MM/dd/yyyy` en `en-US`) dependen del locale configurado. Cambiar `locale` en runtime actualiza el display en el siguiente `_rebuildCalendar`.
- **Panel via CDK Overlay**: el calendario se teleporta al `OverlayContainer` del CDK, fuera del árbol DOM del host. Los tests que busquen el grid de días deben buscarlo en `document.body` o usar `OverlayContainer` de `@angular/cdk/overlay`.
- **Selección de mes/año**: el componente no expone navegación de solo mes o año. Para ese caso de uso, construir un componente custom.
