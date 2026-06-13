# retro-dialog

Service + directives to open components as modal dialogs. Replaces Angular Material's `MatDialog`.

**Service:** `RetroDialogService` · injectable in `root`

## When to use / When NOT to use

- Use when: you need a blocking modal with a title, content, and actions (confirmations, forms, expanded details).
- Do NOT use when: the content is a non-modal panel or an overlay without dialog structure — use `RetroOverlayService` directly.

## API — RetroDialogService

```typescript
open<T, D = unknown, R = unknown>(
  component: ComponentType<T>,
  config?: RetroDialogConfig<D>
): RetroDialogRef<T, R>
```

Opens `component` as a modal dialog and returns a `RetroDialogRef` to control it.

## RetroDialogConfig\<D\>

| Property         | Type                                           | Default            | Description                                                                      |
| ---------------- | ---------------------------------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `data`           | `D`                                            | —                  | Data injectable into the component via `RETRO_DIALOG_DATA`.                      |
| `disableClose`   | `boolean`                                      | `false`            | If `true`, Escape, backdrop, and `[retroDialogClose]` will not close the dialog. |
| `width`          | `string`                                       | —                  | Panel width (e.g. `'400px'`).                                                    |
| `maxWidth`       | `string`                                       | —                  | Maximum panel width.                                                             |
| `panelClass`     | `string \| string[]`                           | —                  | Additional CSS class(es) for the panel.                                          |
| `ariaLabel`      | `string`                                       | —                  | ARIA label for the dialog (alternative to `ariaLabelledBy`).                     |
| `ariaLabelledBy` | `string`                                       | —                  | ID of the element acting as the title (`aria-labelledby`).                       |
| `autoFocus`      | `'first-tabbable' \| 'first-heading' \| false` | `'first-tabbable'` | Initial focus strategy. Ignored when `disableClose` is `true`.                   |
| `restoreFocus`   | `boolean`                                      | `true`             | If `true`, restores focus to the previously focused element on close.            |

## RetroDialogRef\<T, R\>

| Member              | Type                         | Description                                                                                   |
| ------------------- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| `close(result?)`    | `(result?: R) => void`       | Closes the dialog. The optional value is emitted in `afterClosed()`.                          |
| `afterClosed()`     | `Observable<R \| undefined>` | Emits once on close, with the result passed to `close()` or `undefined` if none was provided. |
| `componentInstance` | `T \| null`                  | Instance of the component projected into the dialog.                                          |
| `disableClose`      | `boolean`                    | Reflects whether closing is disabled.                                                         |
| `backdropClick$`    | `Observable<MouseEvent>`     | Emits when the backdrop is clicked.                                                           |
| `keydownEvents$`    | `Observable<KeyboardEvent>`  | Emits keyboard events inside the dialog.                                                      |

## Token — RETRO_DIALOG_DATA

Inject into the dialog component to access the data passed in `config.data`.

```typescript
private readonly _data = inject(RETRO_DIALOG_DATA);
```

Equivalent to Angular Material's `MAT_DIALOG_DATA`.

## Template directives

| Directive                     | Selector               | Description                                                                           |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| `RetroDialogTitleDirective`   | `[retroDialogTitle]`   | Applies `role="heading"` + `aria-level="2"` for accessible semantics.                 |
| `RetroDialogContentDirective` | `[retroDialogContent]` | Applies the CSS class `retro-dialog__content` (scroll and padding).                   |
| `RetroDialogActionsDirective` | `[retroDialogActions]` | Flex-row of actions. Input `align`: `'start' \| 'center' \| 'end'` (default `'end'`). |
| `RetroDialogCloseDirective`   | `[retroDialogClose]`   | Closes the dialog on click, passing the binding value as the result.                  |

## Minimal example

```html
<!-- dialog component template -->
<h2 retroDialogTitle>Dialog title</h2>

<div retroDialogContent>Dialog content.</div>

<div retroDialogActions>
  <retro-button label="CANCEL" [retroDialogClose]="undefined" />
  <retro-button label="CONFIRM" variant="primary" [retroDialogClose]="true" />
</div>
```

```typescript
// open the dialog
const ref = this._dialog.open(MyDialogComponent, { data: { id: 42 } });
ref.afterClosed().subscribe((result: boolean | undefined) => {
  if (result) {
    /* confirmed */
  }
});
```

## Gotchas

- `afterClosed()` returns `Observable<R | undefined>`, not `Observable<R>`. When the dialog is closed without passing a result (Escape, backdrop, `close()` with no argument), it emits `undefined`.
- `disableClose: true` simultaneously disables closing via Escape, backdrop click, **and** the `[retroDialogClose]` directive. If you need a cancel button that still works while `disableClose` is active, call `dialogRef.close()` directly from the component.
- `autoFocus` is internally forced to `false` when `disableClose` is `true`; there is no need to specify it in the config.
- `RETRO_DIALOG_DATA` is a re-export of `RETRO_OVERLAY_DATA`. Always import it from `retro-dialog.service.ts`, not from `retro-overlay`.
