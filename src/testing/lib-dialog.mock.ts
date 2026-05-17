import { vi } from 'vitest';
import { of } from 'rxjs';

/**
 * Mock de LibDialogService para inyectar en specs de componentes que abren dialogs.
 * Provide: { provide: LibDialogService, useValue: mockLibDialog }
 */
export const mockLibDialog: { open: ReturnType<typeof vi.fn> } = {
  open: vi.fn().mockReturnValue({
    afterClosed: () => of(undefined),
    close: vi.fn(),
    componentInstance: null
  })
};
