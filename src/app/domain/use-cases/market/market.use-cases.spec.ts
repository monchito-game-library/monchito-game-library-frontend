import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { MarketUseCasesImpl } from './market.use-cases';
import { MARKET_REPOSITORY } from '@/domain/repositories/market.repository.contract';
import { AvailableItemModel, SoldItemModel } from '@/models/market/market-item.model';

const mockRepo = {
  getAvailableItems: vi.fn(),
  getSoldItems: vi.fn()
};

const availableItem: AvailableItemModel = {
  id: 'item-1',
  userId: 'user-1',
  itemType: 'game',
  itemName: 'God of War',
  brandName: null,
  modelName: null,
  detailLeft: null,
  detailRight: null,
  salePrice: 39.99
};

const soldItem: SoldItemModel = {
  id: 'item-2',
  userId: 'user-1',
  itemType: 'console',
  itemName: 'PlayStation 5',
  brandName: 'Sony',
  modelName: null,
  detailLeft: null,
  detailRight: null,
  soldAt: '2024-01-15',
  soldPriceFinal: 350
};

describe('MarketUseCasesImpl', () => {
  let useCases: MarketUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: MARKET_REPOSITORY, useValue: mockRepo }, MarketUseCasesImpl]
    });
    useCases = TestBed.inject(MarketUseCasesImpl);
  });

  describe('getAvailableItems', () => {
    it('delega en el repositorio con el userId correcto', async () => {
      mockRepo.getAvailableItems.mockResolvedValue([availableItem]);

      const result = await useCases.getAvailableItems('user-1');

      expect(mockRepo.getAvailableItems).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([availableItem]);
    });

    it('devuelve array vacío cuando el repo devuelve vacío', async () => {
      mockRepo.getAvailableItems.mockResolvedValue([]);

      const result = await useCases.getAvailableItems('user-1');
      expect(result).toHaveLength(0);
    });
  });

  describe('getSoldItems', () => {
    it('delega en el repositorio con el userId correcto', async () => {
      mockRepo.getSoldItems.mockResolvedValue([soldItem]);

      const result = await useCases.getSoldItems('user-1');

      expect(mockRepo.getSoldItems).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([soldItem]);
    });

    it('devuelve array vacío cuando no hay historial', async () => {
      mockRepo.getSoldItems.mockResolvedValue([]);

      const result = await useCases.getSoldItems('user-1');
      expect(result).toHaveLength(0);
    });
  });
});
