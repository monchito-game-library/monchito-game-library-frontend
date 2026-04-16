import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareFormBaseComponent } from '@/abstract/hardware-form-base.component';
import { ConsoleForm, ConsoleFormValue } from '@/interfaces/forms/console-form.interface';
import { ConsoleModel } from '@/models/console/console.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { StoreModel } from '@/models/store/store.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import { availableConsoleRegions } from '@/constants/available-console-regions.constant';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import { GameConditionType } from '@/types/game-condition.type';
import { ConsoleRegionType } from '@/types/console-region.type';

@Component({
  selector: 'app-create-update-console',
  templateUrl: './create-update-console.component.html',
  styleUrls: ['./create-update-console.component.scss'],
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
export class CreateUpdateConsoleComponent extends HardwareFormBaseComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _consoleUseCases: ConsoleUseCasesContract = inject(CONSOLE_USE_CASES);

  private readonly _storeInput: Signal<string | null>;
  private readonly _brandInput: Signal<string | null>;
  private readonly _modelInput: Signal<string | null>;

  private _consoleId: string | null = null;

  /** Available console regions for the region selector. */
  readonly availableRegions = availableConsoleRegions;

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** Reactive form for the console data. */
  readonly form: FormGroup<ConsoleForm> = this._fb.group<ConsoleForm>({
    brandId: this._fb.control<string | null>(null),
    modelId: this._fb.control<string | null>(null),
    editionId: this._fb.control<string | null>({ value: null, disabled: true }),
    region: this._fb.control<ConsoleRegionType | null>(null),
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

  protected readonly _listRoute = '/collection/consoles';

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

  constructor() {
    super();
    this._storeInput = toSignal(this.form.controls.store.valueChanges, { initialValue: null });
    this._brandInput = toSignal(this.form.controls.brandId.valueChanges, { initialValue: null });
    this._modelInput = toSignal(this.form.controls.modelId.valueChanges, { initialValue: null });
  }

  async ngOnInit(): Promise<void> {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this._consoleId = id;
      this.isEditMode.set(true);
      // In edit mode, wait for brands and stores to load before patching the form
      // so that displayBrandLabel and displayStoreLabel can resolve UUIDs to their labels
      // and the user does not see empty fields they might accidentally overwrite.
      await Promise.all([this._loadBrands(), this._loadStores()]);
      await this._loadConsole(id);
    } else {
      void this._loadStores();
      void this._loadBrands();
    }
  }

  /**
   * Valida el formulario y guarda la consola (creación o actualización).
   * Navega de vuelta a la lista si tiene éxito.
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    try {
      const value = this.form.getRawValue() as ConsoleFormValue;
      const userId = this._userContext.requireUserId();

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!value.brandId || !uuidRegex.test(value.brandId) || !value.modelId || !uuidRegex.test(value.modelId)) {
        this._snackBar.open(
          this._transloco.translate('consolePage.snack.selectBrandModel'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
        return;
      }

      if (this.isEditMode() && this._consoleId) {
        const updated: ConsoleModel = {
          id: this._consoleId,
          userId,
          brandId: value.brandId,
          modelId: value.modelId,
          editionId: value.editionId,
          region: value.region,
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
        await this._consoleUseCases.update(userId, this._consoleId, updated);
        this._snackBar.open(
          this._transloco.translate('consolePage.snack.updated'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
      } else {
        const created: ConsoleModel = {
          id: '',
          userId,
          brandId: value.brandId,
          modelId: value.modelId,
          editionId: value.editionId,
          region: value.region,
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
        await this._consoleUseCases.add(userId, created);
        this._snackBar.open(
          this._transloco.translate('consolePage.snack.saved'),
          this._transloco.translate('common.close'),
          { duration: 3000 }
        );
      }

      this._router.navigate([this._listRoute]);
    } catch {
      this._snackBar.open(
        this._transloco.translate('consolePage.snack.saveError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Carga los modelos de consola de la marca indicada.
   * Sobreescribe el método base para filtrar únicamente los de tipo 'console'.
   *
   * @param {string} brandId - UUID de la marca
   */
  protected override async _loadModels(brandId: string): Promise<void> {
    try {
      const all = await this._modelUseCases.getAllByBrand(brandId);
      this.models.set(all.filter((m: HardwareModelModel): boolean => m.type === 'console'));
    } catch {
      // Silent failure
    }
  }

  /**
   * Carga los datos de la consola a editar y parchea el formulario.
   * En modo edición precarga la jerarquía marca → modelo → edición antes de parchear.
   *
   * @param {string} id - UUID de la consola a editar
   */
  private async _loadConsole(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const console = await this._consoleUseCases.getById(this._userContext.requireUserId(), id);
      if (!console) {
        this._router.navigate([this._listRoute]);
        return;
      }
      if (console.brandId) {
        await this._loadModels(console.brandId);
        if (console.modelId) {
          this.form.controls.editionId.enable();
          await this._loadEditions(console.modelId);
        }
      }
      this.form.patchValue({
        brandId: console.brandId,
        modelId: console.modelId,
        editionId: console.editionId,
        region: console.region,
        condition: console.condition,
        price: console.price,
        store: console.store,
        purchaseDate: console.purchaseDate,
        notes: console.notes
      });
    } catch {
      this._snackBar.open(
        this._transloco.translate('consolesPage.snack.loadError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
      this._router.navigate([this._listRoute]);
    } finally {
      this.loading.set(false);
    }
  }
}
