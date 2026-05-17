import { describe, expect, it } from 'vitest';
import { LIB_OPTION_PARENT } from './lib-option-parent.token';

describe('LIB_OPTION_PARENT', () => {
  it('es un InjectionToken válido', () => {
    expect(LIB_OPTION_PARENT).toBeTruthy();
    expect(String(LIB_OPTION_PARENT)).toContain('LIB_OPTION_PARENT');
  });
});
