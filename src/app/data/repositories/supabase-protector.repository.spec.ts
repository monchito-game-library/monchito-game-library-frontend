import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabaseProtectorRepository } from './supabase-protector.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of [
    'select',
    'eq',
    'order',
    'range',
    'ilike',
    'limit',
    'insert',
    'update',
    'delete',
    'upsert',
    'single'
  ]) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const protectorDto = {
  id: 'p-1',
  name: 'BluRay 50',
  packs: [{ quantity: 25, price: 12.99, url: null }],
  category: 'box',
  notes: null,
  is_active: true
};

describe('SupabaseProtectorRepository', () => {
  let repo: SupabaseProtectorRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseProtectorRepository]
    });
    repo = TestBed.inject(SupabaseProtectorRepository);
  });

  describe('getAll', () => {
    it('devuelve todos los protectores mapeados', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [protectorDto], error: null }));

      const result = await repo.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('BluRay 50');
      expect(result[0].isActive).toBe(true);
    });

    it('no añade filtro eq cuando onlyActive no se pasa', async () => {
      const b = makeBuilder({ data: [], error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.getAll();

      expect(b.eq).not.toHaveBeenCalledWith('is_active', true);
    });

    it('añade filtro eq(is_active, true) cuando onlyActive=true', async () => {
      const b = makeBuilder({ data: [], error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.getAll(true);

      expect(b.eq).toHaveBeenCalledWith('is_active', true);
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAll()).rejects.toThrow('Failed to fetch protectors');
    });
  });

  describe('create', () => {
    it('inserta y devuelve el protector mapeado', async () => {
      const b = makeBuilder({ data: protectorDto, error: null });
      mockSupabase.from.mockReturnValue(b);
      const input = { name: 'BluRay 50', packs: [], category: 'box' as const, notes: null, isActive: true };

      const result = await repo.create(input);

      expect(b.insert).toHaveBeenCalled();
      expect(result.name).toBe('BluRay 50');
    });

    it('lanza error si el insert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Insert failed' } }));
      const input = { name: 'BluRay 50', packs: [], category: 'box' as const, notes: null, isActive: true };

      await expect(repo.create(input)).rejects.toThrow('Failed to create protector');
    });
  });

  describe('update', () => {
    it('actualiza los campos del protector', async () => {
      const b = makeBuilder({ data: { ...protectorDto, name: 'New Name' }, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.update('p-1', { name: 'New Name' });

      expect(b.update).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', 'p-1');
      expect(result.name).toBe('New Name');
    });

    it('actualiza todos los campos del patch', async () => {
      const b = makeBuilder({ data: { ...protectorDto, name: 'X', is_active: false }, error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.update('p-1', {
        name: 'X',
        packs: [{ quantity: 10, price: 5.99, url: null }],
        category: 'other' as const,
        notes: 'test note',
        isActive: false
      });

      expect(b.update).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'X', is_active: false, notes: 'test note' })
      );
    });

    it('cubre rama false de name cuando el patch no incluye name', async () => {
      const b = makeBuilder({ data: protectorDto, error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.update('p-1', { packs: [{ quantity: 10, price: 5.99, url: null }] });

      expect(b.update).toHaveBeenCalledWith(expect.not.objectContaining({ name: expect.anything() }));
    });

    it('cubre rama ?? null de notes cuando notes es null', async () => {
      const b = makeBuilder({ data: protectorDto, error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.update('p-1', { notes: null });

      expect(b.update).toHaveBeenCalledWith(expect.objectContaining({ notes: null }));
    });

    it('lanza error si el update falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Update failed' } }));

      await expect(repo.update('p-1', { name: 'X' })).rejects.toThrow('Failed to update protector');
    });
  });

  describe('toggleActive', () => {
    it('actualiza is_active y devuelve el protector actualizado', async () => {
      const b = makeBuilder({ data: { ...protectorDto, is_active: false }, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.toggleActive('p-1', false);

      expect(b.update).toHaveBeenCalledWith({ is_active: false });
      expect(result.isActive).toBe(false);
    });

    it('lanza error si el toggle falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'Toggle failed' } }));

      await expect(repo.toggleActive('p-1', true)).rejects.toThrow('Failed to toggle protector active state');
    });
  });
});
