import { vi } from 'vitest';
import { of } from 'rxjs';

/**
 * Mock de LibDialogService para tests.
 * open() devuelve un LibDialogRef simulado con afterClosed() → of(undefined).
 * Typed as { open: vi.fn() } para que los specs puedan usar .mockReturnValue().
 */
export const mockDialog: { open: ReturnType<typeof vi.fn> } = {
  open: vi.fn().mockReturnValue({
    afterClosed: () => of(undefined),
    close: vi.fn(),
    componentInstance: null
  })
};

/** Mock de LibDialogRef para inyectar en specs de componentes dialog. */
export const mockDialogRef = {
  close: vi.fn(),
  afterClosed: () => of(undefined)
};
