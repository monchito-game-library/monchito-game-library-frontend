import { vi } from 'vitest';

export const mockUserContext = { requireUserId: vi.fn().mockReturnValue('user-1') };
