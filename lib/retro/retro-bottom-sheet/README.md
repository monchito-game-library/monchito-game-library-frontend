# retro-bottom-sheet

Servicio para abrir componentes como paneles bottom-sheet Terminal Collector. No tiene componente propio — el consumer pasa el componente que se renderiza en el panel.

**Tipo:** Servicio · **Provided in:** `'root'`

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita un panel contextual que emerge desde el borde inferior, especialmente en mobile o para acciones secundarias no críticas.
- NO usar cuando: la acción requiere confirmación explícita del usuario (destrucción, pérdida de datos) — usar `retro-dialog` en su lugar.

## API — RetroBottomSheetService

### Método `open`

```typescript
open<T, R = unknown>(component: ComponentType<T>, data?: unknown): RetroBottomSheetRef<T, R>
```

| Parámetro   | Tipo                 | Descripción                                                                   |
| ----------- | -------------------- | ----------------------------------------------------------------------------- |
| `component` | `ComponentType<T>`   | Componente Angular a proyectar dentro del panel bottom-sheet.                 |
| `data`      | `unknown` (opcional) | Datos que el componente puede inyectar via `inject(RETRO_BOTTOM_SHEET_DATA)`. |

Incluye automáticamente: backdrop, focus trap, scroll block y animación desde el borde inferior.

## RetroBottomSheetRef

Alias tipado de `RetroOverlayRef`. Expone:

| Miembro             | Tipo                         | Descripción                                                |
| ------------------- | ---------------------------- | ---------------------------------------------------------- |
| `close(result?)`    | `(result?: R) => void`       | Cierra el panel, emitiendo opcionalmente un resultado.     |
| `afterClosed$`      | `Observable<R \| undefined>` | Emite una vez cuando el panel se cierra, con el resultado. |
| `backdropClick$`    | `Observable<MouseEvent>`     | Emite al hacer click en el backdrop.                       |
| `keydownEvents$`    | `Observable<KeyboardEvent>`  | Emite eventos de teclado dentro del overlay.               |
| `componentInstance` | `T \| null`                  | Instancia del componente proyectado.                       |
| `data`              | `unknown`                    | Datos pasados al abrir. `null` si no se proporcionaron.    |

## Token — RETRO_BOTTOM_SHEET_DATA

Token para inyectar los datos pasados al componente abierto. Es un alias semántico de `RETRO_OVERLAY_DATA`.

```typescript
// En el componente abierto dentro del bottom-sheet:
private readonly _data = inject(RETRO_BOTTOM_SHEET_DATA);
```

## Ejemplo mínimo

```typescript
// Abrir el bottom-sheet
const ref = this._bottomSheet.open(FiltersSheetComponent, { selected: this.filters() });
ref.afterClosed$.subscribe((result) => {
  if (result) this.applyFilters(result);
});

// Dentro de FiltersSheetComponent
private readonly _data = inject(RETRO_BOTTOM_SHEET_DATA);
private readonly _ref = inject(RETRO_BOTTOM_SHEET_REF); // si se necesita cerrar desde dentro
```

## Gotchas

- El panel usa `scrollStrategy: 'block'` — el scroll de la página queda bloqueado mientras el bottom-sheet está abierto.
- Pulsar `Escape` o hacer click en el backdrop cierra el panel automáticamente (comportamiento del preset). Para deshabilitarlo, se necesita usar `RetroOverlayService` directamente con `disableClose: true`.
- `RETRO_BOTTOM_SHEET_DATA` es un alias de `RETRO_OVERLAY_DATA`; ambos tokens son intercambiables, pero se recomienda usar el alias semántico en consumers de bottom-sheet.
- El foco se restaura automáticamente al elemento que lo tenía antes de abrir el panel al cerrarlo.
