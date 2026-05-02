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
import { CurrencyPipe, DatePipe, DecimalPipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { GameEditModel } from '@/models/game/game-edit.model';
import { StoreModel } from '@/models/store/store.model';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { availableGameStatuses } from '@/constants/game-status.constant';
import { GameStatusOption } from '@/interfaces/game-status-option.interface';
import { defaultGameCover } from '@/constants/game-library.constant';
import { PLATFORM_COLORS } from '@/constants/platform-colors.constant';
import { SaleFormComponent } from '@/pages/collection/components/sale-form/sale-form.component';
import { SaleAvailabilityValues, SaleSoldValues } from '@/interfaces/forms/sale-form.interface';
import { GameSaleStatusModel } from '@/interfaces/game-sale-status.interface';
import { GameLoanFormComponent } from './components/game-loan-form/game-loan-form.component';
import { BadgeChipComponent } from '@/components/ad-hoc/badge-chip/badge-chip.component';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatProgressSpinner,
    TranslocoPipe,
    SaleFormComponent,
    GameLoanFormComponent,
    BadgeChipComponent
  ]
})
export class GameDetailComponent implements OnInit {
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _location: Location = inject(Location);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _storeUseCases: StoreUseCasesContract = inject(STORE_USE_CASES);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  private readonly _statuses: GameStatusOption[] = availableGameStatuses;

  /** Whether data is being loaded. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  /** Whether the delete action is in progress. */
  readonly deleting: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the sale form view is active. */
  readonly showSaleForm: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the loan form view is active. */
  readonly showLoanForm: WritableSignal<boolean> = signal<boolean>(false);

  /** The game being displayed. */
  readonly game: WritableSignal<GameEditModel | null> = signal<GameEditModel | null>(null);

  /** All available stores, used to resolve the store UUID to a label. */
  readonly stores: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);

  /** Cover image URL with fallback to default cover. */
  readonly coverUrl: Signal<string> = computed((): string => {
    const g = this.game();
    return g?.imageUrl ?? defaultGameCover;
  });

  /** Status option matching the current game's status. */
  readonly gameStatus: Signal<GameStatusOption | undefined> = computed(() =>
    this._statuses.find((s) => s.code === this.game()?.status)
  );

  /** Human-readable store label resolved from the store UUID. */
  readonly storeName: Signal<string | null> = computed(() => {
    const storeId = this.game()?.store;
    if (!storeId) return null;
    return this.stores().find((s) => s.id === storeId)?.label ?? null;
  });

  /** Translation key for the game format label. Null when format is not set. */
  readonly formatKey: Signal<string | null> = computed(() => {
    const fmt = this.game()?.format;
    return fmt ? `gameList.filters.${fmt}` : null;
  });

  /** Translation key for the game condition label. Null when condition is not set. */
  readonly conditionKey: Signal<string | null> = computed(() => {
    const cond = this.game()?.condition;
    return cond ? `gameDetail.condition.${cond}` : null;
  });

  /** Star array for the rating display (0–5 stars from a 0–10 rating). */
  readonly ratingStars: Signal<number[]> = computed(() => {
    const rating = this.game()?.personalRating;
    if (rating === null || rating === undefined) return [];
    return Array(Math.floor(rating / 2)).fill(1);
  });

  /** Half-star indicator (true when the 0–10 rating is odd). */
  readonly hasHalfStar: Signal<boolean> = computed(() => {
    const rating = this.game()?.personalRating;
    return rating !== null && rating !== undefined && rating % 2 !== 0;
  });

  /** Brand accent color for the platform badge chip. */
  readonly platformColor: Signal<string | undefined> = computed(
    (): string | undefined => PLATFORM_COLORS[this.game()?.platform ?? '']
  );

  /**
   * Saves the game's availability status (forSale + salePrice) via the use case.
   * Passed as the saveFn input to SaleFormComponent.
   *
   * @param {SaleAvailabilityValues} v - Availability values from the form
   */
  readonly gameSaveFn = async (v: SaleAvailabilityValues): Promise<void> => {
    const g = this.game()!;
    const sale: GameSaleStatusModel = {
      forSale: v.forSale,
      salePrice: v.forSale ? v.salePrice : null,
      soldAt: g.soldAt,
      soldPriceFinal: g.soldPriceFinal
    };
    await this._gameUseCases.updateSaleStatus(this._userId, g.uuid, sale);
  };

  /**
   * Registers the game as sold via the use case.
   * Passed as the sellFn input to SaleFormComponent.
   *
   * @param {SaleSoldValues} v - Sold values from the form
   */
  readonly gameSellFn = async (v: SaleSoldValues): Promise<void> => {
    const g = this.game()!;
    const sale: GameSaleStatusModel = {
      forSale: false,
      salePrice: null,
      soldAt: v.soldAt,
      soldPriceFinal: v.soldPriceFinal
    };
    await this._gameUseCases.updateSaleStatus(this._userId, g.uuid, sale);
  };

  ngOnInit(): void {
    const uuid = this._route.snapshot.paramMap.get('id');
    if (!uuid) {
      void this._router.navigate(['/collection/games']);
      return;
    }
    void this._loadData(uuid);
  }

  /**
   * Navigates back to the previous page, preserving browser history state.
   */
  goBack(): void {
    this._location.back();
  }

  /**
   * Navigates to the edit form for the current game.
   */
  editGame(): void {
    const uuid = this.game()?.uuid;
    if (!uuid) return;
    void this._router.navigate(['/collection/games/edit', uuid]);
  }

  /**
   * Switches the body to the sale form view.
   */
  openSaleView(): void {
    this.showLoanForm.set(false);
    this.showSaleForm.set(true);
  }

  /**
   * Returns to the data view from the sale form.
   */
  closeSaleView(): void {
    this.showSaleForm.set(false);
  }

  /**
   * Switches the body to the loan form view.
   */
  openLoanView(): void {
    this.showSaleForm.set(false);
    this.showLoanForm.set(true);
  }

  /**
   * Returns to the data view from the loan form.
   */
  closeLoanView(): void {
    this.showLoanForm.set(false);
  }

  /**
   * Called after the sale form saves availability successfully.
   * Updates the game signal with the new forSale/salePrice values and closes the form.
   *
   * @param {SaleAvailabilityValues} values - Updated availability values from the form
   */
  onSaveCompleted(values: SaleAvailabilityValues): void {
    const g = this.game()!;
    this.game.set({ ...g, forSale: values.forSale, salePrice: values.forSale ? values.salePrice : null });
    this.showSaleForm.set(false);
  }

  /**
   * Called after the sale form registers the game as sold.
   * Navigates to the games list since the game is no longer in the active collection.
   */
  onSellCompleted(): void {
    void this._router.navigate(['/collection/games']);
  }

  /**
   * Reverts the sale, clearing soldAt and soldPriceFinal and returning the game to the active collection.
   */
  async undoSell(): Promise<void> {
    const g = this.game();
    if (!g) return;
    try {
      const sale: GameSaleStatusModel = { forSale: false, salePrice: null, soldAt: null, soldPriceFinal: null };
      await this._gameUseCases.updateSaleStatus(this._userId, g.uuid, sale);
      this.game.set({ ...g, forSale: false, salePrice: null, soldAt: null, soldPriceFinal: null });
    } catch {
      this._snackBar.open(this._transloco.translate('gameDetail.sale.snack.undoError'), undefined, { duration: 3000 });
    }
  }

  /**
   * Called when the loan form action completes successfully.
   * Updates the game signal and returns to the data view.
   *
   * @param {GameEditModel} updated - Game model with the new loan values applied
   */
  onLoanSaved(updated: GameEditModel): void {
    this.game.set(updated);
    this.showLoanForm.set(false);
  }

  /**
   * Opens a confirmation dialog and deletes the game if confirmed.
   * Navigates to the list on success.
   */
  async deleteGame(): Promise<void> {
    const game = this.game();
    if (!game?.uuid) return;

    const ref = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'gameCard.dialog.delete.title',
        message: 'gameCard.dialog.delete.message'
      } satisfies ConfirmDialogInterface
    });

    const confirmed: boolean | undefined = await firstValueFrom(ref.afterClosed());
    if (!confirmed || !game.uuid) return;

    this.deleting.set(true);
    try {
      await this._gameUseCases.deleteGame(this._userId, game.uuid);
      void this._router.navigate(['/collection/games']);
    } catch {
      this._snackBar.open(this._transloco.translate('gameDetail.snack.deleteError'), undefined, { duration: 3000 });
      this.deleting.set(false);
    }
  }

  /**
   * Loads the game data and stores list in parallel.
   *
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  private async _loadData(uuid: string): Promise<void> {
    try {
      const [game, stores] = await Promise.all([
        this._gameUseCases.getGameForEdit(this._userId, uuid),
        this._storeUseCases.getAllStores()
      ]);

      if (!game) {
        void this._router.navigate(['/collection/games']);
        return;
      }

      this.game.set(game);
      this.stores.set(stores);
    } catch {
      this._snackBar.open(this._transloco.translate('gameDetail.snack.loadError'), undefined, { duration: 3000 });
      void this._router.navigate(['/collection/games']);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Returns the current user ID or throws if no user is authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }
}
