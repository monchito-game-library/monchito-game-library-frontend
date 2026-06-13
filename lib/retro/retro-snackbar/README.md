# retro-snackbar

Terminal Collector temporary notification system: singleton queue service + visual host component.

**Type:** Service + Host Component · **Provided in:** `'root'`

## When to use / When NOT to use

- Use when: you need to notify the user of an action result (success, error, warning) in a non-intrusive, auto-dismissible way.
- Do NOT use when: the notification requires an explicit response from the user — use `retro-dialog` instead.

## API — RetroSnackbarService

### Method `open`

```typescript
open(msg: {
  text: string;
  action?: { label: string; handler: () => void };
  variant?: LibSnackbarVariant;  // default 'info'
  duration?: number;             // default 4000ms; 0 = never auto-dismissed
}): number  // message id for programmatic dismissal
```

| Field      | Type                 | Default  | Description                                                                    |
| ---------- | -------------------- | -------- | ------------------------------------------------------------------------------ |
| `text`     | `string`             | —        | Visible text of the snackbar.                                                  |
| `action`   | `{ label, handler }` | —        | Optional action button; executes `handler` and dismisses the message on press. |
| `variant`  | `LibSnackbarVariant` | `'info'` | Visual variant: `'info'`, `'success'`, `'warning'`, `'error'`.                 |
| `duration` | `number`             | `4000`   | Duration in ms before auto-dismiss. `0` disables auto-dismiss.                 |

### Method `dismiss`

```typescript
dismiss(id: number): void
```

Programmatically closes the message with the `id` returned by `open`.

### Method `dismissAll`

```typescript
dismissAll(): void
```

Dismisses all active messages in the queue.

### Signal `messages`

```typescript
readonly messages: Signal<readonly RetroSnackbarMessage[]>
```

Reactive list of active messages. Consumed internally by `retro-snackbar-host`; no need to access it from the app.

## Component — RetroSnackbarHostComponent

**Selector:** `retro-snackbar-host` · **Standalone:** yes · **CVA:** no

Mounted **once** in `app.component.html`. Automatically renders the service queue.

A11y: container with `role="region"`. Each message uses `role="alert"` + `aria-live="assertive"` for the `error` variant; the rest use `role="status"` + `aria-live="polite"`.

## Exported Types

- `LibSnackbarVariant` — `'info' \| 'success' \| 'warning' \| 'error'`
- `RetroSnackbarMessage` — `{ id: number; text: string; action?: { label: string; handler: () => void }; variant: LibSnackbarVariant; duration: number }`

## Minimal example

```typescript
// Success notification with auto-dismiss
this._snackbar.open({ text: 'Saved successfully', variant: 'success' });

// Persistent error with action
this._snackbar.open({
  text: 'Failed to load',
  variant: 'error',
  duration: 0,
  action: { label: 'RETRY', handler: () => this.retry() }
});
```

```html
<!-- app.component.html — once only across the entire app -->
<retro-snackbar-host />
```

## Gotchas

- `duration: 0` disables auto-dismiss; the message persists until the user closes it or `dismiss(id)` / `dismissAll()` is called.
- Messages are queued; multiple consecutive `open()` calls stack notifications. Use `dismissAll()` first if you want to clear the queue beforehand.
- The host must be mounted only once. Multiple instances of `<retro-snackbar-host>` would duplicate visible messages.
- The `'info'` variant applies no CSS modifier class — it is the base visual state.
