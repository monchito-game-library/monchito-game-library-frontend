import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { availableGameStatuses } from '@/constants/game-status.constant';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { ActiveFilterChipInterface } from '@/interfaces/active-filter-chip.interface';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { GameListFiltersSheetData } from '@/interfaces/game-list-filters-sheet.interface';
import { GameStatusOption } from '@/interfaces/game-status-option.interface';

@Component({
  selector: 'app-game-list-filters-bar',
  templateUrl: './game-list-filters-bar.component.html',
  styleUrl: './game-list-filters-bar.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, TranslocoPipe]
})
export class GameListFiltersBarComponent {
  /** Filter state shared with the games page — mutations are reflected live in the list. */
  readonly data = input.required<GameListFiltersSheetData>();

  /** Available platform options used to resolve chip labels. */
  readonly consoles: AvailablePlatformInterface[] = availablePlatformsConstant;

  /** Available status options used to resolve chip labels. */
  readonly gameStatuses: GameStatusOption[] = availableGameStatuses;

  /** Active filters expressed as removable chips. Empty when no filters are applied. */
  readonly activeChips: Signal<ActiveFilterChipInterface[]> = computed((): ActiveFilterChipInterface[] => {
    const d: GameListFiltersSheetData = this.data();
    const chips: ActiveFilterChipInterface[] = [];

    const platformCode: string = d.selectedConsole();
    if (platformCode) {
      const console: AvailablePlatformInterface | undefined = this.consoles.find(
        (c: AvailablePlatformInterface): boolean => c.code === platformCode
      );
      chips.push({
        key: `platform-${platformCode}`,
        icon: 'sports_esports',
        labelKey: console?.labelKey,
        onRemove: (): void => d.selectedConsole.set('')
      });
    }

    const storeId: string = d.selectedStore();
    if (storeId) {
      const store = d.stores().find((s) => s.id === storeId);
      chips.push({
        key: `store-${storeId}`,
        icon: 'storefront',
        label: store?.label,
        onRemove: (): void => d.selectedStore.set('')
      });
    }

    const format: string = d.selectedFormat();
    if (format) {
      chips.push({
        key: `format-${format}`,
        icon: format === 'physical' ? 'album' : 'cloud',
        labelKey: format === 'physical' ? 'gameList.filters.physical' : 'gameList.filters.digital',
        onRemove: (): void => d.selectedFormat.set('')
      });
    }

    const statusCode: string = d.selectedStatus();
    if (statusCode) {
      const status: GameStatusOption | undefined = this.gameStatuses.find(
        (s: GameStatusOption): boolean => s.code === statusCode
      );
      chips.push({
        key: `status-${statusCode}`,
        icon: status?.icon,
        iconColor: status?.color,
        labelKey: status?.labelKey,
        onRemove: (): void => d.selectedStatus.set('')
      });
    }

    if (d.onlyFavorites()) {
      chips.push({
        key: 'favorites',
        icon: 'favorite',
        iconColor: 'var(--mat-sys-error)',
        labelKey: 'gameList.aria.onlyFavorites',
        onRemove: (): void => d.onlyFavorites.set(false)
      });
    }

    if (d.onlyLoaned()) {
      chips.push({
        key: 'loaned',
        icon: 'handshake',
        labelKey: 'gameList.aria.onlyLoaned',
        onRemove: (): void => d.onlyLoaned.set(false)
      });
    }

    return chips;
  });
}
