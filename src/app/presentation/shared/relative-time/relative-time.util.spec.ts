import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { formatRelativeTime } from './relative-time.util';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-29T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve cadena vacía para fechas inválidas', () => {
    expect(formatRelativeTime('not-a-date')).toBe('');
  });

  it('formatea segundos en español', () => {
    const date = new Date('2026-04-29T11:59:30Z');
    expect(formatRelativeTime(date, 'es')).toMatch(/segundo|momento|ahora/);
  });

  it('formatea minutos en español', () => {
    const date = new Date('2026-04-29T11:50:00Z');
    expect(formatRelativeTime(date, 'es')).toContain('minuto');
  });

  it('formatea horas en español', () => {
    const date = new Date('2026-04-29T08:00:00Z');
    expect(formatRelativeTime(date, 'es')).toContain('hora');
  });

  it('formatea días en español', () => {
    const date = new Date('2026-04-25T12:00:00Z');
    expect(formatRelativeTime(date, 'es')).toContain('día');
  });

  it('formatea meses en español', () => {
    const date = new Date('2026-01-29T12:00:00Z');
    expect(formatRelativeTime(date, 'es')).toContain('mes');
  });

  it('formatea años en español', () => {
    const date = new Date('2024-04-29T12:00:00Z');
    expect(formatRelativeTime(date, 'es')).toContain('año');
  });

  it('respeta el locale en inglés', () => {
    const date = new Date('2026-04-25T12:00:00Z');
    const result = formatRelativeTime(date, 'en');
    expect(result).toMatch(/day|days/);
  });
});
