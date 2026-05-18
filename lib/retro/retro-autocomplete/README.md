# retro-autocomplete

Panel de autocomplete Terminal Collector que se ancla a un `<input retroInput>` mediante una directiva trigger.

## Componente principal — RetroAutocompleteComponent

- **Selector:** `retro-autocomplete`
- **Standalone:** sí
- **Hace:** abre un overlay CDK posicionado bajo el input con la lista de `<retro-option>` proyectada. La lógica de filtrado vive en el padre.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `displayWith` | `((value: any) => string) \| null` | `null` | Función que convierte el valor seleccionado en el texto a mostrar en el input. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `optionSelected` | `unknown` | Emite el valor de la opción cuando el usuario selecciona. |

### Slots / ng-content

- Default: se proyectan `<retro-option>`.

### API pública adicional

- `openPanel()`, `closePanel()`, `isOpen()`, `moveActive(1 | -1)`, `selectActive()`, `registerTrigger(ElementRef)`.

### Dependencias

- `RetroOptionComponent`, `RETRO_OPTION_PARENT` (token).
- CDK Overlay + Portal.

## Directiva — RetroAutocompleteTriggerDirective

- **Selector:** `input[retroAutocompleteTrigger], textarea[retroAutocompleteTrigger]`
- **Hace:** conecta un input nativo con el `RetroAutocompleteComponent`. Abre el panel en focus/input, navega con ArrowDown/Up, selecciona con Enter, cierra con Escape/blur.

### Inputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `retroAutocompleteTrigger` | `RetroAutocompleteComponent` (required) | Referencia al panel asociado. |

## Ejemplo de uso

```html
<retro-form-field>
  <retro-label>Plataforma</retro-label>
  <input
    retroInput
    type="text"
    [retroAutocompleteTrigger]="auto"
    [formControl]="form.controls.platform" />
  <retro-autocomplete #auto [displayWith]="displayPlatformLabel">
    @for (p of filteredPlatforms(); track p.code) {
      <retro-option [value]="p.code">{{ p.labelKey | transloco }}</retro-option>
    }
  </retro-autocomplete>
</retro-form-field>
```
