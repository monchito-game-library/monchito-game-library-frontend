# Plan de implementación — Rediseño de form controls de la librería retro

## Estado

**Aprobado y pendiente de implementación.**

Plan consolidado tras una serie de análisis sobre el rediseño de los componentes de formulario de la librería retro (Terminal Collector design system, Angular). Todas las decisiones de arquitectura y API recogidas aquí están cerradas; este documento es la referencia que el tech engineer debe seguir durante la ejecución.

---

## 1. Scope del rediseño

### Componentes afectados

| Componente | Acción |
|---|---|
| `retro-input` | **Nuevo** componente self-contained |
| `retro-select` | **Rediseño** (self-contained, trigger `<div role="combobox">`, overlay anclado al host) |
| `retro-search` | **Rename** desde `retro-autocomplete` + rediseño self-contained |
| `retro-datepicker` | **Rediseño** self-contained |
| `retro-form-field` | Pasa a ser pieza `@internal` de la lib, **no exportada** al consumidor |

### Fuera de scope

- `retro-checkbox` queda fuera de este plan.

---

## 2. Patrón self-contained

Todos los componentes del scope pasan a ser **self-contained**: internalizan `retro-form-field` dentro de su propio template. El consumidor ya no tiene que componer `<retro-form-field>` + `<retro-label>` + `<input retroInput>` manualmente.

### Antes

```html
<retro-form-field>
  <retro-label>Estado</retro-label>
  <retro-select formControlName="status">
    <retro-option value="a">Activo</retro-option>
  </retro-select>
</retro-form-field>
```

### Después

```html
<retro-select label="Estado" formControlName="status">
  <retro-option value="a">Activo</retro-option>
</retro-select>
```

---

## 3. Token de inyección para unificación

### Problema actual

`retro-form-field` descubre su control hijo vía `@ContentChild(RetroInputDirective)`, lo cual solo funciona con `<input retroInput>`. `retro-select` y `retro-datepicker` no se anuncian al form-field y el estado de foco/error/disabled no se propaga correctamente (bug visible en la captura: select sin estado focused).

### Solución

Definir un token `RETRO_FORM_FIELD_CONTROL` y una interfaz de contrato:

```typescript
interface RetroFormFieldControl {
  focused$: Observable<boolean>;
  errorState: boolean;
  disabled: boolean;
  empty: boolean;
}
```

Cada inner control (`RetroInputDirective`, `RetroSelectComponent`, `RetroSearchComponent`, `RetroDatepickerDirective`) provee el token vía:

```typescript
providers: [
  { provide: RETRO_FORM_FIELD_CONTROL, useExisting: forwardRef(() => MyComponent) }
]
```

`RetroFormFieldComponent` inyecta vía `@ContentChild(RETRO_FORM_FIELD_CONTROL)` en lugar de la directiva concreta.

---

## 4. API pública común

Todos los componentes self-contained comparten esta API.

### Inputs

| Input | Tipo | Default |
|---|---|---|
| `label` | `string` | — |
| `placeholder` | `string` | `''` |
| `hint` | `string \| null` | `null` |
| `error` | `string \| null` | `null` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` |
| `disabled` | `boolean` | `false` |
| `prefixIcon` | `string \| null` | `null` |
| `suffixIcon` | `string \| null` | `null` |
| `clearable` | `boolean` | `false` |
| `clearAriaLabel` | `string` | `'Limpiar'` |

### Output

- `(cleared): void` — se emite al pulsar el botón clear.

### Slots

- `[retroPrefix]` — elementos con comportamiento en el prefix.
- `[retroSuffix]` — elementos con comportamiento en el suffix.

---

## 5. Iconos: inputs string + slots para comportamiento

- `prefixIcon="search"` / `suffixIcon="calendar_today"` → inputs `string` para iconos **decorativos** (caso 95%).
- `[retroPrefix]` / `[retroSuffix]` → slots de `ng-content` para elementos **con comportamiento propio** (botones, toggles, etc.).
- Cuando ambos están presentes: el slot tiene prioridad / el input se ignora (o `console.warn` en dev).

---

## 6. Tamaños alineados con retro-button

| Size | Altura |
|---|---|
| `sm` | 32px |
| `md` | 40px |
| `lg` | 44px (default — no rompe lo existente) |

- Implementación: **CSS custom properties** en `retro-form-field` + modifier classes.
- La subscript (error/hint) **NO escala** — siempre `font-size: 0.6875rem`.

---

## 7. Error / hint: inputs de string

- `error: string | null` — un solo mensaje. El componente padre decide qué error mostrar.
- `hint: string | null` — igual.
- Los slots `<retro-error>` / `<retro-hint>` se mantienen para casos avanzados (mensajes con pipes, links, etc.).

---

## 8. retro-select: área clickable y anclaje del panel

### Trigger

- `<div role="combobox" tabindex="0">` (**NO** `<button>`).
- El div ocupa **todo** el marco visual del campo.
- `cursor: pointer`, `user-select: none`, `outline: none` + focus-ring custom.

### Anclaje del overlay

Al `ElementRef` del **host** del componente (`<retro-select>`), no al trigger interno:

```typescript
.flexibleConnectedTo(this._elRef)              // host, no this._triggerEl
minWidth: this._elRef.nativeElement.offsetWidth
```

El `#trigger` ViewChild se mantiene **solo para devolver foco al cerrar** (`trigger.nativeElement.focus()`).

### Estado disabled

Se bloquea en JS (`if (disabled()) return`) porque un `<div>` no tiene propiedad nativa `disabled`. Usar `aria-disabled` en lugar de `disabled`.

---

## 9. retro-select vs retro-search: distinción definitiva

| | `retro-select` | `retro-search` |
|---|---|---|
| Texto editable en el trigger | No (div no editable) | Sí (`<input>`) |
| Tipo de opciones | Conjunto cerrado (enum/lookup pequeño) | Catálogo filtrable (lookup grande) |
| Patrón ARIA | `combobox` no editable | `combobox` editable |
| Cuándo usar | Estado del pedido, condición del juego, plataforma de set pequeño | Tienda, modelo de hardware, plataforma de catálogo grande |

**Sin `searchable: boolean` en `retro-select`. Son dos componentes distintos.**

---

## 10. retro-search: comportamiento blur sin selección

- El texto del input **permanece** tal cual cuando el usuario pierde el foco sin seleccionar ninguna opción.
- El FormControl **no cambia** (sigue en su último valor válido o `null`).
- Al volver a hacer foco, el panel reabre con sugerencias filtradas por el texto actual.
- Al volver a hacer foco, **no pasa por debounce** — emite inmediatamente la última petición de filtrado.

### Estados internos separados

- `displayValue` (string): lo que se ve en el input — controlado por el usuario.
- `selectedValue` (T | null): lo que va al FormControl — solo cambia al seleccionar una opción.

### Modo permisivo

El texto sin selección es estado **válido** dentro del ciclo de vida del componente. La validación (`required`) del FormControl del consumidor gestiona el caso "obligatorio sin seleccionar".

### Edición

Al cargar el formulario en modo edición (`writeValue` / `patchValue`), `displayValue` se sincroniza con `displayWith(selectedValue)`.

---

## 11. Botón clear (X)

### Implementación

```html
<button class="retro-form-field__clear" type="button">
  <retro-icon name="close" size="sm" />
</button>
```

### No reutiliza `retro-icon-button`

Razones:
1. El hover de `retro-icon-button` (borde + background) compite con el borde del campo.
2. El tamaño cuadrado (44×44) consume demasiado ancho horizontal.
3. Es un sub-elemento del campo, no una acción independiente.

### Estilos centralizados

En `retro-form-field.component.scss` (centralizados para todos los campos):

```scss
.retro-form-field__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-mid);
  cursor: pointer;

  @media (hover: hover) {
    &:hover { color: var(--text-hi); }
  }

  &:focus-visible {
    outline: 1px solid var(--border-active);
    outline-offset: 2px;
  }
}
```

### Posición

A la izquierda del slot `[retroSuffix]`, dentro del `retro-form-field__control`.

### Visibilidad

`@if (clearable() && hasValue())` — desaparece del DOM (y del tab order) cuando el campo está vacío.

### Comportamiento

- `(mousedown)="$event.preventDefault()"` — evita robar foco al input.
- `(click)`:
  - Emite `null` al FormControl.
  - Emite output `(cleared)`.
  - Cierra panel si está abierto (en `retro-search`).
- Tab order: natural (alcanzable con Tab).
- `aria-label`: valor del input `clearAriaLabel` (default `'Limpiar'`).
- Oculto cuando `disabled` o `readonly`.

### Específico de retro-search

El clic en X además **cierra el panel de sugerencias** si está abierto y **devuelve foco al input**.

---

## 12. Variante interna: la directiva retro-input no cambia

La directiva `RetroInputDirective` (`retroInput`) sigue existiendo como pieza interna — la usa `retro-input` por dentro. **No se elimina**, solo deja de ser la forma de uso externo.

---

## 13. Migración de 27 templates consumidores

En una sola rama (`feat/retro-form-controls-redesign`), commits por dominio funcional:

1. `auth` (login, register, recover) — menor número de campos, ideal para validar el patrón.
2. `profile`.
3. `game-list` (filtros, formularios de creación/edición).
4. Resto de consumidores.

PR único contra `master`, **squash merge** al final.

---

## 14. Fases de implementación (orden de commits)

### Fase 1 — Fundamentos (no rompe nada existente)

- **Commit 1**: Token `RETRO_FORM_FIELD_CONTROL` + interfaz del contrato. Refactorizar `retro-form-field` para descubrir el control por token. Mantener `RetroInputDirective` proveyendo el token → retrocompatibilidad total.
- **Commit 2**: Soporte de `size: 'sm' | 'md' | 'lg'` en `retro-form-field` (CSS custom properties + modifier classes). Default `lg`.
- **Commit 3**: Spec de `retro-form-field` actualizado para el nuevo modelo de detección por token.

### Fase 2 — Componentes self-contained

- **Commit 4**: `retro-input` (nuevo componente — no directiva). Spec + README.
- **Commit 5**: `retro-select` rediseñado — internaliza form-field, trigger como `<div role="combobox">`, overlay anclado al host. Spec + README.
- **Commit 6**: `retro-search` (carpeta renombrada desde `retro-autocomplete`, selector actualizado). Self-contained. Spec + README. Actualizar barrels.
- **Commit 7**: `retro-datepicker` rediseñado. Self-contained. Spec + README.

### Fase 3 — Hacer retro-form-field interno

- **Commit 8**: Quitar `retro-form-field` del barrel público. README marcado como `@internal`.

### Fase 4 — Migración de consumidores

- **Commit 9**: templates del dominio `auth`.
- **Commit 10**: templates del dominio `profile`.
- **Commit 11**: templates del dominio `game-list` (filtros + formularios).
- **Commit 12**: resto de consumidores.

### Fase 5 — Limpieza y QA

- **Commit 13**: Eliminar usos directos de `<retro-form-field>` fuera de lib (verificar con grep).
- **Commit 14**: `npm run build` + `npm test` + `npm run lint`. Actualizar `docs/TESTING.md`.

---

## 15. Ficheros clave para la implementación

```
lib/retro/retro-form-field/
  retro-form-field.component.ts         ← refactor descubrimiento + size + clear
  retro-form-field.component.html       ← añadir clear button
  retro-form-field.component.scss       ← estilos clear + size custom props
  tokens/retro-form-field-control.token.ts   ← NUEVO
  components/retro-input/retro-input.directive.ts  ← proveer token

lib/retro/retro-input/                  ← NUEVO componente self-contained
lib/retro/retro-select/retro-select.component.ts   ← trigger div, overlay host, token
lib/retro/retro-autocomplete/ → lib/retro/retro-search/   ← rename + self-contained
lib/retro/retro-datepicker/retro-datepicker.component.ts  ← self-contained
lib/retro/ (barrel/index.ts)            ← quitar retro-form-field, añadir retro-input, retro-search
```
