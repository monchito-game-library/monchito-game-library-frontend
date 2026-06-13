# retro-overlay

Reusable overlay infrastructure service. Wraps the CDK Overlay and centralises focus trap, scroll lock and focus restoration logic. Serves as the foundation for `retro-menu`, `retro-bottom-sheet` and `retro-dialog`.

**Service:** injectable in `root`

## When to use / When NOT to use

- Use when: you need to open a generic floating panel (component or TemplateRef) with full control over position, backdrop, focus trap and scroll strategy.
- Do NOT use when: the use case is a modal dialog — use `RetroDialogService`; if it is a confirmation or bottom menu — use `RetroBottomSheetService`; if it is a contextual anchored menu — use `RetroMenuService`. `RetroOverlayService` is the shared infrastructure layer used by all of them.

## API — RetroOverlayService

### `open<T, R>(content, config?): RetroOverlayRef<T, R>`

Opens a component or TemplateRef inside a CDK overlay.

| Parameter | Type                                       | Description                                        |
| --------- | ------------------------------------------ | -------------------------------------------------- |
| `content` | `ComponentType<T> \| TemplateRef<unknown>` | Component or template to project into the overlay. |
| `config`  | `RetroOverlayConfig` (optional)            | Overlay configuration. See next section.           |

Returns `RetroOverlayRef<T, R>`.

## RetroOverlayConfig

All fields are optional.

| Field                 | Type                                           | Default               | Description                                                                                        |
| --------------------- | ---------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| `origin`              | `ElementRef \| HTMLElement`                    | —                     | Origin element for anchored overlays (menu, select). If omitted, the overlay is centred on screen. |
| `positions`           | `ConnectedPosition[]`                          | CDK default positions | CDK positions for anchored overlays when `origin` is provided.                                     |
| `hasBackdrop`         | `boolean`                                      | `false`               | Whether a backdrop that blocks interaction with the rest of the UI is shown.                       |
| `backdropClass`       | `string`                                       | —                     | CSS class for the backdrop.                                                                        |
| `panelClass`          | `string \| string[]`                           | —                     | CSS class(es) for the overlay panel.                                                               |
| `disposeOnNavigation` | `boolean`                                      | `true`                | Whether the overlay closes automatically when navigating with the Router.                          |
| `scrollStrategy`      | `'reposition' \| 'block' \| 'close'`           | `'reposition'`        | Scroll strategy while the overlay is open.                                                         |
| `focusTrap`           | `boolean`                                      | —                     | Whether to activate the focus trap inside the panel.                                               |
| `autoFocus`           | `'first-tabbable' \| 'first-heading' \| false` | —                     | Element to move focus to when the overlay opens. Only takes effect if `focusTrap: true`.           |
| `restoreFocus`        | `boolean`                                      | —                     | Whether to restore focus to the trigger element when the overlay closes.                           |
| `width`               | `string`                                       | —                     | Panel width (e.g. `'400px'`, `'80vw'`).                                                            |
| `height`              | `string`                                       | —                     | Panel height.                                                                                      |
| `data`                | `unknown`                                      | —                     | Arbitrary data injectable into the opened component via the `RETRO_OVERLAY_DATA` token.            |
| `disableClose`        | `boolean`                                      | —                     | If `true`, Escape and backdrop click do NOT close the overlay.                                     |
| `viewContainerRef`    | `ViewContainerRef`                             | —                     | Required when opening a `TemplateRef`. Ignored for `ComponentType`.                                |
| `extraProviders`      | `LibOverlayExtraProvidersFactory`              | —                     | Factory of extra providers injected into the opened component (e.g. `RetroDialogRef`).             |

## RetroOverlayRef

Reference to the opened overlay. Returned by `open()`.

| Member              | Type                         | Description                                                                    |
| ------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `close(result?)`    | `(result?: R) => void`       | Closes the overlay and emits `result` on `afterClosed$`.                       |
| `afterClosed$`      | `Observable<R \| undefined>` | Emits once when the overlay closes, with the optional result.                  |
| `backdropClick$`    | `Observable<MouseEvent>`     | Emits when the backdrop is clicked.                                            |
| `keydownEvents$`    | `Observable<KeyboardEvent>`  | Emits keyboard events inside the overlay.                                      |
| `data`              | `unknown`                    | Data passed in `RetroOverlayConfig.data`. Returns `null` if none was provided. |
| `disableClose`      | `boolean`                    | Indicates whether closing via Escape or backdrop is disabled.                  |
| `componentInstance` | `T \| null`                  | Instance of the opened component. `null` if opened with a `TemplateRef`.       |

## Injection Tokens

| Token                | Type              | Description                                                |
| -------------------- | ----------------- | ---------------------------------------------------------- |
| `RETRO_OVERLAY_REF`  | `RetroOverlayRef` | Injects the overlay reference inside the opened component. |
| `RETRO_OVERLAY_DATA` | `unknown`         | Injects the data passed in `RetroOverlayConfig.data`.      |

## Exported Presets

Predefined configs ready to pass directly to `open()`:

| Constant                            | Use                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `RETRO_OVERLAY_DIALOG_CONFIG`       | Modal dialogs: backdrop, focus trap, blocked scroll.                      |
| `RETRO_OVERLAY_MENU_CONFIG`         | Contextual menus: transparent backdrop, scroll reposition, no focus trap. |
| `RETRO_OVERLAY_BOTTOM_SHEET_CONFIG` | Bottom sheets: backdrop, focus trap, panel pinned to the bottom.          |

## Minimal example

Open a custom component with data:

```typescript
import { RetroOverlayService, RETRO_OVERLAY_DATA, RETRO_OVERLAY_DIALOG_CONFIG } from '@retro/retro-overlay';

@Component({ ... })
export class MyCallerComponent {
  private readonly _overlay = inject(RetroOverlayService);

  openPanel(): void {
    const ref = this._overlay.open(MyPanelComponent, {
      ...RETRO_OVERLAY_DIALOG_CONFIG,
      data: { title: 'Hello' }
    });

    ref.afterClosed$.subscribe((result) => {
      console.log('Result:', result);
    });
  }
}

// In MyPanelComponent, inject data and reference:
@Component({ ... })
export class MyPanelComponent {
  readonly data = inject(RETRO_OVERLAY_DATA);
  private readonly _ref = inject(RETRO_OVERLAY_REF);

  confirm(): void {
    this._ref.close('confirmed');
  }
}
```

Open a `TemplateRef` (requires `viewContainerRef`):

```typescript
@Component({ ... })
export class MyCallerComponent {
  private readonly _overlay = inject(RetroOverlayService);
  private readonly _vcr = inject(ViewContainerRef);

  @ViewChild('myTpl') myTpl!: TemplateRef<unknown>;

  openTemplate(): void {
    this._overlay.open(this.myTpl, {
      hasBackdrop: true,
      viewContainerRef: this._vcr
    });
  }
}
```

## Gotchas

- `TemplateRef` requires passing `viewContainerRef` in the config; if omitted, the service throws a runtime error.
- The order of `afterClosed$` is always before `dispose()`: subscribers receive the result before the DOM is removed.
- `disposeOnNavigation` is `true` by default: if you open an overlay on a route and navigate away, it closes automatically. Set it to `false` only if you need it to survive navigation.
- When `disposeOnNavigation` closes the overlay without calling `close()`, the focus trap and focus restoration are still cleaned up via the CDK `detachments()` event.
- Focus is not restored to `document.body` even if `restoreFocus` is `true` (avoids unintentional scroll-to-top).
- For overlays anchored to an element with `display: contents` (such as `retro-icon-button`), pass the inner `HTMLElement` with `querySelector('button')` instead of the root `ElementRef`, since `display: contents` produces a bounding rect of 0x0.
