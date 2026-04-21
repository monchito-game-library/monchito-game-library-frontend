Genera un componente dialog Angular Material standalone con su spec y el código de apertura desde el componente padre.

Argumento: $ARGUMENTS — nombre en kebab-case y ubicación (ej: `game-review-dialog pages/games/components` o solo `game-review-dialog`). Si no se especifica ubicación, usa `presentation/components`.

## Artefactos a generar

Usa `src/app/presentation/pages/wishlist/components/wishlist-item-dialog/wishlist-item-dialog.component.ts` como referencia de patrón.

### 1. Componente dialog — `<ubicacion>/<name>/<name>.component.ts`

Estructura (respetar orden de miembros de CLAUDE.md):
1. `private readonly _dialogRef: MatDialogRef<XxxDialogComponent>` via `inject()`
2. `readonly data: XxxDialogData` via `inject(MAT_DIALOG_DATA)`
3. Variables privadas si las hay
4. Signals públicos con JSDoc
5. Form si el dialog lo necesita
6. `onConfirm()` — cierra con resultado
7. `onCancel()` — cierra sin resultado

### 2. Interface de datos del dialog — en el mismo fichero o en `@/interfaces/`
```typescript
export interface XxxDialogData {
  // campos que recibe el dialog al abrirse
}
export interface XxxDialogResult {
  // lo que devuelve al cerrarse (o void si no devuelve nada)
}
```

### 3. Template HTML — `<name>.component.html`
- `<h2 mat-dialog-title>`
- `<mat-dialog-content>`
- `<mat-dialog-actions align="end">` con botones Cancelar y Confirmar

### 4. SCSS — `<name>.component.scss`
- Espaciados en `rem`
- Clases completas con prefijo BEM del componente

### 5. Spec — `<name>.component.spec.ts`
- Mock de `MatDialogRef` (`mockDialog` de `src/testing/dialog.mock.ts`)
- Mock de `MAT_DIALOG_DATA` con datos de ejemplo
- Tests: creación, `onConfirm()` llama a `close()` con resultado, `onCancel()` llama a `close()` sin resultado

### 6. Snippet de apertura desde el padre
Muestra cómo abrir el dialog desde un componente padre:
```typescript
private readonly _dialog: MatDialog = inject(MatDialog);

onOpenXxxDialog(): void {
  this._dialog.open<XxxDialogComponent, XxxDialogData, XxxDialogResult>(
    XxxDialogComponent,
    { data: { ... }, width: '480px' }
  ).afterClosed().subscribe(result => {
    if (!result) return;
    // usar result
  });
}
```

## Reglas
- Todos los imports vía path aliases
- `standalone: true` en el componente
- Tipos explícitos, JSDoc en todos los métodos
