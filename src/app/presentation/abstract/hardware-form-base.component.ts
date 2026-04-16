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
import { UserContextService } from '@/services/user-context.service';

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
   * Provides access to the shared form controls (modelId, editionId) needed by
   * the concrete brand/model change handlers. Each subclass exposes its form controls.
   */
  protected abstract get _sharedFormControls(): {
    modelId: FormControl<string | null>;
    editionId: FormControl<string | null>;
  };

  abstract ngOnInit(): Promise<void>;
  abstract onSubmit(): Promise<void>;

  /**
   * Devuelve la etiqueta de la tienda a partir de su UUID para mostrarla en el autocomplete.
   *
   * @param {string | null} id - UUID de la tienda
   */
  displayStoreLabel = (id: string | null): string => {
    const store: StoreModel | undefined = this._storeModels().find((s: StoreModel): boolean => s.id === id);
    return store?.label ?? '';
  };

  /**
   * Devuelve el nombre de la marca a partir de su UUID para mostrarla en el autocomplete.
   *
   * @param {string | null} id - UUID de la marca
   */
  displayBrandLabel = (id: string | null): string => {
    const brand: HardwareBrandModel | undefined = this.brands().find((b: HardwareBrandModel): boolean => b.id === id);
    return brand?.name ?? '';
  };

  /**
   * Devuelve el nombre del modelo a partir de su UUID para mostrarlo en el autocomplete.
   *
   * @param {string | null} id - UUID del modelo
   */
  displayModelLabel = (id: string | null): string => {
    const model: HardwareModelModel | undefined = this.models().find((m: HardwareModelModel): boolean => m.id === id);
    return model?.name ?? '';
  };

  /**
   * Navega de vuelta a la lista sin guardar cambios.
   */
  onCancel(): void {
    void this._router.navigate([this._listRoute]);
  }

  /**
   * Reacciona al cambio de marca: limpia modelo y edición, y carga los modelos de la nueva marca.
   *
   * @param {string | null} brandId - UUID de la marca seleccionada
   */
  async onBrandChange(brandId: string | null): Promise<void> {
    this._sharedFormControls.modelId.setValue(null);
    this._sharedFormControls.editionId.setValue(null);
    this.models.set([]);
    this.editions.set([]);
    if (brandId) await this._loadModels(brandId);
  }

  /**
   * Reacciona al cambio de modelo: limpia la edición y carga las ediciones del nuevo modelo.
   *
   * @param {string | null} modelId - UUID del modelo seleccionado
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
   * Carga la lista de tiendas disponibles desde Supabase.
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
   * Carga todas las marcas de hardware disponibles.
   */
  protected async _loadBrands(): Promise<void> {
    try {
      this.brands.set(await this._brandUseCases.getAll());
    } catch {
      // Silent failure
    }
  }

  /**
   * Carga los modelos de hardware de la marca indicada.
   *
   * @param {string} brandId - UUID de la marca
   */
  protected async _loadModels(brandId: string): Promise<void> {
    try {
      this.models.set(await this._modelUseCases.getAllByBrand(brandId));
    } catch {
      // Silent failure
    }
  }

  /**
   * Carga las ediciones del modelo indicado.
   *
   * @param {string} modelId - UUID del modelo
   */
  protected async _loadEditions(modelId: string): Promise<void> {
    try {
      this.editions.set(await this._editionUseCases.getAllByModel(modelId));
    } catch {
      // Silent failure
    }
  }
}
