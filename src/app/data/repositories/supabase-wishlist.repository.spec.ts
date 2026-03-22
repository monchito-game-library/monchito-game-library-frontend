import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabaseWishlistRepository } from './supabase-wishlist.repository';

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

const wishlistDto = {
  id: 'w-1',
  user_id: 'user-1',
  game_catalog_id: 'cat-1',
  platform: 'PS5',
  desired_price: 39.99,
  priority: 3,
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  title: 'God of War',
  slug: 'god-of-war',
  image_url: null,
  rawg_id: 58175,
  released_date: '2018-04-20',
  rating: 4.42,
  platforms: ['PS4', 'PS5'],
  genres: ['Action']
};

const catalogEntry = {
  rawg_id: 58175,
  title: 'God of War',
  slug: 'god-of-war',
  image_url: null,
  released_date: '2018-04-20',
  rating: 4.42,
  platforms: ['PS4'],
  genres: ['Action'],
  source: 'rawg' as const,
  esrb_rating: null,
  metacritic_score: null
};

describe('SupabaseWishlistRepository', () => {
  let repo: SupabaseWishlistRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseWishlistRepository]
    });
    repo = TestBed.inject(SupabaseWishlistRepository);
  });

  describe('getAllForUser', () => {
    it('devuelve los ítems mapeados para el usuario', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [wishlistDto], error: null }));

      const result = await repo.getAllForUser('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('God of War');
      expect(result[0].platform).toBe('PS5');
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAllForUser('user-1')).rejects.toThrow('Failed to fetch wishlist');
    });
  });

  describe('addItem', () => {
    it('reutiliza el catalog_id existente cuando rawg_id ya está en catálogo', async () => {
      const catalogBuilder = makeBuilder({ data: { id: 'cat-1' }, error: null });
      const insertBuilder = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValueOnce(catalogBuilder).mockReturnValueOnce(insertBuilder);

      const formValue = { platform: 'PS5', desiredPrice: 39.99, priority: 3, notes: null };
      await repo.addItem('user-1', catalogEntry, formValue);

      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', game_catalog_id: 'cat-1' })
      );
    });

    it('crea una nueva entrada en catálogo cuando rawg_id no existe', async () => {
      const lookupBuilder = makeBuilder({ data: null, error: { message: 'No rows' } });
      const createCatalogBuilder = makeBuilder({ data: { id: 'new-cat-1' }, error: null });
      const insertBuilder = makeBuilder({ error: null });
      mockSupabase.from
        .mockReturnValueOnce(lookupBuilder)
        .mockReturnValueOnce(createCatalogBuilder)
        .mockReturnValueOnce(insertBuilder);

      const formValue = { platform: 'PS5', desiredPrice: 39.99, priority: 3, notes: null };
      await repo.addItem('user-1', catalogEntry, formValue);

      expect(createCatalogBuilder.insert).toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('actualiza los campos del ítem', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.updateItem('user-1', 'w-1', { desiredPrice: 29.99, priority: 4 });

      expect(b.update).toHaveBeenCalledWith(expect.objectContaining({ desired_price: 29.99, priority: 4 }));
      expect(b.eq).toHaveBeenCalledWith('id', 'w-1');
      expect(b.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });
  });

  describe('deleteItem', () => {
    it('borra el ítem con id y user_id correctos', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.deleteItem('user-1', 'w-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', 'w-1');
      expect(b.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('lanza error si el borrado falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Cannot delete' } }));

      await expect(repo.deleteItem('user-1', 'w-1')).rejects.toThrow('Failed to delete wishlist item');
    });
  });
});
