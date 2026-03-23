import { describe, expect, it } from 'vitest';

import { WishlistFullDto } from '@/dtos/supabase/wishlist.dto';
import { WishlistItemFormValue } from '@/interfaces/forms/wishlist-item-form.interface';
import { mapWishlistItem, mapWishlistToInsertDto } from '@/mappers/supabase/wishlist.mapper';

const baseDto: WishlistFullDto = {
  id: 'wish-uuid-1',
  user_id: 'user-uuid-1',
  game_catalog_id: 'catalog-uuid-1',
  platform: 'PS5',
  desired_price: 49.99,
  priority: 4,
  notes: 'Esperando oferta',
  created_at: '2026-01-01T00:00:00Z',
  title: 'Spider-Man 2',
  slug: 'spider-man-2',
  image_url: 'https://example.com/spiderman2.jpg',
  rawg_id: 12345,
  released_date: '2023-10-20',
  rating: 4.5,
  platforms: ['PlayStation 5'],
  genres: ['Action', 'Adventure']
};

describe('mapWishlistItem', () => {
  it('mapea todos los campos correctamente', () => {
    const result = mapWishlistItem(baseDto);

    expect(result.id).toBe('wish-uuid-1');
    expect(result.userId).toBe('user-uuid-1');
    expect(result.gameCatalogId).toBe('catalog-uuid-1');
    expect(result.platform).toBe('PS5');
    expect(result.desiredPrice).toBe(49.99);
    expect(result.priority).toBe(4);
    expect(result.notes).toBe('Esperando oferta');
    expect(result.createdAt).toBe('2026-01-01T00:00:00Z');
    expect(result.title).toBe('Spider-Man 2');
    expect(result.slug).toBe('spider-man-2');
    expect(result.imageUrl).toBe('https://example.com/spiderman2.jpg');
    expect(result.rawgId).toBe(12345);
    expect(result.releasedDate).toBe('2023-10-20');
    expect(result.rating).toBe(4.5);
    expect(result.platforms).toEqual(['PlayStation 5']);
    expect(result.genres).toEqual(['Action', 'Adventure']);
  });

  it('reemplaza platform null por cadena vacía', () => {
    const result = mapWishlistItem({ ...baseDto, platform: null as unknown as string });
    expect(result.platform).toBe('');
  });

  it('mapea desired_price null a null', () => {
    expect(mapWishlistItem({ ...baseDto, desired_price: null }).desiredPrice).toBeNull();
  });

  it('mapea notes null a null', () => {
    expect(mapWishlistItem({ ...baseDto, notes: null }).notes).toBeNull();
  });

  it('reemplaza platforms null por array vacío', () => {
    const result = mapWishlistItem({ ...baseDto, platforms: null as unknown as string[] });
    expect(result.platforms).toEqual([]);
  });

  it('reemplaza genres null por array vacío', () => {
    const result = mapWishlistItem({ ...baseDto, genres: null as unknown as string[] });
    expect(result.genres).toEqual([]);
  });
});

describe('mapWishlistToInsertDto', () => {
  const formValue: WishlistItemFormValue = {
    platform: 'PS5',
    desiredPrice: 49.99,
    priority: 3,
    notes: 'Notas del formulario'
  };

  it('mapea todos los campos al DTO de inserción', () => {
    const result = mapWishlistToInsertDto('user-1', 'catalog-1', formValue);

    expect(result.user_id).toBe('user-1');
    expect(result.game_catalog_id).toBe('catalog-1');
    expect(result.platform).toBe('PS5');
    expect(result.desired_price).toBe(49.99);
    expect(result.priority).toBe(3);
    expect(result.notes).toBe('Notas del formulario');
  });

  it('reemplaza platform null por cadena vacía en el DTO', () => {
    const result = mapWishlistToInsertDto('u', 'c', { ...formValue, platform: null });
    expect(result.platform).toBe('');
  });
});
