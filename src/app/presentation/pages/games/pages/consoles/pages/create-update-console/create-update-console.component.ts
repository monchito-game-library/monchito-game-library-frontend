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
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

import { ConsoleForm, ConsoleFormValue } from '@/interfaces/forms/console-form.interface';
import { ConsoleModel } from '@/models/console/console.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';
import { StoreModel } from '@/models/store/store.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
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
export class CreateUpdateConsoleComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _consoleUseCases: ConsoleUseCasesContract = inject(CONSOLE_USE_CASES);
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

  private _consoleId: string | null = null;

  /** Available console regions for the region selector. */
  readonly availableRegions = availableConsoleRegions;

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** All hardware brands available for selection. */
  readonly brands: WritableSignal<HardwareBrandModel[]> = signal<HardwareBrandModel[]>([]);

  /** Hardware models filtered by the selected brand and type='console'. */
  readonly models: WritableSignal<HardwareModelModel[]> = signal<HardwareModelModel[]>([]);

  /** Hardware editions filtered by the selected model. */
  readonly editions: WritableSignal<HardwareEditionModel[]> = signal<HardwareEditionModel[]>([]);

  /** True when editing an existing console, false when creating. */
  readonly isEditMode: WritableSignal<boolean> = signal<boolean>(false);

  /** True while loading the console data in edit mode. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** True while the save operation is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

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

      this._router.navigate(['/games/consoles']);
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
   * Navega de vuelta a la lista de consolas sin guardar cambios.
   */
  onCancel(): void {
    this._router.navigate(['/games/consoles']);
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
   * Carga los modelos de consola de la marca indicada.
   *
   * @param {string} brandId - UUID de la marca
   */
  private async _loadModels(brandId: string): Promise<void> {
    try {
      const all = await this._modelUseCases.getAllByBrand(brandId);
      this.models.set(all.filter((m: HardwareModelModel): boolean => m.type === 'console'));
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
        this._router.navigate(['/games/consoles']);
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
      this._router.navigate(['/games/consoles']);
    } finally {
      this.loading.set(false);
    }
  }
}
