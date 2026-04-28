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
    'not',
    'is',
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
  source: 'rawg',
  for_sale: false,
  sale_price: null,
  sold_at: null,
  sold_price_final: null
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
      cover_position: null,
      for_sale: false,
      sold_at: null,
      sold_price_final: null
    };

    it('devuelve los juegos mapeados de una sola página', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [listDto], error: null }));

      const result = await repo.getAllGamesForList('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('God of War');
      expect(result[0].platform).toBe('PS5');
    });

    it('pagina hasta que el batch es menor de 1000', async () => {
      const page1 = Array(1000).fill(listDto);
      const page2 = [listDto];
      mockSupabase.from
        .mockReturnValueOnce(makeBuilder({ data: page1, error: null }))
        .mockReturnValueOnce(makeBuilder({ data: page2, error: null }));

      const result = await repo.getAllGamesForList('user-1');

      expect(result).toHaveLength(1001);
    });

    it('termina cuando la respuesta está vacía', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [], error: null }));

      const result = await repo.getAllGamesForList('user-1');

      expect(result).toHaveLength(0);
    });

    it('lanza error si la consulta falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAllGamesForList('user-1')).rejects.toThrow('Failed to fetch games');
    });
  });

  describe('getAllGamesForUser', () => {
    it('pagina hasta que el batch es menor de 1000', async () => {
      const page1 = Array(1000).fill(fullDto);
      const page2 = [fullDto];
      mockSupabase.from
        .mockReturnValueOnce(makeBuilder({ data: page1, error: null }))
        .mockReturnValueOnce(makeBuilder({ data: page2, error: null }));

      const result = await repo.getAllGamesForUser('user-1');

      expect(result).toHaveLength(1001);
    });

    it('termina cuando la respuesta está vacía', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [], error: null }));

      const result = await repo.getAllGamesForUser('user-1');

      expect(result).toHaveLength(0);
    });

    it('lanza error si la consulta falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAllGamesForUser('user-1')).rejects.toThrow('Failed to fetch games');
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
        coverPosition: null,
        forSale: false,
        salePrice: null,
        soldAt: null,
        soldPriceFinal: null,
        activeLoanId: null,
        activeLoanTo: null,
        activeLoanAt: null
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

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Delete failed' } }));

      await expect(repo.clearAllForUser('user-1')).rejects.toThrow('Failed to clear games');
    });
  });

  describe('getByConsole', () => {
    it('devuelve los juegos filtrados por plataforma', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [fullDto], error: null }));

      const result = await repo.getByConsole('user-1', 'PS5');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('God of War');
    });

    it('devuelve array vacío cuando no hay datos', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: null }));

      const result = await repo.getByConsole('user-1', 'PS5');

      expect(result).toHaveLength(0);
    });

    it('lanza error si la consulta falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getByConsole('user-1', 'PS5')).rejects.toThrow('Failed to fetch games by console');
    });
  });

  describe('getGameForEdit', () => {
    it('devuelve el modelo de edición cuando se encuentra', async () => {
      const editDto = {
        id: fullDto.id,
        game_catalog_id: 'cat-1',
        title: 'God of War',
        slug: 'god-of-war',
        image_url: 'https://example.com/gow.jpg',
        rawg_id: 58175,
        released_date: '2018-04-20',
        rawg_rating: 4.42,
        genres: ['Action'],
        price: 59.99,
        store: 'GAME',
        user_platform: 'PS5',
        condition: 'new',
        platinum: false,
        user_notes: null,
        description: 'desc',
        status: 'playing',
        personal_rating: 9,
        edition: null,
        format: 'physical',
        is_favorite: true,
        cover_position: null,
        for_sale: false,
        sale_price: null,
        sold_at: null,
        sold_price_final: null
      };
      mockSupabase.from.mockReturnValue(makeBuilder({ data: editDto, error: null }));

      const result = await repo.getGameForEdit('user-1', fullDto.id);

      expect(result).toBeDefined();
      expect(result!.title).toBe('God of War');
    });

    it('devuelve undefined cuando no se encuentra', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'Not found' } }));

      expect(await repo.getGameForEdit('user-1', 'missing-id')).toBeUndefined();
    });
  });

  describe('updateGameForUser', () => {
    const baseGameModel = {
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
      rawgId: null,
      rawgSlug: null,
      coverPosition: null,
      forSale: false,
      salePrice: null,
      soldAt: null,
      soldPriceFinal: null,
      activeLoanId: null,
      activeLoanTo: null,
      activeLoanAt: null
    };

    it('guarda custom_image_url en user_games (no toca game_catalog.image_url)', async () => {
      const viewRecord = { id: 'some-uuid', game_catalog_id: 'cat-1', rawg_id: 58175 };
      const viewBuilder = makeBuilder({ data: viewRecord, error: null });
      const userGameUpdateBuilder = makeBuilder({ error: null });

      mockSupabase.from.mockReturnValueOnce(viewBuilder).mockReturnValueOnce(userGameUpdateBuilder);

      await repo.updateGameForUser('user-1', {
        ...baseGameModel,
        uuid: 'some-uuid',
        imageUrl: 'https://cdn.example.com/screenshot.jpg'
      });

      expect(userGameUpdateBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ custom_image_url: 'https://cdn.example.com/screenshot.jpg' })
      );
      // game_catalog should NOT have been touched (only 2 from() calls total)
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });

    it('lanza error cuando uuid es undefined', async () => {
      await expect(repo.updateGameForUser('user-1', baseGameModel)).rejects.toThrow('uuid is missing');
    });

    it('lanza error cuando el registro no se encuentra', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'Not found' } }));

      await expect(repo.updateGameForUser('user-1', { ...baseGameModel, uuid: 'some-uuid' })).rejects.toThrow(
        'Game record not found'
      );
    });

    it('actualiza el juego sin catalogEntry (sin rawg_id)', async () => {
      const viewRecord = { id: 'some-uuid', game_catalog_id: 'cat-1', rawg_id: null };
      const viewBuilder = makeBuilder({ data: viewRecord, error: null });
      const catalogUpdateBuilder = makeBuilder({ error: null });
      const userGameUpdateBuilder = makeBuilder({ error: null });

      mockSupabase.from
        .mockReturnValueOnce(viewBuilder)
        .mockReturnValueOnce(catalogUpdateBuilder)
        .mockReturnValueOnce(userGameUpdateBuilder);

      await repo.updateGameForUser('user-1', { ...baseGameModel, uuid: 'some-uuid' });

      expect(userGameUpdateBuilder.update).toHaveBeenCalled();
    });

    it('actualiza el juego sin catalogEntry (con rawg_id existente)', async () => {
      const viewRecord = { id: 'some-uuid', game_catalog_id: 'cat-1', rawg_id: 58175 };
      const viewBuilder = makeBuilder({ data: viewRecord, error: null });
      const userGameUpdateBuilder = makeBuilder({ error: null });

      mockSupabase.from.mockReturnValueOnce(viewBuilder).mockReturnValueOnce(userGameUpdateBuilder);

      await repo.updateGameForUser('user-1', { ...baseGameModel, uuid: 'some-uuid' });

      expect(userGameUpdateBuilder.update).toHaveBeenCalled();
    });

    it('actualiza el juego con catalogEntry (rawg)', async () => {
      const viewRecord = { id: 'some-uuid', game_catalog_id: 'cat-1', rawg_id: 58175 };
      const viewBuilder = makeBuilder({ data: viewRecord, error: null });
      const catalogLookupBuilder = makeBuilder({ data: { id: 'cat-1' }, error: null });
      const userGameUpdateBuilder = makeBuilder({ error: null });

      mockSupabase.from
        .mockReturnValueOnce(viewBuilder)
        .mockReturnValueOnce(catalogLookupBuilder)
        .mockReturnValueOnce(userGameUpdateBuilder);

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

      await repo.updateGameForUser('user-1', { ...baseGameModel, uuid: 'some-uuid' }, catalogEntry);

      expect(userGameUpdateBuilder.update).toHaveBeenCalled();
    });

    it('lanza error si el update falla', async () => {
      const viewRecord = { id: 'some-uuid', game_catalog_id: 'cat-1', rawg_id: null };
      const viewBuilder = makeBuilder({ data: viewRecord, error: null });
      const catalogUpdateBuilder = makeBuilder({ error: null });
      const userGameUpdateBuilder = makeBuilder({ error: { message: 'Update failed' } });

      mockSupabase.from
        .mockReturnValueOnce(viewBuilder)
        .mockReturnValueOnce(catalogUpdateBuilder)
        .mockReturnValueOnce(userGameUpdateBuilder);

      await expect(repo.updateGameForUser('user-1', { ...baseGameModel, uuid: 'some-uuid' })).rejects.toThrow(
        'Failed to update game'
      );
    });
  });

  describe('addGameForUser — catálogo manual (sin catalogEntry)', () => {
    const gameModel = {
      title: 'My Manual Game',
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
      coverPosition: null,
      forSale: false,
      salePrice: null,
      soldAt: null,
      soldPriceFinal: null,
      activeLoanId: null,
      activeLoanTo: null,
      activeLoanAt: null
    };

    it('crea un nuevo catálogo manual cuando no existe título igual', async () => {
      const catalogLookupBuilder = makeBuilder({ data: null, error: { message: 'Not found' } });
      const catalogInsertBuilder = makeBuilder({ data: { id: 'cat-new' }, error: null });
      const insertBuilder = makeBuilder({ error: null });

      mockSupabase.from
        .mockReturnValueOnce(catalogLookupBuilder)
        .mockReturnValueOnce(catalogInsertBuilder)
        .mockReturnValueOnce(insertBuilder);

      await repo.addGameForUser('user-1', gameModel);

      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', game_catalog_id: 'cat-new' })
      );
    });

    it('reutiliza catálogo manual existente cuando el título ya existe', async () => {
      const catalogLookupBuilder = makeBuilder({ data: { id: 'cat-existing' }, error: null });
      const insertBuilder = makeBuilder({ error: null });

      mockSupabase.from.mockReturnValueOnce(catalogLookupBuilder).mockReturnValueOnce(insertBuilder);

      await repo.addGameForUser('user-1', gameModel);

      expect(insertBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ game_catalog_id: 'cat-existing' }));
    });

    it('lanza error si el insert falla', async () => {
      const catalogLookupBuilder = makeBuilder({ data: { id: 'cat-1' }, error: null });
      const insertBuilder = makeBuilder({ error: { message: 'Insert failed' } });

      mockSupabase.from.mockReturnValueOnce(catalogLookupBuilder).mockReturnValueOnce(insertBuilder);

      await expect(repo.addGameForUser('user-1', gameModel)).rejects.toThrow('Failed to add game');
    });
  });

  describe('addGameForUser — catálogo rawg (con catalogEntry no existente)', () => {
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
      coverPosition: null,
      forSale: false,
      salePrice: null,
      soldAt: null,
      soldPriceFinal: null,
      activeLoanId: null,
      activeLoanTo: null,
      activeLoanAt: null
    };

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

    it('crea entrada de catálogo cuando no existe en RAWG', async () => {
      const catalogLookupBuilder = makeBuilder({ data: null, error: null });
      const catalogInsertBuilder = makeBuilder({ data: { id: 'cat-new-rawg' }, error: null });
      const insertBuilder = makeBuilder({ error: null });

      mockSupabase.from
        .mockReturnValueOnce(catalogLookupBuilder)
        .mockReturnValueOnce(catalogInsertBuilder)
        .mockReturnValueOnce(insertBuilder);

      await repo.addGameForUser('user-1', gameModel, catalogEntry);

      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', game_catalog_id: 'cat-new-rawg' })
      );
    });

    it('lanza error si el insert del catálogo falla', async () => {
      const catalogLookupBuilder = makeBuilder({ data: null, error: null });
      const catalogInsertBuilder = makeBuilder({ data: null, error: { message: 'Catalog insert failed' } });

      mockSupabase.from.mockReturnValueOnce(catalogLookupBuilder).mockReturnValueOnce(catalogInsertBuilder);

      await expect(repo.addGameForUser('user-1', gameModel, catalogEntry)).rejects.toThrow(
        'Failed to create game catalog'
      );
    });

    it('lanza error si el insert manual del catálogo falla', async () => {
      const catalogLookupBuilder = makeBuilder({ data: null, error: { message: 'Not found' } });
      const catalogInsertBuilder = makeBuilder({ data: null, error: { message: 'Manual catalog insert failed' } });

      mockSupabase.from.mockReturnValueOnce(catalogLookupBuilder).mockReturnValueOnce(catalogInsertBuilder);

      await expect(repo.addGameForUser('user-1', { ...gameModel, rawgId: null }, undefined)).rejects.toThrow(
        'Failed to create game catalog'
      );
    });
  });

  describe('getSoldGames', () => {
    const soldDto = {
      ...fullDto,
      sold_at: '2024-06-01',
      sold_price_final: 30,
      for_sale: false
    };

    it('devuelve los juegos vendidos mapeados', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [soldDto], error: null }));

      const result = await repo.getSoldGames('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].soldAt).toBe('2024-06-01');
    });

    it('lanza error si la consulta falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getSoldGames('user-1')).rejects.toThrow('Failed to fetch sold games');
    });

    it('devuelve [] cuando data es null sin error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: null }));

      const result = await repo.getSoldGames('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('updateSaleStatus', () => {
    it('llama a .update() con los campos de venta correctos', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: null }));

      await repo.updateSaleStatus('user-1', 'uuid-1', {
        forSale: false,
        salePrice: null,
        soldAt: '2024-06-01',
        soldPriceFinal: 28
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('user_games');
    });

    it('lanza error si la actualización falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Update error' } }));

      await expect(
        repo.updateSaleStatus('user-1', 'uuid-1', {
          forSale: false,
          salePrice: null,
          soldAt: null,
          soldPriceFinal: null
        })
      ).rejects.toThrow('Failed to update sale status');
    });
  });

  describe('createLoan', () => {
    it('inserta el préstamo y devuelve el UUID', async () => {
      const b = makeBuilder({ data: { id: 'loan-uuid' }, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.createLoan({ userGameId: 'game-uuid', loanedTo: 'Ana', loanedAt: '2024-06-01' });

      expect(result).toBe('loan-uuid');
      expect(mockSupabase.from).toHaveBeenCalledWith('game_loans');
    });

    it('lanza error si el insert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'Insert error' } }));

      await expect(
        repo.createLoan({ userGameId: 'game-uuid', loanedTo: 'Ana', loanedAt: '2024-06-01' })
      ).rejects.toThrow('Failed to create loan');
    });
  });

  describe('returnLoan', () => {
    it('actualiza returned_at en game_loans', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: null }));

      await repo.returnLoan('loan-uuid');

      expect(mockSupabase.from).toHaveBeenCalledWith('game_loans');
    });

    it('lanza error si la actualización falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Return error' } }));

      await expect(repo.returnLoan('loan-uuid')).rejects.toThrow('Failed to return loan');
    });
  });

  describe('getLoanHistory', () => {
    it('devuelve el historial de préstamos', async () => {
      const loanDto = {
        id: 'loan-1',
        user_game_id: 'game-uuid',
        loaned_to: 'Ana',
        loaned_at: '2024-06-01',
        returned_at: '2024-06-10',
        created_at: '2024-06-01T10:00:00Z'
      };
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [loanDto], error: null }));

      const result = await repo.getLoanHistory('game-uuid');

      expect(result).toHaveLength(1);
      expect(result[0].loaned_to).toBe('Ana');
    });

    it('lanza error si la consulta falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'History error' } }));

      await expect(repo.getLoanHistory('game-uuid')).rejects.toThrow('Failed to fetch loan history');
    });

    it('devuelve [] cuando data es null sin error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: null }));

      const result = await repo.getLoanHistory('game-uuid');

      expect(result).toEqual([]);
    });
  });
});
