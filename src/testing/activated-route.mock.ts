import { vi } from 'vitest';

export const mockActivatedRoute = {
  snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } }
};
