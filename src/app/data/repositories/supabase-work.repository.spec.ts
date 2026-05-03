import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabaseWorkRepository } from './supabase-work.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'is', 'order', 'update', 'single']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const workRow = {
  id: 'work-1',
  user_id: 'user-1',
  game_catalog_id: 'cat-1',
  platform: 'PS5',
  status: 'playing',
  personal_rating: 8,
  is_favorite: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z'
};

describe('SupabaseWorkRepository', () => {
  let repo: SupabaseWorkRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReset();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseWorkRepository]
    });
    repo = TestBed.inject(SupabaseWorkRepository);
  });

  describe('getById', () => {
    it('mapea la fila de user_works al WorkModel', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: workRow, error: null }));

      const result = await repo.getById('user-1', 'work-1');

      expect(result).toBeDefined();
      expect(result!.uuid).toBe('work-1');
      expect(result!.platform).toBe('PS5');
      expect(result!.status).toBe('playing');
    });

    it('devuelve undefined cuando no encuentra la obra', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'Not found' } }));

      expect(await repo.getById('user-1', 'missing')).toBeUndefined();
    });
  });

  describe('getCopies', () => {
    it('devuelve las copias mapeadas filtrando por work_id', async () => {
      const fullRow = {
        id: 'game-1',
        user_id: 'user-1',
        game_catalog_id: 'cat-1',
        work_id: 'work-1',
        title: 'God of War',
        slug: 'god-of-war',
        rawg_id: 58175,
        image_url: null,
        status: 'playing',
        personal_rating: 8,
        is_favorite: false,
        user_platform: 'PS5',
        platform: 'PS5',
        price: 60,
        store: null,
        condition: 'new',
        format: 'physical',
        edition: null,
        description: '',
        user_notes: '',
        cover_position: null,
        for_sale: false,
        sale_price: null,
        sold_at: null,
        sold_price_final: null,
        active_loan_id: null,
        active_loan_to: null,
        active_loan_at: null,
        released_date: null,
        rawg_rating: 4.5,
        metacritic_score: null,
        esrb_rating: null,
        available_platforms: ['PS5'],
        genres: [],
        source: 'rawg'
      };
      const builder = makeBuilder({ data: [fullRow], error: null });
      mockSupabase.from.mockReturnValue(builder);

      const result = await repo.getCopies('user-1', 'work-1');

      expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(builder.eq).toHaveBeenCalledWith('work_id', 'work-1');
      expect(result).toHaveLength(1);
      expect(result[0].uuid).toBe('game-1');
    });

    it('devuelve [] cuando data es null', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: null }));

      expect(await repo.getCopies('user-1', 'work-1')).toEqual([]);
    });

    it('lanza error cuando la query falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getCopies('user-1', 'work-1')).rejects.toThrow('Failed to fetch copies for work');
    });
  });

  describe('update', () => {
    it('actualiza solo los campos presentes en el patch', async () => {
      const builder = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(builder);

      await repo.update('user-1', 'work-1', { status: 'completed', isFavorite: true });

      expect(builder.update).toHaveBeenCalledWith({ status: 'completed', is_favorite: true });
      expect(builder.eq).toHaveBeenCalledWith('id', 'work-1');
      expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('mapea personalRating del modelo a personal_rating en la BD', async () => {
      const builder = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(builder);

      await repo.update('user-1', 'work-1', { personalRating: 9.5 });

      expect(builder.update).toHaveBeenCalledWith({ personal_rating: 9.5 });
    });

    it('no llama a update si el patch está vacío', async () => {
      const builder = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(builder);

      await repo.update('user-1', 'work-1', {});

      expect(builder.update).not.toHaveBeenCalled();
    });

    it('lanza error cuando la actualización falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Update failed' } }));

      await expect(repo.update('user-1', 'work-1', { status: 'completed' })).rejects.toThrow('Failed to update work');
    });
  });
});
