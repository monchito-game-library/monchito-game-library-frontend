import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { SupabaseHardwareEditionRepository } from './supabase-hardware-edition.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'order', 'insert', 'update', 'delete', 'single']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const editionDto = { id: 'edition-1', model_id: 'model-1', name: 'Final Fantasy XVI Limited Edition' };

describe('SupabaseHardwareEditionRepository', () => {
  let repo: SupabaseHardwareEditionRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseHardwareEditionRepository]
    });
    repo = TestBed.inject(SupabaseHardwareEditionRepository);
  });

  describe('getAllByModel', () => {
    it('devuelve las ediciones mapeadas para el modelo', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [editionDto], error: null }));

      const result = await repo.getAllByModel('model-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Final Fantasy XVI Limited Edition');
      expect(result[0].modelId).toBe('model-1');
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAllByModel('model-1')).rejects.toThrow('Failed to fetch hardware editions: DB error');
    });
  });

  describe('getById', () => {
    it('devuelve la edición mapeada cuando existe', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: editionDto, error: null }));

      const result = await repo.getById('edition-1');

      expect(result?.id).toBe('edition-1');
    });

    it('devuelve undefined cuando no existe', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'not found' } }));

      const result = await repo.getById('edition-x');

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('inserta y devuelve la edición mapeada', async () => {
      const b = makeBuilder({ data: editionDto, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.create({ modelId: 'model-1', name: 'Final Fantasy XVI Limited Edition' });

      expect(b.insert).toHaveBeenCalled();
      expect(result.name).toBe('Final Fantasy XVI Limited Edition');
    });

    it('lanza error si insert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'insert failed' } }));

      await expect(repo.create({ modelId: 'model-1', name: 'Limited' })).rejects.toThrow(
        'Failed to create hardware edition'
      );
    });
  });

  describe('update', () => {
    it('actualiza y devuelve la edición mapeada', async () => {
      const b = makeBuilder({ data: { ...editionDto, name: 'God of War Edition' }, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.update('edition-1', { name: 'God of War Edition' });

      expect(b.update).toHaveBeenCalledWith({ name: 'God of War Edition' });
      expect(result.name).toBe('God of War Edition');
    });

    it('lanza error si el update falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'update failed' } }));

      await expect(repo.update('edition-1', { name: 'X' })).rejects.toThrow('Failed to update hardware edition');
    });
  });

  describe('delete', () => {
    it('llama a delete con el id correcto', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.delete('edition-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', 'edition-1');
    });

    it('lanza error si delete falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'delete failed' } }));

      await expect(repo.delete('edition-1')).rejects.toThrow('Failed to delete hardware edition');
    });
  });
});
