import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroSpinnerComponent } from '@retro/retro-spinner/retro-spinner.component';
import { RetroSnackbarService } from '@retro/retro-snackbar/services/retro-snackbar.service';
import { RetroTabsComponent } from '@retro/retro-tabs/retro-tabs.component';
import { RetroTabComponent } from '@retro/retro-tabs/components/retro-tab/retro-tab.component';
import { RetroListComponent } from '@retro/retro-list/retro-list.component';
import { RetroListItemComponent } from '@retro/retro-list/components/retro-list-item/retro-list-item.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AvailableItemModel, MarketItemType, SoldItemModel } from '@/models/market/market-item.model';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { BREAKPOINTS } from '@/constants/breakpoints.constant';
import { MARKET_USE_CASES, MarketUseCasesContract } from '@/domain/use-cases/market/market.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { marketRepositoryProvider } from '@/di/repositories/market.repository.provider';
import { marketUseCasesProvider } from '@/di/use-cases/market.use-cases.provider';
import { SaleFilterType, SaleTab } from '@/types/sale-page.type';
import { SearchToolbarComponent } from '@/components/search-toolbar/search-toolbar.component';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [marketRepositoryProvider, marketUseCasesProvider],
  imports: [
    CurrencyPipe,
    DatePipe,
    RetroIconComponent,
    RetroTabsComponent,
    RetroTabComponent,
    RetroListComponent,
    RetroListItemComponent,
    TranslocoPipe,
    RetroSpinnerComponent,
    SearchToolbarComponent
  ]
})
export class SaleComponent implements OnInit {
  private readonly _marketUseCases: MarketUseCasesContract = inject(MARKET_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _snack: RetroSnackbarService = inject(RetroSnackbarService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  /** True cuando el viewport es ≤ 768px (móvil). Oculta los labels de los tabs. */
  readonly isMobile: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Tab activo, derivado de la URL (`/sale/available` o `/sale/history`).
   * Single source of truth: la ruta. Se actualiza vía `route.url`.
   */
  readonly activeTab: WritableSignal<SaleTab> = signal<SaleTab>('available');

  /** Índice numérico del tab activo para `<retro-tabs [selectedIndex]>`. */
  readonly selectedIndex: Signal<number> = computed(() => (this.activeTab() === 'history' ? 1 : 0));

  /** Active item type filter. */
  readonly activeFilter: WritableSignal<SaleFilterType> = signal<SaleFilterType>('all');

  /** Search term applied on top of the type filter. */
  readonly searchTerm: WritableSignal<string> = signal<string>('');

  /** True mientras initial data is loading. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  /** All items currently listed for sale. */
  readonly availableItems: WritableSignal<AvailableItemModel[]> = signal<AvailableItemModel[]>([]);

  /** Full sale history. */
  readonly soldItems: WritableSignal<SoldItemModel[]> = signal<SoldItemModel[]>([]);

  /** Available items filtered by the active type filter. */
  readonly filteredAvailable: Signal<AvailableItemModel[]> = computed(() => {
    const filter = this.activeFilter();
    const items = this.availableItems();
    return filter === 'all' ? items : items.filter((i) => i.itemType === filter);
  });

  /** Sold items filtered by the active type filter. */
  readonly filteredSold: Signal<SoldItemModel[]> = computed(() => {
    const filter = this.activeFilter();
    const items = this.soldItems();
    return filter === 'all' ? items : items.filter((i) => i.itemType === filter);
  });

  /** Available items filtered by active type filter and normalized search term. */
  readonly filteredByNameAvailable: Signal<AvailableItemModel[]> = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const items = this.filteredAvailable();
    if (!term) return items;
    return items.filter((i) => i.itemName.toLowerCase().includes(term));
  });

  /** Sold items filtered by active type filter and normalized search term. */
  readonly filteredByNameSold: Signal<SoldItemModel[]> = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const items = this.filteredSold();
    if (!term) return items;
    return items.filter((i) => i.itemName.toLowerCase().includes(term));
  });

  /** Flags for retro-command-bar shown inside the search toolbar. */
  readonly commandFlags: Signal<readonly string[]> = computed((): readonly string[] => {
    const term = this.searchTerm();
    return term ? [`search="${term}"`] : [];
  });

  /** Total value of available items in the filtered view. */
  readonly totalAvailable: Signal<number> = computed(() =>
    this.filteredByNameAvailable().reduce((acc, i) => acc + (i.salePrice ?? 0), 0)
  );

  /** Total revenue from sold items in the filtered view. */
  readonly totalSold: Signal<number> = computed(() =>
    this.filteredByNameSold().reduce((acc, i) => acc + (i.soldPriceFinal ?? 0), 0)
  );

  constructor() {
    // Deriva `activeTab` desde los segmentos de la URL. Como la ruta
    // `/sale*` usa un matcher que mantiene la misma instancia del componente
    // para `/sale`, `/sale/available` y `/sale/history`, este observable
    // emite cada vez que el navegador cambia entre pestañas sin destruir
    // el componente.
    this._route.url.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((segments) => {
      const last = segments[segments.length - 1];
      const next: SaleTab = last?.path === 'history' ? 'history' : 'available';
      const previous = this.activeTab();
      this.activeTab.set(next);
      // Resetea el filtro solo cuando el tab realmente cambia para no
      // machacar la selección del usuario al navegar entre rutas hermanas.
      if (previous !== next) {
        this.activeFilter.set('all');
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const userId = this._userContext.userId();
    if (!userId) {
      this.loading.set(false);
      return;
    }
    this._breakpointObserver
      .observe([`(max-width: ${BREAKPOINTS.mobile}px)`])
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((state): void => {
        this.isMobile.set(state.matches);
      });
    try {
      const [available, sold] = await Promise.all([
        this._marketUseCases.getAvailableItems(userId),
        this._marketUseCases.getSoldItems(userId)
      ]);
      this.availableItems.set(available);
      this.soldItems.set(sold);
    } catch {
      this._snack.open({
        text: this._transloco.translate('salePage.snack.loadError'),
        duration: 3000,
        variant: 'error'
      });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cambia la pestaña navegando a la subruta correspondiente. La
   * actualización reactiva de `activeTab` la hace la suscripción a
   * `route.url` en el constructor, evitando entradas duplicadas.
   *
   * @param {SaleTab} tab - Tab al que navegar ('available' o 'history')
   */
  setTab(tab: SaleTab): void {
    if (this.activeTab() === tab) return;
    void this._router.navigate(['/sale', tab]);
  }

  /**
   * Callback para `selectedIndexChange` de `<retro-tabs>`. Mapea el
   * índice numérico a la clave `SaleTab` correspondiente y delega en
   * `setTab`, que se encarga de la navegación.
   *
   * @param {number} index - Índice del tab (0 = available, 1 = history)
   */
  onTabIndexChange(index: number): void {
    this.setTab(index === 0 ? 'available' : 'history');
  }

  /**
   * Sets the item type filter.
   *
   * @param {SaleFilterType} filter - Filter to apply
   */
  setFilter(filter: SaleFilterType): void {
    this.activeFilter.set(filter);
  }

  /**
   * Updates the search term with the value emitted by SearchToolbarComponent
   * (already debounced inside the component).
   *
   * @param {string} value - Raw search value typed by the user
   */
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  /**
   * Returns the translated detail-right label for the secondary info row.
   * For games, translates the platform key (e.g. 'ps5' → 'PlayStation 5').
   * For consoles and controllers, returns the brand name as-is.
   *
   * @param {AvailableItemModel | SoldItemModel} item
   */
  getDetailRight(item: AvailableItemModel | SoldItemModel): string | null {
    if (!item.detailRight) return null;
    if (item.itemType === 'game') {
      const platform = availablePlatformsConstant.find((p) => p.code === item.detailRight);
      return platform ? this._transloco.translate(platform.labelKey) : item.detailRight;
    }
    return item.detailRight;
  }

  /**
   * Returns the Material icon for an item type.
   *
   * @param {MarketItemType} type - Item type
   */
  typeIcon(type: MarketItemType): string {
    const icons: Record<MarketItemType, string> = {
      game: 'sports_esports',
      console: 'tv',
      controller: 'gamepad'
    };
    return icons[type];
  }

  /**
   * Navigates to the detail page of the clicked item.
   *
   * @param {MarketItemType} type - Item type to determine the route segment
   * @param {string} id - Item identifier
   */
  onItemClick(type: MarketItemType, id: string): void {
    const segment: Record<MarketItemType, string> = {
      game: 'games',
      console: 'consoles',
      controller: 'controllers'
    };
    void this._router.navigate(['/collection', segment[type], id]);
  }
}
