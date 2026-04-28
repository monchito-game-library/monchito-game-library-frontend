import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { SupabaseHardwareModelRepository } from './supabase-hardware-model.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'order', 'insert', 'update', 'delete', 'single']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const modelDto = {
  id: 'model-1',
  brand_id: 'brand-1',
  name: 'PlayStation 5',
  type: 'console' as const,
  generation: null
};

describe('SupabaseHardwareModelRepository', () => {
  let repo: SupabaseHardwareModelRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseHardwareModelRepository]
    });
    repo = TestBed.inject(SupabaseHardwareModelRepository);
  });

  describe('getAllByBrand', () => {
    it('devuelve los modelos mapeados para la marca', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [modelDto], error: null }));

      const result = await repo.getAllByBrand('brand-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('PlayStation 5');
      expect(result[0].brandId).toBe('brand-1');
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAllByBrand('brand-1')).rejects.toThrow('Failed to fetch hardware models: DB error');
    });
  });

  describe('getAllByType', () => {
    it('devuelve los modelos mapeados del tipo indicado', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [modelDto], error: null }));

      const result = await repo.getAllByType('console');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('console');
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAllByType('console')).rejects.toThrow('Failed to fetch hardware models by type: DB error');
    });
  });

  describe('getById', () => {
    it('devuelve el modelo mapeado cuando existe', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: modelDto, error: null }));

      const result = await repo.getById('model-1');

      expect(result?.id).toBe('model-1');
    });

    it('devuelve undefined cuando no existe', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'not found' } }));

      const result = await repo.getById('model-x');

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('inserta y devuelve el modelo mapeado', async () => {
      const b = makeBuilder({ data: modelDto, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.create({
        brandId: 'brand-1',
        name: 'PlayStation 5',
        type: 'console',
        generation: null,
        category: null
      });

      expect(b.insert).toHaveBeenCalled();
      expect(result.name).toBe('PlayStation 5');
    });

    it('lanza error si insert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'insert failed' } }));

      await expect(
        repo.create({ brandId: 'brand-1', name: 'PS5', type: 'console', generation: null, category: null })
      ).rejects.toThrow('Failed to create hardware model');
    });
  });

  describe('update', () => {
    it('actualiza y devuelve el modelo mapeado', async () => {
      const b = makeBuilder({ data: { ...modelDto, name: 'PlayStation 5 Digital' }, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.update('model-1', { name: 'PlayStation 5 Digital' });

      expect(b.update).toHaveBeenCalledWith({ name: 'PlayStation 5 Digital' });
      expect(result.name).toBe('PlayStation 5 Digital');
    });

    it('lanza error si el update falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'update failed' } }));

      await expect(repo.update('model-1', { name: 'X' })).rejects.toThrow('Failed to update hardware model');
    });
  });

  describe('delete', () => {
    it('llama a delete con el id correcto', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.delete('model-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', 'model-1');
    });

    it('lanza error si delete falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'delete failed' } }));

      await expect(repo.delete('model-1')).rejects.toThrow('Failed to delete hardware model');
    });
  });
});
