import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { CONSOLE_USE_CASES, ConsoleUseCasesContract } from '@/domain/use-cases/console/console.use-cases.contract';
import {
  CONTROLLER_USE_CASES,
  ControllerUseCasesContract
} from '@/domain/use-cases/controller/controller.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';

@Component({
  selector: 'app-games-hub',
  templateUrl: './games-hub.component.html',
  styleUrls: ['./games-hub.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, SkeletonComponent, TranslocoPipe]
})
export class GamesHubComponent implements OnInit {
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  private readonly _consoleUseCases: ConsoleUseCasesContract = inject(CONSOLE_USE_CASES);
  private readonly _controllerUseCases: ControllerUseCasesContract = inject(CONTROLLER_USE_CASES);
  private readonly _userContext: UserContextService = inject(UserContextService);
  private readonly _router: Router = inject(Router);

  /** Número de juegos en la colección. Null mientras carga. */
  readonly gamesCount: WritableSignal<number | null> = signal<number | null>(null);

  /** Número de consolas en la colección. Null mientras carga. */
  readonly consolesCount: WritableSignal<number | null> = signal<number | null>(null);

  /** Número de mandos en la colección. Null mientras carga. */
  readonly controllersCount: WritableSignal<number | null> = signal<number | null>(null);

  async ngOnInit(): Promise<void> {
    await this._loadCounts();
  }

  /**
   * Navega a la sección de juegos.
   */
  goToGames(): void {
    this._router.navigate(['/games/list']);
  }

  /**
   * Navega a la sección de consolas.
   */
  goToConsoles(): void {
    this._router.navigate(['/games/consoles']);
  }

  /**
   * Navega a la sección de mandos.
   */
  goToControllers(): void {
    this._router.navigate(['/games/controllers']);
  }

  /**
   * Carga en paralelo los contadores de juegos, consolas y mandos del usuario
   * y actualiza las señales correspondientes.
   */
  private async _loadCounts(): Promise<void> {
    const userId: string = this._userContext.requireUserId();

    const [games, consoles, controllers] = await Promise.all([
      this._gameUseCases.getAllGamesForList(userId),
      this._consoleUseCases.getAllForUser(userId),
      this._controllerUseCases.getAllForUser(userId)
    ]);

    this.gamesCount.set(games.length);
    this.consolesCount.set(consoles.length);
    this.controllersCount.set(controllers.length);
  }
}
