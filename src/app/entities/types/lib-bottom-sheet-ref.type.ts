import { LibOverlayRef } from '@/services/lib-overlay/lib-overlay.service';

/**
 * Alias tipado de LibOverlayRef para bottom-sheets.
 * Expone la misma API: close(), afterClosed$, backdropClick$.
 */
export type LibBottomSheetRef<T = unknown, R = unknown> = LibOverlayRef<T, R>;
