# retro-overlay

Servicio de infraestructura de overlay reutilizable. Envuelve el CDK Overlay y centraliza la lógica de focus trap, scroll lock y restauración de foco. Sirve de base para `retro-menu`, `retro-bottom-sheet` y `retro-dialog`.

**Servicio:** inyectable en `root`

## Cuándo usar / Cuándo NO usar

- Usar cuando: necesitas abrir un panel flotante genérico (componente o TemplateRef) con control total sobre posición, backdrop, focus trap y estrategia de scroll.
- NO usar cuando: el caso de uso es un diálogo modal → usa `RetroDialogService`; si es una confirmación o menú inferior → usa `RetroBottomSheetService`; si es un menú contextual anclado → usa `RetroMenuService`. `RetroOverlayService` es la capa de infraestructura compartida por todos ellos.

## API — RetroOverlayService

### `open<T, R>(content, config?): RetroOverlayRef<T, R>`

Abre un componente o TemplateRef dentro de un overlay CDK.

| Parámetro | Tipo                                       | Descripción                                       |
| --------- | ------------------------------------------ | ------------------------------------------------- |
| `content` | `ComponentType<T> \| TemplateRef<unknown>` | Componente o template a proyectar en el overlay.  |
| `config`  | `RetroOverlayConfig` (opcional)            | Configuración del overlay. Ver sección siguiente. |

Devuelve `RetroOverlayRef<T, R>`.

## RetroOverlayConfig

Todos los campos son opcionales.

| Campo                 | Tipo                                           | Default                    | Descripción                                                                                                 |
| --------------------- | ---------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `origin`              | `ElementRef \| HTMLElement`                    | —                          | Elemento de origen para overlays anclados (menú, select). Si se omite, el overlay se centra en la pantalla. |
| `positions`           | `ConnectedPosition[]`                          | posiciones CDK por defecto | Posiciones CDK para overlays anclados cuando se pasa `origin`.                                              |
| `hasBackdrop`         | `boolean`                                      | `false`                    | Si se muestra un backdrop que bloquea la interacción con el resto de la UI.                                 |
| `backdropClass`       | `string`                                       | —                          | Clase CSS del backdrop.                                                                                     |
| `panelClass`          | `string \| string[]`                           | —                          | Clase(s) CSS del panel del overlay.                                                                         |
| `disposeOnNavigation` | `boolean`                                      | `true`                     | Si el overlay se cierra automáticamente al navegar con el Router.                                           |
| `scrollStrategy`      | `'reposition' \| 'block' \| 'close'`           | `'reposition'`             | Estrategia de scroll cuando el overlay está abierto.                                                        |
| `focusTrap`           | `boolean`                                      | —                          | Si se activa el focus trap dentro del panel.                                                                |
| `autoFocus`           | `'first-tabbable' \| 'first-heading' \| false` | —                          | Elemento al que mover el foco al abrir el overlay. Solo tiene efecto si `focusTrap: true`.                  |
| `restoreFocus`        | `boolean`                                      | —                          | Si se restaura el foco al elemento disparador al cerrar el overlay.                                         |
| `width`               | `string`                                       | —                          | Ancho del panel (ej. `'400px'`, `'80vw'`).                                                                  |
| `height`              | `string`                                       | —                          | Alto del panel.                                                                                             |
| `data`                | `unknown`                                      | —                          | Datos arbitrarios inyectables en el componente abierto vía token `RETRO_OVERLAY_DATA`.                      |
| `disableClose`        | `boolean`                                      | —                          | Si `true`, Escape y backdrop click NO cierran el overlay.                                                   |
| `viewContainerRef`    | `ViewContainerRef`                             | —                          | Obligatorio cuando se abre un `TemplateRef`. Ignorado para `ComponentType`.                                 |
| `extraProviders`      | `LibOverlayExtraProvidersFactory`              | —                          | Factory de providers extra inyectados en el componente abierto (ej. `RetroDialogRef`).                      |

## RetroOverlayRef

Referencia al overlay abierto. Devuelta por `open()`.

| Miembro             | Tipo                         | Descripción                                                                          |
| ------------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| `close(result?)`    | `(result?: R) => void`       | Cierra el overlay y emite `result` en `afterClosed$`.                                |
| `afterClosed$`      | `Observable<R \| undefined>` | Emite una vez cuando el overlay se cierra, con el resultado opcional.                |
| `backdropClick$`    | `Observable<MouseEvent>`     | Emite al hacer click en el backdrop.                                                 |
| `keydownEvents$`    | `Observable<KeyboardEvent>`  | Emite eventos de teclado dentro del overlay.                                         |
| `data`              | `unknown`                    | Datos pasados en `RetroOverlayConfig.data`. Devuelve `null` si no se proporcionaron. |
| `disableClose`      | `boolean`                    | Indica si el cierre por Escape o backdrop está deshabilitado.                        |
| `componentInstance` | `T \| null`                  | Instancia del componente abierto. `null` si se abrió con `TemplateRef`.              |

## Tokens de inyección

| Token                | Tipo              | Descripción                                                      |
| -------------------- | ----------------- | ---------------------------------------------------------------- |
| `RETRO_OVERLAY_REF`  | `RetroOverlayRef` | Inyecta la referencia del overlay dentro del componente abierto. |
| `RETRO_OVERLAY_DATA` | `unknown`         | Inyecta los datos pasados en `RetroOverlayConfig.data`.          |

## Presets exportados

Configs predefinidas listas para pasar directamente a `open()`:

| Constante                           | Uso                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| `RETRO_OVERLAY_DIALOG_CONFIG`       | Dialogs modales: backdrop, focus trap, scroll bloqueado.                      |
| `RETRO_OVERLAY_MENU_CONFIG`         | Menús contextuales: backdrop transparente, scroll reposition, sin focus trap. |
| `RETRO_OVERLAY_BOTTOM_SHEET_CONFIG` | Bottom sheets: backdrop, focus trap, panel pegado al fondo.                   |

## Ejemplo mínimo

Abrir un componente propio con datos:

```typescript
import { RetroOverlayService, RETRO_OVERLAY_DATA, RETRO_OVERLAY_DIALOG_CONFIG } from '@retro/retro-overlay';

@Component({ ... })
export class MyCallerComponent {
  private readonly _overlay = inject(RetroOverlayService);

  openPanel(): void {
    const ref = this._overlay.open(MyPanelComponent, {
      ...RETRO_OVERLAY_DIALOG_CONFIG,
      data: { title: 'Hola' }
    });

    ref.afterClosed$.subscribe((result) => {
      console.log('Resultado:', result);
    });
  }
}

// En MyPanelComponent, inyectar datos y referencia:
@Component({ ... })
export class MyPanelComponent {
  readonly data = inject(RETRO_OVERLAY_DATA);
  private readonly _ref = inject(RETRO_OVERLAY_REF);

  confirm(): void {
    this._ref.close('confirmed');
  }
}
```

Abrir un `TemplateRef` (requiere `viewContainerRef`):

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

- `TemplateRef` requiere pasar `viewContainerRef` en la config obligatoriamente; si se omite, el servicio lanza un error en tiempo de ejecución.
- El orden de `afterClosed$` es siempre antes de `dispose()`: los suscriptores reciben el resultado antes de que el DOM sea eliminado.
- `disposeOnNavigation` es `true` por defecto: si abres un overlay en una ruta y navegas, se cierra automáticamente. Ponlo a `false` solo si necesitas que sobreviva a la navegación.
- Cuando `disposeOnNavigation` cierra el overlay sin llamar a `close()`, el focus trap y la restauración de foco igualmente se limpian via el evento `detachments()` del CDK.
- No restaura el foco a `document.body` aunque `restoreFocus` sea `true` (evita scroll-to-top involuntario).
- Para overlays anclados a un elemento con `display: contents` (como `retro-icon-button`), pasa el `HTMLElement` interno con `querySelector('button')` en vez del `ElementRef` raíz, ya que `display: contents` produce un bounding rect de 0×0.
