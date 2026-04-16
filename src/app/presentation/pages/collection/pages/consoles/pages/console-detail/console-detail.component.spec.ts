import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ConsoleDetailComponent } from './console-detail.component';
import { ConsoleModel } from '@/models/console/console.model';
import { StoreModel } from '@/models/store/store.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
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
import {
  HARDWARE_CONSOLE_SPECS_USE_CASES,
  HardwareConsoleSpecsUseCasesContract
} from '@/domain/use-cases/hardware-console-specs/hardware-console-specs.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';

function makeConsole(overrides: Partial<ConsoleModel> = {}): ConsoleModel {
  return {
    id: 'console-uuid-1',
    userId: 'user-1',
    brandId: 'brand-uuid-1',
    modelId: 'model-uuid-1',
    editionId: null,
    region: null,
    condition: 'used',
    price: 299,
    store: 'store-uuid-1',
    purchaseDate: '2023-01-15',
    notes: null,
    createdAt: '2023-01-15T10:00:00Z',
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

describe('ConsoleDetailComponent', () => {
  let component: ConsoleDetailComponent;
  let fixture: ComponentFixture<ConsoleDetailComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        ConsoleDetailComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        {
          provide: CONSOLE_USE_CASES,
          useValue: {
            getById: vi.fn().mockResolvedValue(makeConsole()),
            delete: vi.fn().mockResolvedValue(undefined)
          } as Partial<ConsoleUseCasesContract>
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
            getById: vi.fn().mockResolvedValue({ id: 'model-uuid-1', name: 'PlayStation 5' })
          } as Partial<HardwareModelUseCasesContract>
        },
        {
          provide: HARDWARE_EDITION_USE_CASES,
          useValue: {
            getById: vi.fn().mockResolvedValue(undefined)
          } as Partial<HardwareEditionUseCasesContract>
        },
        {
          provide: HARDWARE_CONSOLE_SPECS_USE_CASES,
          useValue: {
            getByModelId: vi.fn().mockResolvedValue(undefined)
          } as Partial<HardwareConsoleSpecsUseCasesContract>
        },
        { provide: UserContextService, useValue: { requireUserId: vi.fn().mockReturnValue('user-1') } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue('console-uuid-1') } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ConsoleDetailComponent);
    component = fixture.componentInstance;
  });

  describe('estado inicial', () => {
    it('console empieza en undefined', () => {
      expect(component.console()).toBeUndefined();
    });
  });

  describe('ngOnInit', () => {
    it('carga la consola y las tiendas en paralelo', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      const storeUseCases = TestBed.inject(STORE_USE_CASES as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(consoleUseCases.getById).toHaveBeenCalledWith('user-1', 'console-uuid-1');
      expect(storeUseCases.getAllStores).toHaveBeenCalled();
      expect(component.console()?.id).toBe('console-uuid-1');
    });

    it('desactiva loading tras la carga', async () => {
      expect(component.loading()).toBe(true);
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(component.loading()).toBe(false);
    });

    it('navega a /collection/consoles si la consola no existe (null)', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.getById.mockResolvedValue(null);
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/collection/consoles']);
    });

    it('navega a /collection/consoles si la carga falla', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.getById.mockRejectedValue(new Error('load error'));
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/collection/consoles']);
    });

    it('desactiva loading incluso si la carga falla', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.getById.mockRejectedValue(new Error('fail'));

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(component.loading()).toBe(false);
    });

    it('usa cadena vacía como id cuando la ruta no tiene parámetro id', async () => {
      const route = TestBed.inject(ActivatedRoute as any) as any;
      route.snapshot.paramMap.get.mockReturnValueOnce(null);
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(consoleUseCases.getById).toHaveBeenCalledWith('user-1', '');
    });

    it('no llama a los use cases de catálogo cuando brandId y modelId son null', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      consoleUseCases.getById.mockResolvedValue(makeConsole({ brandId: undefined, modelId: undefined }));

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(brandUseCases.getById).not.toHaveBeenCalled();
      expect(modelUseCases.getById).not.toHaveBeenCalled();
      expect(component.brand()).toBeUndefined();
      expect(component.model()).toBeUndefined();
    });

    it('llama a editionUseCases.getById cuando la consola tiene editionId', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;
      consoleUseCases.getById.mockResolvedValue(makeConsole({ editionId: 'edition-uuid-1' }));

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(editionUseCases.getById).toHaveBeenCalledWith('edition-uuid-1');
    });
  });

  describe('onSaveCompleted', () => {
    it('actualiza la señal console con los nuevos valores de disponibilidad y cierra el formulario', () => {
      component.console.set(makeConsole({ forSale: false, salePrice: null }));
      component.showSaleForm.set(true);

      component.onSaveCompleted({ forSale: true, salePrice: 200 });

      expect(component.console()?.forSale).toBe(true);
      expect(component.console()?.salePrice).toBe(200);
      expect(component.showSaleForm()).toBe(false);
    });

    it('pone salePrice a null cuando forSale es false', () => {
      component.console.set(makeConsole({ forSale: true, salePrice: 200 }));
      component.onSaveCompleted({ forSale: false, salePrice: null });
      expect(component.console()?.salePrice).toBeNull();
    });
  });

  describe('onLoanSaved', () => {
    it('actualiza la señal console y desactiva showLoanForm', () => {
      const updated = makeConsole({
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      component.showLoanForm.set(true);

      component.onLoanSaved(updated);

      expect(component.console()).toEqual(updated);
      expect(component.showLoanForm()).toBe(false);
    });
  });
});
