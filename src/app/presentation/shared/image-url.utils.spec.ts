import { describe, expect, it } from 'vitest';

import { optimizeImageUrl } from '@/shared/image-url.utils';

const RAWG_ORIGINAL = 'https://media.rawg.io/media/games/foo/bar.jpg';
const RAWG_RESIZED = (w: number) => `https://media.rawg.io/media/resize/${w}/-/games/foo/bar.jpg`;

describe('optimizeImageUrl', () => {
  it('devuelve null cuando la url es null', () => {
    expect(optimizeImageUrl(null)).toBeNull();
  });

  it('devuelve null cuando la url es undefined', () => {
    expect(optimizeImageUrl(undefined)).toBeNull();
  });

  it('devuelve null cuando la url es cadena vacía', () => {
    expect(optimizeImageUrl('')).toBeNull();
  });

  it('transforma una URL de RAWG con el ancho por defecto (420)', () => {
    expect(optimizeImageUrl(RAWG_ORIGINAL)).toBe(RAWG_RESIZED(420));
  });

  it('transforma una URL de RAWG con un ancho personalizado', () => {
    expect(optimizeImageUrl(RAWG_ORIGINAL, 200)).toBe(RAWG_RESIZED(200));
  });

  it('no transforma una URL que ya contiene /resize/', () => {
    const already = RAWG_RESIZED(420);
    expect(optimizeImageUrl(already)).toBe(already);
  });

  it('no transforma una URL que ya contiene /crop/', () => {
    const cropped = 'https://media.rawg.io/media/crop/600/400/games/foo/bar.jpg';
    expect(optimizeImageUrl(cropped)).toBe(cropped);
  });

  it('no transforma URLs que no son de RAWG', () => {
    const external = 'https://example.com/image.jpg';
    expect(optimizeImageUrl(external)).toBe(external);
  });
});
