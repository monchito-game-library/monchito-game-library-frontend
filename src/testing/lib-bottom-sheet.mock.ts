import { vi } from 'vitest';

/**
 * Mock de LibBottomSheetService para tests.
 * open() es un spy que no hace nada por defecto.
 */
export const mockLibBottomSheet = {
  open: vi.fn()
};
