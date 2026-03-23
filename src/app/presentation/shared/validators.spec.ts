import { describe, expect, it } from 'vitest';

import { selectOneValidator } from '@/shared/validators';

describe('selectOneValidator', () => {
  const allowed = ['PS5', 'PS4', 'SWITCH'] as const;
  const validator = selectOneValidator(allowed);

  it('devuelve null cuando el valor está en la lista permitida', () => {
    expect(validator({ value: 'PS5' })).toBeNull();
    expect(validator({ value: 'PS4' })).toBeNull();
    expect(validator({ value: 'SWITCH' })).toBeNull();
  });

  it('devuelve { invalidOption: true } cuando el valor no está en la lista', () => {
    expect(validator({ value: 'XBOX' as never })).toEqual({ invalidOption: true });
  });

  it('devuelve { invalidOption: true } para cadena vacía', () => {
    expect(validator({ value: '' as never })).toEqual({ invalidOption: true });
  });

  it('devuelve { invalidOption: true } para null', () => {
    expect(validator({ value: null as never })).toEqual({ invalidOption: true });
  });

  it('funciona con listas de un solo elemento', () => {
    const single = selectOneValidator(['only']);
    expect(single({ value: 'only' })).toBeNull();
    expect(single({ value: 'other' as never })).toEqual({ invalidOption: true });
  });

  it('funciona con lista vacía (ningún valor es válido)', () => {
    const empty = selectOneValidator([]);
    expect(empty({ value: 'anything' as never })).toEqual({ invalidOption: true });
  });
});
