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
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AvailableItemModel, SoldItemModel, MarketItemType } from '@/models/market/market-item.model';
import { MARKET_USE_CASES, MarketUseCasesContract } from '@/domain/use-cases/market/market.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { marketRepositoryProvider } from '@/di/repositories/market.repository.provider';
import { marketUseCasesProvider } from '@/di/use-cases/market.use-cases.provider';
import { SaleTab, SaleFilterType } from '@/types/sale-page.type';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [marketRepositoryProvider, marketUseCasesProvider],
  imports: [CurrencyPipe, DatePipe, MatIcon, MatProgressSpinner, TranslocoPipe]
})
export class SaleComponent implements OnInit {
  private readonly _marketUseCases: MarketUseCasesContract = inject(MARKET_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Active tab: 'available' (en venta) or 'history' (historial). */
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
      this._snackBar.open(this._transloco.translate('salePage.snack.loadError'), undefined, { duration: 3000 });
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
   * Sets the item type filter.
   *
   * @param {SaleFilterType} filter - Filter to apply
   */
  setFilter(filter: SaleFilterType): void {
    this.activeFilter.set(filter);
  }

  /**
   * Returns the i18n key for an item type chip label.
   *
   * @param {MarketItemType} type - Item type
   */
  typeKey(type: MarketItemType): string {
    return `salePage.type.${type}`;
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
}
