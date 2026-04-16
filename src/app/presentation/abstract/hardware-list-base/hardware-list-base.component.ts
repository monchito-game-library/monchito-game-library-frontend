import { computed, Directive, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';

import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { StoreModel } from '@/models/store/store.model';
import { HardwareModelType } from '@/types/hardware-model.type';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import {
  HARDWARE_BRAND_USE_CASES,
  HardwareBrandUseCasesContract
} from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import {
  HARDWARE_MODEL_USE_CASES,
  HardwareModelUseCasesContract
} from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { GAME_CONDITION } from '@/constants/game-condition.constant';

/**
 * Abstract base class that encapsulates shared state, injections and helper methods
 * common to hardware list components (ConsolesComponent, ControllersComponent).
 *
 * Subclasses must define the abstract route properties, the items signal,
 * the i18n error key, and implement ngOnInit.
 *
 * @template T - Hardware item type with at minimum id, modelId, brandId and price fields
 */
@Directive()
export abstract class HardwareListBaseComponent<
  T extends { id: string; modelId: string | null; brandId: string | null; price: number | null }
> {
  protected readonly _router: Router = inject(Router);
  protected readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  protected readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  protected readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  protected readonly _userContext: UserContextService = inject(UserContextService);
  protected readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  protected readonly _transloco: TranslocoService = inject(TranslocoService);

  protected readonly _stores: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);
  protected readonly _brands: WritableSignal<HardwareBrandModel[]> = signal<HardwareBrandModel[]>([]);
  protected readonly _hardwareModels: WritableSignal<HardwareModelModel[]> = signal<HardwareModelModel[]>([]);

  /** Condition constant exposed to the template for comparisons. */
  readonly GAME_CONDITION = GAME_CONDITION;

  /** Text entered in the search input. */
  readonly searchQuery: WritableSignal<string> = signal<string>('');

  /** True while the initial data load is in progress. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  /** Route navigated to when the user clicks the "add" button. */
  protected abstract readonly _listRoute: string;

  /** Route prefix used to build the detail URL: `[_detailRoute, item.id]`. */
  protected abstract readonly _detailRoute: string;

  /** Translation key used in the snackbar when the items load fails. */
  protected abstract readonly _i18nLoadError: string;

  /** Full list of items owned by the user. Implemented by each concrete subclass. */
  abstract readonly items: WritableSignal<T[]>;

  /** Items filtered by searchQuery against model name and brand name. */
  readonly filteredItems: Signal<T[]> = computed((): T[] => {
    const q: string = this.searchQuery().toLowerCase().trim();
    if (!q) return this.items();
    return this.items().filter((item: T): boolean => {
      const modelName: string =
        this._hardwareModels().find((m: HardwareModelModel): boolean => m.id === item.modelId)?.name ?? '';
      const brandName: string =
        this._brands().find((b: HardwareBrandModel): boolean => b.id === item.brandId)?.name ?? '';
      return modelName.toLowerCase().includes(q) || brandName.toLowerCase().includes(q);
    });
  });

  /** Sum of prices for all filtered items. */
  readonly totalSpent: Signal<number> = computed((): number =>
    this.filteredItems().reduce((acc: number, item: T): number => acc + (item.price ?? 0), 0)
  );

  abstract ngOnInit(): Promise<void>;

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
   * Navigates to the hardware creation form for this list type.
   */
  onAdd(): void {
    void this._router.navigate([this._listRoute]);
  }

  /**
   * Navigates to the detail screen for the given item.
   *
   * @param {T} item - Hardware item to display
   */
  onDetail(item: T): void {
    void this._router.navigate([this._detailRoute, item.id]);
  }

  /**
   * Loads hardware brands and models from the catalogue to resolve names in the list.
   * Subclasses provide the hardware type via the catalog call inside ngOnInit.
   *
   * @param {HardwareModelType} hardwareType - The type passed to getAllByType ('console' | 'controller')
   */
  protected async _loadCatalog(hardwareType: HardwareModelType): Promise<void> {
    try {
      const [brands, models] = await Promise.all([
        this._brandUseCases.getAll(),
        this._modelUseCases.getAllByType(hardwareType)
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
  protected async _loadStores(): Promise<void> {
    try {
      const stores: StoreModel[] = await this._storeUseCases.getAllStores();
      this._stores.set(stores);
    } catch {
      // Silent failure
    }
  }

  /**
   * Loads items using the provided async function.
   * Sets loading to true before the call and false after (success or error).
   * On error, opens a snackbar with the translated _i18nLoadError message.
   *
   * @param {() => Promise<T[]>} loadFn - Async function that fetches the items
   */
  protected async _loadItems(loadFn: () => Promise<T[]>): Promise<void> {
    this.loading.set(true);
    try {
      const data: T[] = await loadFn();
      this.items.set(data);
    } catch {
      this._snackBar.open(this._transloco.translate(this._i18nLoadError), this._transloco.translate('common.close'), {
        duration: 3000
      });
    } finally {
      this.loading.set(false);
    }
  }
}
