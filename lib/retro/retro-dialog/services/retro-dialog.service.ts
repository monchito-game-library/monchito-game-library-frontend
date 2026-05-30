import { Directive, Injectable, Input, inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import {
  RetroOverlayRef,
  RetroOverlayService,
  RETRO_OVERLAY_DATA,
  RETRO_OVERLAY_DIALOG_CONFIG
} from '../../retro-overlay/services/retro-overlay.service';
import { RetroDialogConfig } from '../interfaces/retro-dialog-config.interface';
import { Observable } from 'rxjs';

// ─── Token de datos ──────────────────────────────────────────────────────────

/**
 * Token para inyectar los datos pasados al componente dialog.
 * Reemplaza MAT_DIALOG_DATA de Angular Material.
 */
export const RETRO_DIALOG_DATA: typeof RETRO_OVERLAY_DATA = RETRO_OVERLAY_DATA;

// Re-export RetroDialogConfig for consumers of this service
export type { RetroDialogConfig };

// ─── RetroDialogRef ─────────────────────────────────────────────────────────────

/**
 * Referencia a un dialog abierto. Envuelve RetroOverlayRef y expone la API
 * compatible con MatDialogRef para minimizar el diff en los call-sites.
 */
export class RetroDialogRef<T, R = unknown> {
  private readonly _overlayRef: RetroOverlayRef<T, R>;

  /** Instancia del componente proyectado en el dialog. */
  get componentInstance(): T | null {
    return this._overlayRef.componentInstance;
  }

  constructor(overlayRef: RetroOverlayRef<T, R>) {
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

// ─── RetroDialogService ─────────────────────────────────────────────────────────

/**
 * Servicio para abrir componentes como dialogs modales.
 * Reemplaza MatDialog de Angular Material.
 * Construye sobre RetroOverlayService del commit 25.
 */
@Injectable({ providedIn: 'root' })
export class RetroDialogService {
  private readonly _overlay: RetroOverlayService = inject(RetroOverlayService);

  /**
   * Abre un componente como dialog modal.
   * Devuelve un RetroDialogRef con .close(), .afterClosed() y .componentInstance.
   *
   * @param {ComponentType<T>} component - Componente a proyectar en el dialog.
   * @param {RetroDialogConfig<D>} config - Configuración opcional del dialog.
   */
  open<T, D = unknown, R = unknown>(component: ComponentType<T>, config?: RetroDialogConfig<D>): RetroDialogRef<T, R> {
    const panelClasses = ['retro-overlay-panel--dialog'];
    if (config?.panelClass) {
      const extra = Array.isArray(config.panelClass) ? config.panelClass : [config.panelClass];
      panelClasses.push(...extra);
    }

    let dialogRef!: RetroDialogRef<T, R>;
    const overlayRef = this._overlay.open<T, R>(component, {
      ...RETRO_OVERLAY_DIALOG_CONFIG,
      data: config?.data,
      panelClass: panelClasses,
      width: config?.width,
      autoFocus: config?.disableClose === true ? false : (config?.autoFocus ?? 'first-tabbable'),
      restoreFocus: config?.restoreFocus ?? true,
      disableClose: config?.disableClose === true,
      extraProviders: (overlay: unknown) => {
        dialogRef = new RetroDialogRef<T, R>(overlay as RetroOverlayRef<T, R>);
        return [{ provide: RetroDialogRef, useValue: dialogRef }];
      }
    });

    // Si el componente no se montó (ej. content era TemplateRef), creamos el ref aquí.
    if (!dialogRef) {
      dialogRef = new RetroDialogRef<T, R>(overlayRef);
    }

    return dialogRef;
  }
}

// ─── Directivas de template (paridad con MatDialogTitle/Content/Actions/Close) ─

/**
 * Directiva de título del dialog.
 * Aplica role="heading" y aria-level="2" para semántica accesible.
 * Selector: [retroDialogTitle]
 */
@Directive({
  selector: '[retroDialogTitle]',
  standalone: true,
  host: {
    class: 'retro-dialog__title',
    role: 'heading',
    'aria-level': '2'
  }
})
export class RetroDialogTitleDirective {}

/**
 * Directiva de contenido del dialog.
 * Aplica la clase CSS retro-dialog__content para scroll y padding.
 * Selector: [retroDialogContent]
 */
@Directive({
  selector: '[retroDialogContent]',
  standalone: true,
  host: {
    class: 'retro-dialog__content'
  }
})
export class RetroDialogContentDirective {}

/**
 * Directiva de acciones del dialog.
 * Aplica flex-row con justify-end por defecto.
 * Selector: [retroDialogActions]
 */
@Directive({
  selector: '[retroDialogActions]',
  standalone: true,
  host: {
    class: 'retro-dialog__actions',
    '[class.retro-dialog__actions--end]': 'align === "end" || !align',
    '[class.retro-dialog__actions--center]': 'align === "center"',
    '[class.retro-dialog__actions--start]': 'align === "start"'
  }
})
export class RetroDialogActionsDirective {
  /** Alineación de las acciones: 'start' | 'center' | 'end'. Por defecto 'end'. */
  @Input() align: 'start' | 'center' | 'end' = 'end';
}

/**
 * Directiva para cerrar el dialog al hacer click.
 * Equivale a mat-dialog-close.
 * Selector: [retroDialogClose]
 */
@Directive({
  selector: '[retroDialogClose]',
  standalone: true,
  host: {
    '(click)': '_onClick()'
  }
})
export class RetroDialogCloseDirective {
  private readonly _dialogRef: RetroDialogRef<unknown> = inject(RetroDialogRef);

  /** Valor que se pasará como resultado al cerrar. */
  @Input('retroDialogClose') result: unknown = undefined;

  /**
   * Cierra el dialog con el valor de result al hacer click.
   */
  _onClick(): void {
    this._dialogRef.close(this.result);
  }
}
