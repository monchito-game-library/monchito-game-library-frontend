import { vi } from 'vitest';

/**
 * Mock de RetroBottomSheetService para tests.
 * open() es un spy que no hace nada por defecto.
 */
export const mockRetroBottomSheet = {
  open: vi.fn()
};
