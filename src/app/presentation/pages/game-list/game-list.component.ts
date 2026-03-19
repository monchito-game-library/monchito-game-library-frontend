import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { GameListModel } from '@/models/game/game-list.model';
import { StoreModel } from '@/models/store/store.model';
import { PlatformType } from '@/types/platform.type';
import { GameFormatType } from '@/types/game-format.type';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { availableGameStatuses, GameStatusOption } from '@/constants/game-status.constant';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import { GameCardComponent } from '@/components/game-card/game-card.component';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import {
  GameListFiltersSheetComponent,
  GameListFiltersSheetData,
  GameListSortField
} from '@/components/game-list-filters-sheet/game-list-filters-sheet.component';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    ScrollingModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatPrefix,
    TranslocoPipe,
    GameCardComponent,
    RouterLink,
    SkeletonComponent
  ]
})
export class GameListComponent implements OnInit, OnDestroy {
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _router: Router = inject(Router);
  private readonly _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private readonly _bottomSheet: MatBottomSheet = inject(MatBottomSheet);
  private _routerSubscription?: Subscription;
  private _bpSubscription?: Subscription;

  /**
   * Row height in px computed from the current viewport width and column count.
   * Recalculates whenever columnCount or isMobile change, keeping CDK virtual
   * scroll in sync with the actual rendered row height and eliminating blank
   * space at the bottom of the list on all screen sizes.
   */
  readonly rowItemSize: Signal<number> = computed((): number => {
    const cols = this.columnCount();
    const isMobile = this.isMobile();
    const screenWidth = window.innerWidth;
    const gapPx = isMobile ? 12 : 20; // 0.75rem vs 1.25rem
    const paddingPx = isMobile ? 12 : 24; // 0.75rem vs 1.5rem each side
    const rowVerticalPx = 20; // 0.625rem top + 0.625rem bottom
    const footerPx = isMobile ? 36 : 44; // game-card__footer min-height
    const navRailWidth = isMobile ? 0 : 88; // nav rail hidden on mobile
    const availableWidth = screenWidth - navRailWidth - 2 * paddingPx - (cols - 1) * gapPx;
    const cardWidth = availableWidth / cols;
    const imageHeight = cardWidth * (4 / 3); // aspect-ratio: 3 / 4
    return Math.ceil(imageHeight + footerPx + rowVerticalPx);
  });

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
  readonly columnCount: WritableSignal<number> = signal(4);

  /** Whether the viewport is in mobile range (≤ 768px). */
  readonly isMobile: WritableSignal<boolean> = signal(false);

  /** Number of non-search filters currently active, shown as a badge on the mobile filter button. */
  readonly activeFilterCount: Signal<number> = computed((): number => {
    let count = 0;
    if (this.selectedConsole()) count++;
    if (this.selectedStore()) count++;
    if (this.selectedStatus()) count++;
    if (this.selectedFormat()) count++;
    if (this.onlyFavorites()) count++;
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

    let filtered = this.allGames().filter((game: GameListModel): boolean => {
      const matchesSearch = game.title.toLowerCase().includes(search);
      const matchesPlatform = platform ? game.platform === platform : true;
      const matchesStore = store ? game.store === store : true;
      const matchesStatus = status ? game.status === status : true;
      const matchesFormat = format ? game.format === format : true;
      const matchesFavorites = favorites ? game.isFavorite === true : true;
      return matchesSearch && matchesPlatform && matchesStore && matchesStatus && matchesFormat && matchesFavorites;
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

  /** Games grouped into rows for the virtual scroll grid. */
  readonly gameRows: Signal<GameListModel[][]> = computed((): GameListModel[][] => {
    const games = this.filteredGames();
    const cols = this.columnCount();
    const rows: GameListModel[][] = [];
    for (let i = 0; i < games.length; i += cols) {
      rows.push(games.slice(i, i + cols));
    }
    return rows;
  });

  async ngOnInit(): Promise<void> {
    void this._loadStores();
    await this._loadGames(false);

    this._routerSubscription = this._router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/list' || event.url.startsWith('/list')) {
          void this._loadGames(true);
        }
      });

    this._bpSubscription = this._breakpointObserver
      .observe([
        '(max-width: 600px)',
        '(max-width: 768px)',
        '(max-width: 900px)',
        '(max-width: 1200px)',
        '(max-width: 1600px)'
      ])
      .subscribe((state) => {
        this.isMobile.set(!!state.breakpoints['(max-width: 768px)']);
        if (state.breakpoints['(max-width: 600px)']) this.columnCount.set(2);
        else if (state.breakpoints['(max-width: 900px)']) this.columnCount.set(3);
        else if (state.breakpoints['(max-width: 1200px)']) this.columnCount.set(4);
        else if (state.breakpoints['(max-width: 1600px)']) this.columnCount.set(5);
        else this.columnCount.set(6);
      });
  }

  ngOnDestroy(): void {
    this._routerSubscription?.unsubscribe();
    this._bpSubscription?.unsubscribe();
  }

  /**
   * Returns the number of filtered games that are owned (any status except wishlist).
   */
  getOwnedCount(): number {
    return this.filteredGames().filter((g: GameListModel) => g.status !== 'wishlist').length;
  }

  /**
   * Returns the number of filtered games with wishlist status.
   */
  getWishlistCount(): number {
    return this.filteredGames().filter((g: GameListModel) => g.status === 'wishlist').length;
  }

  /**
   * Returns the number of filtered games with platinum status.
   */
  getPlatinumCount(): number {
    return this.filteredGames().filter((g: GameListModel) => g.status === 'platinum').length;
  }

  /**
   * Returns the sum of prices for owned filtered games (excludes wishlist entries).
   */
  getTotalPrice(): number {
    return this.filteredGames()
      .filter((g: GameListModel) => g.status !== 'wishlist')
      .reduce((acc: number, game: GameListModel): number => acc + (game.price || 0), 0);
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
  }

  /**
   * Handles a game-deleted event from the card component.
   * The card has already performed the delete — this only reloads the list and shows a snack.
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
   * Tracking function for virtual scroll rows.
   *
   * @param {number} index - Row index in the virtual scroll viewport
   */
  trackByRowIndex = (index: number): number => index;

  /**
   * Updates the search term signal from the input event.
   *
   * @param {Event} event - Input event from the search field
   */
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) this.searchTerm.set(target.value.trim());
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
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      stores: this.stores,
      clearAllFilters: () => this.clearAllFilters()
    };
    this._bottomSheet.open(GameListFiltersSheetComponent, { data });
  }

  /**
   * Returns the current user ID or throws if no user is authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }

  /**
   * Loads all stores from Supabase to populate the store filter.
   */
  private async _loadStores(): Promise<void> {
    try {
      const stores: StoreModel[] = await this._storeUseCases.getAllStores();
      this.stores.set(stores);
    } catch {
      // silently ignore — filter will show no store options
    }
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

    this.loading.set(true);
    try {
      const data: GameListModel[] = await this._gameUseCases.getAllGamesForList(this._userId);
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
