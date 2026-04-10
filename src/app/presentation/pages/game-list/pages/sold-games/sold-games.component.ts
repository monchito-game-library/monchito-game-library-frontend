import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Location } from '@angular/common';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { GameListModel } from '@/models/game/game-list.model';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { PlatformType } from '@/types/platform.type';

@Component({
  selector: 'app-sold-games',
  templateUrl: './sold-games.component.html',
  styleUrl: './sold-games.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatIconButton, MatProgressSpinner, TranslocoPipe, CurrencyPipe, DatePipe]
})
export class SoldGamesComponent implements OnInit {
  private readonly _location: Location = inject(Location);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Whether the sold games list is being loaded. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** List of sold games ordered by sold_at descending. */
  readonly soldGames: WritableSignal<GameListModel[]> = signal([]);

  async ngOnInit(): Promise<void> {
    await this._loadSoldGames();
  }

  /**
   * Navigates back to the previous page.
   */
  onBack(): void {
    this._location.back();
  }

  /**
   * Returns the i18n label key for a given platform code.
   *
   * @param {PlatformType | null} platform - Código de plataforma
   */
  getPlatformLabel(platform: PlatformType | null): string {
    if (!platform) return '';
    const found: AvailablePlatformInterface | undefined = availablePlatformsConstant.find((p) => p.code === platform);
    return found ? this._transloco.translate(found.labelKey) : platform;
  }

  /**
   * Returns the profit or loss from a sale (soldPriceFinal - price).
   * Returns null if either value is missing.
   *
   * @param {GameListModel} game - Juego vendido
   */
  getDiff(game: GameListModel): number | null {
    if (game.soldPriceFinal == null || game.price == null) return null;
    return game.soldPriceFinal - game.price;
  }

  /**
   * Loads all sold games for the current user and updates the soldGames signal.
   */
  private async _loadSoldGames(): Promise<void> {
    this.loading.set(true);
    try {
      const games = await this._gameUseCases.getSoldGames(this._userId);
      this.soldGames.set(games);
    } catch {
      this._snackBar.open(this._transloco.translate('soldGames.snack.loadError'), '', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Returns the authenticated user's ID or throws if not logged in.
   */
  private get _userId(): string {
    const id: string | null = this._userContext.userId();
    if (!id) throw new Error('User not authenticated');
    return id;
  }
}
