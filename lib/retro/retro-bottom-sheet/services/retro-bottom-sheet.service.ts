import { Injectable, inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import {
  RetroOverlayService,
  RETRO_OVERLAY_BOTTOM_SHEET_CONFIG,
  RETRO_OVERLAY_DATA
} from '../../retro-overlay/services/retro-overlay.service';
import { RetroBottomSheetRef } from '../retro-bottom-sheet-ref.types';

// ─── Token de datos ──────────────────────────────────────────────────────────

/**
 * Token para inyectar los datos pasados al componente abierto como bottom-sheet.
 * Es un alias semántico de RETRO_OVERLAY_DATA que los consumidores del bottom-sheet
 * pueden usar para mayor legibilidad.
 */
export const RETRO_BOTTOM_SHEET_DATA: typeof RETRO_OVERLAY_DATA = RETRO_OVERLAY_DATA;

// ─── RetroBottomSheetService ───────────────────────────────────────────────────

/**
 * Servicio conveniente para abrir componentes como bottom-sheets.
 * Delega en RetroOverlayService con el preset RETRO_OVERLAY_BOTTOM_SHEET_CONFIG.
 * El componente abierto puede inyectar los datos via RETRO_BOTTOM_SHEET_DATA.
 */
@Injectable({ providedIn: 'root' })
export class RetroBottomSheetService {
  private readonly _overlay: RetroOverlayService = inject(RetroOverlayService);

  /**
   * Abre un componente como panel bottom-sheet.
   * Incluye backdrop, focus trap, scroll block y animación desde el fondo.
   * El componente puede inyectar los datos via `inject(RETRO_BOTTOM_SHEET_DATA)`.
   *
   * @param {ComponentType<T>} component - Componente a proyectar en el panel.
   * @param {unknown} data - Datos opcionales inyectables en el componente.
   */
  open<T, R = unknown>(component: ComponentType<T>, data?: unknown): RetroBottomSheetRef<T, R> {
    return this._overlay.open<T, R>(component, {
      ...RETRO_OVERLAY_BOTTOM_SHEET_CONFIG,
      data
    });
  }
}
