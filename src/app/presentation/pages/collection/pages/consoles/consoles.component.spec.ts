import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ConsolesComponent } from './consoles.component';
import { CONSOLE_USE_CASES } from '@/domain/use-cases/console/console.use-cases.contract';
import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { ConsoleModel } from '@/models/console/console.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { StoreModel } from '@/models/store/store.model';

function makeConsole(overrides: Partial<ConsoleModel> = {}): ConsoleModel {
  return {
    id: 'console-1',
    userId: 'user-1',
    brandId: 'brand-1',
    modelId: 'model-1',
    editionId: null,
    region: null,
    condition: 'used',
    price: 300,
    store: null,
    purchaseDate: '2023-01-01',
    notes: null,
    createdAt: '2023-01-01T00:00:00Z',
    forSale: false,
    salePrice: null,
    soldAt: null,
    soldPriceFinal: null,
    activeLoanId: null,
    activeLoanTo: null,
    activeLoanAt: null,
    ...overrides
  };
}

function makeBrand(overrides: Partial<HardwareBrandModel> = {}): HardwareBrandModel {
  return { id: 'brand-1', name: 'Sony', ...overrides };
}

function makeHardwareModel(overrides: Partial<HardwareModelModel> = {}): HardwareModelModel {
  return {
    id: 'model-1',
    brandId: 'brand-1',
    name: 'PlayStation 5',
    type: 'console',
    generation: 9,
    ...overrides
  };
}

function makeStore(overrides: Partial<StoreModel> = {}): StoreModel {
  return { id: 'store-1', label: 'Media Markt', formatHint: null, ...overrides };
}

describe('ConsolesComponent', () => {
  let component: ConsolesComponent;
  let fixture: ComponentFixture<ConsolesComponent>;

  const mockConsoleUseCases = {
    getAllForUser: vi.fn()
  };

  const mockStoreUseCases = {
    getAllStores: vi.fn()
  };

  const mockBrandUseCases = {
    getAll: vi.fn()
  };

  const mockModelUseCases = {
    getAllByType: vi.fn()
  };

  const mockUserContext = {
    requireUserId: vi.fn()
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockSnackBar = {
    open: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserContext.requireUserId.mockReturnValue('user-1');
    mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
    mockStoreUseCases.getAllStores.mockResolvedValue([]);
    mockBrandUseCases.getAll.mockResolvedValue([]);
    mockModelUseCases.getAllByType.mockResolvedValue([]);

    TestBed.configureTestingModule({
      imports: [
        ConsolesComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: CONSOLE_USE_CASES, useValue: mockConsoleUseCases },
        { provide: STORE_USE_CASES, useValue: mockStoreUseCases },
        { provide: HARDWARE_BRAND_USE_CASES, useValue: mockBrandUseCases },
        { provide: HARDWARE_MODEL_USE_CASES, useValue: mockModelUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ConsolesComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('consoles es []', () => {
      expect(component.consoles()).toEqual([]);
    });
  });

  describe('filteredConsoles', () => {
    it('con query vacía devuelve todas las consolas', () => {
      const consoles = [makeConsole({ id: 'c-1' }), makeConsole({ id: 'c-2' })];
      component.consoles.set(consoles);
      component.searchQuery.set('');

      expect(component.filteredConsoles()).toEqual(consoles);
    });

    it('con query filtra por nombre del modelo', () => {
      const matchingConsole = makeConsole({ id: 'c-1', modelId: 'model-1', brandId: 'brand-1' });
      const otherConsole = makeConsole({ id: 'c-2', modelId: 'model-2', brandId: 'brand-2' });
      component.consoles.set([matchingConsole, otherConsole]);

      (component as any)._hardwareModels.set([
        makeHardwareModel({ id: 'model-1', name: 'PlayStation 5' }),
        makeHardwareModel({ id: 'model-2', name: 'Xbox Series X' })
      ]);
      (component as any)._brands.set([
        makeBrand({ id: 'brand-1', name: 'Sony' }),
        makeBrand({ id: 'brand-2', name: 'Microsoft' })
      ]);

      component.searchQuery.set('playstation');

      expect(component.filteredConsoles()).toEqual([matchingConsole]);
    });

    it('con query filtra por nombre de marca', () => {
      const sonyConsole = makeConsole({ id: 'c-1', brandId: 'brand-1', modelId: 'model-1' });
      const msConsole = makeConsole({ id: 'c-2', brandId: 'brand-2', modelId: 'model-2' });
      component.consoles.set([sonyConsole, msConsole]);

      (component as any)._brands.set([
        makeBrand({ id: 'brand-1', name: 'Sony' }),
        makeBrand({ id: 'brand-2', name: 'Microsoft' })
      ]);
      (component as any)._hardwareModels.set([
        makeHardwareModel({ id: 'model-1', brandId: 'brand-1', name: 'PlayStation 5' }),
        makeHardwareModel({ id: 'model-2', brandId: 'brand-2', name: 'Xbox Series X' })
      ]);

      component.searchQuery.set('microsoft');

      expect(component.filteredConsoles()).toEqual([msConsole]);
    });

    it('la búsqueda es insensible a mayúsculas', () => {
      const console1 = makeConsole({ id: 'c-1', modelId: 'model-1' });
      component.consoles.set([console1]);
      (component as any)._hardwareModels.set([makeHardwareModel({ id: 'model-1', name: 'PlayStation 5' })]);
      (component as any)._brands.set([]);

      component.searchQuery.set('PLAYSTATION');

      expect(component.filteredConsoles()).toEqual([console1]);
    });

    it('con query que no coincide devuelve lista vacía', () => {
      component.consoles.set([makeConsole()]);
      (component as any)._hardwareModels.set([makeHardwareModel({ name: 'PlayStation 5' })]);
      (component as any)._brands.set([makeBrand({ name: 'Sony' })]);

      component.searchQuery.set('nintendo');

      expect(component.filteredConsoles()).toEqual([]);
    });

    it('usa cadena vacía como nombre de modelo cuando el modelo no se encuentra en el catálogo', () => {
      const consoleWithUnknownModel = makeConsole({ id: 'c-1', modelId: 'unknown-model', brandId: 'brand-1' });
      component.consoles.set([consoleWithUnknownModel]);
      (component as any)._hardwareModels.set([]);
      (component as any)._brands.set([makeBrand({ id: 'brand-1', name: 'Sony' })]);

      component.searchQuery.set('sony');

      expect(component.filteredConsoles()).toEqual([consoleWithUnknownModel]);
    });
  });

  describe('totalSpent', () => {
    it('devuelve 0 cuando no hay consolas', () => {
      component.consoles.set([]);

      expect(component.totalSpent()).toBe(0);
    });

    it('suma los precios de las consolas filtradas', () => {
      component.consoles.set([makeConsole({ price: 300 }), makeConsole({ id: 'c-2', price: 150 })]);
      component.searchQuery.set('');

      expect(component.totalSpent()).toBe(450);
    });

    it('trata precio null como 0', () => {
      component.consoles.set([makeConsole({ price: null }), makeConsole({ id: 'c-2', price: 200 })]);
      component.searchQuery.set('');

      expect(component.totalSpent()).toBe(200);
    });

    it('solo suma las consolas que pasan el filtro', () => {
      const sony = makeConsole({ id: 'c-1', price: 500, brandId: 'brand-1', modelId: 'model-1' });
      const ms = makeConsole({ id: 'c-2', price: 400, brandId: 'brand-2', modelId: 'model-2' });
      component.consoles.set([sony, ms]);
      (component as any)._brands.set([
        makeBrand({ id: 'brand-1', name: 'Sony' }),
        makeBrand({ id: 'brand-2', name: 'Microsoft' })
      ]);
      (component as any)._hardwareModels.set([
        makeHardwareModel({ id: 'model-1', brandId: 'brand-1', name: 'PlayStation 5' }),
        makeHardwareModel({ id: 'model-2', brandId: 'brand-2', name: 'Xbox Series X' })
      ]);

      component.searchQuery.set('sony');

      expect(component.totalSpent()).toBe(500);
    });
  });

  describe('onDetail()', () => {
    it('navega a /collection/consoles/:id', () => {
      const console1 = makeConsole({ id: 'console-abc' });

      component.onDetail(console1);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection/consoles', 'console-abc']);
    });
  });

  describe('ngOnInit', () => {
    it('carga consolas, tiendas y catálogo y pone loading a false', async () => {
      mockConsoleUseCases.getAllForUser.mockResolvedValue([makeConsole()]);
      mockStoreUseCases.getAllStores.mockResolvedValue([makeStore()]);
      mockBrandUseCases.getAll.mockResolvedValue([makeBrand()]);
      mockModelUseCases.getAllByType.mockResolvedValue([makeHardwareModel()]);

      await component.ngOnInit();

      expect(component.consoles()).toHaveLength(1);
      expect(component.loading()).toBe(false);
    });

    it('muestra snackbar y mantiene loading en false si _loadConsoles falla', async () => {
      mockConsoleUseCases.getAllForUser.mockRejectedValue(new Error('fail'));

      await component.ngOnInit();

      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });

    it('continúa aunque _loadStores falle (fallo silencioso)', async () => {
      mockStoreUseCases.getAllStores.mockRejectedValue(new Error('store error'));

      await expect(component.ngOnInit()).resolves.not.toThrow();
      expect(component.loading()).toBe(false);
    });

    it('continúa aunque _loadCatalog falle (fallo silencioso)', async () => {
      mockBrandUseCases.getAll.mockRejectedValue(new Error('catalog error'));

      await expect(component.ngOnInit()).resolves.not.toThrow();
      expect(component.loading()).toBe(false);
    });
  });
});
