# retro-dialog

Servicio + directivas para dialogs modales Terminal Collector. Reemplaza `MatDialog`.

## Servicio — RetroDialogService

- **Provided in:** `'root'`

### API

```typescript
open<T, D = unknown, R = any>(component: ComponentType<T>, config?: RetroDialogConfig<D>): RetroDialogRef<T, R>
```

### RetroDialogConfig (interfaces/)

| Propiedad | Descripción |
|---|---|
| `data` | Datos inyectables via `RETRO_DIALOG_DATA`. |
| `width`, `maxWidth` | Dimensiones del panel. |
| `disableClose` | Deshabilita cierre por Escape/backdrop. |
| `ariaLabel`, `ariaLabelledBy` | Accesibilidad. |
| `autoFocus` | `'first-tabbable' \| 'first-heading' \| false`. |

### RetroDialogRef

`close(result?)`, `afterClosed(): Observable<R>`, `backdropClick$`, `keydownEvents$`, `componentInstance`.

### Token — RETRO_DIALOG_DATA

```typescript
private readonly _data = inject(RETRO_DIALOG_DATA);
```

## Directivas de template

| Directiva | Selector | Hace |
|---|---|---|
| `RetroDialogTitleDirective` | `[retroDialogTitle]` | `role="heading"` + `aria-level="2"`. |
| `RetroDialogContentDirective` | `[retroDialogContent]` | Scroll + padding. |
| `RetroDialogActionsDirective` | `[retroDialogActions]` | Flex-row, `align` `start\|center\|end`. |
| `RetroDialogCloseDirective` | `[retroDialogClose]` | Cierra pasando el valor como resultado. |

## Ejemplo

```html
<h2 retroDialogTitle>Título</h2>
<div retroDialogContent>Contenido</div>
<div retroDialogActions>
  <retro-button label="CANCELAR" [retroDialogClose]="false" />
  <retro-button label="OK" variant="primary" [retroDialogClose]="true" />
</div>
```
