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
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { ControllerModel } from '@/models/controller/controller.model';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
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
import { UserContextService } from '@/services/user-context.service';
import { GAME_CONDITION } from '@/constants/game-condition.constant';
import { ListPageHeaderComponent } from '@/pages/collection/components/list-page-header/list-page-header.component';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButton,
    MatFabButton,
    MatIcon,
    MatProgressSpinner,
    TranslocoPipe,
    SkeletonComponent,
    ListPageHeaderComponent
  ]
})
export class ControllersComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  private readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  private readonly _stores: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);
  private readonly _brands: WritableSignal<HardwareBrandModel[]> = signal<HardwareBrandModel[]>([]);
  private readonly _hardwareModels: WritableSignal<HardwareModelModel[]> = signal<HardwareModelModel[]>([]);

  /** Condition constant exposed to the template for comparisons. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** Text entered in the search input. */
  readonly searchQuery: WritableSignal<string> = signal<string>('');

  /** List of controllers owned by the user. */
  readonly controllers: WritableSignal<ControllerModel[]> = signal<ControllerModel[]>([]);

  /** True while the initial data load is in progress. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  /** Controllers filtered by searchQuery against model name and brand name. */
  readonly filteredControllers: Signal<ControllerModel[]> = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.controllers();
    return this.controllers().filter((c: ControllerModel) => {
      const modelName = this._hardwareModels().find((m: HardwareModelModel) => m.id === c.modelId)?.name ?? '';
      const brandName = this._brands().find((b: HardwareBrandModel) => b.id === c.brandId)?.name ?? '';
      return modelName.toLowerCase().includes(q) || brandName.toLowerCase().includes(q);
    });
  });

  /** Sum of prices for all filtered controllers. */
  readonly totalSpent: Signal<number> = computed((): number =>
    this.filteredControllers().reduce((acc: number, c: ControllerModel): number => acc + (c.price ?? 0), 0)
  );

  async ngOnInit(): Promise<void> {
    await Promise.all([this._loadControllers(), this._loadStores(), this._loadCatalog()]);
  }

  /**
   * Returns the store name for the given UUID.
   * Falls back to the raw id for legacy data.
   *
   * @param {string | null} id - Store UUID
   */
  resolveStoreName(id: string | null): string {
    if (!id) return '';
    const store: StoreModel | undefined = this._stores().find((s: StoreModel): boolean => s.id === id);
    return store?.label ?? id;
  }

  /**
   * Returns the brand name for the given UUID.
   *
   * @param {string | null} id - Brand UUID
   */
  resolveBrandName(id: string | null): string {
    if (!id) return '—';
    return this._brands().find((b: HardwareBrandModel): boolean => b.id === id)?.name ?? '—';
  }

  /**
   * Returns the model name for the given UUID.
   *
   * @param {string | null} id - Hardware model UUID
   */
  resolveModelName(id: string | null): string {
    if (!id) return '—';
    return this._hardwareModels().find((m: HardwareModelModel): boolean => m.id === id)?.name ?? '—';
  }

  /**
   * Navigates to the detail screen for the given controller.
   *
   * @param {ControllerModel} controller - Controller to display
   */
  onDetail(controller: ControllerModel): void {
    this._router.navigate(['/collection/controllers', controller.id]);
  }

  /**
   * Navigates to the controller creation form.
   */
  onAdd(): void {
    this._router.navigate(['/collection/controllers/add']);
  }

  /**
   * Loads controller brands and models from the catalogue to resolve names in the list.
   */
  private async _loadCatalog(): Promise<void> {
    try {
      const [brands, models] = await Promise.all([
        this._brandUseCases.getAll(),
        this._modelUseCases.getAllByType('controller')
      ]);
      this._brands.set(brands);
      this._hardwareModels.set(models);
    } catch {
      // Silent failure: names will display '—'
    }
  }

  /**
   * Loads the list of available stores from Supabase.
   */
  private async _loadStores(): Promise<void> {
    try {
      const stores: StoreModel[] = await this._storeUseCases.getAllStores();
      this._stores.set(stores);
    } catch {
      // Silent failure
    }
  }

  /**
   * Loads all controllers for the current user from the use-case.
   */
  private async _loadControllers(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this._controllerUseCases.getAllForUser(this._userContext.requireUserId());
      this.controllers.set(data);
    } catch {
      this._snackBar.open(
        this._transloco.translate('controllersPage.snack.loadError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.loading.set(false);
    }
  }
}
