import { Directive, inject, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

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
import { UserContextService } from '@/services/user-context.service';
import { GAME_CONDITION } from '@/constants/game-condition.constant';

/**
 * Abstract base class that encapsulates shared state, injections and helper methods
 * common to hardware list components (ConsolesComponent, ControllersComponent).
 *
 * Subclasses must define the abstract route properties and implement ngOnInit.
 */
@Directive()
export abstract class HardwareListBaseComponent {
  protected readonly _router: Router = inject(Router);
  protected readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  protected readonly _brandUseCases: HardwareBrandUseCasesContract = inject(HARDWARE_BRAND_USE_CASES);
  protected readonly _modelUseCases: HardwareModelUseCasesContract = inject(HARDWARE_MODEL_USE_CASES);
  protected readonly _userContext: UserContextService = inject(UserContextService);

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
}
