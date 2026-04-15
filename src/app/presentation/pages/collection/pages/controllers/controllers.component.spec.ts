import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ControllersComponent } from './controllers.component';
import { CONTROLLER_USE_CASES } from '@/domain/use-cases/controller/controller.use-cases.contract';
import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { ControllerModel } from '@/models/controller/controller.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { StoreModel } from '@/models/store/store.model';

function makeController(overrides: Partial<ControllerModel> = {}): ControllerModel {
  return {
    id: 'controller-1',
    userId: 'user-1',
    brandId: 'brand-1',
    modelId: 'model-1',
    editionId: null,
    color: 'black',
    compatibility: 'PS5',
    condition: 'used',
    price: 70,
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
    name: 'DualSense',
    type: 'controller',
    generation: null,
    ...overrides
  };
}

function makeStore(overrides: Partial<StoreModel> = {}): StoreModel {
  return { id: 'store-1', label: 'Media Markt', formatHint: null, ...overrides };
}

describe('ControllersComponent', () => {
  let component: ControllersComponent;
  let fixture: ComponentFixture<ControllersComponent>;

  const mockControllerUseCases = {
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
    mockControllerUseCases.getAllForUser.mockResolvedValue([]);
    mockStoreUseCases.getAllStores.mockResolvedValue([]);
    mockBrandUseCases.getAll.mockResolvedValue([]);
    mockModelUseCases.getAllByType.mockResolvedValue([]);

    TestBed.configureTestingModule({
      imports: [
        ControllersComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: CONTROLLER_USE_CASES, useValue: mockControllerUseCases },
        { provide: STORE_USE_CASES, useValue: mockStoreUseCases },
        { provide: HARDWARE_BRAND_USE_CASES, useValue: mockBrandUseCases },
        { provide: HARDWARE_MODEL_USE_CASES, useValue: mockModelUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ControllersComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('controllers es []', () => {
      expect(component.controllers()).toEqual([]);
    });

    it('loading empieza en true', () => {
      expect(component.loading()).toBe(true);
    });

    it('searchQuery es cadena vacía', () => {
      expect(component.searchQuery()).toBe('');
    });
  });

  describe('filteredControllers', () => {
    it('con query vacía devuelve todos los mandos', () => {
      const controllers = [makeController({ id: 'c-1' }), makeController({ id: 'c-2' })];
      component.controllers.set(controllers);
      component.searchQuery.set('');

      expect(component.filteredControllers()).toEqual(controllers);
    });

    it('con query filtra por nombre del modelo', () => {
      const dualSense = makeController({ id: 'c-1', modelId: 'model-1', brandId: 'brand-1' });
      const xboxCtrl = makeController({ id: 'c-2', modelId: 'model-2', brandId: 'brand-2' });
      component.controllers.set([dualSense, xboxCtrl]);

      (component as any)._hardwareModels.set([
        makeHardwareModel({ id: 'model-1', name: 'DualSense' }),
        makeHardwareModel({ id: 'model-2', name: 'Xbox Controller' })
      ]);
      (component as any)._brands.set([
        makeBrand({ id: 'brand-1', name: 'Sony' }),
        makeBrand({ id: 'brand-2', name: 'Microsoft' })
      ]);

      component.searchQuery.set('dualsense');

      expect(component.filteredControllers()).toEqual([dualSense]);
    });

    it('con query filtra por nombre de marca', () => {
      const sonyCtrl = makeController({ id: 'c-1', brandId: 'brand-1', modelId: 'model-1' });
      const msCtrl = makeController({ id: 'c-2', brandId: 'brand-2', modelId: 'model-2' });
      component.controllers.set([sonyCtrl, msCtrl]);

      (component as any)._brands.set([
        makeBrand({ id: 'brand-1', name: 'Sony' }),
        makeBrand({ id: 'brand-2', name: 'Microsoft' })
      ]);
      (component as any)._hardwareModels.set([
        makeHardwareModel({ id: 'model-1', brandId: 'brand-1', name: 'DualSense' }),
        makeHardwareModel({ id: 'model-2', brandId: 'brand-2', name: 'Xbox Controller' })
      ]);

      component.searchQuery.set('microsoft');

      expect(component.filteredControllers()).toEqual([msCtrl]);
    });

    it('la búsqueda es insensible a mayúsculas', () => {
      const ctrl = makeController({ id: 'c-1', modelId: 'model-1' });
      component.controllers.set([ctrl]);
      (component as any)._hardwareModels.set([makeHardwareModel({ id: 'model-1', name: 'DualSense' })]);
      (component as any)._brands.set([]);

      component.searchQuery.set('DUALSENSE');

      expect(component.filteredControllers()).toEqual([ctrl]);
    });

    it('con query que no coincide devuelve lista vacía', () => {
      component.controllers.set([makeController()]);
      (component as any)._hardwareModels.set([makeHardwareModel({ name: 'DualSense' })]);
      (component as any)._brands.set([makeBrand({ name: 'Sony' })]);

      component.searchQuery.set('nintendo');

      expect(component.filteredControllers()).toEqual([]);
    });

    it('usa cadena vacía como nombre de modelo cuando el modelo no se encuentra en el catálogo', () => {
      const ctrlWithUnknownModel = makeController({ id: 'c-1', modelId: 'unknown-model', brandId: 'brand-1' });
      component.controllers.set([ctrlWithUnknownModel]);
      (component as any)._hardwareModels.set([]);
      (component as any)._brands.set([makeBrand({ id: 'brand-1', name: 'Sony' })]);

      component.searchQuery.set('sony');

      expect(component.filteredControllers()).toEqual([ctrlWithUnknownModel]);
    });
  });

  describe('totalSpent', () => {
    it('devuelve 0 cuando no hay mandos', () => {
      component.controllers.set([]);

      expect(component.totalSpent()).toBe(0);
    });

    it('suma los precios de los mandos filtrados', () => {
      component.controllers.set([makeController({ price: 70 }), makeController({ id: 'c-2', price: 50 })]);
      component.searchQuery.set('');

      expect(component.totalSpent()).toBe(120);
    });

    it('trata precio null como 0', () => {
      component.controllers.set([makeController({ price: null }), makeController({ id: 'c-2', price: 80 })]);
      component.searchQuery.set('');

      expect(component.totalSpent()).toBe(80);
    });

    it('solo suma los mandos que pasan el filtro', () => {
      const sonyCtrl = makeController({ id: 'c-1', price: 70, brandId: 'brand-1', modelId: 'model-1' });
      const msCtrl = makeController({ id: 'c-2', price: 60, brandId: 'brand-2', modelId: 'model-2' });
      component.controllers.set([sonyCtrl, msCtrl]);
      (component as any)._brands.set([
        makeBrand({ id: 'brand-1', name: 'Sony' }),
        makeBrand({ id: 'brand-2', name: 'Microsoft' })
      ]);
      (component as any)._hardwareModels.set([
        makeHardwareModel({ id: 'model-1', brandId: 'brand-1', name: 'DualSense' }),
        makeHardwareModel({ id: 'model-2', brandId: 'brand-2', name: 'Xbox Controller' })
      ]);

      component.searchQuery.set('sony');

      expect(component.totalSpent()).toBe(70);
    });
  });

  describe('resolveStoreName()', () => {
    it('devuelve cadena vacía para id null', () => {
      expect(component.resolveStoreName(null)).toBe('');
    });

    it('devuelve el label de la tienda cuando se encuentra', () => {
      (component as any)._stores.set([makeStore({ id: 'store-1', label: 'Media Markt' })]);

      expect(component.resolveStoreName('store-1')).toBe('Media Markt');
    });

    it('devuelve el id como fallback cuando no se encuentra la tienda', () => {
      (component as any)._stores.set([]);

      expect(component.resolveStoreName('id-desconocido')).toBe('id-desconocido');
    });
  });

  describe('resolveBrandName()', () => {
    it('devuelve — para id null', () => {
      expect(component.resolveBrandName(null)).toBe('—');
    });

    it('devuelve el nombre de la marca cuando se encuentra', () => {
      (component as any)._brands.set([makeBrand({ id: 'brand-1', name: 'Sony' })]);

      expect(component.resolveBrandName('brand-1')).toBe('Sony');
    });

    it('devuelve — cuando no se encuentra la marca', () => {
      (component as any)._brands.set([]);

      expect(component.resolveBrandName('brand-inexistente')).toBe('—');
    });
  });

  describe('resolveModelName()', () => {
    it('devuelve — para id null', () => {
      expect(component.resolveModelName(null)).toBe('—');
    });

    it('devuelve el nombre del modelo cuando se encuentra', () => {
      (component as any)._hardwareModels.set([makeHardwareModel({ id: 'model-1', name: 'DualSense' })]);

      expect(component.resolveModelName('model-1')).toBe('DualSense');
    });

    it('devuelve — cuando no se encuentra el modelo', () => {
      (component as any)._hardwareModels.set([]);

      expect(component.resolveModelName('model-inexistente')).toBe('—');
    });
  });

  describe('onDetail()', () => {
    it('navega a /collection/controllers/:id', () => {
      const ctrl = makeController({ id: 'controller-abc' });

      component.onDetail(ctrl);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection/controllers', 'controller-abc']);
    });
  });

  describe('onAdd()', () => {
    it('navega a /collection/controllers/add', () => {
      component.onAdd();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection/controllers/add']);
    });
  });

  describe('ngOnInit', () => {
    it('carga mandos, tiendas y catálogo y pone loading a false', async () => {
      mockControllerUseCases.getAllForUser.mockResolvedValue([makeController()]);
      mockStoreUseCases.getAllStores.mockResolvedValue([makeStore()]);
      mockBrandUseCases.getAll.mockResolvedValue([makeBrand()]);
      mockModelUseCases.getAllByType.mockResolvedValue([makeHardwareModel()]);

      await component.ngOnInit();

      expect(component.controllers()).toHaveLength(1);
      expect(component.loading()).toBe(false);
    });

    it('muestra snackbar y mantiene loading en false si _loadControllers falla', async () => {
      mockControllerUseCases.getAllForUser.mockRejectedValue(new Error('fail'));

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
