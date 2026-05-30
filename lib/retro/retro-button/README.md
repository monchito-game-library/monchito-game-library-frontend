# retro-button

Botón reutilizable Terminal Collector con corchetes `[ LABEL ]` en desktop (pseudo-elementos ocultos en mobile ≤ 768px). Acepta slots de icono/contenido a izquierda y derecha del texto.

**Selector:** `retro-button` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita un botón de acción con texto visible (guardar, cancelar, abrir diálogo, enviar formulario).
- NO usar cuando: el botón solo lleva icono sin texto — usar `retro-icon-button` en su lugar.

## API — Inputs

| Nombre      | Tipo Angular                     | Default    | Descripción                                                                                   |
| ----------- | -------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `label`     | `InputSignal<string> (required)` | —          | Texto del botón; se muestra en uppercase.                                                     |
| `variant`   | `InputSignal<LibButtonVariant>`  | `'ghost'`  | Variante visual: `'primary'`, `'ghost'`, `'danger'`, `'success'`.                             |
| `size`      | `InputSignal<RetroButtonSize>`   | `'lg'`     | Altura del botón: `sm` (32px), `md` (40px), `lg` (44px). En mobile ≤ 768px, `sm`/`md` → 44px. |
| `disabled`  | `InputSignal<boolean>`           | `false`    | Deshabilita el botón.                                                                         |
| `loading`   | `InputSignal<boolean>`           | `false`    | Muestra spinner de carga y deshabilita el botón. Oculta los slots `start` y `end`.            |
| `type`      | `InputSignal<LibButtonType>`     | `'button'` | Tipo del `<button>` HTML nativo: `'button'`, `'submit'`, `'reset'`.                           |
| `fullWidth` | `InputSignal<boolean>`           | `false`    | Si `true`, el botón ocupa todo el ancho disponible (`width: 100%`).                           |

## API — Outputs

| Nombre    | Tipo Angular                   | Descripción                                                            |
| --------- | ------------------------------ | ---------------------------------------------------------------------- |
| `clicked` | `OutputEmitterRef<MouseEvent>` | Emite el `MouseEvent` al hacer clic; solo si no está disabled/loading. |

## Slots

| Selector       | Tipo esperado          | Descripción                                                                      |
| -------------- | ---------------------- | -------------------------------------------------------------------------------- |
| `[slot=start]` | icono o texto          | Contenido a la izquierda del label. Oculto cuando `loading` es `true`.           |
| `[slot=end]`   | icono, badge o teclado | Contenido a la derecha del label (chevrons, `<kbd>`, badges). Oculto en loading. |

## Tokens CSS expuestos

| Variable                    | Default | Descripción                                                                                                                                                                                                                                         |
| --------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--retro-btn-bottom-offset` | `0`     | Ajusta el `margin-bottom` del botón para alinearlo verticalmente con el control box de un `retro-form-field` hermano en un flex row. Valor típico: `1.25rem`. Establecer en el contenedor padre (p. ej. `.retro-field-row`), no en el propio botón. |

## Tipos exportados

- `LibButtonVariant` — `'primary' \| 'ghost' \| 'danger' \| 'success'`
- `RetroButtonSize` — `'sm' \| 'md' \| 'lg'`
- `LibButtonType` — `'button' \| 'submit' \| 'reset'`

## Ejemplo mínimo

```html
<retro-button label="Guardar" variant="primary" (clicked)="onSave($event)">
  <retro-icon slot="start" name="save" size="sm" />
</retro-button>
```

## Gotchas

- En mobile (≤ 768px) los corchetes `[ ]` de pseudo-elementos se ocultan; los tamaños `sm` y `md` se promocionan automáticamente a 44px para cumplir el touch target mínimo.
- Cuando `loading` es `true`, los slots `[slot=start]` y `[slot=end]` quedan ocultos y se muestra un spinner interno; el botón también se deshabilita.
- El host tiene `display: contents`, por lo que el componente no genera un box propio. Las dimensiones visibles las dicta el `<button>` interno.
