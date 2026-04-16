import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareFormBaseComponent } from '@/abstract/hardware-form-base/hardware-form-base.component';
import { HardwareFormShellComponent } from '@/pages/collection/components/hardware-form-shell/hardware-form-shell.component';
import { ControllerForm, ControllerFormValue } from '@/interfaces/forms/controller-form.interface';
import { ControllerModel } from '@/models/controller/controller.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { StoreModel } from '@/models/store/store.model';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
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
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    TranslocoPipe,
    HardwareFormShellComponent
  ]
})
export class CreateUpdateControllerComponent extends HardwareFormBaseComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);

  private readonly _storeInput: Signal<string | null>;
  private readonly _brandInput: Signal<string | null>;
  private readonly _modelInput: Signal<string | null>;

  private _controllerId: string | null = null;

  /** Available controller compatibilities for the selector. */
  readonly availableCompatibilities = availableControllerCompatibilities;

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;

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
    return this.stores().filter((s: StoreModel): boolean => s.label.toLowerCase().includes(input));
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

  protected readonly _listRoute = '/collection/controllers';
  protected readonly _hardwareModelType = 'controller' as const;
  protected readonly _i18nLoadError = 'controllersPage.snack.loadError';

  /**
   * Exposes the shared modelId and editionId form controls to the base class
   * for use in the brand/model cascade handlers.
   */
  protected get _sharedFormControls(): { modelId: FormControl<string | null>; editionId: FormControl<string | null> } {
    return {
      modelId: this.form.controls.modelId,
      editionId: this.form.controls.editionId
    };
  }

  /**
   * Fetches the controller item by user and id from the use case.
   *
   * @param {string} userId - Authenticated user UUID
   * @param {string} id - Controller UUID
   */
  protected async _fetchHardware(userId: string, id: string): Promise<unknown> {
    return this._controllerUseCases.getById(userId, id);
  }

  constructor() {
    super();
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

      this._router.navigate([this._listRoute]);
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
   * Carga los datos del mando a editar y parchea el formulario.
   * En modo edición precarga la jerarquía marca → modelo → edición antes de parchear.
   *
   * @param {string} id - UUID del mando a editar
   */
  private async _loadController(id: string): Promise<void> {
    const item = await this._loadHardwareForEdit(id);
    if (!item) return;
    const controller = item as ControllerModel;
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
  }
}
