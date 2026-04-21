import { Directive, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareItemModel } from '@/types/hardware-item.type';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { StoreModel } from '@/models/store/store.model';
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
import { UserContextService } from '@/services/user-context/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import { HardwareLoanItem } from '@/pages/collection/components/hardware-loan-form/hardware-loan-form.component';
import { SaleAvailabilityValues, SaleSoldValues } from '@/interfaces/forms/sale-form.interface';
import { HardwareSaleStatusModel } from '@/interfaces/hardware-sale-status.interface';

/** Union type for the two hardware entity models handled by this base. */

/**
 * Abstract base class that encapsulates the shared state and behavior
 * common to ConsoleDetailComponent and ControllerDetailComponent.
 *
 * Subclasses must provide abstract route/i18n properties and implement
 * the entity-specific ngOnInit, _getItem, _setItem, _fetchItem,
 * _updateSaleStatus and _deleteItem methods.
 */
@Directive()
export abstract class HardwareDetailBaseComponent {
  protected readonly _router: Router = inject(Router);
  protected readonly _route: ActivatedRoute = inject(ActivatedRoute);
  protected readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  protected readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  protected readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  protected readonly _editionUseCases: HardwareEditionUseCasesContract = inject(HARDWARE_EDITION_USE_CASES);
  protected readonly _userContext: UserContextService = inject(UserContextService);
  protected readonly _dialog: MatDialog = inject(MatDialog);
  protected readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  protected readonly _transloco: TranslocoService = inject(TranslocoService);

  protected _stores: StoreModel[] = [];

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** True while data is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  /** Brand from the catalog. */
  readonly brand: WritableSignal<HardwareBrandModel | undefined> = signal<HardwareBrandModel | undefined>(undefined);

  /** Model from the catalog. */
  readonly model: WritableSignal<HardwareModelModel | undefined> = signal<HardwareModelModel | undefined>(undefined);

  /** Edition from the catalog, if any. */
  readonly edition: WritableSignal<HardwareEditionModel | undefined> = signal<HardwareEditionModel | undefined>(
    undefined
  );

  /** Whether the sale form view is active. */
  readonly showSaleForm: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the loan form view is active. */
  readonly showLoanForm: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether a delete operation is in progress. */
  readonly deleting: WritableSignal<boolean> = signal<boolean>(false);

  /** Route to the entity list page, e.g. '/collection/consoles'. */
  protected abstract readonly _listRoute: string;

  /** Base route for the entity edit page, e.g. '/collection/consoles/edit'. */
  protected abstract readonly _editRoute: string;

  /** i18n key for the delete confirmation dialog title. */
  protected abstract readonly _i18nDeleteTitle: string;

  /** i18n key for the delete confirmation dialog message. */
  protected abstract readonly _i18nDeleteMessage: string;

  /** i18n key for the "deleted successfully" snackbar text. */
  protected abstract readonly _i18nDeletedSnack: string;

  /** i18n key for the "delete failed" snackbar text. */
  protected abstract readonly _i18nDeleteErrorSnack: string;

  abstract ngOnInit(): Promise<void>;

  /**
   * Returns the currently loaded entity.
   * Implemented by each subclass using its own entity signal.
   */
  protected abstract _getItem(): HardwareItemModel | undefined;

  /**
   * Updates the entity signal with the new value.
   * Implemented by each subclass using its own entity signal.
   *
   * @param {HardwareItemModel} item - The new entity value to set
   */
  protected abstract _setItem(item: HardwareItemModel): void;

  /**
   * Fetches the entity from the use case.
   * Implemented by each subclass using its own use case injection.
   *
   * @param {string} userId - The authenticated user UUID
   * @param {string} id - The entity UUID to fetch
   */
  protected abstract _fetchItem(userId: string, id: string): Promise<HardwareItemModel | null | undefined>;

  /**
   * Updates the sale status via the entity-specific use case.
   * Implemented by each subclass using its own use case injection.
   *
   * @param {string} userId - The authenticated user UUID
   * @param {string} id - The entity UUID
   * @param {HardwareSaleStatusModel} sale - The new sale status payload
   */
  protected abstract _updateSaleStatus(userId: string, id: string, sale: HardwareSaleStatusModel): Promise<void>;

  /**
   * Calls the entity-specific delete use case.
   * Implemented by each subclass using its own use case injection.
   */
  protected abstract _deleteItem(): Promise<void>;

  /**
   * Returns the UUID of the currently loaded item.
   * Uses _getItem() to avoid duplication in subclasses.
   */
  protected _getItemId(): string | undefined {
    return this._getItem()?.id;
  }

  /**
   * Saves the item's availability status (forSale + salePrice) via the use case.
   * Passed as the saveFn input to SaleFormComponent.
   *
   * @param {SaleAvailabilityValues} v - Availability values from the form
   */
  readonly saveFn = async (v: SaleAvailabilityValues): Promise<void> => {
    const item = this._getItem()!;
    const sale: HardwareSaleStatusModel = {
      forSale: v.forSale,
      salePrice: v.forSale ? v.salePrice : null,
      soldAt: item.soldAt,
      soldPriceFinal: item.soldPriceFinal
    };
    await this._updateSaleStatus(this._userContext.requireUserId(), item.id, sale);
  };

  /**
   * Registers the item as sold via the use case.
   * Passed as the sellFn input to SaleFormComponent.
   *
   * @param {SaleSoldValues} v - Sold values from the form
   */
  readonly sellFn = async (v: SaleSoldValues): Promise<void> => {
    const item = this._getItem()!;
    const sale: HardwareSaleStatusModel = {
      forSale: false,
      salePrice: null,
      soldAt: v.soldAt,
      soldPriceFinal: v.soldPriceFinal
    };
    await this._updateSaleStatus(this._userContext.requireUserId(), item.id, sale);
  };

  /**
   * Called after the sale form saves availability successfully.
   * Updates the entity signal with the new forSale/salePrice values and closes the form.
   *
   * @param {SaleAvailabilityValues} values - Updated availability values from the form
   */
  onSaveCompleted(values: SaleAvailabilityValues): void {
    const item = this._getItem()!;
    this._setItem({ ...item, forSale: values.forSale, salePrice: values.forSale ? values.salePrice : null });
    this.showSaleForm.set(false);
  }

  /**
   * Called when the loan form completes an action.
   * Updates the entity signal and closes the form.
   *
   * @param {HardwareLoanItem} updated - Model with the new loan values applied
   */
  onLoanSaved(updated: HardwareLoanItem): void {
    this._setItem(updated as HardwareItemModel);
    this.showLoanForm.set(false);
  }

  /**
   * Loads the item and all associated catalog data (brand, model, edition).
   * On success sets the item signal and calls _afterItemLoaded for subclass hooks.
   * Navigates to the list page if the item is not found or an error occurs.
   *
   * @param {string} id - The entity UUID to load
   */
  protected async _loadItemWithCatalog(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const item = await this._fetchItem(this._userContext.requireUserId(), id);
      if (!item) {
        void this._router.navigate([this._listRoute]);
        return;
      }
      this._setItem(item);
      await Promise.all([
        this._loadBrandModelEdition(item.brandId, item.modelId, item.editionId),
        this._afterItemLoaded(item)
      ]);
    } catch {
      void this._router.navigate([this._listRoute]);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Optional hook called after the item is loaded and set.
   * Subclasses can override to perform additional async work (e.g. loading specs).
   *
   * @param {HardwareItemModel} _item - The loaded entity
   */
  protected async _afterItemLoaded(_item: HardwareItemModel): Promise<void> {
    // Default: no-op
  }

  /**
   * Returns the store label from its UUID.
   *
   * @param {string | null} id - Store UUID
   */
  resolveStoreName(id: string | null): string {
    if (!id) return '';
    return this._stores.find((s: StoreModel): boolean => s.id === id)?.label ?? id;
  }

  /**
   * Navigates back to the entity list page.
   */
  onBack(): void {
    void this._router.navigate([this._listRoute]);
  }

  /**
   * Navigates to the edit form for the current item.
   */
  onEdit(): void {
    const id = this._getItemId();
    if (id) void this._router.navigate([this._editRoute, id]);
  }

  /**
   * Called after the sale form registers the item as sold.
   * Navigates to the list page since the item is no longer in the active collection.
   */
  onSellCompleted(): void {
    void this._router.navigate([this._listRoute]);
  }

  /**
   * Reverts the sale, clearing soldAt and soldPriceFinal and returning the item to the active collection.
   */
  async undoSell(): Promise<void> {
    const item = this._getItem();
    if (!item) return;
    try {
      const sale: HardwareSaleStatusModel = { forSale: false, salePrice: null, soldAt: null, soldPriceFinal: null };
      await this._updateSaleStatus(this._userContext.requireUserId(), item.id, sale);
      this._setItem({ ...item, forSale: false, salePrice: null, soldAt: null, soldPriceFinal: null });
    } catch {
      this._snackBar.open(
        this._transloco.translate('hardwareSale.snack.undoError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    }
  }

  /**
   * Activates the sale form view.
   */
  openSaleView(): void {
    this.showLoanForm.set(false);
    this.showSaleForm.set(true);
  }

  /**
   * Closes the sale form view.
   */
  closeSaleView(): void {
    this.showSaleForm.set(false);
  }

  /**
   * Activates the loan form view.
   */
  openLoanView(): void {
    this.showSaleForm.set(false);
    this.showLoanForm.set(true);
  }

  /**
   * Closes the loan form view.
   */
  closeLoanView(): void {
    this.showLoanForm.set(false);
  }

  /**
   * Shows a confirmation dialog and deletes the item if the user confirms.
   * On success, navigates to the list. Shows a snackbar based on the result.
   */
  onDelete(): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate(this._i18nDeleteTitle),
        message: this._transloco.translate(this._i18nDeleteMessage)
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      const id = this._getItemId();
      if (!id) return;
      void this._performDelete();
    });
  }

  /**
   * Performs the item deletion, shows a snackbar and navigates based on the result.
   */
  private async _performDelete(): Promise<void> {
    this.deleting.set(true);
    try {
      await this._deleteItem();
      this._snackBar.open(
        this._transloco.translate(this._i18nDeletedSnack),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
      void this._router.navigate([this._listRoute]);
    } catch {
      this._snackBar.open(
        this._transloco.translate(this._i18nDeleteErrorSnack),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
      this.deleting.set(false);
    }
  }

  /**
   * Loads the brand, model and edition from the catalog in parallel and updates the signals.
   *
   * @param {string | null | undefined} brandId - Brand UUID
   * @param {string | null | undefined} modelId - Model UUID
   * @param {string | null | undefined} editionId - Edition UUID, if any
   */
  protected async _loadBrandModelEdition(
    brandId: string | null | undefined,
    modelId: string | null | undefined,
    editionId: string | null | undefined
  ): Promise<void> {
    const [brand, model, edition] = await Promise.all([
      brandId ? this._brandUseCases.getById(brandId) : Promise.resolve(undefined),
      modelId ? this._modelUseCases.getById(modelId) : Promise.resolve(undefined),
      editionId ? this._editionUseCases.getById(editionId) : Promise.resolve(undefined)
    ]);

    this.brand.set(brand);
    this.model.set(model);
    this.edition.set(edition);
  }

  /**
   * Loads the store list for display name resolution. Fails silently.
   */
  protected async _loadStores(): Promise<void> {
    try {
      this._stores = await this._storeUseCases.getAllStores();
    } catch {
      // Silent failure
    }
  }
}
