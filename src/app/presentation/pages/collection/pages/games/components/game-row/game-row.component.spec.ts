import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { GameListModel } from '@/models/game/game-list.model';
import { UserContextService } from '@/services/user-context/user-context.service';
import { GameRowComponent } from './game-row.component';

const mockGame: GameListModel = {
  id: 1,
  uuid: '550e8400-e29b-41d4-a716-446655440000',
  title: 'God of War',
  price: 59.99,
  store: 'GAME',
  platform: 'PS5',
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

describe('GameRowComponent', () => {
  let component: GameRowComponent;
  let routerNavigate: ReturnType<typeof vi.fn>;
  let dialogOpen: ReturnType<typeof vi.fn>;
  let deleteGame: ReturnType<typeof vi.fn>;

  function build(game: GameListModel = mockGame): GameRowComponent {
    const fixture = TestBed.createComponent(GameRowComponent);
    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    routerNavigate = vi.fn();
    dialogOpen = vi.fn();
    deleteGame = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      imports: [
        GameRowComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: { navigate: routerNavigate } },
        {
          provide: GAME_USE_CASES,
          useValue: { deleteGame } as Partial<GameUseCasesContract>
        },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        {
          provide: UserContextService,
          useValue: { userId: signal('user-1') }
        }
      ]
    });

    component = build();
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  describe('cover', () => {
    it('devuelve la imageUrl cuando existe', () => {
      expect(component.cover()).toBe('https://example.com/gow.jpg');
    });

    it('devuelve la portada por defecto cuando imageUrl es null/undefined', () => {
      const c = build({ ...mockGame, imageUrl: undefined });
      expect(c.cover()).toContain('default');
    });
  });

  describe('gameStatus', () => {
    it('resuelve el status cuando el code coincide con uno disponible', () => {
      expect(component.gameStatus()?.code).toBe('playing');
    });

    it('devuelve undefined cuando el status no existe', () => {
      const c = build({ ...mockGame, status: 'unknown' as never });
      expect(c.gameStatus()).toBeUndefined();
    });
  });

  describe('platformColor', () => {
    it('devuelve el color de plataforma cuando existe', () => {
      expect(component.platformColor()).toBeTruthy();
    });

    it('devuelve undefined cuando platform es null', () => {
      const c = build({ ...mockGame, platform: null });
      expect(c.platformColor()).toBeUndefined();
    });
  });

  describe('ratingStars', () => {
    it('mapea 0–10 a 0–5 estrellas (8 → 4)', () => {
      expect(component.ratingStars()).toBe(4);
    });

    it('devuelve 0 cuando rating es null', () => {
      const c = build({ ...mockGame, personalRating: null });
      expect(c.ratingStars()).toBe(0);
    });

    it('redondea correctamente (7 → 4)', () => {
      const c = build({ ...mockGame, personalRating: 7 });
      expect(c.ratingStars()).toBe(4);
    });
  });

  describe('onOpen', () => {
    it('navega al detalle usando el uuid', () => {
      component.onOpen();
      expect(routerNavigate).toHaveBeenCalledWith(['/collection/games', mockGame.uuid]);
    });

    it('no navega cuando uuid es undefined', () => {
      const c = build({ ...mockGame, uuid: undefined });
      c.onOpen();
      expect(routerNavigate).not.toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    function makeEvent(): Event {
      return { stopPropagation: vi.fn() } as unknown as Event;
    }

    it('detiene la propagación del click', () => {
      const evt = makeEvent();
      dialogOpen.mockReturnValue({ afterClosed: () => of(false) } as unknown as MatDialogRef<unknown>);
      component.onDelete(evt);
      expect(evt.stopPropagation).toHaveBeenCalledOnce();
    });

    it('abre el diálogo de confirmación', () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of(false) } as unknown as MatDialogRef<unknown>);
      component.onDelete(makeEvent());
      expect(dialogOpen).toHaveBeenCalledOnce();
    });

    it('no abre el diálogo cuando uuid es undefined', () => {
      const c = build({ ...mockGame, uuid: undefined });
      c.onDelete(makeEvent());
      expect(dialogOpen).not.toHaveBeenCalled();
    });

    it('elimina el juego y emite gameDeleted cuando se confirma', async () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of(true) } as unknown as MatDialogRef<unknown>);
      const emitSpy = vi.fn();
      component.gameDeleted.subscribe(emitSpy);

      component.onDelete(makeEvent());
      await Promise.resolve();
      await Promise.resolve();

      expect(deleteGame).toHaveBeenCalledWith('user-1', mockGame.uuid);
      expect(emitSpy).toHaveBeenCalledWith(mockGame.id);
    });

    it('no llama a deleteGame cuando se cancela', async () => {
      dialogOpen.mockReturnValue({ afterClosed: () => of(false) } as unknown as MatDialogRef<unknown>);
      component.onDelete(makeEvent());
      await Promise.resolve();
      expect(deleteGame).not.toHaveBeenCalled();
    });
  });
});
