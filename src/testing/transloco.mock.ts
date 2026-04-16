import { vi } from 'vitest';

export const mockTransloco = { translate: vi.fn((key: string) => key) };
