import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { SaleComponent } from './sale.component';
import { MARKET_USE_CASES } from '@/domain/use-cases/market/market.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { AvailableItemModel, SoldItemModel } from '@/models/market/market-item.model';
import { mockSnackBar } from '@/testing/snack-bar.mock';
import { mockTransloco } from '@/testing/transloco.mock';

function makeAvailable(overrides: Partial<AvailableItemModel> = {}): AvailableItemModel {
  return {
    id: 'item-1',
    userId: 'user-1',
    itemType: 'game',
    itemName: 'God of War',
    brandName: null,
    modelName: null,
    salePrice: 39.99,
    ...overrides
  };
}

function makeSold(overrides: Partial<SoldItemModel> = {}): SoldItemModel {
  return {
    id: 'item-1',
    userId: 'user-1',
    itemType: 'game',
    itemName: 'Spider-Man',
    brandName: null,
    modelName: null,
    soldPriceFinal: 35,
    soldAt: '2024-01-15',
    ...overrides
  };
}

describe('SaleComponent', () => {
  let component: SaleComponent;

  const mockMarketUseCases = {
    getAvailableItems: vi.fn(),
    getSoldItems: vi.fn()
  };

  const mockUserContext = {
    userId: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserContext.userId.mockReturnValue('user-1');
    mockMarketUseCases.getAvailableItems.mockResolvedValue([]);
    mockMarketUseCases.getSoldItems.mockResolvedValue([]);

    TestBed.configureTestingModule({
      imports: [SaleComponent],
      providers: [
        { provide: MARKET_USE_CASES, useValue: mockMarketUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: TranslocoService, useValue: mockTransloco }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(SaleComponent, { set: { imports: [], template: '', providers: [] } });

    component = TestBed.createComponent(SaleComponent).componentInstance;
  });

  describe('valores iniciales', () => {
    it('activeTab es "available"', () => expect(component.activeTab()).toBe('available'));
    it('activeFilter es "all"', () => expect(component.activeFilter()).toBe('all'));
    it('loading es true', () => expect(component.loading()).toBe(true));
    it('availableItems es []', () => expect(component.availableItems()).toEqual([]));
    it('soldItems es []', () => expect(component.soldItems()).toEqual([]));
  });

  describe('setTab', () => {
    it('cambia activeTab a "history"', () => {
      component.setTab('history');
      expect(component.activeTab()).toBe('history');
    });

    it('resetea activeFilter a "all" al cambiar de tab', () => {
      component.activeFilter.set('game');
      component.setTab('history');
      expect(component.activeFilter()).toBe('all');
    });

    it('vuelve a "available"', () => {
      component.setTab('history');
      component.setTab('available');
      expect(component.activeTab()).toBe('available');
    });
  });

  describe('setFilter', () => {
    it('establece el filtro activo', () => {
      component.setFilter('console');
      expect(component.activeFilter()).toBe('console');
    });

    it('permite filtrar por "game"', () => {
      component.setFilter('game');
      expect(component.activeFilter()).toBe('game');
    });

    it('permite filtrar por "controller"', () => {
      component.setFilter('controller');
      expect(component.activeFilter()).toBe('controller');
    });

    it('permite volver a "all"', () => {
      component.setFilter('game');
      component.setFilter('all');
      expect(component.activeFilter()).toBe('all');
    });
  });

  describe('filteredAvailable', () => {
    beforeEach(() => {
      component.availableItems.set([
        makeAvailable({ id: 'a-1', itemType: 'game' }),
        makeAvailable({ id: 'a-2', itemType: 'console' }),
        makeAvailable({ id: 'a-3', itemType: 'controller' })
      ]);
    });

    it('con filtro "all" devuelve todos los elementos', () => {
      component.activeFilter.set('all');
      expect(component.filteredAvailable()).toHaveLength(3);
    });

    it('con filtro "game" devuelve solo juegos', () => {
      component.activeFilter.set('game');
      expect(component.filteredAvailable()).toHaveLength(1);
      expect(component.filteredAvailable()[0].itemType).toBe('game');
    });

    it('con filtro "console" devuelve solo consolas', () => {
      component.activeFilter.set('console');
      expect(component.filteredAvailable()).toHaveLength(1);
      expect(component.filteredAvailable()[0].itemType).toBe('console');
    });

    it('con filtro "controller" devuelve solo mandos', () => {
      component.activeFilter.set('controller');
      expect(component.filteredAvailable()).toHaveLength(1);
      expect(component.filteredAvailable()[0].itemType).toBe('controller');
    });
  });

  describe('filteredSold', () => {
    beforeEach(() => {
      component.soldItems.set([
        makeSold({ id: 's-1', itemType: 'game' }),
        makeSold({ id: 's-2', itemType: 'console' })
      ]);
    });

    it('con filtro "all" devuelve todos los vendidos', () => {
      component.activeFilter.set('all');
      expect(component.filteredSold()).toHaveLength(2);
    });

    it('con filtro "game" devuelve solo juegos vendidos', () => {
      component.activeFilter.set('game');
      expect(component.filteredSold()).toHaveLength(1);
      expect(component.filteredSold()[0].itemType).toBe('game');
    });
  });

  describe('totalAvailable', () => {
    it('devuelve 0 cuando no hay elementos', () => {
      component.availableItems.set([]);
      expect(component.totalAvailable()).toBe(0);
    });

    it('suma los precios de venta', () => {
      component.availableItems.set([makeAvailable({ salePrice: 30 }), makeAvailable({ id: 'a-2', salePrice: 20 })]);
      expect(component.totalAvailable()).toBe(50);
    });

    it('trata salePrice null como 0', () => {
      component.availableItems.set([makeAvailable({ salePrice: null }), makeAvailable({ id: 'a-2', salePrice: 15 })]);
      expect(component.totalAvailable()).toBe(15);
    });

    it('solo suma los elementos que pasan el filtro', () => {
      component.availableItems.set([
        makeAvailable({ id: 'a-1', itemType: 'game', salePrice: 30 }),
        makeAvailable({ id: 'a-2', itemType: 'console', salePrice: 200 })
      ]);
      component.activeFilter.set('game');
      expect(component.totalAvailable()).toBe(30);
    });
  });

  describe('totalSold', () => {
    it('devuelve 0 cuando no hay vendidos', () => {
      component.soldItems.set([]);
      expect(component.totalSold()).toBe(0);
    });

    it('suma los precios finales de venta', () => {
      component.soldItems.set([makeSold({ soldPriceFinal: 25 }), makeSold({ id: 's-2', soldPriceFinal: 40 })]);
      expect(component.totalSold()).toBe(65);
    });

    it('trata soldPriceFinal null como 0', () => {
      component.soldItems.set([makeSold({ soldPriceFinal: null }), makeSold({ id: 's-2', soldPriceFinal: 50 })]);
      expect(component.totalSold()).toBe(50);
    });
  });

  describe('typeKey', () => {
    it('devuelve la clave de traducción para game', () => {
      expect(component.typeKey('game')).toBe('salePage.type.game');
    });

    it('devuelve la clave de traducción para console', () => {
      expect(component.typeKey('console')).toBe('salePage.type.console');
    });

    it('devuelve la clave de traducción para controller', () => {
      expect(component.typeKey('controller')).toBe('salePage.type.controller');
    });
  });

  describe('typeIcon', () => {
    it('devuelve "sports_esports" para game', () => {
      expect(component.typeIcon('game')).toBe('sports_esports');
    });

    it('devuelve "tv" para console', () => {
      expect(component.typeIcon('console')).toBe('tv');
    });

    it('devuelve "gamepad" para controller', () => {
      expect(component.typeIcon('controller')).toBe('gamepad');
    });
  });

  describe('ngOnInit', () => {
    it('carga los datos y pone loading a false', async () => {
      const available = [makeAvailable()];
      const sold = [makeSold()];
      mockMarketUseCases.getAvailableItems.mockResolvedValue(available);
      mockMarketUseCases.getSoldItems.mockResolvedValue(sold);

      await component.ngOnInit();

      expect(component.availableItems()).toEqual(available);
      expect(component.soldItems()).toEqual(sold);
      expect(component.loading()).toBe(false);
    });

    it('no hace nada si no hay userId', async () => {
      mockUserContext.userId.mockReturnValue(null);

      await component.ngOnInit();

      expect(mockMarketUseCases.getAvailableItems).not.toHaveBeenCalled();
    });

    it('muestra snackbar y pone loading a false si falla la carga', async () => {
      mockMarketUseCases.getAvailableItems.mockRejectedValue(new Error('fail'));

      await component.ngOnInit();

      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });
  });
});
