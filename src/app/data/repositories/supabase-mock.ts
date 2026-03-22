import { vi } from 'vitest';

export const mockStorageBucket = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
  remove: vi.fn()
};

export const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    onAuthStateChange: vi.fn(),
    updateUser: vi.fn(),
    getUser: vi.fn()
  },
  storage: {
    from: vi.fn().mockReturnValue(mockStorageBucket)
  }
};
