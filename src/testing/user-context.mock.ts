import { vi } from 'vitest';

export const mockUserContext = {
  requireUserId: vi.fn().mockReturnValue('user-1'),
  userId: vi.fn().mockReturnValue('user-1')
};
