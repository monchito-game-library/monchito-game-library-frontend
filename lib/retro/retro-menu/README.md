# retro-menu

Panel de menú contextual Terminal Collector que sigue el patrón APG menu pattern con CDK ListKeyManager. Se compone de tres piezas: `RetroMenuComponent` (el panel), `RetroMenuItemComponent` (cada opción) y `RetroMenuTriggerDirective` (el disparador).

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita un menú de acciones contextuales (ej. "Editar / Eliminar") anclado a un botón disparador.
- NO usar cuando: se necesita seleccionar un valor de formulario — usar `retro-select` en su lugar.

---

## RetroMenuComponent

**Selector:** `retro-menu` · **Standalone:** sí · **CVA:** no

### API — Inputs

| Nombre           | Tipo Angular                       | Default     | Descripción                                                                    |
| ---------------- | ---------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `ariaLabelledBy` | `InputSignal<string \| undefined>` | `undefined` | ID del elemento que etiqueta este menú para accesibilidad (`aria-labelledby`). |

### Slots

| Selector    | Tipo esperado      | Descripción                                                  |
| ----------- | ------------------ | ------------------------------------------------------------ |
| _(default)_ | `retro-menu-item`s | Items del menú proyectados como hijos de `<ul role="menu">`. |

---

## RetroMenuItemComponent

**Selector:** `retro-menu-item` · **Standalone:** sí · **CVA:** no

### API — Inputs

| Nombre       | Tipo Angular                       | Default     | Descripción                                               |
| ------------ | ---------------------------------- | ----------- | --------------------------------------------------------- |
| `icon`       | `InputSignal<string \| undefined>` | `undefined` | Nombre del icono Material Icons a mostrar junto al label. |
| `isDisabled` | `InputSignal<boolean>`             | `false`     | Deshabilita el item cuando es `true`.                     |

### API — Outputs

| Nombre    | Tipo Angular                   | Descripción                                                           |
| --------- | ------------------------------ | --------------------------------------------------------------------- |
| `clicked` | `OutputEmitterRef<MouseEvent>` | Emite el `MouseEvent` al hacer clic si el item no está deshabilitado. |

### Slots

| Selector    | Tipo esperado | Descripción             |
| ----------- | ------------- | ----------------------- |
| _(default)_ | texto         | Label visible del item. |

---

## RetroMenuTriggerDirective

**Selector:** `[retroMenuTriggerFor]` · **Standalone:** sí

Convierte cualquier elemento en el disparador de un `RetroMenuComponent`. Gestiona apertura/cierre del overlay CDK, navegación con teclado y atributos a11y (`aria-haspopup="menu"`, `aria-expanded` reactivo).

### API — Inputs

| Nombre                | Tipo Angular                                 | Default | Descripción                                                       |
| --------------------- | -------------------------------------------- | ------- | ----------------------------------------------------------------- |
| `retroMenuTriggerFor` | `InputSignal<RetroMenuComponent> (required)` | —       | Referencia al `RetroMenuComponent` que esta directiva va a abrir. |

---

## Ejemplo mínimo

```html
<retro-icon-button icon="more_vert" ariaLabel="Acciones" [retroMenuTriggerFor]="menu" />
<retro-menu #menu ariaLabelledBy="my-trigger-id">
  <retro-menu-item icon="edit" (clicked)="onEdit()">Editar</retro-menu-item>
  <retro-menu-item icon="delete" (clicked)="onDelete()">Eliminar</retro-menu-item>
</retro-menu>
```

---

## Gotchas

- **Anclaje CDK con `display:contents`**: la directiva puede aplicarse sobre componentes envoltorio (ej. `<retro-icon-button>`) cuyo `:host` tenga `display:contents`, lo que haría que `getBoundingClientRect()` devuelva un rect `0x0`. La directiva lo resuelve buscando automáticamente el primer descendiente `button | a | [tabindex]` como punto de anclaje real — no se necesita acción adicional.
- **Type-ahead**: el `ActiveDescendantKeyManager` tiene `withTypeAhead()` activo. Al escribir caracteres con el menú abierto, el foco salta al primer item cuyo texto empiece por esas letras.
- **Retorno de foco**: al cerrar el menú (Escape, Tab, clic en backdrop o selección de item), el foco vuelve automáticamente al elemento trigger original.
- **Items deshabilitados**: el `KeyManager` los salta en la navegación con flechas gracias a la interfaz `Highlightable`. El output `clicked` no emite si `isDisabled` es `true`.
