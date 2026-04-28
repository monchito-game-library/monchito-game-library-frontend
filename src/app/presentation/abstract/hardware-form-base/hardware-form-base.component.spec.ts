import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { HARDWARE_EDITION_USE_CASES } from '@/domain/use-cases/hardware-edition/hardware-edition.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { HardwareFormBaseComponent } from './hardware-form-base.component';
import { mockRouter } from '@/testing/router.mock';
import { mockActivatedRoute } from '@/testing/activated-route.mock';
import { mockSnackBar } from '@/testing/snack-bar.mock';
import { mockTransloco } from '@/testing/transloco.mock';
import { mockUserContext } from '@/testing/user-context.mock';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockStoreUseCases = { getAllStores: vi.fn() };
const mockBrandUseCases = { getAll: vi.fn() };
const mockModelUseCases = { getAllByBrand: vi.fn() };
const mockEditionUseCases = { getAllByModel: vi.fn() };

// ─── Concrete test subclass ───────────────────────────────────────────────────

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'test-hardware-form', template: '', standalone: true })
class TestHardwareFormComponent extends HardwareFormBaseComponent {
  protected readonly _listRoute = '/test/list';
  protected readonly _hardwareModelType = 'console' as const;
  protected readonly _i18nLoadError = 'test.loadError';

  readonly form = new FormGroup({
    modelId: new FormControl<string | null>(null),
    editionId: new FormControl<string | null>(null)
  });

  fetchHardwareResult: unknown = { id: 'item-1' };

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected get _sharedFormControls() {
    return {
      modelId: this.form.controls.modelId,
      editionId: this.form.controls.editionId
    };
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected async _fetchHardware(_userId: string, _id: string): Promise<unknown> {
    return this.fetchHardwareResult;
  }

  async ngOnInit(): Promise<void> {}
  // eslint-disable-next-line jsdoc/require-jsdoc
  async onSubmit(): Promise<void> {}
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('HardwareFormBaseComponent', () => {
  let component: TestHardwareFormComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserContext.userId.mockReturnValue('user-1');
    TestBed.configureTestingModule({
      imports: [TestHardwareFormComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: TranslocoService, useValue: mockTransloco },
        { provide: STORE_USE_CASES, useValue: mockStoreUseCases },
        { provide: HARDWARE_BRAND_USE_CASES, useValue: mockBrandUseCases },
        { provide: HARDWARE_MODEL_USE_CASES, useValue: mockModelUseCases },
        { provide: HARDWARE_EDITION_USE_CASES, useValue: mockEditionUseCases },
        { provide: UserContextService, useValue: mockUserContext }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    component = TestBed.createComponent(TestHardwareFormComponent).componentInstance;
  });

  // ─── Estado inicial ───────────────────────────────────────────────────────

  describe('estado inicial', () => {
    it('brands empieza como array vacío', () => {
      expect(component.brands()).toEqual([]);
    });

    it('models empieza como array vacío', () => {
      expect(component.models()).toEqual([]);
    });

    it('editions empieza como array vacío', () => {
      expect(component.editions()).toEqual([]);
    });

    it('isEditMode empieza en false', () => {
      expect(component.isEditMode()).toBe(false);
    });

    it('loading empieza en false', () => {
      expect(component.loading()).toBe(false);
    });

    it('saving empieza en false', () => {
      expect(component.saving()).toBe(false);
    });
  });

  // ─── displayStoreLabel ────────────────────────────────────────────────────

  describe('displayStoreLabel', () => {
    it('devuelve cadena vacía cuando el id es null', () => {
      expect(component.displayStoreLabel(null)).toBe('');
    });

    it('devuelve cadena vacía cuando el id no coincide con ninguna tienda', () => {
      (component as any)._storeModels.set([{ id: 'store-1', label: 'Store One', formatHint: null }]);
      expect(component.displayStoreLabel('unknown-id')).toBe('');
    });

    it('devuelve la etiqueta de la tienda cuando el id coincide', () => {
      (component as any)._storeModels.set([{ id: 'store-1', label: 'Store One', formatHint: null }]);
      expect(component.displayStoreLabel('store-1')).toBe('Store One');
    });
  });

  // ─── displayBrandLabel ────────────────────────────────────────────────────

  describe('displayBrandLabel', () => {
    it('devuelve cadena vacía cuando el id es null', () => {
      expect(component.displayBrandLabel(null)).toBe('');
    });

    it('devuelve el nombre de la marca cuando el id coincide', () => {
      component.brands.set([{ id: 'brand-1', name: 'Brand One' }]);
      expect(component.displayBrandLabel('brand-1')).toBe('Brand One');
    });

    it('devuelve cadena vacía cuando el id no coincide con ninguna marca', () => {
      component.brands.set([{ id: 'brand-1', name: 'Brand One' }]);
      expect(component.displayBrandLabel('unknown-id')).toBe('');
    });
  });

  // ─── displayModelLabel ────────────────────────────────────────────────────

  describe('displayModelLabel', () => {
    it('devuelve cadena vacía cuando el id es null', () => {
      expect(component.displayModelLabel(null)).toBe('');
    });

    it('devuelve el nombre del modelo cuando el id coincide', () => {
      component.models.set([
        { id: 'model-1', brandId: 'brand-1', name: 'Model One', type: 'console', generation: null, category: null }
      ]);
      expect(component.displayModelLabel('model-1')).toBe('Model One');
    });

    it('devuelve cadena vacía cuando el id no coincide con ningún modelo', () => {
      component.models.set([
        { id: 'model-1', brandId: 'brand-1', name: 'Model One', type: 'console', generation: null, category: null }
      ]);
      expect(component.displayModelLabel('unknown-id')).toBe('');
    });
  });

  // ─── onCancel ─────────────────────────────────────────────────────────────

  describe('onCancel', () => {
    it('navega a la ruta de lista definida en la subclase', () => {
      component.onCancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/list']);
    });
  });

  // ─── onBrandChange ────────────────────────────────────────────────────────

  describe('onBrandChange', () => {
    it('con brandId null: resetea modelId y editionId, limpia models y editions y no llama a _loadModels', async () => {
      component.models.set([
        { id: 'model-1', brandId: 'brand-1', name: 'Model One', type: 'console', generation: null, category: null }
      ]);
      component.editions.set([{ id: 'edition-1', modelId: 'model-1', name: 'Edition One' }]);
      component.form.controls.modelId.setValue('model-1');
      component.form.controls.editionId.setValue('edition-1');

      const loadModelsSpy = vi.spyOn(component as any, '_loadModels');

      await component.onBrandChange(null);

      expect(component.form.controls.modelId.value).toBeNull();
      expect(component.form.controls.editionId.value).toBeNull();
      expect(component.models()).toEqual([]);
      expect(component.editions()).toEqual([]);
      expect(loadModelsSpy).not.toHaveBeenCalled();
    });

    it('con un brandId: resetea controles, limpia arrays y llama a _loadModels con ese id', async () => {
      mockModelUseCases.getAllByBrand.mockResolvedValue([]);
      component.form.controls.modelId.setValue('old-model');
      component.form.controls.editionId.setValue('old-edition');

      await component.onBrandChange('brand-1');

      expect(component.form.controls.modelId.value).toBeNull();
      expect(component.form.controls.editionId.value).toBeNull();
      expect(component.models()).toEqual([]);
      expect(component.editions()).toEqual([]);
      expect(mockModelUseCases.getAllByBrand).toHaveBeenCalledWith('brand-1');
    });
  });

  // ─── onModelChange ────────────────────────────────────────────────────────

  describe('onModelChange', () => {
    it('con modelId null: resetea editionId, limpia editions y deshabilita el control editionId', async () => {
      component.editions.set([{ id: 'edition-1', modelId: 'model-1', name: 'Edition One' }]);
      component.form.controls.editionId.setValue('edition-1');
      component.form.controls.editionId.enable();

      await component.onModelChange(null);

      expect(component.form.controls.editionId.value).toBeNull();
      expect(component.editions()).toEqual([]);
      expect(component.form.controls.editionId.disabled).toBe(true);
    });

    it('con un modelId: resetea editionId, habilita el control editionId y llama a _loadEditions', async () => {
      mockEditionUseCases.getAllByModel.mockResolvedValue([]);
      component.form.controls.editionId.disable();

      await component.onModelChange('model-1');

      expect(component.form.controls.editionId.value).toBeNull();
      expect(component.form.controls.editionId.enabled).toBe(true);
      expect(mockEditionUseCases.getAllByModel).toHaveBeenCalledWith('model-1');
    });
  });

  // ─── _loadStores ─────────────────────────────────────────────────────────

  describe('_loadStores', () => {
    it('establece las tiendas en la señal cuando la llamada es exitosa', async () => {
      const stores = [{ id: 'store-1', label: 'Store One', formatHint: null }];
      mockStoreUseCases.getAllStores.mockResolvedValue(stores);

      await (component as any)._loadStores();

      expect(component.displayStoreLabel('store-1')).toBe('Store One');
    });

    it('mantiene las tiendas vacías y no propaga el error cuando la llamada falla', async () => {
      mockStoreUseCases.getAllStores.mockRejectedValue(new Error('network error'));

      await expect((component as any)._loadStores()).resolves.toBeUndefined();
      expect(component.displayStoreLabel('store-1')).toBe('');
    });
  });

  // ─── _loadBrands ─────────────────────────────────────────────────────────

  describe('_loadBrands', () => {
    it('establece las marcas en la señal cuando la llamada es exitosa', async () => {
      const brands = [{ id: 'brand-1', name: 'Brand One' }];
      mockBrandUseCases.getAll.mockResolvedValue(brands);

      await (component as any)._loadBrands();

      expect(component.brands()).toEqual(brands);
    });

    it('mantiene las marcas vacías y no propaga el error cuando la llamada falla', async () => {
      mockBrandUseCases.getAll.mockRejectedValue(new Error('network error'));

      await expect((component as any)._loadBrands()).resolves.toBeUndefined();
      expect(component.brands()).toEqual([]);
    });
  });

  // ─── _loadModels ─────────────────────────────────────────────────────────

  describe('_loadModels', () => {
    it('establece los modelos en la señal cuando la llamada es exitosa', async () => {
      const models = [
        { id: 'model-1', brandId: 'brand-1', name: 'Model One', type: 'console', generation: null, category: null }
      ];
      mockModelUseCases.getAllByBrand.mockResolvedValue(models);

      await (component as any)._loadModels('brand-1');

      expect(component.models()).toEqual(models);
    });

    it('filtra los modelos por _hardwareModelType y excluye los de otro tipo', async () => {
      const models = [
        { id: 'model-1', brandId: 'brand-1', name: 'Console Model', type: 'console', generation: null, category: null },
        {
          id: 'model-2',
          brandId: 'brand-1',
          name: 'Controller Model',
          type: 'controller',
          generation: null,
          category: null
        }
      ];
      mockModelUseCases.getAllByBrand.mockResolvedValue(models);

      await (component as any)._loadModels('brand-1');

      // TestHardwareFormComponent tiene _hardwareModelType = 'console'
      expect(component.models()).toEqual([
        { id: 'model-1', brandId: 'brand-1', name: 'Console Model', type: 'console', generation: null, category: null }
      ]);
    });

    it('mantiene los modelos vacíos y no propaga el error cuando la llamada falla', async () => {
      mockModelUseCases.getAllByBrand.mockRejectedValue(new Error('network error'));

      await expect((component as any)._loadModels('brand-1')).resolves.toBeUndefined();
      expect(component.models()).toEqual([]);
    });
  });

  // ─── _loadHardwareForEdit ─────────────────────────────────────────────────

  describe('_loadHardwareForEdit', () => {
    it('devuelve null inmediatamente cuando userId es null', async () => {
      mockUserContext.userId.mockReturnValue(null);

      const result = await (component as any)._loadHardwareForEdit('item-1');

      expect(result).toBeNull();
      expect(component.loading()).toBe(false);
    });

    it('devuelve el item cuando _fetchHardware resuelve con un objeto', async () => {
      const item = { id: 'item-1', name: 'Test Item' };
      component.fetchHardwareResult = item;

      const result = await (component as any)._loadHardwareForEdit('item-1');

      expect(result).toEqual(item);
    });

    it('activa loading al inicio y lo desactiva al finalizar con éxito', async () => {
      component.fetchHardwareResult = { id: 'item-1' };
      const loadingStates: boolean[] = [];

      const originalSet = component.loading.set.bind(component.loading);
      vi.spyOn(component.loading, 'set').mockImplementation((v: boolean) => {
        loadingStates.push(v);
        originalSet(v);
      });

      await (component as any)._loadHardwareForEdit('item-1');

      expect(loadingStates[0]).toBe(true);
      expect(component.loading()).toBe(false);
    });

    it('navega a la lista y devuelve null cuando _fetchHardware devuelve null', async () => {
      component.fetchHardwareResult = null;

      const result = await (component as any)._loadHardwareForEdit('item-1');

      expect(result).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/list']);
    });

    it('muestra snackbar, navega a la lista y devuelve null cuando _fetchHardware lanza', async () => {
      component.fetchHardwareResult = null;
      vi.spyOn(component as any, '_fetchHardware').mockRejectedValue(new Error('DB error'));

      const result = await (component as any)._loadHardwareForEdit('item-1');

      expect(result).toBeNull();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/list']);
    });

    it('desactiva loading aunque _fetchHardware lance', async () => {
      vi.spyOn(component as any, '_fetchHardware').mockRejectedValue(new Error('DB error'));

      await (component as any)._loadHardwareForEdit('item-1');

      expect(component.loading()).toBe(false);
    });
  });

  // ─── _loadEditions ────────────────────────────────────────────────────────

  describe('_loadEditions', () => {
    it('establece las ediciones en la señal cuando la llamada es exitosa', async () => {
      const editions = [{ id: 'edition-1', modelId: 'model-1', name: 'Edition One' }];
      mockEditionUseCases.getAllByModel.mockResolvedValue(editions);

      await (component as any)._loadEditions('model-1');

      expect(component.editions()).toEqual(editions);
    });

    it('mantiene las ediciones vacías y no propaga el error cuando la llamada falla', async () => {
      mockEditionUseCases.getAllByModel.mockRejectedValue(new Error('network error'));

      await expect((component as any)._loadEditions('model-1')).resolves.toBeUndefined();
      expect(component.editions()).toEqual([]);
    });
  });
});
