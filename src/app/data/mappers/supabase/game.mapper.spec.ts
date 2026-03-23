import { describe, expect, it } from 'vitest';

import { UserGameEditDto, UserGameFullDto, UserGameListDto } from '@/dtos/supabase/game-catalog.dto';
import { mapGame, mapGameEdit, mapGameList } from '@/mappers/supabase/game.mapper';

const baseDto: UserGameListDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'God of War',
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
  image_url: 'https://example.com/gow.jpg',
  cover_position: null
};

describe('mapGameList', () => {
  it('mapea todos los campos estándar correctamente', () => {
    const result = mapGameList(baseDto);

    expect(result.title).toBe('God of War');
    expect(result.price).toBe(59.99);
    expect(result.store).toBe('GAME');
    expect(result.platform).toBe('PS5');
    expect(result.platinum).toBe(false);
    expect(result.status).toBe('playing');
    expect(result.personalRating).toBe(9);
    expect(result.format).toBe('physical');
    expect(result.isFavorite).toBe(true);
    expect(result.imageUrl).toBe('https://example.com/gow.jpg');
    expect(result.coverPosition).toBeNull();
  });

  it('expone el uuid sin modificar', () => {
    expect(mapGameList(baseDto).uuid).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('genera un id numérico a partir del uuid', () => {
    const result = mapGameList(baseDto);

    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
  });

  it('prioriza user_notes sobre description', () => {
    const dto = { ...baseDto, description: 'desc catalogo', user_notes: 'nota personal' };

    expect(mapGameList(dto).description).toBe('nota personal');
  });

  it('usa description cuando user_notes es null', () => {
    const dto = { ...baseDto, description: 'desc catalogo', user_notes: null };

    expect(mapGameList(dto).description).toBe('desc catalogo');
  });

  it('devuelve cadena vacía cuando ambas notas son null', () => {
    const dto = { ...baseDto, description: null, user_notes: null };

    expect(mapGameList(dto).description).toBe('');
  });

  it('aplica backlog como status por defecto cuando el valor es null', () => {
    const dto = { ...baseDto, status: null as unknown as string };

    expect(mapGameList(dto).status).toBe('backlog');
  });

  it('mapea store null a null', () => {
    expect(mapGameList({ ...baseDto, store: null }).store).toBeNull();
  });

  it('mapea format null a null', () => {
    expect(mapGameList({ ...baseDto, format: null }).format).toBeNull();
  });

  it('mapea user_platform null a null', () => {
    expect(mapGameList({ ...baseDto, user_platform: null }).platform).toBeNull();
  });

  it('mapea personal_rating null a null', () => {
    expect(mapGameList({ ...baseDto, personal_rating: null }).personalRating).toBeNull();
  });

  it('mapea image_url null a undefined', () => {
    expect(mapGameList({ ...baseDto, image_url: null }).imageUrl).toBeUndefined();
  });
});

// ─────────────────────────── mapGame ───────────────────────────

const baseFullDto: UserGameFullDto = {
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
  description: 'catalog desc',
  user_notes: 'my note',
  is_favorite: true,
  cover_position: null,
  image_url: 'https://example.com/gow.jpg',
  rawg_id: 58175,
  released_date: '2018-04-20',
  rawg_rating: 4.42,
  metacritic_score: 94,
  esrb_rating: 'Mature',
  available_platforms: ['PS4', 'PS5'],
  genres: ['Action', 'Adventure'],
  source: 'rawg'
};

describe('mapGame', () => {
  it('mapea los campos estándar correctamente', () => {
    const result = mapGame(baseFullDto);

    expect(result.title).toBe('God of War');
    expect(result.price).toBe(59.99);
    expect(result.store).toBe('GAME');
    expect(result.platinum).toBe(false);
    expect(result.status).toBe('playing');
    expect(result.personalRating).toBe(9);
    expect(result.format).toBe('physical');
    expect(result.isFavorite).toBe(true);
    expect(result.imageUrl).toBe('https://example.com/gow.jpg');
  });

  it('prioriza user_platform sobre platform', () => {
    expect(mapGame(baseFullDto).platform).toBe('PS5');
  });

  it('usa platform cuando user_platform es null', () => {
    const dto = { ...baseFullDto, user_platform: null };

    expect(mapGame(dto).platform).toBe('PS4');
  });

  it('prioriza user_notes sobre description', () => {
    expect(mapGame(baseFullDto).description).toBe('my note');
  });

  it('usa description cuando user_notes es null', () => {
    const dto = { ...baseFullDto, user_notes: null };

    expect(mapGame(dto).description).toBe('catalog desc');
  });

  it('aplica condition new por defecto cuando es null', () => {
    const dto = { ...baseFullDto, condition: null };

    expect(mapGame(dto).condition).toBe('new');
  });

  it('expone rawgId y rawgSlug', () => {
    const result = mapGame(baseFullDto);

    expect(result.rawgId).toBe(58175);
    expect(result.rawgSlug).toBe('god-of-war');
  });

  it('mapea rawgId null a null', () => {
    expect(mapGame({ ...baseFullDto, rawg_id: null }).rawgId).toBeNull();
  });

  it('aplica backlog como status por defecto cuando es null', () => {
    const dto = { ...baseFullDto, status: null as unknown as 'backlog' };

    expect(mapGame(dto).status).toBe('backlog');
  });
});

// ─────────────────────────── mapGameEdit ───────────────────────────

const baseEditDto: UserGameEditDto = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  user_id: 'user-1',
  game_catalog_id: 'cat-1',
  title: 'God of War',
  slug: 'god-of-war',
  image_url: 'https://example.com/gow.jpg',
  rawg_id: 58175,
  price: 59.99,
  store: 'GAME',
  user_platform: 'PS5',
  condition: 'new',
  platinum: false,
  user_notes: 'my note',
  description: 'catalog desc',
  status: 'playing',
  personal_rating: 9,
  edition: null,
  format: 'physical',
  is_favorite: true,
  released_date: '2018-04-20',
  rawg_rating: 4.42,
  genres: ['Action', 'Adventure'],
  cover_position: null
};

describe('mapGameEdit', () => {
  it('mapea los campos estándar correctamente', () => {
    const result = mapGameEdit(baseEditDto);

    expect(result.title).toBe('God of War');
    expect(result.price).toBe(59.99);
    expect(result.store).toBe('GAME');
    expect(result.platinum).toBe(false);
    expect(result.status).toBe('playing');
    expect(result.personalRating).toBe(9);
    expect(result.format).toBe('physical');
    expect(result.isFavorite).toBe(true);
    expect(result.imageUrl).toBe('https://example.com/gow.jpg');
  });

  it('usa user_platform como platform', () => {
    expect(mapGameEdit(baseEditDto).platform).toBe('PS5');
  });

  it('mapea user_platform null a null', () => {
    expect(mapGameEdit({ ...baseEditDto, user_platform: null }).platform).toBeNull();
  });

  it('prioriza user_notes sobre description', () => {
    expect(mapGameEdit(baseEditDto).description).toBe('my note');
  });

  it('expone releasedDate, rawgRating y genres', () => {
    const result = mapGameEdit(baseEditDto);

    expect(result.releasedDate).toBe('2018-04-20');
    expect(result.rawgRating).toBe(4.42);
    expect(result.genres).toEqual(['Action', 'Adventure']);
  });

  it('expone rawgSlug', () => {
    expect(mapGameEdit(baseEditDto).rawgSlug).toBe('god-of-war');
  });

  it('mapea coverPosition null a null', () => {
    expect(mapGameEdit(baseEditDto).coverPosition).toBeNull();
  });
});
