import { Directive, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
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
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import { HardwareLoanItem } from '@/pages/collection/components/hardware-loan-form/hardware-loan-form.component';
import { SaleAvailabilityValues } from '@/interfaces/forms/sale-form.interface';

/**
 * Abstract base class that encapsulates the shared state and behavior
 * common to ConsoleDetailComponent and ControllerDetailComponent.
 *
 * Subclasses must provide abstract route/i18n properties and implement
 * the entity-specific ngOnInit, _getItemId, _deleteItem, onSaveCompleted
 * and onLoanSaved methods.
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
   * Returns the UUID of the currently loaded item.
   * Implemented by each subclass using its own entity signal.
   */
  protected abstract _getItemId(): string | undefined;

  /**
   * Called after the sale form saves availability successfully.
   * Subclass updates its own entity signal with the new values and closes the form.
   *
   * @param {SaleAvailabilityValues} values - Updated availability values from the form
   */
  abstract onSaveCompleted(values: SaleAvailabilityValues): void;

  /**
   * Called when the loan form completes an action.
   * Subclass updates its own entity signal and closes the form.
   *
   * @param {HardwareLoanItem} updated - Model with the new loan values applied
   */
  abstract onLoanSaved(updated: HardwareLoanItem): void;

  /**
   * Calls the entity-specific delete use case.
   * Implemented by each subclass using its own use case injection.
   */
  protected abstract _deleteItem(): Promise<void>;

  /**
   * Devuelve la etiqueta de la tienda a partir de su UUID.
   *
   * @param {string | null} id - UUID de la tienda
   */
  resolveStoreName(id: string | null): string {
    if (!id) return '';
    return this._stores.find((s: StoreModel): boolean => s.id === id)?.label ?? id;
  }

  /**
   * Navega de vuelta a la lista de la entidad.
   */
  onBack(): void {
    void this._router.navigate([this._listRoute]);
  }

  /**
   * Navega al formulario de edición del ítem actual.
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
   * Activa la vista del formulario de venta.
   */
  openSaleView(): void {
    this.showLoanForm.set(false);
    this.showSaleForm.set(true);
  }

  /**
   * Cierra la vista del formulario de venta.
   */
  closeSaleView(): void {
    this.showSaleForm.set(false);
  }

  /**
   * Activa la vista del formulario de préstamo.
   */
  openLoanView(): void {
    this.showSaleForm.set(false);
    this.showLoanForm.set(true);
  }

  /**
   * Cierra la vista del formulario de préstamo.
   */
  closeLoanView(): void {
    this.showLoanForm.set(false);
  }

  /**
   * Muestra un diálogo de confirmación y elimina el ítem si el usuario confirma.
   * Tras eliminar, redirige a la lista. Muestra un snackbar según el resultado.
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
   * Ejecuta el borrado del ítem, muestra snackbar y navega según el resultado.
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
   * Carga la marca, el modelo y la edición del catálogo en paralelo y actualiza las señales.
   *
   * @param {string | null | undefined} brandId - UUID de la marca
   * @param {string | null | undefined} modelId - UUID del modelo
   * @param {string | null | undefined} editionId - UUID de la edición, si existe
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
   * Carga las tiendas para resolver el nombre en pantalla. Falla silenciosamente.
   */
  protected async _loadStores(): Promise<void> {
    try {
      this._stores = await this._storeUseCases.getAllStores();
    } catch {
      // Silent failure
    }
  }
}
