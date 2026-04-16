import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { CreateUpdateControllerComponent } from './create-update-controller.component';
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
    brandId: '11111111-1111-1111-1111-111111111111',
    modelId: '22222222-2222-2222-2222-222222222222',
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
const mockBrand = { id: '11111111-1111-1111-1111-111111111111', name: 'Sony' };
const mockModel = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'DualSense',
  brandId: '11111111-1111-1111-1111-111111111111',
  type: 'controller'
};
const mockEdition = { id: 'edition-uuid-1', name: 'Midnight Black', modelId: '22222222-2222-2222-2222-222222222222' };

describe('CreateUpdateControllerComponent — modo creación', () => {
  let component: CreateUpdateControllerComponent;
  let fixture: ComponentFixture<CreateUpdateControllerComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        CreateUpdateControllerComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        {
          provide: CONTROLLER_USE_CASES,
          useValue: {
            add: vi.fn().mockResolvedValue(undefined),
            update: vi.fn().mockResolvedValue(undefined),
            getById: vi.fn().mockResolvedValue(makeController())
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

    fixture = TestBed.createComponent(CreateUpdateControllerComponent);
    component = fixture.componentInstance;
  });

  describe('estado inicial', () => {
    it('el campo color tiene valor por defecto #000000', () => {
      const value = component.form.getRawValue();
      expect(value.color).toBe('#000000');
    });

    it('el campo compatibility tiene un valor por defecto', () => {
      const value = component.form.getRawValue();
      expect(value.compatibility).toBeDefined();
    });

    it('el campo condition tiene valor por defecto', () => {
      const value = component.form.getRawValue();
      expect(value.condition).toBeDefined();
    });

    it('el campo editionId empieza desactivado', () => {
      expect(component.form.controls.editionId.disabled).toBe(true);
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
    it('no envía si el formulario es inválido (color requerido vacío)', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      component.form.controls.color.setValue('');

      await component.onSubmit();

      expect(controllerUseCases.add).not.toHaveBeenCalled();
    });

    it('llama a add y navega a /collection/controllers con formulario válido', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      const router = TestBed.inject(Router as any) as any;

      component.form.controls.brandId.setValue('11111111-1111-1111-1111-111111111111');
      component.form.controls.modelId.setValue('22222222-2222-2222-2222-222222222222');
      component.form.controls.color.setValue('#ffffff');

      await component.onSubmit();

      expect(controllerUseCases.add).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/collection/controllers']);
    });

    it('muestra snackbar de error si add lanza', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      controllerUseCases.add.mockRejectedValue(new Error('save error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      component.form.controls.brandId.setValue('11111111-1111-1111-1111-111111111111');
      component.form.controls.modelId.setValue('22222222-2222-2222-2222-222222222222');
      component.form.controls.color.setValue('#ffffff');

      await component.onSubmit();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva saving aunque add lance', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      controllerUseCases.add.mockRejectedValue(new Error('save error'));

      component.form.controls.brandId.setValue('11111111-1111-1111-1111-111111111111');
      component.form.controls.modelId.setValue('22222222-2222-2222-2222-222222222222');
      component.form.controls.color.setValue('#ffffff');

      await component.onSubmit();

      expect(component.saving()).toBe(false);
    });

    it('usa cadena vacía para brandId y modelId cuando son null en modo creación', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      const router = TestBed.inject(Router as any) as any;

      component.form.controls.color.setValue('#ffffff');
      // brandId y modelId se quedan null → ?? '' produce ''

      await component.onSubmit();

      expect(controllerUseCases.add).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ brandId: '', modelId: '' })
      );
      expect(router.navigate).toHaveBeenCalledWith(['/collection/controllers']);
    });
  });
});

describe('CreateUpdateControllerComponent — modo edición', () => {
  let component: CreateUpdateControllerComponent;
  let fixture: ComponentFixture<CreateUpdateControllerComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        CreateUpdateControllerComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        {
          provide: CONTROLLER_USE_CASES,
          useValue: {
            add: vi.fn().mockResolvedValue(undefined),
            update: vi.fn().mockResolvedValue(undefined),
            getById: vi.fn().mockResolvedValue(makeController())
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
          useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue('controller-uuid-1') } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(CreateUpdateControllerComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit — modo edición', () => {
    it('activa isEditMode', async () => {
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(component.isEditMode()).toBe(true);
    });

    it('carga el mando y parchea el formulario', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(controllerUseCases.getById).toHaveBeenCalledWith('user-1', 'controller-uuid-1');
    });

    it('navega a /collection/controllers si el mando no existe', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      controllerUseCases.getById.mockResolvedValue(null);
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/collection/controllers']);
    });

    it('desactiva loading tras la carga', async () => {
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(component.loading()).toBe(false);
    });
  });

  describe('onSubmit — modo edición', () => {
    it('llama a update y navega a /collection/controllers con formulario válido', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      component.form.controls.brandId.setValue('11111111-1111-1111-1111-111111111111');
      component.form.controls.modelId.setValue('22222222-2222-2222-2222-222222222222');
      component.form.controls.color.setValue('#ffffff');

      await component.onSubmit();

      expect(controllerUseCases.update).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/collection/controllers']);
    });

    it('usa cadena vacía para brandId y modelId cuando son null en modo edición', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      component.form.controls.brandId.setValue(null);
      component.form.controls.modelId.setValue(null);
      component.form.controls.color.setValue('#ffffff');

      await component.onSubmit();

      expect(controllerUseCases.update).toHaveBeenCalledWith(
        'user-1',
        'controller-uuid-1',
        expect.objectContaining({ brandId: '', modelId: '' })
      );
    });
  });

  describe('ngOnInit — modo edición con error', () => {
    it('muestra snackbar y navega a /collection/controllers si _loadController lanza', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      controllerUseCases.getById.mockRejectedValue(new Error('DB error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(snackBar.open).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/collection/controllers']);
    });
  });

  describe('_loadController — ramas de catálogo', () => {
    it('no carga modelos ni ediciones si el mando no tiene brandId', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      const modelUseCases = TestBed.inject(HARDWARE_MODEL_USE_CASES as any) as any;
      controllerUseCases.getById.mockResolvedValue({ ...makeController(), brandId: '' });

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(modelUseCases.getAllByBrand).not.toHaveBeenCalled();
    });

    it('no carga ediciones si el mando tiene brandId pero no modelId', async () => {
      const controllerUseCases = TestBed.inject(CONTROLLER_USE_CASES as any) as any;
      const editionUseCases = TestBed.inject(HARDWARE_EDITION_USE_CASES as any) as any;
      controllerUseCases.getById.mockResolvedValue({ ...makeController(), modelId: '' });

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(editionUseCases.getAllByModel).not.toHaveBeenCalled();
    });
  });
});
