# retro-datepicker

Datepicker Terminal Collector (APG Date Picker Dialog Grid Pattern). Panel + 2 directivas.

## Componente — RetroDatepickerComponent

- **Selector:** `retro-datepicker`
- **A11y:** `role="dialog"`, grid con `aria-current="date"` y `aria-selected`.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `min` | `Date \| null` | `null` | Fecha mínima. |
| `max` | `Date \| null` | `null` | Fecha máxima. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `dateSelected` | `Date \| null` | Fecha seleccionada. |

### API pública: `open()`, `close()`, `isOpen()`, `setDate(value)`, `prevMonth()`, `nextMonth()`, `selectToday()`.

## Directiva — RetroDatepickerDirective (`directive/`)

- **Selector:** `input[retroDatepicker]`
- **ControlValueAccessor:** sí.
- **Hace:** conecta el input al picker, muestra `dd/MM/yyyy`, parsea ISO evitando desfase UTC.

### Inputs: `retroDatepicker: RetroDatepickerComponent` (required).

## Directiva — RetroDatepickerToggleDirective (`directive/`)

- **Selector:** `[retroDatepickerToggle]`
- **Hace:** abre/cierra el picker al click en el host.

### Inputs: `retroDatepickerToggle: RetroDatepickerComponent` (required).

## Constantes (`constants/`)

- `RETRO_DATEPICKER_DAY_HEADERS` — `['L', 'M', 'X', 'J', 'V', 'S', 'D']`.

## Interfaces (`interfaces/`)

- `RetroDatepickerDay` — modelo de celda del grid.

## Ejemplo

```html
<retro-form-field>
  <retro-label>Fecha</retro-label>
  <input retroInput [retroDatepicker]="picker" formControlName="date" [readonly]="true" />
  <retro-icon retroSuffix [retroDatepickerToggle]="picker" name="calendar_today" />
  <retro-datepicker #picker [min]="minDate" />
</retro-form-field>
```
