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
import { CurrencyPipe, DecimalPipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { GameEditModel } from '@/models/game/game-edit.model';
import { StoreModel } from '@/models/store/store.model';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { availableGameStatuses } from '@/constants/game-status.constant';
import { GameStatusOption } from '@/interfaces/game-status-option.interface';
import { defaultGameCover } from '@/constants/game-library.constant';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DecimalPipe, MatIcon, MatIconButton, MatButton, MatProgressSpinner, TranslocoPipe]
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

  /** The game being displayed. */
  readonly game: WritableSignal<GameEditModel | null> = signal<GameEditModel | null>(null);

  /** All available stores, used to resolve the store UUID to a label. */
  readonly stores: WritableSignal<StoreModel[]> = signal<StoreModel[]>([]);

  /** Whether the cover image has finished loading. */
  readonly imageLoaded: WritableSignal<boolean> = signal<boolean>(false);

  /** Cover image URL with fallback to default cover. */
  readonly coverUrl: Signal<string> = computed((): string => {
    const g = this.game();
    return g?.imageUrl ?? defaultGameCover;
  });

  /** CSS background-size scale derived from coverPosition. */
  readonly coverBackgroundPosition: Signal<string> = computed((): string => {
    const pos = this.game()?.coverPosition;
    if (!pos) return '50% 50%';
    const parts = pos.split(' ');
    return `${parts[0] ?? '50%'} ${parts[1] ?? '50%'}`;
  });

  /** CSS transform scale derived from coverPosition. */
  readonly coverScale: Signal<string> = computed((): string => {
    const pos = this.game()?.coverPosition;
    if (!pos) return 'scale(1)';
    const parts = pos.split(' ');
    const scale = parts.length >= 3 ? parseFloat(parts[2]) : 1;
    return `scale(${scale})`;
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

  ngOnInit(): void {
    const uuid = this._route.snapshot.paramMap.get('id');
    if (!uuid) {
      void this._router.navigate(['/list']);
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
    void this._router.navigate(['/update', uuid]);
  }

  /**
   * Opens a confirmation dialog and deletes the game if confirmed.
   * Navigates back to the list on success.
   */
  deleteGame(): void {
    const game = this.game();
    if (!game?.uuid) return;

    const dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('gameCard.dialog.delete.title'),
        message: this._transloco.translate('gameCard.dialog.delete.message')
      } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean | undefined) => {
      if (confirmed && game.uuid) {
        this.deleting.set(true);
        try {
          await this._gameUseCases.deleteGame(this._userId, game.uuid);
          void this._router.navigate(['/list']);
        } catch {
          this._snackBar.open(this._transloco.translate('gameDetail.snack.deleteError'), undefined, { duration: 3000 });
          this.deleting.set(false);
        }
      }
    });
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
        void this._router.navigate(['/list']);
        return;
      }

      this.game.set(game);
      this.stores.set(stores);
    } catch {
      this._snackBar.open(this._transloco.translate('gameDetail.snack.loadError'), undefined, { duration: 3000 });
      void this._router.navigate(['/list']);
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
