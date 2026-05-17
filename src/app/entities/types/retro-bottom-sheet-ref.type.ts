import { RetroOverlayRef } from '@/services/retro-overlay/retro-overlay.service';

/**
 * Alias tipado de RetroOverlayRef para bottom-sheets.
 * Expone la misma API: close(), afterClosed$, backdropClick$.
 */
export type RetroBottomSheetRef<T = unknown, R = unknown> = RetroOverlayRef<T, R>;
