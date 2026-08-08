import { describe, expect, it } from 'vitest';

import { optimizeImageUrl } from '@/shared/image-url/image-url.utils';

const RAWG_ORIGINAL = 'https://media.rawg.io/media/games/foo/bar.jpg';
const RAWG_PROXIED_RESIZED = (w: number) => `/rawg-media/media/resize/${w}/-/games/foo/bar.jpg`;

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

  it('transforma una URL de RAWG con el ancho por defecto (420) y la pasa por el proxy', () => {
    expect(optimizeImageUrl(RAWG_ORIGINAL)).toBe(RAWG_PROXIED_RESIZED(420));
  });

  it('transforma una URL de RAWG con un ancho personalizado y la pasa por el proxy', () => {
    expect(optimizeImageUrl(RAWG_ORIGINAL, 200)).toBe(RAWG_PROXIED_RESIZED(200));
  });

  it('no redimensiona una URL que ya contiene /resize/ pero sí la pasa por el proxy', () => {
    const already = 'https://media.rawg.io/media/resize/420/-/games/foo/bar.jpg';
    expect(optimizeImageUrl(already)).toBe('/rawg-media/media/resize/420/-/games/foo/bar.jpg');
  });

  it('no redimensiona una URL que ya contiene /crop/ pero sí la pasa por el proxy', () => {
    const cropped = 'https://media.rawg.io/media/crop/600/400/games/foo/bar.jpg';
    expect(optimizeImageUrl(cropped)).toBe('/rawg-media/media/crop/600/400/games/foo/bar.jpg');
  });

  it('pasa por el proxy URLs de RAWG aunque no tengan path /media/', () => {
    const rawgOther = 'https://media.rawg.io/gow.jpg';
    expect(optimizeImageUrl(rawgOther)).toBe('/rawg-media/gow.jpg');
  });

  it('no transforma URLs que no son de RAWG', () => {
    const external = 'https://example.com/image.jpg';
    expect(optimizeImageUrl(external)).toBe(external);
  });
});
