import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ auth: {} })
}));

vi.mock('@/env', () => ({
  environment: {
    supabase: { url: 'https://test.supabase.co', anonKey: 'test-key' }
  }
}));

import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient, SUPABASE_CLIENT } from './supabase.config';

describe('getSupabaseClient', () => {
  it('crea el cliente la primera vez y devuelve el singleton en llamadas sucesivas', () => {
    const client1 = getSupabaseClient();
    const client2 = getSupabaseClient();

    expect(createClient).toHaveBeenCalledOnce();
    expect(client1).toBe(client2);
  });

  it('la función lock del cliente llama a fn()', () => {
    const [, , options] = (createClient as ReturnType<typeof vi.fn>).mock.calls[0];
    const fn = vi.fn().mockResolvedValue(undefined);

    options.auth.lock('session-key', 1000, fn);

    expect(fn).toHaveBeenCalled();
  });
});

describe('SUPABASE_CLIENT token', () => {
  it('la factory del token resuelve al cliente Supabase', () => {
    TestBed.configureTestingModule({});
    const client = TestBed.inject(SUPABASE_CLIENT);

    expect(client).toBeTruthy();
  });
});
