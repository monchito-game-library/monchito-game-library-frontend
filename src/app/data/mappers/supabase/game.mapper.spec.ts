import { describe, expect, it } from 'vitest';

import { UserGameListDto } from '@/dtos/supabase/game-catalog.dto';
import { mapGameList } from '@/mappers/supabase/game.mapper';

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
