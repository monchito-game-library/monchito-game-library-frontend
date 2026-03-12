import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  InputSignal,
  Output,
  Signal
} from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

import { MatCard } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { TranslocoService } from '@ngneat/transloco';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { GameModel } from '@/models/game/game.model';
import { defaultGameCover, imagePlatinumPath, imageTrophyHiddenPath } from '@/constants/game-library.constant';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { StoreType } from '@/types/stores.type';
import { PlatformType } from '@/types/platform.type';
import { GameConditionType } from '@/types/game-condition.type';
import { AvailableStoresInterface } from '@/interfaces/available-stores.interface';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { AvailableConditionInterface } from '@/interfaces/available-condition.interface';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { availableConditions } from '@/constants/available-conditions.constant';
import { availableStoresConstant } from '@/constants/available-stores.constant';
import { availableGameStatuses, GameStatusOption } from '@/constants/game-status.constant';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatIconButton, MatIcon, CurrencyPipe, MatTooltip, NgOptimizedImage]
})
export class GameCardComponent {
  private readonly _platforms: AvailablePlatformInterface[] = availablePlatformsConstant;
  private readonly _conditions: AvailableConditionInterface[] = availableConditions;
  private readonly _stores: AvailableStoresInterface[] = availableStoresConstant;
  private readonly _statuses: GameStatusOption[] = availableGameStatuses;

  private readonly _router: Router = inject(Router);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /** Game to display (required). */
  readonly game: InputSignal<GameModel> = input.required<GameModel>();

  /** Cover image URL, falls back to the default cover. */
  readonly defaultImage: Signal<string> = computed((): string => this.game().imageUrl || defaultGameCover);

  /** Platinum or hidden-trophy icon depending on platinum status. */
  readonly platinumIcon: Signal<string> = computed((): string =>
    this.game().platinum ? imagePlatinumPath : imageTrophyHiddenPath
  );

  /** Status option for the current game. */
  readonly gameStatus: Signal<GameStatusOption | undefined> = computed(() =>
    this._statuses.find((s) => s.code === this.game().status)
  );

  /** Personal rating (0–10). */
  readonly personalRating: Signal<number | null> = computed(() => this.game().personalRating);

  /** Hours played. */
  readonly hoursPlayed: Signal<number> = computed(() => this.game().hoursPlayed);

  /** Whether the game is marked as favourite. */
  readonly isFavorite: Signal<boolean> = computed(() => this.game().isFavorite);

  /**
   * Star array for the rating display (0–5 stars mapped from the 0–10 rating).
   */
  readonly ratingStars: Signal<number[]> = computed(() => {
    const rating = this.personalRating();
    if (rating === null) return [];
    return Array(Math.floor(rating / 2)).fill(1);
  });

  /** Emitted when the game has been successfully deleted. */
  @Output() gameDeleted: EventEmitter<number> = new EventEmitter<number>();

  /**
   * Navigates to the edit form for this game.
   */
  editGame = (): void => {
    void this._router.navigate(['/update', this.game().id]);
  };

  /**
   * Opens a confirmation dialog and deletes the game if confirmed.
   */
  deleteGame = (): void => {
    const game: GameModel = this.game();
    if (!game.id) return;

    const dialogRef: MatDialogRef<ConfirmDialogComponent, any> = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('gameCard.dialog.delete.title'),
        message: this._transloco.translate('gameCard.dialog.delete.message')
      } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed && game.id !== undefined) {
        await this._gameUseCases.deleteGame(this._userId, game.id);
        this.gameDeleted.emit(game.id);
      }
    });
  };

  /**
   * Returns the translated store label for a given store code.
   *
   * @param {StoreType | null} code
   */
  displayStoreLabel = (code: StoreType | null): string => {
    if (!code) return '';
    const store = this._stores.find((s: AvailableStoresInterface): boolean => s.code === code);
    return store ? this._transloco.translate(store.labelKey) : code;
  };

  /**
   * Returns the translated platform label for a given platform code.
   *
   * @param {PlatformType | null} code
   */
  displayPlatformLabel = (code: PlatformType | null): string => {
    if (!code) return '';
    const platform = this._platforms.find((p: AvailablePlatformInterface): boolean => p.code === code);
    return platform ? this._transloco.translate(platform.labelKey) : code;
  };

  /**
   * Returns the translated condition label for a given condition code.
   *
   * @param {GameConditionType | null} code
   */
  displayConditionLabel = (code: GameConditionType | null): string => {
    if (!code) return '';
    const condition = this._conditions.find((c: AvailableConditionInterface): boolean => c.code === code);
    return condition ? this._transloco.translate(condition.labelKey) : code;
  };

  /**
   * Returns the current user ID or throws if no user is authenticated.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('No user selected');
    return id;
  }
}
