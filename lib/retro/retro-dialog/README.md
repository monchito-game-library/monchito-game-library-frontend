# retro-dialog

Servicio + directivas para abrir componentes como dialogs modales. Reemplaza `MatDialog` de Angular Material.

**Servicio:** `RetroDialogService` · inyectable en `root`

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita un modal bloqueante con título, contenido y acciones (confirmaciones, formularios, detalles expandidos).
- NO usar cuando: el contenido es un panel no modal o un overlay sin estructura de dialog — usar `RetroOverlayService` directamente.

## API — RetroDialogService

```typescript
open<T, D = unknown, R = unknown>(
  component: ComponentType<T>,
  config?: RetroDialogConfig<D>
): RetroDialogRef<T, R>
```

Abre `component` como dialog modal y devuelve un `RetroDialogRef` para controlarlo.

## RetroDialogConfig\<D\>

| Propiedad        | Tipo                                           | Default            | Descripción                                                              |
| ---------------- | ---------------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `data`           | `D`                                            | —                  | Datos inyectables en el componente via `RETRO_DIALOG_DATA`.              |
| `disableClose`   | `boolean`                                      | `false`            | Si `true`, Escape, backdrop y `[retroDialogClose]` no cierran el dialog. |
| `width`          | `string`                                       | —                  | Anchura del panel (ej: `'400px'`).                                       |
| `maxWidth`       | `string`                                       | —                  | Anchura máxima del panel.                                                |
| `panelClass`     | `string \| string[]`                           | —                  | Clase(s) CSS adicionales para el panel.                                  |
| `ariaLabel`      | `string`                                       | —                  | Etiqueta ARIA del dialog (alternativa a `ariaLabelledBy`).               |
| `ariaLabelledBy` | `string`                                       | —                  | ID del elemento que actúa como título (`aria-labelledby`).               |
| `autoFocus`      | `'first-tabbable' \| 'first-heading' \| false` | `'first-tabbable'` | Estrategia de foco inicial. Se ignora si `disableClose` es `true`.       |
| `restoreFocus`   | `boolean`                                      | `true`             | Si `true`, restaura el foco al elemento previo al cerrar.                |

## RetroDialogRef\<T, R\>

| Miembro             | Tipo                         | Descripción                                                                                         |
| ------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `close(result?)`    | `(result?: R) => void`       | Cierra el dialog. El valor opcional se emite en `afterClosed()`.                                    |
| `afterClosed()`     | `Observable<R \| undefined>` | Emite una vez al cerrarse, con el resultado pasado a `close()` o `undefined` si no se pasó ninguno. |
| `componentInstance` | `T \| null`                  | Instancia del componente proyectado en el dialog.                                                   |
| `disableClose`      | `boolean`                    | Refleja si el cierre está deshabilitado.                                                            |
| `backdropClick$`    | `Observable<MouseEvent>`     | Emite al hacer click en el backdrop.                                                                |
| `keydownEvents$`    | `Observable<KeyboardEvent>`  | Emite eventos de teclado dentro del dialog.                                                         |

## Token — RETRO_DIALOG_DATA

Inyectar en el componente dialog para acceder a los datos pasados en `config.data`.

```typescript
private readonly _data = inject(RETRO_DIALOG_DATA);
```

Equivale a `MAT_DIALOG_DATA` de Angular Material.

## Directivas de template

| Directiva                     | Selector               | Descripción                                                                            |
| ----------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| `RetroDialogTitleDirective`   | `[retroDialogTitle]`   | Aplica `role="heading"` + `aria-level="2"` para semántica accesible.                   |
| `RetroDialogContentDirective` | `[retroDialogContent]` | Aplica clase CSS `retro-dialog__content` (scroll y padding).                           |
| `RetroDialogActionsDirective` | `[retroDialogActions]` | Flex-row de acciones. Input `align`: `'start' \| 'center' \| 'end'` (default `'end'`). |
| `RetroDialogCloseDirective`   | `[retroDialogClose]`   | Cierra el dialog al hacer click, pasando el valor del binding como resultado.          |

## Ejemplo mínimo

```html
<!-- template del componente dialog -->
<h2 retroDialogTitle>Título del dialog</h2>

<div retroDialogContent>Contenido del dialog.</div>

<div retroDialogActions>
  <retro-button label="CANCELAR" [retroDialogClose]="undefined" />
  <retro-button label="CONFIRMAR" variant="primary" [retroDialogClose]="true" />
</div>
```

```typescript
// abrir el dialog
const ref = this._dialog.open(MiDialogComponent, { data: { id: 42 } });
ref.afterClosed().subscribe((result: boolean | undefined) => {
  if (result) {
    /* confirmado */
  }
});
```

## Gotchas

- `afterClosed()` devuelve `Observable<R | undefined>`, no `Observable<R>`. Cuando el dialog se cierra sin pasar resultado (Escape, backdrop, `close()` sin argumento), emite `undefined`.
- `disableClose: true` desactiva **a la vez** el cierre por Escape, click en backdrop **y** la directiva `[retroDialogClose]`. Si se necesita un botón de cancelar que sí funcione con `disableClose` activo, llamar a `dialogRef.close()` directamente desde el componente.
- `autoFocus` se fuerza a `false` internamente cuando `disableClose` es `true`; no es necesario especificarlo en la config.
- `RETRO_DIALOG_DATA` es un re-export de `RETRO_OVERLAY_DATA`. Importar siempre desde `retro-dialog.service.ts`, no desde `retro-overlay`.
