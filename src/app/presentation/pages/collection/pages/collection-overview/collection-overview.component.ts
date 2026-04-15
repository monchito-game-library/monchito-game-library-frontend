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
import { CurrencyPipe } from '@angular/common';
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
  selector: 'app-collection-overview',
  templateUrl: './collection-overview.component.html',
  styleUrls: ['./collection-overview.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, MatIcon, SkeletonComponent, TranslocoPipe]
})
export class CollectionOverviewComponent implements OnInit {
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

  /** Total gastado en juegos. Null mientras carga. */
  readonly gamesTotalSpent: WritableSignal<number | null> = signal<number | null>(null);

  /** Total gastado en consolas. Null mientras carga. */
  readonly consolesTotalSpent: WritableSignal<number | null> = signal<number | null>(null);

  /** Total gastado en mandos. Null mientras carga. */
  readonly controllersTotalSpent: WritableSignal<number | null> = signal<number | null>(null);

  /** Suma total gastada en toda la colección. Null mientras cualquiera de los tres totales siga cargando. */
  readonly collectionTotalSpent: Signal<number | null> = computed((): number | null => {
    const games = this.gamesTotalSpent();
    const consoles = this.consolesTotalSpent();
    const controllers = this.controllersTotalSpent();
    if (games === null || consoles === null || controllers === null) return null;
    return games + consoles + controllers;
  });

  async ngOnInit(): Promise<void> {
    await this._loadCounts();
  }

  /**
   * Navega a la sección de juegos.
   */
  goToGames(): void {
    this._router.navigate(['/collection/games']);
  }

  /**
   * Navega a la sección de consolas.
   */
  goToConsoles(): void {
    this._router.navigate(['/collection/consoles']);
  }

  /**
   * Navega a la sección de mandos.
   */
  goToControllers(): void {
    this._router.navigate(['/collection/controllers']);
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

    this.gamesTotalSpent.set(games.reduce((acc, g) => acc + (g.price ?? 0), 0));
    this.consolesTotalSpent.set(consoles.reduce((acc, c) => acc + (c.price ?? 0), 0));
    this.controllersTotalSpent.set(controllers.reduce((acc, c) => acc + (c.price ?? 0), 0));
  }
}
