import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabaseStoreRepository } from './supabase-store.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of [
    'select',
    'eq',
    'order',
    'range',
    'ilike',
    'limit',
    'insert',
    'update',
    'delete',
    'upsert',
    'single'
  ]) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const storeDto = { id: 'store-1', label: 'GAME', format_hint: 'physical' as const, created_by: 'user-1' };

describe('SupabaseStoreRepository', () => {
  let repo: SupabaseStoreRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseStoreRepository]
    });
    repo = TestBed.inject(SupabaseStoreRepository);
  });

  describe('getAll', () => {
    it('devuelve las tiendas mapeadas', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [storeDto], error: null }));

      const result = await repo.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('GAME');
      expect(result[0].formatHint).toBe('physical');
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAll()).rejects.toThrow('Failed to fetch stores: DB error');
    });
  });

  describe('create', () => {
    it('inserta y devuelve la tienda mapeada', async () => {
      const b = makeBuilder({ data: storeDto, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.create({ label: 'GAME', formatHint: 'physical' }, 'user-1');

      expect(b.insert).toHaveBeenCalled();
      expect(result.label).toBe('GAME');
    });

    it('lanza error si insert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'insert failed' } }));

      await expect(repo.create({ label: 'GAME', formatHint: null }, 'user-1')).rejects.toThrow(
        'Failed to create store'
      );
    });
  });

  describe('update', () => {
    it('actualiza y devuelve la tienda mapeada', async () => {
      const b = makeBuilder({ data: { ...storeDto, label: 'Updated' }, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.update('store-1', { label: 'Updated' });

      expect(b.update).toHaveBeenCalled();
      expect(result.label).toBe('Updated');
    });

    it('actualiza formatHint sin label', async () => {
      const b = makeBuilder({ data: { ...storeDto, format_hint: null }, error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.update('store-1', { formatHint: null });

      expect(b.update).toHaveBeenCalledWith(expect.objectContaining({ format_hint: null }));
    });

    it('lanza error si el update falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Update failed' } }));

      await expect(repo.update('store-1', { label: 'X' })).rejects.toThrow('Failed to update store');
    });
  });

  describe('delete', () => {
    it('llama a delete con el id correcto', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.delete('store-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', 'store-1');
    });

    it('lanza error si delete falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'delete failed' } }));

      await expect(repo.delete('store-1')).rejects.toThrow('Failed to delete store');
    });
  });
});
