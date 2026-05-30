# retro-snackbar

Sistema de notificaciones temporales Terminal Collector: servicio singleton de cola + componente host visual.

**Tipo:** Servicio + Componente host · **Provided in:** `'root'`

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita notificar al usuario de un resultado de acción (éxito, error, aviso) de forma no intrusiva y auto-descartable.
- NO usar cuando: la notificación requiere una respuesta explícita del usuario — usar `retro-dialog` en su lugar.

## API — RetroSnackbarService

### Método `open`

```typescript
open(msg: {
  text: string;
  action?: { label: string; handler: () => void };
  variant?: LibSnackbarVariant;  // default 'info'
  duration?: number;             // default 4000ms; 0 = nunca se auto-descarta
}): number  // id del mensaje para cierre programático
```

| Campo      | Tipo                 | Default  | Descripción                                                                  |
| ---------- | -------------------- | -------- | ---------------------------------------------------------------------------- |
| `text`     | `string`             | —        | Texto visible del snackbar.                                                  |
| `action`   | `{ label, handler }` | —        | Botón de acción opcional; ejecuta `handler` y descarta el mensaje al pulsar. |
| `variant`  | `LibSnackbarVariant` | `'info'` | Variante visual: `'info'`, `'success'`, `'warning'`, `'error'`.              |
| `duration` | `number`             | `4000`   | Duración en ms antes del auto-dismiss. `0` desactiva el auto-dismiss.        |

### Método `dismiss`

```typescript
dismiss(id: number): void
```

Cierra programáticamente el mensaje con el `id` devuelto por `open`.

### Método `dismissAll`

```typescript
dismissAll(): void
```

Descarta todos los mensajes activos de la cola.

### Signal `messages`

```typescript
readonly messages: Signal<readonly RetroSnackbarMessage[]>
```

Lista reactiva de mensajes activos. Consumida internamente por `retro-snackbar-host`; no es necesario acceder a ella desde la app.

## Componente — RetroSnackbarHostComponent

**Selector:** `retro-snackbar-host` · **Standalone:** sí · **CVA:** no

Se monta **una sola vez** en `app.component.html`. Renderiza la cola del servicio automáticamente.

A11y: contenedor con `role="region"`. Cada mensaje usa `role="alert"` + `aria-live="assertive"` para variante `error`; el resto usa `role="status"` + `aria-live="polite"`.

## Tipos exportados

- `LibSnackbarVariant` — `'info' \| 'success' \| 'warning' \| 'error'`
- `RetroSnackbarMessage` — `{ id: number; text: string; action?: { label: string; handler: () => void }; variant: LibSnackbarVariant; duration: number }`

## Ejemplo mínimo

```typescript
// Notificación de éxito con auto-dismiss
this._snackbar.open({ text: 'Guardado correctamente', variant: 'success' });

// Error persistente con acción
this._snackbar.open({
  text: 'No se pudo cargar',
  variant: 'error',
  duration: 0,
  action: { label: 'REINTENTAR', handler: () => this.retry() }
});
```

```html
<!-- app.component.html — una sola vez en toda la app -->
<retro-snackbar-host />
```

## Gotchas

- `duration: 0` desactiva el auto-dismiss; el mensaje permanece hasta que el usuario lo cierre o se llame a `dismiss(id)` / `dismissAll()`.
- Los mensajes se encolan; varios `open()` seguidos apilan notificaciones. Usar `dismissAll()` antes si se quiere limpiar la cola primero.
- El host debe montarse una sola vez. Múltiples instancias de `<retro-snackbar-host>` duplicarían los mensajes visibles.
- La variante `'info'` no aplica clase CSS modificadora — es el estado base visual.
