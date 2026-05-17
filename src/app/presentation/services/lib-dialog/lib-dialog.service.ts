import { Directive, Injectable, Input, inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import {
  LibOverlayRef,
  LibOverlayService,
  LIB_OVERLAY_DATA,
  LIB_OVERLAY_DIALOG_CONFIG
} from '@/services/lib-overlay/lib-overlay.service';
import { LibDialogConfig } from '@/interfaces/lib-dialog-config.interface';
import { Observable } from 'rxjs';

// ─── Token de datos ──────────────────────────────────────────────────────────

/**
 * Token para inyectar los datos pasados al componente dialog.
 * Reemplaza MAT_DIALOG_DATA de Angular Material.
 */
export const LIB_DIALOG_DATA: typeof LIB_OVERLAY_DATA = LIB_OVERLAY_DATA;

// Re-export LibDialogConfig for consumers of this service
export type { LibDialogConfig };

// ─── LibDialogRef ─────────────────────────────────────────────────────────────

/**
 * Referencia a un dialog abierto. Envuelve LibOverlayRef y expone la API
 * compatible con MatDialogRef para minimizar el diff en los call-sites.
 */
export class LibDialogRef<T, R = any> {
  private readonly _overlayRef: LibOverlayRef<T, R>;

  /** Instancia del componente proyectado en el dialog. */
  get componentInstance(): T | null {
    return this._overlayRef.componentInstance;
  }

  constructor(overlayRef: LibOverlayRef<T, R>) {
    this._overlayRef = overlayRef;
  }

  /**
   * Cierra el dialog, opcionalmente con un resultado que se emitirá en afterClosed().
   *
   * @param {R} result - Valor opcional de resultado del dialog.
   */
  close(result?: R): void {
    this._overlayRef.close(result);
  }

  /**
   * Observable que emite una vez cuando el dialog se cierra, con el resultado.
   * Compatible con MatDialogRef.afterClosed().
   */
  afterClosed(): Observable<R | undefined> {
    return this._overlayRef.afterClosed$;
  }

  /**
   * Observable que emite al hacer click en el backdrop.
   */
  get backdropClick$(): Observable<MouseEvent> {
    return this._overlayRef.backdropClick$;
  }

  /**
   * Observable que emite eventos de teclado dentro del dialog.
   */
  get keydownEvents$(): Observable<KeyboardEvent> {
    return this._overlayRef.keydownEvents$;
  }
}

// ─── LibDialogService ─────────────────────────────────────────────────────────

/**
 * Servicio para abrir componentes como dialogs modales.
 * Reemplaza MatDialog de Angular Material.
 * Construye sobre LibOverlayService del commit 25.
 */
@Injectable({ providedIn: 'root' })
export class LibDialogService {
  private readonly _overlay: LibOverlayService = inject(LibOverlayService);

  /**
   * Abre un componente como dialog modal.
   * Devuelve un LibDialogRef con .close(), .afterClosed() y .componentInstance.
   *
   * @param {ComponentType<T>} component - Componente a proyectar en el dialog.
   * @param {LibDialogConfig<D>} config - Configuración opcional del dialog.
   */
  open<T, D = unknown, R = any>(component: ComponentType<T>, config?: LibDialogConfig<D>): LibDialogRef<T, R> {
    const panelClasses = ['lib-overlay-panel--dialog'];
    if (config?.panelClass) {
      const extra = Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass];
      panelClasses.push(...extra);
    }

    let dialogRef!: LibDialogRef<T, R>;
    const overlayRef = this._overlay.open<T, R>(component, {
      ...LIB_OVERLAY_DIALOG_CONFIG,
      data: config?.data,
      panelClass: panelClasses,
      width: config?.width,
      autoFocus: config?.disableClose === true ? false : (config?.autoFocus ?? 'first-tabbable'),
      restoreFocus: config?.restoreFocus ?? true,
      disableClose: config?.disableClose === true,
      extraProviders: (overlay: unknown) => {
        dialogRef = new LibDialogRef<T, R>(overlay as LibOverlayRef<T, R>);
        return [{ provide: LibDialogRef, useValue: dialogRef }];
      }
    });

    // Si el componente no se montó (ej. content era TemplateRef), creamos el ref aquí.
    if (!dialogRef) {
      dialogRef = new LibDialogRef<T, R>(overlayRef);
    }

    return dialogRef;
  }
}

// ─── Directivas de template (paridad con MatDialogTitle/Content/Actions/Close) ─

/**
 * Directiva de título del dialog.
 * Aplica role="heading" y aria-level="2" para semántica accesible.
 * Selector: [libDialogTitle]
 */
@Directive({
  selector: '[libDialogTitle]',
  standalone: true,
  host: {
    class: 'lib-dialog__title',
    role: 'heading',
    'aria-level': '2'
  }
})
export class LibDialogTitleDirective {}

/**
 * Directiva de contenido del dialog.
 * Aplica la clase CSS lib-dialog__content para scroll y padding.
 * Selector: [libDialogContent]
 */
@Directive({
  selector: '[libDialogContent]',
  standalone: true,
  host: {
    class: 'lib-dialog__content'
  }
})
export class LibDialogContentDirective {}

/**
 * Directiva de acciones del dialog.
 * Aplica flex-row con justify-end por defecto.
 * Selector: [libDialogActions]
 */
@Directive({
  selector: '[libDialogActions]',
  standalone: true,
  host: {
    class: 'lib-dialog__actions',
    '[class.lib-dialog__actions--end]': 'align === "end" || !align',
    '[class.lib-dialog__actions--center]': 'align === "center"',
    '[class.lib-dialog__actions--start]': 'align === "start"'
  }
})
export class LibDialogActionsDirective {
  /** Alineación de las acciones: 'start' | 'center' | 'end'. Por defecto 'end'. */
  @Input() align: 'start' | 'center' | 'end' = 'end';
}

/**
 * Directiva para cerrar el dialog al hacer click.
 * Equivale a mat-dialog-close.
 * Selector: [libDialogClose]
 */
@Directive({
  selector: '[libDialogClose]',
  standalone: true,
  host: {
    '(click)': '_onClick()'
  }
})
export class LibDialogCloseDirective {
  private readonly _dialogRef: LibDialogRef<unknown> = inject(LibDialogRef);

  /** Valor que se pasará como resultado al cerrar. */
  @Input('libDialogClose') result: unknown = undefined;

  /**
   * Cierra el dialog con el valor de result al hacer click.
   */
  _onClick(): void {
    this._dialogRef.close(this.result);
  }
}
