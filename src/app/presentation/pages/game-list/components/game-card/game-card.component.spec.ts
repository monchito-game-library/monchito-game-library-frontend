import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { GameListModel } from '@/models/game/game-list.model';
import { defaultGameCover, imagePlatinumPath, imageTrophyHiddenPath } from '@/constants/game-library.constant';
import { UserContextService } from '@/services/user-context.service';
import { GameCardComponent } from './game-card.component';

const mockGame: GameListModel = {
  id: 1,
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  title: 'God of War',
  price: 59.99,
  store: 'GAME',
  platform: 'PS5',
  platinum: false,
  description: '',
  imageUrl: 'https://example.com/gow.jpg',
  status: 'playing',
  personalRating: 8,
  edition: null,
  format: 'physical',
  isFavorite: false,
  coverPosition: null,
  forSale: false,
  soldAt: null,
  soldPriceFinal: null,
  activeLoanId: null,
  activeLoanTo: null,
  activeLoanAt: null
};

describe('GameCardComponent — computed signals', () => {
  let component: GameCardComponent;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        GameCardComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: GAME_USE_CASES, useValue: { deleteGame: vi.fn() } as Partial<GameUseCasesContract> },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        {
          provide: UserContextService,
          useValue: { userId: signal('user-1'), isUserSelected: vi.fn(), clearUser: vi.fn() }
        }
      ]
    });

    const fixture = TestBed.createComponent(GameCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('game', mockGame);
    fixture.detectChanges();
  });

  describe('ratingStars', () => {
    it('devuelve 4 estrellas para rating 8', () => {
      expect(component.ratingStars()).toHaveLength(4);
    });

    it('devuelve 5 estrellas para rating 10', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, personalRating: 10 });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.ratingStars()).toHaveLength(5);
    });

    it('devuelve array vacío cuando personalRating es null', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, personalRating: null });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.ratingStars()).toEqual([]);
    });

    it('redondea hacia abajo (rating 7 → 3 estrellas)', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, personalRating: 7 });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.ratingStars()).toHaveLength(3);
    });
  });

  describe('platinumIcon', () => {
    it('devuelve la ruta del icono platinum cuando platinum es true', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, platinum: true });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.platinumIcon()).toBe(imagePlatinumPath);
    });

    it('devuelve la ruta del trofeo oculto cuando platinum es false', () => {
      expect(component.platinumIcon()).toBe(imageTrophyHiddenPath);
    });
  });

  describe('isDigital', () => {
    it('devuelve true cuando format es digital', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, format: 'digital' });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.isDigital()).toBe(true);
    });

    it('devuelve false cuando format es physical', () => {
      expect(component.isDigital()).toBe(false);
    });

    it('devuelve false cuando format es null', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, format: null });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.isDigital()).toBe(false);
    });
  });

  describe('defaultImage', () => {
    it('devuelve imageUrl cuando está disponible y no hay error', () => {
      expect(component.defaultImage()).toBe('https://example.com/gow.jpg');
    });

    it('devuelve defaultGameCover cuando imageUrl es undefined', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, imageUrl: undefined });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.defaultImage()).toBe(defaultGameCover);
    });

    it('devuelve defaultGameCover cuando imageError es true', () => {
      component.imageError.set(true);

      expect(component.defaultImage()).toBe(defaultGameCover);
    });
  });

  describe('coverObjectPosition y coverTransform', () => {
    it('usa 50% 50% como posición por defecto cuando coverPosition es null', () => {
      expect(component.coverObjectPosition()).toBe('50% 50%');
    });

    it('usa 50% 50% scale(1) por defecto', () => {
      expect(component.coverTransform()).toBe('scale(1)');
    });

    it('aplica la posición del coverPosition correctamente', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, coverPosition: '30% 70%' });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.coverObjectPosition()).toBe('30% 70%');
    });

    it('aplica el scale del coverPosition correctamente', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, coverPosition: '30% 70% 1.5' });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.coverTransform()).toBe('scale(1.5)');
    });

    it('usa 50% como fallback para y cuando coverPosition tiene un solo componente', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, coverPosition: '30%' });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.coverObjectPosition()).toBe('30% 50%');
    });
  });

  describe('isLoaned (computed)', () => {
    it('devuelve false cuando activeLoanId es null', () => {
      expect(component.isLoaned()).toBe(false);
    });

    it('devuelve true cuando activeLoanId tiene valor', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', {
        ...mockGame,
        activeLoanId: 'loan-1',
        activeLoanTo: 'Juan',
        activeLoanAt: '2024-06-01'
      });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.isLoaned()).toBe(true);
    });
  });

  describe('loanChipLabel (computed)', () => {
    it('devuelve el nombre completo si tiene 12 caracteres o menos', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, activeLoanId: 'loan-1', activeLoanTo: 'Juan' });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.loanChipLabel()).toBe('Juan');
    });

    it('trunca el nombre si supera los 12 caracteres', () => {
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', {
        ...mockGame,
        activeLoanId: 'loan-1',
        activeLoanTo: 'NombreMuyLargo123'
      });
      fixture2.detectChanges();

      expect(fixture2.componentInstance.loanChipLabel()).toBe('NombreMuyLar…');
    });

    it('devuelve cadena vacía cuando activeLoanTo es null', () => {
      expect(component.loanChipLabel()).toBe('');
    });
  });

  describe('_userId getter', () => {
    it('lanza Error cuando userId es null', () => {
      const userContext = TestBed.inject(UserContextService as any) as any;
      userContext.userId.set(null);
      expect(() => (component as any)._userId).toThrow('No user selected');
    });
  });

  describe('onFlip', () => {
    it('invierte el estado isFlipped al llamarlo', () => {
      expect(component.isFlipped()).toBe(false);

      component.onFlip();
      expect(component.isFlipped()).toBe(true);

      component.onFlip();
      expect(component.isFlipped()).toBe(false);
    });
  });

  describe('editGame', () => {
    it('navega a /games/list/:uuid cuando la tarjeta no está girada', () => {
      const router = TestBed.inject(Router as any) as any;
      component.editGame();
      expect(router.navigate).toHaveBeenCalledWith(['/games/list', mockGame.uuid]);
    });

    it('no navega cuando la tarjeta está girada', () => {
      const router = TestBed.inject(Router as any) as any;
      component.isFlipped.set(true);
      component.editGame();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('deleteGame', () => {
    it('no abre el dialog si el juego no tiene uuid', () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const fixture2 = TestBed.createComponent(GameCardComponent);
      fixture2.componentRef.setInput('game', { ...mockGame, uuid: undefined });
      fixture2.detectChanges();
      fixture2.componentInstance.deleteGame();
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('no elimina si el dialog se cancela', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.deleteGame();
      await new Promise((r) => setTimeout(r, 0));

      expect(gameUseCases.deleteGame).not.toHaveBeenCalled();
    });

    it('elimina el juego y emite gameDeleted si el dialog se confirma', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.deleteGame.mockResolvedValue(undefined);
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const spy = vi.spyOn(component.gameDeleted, 'emit');

      component.deleteGame();
      await new Promise((r) => setTimeout(r, 0));

      expect(gameUseCases.deleteGame).toHaveBeenCalledWith('user-1', mockGame.uuid);
      expect(spy).toHaveBeenCalledWith(mockGame.id);
    });
  });
});
