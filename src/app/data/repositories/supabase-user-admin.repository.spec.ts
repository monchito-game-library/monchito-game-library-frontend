import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabaseUserAdminRepository } from './supabase-user-admin.repository';

const userRow = {
  user_id: 'u-1',
  email: 'admin@test.com',
  role: 'admin',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z'
};

describe('SupabaseUserAdminRepository', () => {
  let repo: SupabaseUserAdminRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseUserAdminRepository]
    });
    repo = TestBed.inject(SupabaseUserAdminRepository);
  });

  describe('getAllUsers', () => {
    it('devuelve los usuarios mapeados desde el RPC', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [userRow], error: null });

      const result = await repo.getAllUsers();

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_all_users_with_roles');
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('u-1');
      expect(result[0].role).toBe('admin');
    });

    it('usa "member" como rol por defecto cuando role es null', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [{ ...userRow, role: null }], error: null });

      const result = await repo.getAllUsers();

      expect(result[0].role).toBe('member');
    });

    it('lanza el error cuando el RPC falla', async () => {
      const dbError = new Error('RPC failed');
      mockSupabase.rpc.mockResolvedValue({ data: null, error: dbError });

      await expect(repo.getAllUsers()).rejects.toThrow('RPC failed');
    });
  });

  describe('setUserRole', () => {
    it('llama al RPC con los parámetros correctos', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: null });

      await repo.setUserRole('u-1', 'admin');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('set_user_role', {
        target_user_id: 'u-1',
        new_role: 'admin'
      });
    });

    it('lanza el error cuando el RPC falla', async () => {
      const dbError = new Error('Forbidden');
      mockSupabase.rpc.mockResolvedValue({ error: dbError });

      await expect(repo.setUserRole('u-1', 'member')).rejects.toThrow('Forbidden');
    });
  });
});
