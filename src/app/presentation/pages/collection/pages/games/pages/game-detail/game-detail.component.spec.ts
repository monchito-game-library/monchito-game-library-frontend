import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { GameDetailComponent } from './game-detail.component';
import { GameEditModel } from '@/models/game/game-edit.model';
import { StoreModel } from '@/models/store/store.model';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { STORE_USE_CASES, StoreUseCasesContract } from '@/domain/use-cases/store/store.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { defaultGameCover } from '@/constants/game-library.constant';

function makeGame(overrides: Partial<GameEditModel> = {}): GameEditModel {
  return {
    uuid: 'game-uuid-1',
    id: 1,
    title: 'God of War',
    price: 49.99,
    store: 'store-uuid-1',
    platform: 'PS5',
    condition: 'new',
    platinum: false,
    description: 'Notas del juego',
    status: 'playing',
    personalRating: 8,
    edition: null,
    format: 'physical',
    isFavorite: false,
    imageUrl: 'https://example.com/gow.jpg',
    rawgId: 58175,
    rawgSlug: 'god-of-war',
    releasedDate: '2018-04-20',
    rawgRating: 4.42,
    genres: ['Action', 'Adventure'],
    coverPosition: null,
    forSale: false,
    salePrice: null,
    soldAt: null,
    soldPriceFinal: null,
    activeLoanId: null,
    activeLoanTo: null,
    activeLoanAt: null,
    ...overrides
  };
}

const mockStore: StoreModel = { id: 'store-uuid-1', label: 'GAME', formatHint: 'physical' };

describe('GameDetailComponent', () => {
  let component: GameDetailComponent;
  let fixture: ComponentFixture<GameDetailComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        GameDetailComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [
        {
          provide: GAME_USE_CASES,
          useValue: {
            getGameForEdit: vi.fn().mockResolvedValue(makeGame()),
            deleteGame: vi.fn().mockResolvedValue(undefined)
          } as Partial<GameUseCasesContract>
        },
        {
          provide: STORE_USE_CASES,
          useValue: {
            getAllStores: vi.fn().mockResolvedValue([mockStore])
          } as Partial<StoreUseCasesContract>
        },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue('game-uuid-1') } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(GameDetailComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('carga el juego y las tiendas en paralelo', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      const storeUseCases = TestBed.inject(STORE_USE_CASES as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(gameUseCases.getGameForEdit).toHaveBeenCalledWith('user-1', 'game-uuid-1');
      expect(storeUseCases.getAllStores).toHaveBeenCalled();
      expect(component.game()?.uuid).toBe('game-uuid-1');
      expect(component.stores()).toHaveLength(1);
    });

    it('desactiva loading tras la carga', async () => {
      expect(component.loading()).toBe(true);
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(component.loading()).toBe(false);
    });

    it('navega a /games si no hay uuid en la ruta', async () => {
      const route = TestBed.inject(ActivatedRoute as any) as any;
      route.snapshot.paramMap.get.mockReturnValue(null);
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/collection/games']);
    });

    it('navega a /games si el juego no existe (null)', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.getGameForEdit.mockResolvedValue(null);
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(router.navigate).toHaveBeenCalledWith(['/collection/games']);
    });

    it('muestra snackbar de error y navega a /games si la carga falla', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.getGameForEdit.mockRejectedValue(new Error('load error'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const router = TestBed.inject(Router as any) as any;

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(snackBar.open).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/collection/games']);
    });

    it('desactiva loading incluso si la carga falla', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.getGameForEdit.mockRejectedValue(new Error('fail'));

      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));

      expect(component.loading()).toBe(false);
    });
  });

  describe('goBack', () => {
    it('llama a location.back()', () => {
      const location = TestBed.inject(Location as any) as any;
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('editGame', () => {
    it('navega a /games/edit/:uuid', () => {
      component.game.set(makeGame());
      const router = TestBed.inject(Router as any) as any;

      component.editGame();

      expect(router.navigate).toHaveBeenCalledWith(['/collection/games/edit', 'game-uuid-1']);
    });

    it('no navega si game es null', () => {
      component.game.set(null);
      const router = TestBed.inject(Router as any) as any;

      component.editGame();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('deleteGame', () => {
    it('no abre el dialog si game es null', async () => {
      component.game.set(null);
      const dialog = TestBed.inject(MatDialog as any) as any;

      await component.deleteGame();

      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('no elimina si el dialog se cancela', async () => {
      component.game.set(makeGame());
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      await component.deleteGame();

      expect(gameUseCases.deleteGame).not.toHaveBeenCalled();
    });

    it('llama a deleteGame y navega a /games si se confirma', async () => {
      component.game.set(makeGame());
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const router = TestBed.inject(Router as any) as any;

      await component.deleteGame();

      expect(gameUseCases.deleteGame).toHaveBeenCalledWith('user-1', 'game-uuid-1');
      expect(router.navigate).toHaveBeenCalledWith(['/collection/games']);
    });

    it('muestra snackbar de error si deleteGame lanza', async () => {
      component.game.set(makeGame());
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.deleteGame.mockRejectedValue(new Error('delete error'));
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.deleteGame();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('desactiva deleting si deleteGame lanza', async () => {
      component.game.set(makeGame());
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.deleteGame.mockRejectedValue(new Error('delete error'));
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });

      await component.deleteGame();

      expect(component.deleting()).toBe(false);
    });
  });

  describe('coverUrl (computed)', () => {
    it('devuelve imageUrl cuando el juego tiene imagen', () => {
      component.game.set(makeGame({ imageUrl: 'https://example.com/gow.jpg' }));
      expect(component.coverUrl()).toBe('https://example.com/gow.jpg');
    });

    it('devuelve defaultGameCover cuando imageUrl es null', () => {
      component.game.set(makeGame({ imageUrl: null }));
      expect(component.coverUrl()).toBe(defaultGameCover);
    });

    it('devuelve defaultGameCover cuando game es null', () => {
      component.game.set(null);
      expect(component.coverUrl()).toBe(defaultGameCover);
    });
  });

  describe('gameStatus (computed)', () => {
    it('devuelve la opción de estado que coincide con el status del juego', () => {
      component.game.set(makeGame({ status: 'playing' }));
      expect(component.gameStatus()?.code).toBe('playing');
    });

    it('devuelve undefined cuando game es null', () => {
      component.game.set(null);
      expect(component.gameStatus()).toBeUndefined();
    });
  });

  describe('storeName (computed)', () => {
    it('devuelve el label de la tienda cuando coincide el id', () => {
      component.game.set(makeGame({ store: 'store-uuid-1' }));
      component.stores.set([mockStore]);
      expect(component.storeName()).toBe('GAME');
    });

    it('devuelve null cuando el store del juego es null', () => {
      component.game.set(makeGame({ store: null }));
      component.stores.set([mockStore]);
      expect(component.storeName()).toBeNull();
    });

    it('devuelve null cuando la tienda no se encuentra', () => {
      component.game.set(makeGame({ store: 'unknown-uuid' }));
      component.stores.set([mockStore]);
      expect(component.storeName()).toBeNull();
    });
  });

  describe('formatKey (computed)', () => {
    it('devuelve la clave i18n cuando hay formato', () => {
      component.game.set(makeGame({ format: 'physical' }));
      expect(component.formatKey()).toBe('gameList.filters.physical');
    });

    it('devuelve null cuando format es null', () => {
      component.game.set(makeGame({ format: null }));
      expect(component.formatKey()).toBeNull();
    });

    it('devuelve null cuando game es null', () => {
      component.game.set(null);
      expect(component.formatKey()).toBeNull();
    });
  });

  describe('conditionKey (computed)', () => {
    it('devuelve la clave i18n cuando hay condición', () => {
      component.game.set(makeGame({ condition: 'new' }));
      expect(component.conditionKey()).toBe('gameDetail.condition.new');
    });

    it('devuelve null cuando game es null', () => {
      component.game.set(null);
      expect(component.conditionKey()).toBeNull();
    });
  });

  describe('ratingStars (computed)', () => {
    it('devuelve 4 estrellas para rating 8', () => {
      component.game.set(makeGame({ personalRating: 8 }));
      expect(component.ratingStars()).toHaveLength(4);
    });

    it('devuelve 5 estrellas para rating 10', () => {
      component.game.set(makeGame({ personalRating: 10 }));
      expect(component.ratingStars()).toHaveLength(5);
    });

    it('devuelve array vacío cuando personalRating es null', () => {
      component.game.set(makeGame({ personalRating: null }));
      expect(component.ratingStars()).toEqual([]);
    });

    it('devuelve array vacío cuando game es null', () => {
      component.game.set(null);
      expect(component.ratingStars()).toEqual([]);
    });

    it('redondea hacia abajo para rating impar (7 → 3 estrellas)', () => {
      component.game.set(makeGame({ personalRating: 7 }));
      expect(component.ratingStars()).toHaveLength(3);
    });
  });

  describe('hasHalfStar (computed)', () => {
    it('devuelve true para rating impar (7)', () => {
      component.game.set(makeGame({ personalRating: 7 }));
      expect(component.hasHalfStar()).toBe(true);
    });

    it('devuelve false para rating par (8)', () => {
      component.game.set(makeGame({ personalRating: 8 }));
      expect(component.hasHalfStar()).toBe(false);
    });

    it('devuelve false cuando personalRating es null', () => {
      component.game.set(makeGame({ personalRating: null }));
      expect(component.hasHalfStar()).toBe(false);
    });

    it('devuelve false cuando game es null', () => {
      component.game.set(null);
      expect(component.hasHalfStar()).toBe(false);
    });
  });

  describe('openSaleView', () => {
    it('activa la señal showSaleForm', () => {
      expect(component.showSaleForm()).toBe(false);
      component.openSaleView();
      expect(component.showSaleForm()).toBe(true);
    });

    it('desactiva showLoanForm al activar showSaleForm', () => {
      component.showLoanForm.set(true);
      component.openSaleView();
      expect(component.showLoanForm()).toBe(false);
      expect(component.showSaleForm()).toBe(true);
    });
  });

  describe('closeSaleView', () => {
    it('desactiva la señal showSaleForm', () => {
      component.showSaleForm.set(true);
      component.closeSaleView();
      expect(component.showSaleForm()).toBe(false);
    });
  });

  describe('onSaveCompleted', () => {
    it('actualiza la señal game con los nuevos valores de disponibilidad y cierra el formulario', () => {
      const g = makeGame({ forSale: false, salePrice: null });
      component.game.set(g);
      component.showSaleForm.set(true);

      component.onSaveCompleted({ forSale: true, salePrice: 20 });

      expect(component.game()?.forSale).toBe(true);
      expect(component.game()?.salePrice).toBe(20);
      expect(component.showSaleForm()).toBe(false);
    });

    it('pone salePrice a null cuando forSale es false', () => {
      component.game.set(makeGame({ forSale: true, salePrice: 50 }));
      component.onSaveCompleted({ forSale: false, salePrice: null });
      expect(component.game()?.salePrice).toBeNull();
    });
  });

  describe('onSellCompleted', () => {
    it('navega a /collection/games', () => {
      const router = TestBed.inject(Router as any) as any;
      component.onSellCompleted();
      expect(router.navigate).toHaveBeenCalledWith(['/collection/games']);
    });
  });

  describe('openLoanView', () => {
    it('activa la señal showLoanForm', () => {
      expect(component.showLoanForm()).toBe(false);
      component.openLoanView();
      expect(component.showLoanForm()).toBe(true);
    });

    it('desactiva showSaleForm al activar showLoanForm', () => {
      component.showSaleForm.set(true);
      component.openLoanView();
      expect(component.showSaleForm()).toBe(false);
      expect(component.showLoanForm()).toBe(true);
    });
  });

  describe('closeLoanView', () => {
    it('desactiva la señal showLoanForm', () => {
      component.showLoanForm.set(true);
      component.closeLoanView();
      expect(component.showLoanForm()).toBe(false);
    });
  });

  describe('onLoanSaved', () => {
    it('actualiza la señal game con el modelo recibido y desactiva showLoanForm', () => {
      const updated = makeGame({ activeLoanId: 'loan-1', activeLoanTo: 'Juan', activeLoanAt: '2024-06-01' });
      component.showLoanForm.set(true);

      component.onLoanSaved(updated);

      expect(component.game()).toEqual(updated);
      expect(component.showLoanForm()).toBe(false);
    });
  });

  describe('_userId — guard (userId null)', () => {
    let guardFixture: ComponentFixture<GameDetailComponent>;
    let guardComponent: GameDetailComponent;

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          GameDetailComponent,
          TranslocoTestingModule.forRoot({
            langs: { es: {} },
            translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
          })
        ],
        providers: [
          {
            provide: GAME_USE_CASES,
            useValue: {
              getGameForEdit: vi.fn().mockResolvedValue(makeGame()),
              deleteGame: vi.fn().mockResolvedValue(undefined)
            } as Partial<GameUseCasesContract>
          },
          {
            provide: STORE_USE_CASES,
            useValue: { getAllStores: vi.fn().mockResolvedValue([mockStore]) } as Partial<StoreUseCasesContract>
          },
          { provide: UserContextService, useValue: { userId: signal<string | null>(null) } },
          { provide: MatDialog, useValue: { open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) } },
          { provide: MatSnackBar, useValue: { open: vi.fn() } },
          { provide: Router, useValue: { navigate: vi.fn() } },
          { provide: Location, useValue: { back: vi.fn() } },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue('game-uuid-1') } } }
          }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      });

      guardFixture = TestBed.createComponent(GameDetailComponent);
      guardComponent = guardFixture.componentInstance;
    });

    it('muestra snackbar cuando userId es null al intentar eliminar un juego', async () => {
      guardComponent.game.set(makeGame());
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await guardComponent.deleteGame();

      expect(snackBar.open).toHaveBeenCalled();
    });
  });
});
