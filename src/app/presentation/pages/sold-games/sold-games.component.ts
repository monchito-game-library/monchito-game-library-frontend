import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { GameListModel } from '@/models/game/game-list.model';
import { defaultGameCover } from '@/constants/game-library.constant';

@Component({
  selector: 'app-sold-games',
  templateUrl: './sold-games.component.html',
  styleUrl: './sold-games.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, MatIcon, MatIconButton, MatProgressSpinner, TranslocoPipe]
})
export class SoldGamesComponent implements OnInit {
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _router: Router = inject(Router);

  /** Whether games are being loaded. */
  readonly loading: WritableSignal<boolean> = signal(true);

  /** List of sold games ordered by sold_at descending. */
  readonly soldGames: WritableSignal<GameListModel[]> = signal([]);

  /** Default cover image path. */
  readonly defaultCover: string = defaultGameCover;

  async ngOnInit(): Promise<void> {
    try {
      const games = await this._gameUseCases.getSoldGames(this._userContext.requireUserId());
      this.soldGames.set(games);
    } catch {
      this._snackBar.open(
        this._transloco.translate('soldGames.snack.loadError'),
        this._transloco.translate('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Navigates back to the game list.
   */
  goBack(): void {
    void this._router.navigate(['/list']);
  }

  /**
   * Returns the cover image URL, falling back to the default if absent.
   *
   * @param {GameListModel} game - Game whose cover to resolve
   */
  coverUrl(game: GameListModel): string {
    return game.imageUrl ?? this.defaultCover;
  }
}
