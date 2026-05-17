import { vi } from 'vitest';

import { LibSnackbarMessage } from '@/services/lib-snackbar/lib-snackbar.service';

export const mockLibSnackbar: {
  open: ReturnType<typeof vi.fn>;
  dismiss: ReturnType<typeof vi.fn>;
  dismissAll: ReturnType<typeof vi.fn>;
  messages: () => readonly LibSnackbarMessage[];
} = {
  open: vi.fn().mockReturnValue(0),
  dismiss: vi.fn(),
  dismissAll: vi.fn(),
  messages: () => []
};
