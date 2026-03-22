import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabaseRepository } from './supabase.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of [
    'select',
    'eq',
    'neq',
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

const fullDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'user-1',
  game_catalog_id: 'cat-1',
  title: 'God of War',
  slug: 'god-of-war',
  price: 59.99,
  store: 'GAME',
  platform: 'PS4',
  user_platform: 'PS5',
  condition: 'new',
  purchased_date: null,
  platinum: false,
  status: 'playing',
  personal_rating: 9,
  edition: null,
  format: 'physical',
  started_date: null,
  completed_date: null,
  platinum_date: null,
  description: 'desc',
  user_notes: null,
  is_favorite: true,
  cover_position: null,
  image_url: 'https://example.com/gow.jpg',
  rawg_id: 58175,
  released_date: '2018-04-20',
  rawg_rating: 4.42,
  metacritic_score: 94,
  esrb_rating: 'Mature',
  available_platforms: ['PS5'],
  genres: ['Action'],
  source: 'rawg'
};

describe('SupabaseRepository', () => {
  let repo: SupabaseRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseRepository]
    });
    repo = TestBed.inject(SupabaseRepository);
  });

  describe('getAllGamesForList', () => {
    it('devuelve los juegos mapeados de una sola página', async () => {
      const listDto = {
        id: fullDto.id,
        title: fullDto.title,
        price: 59.99,
        store: 'GAME',
        user_platform: 'PS5',
        platinum: false,
        description: null,
        user_notes: null,
        status: 'playing',
        personal_rating: 9,
        edition: null,
        format: 'physical',
        is_favorite: true,
        image_url: null,
        cover_position: null
      };
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [listDto], error: null }));

      const result = await repo.getAllGamesForList('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('God of War');
      expect(result[0].platform).toBe('PS5');
    });

    it('pagina hasta que el batch es menor de 1000', async () => {
      const page1 = Array(1000).fill(fullDto);
      const page2 = [fullDto];
      mockSupabase.from
        .mockReturnValueOnce(makeBuilder({ data: page1, error: null }))
        .mockReturnValueOnce(makeBuilder({ data: page2, error: null }));

      const result = await repo.getAllGamesForUser('user-1');

      expect(result).toHaveLength(1001);
    });

    it('lanza error si la consulta falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAllGamesForList('user-1')).rejects.toThrow('Failed to fetch games');
    });
  });

  describe('getById', () => {
    it('devuelve el juego mapeado cuando se encuentra', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: fullDto, error: null }));

      const result = await repo.getById('user-1', fullDto.id);

      expect(result).toBeDefined();
      expect(result!.title).toBe('God of War');
    });

    it('devuelve undefined cuando no se encuentra', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'Not found' } }));

      expect(await repo.getById('user-1', 'missing-id')).toBeUndefined();
    });
  });

  describe('deleteById', () => {
    it('llama a delete con id y user_id correctos', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.deleteById('user-1', fullDto.id);

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', fullDto.id);
      expect(b.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('lanza error si delete falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Delete failed' } }));

      await expect(repo.deleteById('user-1', fullDto.id)).rejects.toThrow('Failed to delete game');
    });
  });

  describe('addGameForUser', () => {
    it('reutiliza el catalog_id existente cuando el juego ya está en catálogo (rawg)', async () => {
      const catalogLookupBuilder = makeBuilder({ data: { id: 'cat-existing' }, error: null });
      const insertBuilder = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValueOnce(catalogLookupBuilder).mockReturnValueOnce(insertBuilder);

      const catalogEntry = {
        rawg_id: 58175,
        title: 'God of War',
        slug: 'god-of-war',
        image_url: null,
        released_date: null,
        rating: 4,
        platforms: [],
        genres: [],
        source: 'rawg' as const
      };
      const gameModel = {
        title: 'God of War',
        price: null,
        store: null,
        condition: 'new' as const,
        description: '',
        platinum: false,
        status: 'backlog' as const,
        personalRating: null,
        edition: null,
        format: null,
        isFavorite: false,
        platform: null,
        imageUrl: undefined,
        rawgId: 58175,
        rawgSlug: null,
        coverPosition: null
      };

      await repo.addGameForUser('user-1', gameModel, catalogEntry);

      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', game_catalog_id: 'cat-existing' })
      );
    });
  });

  describe('clearAllForUser', () => {
    it('borra todos los juegos del usuario', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.clearAllForUser('user-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });
  });

  describe('updateGameForUser', () => {
    it('lanza error cuando uuid es undefined', async () => {
      const gameModel = {
        title: 'G',
        price: null,
        store: null,
        condition: 'new' as const,
        description: '',
        platinum: false,
        status: 'backlog' as const,
        personalRating: null,
        edition: null,
        format: null,
        isFavorite: false,
        platform: null,
        imageUrl: undefined,
        rawgId: null,
        rawgSlug: null,
        coverPosition: null
      };

      await expect(repo.updateGameForUser('user-1', gameModel)).rejects.toThrow('uuid is missing');
    });
  });
});
