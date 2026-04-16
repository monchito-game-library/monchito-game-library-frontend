import { Directive, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

import { StoreModel } from '@/models/store/store.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
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

/**
 * Abstract base class that encapsulates the shared state, injections and helper methods
 * common to all hardware form components (consoles, controllers).
 *
 * Subclasses must provide the entity-specific form, the list route and the submit/init logic.
 */
@Directive()
export abstract class HardwareFormBaseComponent {
  protected readonly _router: Router = inject(Router);
  protected readonly _route: ActivatedRoute = inject(ActivatedRoute);
  protected readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  protected readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  protected readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  protected readonly _editionUseCases: HardwareEditionUseCasesContract = inject(HARDWARE_EDITION_USE_CASES);
  protected readonly _userContext: UserContextService = inject(UserContextService);
  protected readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  protected readonly _transloco: TranslocoService = inject(TranslocoService);

  private readonly _storeModels: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);

  /** All hardware brands available for selection. */
  readonly brands: WritableSignal<HardwareBrandModel[]> = signal<HardwareBrandModel[]>([]);

  /** Hardware models filtered by the selected brand. */
  readonly models: WritableSignal<HardwareModelModel[]> = signal<HardwareModelModel[]>([]);

  /** Hardware editions filtered by the selected model. */
  readonly editions: WritableSignal<HardwareEditionModel[]> = signal<HardwareEditionModel[]>([]);

  /** True when editing an existing hardware item, false when creating. */
  readonly isEditMode: WritableSignal<boolean> = signal<boolean>(false);

  /** True while loading the hardware data in edit mode. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** True while the save operation is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** All loaded stores, exposed as a computed-like read-only signal. */
  protected get stores(): Signal<StoreModel[]> {
    return this._storeModels;
  }

  /**
   * Route to navigate back to when cancelling or after a successful operation.
   * Each subclass must provide its own list route (e.g. '/collection/consoles').
   */
  protected abstract readonly _listRoute: string;

  /**
   * Hardware type used to filter models in `_loadModels`.
   * Each subclass must declare either 'console' or 'controller'.
   */
  protected abstract readonly _hardwareModelType: 'console' | 'controller';

  /**
   * Transloco key for the error snackbar shown when loading the item in edit mode fails.
   * e.g. 'consolesPage.snack.loadError' or 'controllersPage.snack.loadError'.
   */
  protected abstract readonly _i18nLoadError: string;

  /**
   * Provides access to the shared form controls (modelId, editionId) needed by
   * the concrete brand/model change handlers. Each subclass exposes its form controls.
   */
  protected abstract get _sharedFormControls(): {
    modelId: FormControl<string | null>;
    editionId: FormControl<string | null>;
  };

  /**
   * Fetches the hardware item for the given user and item id.
   * Each subclass delegates to its own use case (e.g. consoleUseCases.getById).
   *
   * @param {string} userId - Authenticated user UUID
   * @param {string} id - Hardware item UUID
   */
  protected abstract _fetchHardware(userId: string, id: string): Promise<unknown>;

  abstract ngOnInit(): Promise<void>;
  abstract onSubmit(): Promise<void>;

  /**
   * Returns the store label from its UUID for display in the autocomplete.
   *
   * @param {string | null} id - Store UUID
   */
  displayStoreLabel = (id: string | null): string => {
    const store: StoreModel | undefined = this._storeModels().find((s: StoreModel): boolean => s.id === id);
    return store?.label ?? '';
  };

  /**
   * Returns the brand name from its UUID for display in the autocomplete.
   *
   * @param {string | null} id - Brand UUID
   */
  displayBrandLabel = (id: string | null): string => {
    const brand: HardwareBrandModel | undefined = this.brands().find((b: HardwareBrandModel): boolean => b.id === id);
    return brand?.name ?? '';
  };

  /**
   * Returns the model name from its UUID for display in the autocomplete.
   *
   * @param {string | null} id - Model UUID
   */
  displayModelLabel = (id: string | null): string => {
    const model: HardwareModelModel | undefined = this.models().find((m: HardwareModelModel): boolean => m.id === id);
    return model?.name ?? '';
  };

  /**
   * Navigates back to the list without saving changes.
   */
  onCancel(): void {
    void this._router.navigate([this._listRoute]);
  }

  /**
   * Reacts to a brand change: clears model and edition, and loads the models for the new brand.
   *
   * @param {string | null} brandId - Selected brand UUID
   */
  async onBrandChange(brandId: string | null): Promise<void> {
    this._sharedFormControls.modelId.setValue(null);
    this._sharedFormControls.editionId.setValue(null);
    this.models.set([]);
    this.editions.set([]);
    if (brandId) await this._loadModels(brandId);
  }

  /**
   * Reacts to a model change: clears the edition and loads the editions for the new model.
   *
   * @param {string | null} modelId - Selected model UUID
   */
  async onModelChange(modelId: string | null): Promise<void> {
    this._sharedFormControls.editionId.setValue(null);
    this.editions.set([]);
    if (modelId) {
      this._sharedFormControls.editionId.enable();
      await this._loadEditions(modelId);
    } else {
      this._sharedFormControls.editionId.disable();
    }
  }

  /**
   * Loads the list of available stores from Supabase.
   */
  protected async _loadStores(): Promise<void> {
    try {
      const stores: StoreModel[] = await this._storeUseCases.getAllStores();
      this._storeModels.set(stores);
    } catch {
      // Silent failure: field falls back to free text
    }
  }

  /**
   * Loads all available hardware brands.
   */
  protected async _loadBrands(): Promise<void> {
    try {
      this.brands.set(await this._brandUseCases.getAll());
    } catch {
      // Silent failure
    }
  }

  /**
   * Loads the hardware models for the given brand, filtered by `_hardwareModelType`.
   *
   * @param {string} brandId - Brand UUID
   */
  protected async _loadModels(brandId: string): Promise<void> {
    try {
      const all = await this._modelUseCases.getAllByBrand(brandId);
      this.models.set(all.filter((m) => m.type === this._hardwareModelType));
    } catch {
      // Silent failure
    }
  }

  /**
   * Loads the hardware item for edit mode.
   * Sets `loading` while in progress, shows a snackbar and navigates to the list on error.
   * Returns the fetched item or null if not found / on error.
   *
   * @param {string} id - Hardware item UUID
   */
  protected async _loadHardwareForEdit(id: string): Promise<unknown> {
    this.loading.set(true);
    try {
      const item = await this._fetchHardware(this._userContext.requireUserId(), id);
      if (!item) {
        void this._router.navigate([this._listRoute]);
        return null;
      }
      return item;
    } catch {
      this._snackBar.open(this._transloco.translate(this._i18nLoadError), this._transloco.translate('common.close'), {
        duration: 3000
      });
      void this._router.navigate([this._listRoute]);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Loads the editions for the given model.
   *
   * @param {string} modelId - Model UUID
   */
  protected async _loadEditions(modelId: string): Promise<void> {
    try {
      this.editions.set(await this._editionUseCases.getAllByModel(modelId));
    } catch {
      // Silent failure
    }
  }

  /**
   * Loads the brand → model → edition cascade for the given brand and model UUIDs.
   * Enables the editionId control only when a model is already selected.
   *
   * @param {string | null} brandId - Brand UUID, or null to skip
   * @param {string | null} modelId - Model UUID, or null to skip edition loading
   */
  protected async _loadBrandCascade(brandId: string | null, modelId: string | null): Promise<void> {
    if (brandId) {
      await this._loadModels(brandId);
      if (modelId) {
        this._sharedFormControls.editionId.enable();
        await this._loadEditions(modelId);
      }
    }
  }

  /**
   * Wraps a save operation with loading state, snackbar feedback and navigation.
   * Sets `saving` to true while in progress, shows a snackbar based on the result
   * and navigates to the list on success.
   *
   * @param {() => Promise<void>} saveFn - The async save operation to execute
   * @param {string} successKey - Transloco key for the success snackbar
   * @param {string} errorKey - Transloco key for the error snackbar
   */
  protected async _executeSubmit(saveFn: () => Promise<void>, successKey: string, errorKey: string): Promise<void> {
    this.saving.set(true);
    try {
      await saveFn();
      this._snackBar.open(this._transloco.translate(successKey), this._transloco.translate('common.close'), {
        duration: 3000
      });
      void this._router.navigate([this._listRoute]);
    } catch {
      this._snackBar.open(this._transloco.translate(errorKey), this._transloco.translate('common.close'), {
        duration: 3000
      });
    } finally {
      this.saving.set(false);
    }
  }
}
