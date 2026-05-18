# retro-bottom-sheet

Servicio de panel bottom-sheet Terminal Collector. No tiene componente propio — el consumer pasa el componente que se renderiza en el panel.

## Servicio — RetroBottomSheetService

- **Provided in:** `'root'`
- **Hace:** delega en `RetroOverlayService` con preset `RETRO_OVERLAY_BOTTOM_SHEET_CONFIG`.

### API

```typescript
open<T, R = unknown>(component: ComponentType<T>, data?: unknown): RetroBottomSheetRef<T, R>
```

`RetroBottomSheetRef` expone: `close(result?)`, `afterClosed$`, `backdropClick$`, `keydownEvents$`, `componentInstance`.

### Token — RETRO_BOTTOM_SHEET_DATA

El componente abierto inyecta los datos así:
```typescript
private readonly _data = inject(RETRO_BOTTOM_SHEET_DATA);
```

## Dependencias

- `RetroOverlayService`.

## Ejemplo

```typescript
const ref = this._bottomSheet.open(FiltersSheetComponent, { selected: this.filters() });
ref.afterClosed$.subscribe((result) => { ... });
```
