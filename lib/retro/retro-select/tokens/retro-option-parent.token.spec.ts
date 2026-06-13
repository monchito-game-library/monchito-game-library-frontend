import { describe, expect, it } from 'vitest';
import { RETRO_OPTION_PARENT } from './retro-option-parent.token';

describe('RETRO_OPTION_PARENT', () => {
  it('es un InjectionToken válido', () => {
    expect(RETRO_OPTION_PARENT).toBeTruthy();
    expect(String(RETRO_OPTION_PARENT)).toContain('RETRO_OPTION_PARENT');
  });
});
