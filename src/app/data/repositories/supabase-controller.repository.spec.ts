import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { SupabaseControllerRepository } from './supabase-controller.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'order', 'insert', 'update', 'delete', 'single']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const controllerDto = {
  id: 'controller-uuid-1',
  user_id: 'user-1',
  brand_id: 'brand-uuid-1',
  model_id: 'model-uuid-1',
  edition_id: null,
  color: 'Blanco',
  compatibility: 'PS5',
  condition: 'new',
  price: 79.99,
  store: 'GAME',
  purchase_date: '2023-12-25',
  notes: null,
  created_at: '2023-12-25T09:00:00Z'
};

const controllerModel = {
  id: 'controller-uuid-1',
  userId: 'user-1',
  brandId: 'brand-uuid-1',
  modelId: 'model-uuid-1',
  editionId: null,
  color: 'Blanco',
  compatibility: 'PS5' as const,
  condition: 'new' as const,
  price: 79.99,
  store: 'GAME',
  purchaseDate: '2023-12-25',
  notes: null,
  createdAt: '2023-12-25T09:00:00Z'
};

describe('SupabaseControllerRepository', () => {
  let repo: SupabaseControllerRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseControllerRepository]
    });
    repo = TestBed.inject(SupabaseControllerRepository);
  });

  describe('getAllForUser', () => {
    it('devuelve los mandos mapeados para el usuario', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [controllerDto], error: null }));

      const result = await repo.getAllForUser('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].modelId).toBe('model-uuid-1');
      expect(result[0].color).toBe('Blanco');
    });

    it('devuelve array vacío si no hay mandos', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [], error: null }));

      const result = await repo.getAllForUser('user-1');
      expect(result).toHaveLength(0);
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAllForUser('user-1')).rejects.toThrow('Failed to fetch controllers');
    });
  });

  describe('getById', () => {
    it('devuelve el mando mapeado cuando existe', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: controllerDto, error: null }));

      const result = await repo.getById('user-1', 'controller-uuid-1');

      expect(result).toBeDefined();
      expect(result!.id).toBe('controller-uuid-1');
      expect(result!.modelId).toBe('model-uuid-1');
    });

    it('devuelve undefined cuando Supabase devuelve error (no encontrado)', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'No rows' } }));

      const result = await repo.getById('user-1', 'inexistente');
      expect(result).toBeUndefined();
    });
  });

  describe('add', () => {
    it('inserta el mando con el payload correcto', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.add('user-1', controllerModel);

      expect(b.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          brand_id: 'brand-uuid-1',
          model_id: 'model-uuid-1',
          color: 'Blanco',
          compatibility: 'PS5',
          condition: 'new',
          price: 79.99
        })
      );
    });

    it('lanza error si el insert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Insert failed' } }));

      await expect(repo.add('user-1', controllerModel)).rejects.toThrow('Failed to add controller');
    });
  });

  describe('update', () => {
    it('actualiza el mando con id y user_id correctos', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.update('user-1', 'controller-uuid-1', controllerModel);

      expect(b.update).toHaveBeenCalledWith(expect.objectContaining({ model_id: 'model-uuid-1', color: 'Blanco' }));
      expect(b.eq).toHaveBeenCalledWith('id', 'controller-uuid-1');
      expect(b.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('no incluye user_id en el payload del update', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.update('user-1', 'controller-uuid-1', controllerModel);

      const updatePayload = b.update.mock.calls[0][0];
      expect(updatePayload).not.toHaveProperty('user_id');
    });

    it('lanza error si el update falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Update failed' } }));

      await expect(repo.update('user-1', 'controller-uuid-1', controllerModel)).rejects.toThrow(
        'Failed to update controller'
      );
    });
  });

  describe('delete', () => {
    it('borra el mando con id y user_id correctos', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.delete('user-1', 'controller-uuid-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', 'controller-uuid-1');
      expect(b.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('lanza error si el borrado falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Cannot delete' } }));

      await expect(repo.delete('user-1', 'controller-uuid-1')).rejects.toThrow('Failed to delete controller');
    });
  });
});
