import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RetroSelectComponent } from '@retro/retro-select/retro-select.component';
import { RetroOptionComponent } from '@retro/retro-select/components/retro-option/retro-option.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { HardwareFormBaseComponent } from '@/abstract/hardware-form-base/hardware-form-base.component';
import { HardwareFormShellComponent } from '@/pages/collection/components/hardware-form-shell/hardware-form-shell.component';
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
  imports: [ReactiveFormsModule, TranslocoPipe, HardwareFormShellComponent, RetroSelectComponent, RetroOptionComponent]
})
export class CreateUpdateConsoleComponent extends HardwareFormBaseComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _consoleUseCases: ConsoleUseCasesContract = inject(CONSOLE_USE_CASES);

  /** Texto de búsqueda del campo brand, usado para filtrar las opciones. */
  private readonly _brandSearchQuery: WritableSignal<string> = signal<string>('');
  /** Texto de búsqueda del campo model, usado para filtrar las opciones. */
  private readonly _modelSearchQuery: WritableSignal<string> = signal<string>('');
  /** Texto de búsqueda del campo store, usado para filtrar las opciones. */
  private readonly _storeSearchQuery: WritableSignal<string> = signal<string>('');

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
    purchaseDate: this._fb.control<Date | null>(null),
    notes: this._fb.control<string | null>(null)
  });

  /** Stores filtered by the current search query. */
  readonly filteredStores: Signal<StoreModel[]> = computed((): StoreModel[] => {
    const query: string = this._storeSearchQuery().toLowerCase();
    return this.stores().filter((s: StoreModel): boolean => s.label.toLowerCase().includes(query));
  });

  /** Brands filtered by the current search query. */
  readonly filteredBrands: Signal<HardwareBrandModel[]> = computed((): HardwareBrandModel[] => {
    const query: string = this._brandSearchQuery().toLowerCase();
    return this.brands().filter((b: HardwareBrandModel): boolean => b.name.toLowerCase().includes(query));
  });

  /** Models filtered by the current search query. */
  readonly filteredModels: Signal<HardwareModelModel[]> = computed((): HardwareModelModel[] => {
    const query: string = this._modelSearchQuery().toLowerCase();
    return this.models().filter((m: HardwareModelModel): boolean => m.name.toLowerCase().includes(query));
  });

  protected readonly _listRoute = '/collection/consoles';
  protected readonly _hardwareModelType = 'console' as const;
  protected readonly _i18nLoadError = 'consolesPage.snack.loadError';

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
   * Fetches the console item by user and id from the use case.
   *
   * @param {string} userId - Authenticated user UUID
   * @param {string} id - Console UUID
   */
  protected async _fetchHardware(userId: string, id: string): Promise<unknown> {
    return this._consoleUseCases.getById(userId, id);
  }

  constructor() {
    super();
    // Al seleccionar una marca en retro-search, el FormControl se actualiza.
    // Reaccionar a esos cambios para cargar la cascada modelo → edición.
    this.form.controls.brandId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((brandId: string | null) => void this.onBrandChange(brandId));
    this.form.controls.modelId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((modelId: string | null) => void this.onModelChange(modelId));
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
   * Actualiza el query de búsqueda de marca para filtrar las opciones visibles.
   *
   * @param {string} query - Texto escrito por el usuario en el campo de búsqueda de marca
   */
  onBrandQuery(query: string): void {
    this._brandSearchQuery.set(query);
  }

  /**
   * Actualiza el query de búsqueda de modelo para filtrar las opciones visibles.
   *
   * @param {string} query - Texto escrito por el usuario en el campo de búsqueda de modelo
   */
  onModelQuery(query: string): void {
    this._modelSearchQuery.set(query);
  }

  /**
   * Actualiza el query de búsqueda de tienda para filtrar las opciones visibles.
   *
   * @param {string} query - Texto escrito por el usuario en el campo de búsqueda de tienda
   */
  onStoreQuery(query: string): void {
    this._storeSearchQuery.set(query);
  }

  /**
   * Validates the form and saves the console (create or update).
   * Navigates back to the list on success.
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    const value = this.form.getRawValue() as ConsoleFormValue;
    const userId = this._userContext.requireUserId();

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!value.brandId || !uuidRegex.test(value.brandId) || !value.modelId || !uuidRegex.test(value.modelId)) {
      this._snack.open({
        text: this._transloco.translate('consolePage.snack.selectBrandModel'),
        duration: 3000,
        variant: 'warning'
      });
      return;
    }

    const basePayload: Omit<ConsoleModel, 'id'> = {
      userId,
      brandId: value.brandId,
      modelId: value.modelId,
      editionId: value.editionId,
      region: value.region,
      condition: value.condition,
      price: value.price,
      store: value.store,
      purchaseDate: value.purchaseDate ? value.purchaseDate.toLocaleDateString('sv-SE') : null,
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

    const isEdit = this.isEditMode() && this._consoleId;
    const successKey = isEdit ? 'consolePage.snack.updated' : 'consolePage.snack.saved';

    await this._executeSubmit(
      () =>
        isEdit
          ? this._consoleUseCases.update(userId, this._consoleId!, { id: this._consoleId!, ...basePayload })
          : this._consoleUseCases.add(userId, { id: '', ...basePayload }),
      successKey,
      'consolePage.snack.saveError'
    );
  }

  /**
   * Loads the console data for editing and patches the form.
   * Pre-loads the brand → model → edition hierarchy before patching.
   *
   * @param {string} id - Console UUID to edit
   */
  private async _loadConsole(id: string): Promise<void> {
    const item = await this._loadHardwareForEdit(id);
    if (!item) return;
    const console = item as ConsoleModel;
    await this._loadBrandCascade(console.brandId, console.modelId);
    this.form.patchValue({
      brandId: console.brandId,
      modelId: console.modelId,
      editionId: console.editionId,
      region: console.region,
      condition: console.condition,
      price: console.price,
      store: console.store,
      purchaseDate: console.purchaseDate ? new Date(console.purchaseDate + 'T00:00:00') : null,
      notes: console.notes
    });
  }
}
