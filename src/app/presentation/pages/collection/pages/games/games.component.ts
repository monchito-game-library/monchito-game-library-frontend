import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { GameListModel } from '@/models/game/game-list.model';
import { StoreModel } from '@/models/store/store.model';
import { PlatformType } from '@/types/platform.type';
import { GameFormatType } from '@/types/game-format.type';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { availableGameStatuses } from '@/constants/game-status.constant';
import { GameStatusOption } from '@/interfaces/game-status-option.interface';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';
import { GameCardComponent } from '@/pages/collection/pages/games/components/game-card/game-card.component';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { GameListFiltersSheetComponent } from '@/pages/collection/pages/games/components/game-list-filters-sheet/game-list-filters-sheet.component';
import { GameListFiltersSheetData } from '@/interfaces/game-list-filters-sheet.interface';
import { GameListSortField } from '@/types/game-list-sort-field.type';
import { ListPageHeaderComponent } from '@/pages/collection/components/list-page-header/list-page-header.component';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    MatButton,
    MatFabButton,
    MatIcon,
    TranslocoPipe,
    GameCardComponent,
    RouterLink,
    SkeletonComponent,
    ListPageHeaderComponent
  ]
})
export class GamesComponent implements OnInit, OnDestroy {
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _router: Router = inject(Router);
  private readonly _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly _bottomSheet: MatBottomSheet = inject(MatBottomSheet);
  private _bpSubscription?: Subscription;
  private _searchDebounce?: Subscription;
  private readonly _searchInput$ = new Subject<string>();

  // Saves scroll position on each scroll event so it survives the browser resetting
  // scrollTop to 0 when the element is detached from the DOM during navigation.
  private readonly _onViewportScroll = (e: Event): void => {
    const t = e.target as HTMLElement;
    if (t.classList.contains('game-list__grid')) {
      this._userPreferencesState.gameListScrollOffset.set(t.scrollTop);
    }
  };

  @ViewChild('scrollContainer')
  private _scrollContainer?: ElementRef<HTMLElement>;

  /** Available platform options used to populate the platform filter. */
  readonly consoles: AvailablePlatformInterface[] = availablePlatformsConstant;

  /** Store list loaded from Supabase, used to populate the store filter. */
  readonly stores: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);

  /** Available game status options used to populate the status filter. */
  readonly gameStatuses: GameStatusOption[] = availableGameStatuses;

  /** Indicates whether games are being loaded from Supabase. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  /** Full list of games in the user's collection. */
  readonly allGames: WritableSignal<GameListModel[]> = signal<GameListModel[]>([]);

  /** Current value of the title search input. */
  readonly searchTerm: WritableSignal<string> = signal('');

  /** Currently selected platform filter, or empty string for no filter. */
  readonly selectedConsole: WritableSignal<'' | PlatformType> = signal<PlatformType | ''>('');

  /** Currently selected store filter, or empty string for no filter. */
  readonly selectedStore: WritableSignal<string> = signal('');

  /** Currently selected status filter, or empty string for no filter. */
  readonly selectedStatus: WritableSignal<string> = signal('');

  /** Currently selected format filter, or empty string for no filter. */
  readonly selectedFormat: WritableSignal<'' | GameFormatType> = signal<'' | GameFormatType>('');

  /** Whether only favourite games are shown. */
  readonly onlyFavorites: WritableSignal<boolean> = signal(false);

  /** Whether only loaned games are shown. */
  readonly onlyLoaned: WritableSignal<boolean> = signal(false);

  /** Icon shown in the total-games stat, changes based on the active format filter. */
  readonly formatFilterIcon: Signal<string> = computed((): string => {
    const fmt = this.selectedFormat();
    if (fmt === 'physical') return 'album';
    if (fmt === 'digital') return 'cloud';
    return 'sports_esports';
  });

  /** Field used to sort the game list. */
  readonly sortBy: WritableSignal<GameListSortField> = signal('title');

  /** Sort direction applied to the current sort field. */
  readonly sortDirection: WritableSignal<'asc' | 'desc'> = signal('asc');

  /** Number of columns in the virtual scroll grid, updated by the breakpoint observer. */
  readonly columnCount: WritableSignal<number> = signal<number>(this._columnCountFromWidth(window.innerWidth));

  /** Whether the viewport is in mobile range (≤ 768px). */
  readonly isMobile: WritableSignal<boolean> = signal<boolean>(window.innerWidth <= 768);

  /** Number of non-search filters currently active, shown as a badge on the mobile filter button. */
  readonly activeFilterCount: Signal<number> = computed((): number => {
    let count = 0;
    if (this.selectedConsole()) count++;
    if (this.selectedStore()) count++;
    if (this.selectedStatus()) count++;
    if (this.selectedFormat()) count++;
    if (this.onlyFavorites()) count++;
    if (this.onlyLoaned()) count++;
    return count;
  });

  /** Filtered and sorted game list. */
  readonly filteredGames: Signal<GameListModel[]> = computed((): GameListModel[] => {
    const search = this.searchTerm().toLowerCase();
    const platform = this.selectedConsole();
    const store = this.selectedStore();
    const status = this.selectedStatus();
    const format = this.selectedFormat();
    const favorites = this.onlyFavorites();
    const loaned = this.onlyLoaned();

    let filtered = this.allGames().filter((game: GameListModel): boolean => {
      const matchesSearch = game.title.toLowerCase().includes(search);
      const matchesPlatform = platform ? game.platform === platform : true;
      const matchesStore = store ? game.store === store : true;
      const matchesStatus = status ? game.status === status : true;
      const matchesFormat = format ? game.format === format : true;
      const matchesFavorites = favorites ? game.isFavorite : true;
      const matchesLoaned = loaned ? game.activeLoanId !== null : true;
      return (
        matchesSearch &&
        matchesPlatform &&
        matchesStore &&
        matchesStatus &&
        matchesFormat &&
        matchesFavorites &&
        matchesLoaned
      );
    });

    const sortBy = this.sortBy();
    const direction = this.sortDirection();
    filtered = filtered.sort((a: GameListModel, b: GameListModel): number => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'personal_rating':
          comparison = (a.personalRating || 0) - (b.personalRating || 0);
          break;
        case 'created_at':
        default:
          comparison = (b.id || 0) - (a.id || 0);
          break;
      }
      return direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  /** Total number of games in the filtered list. */
  readonly ownedCount: Signal<number> = computed((): number => this.filteredGames().length);

  /** Number of filtered games with platinum status. */
  readonly platinumCount: Signal<number> = computed(
    (): number => this.filteredGames().filter((g: GameListModel): boolean => g.status === 'platinum').length
  );

  /** Sum of prices for all filtered games. */
  readonly totalPrice: Signal<number> = computed((): number =>
    this.filteredGames().reduce((acc: number, game: GameListModel): number => acc + (game.price || 0), 0)
  );

  async ngOnInit(): Promise<void> {
    this._searchDebounce = this._searchInput$
      .pipe(debounceTime(300))
      .subscribe((value: string) => this.searchTerm.set(value));

    void this._loadStores();

    // Show cache immediately if available while reloading from Supabase
    document.addEventListener('scroll', this._onViewportScroll, { capture: true, passive: true });

    const cached = this._userPreferencesState.allGames();
    if (cached.length > 0) {
      this.allGames.set(cached);
      this.loading.set(false);
    }

    // Always force a refresh on mount to reflect sales, loans or any change
    // made from the detail view. NavigationEnd subscription was unreliable because
    // the component is destroyed on navigation and NavigationEnd can fire before
    // the subscription is registered after to await.
    await this._loadGames(true);

    // Scroll restoration runs after _loadGames so the viewport exists (loading=false).
    // The offset was saved in real-time by _onViewportScroll, so it survives the
    // skeleton phase even though the browser resets scrollTop on DOM detachment.
    this._restoreScrollPosition();

    this._bpSubscription = this._breakpointObserver
      .observe([
        '(max-width: 600px)',
        '(max-width: 768px)',
        '(max-width: 900px)',
        '(max-width: 1200px)',
        '(max-width: 1600px)'
      ])
      .subscribe((state) => {
        this.isMobile.set(state.breakpoints['(max-width: 768px)']);
        if (state.breakpoints['(max-width: 600px)']) this.columnCount.set(2);
        else if (state.breakpoints['(max-width: 900px)']) this.columnCount.set(3);
        else if (state.breakpoints['(max-width: 1200px)']) this.columnCount.set(4);
        else if (state.breakpoints['(max-width: 1600px)']) this.columnCount.set(5);
        else this.columnCount.set(6);
      });
  }

  ngOnDestroy(): void {
    this._bpSubscription?.unsubscribe();
    this._searchDebounce?.unsubscribe();
    document.removeEventListener('scroll', this._onViewportScroll, true);
  }

  /**
   * Clears all active filters.
   */
  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedConsole.set('');
    this.selectedStore.set('');
    this.selectedStatus.set('');
    this.selectedFormat.set('');
    this.onlyFavorites.set(false);
    this.onlyLoaned.set(false);
  }

  /**
   * Handles a game-deleted event from the card component.
   * The card has already performed to delete — this only reloads the list and shows a snack.
   */
  async onGameDeleted(): Promise<void> {
    await this._loadGames(true);
    this._snackBar.open(
      this._transloco.translate('gameList.snack.deleted'),
      this._transloco.translate('common.close'),
      { duration: 2000 }
    );
  }

  /**
   * Updates the search term from the value emitted by the header.
   *
   * @param {string} value - New value of the search input
   */
  onSearchInput(value: string): void {
    this._searchInput$.next(value.trim());
  }

  /**
   * Navigates to the add-game form.
   */
  onAdd(): void {
    void this._router.navigate(['/collection/games/add']);
  }

  /**
   * Opens the filters bottom sheet on mobile, passing the active filter signals as shared state.
   * Changes made inside the sheet are reflected immediately in the list.
   */
  openFiltersSheet(): void {
    const data: GameListFiltersSheetData = {
      selectedConsole: this.selectedConsole,
      selectedStore: this.selectedStore,
      selectedStatus: this.selectedStatus,
      selectedFormat: this.selectedFormat,
      onlyFavorites: this.onlyFavorites,
      onlyLoaned: this.onlyLoaned,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      stores: this.stores,
      clearAllFilters: () => this.clearAllFilters()
    };
    this._bottomSheet.open(GameListFiltersSheetComponent, { data });
  }

  /**
   * Returns the column count for a given viewport width, matching the breakpoint thresholds
   * used by BreakpointObserver so the skeleton renders with the correct grid from the start.
   *
   * @param {number} width - Viewport width in pixels
   */
  private _columnCountFromWidth(width: number): number {
    if (width <= 600) return 2;
    if (width <= 900) return 3;
    if (width <= 1200) return 4;
    if (width <= 1600) return 5;
    return 6;
  }

  /**
   * Loads all stores from Supabase to populate the store filter.
   */
  private async _loadStores(): Promise<void> {
    try {
      const stores: StoreModel[] = await this._storeUseCases.getAllStores();
      this.stores.set(stores);
    } catch {
      // Intentionally empty catch: filter will simply show no store options
    }
  }

  /**
   * Schedules scroll restoration after the next DOM render via afterNextRender,
   * ensuring @ViewChild is resolved and the CDK viewport is mounted before scrolling.
   */
  private _restoreScrollPosition(): void {
    const offset: number = this._userPreferencesState.gameListScrollOffset();
    if (offset <= 0) return;
    // One rAF is enough: Angular has updated the DOM and the browser can compute
    // the container height before applying scrollTop.
    requestAnimationFrame(() => {
      if (this._scrollContainer) {
        this._scrollContainer.nativeElement.scrollTop = offset;
      }
    });
  }

  /**
   * Loads the user's game collection, using the shared cache on first load.
   * Pass forceRefresh=true to always fetch from Supabase (after edits or deletions).
   *
   * @param {boolean} forceRefresh - Whether to bypass the shared cache
   */
  private async _loadGames(forceRefresh: boolean): Promise<void> {
    const cached = this._userPreferencesState.allGames();
    if (!forceRefresh && cached.length > 0) {
      this.allGames.set(cached);
      this.loading.set(false);
      return;
    }

    const userId: string | null = this._userContext.userId();
    if (!userId) return;

    this.loading.set(true);
    try {
      const data: GameListModel[] = await this._gameUseCases.getAllGamesForList(userId);
      this.allGames.set(data);
      this._userPreferencesState.allGames.set(data);
    } catch {
      this._snackBar.open(
        this._transloco.translate('gameList.snack.loadError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.loading.set(false);
    }
  }
}
