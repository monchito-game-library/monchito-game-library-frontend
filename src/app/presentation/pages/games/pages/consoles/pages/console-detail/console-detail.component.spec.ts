import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

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
    it('loading empieza en true', () => {
      expect(component.loading()).toBe(true);
    });

    it('console empieza en undefined', () => {
      expect(component.console()).toBeUndefined();
    });

    it('showSaleForm empieza en false', () => {
      expect(component.showSaleForm()).toBe(false);
    });

    it('showLoanForm empieza en false', () => {
      expect(component.showLoanForm()).toBe(false);
    });

    it('deleting empieza en false', () => {
      expect(component.deleting()).toBe(false);
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

    it('navega a /games/consoles si la consola no existe (null)', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.getById.mockResolvedValue(null);
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/games/consoles']);
    });

    it('navega a /games/consoles si la carga falla', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.getById.mockRejectedValue(new Error('load error'));
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/games/consoles']);
    });

    it('desactiva loading incluso si la carga falla', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.getById.mockRejectedValue(new Error('fail'));

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(component.loading()).toBe(false);
    });
  });

  describe('resolveStoreName', () => {
    beforeEach(async () => {
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
    });

    it('devuelve el label de la tienda cuando el id coincide', () => {
      expect(component.resolveStoreName('store-uuid-1')).toBe('GAME');
    });

    it('devuelve el id en bruto si la tienda no se encuentra', () => {
      expect(component.resolveStoreName('unknown-uuid')).toBe('unknown-uuid');
    });

    it("devuelve '' cuando el id es null", () => {
      expect(component.resolveStoreName(null)).toBe('');
    });
  });

  describe('onBack', () => {
    it('navega a /games/consoles', () => {
      const router = TestBed.inject(Router as any) as any;
      component.onBack();
      expect(router.navigate).toHaveBeenCalledWith(['/games/consoles']);
    });
  });

  describe('onEdit', () => {
    it('navega a /games/consoles/edit/:id cuando la consola está cargada', () => {
      component.console.set(makeConsole());
      const router = TestBed.inject(Router as any) as any;

      component.onEdit();

      expect(router.navigate).toHaveBeenCalledWith(['/games/consoles/edit', 'console-uuid-1']);
    });

    it('no navega si console es undefined', () => {
      component.console.set(undefined);
      const router = TestBed.inject(Router as any) as any;

      component.onEdit();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('openSaleView', () => {
    it('activa la señal showSaleForm', () => {
      expect(component.showSaleForm()).toBe(false);
      component.openSaleView();
      expect(component.showSaleForm()).toBe(true);
    });

    it('desactiva showLoanForm al activar showSaleForm', () => {
      component.showLoanForm.set(true);
      component.openSaleView();
      expect(component.showLoanForm()).toBe(false);
      expect(component.showSaleForm()).toBe(true);
    });
  });

  describe('closeSaleView', () => {
    it('desactiva la señal showSaleForm', () => {
      component.showSaleForm.set(true);
      component.closeSaleView();
      expect(component.showSaleForm()).toBe(false);
    });
  });

  describe('openLoanView', () => {
    it('activa la señal showLoanForm', () => {
      expect(component.showLoanForm()).toBe(false);
      component.openLoanView();
      expect(component.showLoanForm()).toBe(true);
    });

    it('desactiva showSaleForm al activar showLoanForm', () => {
      component.showSaleForm.set(true);
      component.openLoanView();
      expect(component.showSaleForm()).toBe(false);
      expect(component.showLoanForm()).toBe(true);
    });
  });

  describe('closeLoanView', () => {
    it('desactiva la señal showLoanForm', () => {
      component.showLoanForm.set(true);
      component.closeLoanView();
      expect(component.showLoanForm()).toBe(false);
    });
  });

  describe('onSaleSaved', () => {
    it('navega a /games/consoles cuando la consola queda vendida (soldAt presente)', () => {
      const router = TestBed.inject(Router as any) as any;
      const updated = makeConsole({ forSale: false, salePrice: null, soldAt: '2024-06-01', soldPriceFinal: 250 });
      component.showSaleForm.set(true);

      component.onSaleSaved(updated);

      expect(router.navigate).toHaveBeenCalledWith(['/games/consoles']);
    });

    it('actualiza la señal console y desactiva showSaleForm cuando no hay soldAt', () => {
      const updated = makeConsole({ forSale: true, salePrice: 200, soldAt: null, soldPriceFinal: null });
      component.showSaleForm.set(true);

      component.onSaleSaved(updated);

      expect(component.console()).toEqual(updated);
      expect(component.showSaleForm()).toBe(false);
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

  describe('onDelete', () => {
    it('no elimina si el dialog se cancela', async () => {
      component.console.set(makeConsole());
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.onDelete();
      await new Promise((r) => setTimeout(r, 0));

      expect(consoleUseCases.delete).not.toHaveBeenCalled();
    });

    it('llama a delete y navega a /games/consoles si se confirma', async () => {
      component.console.set(makeConsole());
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const router = TestBed.inject(Router as any) as any;

      component.onDelete();
      await new Promise((r) => setTimeout(r, 0));

      expect(consoleUseCases.delete).toHaveBeenCalledWith('user-1', 'console-uuid-1');
      expect(router.navigate).toHaveBeenCalledWith(['/games/consoles']);
    });

    it('muestra snackbar de error si delete lanza', async () => {
      component.console.set(makeConsole());
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.delete.mockRejectedValue(new Error('delete error'));
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      component.onDelete();
      await new Promise((r) => setTimeout(r, 0));

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva deleting si delete lanza', async () => {
      component.console.set(makeConsole());
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.delete.mockRejectedValue(new Error('delete error'));
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component.onDelete();
      await new Promise((r) => setTimeout(r, 0));

      expect(component.deleting()).toBe(false);
    });
  });
});
