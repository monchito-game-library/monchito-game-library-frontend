import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { CollectionOverviewComponent } from './collection-overview.component';
import { GAME_USE_CASES } from '@/domain/use-cases/game/game.use-cases.contract';
import { CONSOLE_USE_CASES } from '@/domain/use-cases/console/console.use-cases.contract';
import { CONTROLLER_USE_CASES } from '@/domain/use-cases/controller/controller.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { mockRouter } from '@/testing/router.mock';

function makeGame(overrides: { price?: number | null } = {}): { price: number | null } {
  return {
    price: null,
    ...overrides
  };
}

function makeConsole(overrides: { price?: number | null } = {}): { price: number | null } {
  return {
    price: null,
    ...overrides
  };
}

function makeController(overrides: { price?: number | null } = {}): { price: number | null } {
  return {
    price: null,
    ...overrides
  };
}

/**
 * Tests del componente CollectionOverviewComponent.
 * Verifica señales iniciales, señal computada collectionTotalSpent,
 * navegación y carga de datos en ngOnInit.
 */
describe('CollectionOverviewComponent', () => {
  let component: CollectionOverviewComponent;
  let fixture: ComponentFixture<CollectionOverviewComponent>;

  const mockGameUseCases = {
    getAllGamesForList: vi.fn()
  };

  const mockConsoleUseCases = {
    getAllForUser: vi.fn()
  };

  const mockControllerUseCases = {
    getAllForUser: vi.fn()
  };

  const mockUserContext = {
    userId: signal<string | null>('user-1'),
    requireUserId: vi.fn().mockReturnValue('user-1')
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserContext.requireUserId.mockReturnValue('user-1');

    TestBed.configureTestingModule({
      imports: [
        CollectionOverviewComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: GAME_USE_CASES, useValue: mockGameUseCases },
        { provide: CONSOLE_USE_CASES, useValue: mockConsoleUseCases },
        { provide: CONTROLLER_USE_CASES, useValue: mockControllerUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(CollectionOverviewComponent);
    component = fixture.componentInstance;
    // No detectChanges() para evitar ngOnInit automático
  });

  describe('valores iniciales de las señales', () => {
    it('gamesCount es null', () => {
      expect(component.gamesCount()).toBeNull();
    });

    it('consolesCount es null', () => {
      expect(component.consolesCount()).toBeNull();
    });

    it('controllersCount es null', () => {
      expect(component.controllersCount()).toBeNull();
    });

    it('gamesTotalSpent es null', () => {
      expect(component.gamesTotalSpent()).toBeNull();
    });

    it('consolesTotalSpent es null', () => {
      expect(component.consolesTotalSpent()).toBeNull();
    });

    it('controllersTotalSpent es null', () => {
      expect(component.controllersTotalSpent()).toBeNull();
    });
  });

  describe('collectionTotalSpent (señal computada)', () => {
    it('devuelve null cuando gamesTotalSpent es null', () => {
      component.gamesTotalSpent.set(null);
      component.consolesTotalSpent.set(100);
      component.controllersTotalSpent.set(50);
      expect(component.collectionTotalSpent()).toBeNull();
    });

    it('devuelve null cuando consolesTotalSpent es null', () => {
      component.gamesTotalSpent.set(200);
      component.consolesTotalSpent.set(null);
      component.controllersTotalSpent.set(50);
      expect(component.collectionTotalSpent()).toBeNull();
    });

    it('devuelve null cuando controllersTotalSpent es null', () => {
      component.gamesTotalSpent.set(200);
      component.consolesTotalSpent.set(100);
      component.controllersTotalSpent.set(null);
      expect(component.collectionTotalSpent()).toBeNull();
    });

    it('devuelve null cuando los tres totales son null', () => {
      component.gamesTotalSpent.set(null);
      component.consolesTotalSpent.set(null);
      component.controllersTotalSpent.set(null);
      expect(component.collectionTotalSpent()).toBeNull();
    });

    it('devuelve la suma correcta cuando los tres totales están definidos', () => {
      component.gamesTotalSpent.set(200);
      component.consolesTotalSpent.set(100);
      component.controllersTotalSpent.set(50);
      expect(component.collectionTotalSpent()).toBe(350);
    });

    it('devuelve 0 cuando los tres totales son 0', () => {
      component.gamesTotalSpent.set(0);
      component.consolesTotalSpent.set(0);
      component.controllersTotalSpent.set(0);
      expect(component.collectionTotalSpent()).toBe(0);
    });
  });

  describe('goToGames()', () => {
    it('navega a /collection/games', () => {
      component.goToGames();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection/games']);
    });
  });

  describe('goToConsoles()', () => {
    it('navega a /collection/consoles', () => {
      component.goToConsoles();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection/consoles']);
    });
  });

  describe('goToControllers()', () => {
    it('navega a /collection/controllers', () => {
      component.goToControllers();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/collection/controllers']);
    });
  });

  describe('ngOnInit / _loadCounts()', () => {
    it('llama a getAllGamesForList con el userId del contexto', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([]);

      await component.ngOnInit();

      expect(mockGameUseCases.getAllGamesForList).toHaveBeenCalledWith('user-1');
    });

    it('llama a consoleUseCases.getAllForUser con el userId del contexto', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([]);

      await component.ngOnInit();

      expect(mockConsoleUseCases.getAllForUser).toHaveBeenCalledWith('user-1');
    });

    it('llama a controllerUseCases.getAllForUser con el userId del contexto', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([]);

      await component.ngOnInit();

      expect(mockControllerUseCases.getAllForUser).toHaveBeenCalledWith('user-1');
    });

    it('actualiza gamesCount con la longitud de los juegos cargados', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([makeGame(), makeGame(), makeGame()]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([]);

      await component.ngOnInit();

      expect(component.gamesCount()).toBe(3);
    });

    it('actualiza consolesCount con la longitud de las consolas cargadas', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([makeConsole(), makeConsole()]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([]);

      await component.ngOnInit();

      expect(component.consolesCount()).toBe(2);
    });

    it('actualiza controllersCount con la longitud de los mandos cargados', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([makeController()]);

      await component.ngOnInit();

      expect(component.controllersCount()).toBe(1);
    });

    it('actualiza gamesTotalSpent sumando los precios de los juegos', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([
        makeGame({ price: 20 }),
        makeGame({ price: 35 }),
        makeGame({ price: null })
      ]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([]);

      await component.ngOnInit();

      expect(component.gamesTotalSpent()).toBe(55);
    });

    it('actualiza consolesTotalSpent sumando los precios de las consolas', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([makeConsole({ price: 300 }), makeConsole({ price: 150 })]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([]);

      await component.ngOnInit();

      expect(component.consolesTotalSpent()).toBe(450);
    });

    it('actualiza controllersTotalSpent sumando los precios de los mandos', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([
        makeController({ price: 60 }),
        makeController({ price: 40 })
      ]);

      await component.ngOnInit();

      expect(component.controllersTotalSpent()).toBe(100);
    });

    it('trata precios null como 0 en el cálculo del total de juegos', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([makeGame({ price: null }), makeGame({ price: null })]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([]);

      await component.ngOnInit();

      expect(component.gamesTotalSpent()).toBe(0);
    });

    it('actualiza collectionTotalSpent correctamente tras la carga completa', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([makeGame({ price: 100 })]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([makeConsole({ price: 200 })]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([makeController({ price: 50 })]);

      await component.ngOnInit();

      expect(component.collectionTotalSpent()).toBe(350);
    });

    it('establece counts a 0 cuando las listas están vacías', async () => {
      mockGameUseCases.getAllGamesForList.mockResolvedValue([]);
      mockConsoleUseCases.getAllForUser.mockResolvedValue([]);
      mockControllerUseCases.getAllForUser.mockResolvedValue([]);

      await component.ngOnInit();

      expect(component.gamesCount()).toBe(0);
      expect(component.consolesCount()).toBe(0);
      expect(component.controllersCount()).toBe(0);
    });

    it('no carga datos cuando userId es null', async () => {
      mockUserContext.userId.set(null);

      await component.ngOnInit();

      expect(mockGameUseCases.getAllGamesForList).not.toHaveBeenCalled();
      expect(mockConsoleUseCases.getAllForUser).not.toHaveBeenCalled();
      expect(mockControllerUseCases.getAllForUser).not.toHaveBeenCalled();
    });
  });
});
