import { vi } from 'vitest';

import { RetroSnackbarMessage } from '@retro/retro-snackbar/services/retro-snackbar.service';

export const mockRetroSnackbar: {
  open: ReturnType<typeof vi.fn>;
  dismiss: ReturnType<typeof vi.fn>;
  dismissAll: ReturnType<typeof vi.fn>;
  messages: () => readonly RetroSnackbarMessage[];
} = {
  open: vi.fn().mockReturnValue(0),
  dismiss: vi.fn(),
  dismissAll: vi.fn(),
  messages: () => []
};
