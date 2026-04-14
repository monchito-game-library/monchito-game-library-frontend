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
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ConsoleForm, ConsoleFormValue } from '@/interfaces/forms/console-form.interface';
import { ConsoleModel } from '@/models/console/console.model';
import { StoreModel } from '@/models/store/store.model';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
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
    MatError,
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
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Available console regions for the region selector. */
  readonly availableRegions = availableConsoleRegions;

  /** GAME_CONDITION constant exposed to the template. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** True when editing an existing console, false when creating. */
  readonly isEditMode: WritableSignal<boolean> = signal<boolean>(false);

  /** True while loading the console data in edit mode. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** True while the save operation is in progress. */
  readonly saving: WritableSignal<boolean> = signal<boolean>(false);

  /** Reactive form for the console data. */
  readonly form: FormGroup<ConsoleForm> = this._fb.group<ConsoleForm>({
    brand: this._fb.control<string | null>(null, Validators.required),
    model: this._fb.control<string | null>(null, Validators.required),
    edition: this._fb.control<string | null>(null),
    region: this._fb.control<ConsoleRegionType | null>(null),
    condition: this._fb.nonNullable.control<GameConditionType>(GAME_CONDITION.USED),
    price: this._fb.control<number | null>(null),
    store: this._fb.control<string | null>(null),
    purchaseDate: this._fb.control<string | null>(null),
    notes: this._fb.control<string | null>(null)
  });

  private readonly _storeModels: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);

  private readonly _storeInput: Signal<string | null> = toSignal(this.form.controls.store.valueChanges, {
    initialValue: null
  });

  /** Stores filtered by the current autocomplete input value. */
  readonly filteredStores: Signal<StoreModel[]> = computed((): StoreModel[] => {
    const input: string = this._storeInput()?.toString().toLowerCase() ?? '';
    return this._storeModels().filter((s: StoreModel): boolean => s.label.toLowerCase().includes(input));
  });

  private _consoleId: string | null = null;

  async ngOnInit(): Promise<void> {
    void this._loadStores();
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this._consoleId = id;
      this.isEditMode.set(true);
      await this._loadConsole(id);
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
   * Valida el formulario y guarda la consola (creación o actualización).
   * Navega de vuelta a la lista si tiene éxito.
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    try {
      const value = this.form.getRawValue() as ConsoleFormValue;
      const userId = this._userContext.requireUserId();

      if (this.isEditMode() && this._consoleId) {
        const updated: ConsoleModel = {
          id: this._consoleId,
          userId,
          brand: value.brand!,
          model: value.model!,
          edition: value.edition,
          region: value.region,
          condition: value.condition,
          price: value.price,
          store: value.store,
          purchaseDate: value.purchaseDate,
          notes: value.notes,
          createdAt: ''
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
          brand: value.brand!,
          model: value.model!,
          edition: value.edition,
          region: value.region,
          condition: value.condition,
          price: value.price,
          store: value.store,
          purchaseDate: value.purchaseDate,
          notes: value.notes,
          createdAt: ''
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
   * Carga la lista de tiendas disponibles desde Supabase.
   */
  private async _loadStores(): Promise<void> {
    try {
      const stores: StoreModel[] = await this._storeUseCases.getAllStores();
      this._storeModels.set(stores);
    } catch {
      // Fallo silencioso: el campo se convierte en texto libre
    }
  }

  /**
   * Carga los datos de la consola a editar y parchea el formulario.
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
      this.form.patchValue({
        brand: console.brand,
        model: console.model,
        edition: console.edition,
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
