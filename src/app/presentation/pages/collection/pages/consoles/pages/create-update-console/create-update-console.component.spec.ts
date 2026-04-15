import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { CreateUpdateConsoleComponent } from './create-update-console.component';
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
import { UserContextService } from '@/services/user-context.service';

function makeConsole(overrides: Partial<ConsoleModel> = {}): ConsoleModel {
  return {
    id: 'console-uuid-1',
    userId: 'user-1',
    brandId: '11111111-1111-1111-1111-111111111111',
    modelId: '22222222-2222-2222-2222-222222222222',
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
const mockBrand = { id: '11111111-1111-1111-1111-111111111111', name: 'Sony' };
const mockModel = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'PlayStation 5',
  brandId: '11111111-1111-1111-1111-111111111111',
  type: 'console'
};
const mockEdition = { id: 'edition-uuid-1', name: 'Digital Edition', modelId: '22222222-2222-2222-2222-222222222222' };

describe('CreateUpdateConsoleComponent — modo creación', () => {
  let component: CreateUpdateConsoleComponent;
  let fixture: ComponentFixture<CreateUpdateConsoleComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        CreateUpdateConsoleComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        {
          provide: CONSOLE_USE_CASES,
          useValue: {
            add: vi.fn().mockResolvedValue(undefined),
            update: vi.fn().mockResolvedValue(undefined),
            getById: vi.fn().mockResolvedValue(makeConsole())
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
            getAll: vi.fn().mockResolvedValue([mockBrand])
          } as Partial<HardwareBrandUseCasesContract>
        },
        {
          provide: HARDWARE_MODEL_USE_CASES,
          useValue: {
            getAllByBrand: vi.fn().mockResolvedValue([mockModel]),
            getById: vi.fn().mockResolvedValue(mockModel)
          } as Partial<HardwareModelUseCasesContract>
        },
        {
          provide: HARDWARE_EDITION_USE_CASES,
          useValue: {
            getAllByModel: vi.fn().mockResolvedValue([mockEdition])
          } as Partial<HardwareEditionUseCasesContract>
        },
        { provide: UserContextService, useValue: { requireUserId: vi.fn().mockReturnValue('user-1') } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(CreateUpdateConsoleComponent);
    component = fixture.componentInstance;
  });

  describe('estado inicial', () => {
    it('isEditMode empieza en false', () => {
      expect(component.isEditMode()).toBe(false);
    });

    it('loading empieza en false', () => {
      expect(component.loading()).toBe(false);
    });

    it('saving empieza en false', () => {
      expect(component.saving()).toBe(false);
    });

    it('brands empieza vacío', () => {
      expect(component.brands()).toEqual([]);
    });

    it('models empieza vacío', () => {
      expect(component.models()).toEqual([]);
    });

    it('editions empieza vacío', () => {
      expect(component.editions()).toEqual([]);
    });

    it('el campo condition tiene valor por defecto', () => {
      const value = component.form.getRawValue();
      expect(value.condition).toBeDefined();
    });

    it('el campo editionId empieza desactivado', () => {
      expect(component.form.controls.editionId.disabled).toBe(true);
    });
  });

  describe('onCancel', () => {
    it('navega a /collection/consoles', () => {
      const router = TestBed.inject(Router as any) as any;
      component.onCancel();
      expect(router.navigate).toHaveBeenCalledWith(['/collection/consoles']);
    });
  });

  describe('onBrandChange', () => {
    it('con null: limpia modelId, editionId, models y editions', async () => {
      component.models.set([mockModel as any]);
      component.editions.set([mockEdition as any]);
      component.form.controls.modelId.setValue('some-model');
      component.form.controls.editionId.setValue('some-edition');

      await component.onBrandChange(null);

      expect(component.form.controls.modelId.value).toBeNull();
      expect(component.form.controls.editionId.value).toBeNull();
      expect(component.models()).toEqual([]);
      expect(component.editions()).toEqual([]);
    });

    it('con brandId: limpia y luego recarga modelos', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;

      await component.onBrandChange('11111111-1111-1111-1111-111111111111');

      expect(modelUseCases.getAllByBrand).toHaveBeenCalledWith('11111111-1111-1111-1111-111111111111');
      expect(component.form.controls.modelId.value).toBeNull();
      expect(component.form.controls.editionId.value).toBeNull();
    });

    it('no llama a getAllByBrand si el brandId es null', async () => {
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;

      await component.onBrandChange(null);

      expect(modelUseCases.getAllByBrand).not.toHaveBeenCalled();
    });
  });

  describe('onModelChange', () => {
    it('con null: limpia editionId, editions y deshabilita el control', async () => {
      component.editions.set([mockEdition as any]);
      component.form.controls.editionId.enable();
      component.form.controls.editionId.setValue('some-edition');

      await component.onModelChange(null);

      expect(component.form.controls.editionId.value).toBeNull();
      expect(component.editions()).toEqual([]);
      expect(component.form.controls.editionId.disabled).toBe(true);
    });

    it('con modelId: habilita editionId y carga ediciones', async () => {
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;

      await component.onModelChange('22222222-2222-2222-2222-222222222222');

      expect(component.form.controls.editionId.enabled).toBe(true);
      expect(editionUseCases.getAllByModel).toHaveBeenCalledWith('22222222-2222-2222-2222-222222222222');
    });
  });

  describe('ngOnInit — modo creación', () => {
    it('no activa isEditMode', async () => {
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(component.isEditMode()).toBe(false);
    });

    it('carga marcas y tiendas', async () => {
      const brandUseCases = TestBed.inject(HARDWARE_BRAND_USE_CASES as any) as any;
      const storeUseCases = TestBed.inject(STORE_USE_CASES as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(brandUseCases.getAll).toHaveBeenCalled();
      expect(storeUseCases.getAllStores).toHaveBeenCalled();
    });
  });

  describe('onSubmit — modo creación', () => {
    it('no envía si el formulario es inválido por brandId o modelId no UUID', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      component.form.controls.brandId.setValue('not-a-uuid');
      component.form.controls.modelId.setValue('not-a-uuid');

      await component.onSubmit();

      expect(consoleUseCases.add).not.toHaveBeenCalled();
    });

    it('llama a add y navega a /collection/consoles con UUIDs válidos', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      const router = TestBed.inject(Router as any) as any;

      component.form.controls.brandId.setValue('11111111-1111-1111-1111-111111111111');
      component.form.controls.modelId.setValue('22222222-2222-2222-2222-222222222222');

      await component.onSubmit();

      expect(consoleUseCases.add).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/collection/consoles']);
    });

    it('muestra snackbar de error si add lanza', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.add.mockRejectedValue(new Error('save error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      component.form.controls.brandId.setValue('11111111-1111-1111-1111-111111111111');
      component.form.controls.modelId.setValue('22222222-2222-2222-2222-222222222222');

      await component.onSubmit();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva saving aunque add lance', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.add.mockRejectedValue(new Error('save error'));

      component.form.controls.brandId.setValue('11111111-1111-1111-1111-111111111111');
      component.form.controls.modelId.setValue('22222222-2222-2222-2222-222222222222');

      await component.onSubmit();

      expect(component.saving()).toBe(false);
    });

    it('no envía si saving ya está activo', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      component.saving.set(true);

      await component.onSubmit();

      expect(consoleUseCases.add).not.toHaveBeenCalled();
    });
  });
});

describe('CreateUpdateConsoleComponent — modo edición', () => {
  let component: CreateUpdateConsoleComponent;
  let fixture: ComponentFixture<CreateUpdateConsoleComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        CreateUpdateConsoleComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        {
          provide: CONSOLE_USE_CASES,
          useValue: {
            add: vi.fn().mockResolvedValue(undefined),
            update: vi.fn().mockResolvedValue(undefined),
            getById: vi.fn().mockResolvedValue(makeConsole())
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
            getAll: vi.fn().mockResolvedValue([mockBrand])
          } as Partial<HardwareBrandUseCasesContract>
        },
        {
          provide: HARDWARE_MODEL_USE_CASES,
          useValue: {
            getAllByBrand: vi.fn().mockResolvedValue([mockModel]),
            getById: vi.fn().mockResolvedValue(mockModel)
          } as Partial<HardwareModelUseCasesContract>
        },
        {
          provide: HARDWARE_EDITION_USE_CASES,
          useValue: {
            getAllByModel: vi.fn().mockResolvedValue([mockEdition])
          } as Partial<HardwareEditionUseCasesContract>
        },
        { provide: UserContextService, useValue: { requireUserId: vi.fn().mockReturnValue('user-1') } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue('console-uuid-1') } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(CreateUpdateConsoleComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit — modo edición', () => {
    it('activa isEditMode', async () => {
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(component.isEditMode()).toBe(true);
    });

    it('carga la consola y parchea el formulario', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(consoleUseCases.getById).toHaveBeenCalledWith('user-1', 'console-uuid-1');
    });

    it('navega a /collection/consoles si la consola no existe', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.getById.mockResolvedValue(null);
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/collection/consoles']);
    });

    it('desactiva loading tras la carga', async () => {
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(component.loading()).toBe(false);
    });

    it('muestra snackbar de error y navega a /collection/consoles si la carga lanza', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      consoleUseCases.getById.mockRejectedValue(new Error('DB error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(snackBar.open).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/collection/consoles']);
    });
  });

  describe('_loadConsole — ramas de catálogo', () => {
    it('no carga modelos si la consola no tiene brandId', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      consoleUseCases.getById.mockResolvedValue(makeConsole({ brandId: '' }));

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(modelUseCases.getAllByBrand).not.toHaveBeenCalled();
    });

    it('no carga ediciones si la consola tiene brandId pero no modelId', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;
      consoleUseCases.getById.mockResolvedValue(makeConsole({ modelId: '' }));

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(editionUseCases.getAllByModel).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit — modo edición', () => {
    it('llama a update y navega a /collection/consoles con UUIDs válidos', async () => {
      const consoleUseCases = TestBed.inject(CONSOLE_USE_CASES as any) as any;
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      component.form.controls.brandId.setValue('11111111-1111-1111-1111-111111111111');
      component.form.controls.modelId.setValue('22222222-2222-2222-2222-222222222222');

      await component.onSubmit();

      expect(consoleUseCases.update).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/collection/consoles']);
    });
  });
});
