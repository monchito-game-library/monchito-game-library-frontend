import { describe, expect, it } from 'vitest';

import { ratingStepValidator, selectOneValidator, validDateValidator } from '@/shared/validators/validators';

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

describe('validDateValidator', () => {
  it('devuelve null para una fecha válida', () => {
    expect(validDateValidator({ value: '2024-06-01' })).toBeNull();
  });

  it('devuelve null cuando el valor es null', () => {
    expect(validDateValidator({ value: null })).toBeNull();
  });

  it('devuelve null cuando el valor es undefined', () => {
    expect(validDateValidator({ value: undefined })).toBeNull();
  });

  it('devuelve null cuando el valor es cadena vacía', () => {
    expect(validDateValidator({ value: '' })).toBeNull();
  });

  it('devuelve { invalidDate: true } para una cadena que no es fecha', () => {
    expect(validDateValidator({ value: 'not-a-date' })).toEqual({ invalidDate: true });
  });

  it('devuelve { invalidDate: true } para una fecha imposible', () => {
    expect(validDateValidator({ value: '2024-13-99' })).toEqual({ invalidDate: true });
  });

  it('devuelve { invalidDate: true } para año con menos de 4 dígitos', () => {
    expect(validDateValidator({ value: '0024-06-01' })).toEqual({ invalidDate: true });
  });

  it('devuelve { invalidDate: true } para año 0', () => {
    expect(validDateValidator({ value: '0000-01-01' })).toEqual({ invalidDate: true });
  });

  it('devuelve null para el límite superior del año válido (9999)', () => {
    expect(validDateValidator({ value: '9999-12-31' })).toBeNull();
  });
});

describe('ratingStepValidator', () => {
  it('devuelve null para un entero', () => {
    expect(ratingStepValidator({ value: 8 })).toBeNull();
  });

  it('devuelve null para un decimal de un dígito', () => {
    expect(ratingStepValidator({ value: 7.5 })).toBeNull();
  });

  it('devuelve null para 0', () => {
    expect(ratingStepValidator({ value: 0 })).toBeNull();
  });

  it('devuelve null para 10', () => {
    expect(ratingStepValidator({ value: 10 })).toBeNull();
  });

  it('devuelve null cuando el valor es null', () => {
    expect(ratingStepValidator({ value: null })).toBeNull();
  });

  it('devuelve { invalidStep: true } para dos decimales', () => {
    expect(ratingStepValidator({ value: 2.95 })).toEqual({ invalidStep: true });
  });

  it('devuelve { invalidStep: true } para tres decimales', () => {
    expect(ratingStepValidator({ value: 7.123 })).toEqual({ invalidStep: true });
  });
});
