# retro-snackbar

Sistema de snackbars Terminal Collector: servicio singleton + host visual.

## Servicio — RetroSnackbarService

- **Provided in:** `'root'`

### API

```typescript
open(msg: {
  text: string;
  action?: { label: string; handler: () => void };
  variant?: 'info' | 'success' | 'warning' | 'error';  // default 'info'
  duration?: number;                                     // default 4000ms
}): number;  // id del snackbar

dismiss(id: number): void;
dismissAll(): void;

readonly messages: Signal<readonly RetroSnackbarMessage[]>;
```

## Componente — RetroSnackbarHostComponent

- **Selector:** `retro-snackbar-host`
- **Hace:** renderiza la cola del servicio. Se monta **una sola vez** en `app.component.html`.
- **A11y:** `role="region"`, `aria-live="polite"`. Variants `error`/`warning` usan `role="alert"`.

## Interfaces (`interfaces/`)

- `RetroSnackbarMessage` — `{ id, text, action?, variant, duration }`.
- `LibSnackbarVariant` — `'info' | 'success' | 'warning' | 'error'`.

## Ejemplo

```typescript
this._snackbar.open({ text: 'Guardado', variant: 'success' });
this._snackbar.open({ text: 'Error', variant: 'error', duration: 0, action: { label: 'RETRY', handler: () => this.retry() } });
```

```html
<!-- app.component.html — una sola vez -->
<retro-snackbar-host />
```
