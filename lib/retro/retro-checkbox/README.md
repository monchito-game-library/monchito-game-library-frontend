# retro-checkbox

Checkbox terminal `[X]` / `[ ]` reutilizable con patrón visual monocromo. Soporta modo standalone (binding directo) y modo CVA (formularios reactivos).

**Selector:** `retro-checkbox` · **Standalone:** sí · **CVA:** sí

## Cuándo usar / Cuándo NO usar

- Usar cuando: necesitas un control de selección booleana con semántica de casilla de verificación (`role="checkbox"`).
- NO usar cuando: quieres un toggle visual on/off para activar/desactivar un ajuste — considerar `retro-toggle` si existe en la lib.

## API — Inputs

| Nombre     | Tipo Angular                       | Default     | Descripción                                                                   |
| ---------- | ---------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `checked`  | `InputSignal<boolean>`             | `false`     | Estado checked en modo standalone. Se ignora si hay `formControlName` activo. |
| `label`    | `InputSignal<string \| undefined>` | `undefined` | Etiqueta opcional a la derecha del control (mono uppercase).                  |
| `size`     | `InputSignal<LibCheckboxSize>`     | `'md'`      | Tamaño del glyph: `'sm'` (0.875rem) o `'md'` (1rem).                          |
| `disabled` | `InputSignal<boolean>`             | `false`     | Deshabilita el control en modo standalone. CVA usa `setDisabledState`.        |

## API — Outputs

| Nombre    | Tipo Angular                | Descripción                                                                                         |
| --------- | --------------------------- | --------------------------------------------------------------------------------------------------- |
| `changed` | `OutputEmitterRef<boolean>` | Emite el nuevo valor booleano tras cada toggle. Se emite tanto en modo standalone como en modo CVA. |

## Contrato CVA

- `writeValue(value)`: acepta `boolean`; cualquier valor falsy normaliza a `false` (`!!v`).
- `registerOnChange`: emite `boolean`.
- `setDisabledState`: refleja `disabled`.

## Tipos exportados

- `LibCheckboxSize` — `'sm' \| 'md'`

## Ejemplo mínimo

```html
<!-- Modo CVA con formulario reactivo -->
<retro-checkbox formControlName="includeArchived" label="MOSTRAR ARCHIVADOS" />
```

```html
<!-- Modo standalone -->
<retro-checkbox [checked]="isSelected()" (changed)="onToggle($event)" label="FAVORITO" />
```

## Gotchas

- El glyph visual es `[X]` (checked) y `[ ]` (unchecked) — cambio discreto sin animación de transición (regla Terminal Collector).
- ARIA: el elemento raíz tiene `role="checkbox"` y `aria-checked` vinculado al valor interno. No usar como switch on/off semántico.
- En modo CVA, el binding `[checked]` y el input `disabled` se ignoran — el control obtiene estado únicamente de `writeValue` / `setDisabledState`.
- En mobile el touch target mínimo es 44×44px aunque el glyph sea más pequeño visualmente.
