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

  /** Number of games in the collection. Null while loading. */
  readonly gamesCount: WritableSignal<number | null> = signal<number | null>(null);

  /** Number of consoles in the collection. Null while loading. */
  readonly consolesCount: WritableSignal<number | null> = signal<number | null>(null);

  /** Number of controllers in the collection. Null while loading. */
  readonly controllersCount: WritableSignal<number | null> = signal<number | null>(null);

  /** Total spent on games. Null while loading. */
  readonly gamesTotalSpent: WritableSignal<number | null> = signal<number | null>(null);

  /** Total spent on consoles. Null while loading. */
  readonly consolesTotalSpent: WritableSignal<number | null> = signal<number | null>(null);

  /** Total spent on controllers. Null while loading. */
  readonly controllersTotalSpent: WritableSignal<number | null> = signal<number | null>(null);

  /** Total spent across the entire collection. Null while any of the three totals is still loading. */
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
   * Navigates to the games section.
   */
  goToGames(): void {
    void this._router.navigate(['/collection/games']);
  }

  /**
   * Navigates to the consoles section.
   */
  goToConsoles(): void {
    void this._router.navigate(['/collection/consoles']);
  }

  /**
   * Navigates to the controllers section.
   */
  goToControllers(): void {
    void this._router.navigate(['/collection/controllers']);
  }

  /**
   * Loads game, console and controller counts in parallel and updates the corresponding signals.
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
