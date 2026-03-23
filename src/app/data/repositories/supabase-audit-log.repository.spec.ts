import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabaseAuditLogRepository } from './supabase-audit-log.repository';

function makeBuilder(result: { data?: unknown; error: unknown }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'order', 'limit', 'insert', 'update', 'delete', 'single']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const logRow = {
  id: 'log-1',
  performed_by: 'user-1',
  action: 'DELETE_GAME',
  entity_type: 'game',
  entity_id: 'game-uuid',
  description: 'Deleted God of War',
  created_at: '2024-01-01T00:00:00Z'
};

describe('SupabaseAuditLogRepository', () => {
  let repo: SupabaseAuditLogRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseAuditLogRepository]
    });
    repo = TestBed.inject(SupabaseAuditLogRepository);
  });

  describe('getRecentLogs', () => {
    it('devuelve los logs mapeados correctamente', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [logRow], error: null }));

      const result = await repo.getRecentLogs();

      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('DELETE_GAME');
      expect(result[0].performedBy).toBe('user-1');
      expect(result[0].entityType).toBe('game');
    });

    it('usa limit 100 por defecto', async () => {
      const b = makeBuilder({ data: [], error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.getRecentLogs();

      expect(b.limit).toHaveBeenCalledWith(100);
    });

    it('usa el limit personalizado cuando se proporciona', async () => {
      const b = makeBuilder({ data: [], error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.getRecentLogs(25);

      expect(b.limit).toHaveBeenCalledWith(25);
    });

    it('lanza el error cuando Supabase devuelve error', async () => {
      const dbError = new Error('Permission denied');
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: dbError }));

      await expect(repo.getRecentLogs()).rejects.toThrow('Permission denied');
    });
  });

  describe('insertLog', () => {
    it('inserta el log cuando hay usuario autenticado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.insertLog({ action: 'DELETE_GAME', entityType: 'game', entityId: 'g-1', description: null });

      expect(b.insert).toHaveBeenCalledWith(expect.objectContaining({ performed_by: 'user-1', action: 'DELETE_GAME' }));
    });

    it('no inserta nada cuando no hay usuario autenticado', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await repo.insertLog({ action: 'DELETE_GAME', entityType: null, entityId: null, description: null });

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('lanza el error si el insert falla', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
      const dbError = new Error('Insert failed');
      mockSupabase.from.mockReturnValue(makeBuilder({ error: dbError }));

      await expect(
        repo.insertLog({ action: 'DELETE_GAME', entityType: null, entityId: null, description: null })
      ).rejects.toThrow('Insert failed');
    });
  });
});
