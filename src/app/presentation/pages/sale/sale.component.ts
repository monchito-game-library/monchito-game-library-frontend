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
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';
import { LibSpinnerComponent } from '@/lib/lib-spinner/lib-spinner.component';
import { LibSnackbarService } from '@/services/lib-snackbar/lib-snackbar.service';
import { LibTabsComponent } from '@/lib/lib-tabs/lib-tabs.component';
import { LibTabComponent } from '@/lib/lib-tabs/lib-tab.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AvailableItemModel, MarketItemType, SoldItemModel } from '@/models/market/market-item.model';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { MARKET_USE_CASES, MarketUseCasesContract } from '@/domain/use-cases/market/market.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { marketRepositoryProvider } from '@/di/repositories/market.repository.provider';
import { marketUseCasesProvider } from '@/di/use-cases/market.use-cases.provider';
import { SaleFilterType, SaleTab } from '@/types/sale-page.type';
import { Router } from '@angular/router';

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
    LibIconComponent,
    LibTabsComponent,
    LibTabComponent,
    TranslocoPipe,
    LibSpinnerComponent
  ]
})
export class SaleComponent implements OnInit {
  private readonly _marketUseCases: MarketUseCasesContract = inject(MARKET_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _router: Router = inject(Router);
  private readonly _snack: LibSnackbarService = inject(LibSnackbarService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Active tab: 'available' or 'history'. */
  readonly activeTab: WritableSignal<SaleTab> = signal<SaleTab>('available');

  /** Active item type filter. */
  readonly activeFilter: WritableSignal<SaleFilterType> = signal<SaleFilterType>('all');

  /** True while initial data is loading. */
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

  /** Total value of available items in the filtered view. */
  readonly totalAvailable: Signal<number> = computed(() =>
    this.filteredAvailable().reduce((acc, i) => acc + (i.salePrice ?? 0), 0)
  );

  /** Total revenue from sold items in the filtered view. */
  readonly totalSold: Signal<number> = computed(() =>
    this.filteredSold().reduce((acc, i) => acc + (i.soldPriceFinal ?? 0), 0)
  );

  async ngOnInit(): Promise<void> {
    const userId = this._userContext.userId();
    if (!userId) return;
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
   * Switches the active tab.
   *
   * @param {SaleTab} tab - Tab to activate
   */
  setTab(tab: SaleTab): void {
    this.activeTab.set(tab);
    this.activeFilter.set('all');
  }

  /**
   * Callback para selectedIndexChange de lib-tabs.
   * Mapea el índice numérico a la clave SaleTab correspondiente.
   *
   * @param {number} index - Índice del tab seleccionado (0 = available, 1 = history).
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
