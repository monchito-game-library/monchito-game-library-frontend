import { describe, expect, it } from 'vitest';

import { toCommandSlug } from './command-slug.util';

describe('toCommandSlug', () => {
  it('convierte nombre simple a minúsculas', () => {
    expect(toCommandSlug('Nintendo')).toBe('nintendo');
  });

  it('separa palabras con guion', () => {
    expect(toCommandSlug('Game Boy')).toBe('game-boy');
  });

  it('conserva dígitos', () => {
    expect(toCommandSlug('PlayStation 2')).toBe('playstation-2');
  });

  it('conserva dígitos con espacio', () => {
    expect(toCommandSlug('Nintendo 64')).toBe('nintendo-64');
  });

  it('normaliza acentos (é)', () => {
    expect(toCommandSlug('Pokémon Mini')).toBe('pokemon-mini');
  });

  it('normaliza acentos (ú)', () => {
    expect(toCommandSlug('Súper Nintendo')).toBe('super-nintendo');
  });

  it('colapsa barra inclinada a guion', () => {
    expect(toCommandSlug('Sega Mega Drive / Genesis')).toBe('sega-mega-drive-genesis');
  });

  it('elimina paréntesis', () => {
    expect(toCommandSlug('Atari 2600 (Heavy Sixer)')).toBe('atari-2600-heavy-sixer');
  });

  it('recorta y colapsa espacios múltiples', () => {
    expect(toCommandSlug('  Mega   Drive  ')).toBe('mega-drive');
  });

  it('devuelve cadena vacía para entrada vacía', () => {
    expect(toCommandSlug('')).toBe('');
  });

  it('devuelve cadena vacía para espacios en blanco', () => {
    expect(toCommandSlug('   ')).toBe('');
  });

  it('recorta guiones en los bordes', () => {
    expect(toCommandSlug('---hello---')).toBe('hello');
  });
});
