import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ControllerDetailComponent } from './controller-detail.component';
import { ControllerModel } from '@/models/controller/controller.model';
import { StoreModel } from '@/models/store/store.model';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import {
  HARDWARE_BRAND_USE_CASES,
  HardwareBrandUseCasesContract
} from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import {
  HARDWARE_MODEL_USE_CASES,
  HardwareModelUseCasesContract
} from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import {
  HARDWARE_EDITION_USE_CASES,
  HardwareEditionUseCasesContract
} from '@/domain/use-cases/hardware-edition/hardware-edition.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';

function makeController(overrides: Partial<ControllerModel> = {}): ControllerModel {
  return {
    id: 'controller-uuid-1',
    userId: 'user-1',
    brandId: 'brand-uuid-1',
    modelId: 'model-uuid-1',
    editionId: null,
    color: '#000000',
    compatibility: 'PS5',
    condition: 'used',
    price: 69,
    store: 'store-uuid-1',
    purchaseDate: '2023-03-10',
    notes: null,
    createdAt: '2023-03-10T10:00:00Z',
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

const mockStore: StoreModel = { id: 'store-uuid-1', label: 'GAME', formatHint: 'physical' };

describe('ControllerDetailComponent', () => {
  let component: ControllerDetailComponent;
  let fixture: ComponentFixture<ControllerDetailComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        ControllerDetailComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        {
          provide: CONTROLLER_USE_CASES,
          useValue: {
            getById: vi.fn().mockResolvedValue(makeController()),
            delete: vi.fn().mockResolvedValue(undefined)
          } as Partial<ControllerUseCasesContract>
        },
        {
          provide: STORE_USE_CASES,
          useValue: {
            getAllStores: vi.fn().mockResolvedValue([mockStore])
          } as Partial<StoreUseCasesContract>
        },
        {
          provide: HARDWARE_BRAND_USE_CASES,
          useValue: {
            getById: vi.fn().mockResolvedValue({ id: 'brand-uuid-1', name: 'Sony' }),
            getAll: vi.fn().mockResolvedValue([])
          } as Partial<HardwareBrandUseCasesContract>
        },
        {
          provide: HARDWARE_MODEL_USE_CASES,
          useValue: {
            getById: vi.fn().mockResolvedValue({ id: 'model-uuid-1', name: 'DualSense' })
          } as Partial<HardwareModelUseCasesContract>
        },
        {
          provide: HARDWARE_EDITION_USE_CASES,
          useValue: {
            getById: vi.fn().mockResolvedValue(undefined)
          } as Partial<HardwareEditionUseCasesContract>
        },
        { provide: UserContextService, useValue: { requireUserId: vi.fn().mockReturnValue('user-1') } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue('controller-uuid-1') } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ControllerDetailComponent);
    component = fixture.componentInstance;
  });

  describe('estado inicial', () => {
    it('controller empieza en undefined', () => {
      expect(component.controller()).toBeUndefined();
    });
  });

  describe('ngOnInit', () => {
    it('carga el mando y las tiendas en paralelo', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      const storeUseCases = TestBed.inject(STORE_USE_CASES as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(controllerUseCases.getById).toHaveBeenCalledWith('user-1', 'controller-uuid-1');
      expect(storeUseCases.getAllStores).toHaveBeenCalled();
      expect(component.controller()?.id).toBe('controller-uuid-1');
    });

    it('desactiva loading tras la carga', async () => {
      expect(component.loading()).toBe(true);
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(component.loading()).toBe(false);
    });

    it('navega a /collection/controllers si el mando no existe (null)', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      controllerUseCases.getById.mockResolvedValue(null);
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/collection/controllers']);
    });

    it('navega a /collection/controllers si la carga falla', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      controllerUseCases.getById.mockRejectedValue(new Error('load error'));
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/collection/controllers']);
    });

    it('desactiva loading incluso si la carga falla', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      controllerUseCases.getById.mockRejectedValue(new Error('fail'));

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(component.loading()).toBe(false);
    });

    it('usa cadena vacía como id cuando la ruta no tiene parámetro id', async () => {
      const route = TestBed.inject(ActivatedRoute as any) as any;
      route.snapshot.paramMap.get.mockReturnValueOnce(null);
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(controllerUseCases.getById).toHaveBeenCalledWith('user-1', '');
    });

    it('no llama a los use cases de catálogo cuando brandId y modelId son vacíos', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      controllerUseCases.getById.mockResolvedValue({ ...makeController(), brandId: '', modelId: '' });

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(brandUseCases.getById).not.toHaveBeenCalled();
      expect(modelUseCases.getById).not.toHaveBeenCalled();
    });

    it('llama a editionUseCases.getById cuando el mando tiene editionId', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;
      controllerUseCases.getById.mockResolvedValue(makeController({ editionId: 'edition-uuid-1' }));

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(editionUseCases.getById).toHaveBeenCalledWith('edition-uuid-1');
    });
  });

  describe('onSaveCompleted', () => {
    it('actualiza la señal controller con los nuevos valores de disponibilidad y cierra el formulario', () => {
      component.controller.set(makeController({ forSale: false, salePrice: null }));
      component.showSaleForm.set(true);

      component.onSaveCompleted({ forSale: true, salePrice: 50 });

      expect(component.controller()?.forSale).toBe(true);
      expect(component.controller()?.salePrice).toBe(50);
      expect(component.showSaleForm()).toBe(false);
    });

    it('pone salePrice a null cuando forSale es false', () => {
      component.controller.set(makeController({ forSale: true, salePrice: 50 }));
      component.onSaveCompleted({ forSale: false, salePrice: null });
      expect(component.controller()?.salePrice).toBeNull();
    });
  });

  describe('onLoanSaved', () => {
    it('actualiza la señal controller y desactiva showLoanForm', () => {
      const updated = makeController({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Ana',
        activeLoanAt: '2024-06-01'
      });
      component.showLoanForm.set(true);

      component.onLoanSaved(updated);

      expect(component.controller()).toEqual(updated);
      expect(component.showLoanForm()).toBe(false);
    });
  });
});
