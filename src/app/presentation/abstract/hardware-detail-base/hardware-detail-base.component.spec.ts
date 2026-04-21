import { Component, NO_ERRORS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { HARDWARE_EDITION_USE_CASES } from '@/domain/use-cases/hardware-edition/hardware-edition.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { HardwareDetailBaseComponent } from '@/abstract/hardware-detail-base/hardware-detail-base.component';
import { HardwareItemModel } from '@/types/hardware-item.type';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';
import { mockRouter } from '@/testing/router.mock';
import { mockActivatedRoute } from '@/testing/activated-route.mock';
import { mockDialog } from '@/testing/dialog.mock';
import { mockSnackBar } from '@/testing/snack-bar.mock';
import { mockTransloco } from '@/testing/transloco.mock';
import { mockUserContext } from '@/testing/user-context.mock';

const mockStoreUseCases = { getAllStores: vi.fn() };
const mockBrandUseCases = { getById: vi.fn() };
const mockModelUseCases = { getById: vi.fn() };
const mockEditionUseCases = { getById: vi.fn() };
function makeItem(overrides: Partial<HardwareItemModel> = {}): HardwareItemModel {
  return {
    id: 'item-123',
    userId: 'user-1',
    brandId: 'brand-1',
    modelId: 'model-1',
    editionId: null,
    condition: 'used',
    price: 100,
    store: null,
    purchaseDate: null,
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    forSale: false,
    salePrice: null,
    soldAt: null,
    soldPriceFinal: null,
    activeLoanId: null,
    activeLoanTo: null,
    activeLoanAt: null,
    ...overrides
  } as HardwareItemModel;
}

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'test-hardware-detail', template: '', standalone: true })
class TestHardwareDetailComponent extends HardwareDetailBaseComponent {
  protected readonly _listRoute = '/test/list';
  protected readonly _editRoute = '/test/edit';
  protected readonly _i18nDeleteTitle = 'test.delete.title';
  protected readonly _i18nDeleteMessage = 'test.delete.message';
  protected readonly _i18nDeletedSnack = 'test.delete.snack.ok';
  protected readonly _i18nDeleteErrorSnack = 'test.delete.snack.error';

  private readonly _item: WritableSignal<HardwareItemModel | undefined> = signal<HardwareItemModel | undefined>(
    undefined
  );

  deleteError = false;
  fetchResult: HardwareItemModel | null | undefined = makeItem();
  updateSaleStatusSpy = vi.fn();

  async ngOnInit(): Promise<void> {}

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected _getItem(): HardwareItemModel | undefined {
    return this._item();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected _setItem(item: HardwareItemModel): void {
    this._item.set(item);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected async _fetchItem(_userId: string, _id: string): Promise<HardwareItemModel | null | undefined> {
    return this.fetchResult;
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected async _updateSaleStatus(userId: string, id: string, sale: HardwareSaleStatusModel): Promise<void> {
    this.updateSaleStatusSpy(userId, id, sale);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  protected async _deleteItem(): Promise<void> {
    if (this.deleteError) throw new Error('delete failed');
  }

  /** Exposes _item signal for test assertions. */
  getItemSignal(): HardwareItemModel | undefined {
    return this._item();
  }
}

describe('HardwareDetailBaseComponent', () => {
  let component: TestHardwareDetailComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.navigate.mockResolvedValue(true);
    mockStoreUseCases.getAllStores.mockResolvedValue([]);
    mockBrandUseCases.getById.mockResolvedValue(undefined);
    mockModelUseCases.getById.mockResolvedValue(undefined);
    mockEditionUseCases.getById.mockResolvedValue(undefined);
    mockUserContext.requireUserId.mockReturnValue('user-1');

    TestBed.configureTestingModule({
      imports: [TestHardwareDetailComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog },
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

    component = TestBed.createComponent(TestHardwareDetailComponent).componentInstance;
  });

  describe('estado inicial', () => {
    it('loading empieza en true', () => {
      expect(component.loading()).toBe(true);
    });

    it('brand empieza como undefined', () => {
      expect(component.brand()).toBeUndefined();
    });

    it('model empieza como undefined', () => {
      expect(component.model()).toBeUndefined();
    });

    it('edition empieza como undefined', () => {
      expect(component.edition()).toBeUndefined();
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

  describe('resolveStoreName', () => {
    it('devuelve cadena vacía cuando el id es null', () => {
      expect(component.resolveStoreName(null)).toBe('');
    });

    it('devuelve el propio id cuando no se encuentra en _stores', () => {
      expect(component.resolveStoreName('unknown-id')).toBe('unknown-id');
    });

    it('devuelve el label de la tienda cuando se encuentra en _stores', async () => {
      mockStoreUseCases.getAllStores.mockResolvedValue([
        { id: 'store-1', label: 'Tienda Principal', formatHint: null }
      ]);
      await (component as any)._loadStores();
      expect(component.resolveStoreName('store-1')).toBe('Tienda Principal');
    });
  });

  describe('onBack', () => {
    it('navega a la ruta de lista', () => {
      component.onBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/list']);
    });
  });

  describe('onEdit', () => {
    it('navega a la ruta de edición con el id del ítem cuando existe', () => {
      (component as any)._setItem(makeItem({ id: 'item-123' }));
      component.onEdit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/edit', 'item-123']);
    });

    it('no navega cuando el id del ítem es undefined', () => {
      component.onEdit();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onSellCompleted', () => {
    it('navega a la ruta de lista', () => {
      component.onSellCompleted();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/list']);
    });
  });

  describe('openSaleView / closeSaleView', () => {
    it('openSaleView activa showSaleForm y desactiva showLoanForm', () => {
      component.showLoanForm.set(true);
      component.openSaleView();
      expect(component.showSaleForm()).toBe(true);
      expect(component.showLoanForm()).toBe(false);
    });

    it('closeSaleView desactiva showSaleForm', () => {
      component.showSaleForm.set(true);
      component.closeSaleView();
      expect(component.showSaleForm()).toBe(false);
    });
  });

  describe('openLoanView / closeLoanView', () => {
    it('openLoanView activa showLoanForm y desactiva showSaleForm', () => {
      component.showSaleForm.set(true);
      component.openLoanView();
      expect(component.showLoanForm()).toBe(true);
      expect(component.showSaleForm()).toBe(false);
    });

    it('closeLoanView desactiva showLoanForm', () => {
      component.showLoanForm.set(true);
      component.closeLoanView();
      expect(component.showLoanForm()).toBe(false);
    });
  });

  describe('saveFn', () => {
    it('llama a _updateSaleStatus con forSale true y salePrice cuando forSale es true', async () => {
      (component as any)._setItem(makeItem({ id: 'item-123', soldAt: null, soldPriceFinal: null }));

      await component.saveFn({ forSale: true, salePrice: 150 });

      expect(component.updateSaleStatusSpy).toHaveBeenCalledWith('user-1', 'item-123', {
        forSale: true,
        salePrice: 150,
        soldAt: null,
        soldPriceFinal: null
      });
    });

    it('llama a _updateSaleStatus con salePrice null cuando forSale es false', async () => {
      (component as any)._setItem(makeItem({ id: 'item-123', soldAt: null, soldPriceFinal: null }));

      await component.saveFn({ forSale: false, salePrice: 150 });

      expect(component.updateSaleStatusSpy).toHaveBeenCalledWith('user-1', 'item-123', {
        forSale: false,
        salePrice: null,
        soldAt: null,
        soldPriceFinal: null
      });
    });

    it('preserva soldAt y soldPriceFinal del ítem existente', async () => {
      (component as any)._setItem(makeItem({ id: 'item-123', soldAt: '2024-06-01', soldPriceFinal: 200 }));

      await component.saveFn({ forSale: true, salePrice: 100 });

      expect(component.updateSaleStatusSpy).toHaveBeenCalledWith(
        'user-1',
        'item-123',
        expect.objectContaining({
          soldAt: '2024-06-01',
          soldPriceFinal: 200
        })
      );
    });
  });

  describe('sellFn', () => {
    it('llama a _updateSaleStatus con forSale false y los valores de venta', async () => {
      (component as any)._setItem(makeItem({ id: 'item-123' }));

      await component.sellFn({ soldAt: '2024-07-01', soldPriceFinal: 250 });

      expect(component.updateSaleStatusSpy).toHaveBeenCalledWith('user-1', 'item-123', {
        forSale: false,
        salePrice: null,
        soldAt: '2024-07-01',
        soldPriceFinal: 250
      });
    });
  });

  describe('onSaveCompleted', () => {
    it('actualiza el ítem con los nuevos valores de disponibilidad y cierra showSaleForm', () => {
      (component as any)._setItem(makeItem({ forSale: false, salePrice: null }));
      component.showSaleForm.set(true);

      component.onSaveCompleted({ forSale: true, salePrice: 99 });

      expect(component.getItemSignal()?.forSale).toBe(true);
      expect(component.getItemSignal()?.salePrice).toBe(99);
      expect(component.showSaleForm()).toBe(false);
    });

    it('pone salePrice a null cuando forSale es false', () => {
      (component as any)._setItem(makeItem({ forSale: true, salePrice: 99 }));

      component.onSaveCompleted({ forSale: false, salePrice: null });

      expect(component.getItemSignal()?.salePrice).toBeNull();
    });
  });

  describe('onLoanSaved', () => {
    it('actualiza el ítem con los nuevos valores de préstamo y cierra showLoanForm', () => {
      const updated = makeItem({ activeLoanId: 'loan-1', activeLoanTo: 'Juan', activeLoanAt: '2024-06-01' });
      component.showLoanForm.set(true);

      component.onLoanSaved(updated);

      expect(component.getItemSignal()).toEqual(updated);
      expect(component.showLoanForm()).toBe(false);
    });
  });

  describe('_loadItemWithCatalog', () => {
    it('carga el ítem, llama a _loadBrandModelEdition y desactiva loading en caso de éxito', async () => {
      const item = makeItem({ brandId: 'brand-1', modelId: 'model-1', editionId: null });
      component.fetchResult = item;
      const brand = { id: 'brand-1', name: 'Sony' };
      const model = { id: 'model-1', name: 'PS5' };
      mockBrandUseCases.getById.mockResolvedValue(brand);
      mockModelUseCases.getById.mockResolvedValue(model);

      await (component as any)._loadItemWithCatalog('item-123');

      expect(component.getItemSignal()).toEqual(item);
      expect(component.brand()).toEqual(brand);
      expect(component.model()).toEqual(model);
      expect(component.loading()).toBe(false);
    });

    it('navega a la lista cuando el ítem no existe (null)', async () => {
      component.fetchResult = null;

      await (component as any)._loadItemWithCatalog('item-123');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/list']);
    });

    it('navega a la lista cuando el ítem no existe (undefined)', async () => {
      component.fetchResult = undefined;

      await (component as any)._loadItemWithCatalog('item-123');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/list']);
    });

    it('navega a la lista cuando _fetchItem lanza un error', async () => {
      vi.spyOn(component as any, '_fetchItem').mockRejectedValue(new Error('fetch error'));

      await (component as any)._loadItemWithCatalog('item-123');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/list']);
    });

    it('desactiva loading incluso cuando _fetchItem lanza un error', async () => {
      vi.spyOn(component as any, '_fetchItem').mockRejectedValue(new Error('fetch error'));

      await (component as any)._loadItemWithCatalog('item-123');

      expect(component.loading()).toBe(false);
    });
  });

  describe('_afterItemLoaded', () => {
    it('no hace nada en la implementación por defecto (no-op)', async () => {
      const item = makeItem();
      await expect((component as any)._afterItemLoaded(item)).resolves.toBeUndefined();
    });
  });

  describe('onDelete', () => {
    it('no llama a _deleteItem cuando el usuario cancela el diálogo', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
      const deleteSpy = vi.spyOn(component as any, '_deleteItem');
      component.onDelete();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('no llama a _deleteItem cuando el diálogo se cierra sin confirmar (null)', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(null) });
      const deleteSpy = vi.spyOn(component as any, '_deleteItem');
      component.onDelete();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('no llama a _deleteItem cuando el id del ítem es undefined tras confirmar', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const deleteSpy = vi.spyOn(component as any, '_deleteItem');
      component.onDelete();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('elimina correctamente: activa deleting, muestra snackbar de éxito y navega a la lista', async () => {
      (component as any)._setItem(makeItem({ id: 'item-123' }));
      component.deleteError = false;
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
      component.onDelete();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockSnackBar.open).toHaveBeenCalledWith('test.delete.snack.ok', 'common.close', { duration: 3000 });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/list']);
    });

    it('muestra snackbar de error y restablece deleting cuando falla el borrado', async () => {
      (component as any)._setItem(makeItem({ id: 'item-123' }));
      component.deleteError = true;
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
      component.onDelete();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockSnackBar.open).toHaveBeenCalledWith('test.delete.snack.error', 'common.close', { duration: 3000 });
      expect(component.deleting()).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('_loadBrandModelEdition', () => {
    it('llama a los tres casos de uso y actualiza las señales cuando se proporcionan todos los ids', async () => {
      const brand = { id: 'brand-1', name: 'Sony' };
      const model = { id: 'model-1', name: 'PS5' };
      const edition = { id: 'edition-1', name: 'Disc' };
      mockBrandUseCases.getById.mockResolvedValue(brand);
      mockModelUseCases.getById.mockResolvedValue(model);
      mockEditionUseCases.getById.mockResolvedValue(edition);

      await (component as any)._loadBrandModelEdition('brand-1', 'model-1', 'edition-1');

      expect(mockBrandUseCases.getById).toHaveBeenCalledWith('brand-1');
      expect(mockModelUseCases.getById).toHaveBeenCalledWith('model-1');
      expect(mockEditionUseCases.getById).toHaveBeenCalledWith('edition-1');
      expect(component.brand()).toEqual(brand);
      expect(component.model()).toEqual(model);
      expect(component.edition()).toEqual(edition);
    });

    it('resuelve a undefined para cada señal cuando los ids son null', async () => {
      await (component as any)._loadBrandModelEdition(null, null, null);

      expect(mockBrandUseCases.getById).not.toHaveBeenCalled();
      expect(mockModelUseCases.getById).not.toHaveBeenCalled();
      expect(mockEditionUseCases.getById).not.toHaveBeenCalled();
      expect(component.brand()).toBeUndefined();
      expect(component.model()).toBeUndefined();
      expect(component.edition()).toBeUndefined();
    });

    it('resuelve a undefined para cada señal cuando los ids son undefined', async () => {
      await (component as any)._loadBrandModelEdition(undefined, undefined, undefined);

      expect(component.brand()).toBeUndefined();
      expect(component.model()).toBeUndefined();
      expect(component.edition()).toBeUndefined();
    });
  });

  describe('_loadStores', () => {
    it('popula _stores correctamente y permite resolver nombres', async () => {
      const stores = [
        { id: 'store-1', label: 'Fnac', formatHint: null },
        { id: 'store-2', label: 'GameStop', formatHint: null }
      ];
      mockStoreUseCases.getAllStores.mockResolvedValue(stores);

      await (component as any)._loadStores();

      expect(component.resolveStoreName('store-1')).toBe('Fnac');
      expect(component.resolveStoreName('store-2')).toBe('GameStop');
    });

    it('mantiene _stores vacío y no lanza error cuando getAllStores falla', async () => {
      mockStoreUseCases.getAllStores.mockRejectedValue(new Error('network error'));

      await (component as any)._loadStores();

      expect(component.resolveStoreName('store-1')).toBe('store-1');
    });
  });
});
