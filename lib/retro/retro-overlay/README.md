# retro-overlay

Servicio base de overlay reutilizable. Infraestructura para `retro-menu`, `retro-bottom-sheet` y `retro-dialog`.

## Servicio — RetroOverlayService

```typescript
open<T, R = unknown>(content: ComponentType<T> | TemplateRef<unknown>, config?: RetroOverlayConfig): RetroOverlayRef<T, R>
```

## RetroOverlayRef

`close(result?)`, `afterClosed$`, `backdropClick$`, `keydownEvents$`, `componentInstance`.

## Tokens: `RETRO_OVERLAY_REF`, `RETRO_OVERLAY_DATA`.

## Presets: `RETRO_OVERLAY_DIALOG_CONFIG`, `RETRO_OVERLAY_MENU_CONFIG`, `RETRO_OVERLAY_BOTTOM_SHEET_CONFIG`.

> Normalmente no se usa directamente — se prefiere `RetroDialogService` o `RetroBottomSheetService`.
