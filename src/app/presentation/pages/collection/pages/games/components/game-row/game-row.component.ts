import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal
} from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

import { MatIconButton } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { availableGameStatuses } from '@/constants/game-status.constant';
import { defaultGameCover } from '@/constants/game-library.constant';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { PLATFORM_COLORS } from '@/constants/platform-colors.constant';
import { BadgeChipComponent } from '@/components/ad-hoc/badge-chip/badge-chip.component';
import { ConfirmDialogComponent } from '@/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import { GameListModel } from '@/models/game/game-list.model';
import { GameStatusOption } from '@/interfaces/game-status-option.interface';
import { UserContextService } from '@/services/user-context/user-context.service';

@Component({
  selector: 'app-game-row',
  templateUrl: './game-row.component.html',
  styleUrl: './game-row.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, NgOptimizedImage, MatIconButton, MatIcon, MatTooltip, TranslocoPipe, BadgeChipComponent]
})
export class GameRowComponent {
  private readonly _router: Router = inject(Router);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userContext: UserContextService = inject(UserContextService);

  private readonly _statuses: GameStatusOption[] = availableGameStatuses;

  /** Game to display (required). */
  readonly game: InputSignal<GameListModel> = input.required<GameListModel>();

  /** Cover image URL, falls back to the default cover when absent. */
  readonly cover: Signal<string> = computed((): string => this.game().imageUrl || defaultGameCover);

  /** Status option resolved from the constant, or undefined if status is unknown. */
  readonly gameStatus: Signal<GameStatusOption | undefined> = computed((): GameStatusOption | undefined =>
    this._statuses.find((s) => s.code === this.game().status)
  );

  /** Brand accent color for the platform badge chip. Undefined for unknown platforms. */
  readonly platformColor: Signal<string | undefined> = computed(
    (): string | undefined => PLATFORM_COLORS[this.game().platform ?? '']
  );

  /** Personal rating mapped to integer stars on a 0–5 scale (rating is stored as 0–10). */
  readonly ratingStars: Signal<number> = computed((): number => {
    const r: number | null = this.game().personalRating;
    return r === null ? 0 : Math.round(r / 2);
  });

  /** Emitted when the game has been successfully deleted. */
  readonly gameDeleted: OutputEmitterRef<number> = output<number>();

  /**
   * Navigates to the game detail page using the UUID as the route param.
   */
  onOpen(): void {
    const uuid: string | undefined = this.game().uuid;
    if (!uuid) return;
    void this._router.navigate(['/collection/games', uuid]);
  }

  /**
   * Opens a confirmation dialog and deletes the game if confirmed.
   *
   * @param {Event} event - Click event, stopped to avoid triggering row open
   */
  onDelete(event: Event): void {
    event.stopPropagation();
    const game: GameListModel = this.game();
    if (!game.uuid) return;

    const dialogRef: MatDialogRef<ConfirmDialogComponent> = this._dialog.open(ConfirmDialogComponent, {
      data: {
        title: this._transloco.translate('gameCard.dialog.delete.title'),
        message: this._transloco.translate('gameCard.dialog.delete.message')
      } satisfies ConfirmDialogInterface
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (confirmed && game.uuid && game.id !== undefined) {
        await this._gameUseCases.deleteGame(this._userId, game.uuid);
        this.gameDeleted.emit(game.id);
      }
    });
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
