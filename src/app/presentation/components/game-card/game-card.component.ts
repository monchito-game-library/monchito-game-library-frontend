import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  InputSignal,
  Output,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

import { MatCard } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { GameListModel } from '@/models/game/game-list.model';
import { defaultGameCover, imagePlatinumPath, imageTrophyHiddenPath } from '@/constants/game-library.constant';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { availableGameStatuses, GameStatusOption } from '@/constants/game-status.constant';

@Component({
  selector: 'app-game-card',
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatIconButton, MatIcon, CurrencyPipe, NgOptimizedImage, TranslocoPipe, SkeletonComponent]
})
export class GameCardComponent {
  private readonly _statuses: GameStatusOption[] = availableGameStatuses;

  private readonly _router: Router = inject(Router);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  /** Game to display (required). */
  readonly game: InputSignal<GameListModel> = input.required<GameListModel>();

  /** Cover image URL, falls back to the default cover. */
  readonly defaultImage: Signal<string> = computed((): string => this.game().imageUrl || defaultGameCover);

  /** Whether the cover image has finished loading. */
  readonly imageLoaded: WritableSignal<boolean> = signal(false);

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

  /** Edition of the game copy. */
  readonly edition: Signal<string | null> = computed(() => this.game().edition);

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

  /** Whether the card is currently showing its back face (description). */
  readonly isFlipped: WritableSignal<boolean> = signal<boolean>(false);

  /** Emitted when the game has been successfully deleted. */
  @Output() gameDeleted: EventEmitter<number> = new EventEmitter<number>();

  /**
   * Toggles the card flip to show/hide the description on the back face.
   */
  onFlip = (): void => {
    this.isFlipped.update((v: boolean) => !v);
  };

  /**
   * Navigates to the edit form for this game using the UUID as the route param.
   */
  editGame = (): void => {
    void this._router.navigate(['/update', this.game().uuid]);
  };

  /**
   * Opens a confirmation dialog and deletes the game if confirmed.
   */
  deleteGame = (): void => {
    const game: GameListModel = this.game();
    if (!game.uuid) return;

    const dialogRef: MatDialogRef<ConfirmDialogComponent, any> = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('gameCard.dialog.delete.title'),
        message: this._transloco.translate('gameCard.dialog.delete.message')
      } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed && game.uuid) {
        await this._gameUseCases.deleteGame(this._userId, game.uuid);
        this.gameDeleted.emit(game.id);
      }
    });
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
