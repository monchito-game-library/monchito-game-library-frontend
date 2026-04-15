import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { SupabaseMarketRepository } from './supabase-market.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'order']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

const availableDto = {
  item_type: 'game',
  id: 'item-uuid-1',
  user_id: 'user-1',
  item_name: 'God of War',
  brand_name: null,
  model_name: null,
  sale_price: 39.99
};

const soldDto = {
  item_type: 'console',
  id: 'item-uuid-2',
  user_id: 'user-1',
  item_name: 'PlayStation 5',
  brand_name: 'Sony',
  model_name: 'PS5 Disc Edition',
  sold_at: '2024-01-15',
  sold_price_final: 350
};

describe('SupabaseMarketRepository', () => {
  let repo: SupabaseMarketRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseMarketRepository]
    });
    repo = TestBed.inject(SupabaseMarketRepository);
  });

  describe('getAvailableItems', () => {
    it('devuelve los ítems disponibles mapeados correctamente', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [availableDto], error: null }));

      const result = await repo.getAvailableItems('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-uuid-1');
      expect(result[0].itemName).toBe('God of War');
      expect(result[0].salePrice).toBe(39.99);
      expect(result[0].itemType).toBe('game');
      expect(result[0].userId).toBe('user-1');
      expect(result[0].brandName).toBeNull();
    });

    it('devuelve array vacío si no hay ítems en venta', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [], error: null }));

      const result = await repo.getAvailableItems('user-1');
      expect(result).toHaveLength(0);
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getAvailableItems('user-1')).rejects.toThrow('Failed to fetch available items');
    });

    it('consulta la tabla available_items', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [], error: null }));

      await repo.getAvailableItems('user-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('available_items');
    });
  });

  describe('getSoldItems', () => {
    it('devuelve los ítems vendidos mapeados correctamente', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [soldDto], error: null }));

      const result = await repo.getSoldItems('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-uuid-2');
      expect(result[0].itemName).toBe('PlayStation 5');
      expect(result[0].soldPriceFinal).toBe(350);
      expect(result[0].itemType).toBe('console');
      expect(result[0].soldAt).toBe('2024-01-15');
      expect(result[0].brandName).toBe('Sony');
    });

    it('devuelve array vacío si no hay historial de ventas', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [], error: null }));

      const result = await repo.getSoldItems('user-1');
      expect(result).toHaveLength(0);
    });

    it('lanza error cuando Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'DB error' } }));

      await expect(repo.getSoldItems('user-1')).rejects.toThrow('Failed to fetch sold items');
    });

    it('consulta la tabla sold_items', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [], error: null }));

      await repo.getSoldItems('user-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('sold_items');
    });
  });
});
