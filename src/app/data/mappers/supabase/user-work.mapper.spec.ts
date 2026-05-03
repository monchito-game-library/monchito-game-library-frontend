import { describe, expect, it } from 'vitest';

import { UserWorkDto } from '@/dtos/supabase/user-work.dto';
import { GameModel } from '@/models/game/game.model';
import { mapGameToWorkInsertDto, mapUserWork } from '@/mappers/supabase/user-work.mapper';

describe('mapUserWork', () => {
  it('mapea todos los campos correctamente', () => {
    const dto: UserWorkDto = {
      id: 'work-uuid-1',
      user_id: 'user-1',
      game_catalog_id: 'catalog-1',
      platform: 'PS5',
      status: 'playing',
      personal_rating: 8.5,
      is_favorite: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z'
    };

    expect(mapUserWork(dto)).toEqual({
      uuid: 'work-uuid-1',
      userId: 'user-1',
      gameCatalogId: 'catalog-1',
      platform: 'PS5',
      status: 'playing',
      personalRating: 8.5,
      isFavorite: true
    });
  });

  it('aplica defaults razonables cuando faltan campos opcionales', () => {
    const dto: UserWorkDto = {
      user_id: 'user-2',
      game_catalog_id: 'catalog-2',
      platform: '',
      status: 'backlog',
      personal_rating: null,
      is_favorite: false
    };

    const result = mapUserWork(dto);

    expect(result.uuid).toBe('');
    expect(result.platform).toBe('');
    expect(result.personalRating).toBeNull();
    expect(result.isFavorite).toBe(false);
  });

  it('aplica fallbacks cuando platform / status / is_favorite vienen como null o undefined', () => {
    // Caso defensivo: aunque la BD declara estas columnas como NOT NULL, el
    // mapper aplica ?? por seguridad para soportar fixtures parciales.
    const dto = {
      id: 'work-fallbacks',
      user_id: 'user-x',
      game_catalog_id: 'catalog-x',
      platform: null,
      status: null,
      personal_rating: null,
      is_favorite: null
    } as unknown as UserWorkDto;

    const result = mapUserWork(dto);

    expect(result.platform).toBeNull();
    expect(result.status).toBe('backlog');
    expect(result.isFavorite).toBe(false);
  });

  it('no expone created_at ni updated_at en el modelo', () => {
    const dto: UserWorkDto = {
      id: 'work-uuid-3',
      user_id: 'user-3',
      game_catalog_id: 'catalog-3',
      platform: 'PC',
      status: 'completed',
      personal_rating: 9,
      is_favorite: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z'
    };

    const result = mapUserWork(dto);

    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
  });
});

describe('mapGameToWorkInsertDto', () => {
  function buildGameModel(overrides: Partial<GameModel> = {}): GameModel {
    return {
      title: 'Test Game',
      price: 60,
      store: null,
      condition: 'new',
      description: '',
      platform: 'PS5',
      status: 'playing',
      personalRating: 7,
      edition: null,
      format: 'physical',
      isFavorite: false,
      forSale: false,
      salePrice: null,
      soldAt: null,
      soldPriceFinal: null,
      activeLoanId: null,
      activeLoanTo: null,
      activeLoanAt: null,
      ...overrides
    };
  }

  it('extrae solo los campos de obra del GameModel', () => {
    const model = buildGameModel({
      platform: 'PS4',
      status: 'platinum',
      personalRating: 10,
      isFavorite: true
    });

    expect(mapGameToWorkInsertDto(model)).toEqual({
      platform: 'PS4',
      status: 'platinum',
      personal_rating: 10,
      is_favorite: true
    });
  });

  it('no incluye campos de copia (price, store, format, edition, etc.)', () => {
    const dto = mapGameToWorkInsertDto(buildGameModel());

    expect(dto).not.toHaveProperty('price');
    expect(dto).not.toHaveProperty('store');
    expect(dto).not.toHaveProperty('format');
    expect(dto).not.toHaveProperty('edition');
    expect(dto).not.toHaveProperty('condition');
    expect(dto).not.toHaveProperty('description');
    expect(dto).not.toHaveProperty('cover_position');
    expect(dto).not.toHaveProperty('for_sale');
  });

  it('preserva personalRating null y isFavorite false', () => {
    const model = buildGameModel({
      personalRating: null,
      isFavorite: false
    });
    const dto = mapGameToWorkInsertDto(model);

    expect(dto.personal_rating).toBeNull();
    expect(dto.is_favorite).toBe(false);
  });

  it('omite el campo platform cuando el modelo lo trae como null', () => {
    // user_works.platform es NOT NULL: para un UPDATE parcial (cuando el modelo
    // no incluye platform) no se debe enviar el campo en absoluto.
    const dto = mapGameToWorkInsertDto(buildGameModel({ platform: null }));

    expect(dto).not.toHaveProperty('platform');
  });

  it('incluye platform cuando el modelo lo trae con valor', () => {
    expect(mapGameToWorkInsertDto(buildGameModel({ platform: 'PS4' })).platform).toBe('PS4');
  });
});
