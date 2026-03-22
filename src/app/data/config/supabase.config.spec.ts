import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';

import { getSupabaseClient, SUPABASE_CLIENT } from './supabase.config';

describe('getSupabaseClient', () => {
  it('devuelve un cliente Supabase válido', () => {
    const client = getSupabaseClient();
    expect(client).toBeTruthy();
    expect(client.auth).toBeDefined();
  });

  it('devuelve el mismo singleton en llamadas sucesivas', () => {
    const a = getSupabaseClient();
    const b = getSupabaseClient();
    expect(a).toBe(b);
  });
});

describe('SUPABASE_CLIENT token', () => {
  it('la factory del token resuelve al cliente Supabase', () => {
    TestBed.configureTestingModule({});
    const client = TestBed.inject(SUPABASE_CLIENT);
    expect(client).toBeTruthy();
    expect(client.auth).toBeDefined();
  });
});
