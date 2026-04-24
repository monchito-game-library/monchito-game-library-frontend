import { Component, NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { HardwareListBaseComponent } from './hardware-list-base.component';
import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import { mockRouter } from '@/testing/router.mock';
import { mockSnackBar } from '@/testing/snack-bar.mock';
import { mockUserContext } from '@/testing/user-context.mock';

interface TestItem {
  id: string;
  modelId: string | null;
  brandId: string | null;
  price: number | null;
}

function makeItem(overrides: Partial<TestItem> = {}): TestItem {
  return { id: 'item-1', modelId: 'model-1', brandId: 'brand-1', price: 100, ...overrides };
}

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'test-hardware-list', template: '', standalone: true })
class TestHardwareListComponent extends HardwareListBaseComponent<TestItem> {
  protected readonly _listRoute = '/test/add';
  protected readonly _detailRoute = '/test/detail';
  protected readonly _i18nLoadError = 'test.loadError';
  protected readonly _scrollOffsetSignal: WritableSignal<number> = signal<number>(0);

  readonly items: WritableSignal<TestItem[]> = signal<TestItem[]>([]);

  async ngOnInit(): Promise<void> {}
}

const mockStoreUseCases = { getAllStores: vi.fn() };
const mockBrandUseCases = { getAll: vi.fn() };
const mockModelUseCases = { getAllByType: vi.fn() };

describe('HardwareListBaseComponent', () => {
  let component: TestHardwareListComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [
        TestHardwareListComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { 'test.loadError': 'Load error', 'common.close': 'Close' } },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: STORE_USE_CASES, useValue: mockStoreUseCases },
        { provide: HARDWARE_BRAND_USE_CASES, useValue: mockBrandUseCases },
        { provide: HARDWARE_MODEL_USE_CASES, useValue: mockModelUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    component = TestBed.createComponent(TestHardwareListComponent).componentInstance;
  });

  describe('estado inicial', () => {
    it('searchQuery empieza en cadena vacía', () => {
      expect(component.searchQuery()).toBe('');
    });

    it('loading empieza en true', () => {
      expect(component.loading()).toBe(true);
    });

    it('GAME_CONDITION está definido', () => {
      expect(component.GAME_CONDITION).toBeDefined();
      expect(component.GAME_CONDITION).toEqual(GAME_CONDITION);
    });
  });

  describe('resolveStoreName', () => {
    it('devuelve cadena vacía cuando id es null', () => {
      expect(component.resolveStoreName(null)).toBe('');
    });

    it('devuelve el id como fallback cuando no se encuentra la tienda', () => {
      (component as any)._stores.set([]);
      expect(component.resolveStoreName('unknown-id')).toBe('unknown-id');
    });

    it('devuelve el label de la tienda cuando el id es conocido', () => {
      (component as any)._stores.set([{ id: 'store-1', label: 'My Store' }]);
      expect(component.resolveStoreName('store-1')).toBe('My Store');
    });
  });

  describe('resolveBrandName', () => {
    it('devuelve guión cuando id es null', () => {
      expect(component.resolveBrandName(null)).toBe('—');
    });

    it('devuelve guión cuando el id no coincide con ninguna marca', () => {
      (component as any)._brands.set([]);
      expect(component.resolveBrandName('unknown-id')).toBe('—');
    });

    it('devuelve el nombre de la marca cuando el id es conocido', () => {
      (component as any)._brands.set([{ id: 'brand-1', name: 'Nintendo' }]);
      expect(component.resolveBrandName('brand-1')).toBe('Nintendo');
    });
  });

  describe('resolveModelName', () => {
    it('devuelve guión cuando id es null', () => {
      expect(component.resolveModelName(null)).toBe('—');
    });

    it('devuelve guión cuando el id no coincide con ningún modelo', () => {
      (component as any)._hardwareModels.set([]);
      expect(component.resolveModelName('unknown-id')).toBe('—');
    });

    it('devuelve el nombre del modelo cuando el id es conocido', () => {
      (component as any)._hardwareModels.set([{ id: 'model-1', name: 'SNES' }]);
      expect(component.resolveModelName('model-1')).toBe('SNES');
    });
  });

  describe('onAdd', () => {
    it('navega a la ruta de añadir del componente concreto', () => {
      component.onAdd();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/add']);
    });
  });

  describe('filteredItems', () => {
    it('con query vacía devuelve todos los elementos', () => {
      const items = [makeItem({ id: 'i-1' }), makeItem({ id: 'i-2' })];
      component.items.set(items);
      component.searchQuery.set('');

      expect(component.filteredItems()).toEqual(items);
    });

    it('filtra por nombre del modelo', () => {
      const match = makeItem({ id: 'i-1', modelId: 'model-1', brandId: 'brand-1' });
      const noMatch = makeItem({ id: 'i-2', modelId: 'model-2', brandId: 'brand-2' });
      component.items.set([match, noMatch]);

      (component as any)._hardwareModels.set([
        { id: 'model-1', name: 'PlayStation 5' },
        { id: 'model-2', name: 'Xbox Series X' }
      ]);
      (component as any)._brands.set([
        { id: 'brand-1', name: 'Sony' },
        { id: 'brand-2', name: 'Microsoft' }
      ]);

      component.searchQuery.set('playstation');

      expect(component.filteredItems()).toEqual([match]);
    });

    it('filtra por nombre de marca', () => {
      const sony = makeItem({ id: 'i-1', brandId: 'brand-1', modelId: 'model-1' });
      const ms = makeItem({ id: 'i-2', brandId: 'brand-2', modelId: 'model-2' });
      component.items.set([sony, ms]);

      (component as any)._brands.set([
        { id: 'brand-1', name: 'Sony' },
        { id: 'brand-2', name: 'Microsoft' }
      ]);
      (component as any)._hardwareModels.set([
        { id: 'model-1', name: 'PlayStation 5' },
        { id: 'model-2', name: 'Xbox Series X' }
      ]);

      component.searchQuery.set('microsoft');

      expect(component.filteredItems()).toEqual([ms]);
    });

    it('la búsqueda es insensible a mayúsculas', () => {
      const item = makeItem({ id: 'i-1', modelId: 'model-1' });
      component.items.set([item]);
      (component as any)._hardwareModels.set([{ id: 'model-1', name: 'PlayStation 5' }]);
      (component as any)._brands.set([]);

      component.searchQuery.set('PLAYSTATION');

      expect(component.filteredItems()).toEqual([item]);
    });

    it('con query que no coincide devuelve lista vacía', () => {
      component.items.set([makeItem()]);
      (component as any)._hardwareModels.set([{ id: 'model-1', name: 'PlayStation 5' }]);
      (component as any)._brands.set([{ id: 'brand-1', name: 'Sony' }]);

      component.searchQuery.set('nintendo');

      expect(component.filteredItems()).toEqual([]);
    });

    it('usa cadena vacía como nombre de modelo cuando no se encuentra en el catálogo', () => {
      const itemUnknownModel = makeItem({ id: 'i-1', modelId: 'unknown-model', brandId: 'brand-1' });
      component.items.set([itemUnknownModel]);
      (component as any)._hardwareModels.set([]);
      (component as any)._brands.set([{ id: 'brand-1', name: 'Sony' }]);

      component.searchQuery.set('sony');

      expect(component.filteredItems()).toEqual([itemUnknownModel]);
    });
  });

  describe('totalSpent', () => {
    it('devuelve 0 cuando no hay elementos', () => {
      component.items.set([]);

      expect(component.totalSpent()).toBe(0);
    });

    it('suma los precios de los elementos filtrados', () => {
      component.items.set([makeItem({ price: 300 }), makeItem({ id: 'i-2', price: 150 })]);
      component.searchQuery.set('');

      expect(component.totalSpent()).toBe(450);
    });

    it('trata precio null como 0', () => {
      component.items.set([makeItem({ price: null }), makeItem({ id: 'i-2', price: 200 })]);
      component.searchQuery.set('');

      expect(component.totalSpent()).toBe(200);
    });

    it('solo suma los elementos que pasan el filtro', () => {
      const sony = makeItem({ id: 'i-1', price: 500, brandId: 'brand-1', modelId: 'model-1' });
      const ms = makeItem({ id: 'i-2', price: 400, brandId: 'brand-2', modelId: 'model-2' });
      component.items.set([sony, ms]);

      (component as any)._brands.set([
        { id: 'brand-1', name: 'Sony' },
        { id: 'brand-2', name: 'Microsoft' }
      ]);
      (component as any)._hardwareModels.set([
        { id: 'model-1', name: 'PlayStation 5' },
        { id: 'model-2', name: 'Xbox Series X' }
      ]);

      component.searchQuery.set('sony');

      expect(component.totalSpent()).toBe(500);
    });
  });

  describe('onDetail', () => {
    it('navega a la ruta de detalle con el id del elemento', () => {
      const item = makeItem({ id: 'item-abc' });

      component.onDetail(item);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/detail', 'item-abc']);
    });
  });

  describe('_loadItems', () => {
    it('carga los elementos y pone loading a false cuando la llamada tiene éxito', async () => {
      const items = [makeItem({ id: 'i-1' }), makeItem({ id: 'i-2' })];
      const loadFn = vi.fn().mockResolvedValue(items);

      await (component as any)._loadItems(loadFn);

      expect(component.items()).toEqual(items);
      expect(component.loading()).toBe(false);
    });

    it('muestra snackbar y pone loading a false cuando la llamada falla', async () => {
      const loadFn = vi.fn().mockRejectedValue(new Error('fail'));

      await (component as any)._loadItems(loadFn);

      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });

    it('pone loading a true antes de la llamada y false después', async () => {
      const states: boolean[] = [];
      let resolveLoad!: (value: TestItem[]) => void;
      const loadFn = vi.fn().mockReturnValue(
        new Promise<TestItem[]>((res) => {
          resolveLoad = res;
        })
      );

      const loadPromise = (component as any)._loadItems(loadFn);
      states.push(component.loading());

      resolveLoad([]);
      await loadPromise;
      states.push(component.loading());

      expect(states).toEqual([true, false]);
    });
  });

  describe('_loadCatalog', () => {
    it('establece marcas y modelos cuando la llamada tiene éxito', async () => {
      mockBrandUseCases.getAll.mockResolvedValue([{ id: 'b1', name: 'Nintendo' }]);
      mockModelUseCases.getAllByType.mockResolvedValue([{ id: 'm1', name: 'SNES' }]);

      await (component as any)._loadCatalog('console');

      expect(mockBrandUseCases.getAll).toHaveBeenCalled();
      expect(mockModelUseCases.getAllByType).toHaveBeenCalledWith('console');
      expect((component as any)._brands()).toHaveLength(1);
      expect((component as any)._brands()[0].name).toBe('Nintendo');
      expect((component as any)._hardwareModels()).toHaveLength(1);
      expect((component as any)._hardwareModels()[0].name).toBe('SNES');
    });

    it('mantiene marcas y modelos vacíos y no propaga la excepción cuando falla', async () => {
      mockBrandUseCases.getAll.mockRejectedValue(new Error('network error'));
      mockModelUseCases.getAllByType.mockRejectedValue(new Error('network error'));

      await expect((component as any)._loadCatalog('console')).resolves.toBeUndefined();

      expect((component as any)._brands()).toHaveLength(0);
      expect((component as any)._hardwareModels()).toHaveLength(0);
    });
  });

  describe('_loadStores', () => {
    it('establece las tiendas cuando la llamada tiene éxito', async () => {
      mockStoreUseCases.getAllStores.mockResolvedValue([{ id: 'store-1', label: 'GameStop' }]);

      await (component as any)._loadStores();

      expect(mockStoreUseCases.getAllStores).toHaveBeenCalled();
      expect((component as any)._stores()).toHaveLength(1);
      expect((component as any)._stores()[0].label).toBe('GameStop');
    });

    it('mantiene las tiendas vacías y no propaga la excepción cuando falla', async () => {
      mockStoreUseCases.getAllStores.mockRejectedValue(new Error('network error'));

      await expect((component as any)._loadStores()).resolves.toBeUndefined();

      expect((component as any)._stores()).toHaveLength(0);
    });
  });
});
