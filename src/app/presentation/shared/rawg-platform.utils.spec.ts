import { describe, expect, it } from 'vitest';

import { mapRawgPlatformToCode } from './rawg-platform.utils';

describe('mapRawgPlatformToCode', () => {
  it('mapea "PlayStation 5" a PS5', () => {
    expect(mapRawgPlatformToCode('PlayStation 5')).toBe('PS5');
  });

  it('mapea "PS5" a PS5', () => {
    expect(mapRawgPlatformToCode('PS5')).toBe('PS5');
  });

  it('mapea "PlayStation 4" a PS4', () => {
    expect(mapRawgPlatformToCode('PlayStation 4')).toBe('PS4');
  });

  it('mapea "Nintendo Switch" a SWITCH', () => {
    expect(mapRawgPlatformToCode('Nintendo Switch')).toBe('SWITCH');
  });

  it('mapea "Switch" a SWITCH', () => {
    expect(mapRawgPlatformToCode('Switch')).toBe('SWITCH');
  });

  it('mapea "PS Vita" a PS-VITA', () => {
    expect(mapRawgPlatformToCode('PS Vita')).toBe('PS-VITA');
  });

  it('mapea "PlayStation Vita" a PS-VITA', () => {
    expect(mapRawgPlatformToCode('PlayStation Vita')).toBe('PS-VITA');
  });

  it('mapea "Xbox Series S/X" a XBOX-SERIES', () => {
    expect(mapRawgPlatformToCode('Xbox Series S/X')).toBe('XBOX-SERIES');
  });

  it('mapea "Xbox Series X" a XBOX-SERIES', () => {
    expect(mapRawgPlatformToCode('Xbox Series X')).toBe('XBOX-SERIES');
  });

  it('mapea "Nintendo 3DS" a 3DS', () => {
    expect(mapRawgPlatformToCode('Nintendo 3DS')).toBe('3DS');
  });

  it('mapea "PC" a PC', () => {
    expect(mapRawgPlatformToCode('PC')).toBe('PC');
  });

  it('devuelve null para nombres de plataforma desconocidos', () => {
    expect(mapRawgPlatformToCode('Atari 2600')).toBeNull();
    expect(mapRawgPlatformToCode('')).toBeNull();
    expect(mapRawgPlatformToCode('Desconocida')).toBeNull();
  });
});
