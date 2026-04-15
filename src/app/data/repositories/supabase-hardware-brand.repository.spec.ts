import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { SupabaseHardwareBrandRepository } from './supabase-hardware-brand.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'order', 'insert', 'update', 'delete', 'single']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const brandDto = { id: 'brand-1', name: 'Sony' };

describe('SupabaseHardwareBrandRepository', () => {
  let repo: SupabaseHardwareBrandRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseHardwareBrandRepository]
    });
    repo = TestBed.inject(SupabaseHardwareBrandRepository);
  });

  describe('getAll', () => {
    it('devuelve las marcas mapeadas', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [brandDto], error: null }));

      const result = await repo.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Sony');
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAll()).rejects.toThrow('Failed to fetch hardware brands: DB error');
    });
  });

  describe('getById', () => {
    it('devuelve la marca mapeada cuando existe', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: brandDto, error: null }));

      const result = await repo.getById('brand-1');

      expect(result?.id).toBe('brand-1');
      expect(result?.name).toBe('Sony');
    });

    it('devuelve undefined cuando no existe', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'not found' } }));

      const result = await repo.getById('brand-x');

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('inserta y devuelve la marca mapeada', async () => {
      const b = makeBuilder({ data: brandDto, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.create({ name: 'Sony' });

      expect(b.insert).toHaveBeenCalled();
      expect(result.name).toBe('Sony');
    });

    it('lanza error si insert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'insert failed' } }));

      await expect(repo.create({ name: 'Sony' })).rejects.toThrow('Failed to create hardware brand');
    });
  });

  describe('update', () => {
    it('actualiza y devuelve la marca mapeada', async () => {
      const b = makeBuilder({ data: { ...brandDto, name: 'Microsoft' }, error: null });
      mockSupabase.from.mockReturnValue(b);

      const result = await repo.update('brand-1', { name: 'Microsoft' });

      expect(b.update).toHaveBeenCalledWith({ name: 'Microsoft' });
      expect(result.name).toBe('Microsoft');
    });

    it('lanza error si el update falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'update failed' } }));

      await expect(repo.update('brand-1', { name: 'X' })).rejects.toThrow('Failed to update hardware brand');
    });
  });

  describe('delete', () => {
    it('llama a delete con el id correcto', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.delete('brand-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', 'brand-1');
    });

    it('lanza error si delete falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'delete failed' } }));

      await expect(repo.delete('brand-1')).rejects.toThrow('Failed to delete hardware brand');
    });
  });
});
