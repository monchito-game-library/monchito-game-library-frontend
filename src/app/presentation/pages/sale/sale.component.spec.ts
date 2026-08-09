import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of, Subject } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { SaleComponent } from './sale.component';
import { MARKET_USE_CASES } from '@/domain/use-cases/market/market.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { RetroSnackbarService } from '@retro/retro-snackbar/services/retro-snackbar.service';
import { TranslocoService } from '@jsverse/transloco';
import { AvailableItemModel, SoldItemModel } from '@/models/market/market-item.model';
import { mockRouter } from '@/testing/router.mock';
import { mockRetroSnackbar } from '@retro/testing/retro-snackbar.mock';
import { mockTransloco } from '@/testing/transloco.mock';

function makeAvailable(overrides: Partial<AvailableItemModel> = {}): AvailableItemModel {
  return {
    id: 'item-1',
    userId: 'user-1',
    itemType: 'game',
    itemName: 'God of War',
    brandName: null,
    modelName: null,
    detailLeft: null,
    detailRight: null,
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
    detailLeft: null,
    detailRight: null,
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

  let routeUrl$: Subject<UrlSegment[]>;
  let mockActivatedRoute: { url: Subject<UrlSegment[]> };

  let bpState: { matches: boolean };
  const mockBreakpointObserver = {
    observe: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserContext.userId.mockReturnValue('user-1');
    mockMarketUseCases.getAvailableItems.mockResolvedValue([]);
    mockMarketUseCases.getSoldItems.mockResolvedValue([]);
    routeUrl$ = new Subject<UrlSegment[]>();
    mockActivatedRoute = { url: routeUrl$ };
    bpState = { matches: false };
    mockBreakpointObserver.observe.mockImplementation(() => of(bpState));

    TestBed.configureTestingModule({
      imports: [SaleComponent],
      providers: [
        { provide: MARKET_USE_CASES, useValue: mockMarketUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: RetroSnackbarService, useValue: mockRetroSnackbar },
        { provide: TranslocoService, useValue: mockTransloco },
        { provide: BreakpointObserver, useValue: mockBreakpointObserver }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(SaleComponent, { set: { imports: [], template: '', providers: [] } });

    component = TestBed.createComponent(SaleComponent).componentInstance;
  });

  describe('valores iniciales', () => {
    it('activeTab es "available"', () => expect(component.activeTab()).toBe('available'));
    it('selectedIndex es 0', () => expect(component.selectedIndex()).toBe(0));
    it('activeFilter es "all"', () => expect(component.activeFilter()).toBe('all'));
    it('searchTerm está vacío', () => expect(component.searchTerm()).toBe(''));
    it('loading es true', () => expect(component.loading()).toBe(true));
    it('availableItems es []', () => expect(component.availableItems()).toEqual([]));
    it('soldItems es []', () => expect(component.soldItems()).toEqual([]));
  });

  describe('activeTab reactivo desde ActivatedRoute', () => {
    it('cambia a "history" y actualiza selectedIndex cuando la URL emite history', () => {
      routeUrl$.next([new UrlSegment('sale', {}), new UrlSegment('history', {})]);

      expect(component.activeTab()).toBe('history');
      expect(component.selectedIndex()).toBe(1);
    });

    it('resetea activeFilter al cambiar de tab', () => {
      component.activeFilter.set('game');

      routeUrl$.next([new UrlSegment('history', {})]);

      expect(component.activeFilter()).toBe('all');
    });

    it('mantiene activeFilter cuando la URL conserva el mismo tab', () => {
      component.activeFilter.set('game');

      routeUrl$.next([new UrlSegment('available', {})]);

      expect(component.activeFilter()).toBe('game');
    });

    it('usa "available" cuando la URL no contiene un tab reconocido', () => {
      routeUrl$.next([]);

      expect(component.activeTab()).toBe('available');
    });
  });

  describe('setTab', () => {
    it('navega a la subruta history', () => {
      component.setTab('history');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sale', 'history']);
    });

    it('no navega cuando el tab solicitado ya está activo', () => {
      component.setTab('available');

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onTabIndexChange', () => {
    it('navega a available para el índice 0 desde history', () => {
      routeUrl$.next([new UrlSegment('history', {})]);

      component.onTabIndexChange(0);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sale', 'available']);
    });

    it('navega a history para cualquier índice distinto de 0', () => {
      component.onTabIndexChange(1);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/sale', 'history']);
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

  describe('búsqueda por nombre', () => {
    beforeEach(() => {
      component.availableItems.set([
        makeAvailable({ id: 'a-1', itemType: 'game', itemName: 'God of War' }),
        makeAvailable({ id: 'a-2', itemType: 'console', itemName: 'PlayStation 5' }),
        makeAvailable({ id: 'a-3', itemType: 'game', itemName: 'Spider-Man 2' })
      ]);
      component.soldItems.set([
        makeSold({ id: 's-1', itemName: 'The Last of Us' }),
        makeSold({ id: 's-2', itemName: 'Gran Turismo 7' })
      ]);
    });

    it('actualiza searchTerm mediante onSearchChange', () => {
      component.onSearchChange('God');

      expect(component.searchTerm()).toBe('God');
      expect(component.commandFlags()).toEqual(['search="God"']);
    });

    it('filtra disponibles ignorando mayúsculas y espacios externos', () => {
      component.onSearchChange('  GOD OF  ');

      expect(component.filteredByNameAvailable().map((item) => item.id)).toEqual(['a-1']);
    });

    it('combina la búsqueda con el filtro de tipo', () => {
      component.activeFilter.set('game');
      component.onSearchChange('play');

      expect(component.filteredByNameAvailable()).toEqual([]);
    });

    it('filtra vendidos por nombre', () => {
      component.onSearchChange('turismo');

      expect(component.filteredByNameSold().map((item) => item.id)).toEqual(['s-2']);
    });

    it('devuelve todos los elementos y ninguna flag con búsqueda vacía', () => {
      component.onSearchChange('   ');

      expect(component.filteredByNameAvailable()).toHaveLength(3);
      expect(component.filteredByNameSold()).toHaveLength(2);
      expect(component.commandFlags()).toEqual(['search="   "']);

      component.onSearchChange('');
      expect(component.commandFlags()).toEqual([]);
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

  describe('getDetailRight', () => {
    it('devuelve null si detailRight es null', () => {
      expect(component.getDetailRight(makeAvailable({ detailRight: null }))).toBeNull();
    });

    it('para juegos traduce la plataforma si existe en el catálogo', () => {
      const item = makeAvailable({ itemType: 'game', detailRight: 'PS5' });
      const result = component.getDetailRight(item);
      expect(mockTransloco.translate).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it('para juegos devuelve el valor raw si la plataforma no está en el catálogo', () => {
      const item = makeAvailable({ itemType: 'game', detailRight: 'UNKNOWN-PLATFORM' });
      expect(component.getDetailRight(item)).toBe('UNKNOWN-PLATFORM');
    });

    it('para consolas devuelve detailRight sin traducir', () => {
      const item = makeAvailable({ itemType: 'console', detailRight: 'Sony' });
      expect(component.getDetailRight(item)).toBe('Sony');
    });

    it('para mandos devuelve detailRight sin traducir', () => {
      const item = makeAvailable({ itemType: 'controller', detailRight: 'Microsoft' });
      expect(component.getDetailRight(item)).toBe('Microsoft');
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

  describe('onItemClick', () => {
    it('navega a /collection/games/:id para un juego', () => {
      component.onItemClick('game', 'abc-123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection', 'games', 'abc-123']);
    });

    it('navega a /collection/consoles/:id para una consola', () => {
      component.onItemClick('console', 'con-456');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection', 'consoles', 'con-456']);
    });

    it('navega a /collection/controllers/:id para un mando', () => {
      component.onItemClick('controller', 'ctrl-789');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection', 'controllers', 'ctrl-789']);
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

      expect(mockRetroSnackbar.open).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });
  });

  describe('isMobile (signal del componente, no el binding en template)', () => {
    it('isMobile() es false por defecto antes de ngOnInit', () => {
      expect(component.isMobile()).toBe(false);
    });

    it('isMobile() se actualiza a true cuando BreakpointObserver emite matches=true', async () => {
      bpState = { matches: true };
      await component.ngOnInit();

      expect(component.isMobile()).toBe(true);
    });

    it('isMobile() permanece false cuando BreakpointObserver emite matches=false', async () => {
      bpState = { matches: false };
      await component.ngOnInit();

      expect(component.isMobile()).toBe(false);
    });
  });
});
