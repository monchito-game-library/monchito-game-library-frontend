import { Injectable, inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import {
  LibOverlayService,
  LIB_OVERLAY_BOTTOM_SHEET_CONFIG,
  LIB_OVERLAY_DATA
} from '@/services/lib-overlay/lib-overlay.service';
import { LibBottomSheetRef } from '@/types/lib-bottom-sheet-ref.type';

// ─── Token de datos ──────────────────────────────────────────────────────────

/**
 * Token para inyectar los datos pasados al componente abierto como bottom-sheet.
 * Es un alias semántico de LIB_OVERLAY_DATA que los consumidores del bottom-sheet
 * pueden usar para mayor legibilidad.
 */
export const LIB_BOTTOM_SHEET_DATA: typeof LIB_OVERLAY_DATA = LIB_OVERLAY_DATA;

// ─── LibBottomSheetService ───────────────────────────────────────────────────

/**
 * Servicio conveniente para abrir componentes como bottom-sheets.
 * Delega en LibOverlayService con el preset LIB_OVERLAY_BOTTOM_SHEET_CONFIG.
 * El componente abierto puede inyectar los datos via LIB_BOTTOM_SHEET_DATA.
 */
@Injectable({ providedIn: 'root' })
export class LibBottomSheetService {
  private readonly _overlay: LibOverlayService = inject(LibOverlayService);

  /**
   * Abre un componente como panel bottom-sheet.
   * Incluye backdrop, focus trap, scroll block y animación desde el fondo.
   * El componente puede inyectar los datos via `inject(LIB_BOTTOM_SHEET_DATA)`.
   *
   * @param {ComponentType<T>} component - Componente a proyectar en el panel.
   * @param {unknown} data - Datos opcionales inyectables en el componente.
   */
  open<T, R = unknown>(component: ComponentType<T>, data?: unknown): LibBottomSheetRef<T, R> {
    return this._overlay.open<T, R>(component, {
      ...LIB_OVERLAY_BOTTOM_SHEET_CONFIG,
      data
    });
  }
}
