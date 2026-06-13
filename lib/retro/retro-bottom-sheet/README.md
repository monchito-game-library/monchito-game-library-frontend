# retro-bottom-sheet

Service for opening components as Terminal Collector bottom-sheet panels. It has no component of its own — the consumer passes the component rendered inside the panel.

**Type:** Service · **Provided in:** `'root'`

## When to use / When NOT to use

- Use when: a contextual panel that slides up from the bottom edge is needed, especially on mobile or for non-critical secondary actions.
- Do NOT use when: the action requires explicit user confirmation (destructive action, data loss) — use `retro-dialog` instead.

## API — RetroBottomSheetService

### Method `open`

```typescript
open<T, R = unknown>(component: ComponentType<T>, data?: unknown): RetroBottomSheetRef<T, R>
```

| Parameter   | Type                 | Description                                                               |
| ----------- | -------------------- | ------------------------------------------------------------------------- |
| `component` | `ComponentType<T>`   | Angular component to project inside the bottom-sheet panel.               |
| `data`      | `unknown` (optional) | Data that the component can inject via `inject(RETRO_BOTTOM_SHEET_DATA)`. |

Automatically includes: backdrop, focus trap, scroll block, and slide-up animation from the bottom edge.

## RetroBottomSheetRef

Typed alias of `RetroOverlayRef`. Exposes:

| Member              | Type                         | Description                                            |
| ------------------- | ---------------------------- | ------------------------------------------------------ |
| `close(result?)`    | `(result?: R) => void`       | Closes the panel, optionally emitting a result.        |
| `afterClosed$`      | `Observable<R \| undefined>` | Emits once when the panel closes, with the result.     |
| `backdropClick$`    | `Observable<MouseEvent>`     | Emits when the backdrop is clicked.                    |
| `keydownEvents$`    | `Observable<KeyboardEvent>`  | Emits keyboard events inside the overlay.              |
| `componentInstance` | `T \| null`                  | Instance of the projected component.                   |
| `data`              | `unknown`                    | Data passed when opening. `null` if none was provided. |

## Token — RETRO_BOTTOM_SHEET_DATA

Token to inject the data passed to the opened component. It is a semantic alias of `RETRO_OVERLAY_DATA`.

```typescript
// Inside the component opened in the bottom-sheet:
private readonly _data = inject(RETRO_BOTTOM_SHEET_DATA);
```

## Minimal example

```typescript
// Open the bottom-sheet
const ref = this._bottomSheet.open(FiltersSheetComponent, { selected: this.filters() });
ref.afterClosed$.subscribe((result) => {
  if (result) this.applyFilters(result);
});

// Inside FiltersSheetComponent
private readonly _data = inject(RETRO_BOTTOM_SHEET_DATA);
private readonly _ref = inject(RETRO_BOTTOM_SHEET_REF); // if closing from within is needed
```

## Gotchas

- The panel uses `scrollStrategy: 'block'` — page scroll is blocked while the bottom-sheet is open.
- Pressing `Escape` or clicking the backdrop closes the panel automatically (preset behaviour). To disable this, use `RetroOverlayService` directly with `disableClose: true`.
- `RETRO_BOTTOM_SHEET_DATA` is an alias of `RETRO_OVERLAY_DATA`; both tokens are interchangeable, but the semantic alias is recommended in bottom-sheet consumers.
- Focus is automatically restored to the element that held it before the panel was opened, once it closes.
