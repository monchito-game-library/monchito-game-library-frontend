# retro-select

Select accesible Terminal Collector (combobox + listbox pattern, APG). Componente self-contained que internaliza label, hint y error — el consumidor solo necesita aportar las opciones y conectar el control.

**Selector:** `retro-select` · **Standalone:** sí · **CVA:** sí

## Cuándo usar / Cuándo NO usar

- Usar cuando: el usuario debe escoger un valor de una lista cerrada de opciones (plataforma, estado, categoría, etc.).
- NO usar cuando: necesitas búsqueda por texto sobre las opciones — usa `retro-search` en su lugar.

## API — Inputs

| Nombre           | Tipo Angular                        | Default     | Descripción                                                                                 |
| ---------------- | ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`               | `''`        | Texto del label del campo.                                                                  |
| `placeholder`    | `InputSignal<string>`               | `''`        | Texto de placeholder cuando no hay selección.                                               |
| `hint`           | `InputSignal<string \| null>`       | `null`      | Mensaje de ayuda bajo el campo.                                                             |
| `error`          | `InputSignal<string \| null>`       | `null`      | Mensaje de error bajo el campo.                                                             |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>` | `'lg'`      | Altura del campo: `sm` (32px), `md` (40px), `lg` (44px).                                    |
| `prefixIcon`     | `InputSignal<string \| null>`       | `null`      | Nombre de icono Material decorativo en el prefix.                                           |
| `suffixIcon`     | `InputSignal<string \| null>`       | `null`      | Nombre de icono Material decorativo en el suffix.                                           |
| `clearable`      | `InputSignal<boolean>`              | `false`     | Muestra botón X para limpiar cuando hay selección.                                          |
| `clearAriaLabel` | `InputSignal<string>`               | `'Limpiar'` | `aria-label` del botón limpiar.                                                             |
| `hideSubscript`  | `InputSignal<boolean>`              | `false`     | Oculta el bloque subscript (hint/error). Útil en campos de búsqueda sin validación visible. |
| `value`          | `InputSignal<unknown>`              | `undefined` | Valor en modo standalone (sin `formControlName`). Equivalente a `[value]` de `mat-select`.  |

## API — Outputs

| Nombre            | Tipo Angular                | Descripción                                                   |
| ----------------- | --------------------------- | ------------------------------------------------------------- |
| `selectionChange` | `OutputEmitterRef<unknown>` | Emite el nuevo valor cuando el usuario selecciona una opción. |
| `cleared`         | `OutputEmitterRef<void>`    | Emite cuando el usuario pulsa el botón limpiar.               |

## Slots

| Selector        | Tipo esperado          | Descripción                                                               |
| --------------- | ---------------------- | ------------------------------------------------------------------------- |
| _(default)_     | `<retro-option>` nodes | Opciones proyectadas en el listbox. Obligatorio.                          |
| `[retroPrefix]` | elemento con directiva | Elementos con comportamiento propio en el prefix (botones, badges, etc.). |
| `[retroSuffix]` | elemento con directiva | Elementos con comportamiento propio en el suffix.                         |

## Subcomponente — `<retro-option>`

**Selector:** `retro-option` · **Standalone:** sí · **Requerido dentro de `retro-select`.**

| Nombre     | Tipo Angular                                            | Default | Descripción                                           |
| ---------- | ------------------------------------------------------- | ------- | ----------------------------------------------------- |
| `value`    | `InputSignalWithTransform<unknown, unknown> (required)` | —       | Valor opaco que se emite al seleccionar esta opción.  |
| `disabled` | `InputSignalWithTransform<boolean, unknown>`            | `false` | Desactiva la opción. Acepta `boolean` o string vacío. |

El contenido proyectado en el slot por defecto de `<retro-option>` se usa como label visible. Los iconos `<retro-icon>` y `.material-icons` se excluyen automáticamente del texto del label para que el trigger no muestre el nombre del icono.

## Contrato CVA

- `writeValue(value: unknown)`: acepta cualquier valor; `null` y `undefined` limpian la selección.
- `registerOnChange`: emite `unknown` (el valor de la opción seleccionada, o `null` al limpiar).
- `setDisabledState`: refleja `disabled` mediante el signal interno `_isDisabled`.

## Tipos exportados

_(No hay fichero `.types.ts` — los tipos son `'sm' | 'md' | 'lg'` inline en el input `size`.)_

## Ejemplo mínimo

Modo reactivo (formulario):

```html
<retro-select label="Estado" formControlName="status" placeholder="Selecciona...">
  @for (s of statuses; track s.code) {
  <retro-option [value]="s.code">{{ s.label }}</retro-option>
  }
</retro-select>
```

Modo standalone (sin formulario):

```html
<retro-select label="Plataforma" [value]="selectedPlatform" (selectionChange)="onPlatformChange($event)">
  @for (p of platforms; track p.id) {
  <retro-option [value]="p">{{ p.name }}</retro-option>
  }
</retro-select>
```

Con objeto complejo y `displayWith` — si el `value` de la opción es un objeto y quieres mostrar una propiedad concreta en el trigger, usa la función `displayWith` del `displayValue` computed o pasa el texto visible directamente como contenido del `<retro-option>`:

```html
<!-- El trigger muestra el textContent del retro-option seleccionado -->
<retro-option [value]="game">{{ game.title }}</retro-option>
```

## Gotchas

- **Panel renderizado fuera del DOM del select**: el listbox se inserta vía CDK Overlay en un `<div>` raíz del documento (no dentro del `retro-select`). Los estilos del panel van en `styles.scss` global bajo `.retro-select__panel`, no en el `.scss` del componente.
- **`[value]=undefined` limpia la selección**: en modo standalone, pasar `undefined` o `null` al input `value` es equivalente — ambos limpian la selección actual. Esto es simétrico con el comportamiento de `writeValue`.
- **Objetos como valor**: `displayValue` busca la opción cuyo `value()` coincida estrictamente (`===`) con el valor actual. Si pasas objetos, la referencia debe ser la misma instancia; de lo contrario el trigger mostrará `String(value)` como fallback. Para evitarlo, usa primitivos (id, código) como `value` de la opción y muestra el label solo como contenido proyectado.
- **`disabled` en `retro-option` como atributo**: el input acepta `booleanAttribute` transform, por lo que `<retro-option disabled>` (sin valor) activa el flag correctamente además de `[disabled]="true"`.
- **Navegación por teclado**: ArrowDown/Up mueve el highlight, Enter/Space confirma la opción activa, Escape cierra sin cambiar el valor, Tab confirma la opción activa y cierra, Home/End salta al primer/último elemento.
