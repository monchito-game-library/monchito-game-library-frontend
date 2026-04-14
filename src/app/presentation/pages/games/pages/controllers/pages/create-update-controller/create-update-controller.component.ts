import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ControllerForm, ControllerFormValue } from '@/interfaces/forms/controller-form.interface';
import { ControllerModel } from '@/models/controller/controller.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
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
import { availableControllerCompatibilities } from '@/constants/available-controller-compatibilities.constant';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import { GameConditionType } from '@/types/game-condition.type';
import { ControllerCompatibilityType } from '@/types/controller-compatibility.type';

@Component({
  selector: 'app-create-update-controller',
  templateUrl: './create-update-controller.component.html',
  styleUrls: ['./create-update-controller.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatProgressSpinner,
    TranslocoPipe
  ]
})
export class CreateUpdateControllerComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  private readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  private readonly _editionUseCases: HardwareEditionUseCasesContract = inject(HARDWARE_EDITION_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  private readonly _storeModels: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);
  private readonly _storeInput: Signal<string | null>;
  private readonly _brandInput: Signal<string | null>;
  private readonly _modelInput: Signal<string | null>;

  private _controllerId: string | null = null;

  /** Available controller compatibilities for the selector. */
  readonly availableCompatibilities = availableControllerCompatibilities;

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** All hardware brands available for selection. */
  readonly brands: WritableSignal<HardwareBrandModel[]> = signal<HardwareBrandModel[]>([]);

  /** Hardware models filtered by the selected brand and type='controller'. */
  readonly models: WritableSignal<HardwareModelModel[]> = signal<HardwareModelModel[]>([]);

  /** Hardware editions filtered by the selected model. */
  readonly editions: WritableSignal<HardwareEditionModel[]> = signal<HardwareEditionModel[]>([]);

  /** True when editing an existing controller, false when creating. */
  readonly isEditMode: WritableSignal<boolean> = signal<boolean>(false);

  /** True while loading the controller data in edit mode. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** True while the save operation is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Reactive form for the controller data. */
  readonly form: FormGroup<ControllerForm> = this._fb.group<ControllerForm>({
    brandId: this._fb.control<string | null>(null),
    modelId: this._fb.control<string | null>(null),
    editionId: this._fb.control<string | null>({ value: null, disabled: true }),
    color: this._fb.nonNullable.control<string>('#000000', Validators.required),
    compatibility: this._fb.nonNullable.control<ControllerCompatibilityType>(
      availableControllerCompatibilities[0].code,
      Validators.required
    ),
    condition: this._fb.nonNullable.control<GameConditionType>(GAME_CONDITION.USED),
    price: this._fb.control<number | null>(null),
    store: this._fb.control<string | null>(null),
    purchaseDate: this._fb.control<string | null>(null),
    notes: this._fb.control<string | null>(null)
  });

  /** Stores filtered by the current autocomplete input value. */
  readonly filteredStores: Signal<StoreModel[]> = computed((): StoreModel[] => {
    const input: string = this._storeInput()?.toString().toLowerCase() ?? '';
    return this._storeModels().filter((s: StoreModel): boolean => s.label.toLowerCase().includes(input));
  });

  /** Brands filtered by the current autocomplete input value. */
  readonly filteredBrands: Signal<HardwareBrandModel[]> = computed((): HardwareBrandModel[] => {
    const input: string = this._brandInput()?.toString().toLowerCase() ?? '';
    return this.brands().filter((b: HardwareBrandModel): boolean => b.name.toLowerCase().includes(input));
  });

  /** Models filtered by the current autocomplete input value. */
  readonly filteredModels: Signal<HardwareModelModel[]> = computed((): HardwareModelModel[] => {
    const input: string = this._modelInput()?.toString().toLowerCase() ?? '';
    return this.models().filter((m: HardwareModelModel): boolean => m.name.toLowerCase().includes(input));
  });

  constructor() {
    this._storeInput = toSignal(this.form.controls.store.valueChanges, { initialValue: null });
    this._brandInput = toSignal(this.form.controls.brandId.valueChanges, { initialValue: null });
    this._modelInput = toSignal(this.form.controls.modelId.valueChanges, { initialValue: null });
  }

  async ngOnInit(): Promise<void> {
    void this._loadStores();
    void this._loadBrands();
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this._controllerId = id;
      this.isEditMode.set(true);
      await this._loadController(id);
    }
  }

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
   * Valida el formulario y guarda el mando (creación o actualización).
   * Navega de vuelta a la lista si tiene éxito.
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    try {
      const value = this.form.getRawValue() as ControllerFormValue;
      const userId = this._userContext.requireUserId();

      if (this.isEditMode() && this._controllerId) {
        const updated: ControllerModel = {
          id: this._controllerId,
          userId,
          brandId: value.brandId ?? '',
          modelId: value.modelId ?? '',
          editionId: value.editionId,
          color: value.color,
          compatibility: value.compatibility,
          condition: value.condition,
          price: value.price,
          store: value.store,
          purchaseDate: value.purchaseDate,
          notes: value.notes,
          createdAt: '',
          forSale: false,
          salePrice: null,
          soldAt: null,
          soldPriceFinal: null,
          activeLoanId: null,
          activeLoanTo: null,
          activeLoanAt: null
        };
        await this._controllerUseCases.update(userId, this._controllerId, updated);
        this._snackBar.open(
          this._transloco.translate('controllerPage.snack.updated'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
      } else {
        const created: ControllerModel = {
          id: '',
          userId,
          brandId: value.brandId ?? '',
          modelId: value.modelId ?? '',
          editionId: value.editionId,
          color: value.color,
          compatibility: value.compatibility,
          condition: value.condition,
          price: value.price,
          store: value.store,
          purchaseDate: value.purchaseDate,
          notes: value.notes,
          createdAt: '',
          forSale: false,
          salePrice: null,
          soldAt: null,
          soldPriceFinal: null,
          activeLoanId: null,
          activeLoanTo: null,
          activeLoanAt: null
        };
        await this._controllerUseCases.add(userId, created);
        this._snackBar.open(
          this._transloco.translate('controllerPage.snack.saved'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
      }

      this._router.navigate(['/games/controllers']);
    } catch {
      this._snackBar.open(
        this._transloco.translate('controllerPage.snack.saveError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Navega de vuelta a la lista de mandos sin guardar cambios.
   */
  onCancel(): void {
    this._router.navigate(['/games/controllers']);
  }

  /**
   * Reacciona al cambio de marca: limpia modelo y edición, y carga los modelos de la nueva marca.
   *
   * @param {string | null} brandId - UUID de la marca seleccionada
   */
  async onBrandChange(brandId: string | null): Promise<void> {
    this.form.controls.modelId.setValue(null);
    this.form.controls.editionId.setValue(null);
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
    this.form.controls.editionId.setValue(null);
    this.editions.set([]);
    if (modelId) {
      this.form.controls.editionId.enable();
      await this._loadEditions(modelId);
    } else {
      this.form.controls.editionId.disable();
    }
  }

  /**
   * Carga la lista de tiendas disponibles desde Supabase.
   */
  private async _loadStores(): Promise<void> {
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
  private async _loadBrands(): Promise<void> {
    try {
      this.brands.set(await this._brandUseCases.getAll());
    } catch {
      // Silent failure
    }
  }

  /**
   * Carga los modelos de mando de la marca indicada.
   *
   * @param {string} brandId - UUID de la marca
   */
  private async _loadModels(brandId: string): Promise<void> {
    try {
      const all = await this._modelUseCases.getAllByBrand(brandId);
      this.models.set(all.filter((m: HardwareModelModel): boolean => m.type === 'controller'));
    } catch {
      // Silent failure
    }
  }

  /**
   * Carga las ediciones del modelo indicado.
   *
   * @param {string} modelId - UUID del modelo
   */
  private async _loadEditions(modelId: string): Promise<void> {
    try {
      this.editions.set(await this._editionUseCases.getAllByModel(modelId));
    } catch {
      // Silent failure
    }
  }

  /**
   * Carga los datos del mando a editar y parchea el formulario.
   * En modo edición precarga la jerarquía marca → modelo → edición antes de parchear.
   *
   * @param {string} id - UUID del mando a editar
   */
  private async _loadController(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const controller = await this._controllerUseCases.getById(this._userContext.requireUserId(), id);
      if (!controller) {
        this._router.navigate(['/games/controllers']);
        return;
      }
      if (controller.brandId) {
        await this._loadModels(controller.brandId);
        if (controller.modelId) {
          this.form.controls.editionId.enable();
          await this._loadEditions(controller.modelId);
        }
      }
      this.form.patchValue({
        brandId: controller.brandId,
        modelId: controller.modelId,
        editionId: controller.editionId,
        color: controller.color,
        compatibility: controller.compatibility,
        condition: controller.condition,
        price: controller.price,
        store: controller.store,
        purchaseDate: controller.purchaseDate,
        notes: controller.notes
      });
    } catch {
      this._snackBar.open(
        this._transloco.translate('controllersPage.snack.loadError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
      this._router.navigate(['/games/controllers']);
    } finally {
      this.loading.set(false);
    }
  }
}
