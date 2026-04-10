import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { SoldGamesComponent } from './sold-games.component';
import { GAME_USE_CASES } from '@/domain/use-cases/game/game.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { GameListModel } from '@/models/game/game-list.model';

function makeGame(overrides: Partial<GameListModel> = {}): GameListModel {
  return {
    uuid: 'g-1',
    title: 'God of War',
    price: 20,
    store: null,
    platform: 'PS5',
    platinum: false,
    description: '',
    imageUrl: undefined,
    status: 'completed',
    personalRating: null,
    edition: null,
    format: 'physical',
    isFavorite: false,
    coverPosition: null,
    forSale: false,
    soldAt: '2024-06-01T00:00:00Z',
    soldPriceFinal: 25,
    activeLoanId: null,
    activeLoanTo: null,
    activeLoanAt: null,
    ...overrides
  };
}

describe('SoldGamesComponent', () => {
  let component: SoldGamesComponent;
  let fixture: ComponentFixture<SoldGamesComponent>;
  let mockGameUseCases: { getSoldGames: ReturnType<typeof vi.fn> };
  let mockLocation: { back: ReturnType<typeof vi.fn> };
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };
  let mockTransloco: { translate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGameUseCases = { getSoldGames: vi.fn().mockResolvedValue([]) };
    mockLocation = { back: vi.fn() };
    mockSnackBar = { open: vi.fn() };
    mockTransloco = { translate: vi.fn((k: string) => k) };

    TestBed.configureTestingModule({
      imports: [SoldGamesComponent],
      providers: [
        { provide: GAME_USE_CASES, useValue: mockGameUseCases },
        { provide: UserContextService, useValue: { userId: signal('user-1') } },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: TranslocoService, useValue: mockTransloco },
        { provide: Location, useValue: mockLocation }
      ]
    });
    TestBed.overrideComponent(SoldGamesComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(SoldGamesComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('loading es false', () => expect(component.loading()).toBe(false));
    it('soldGames es []', () => expect(component.soldGames()).toEqual([]));
  });

  describe('ngOnInit', () => {
    it('carga los juegos vendidos y los asigna a soldGames', async () => {
      const games = [makeGame()];
      mockGameUseCases.getSoldGames.mockResolvedValue(games);

      await component.ngOnInit();

      expect(component.soldGames()).toEqual(games);
      expect(component.loading()).toBe(false);
    });

    it('muestra snackbar si la carga falla', async () => {
      mockGameUseCases.getSoldGames.mockRejectedValue(new Error('DB error'));

      await component.ngOnInit();

      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });
  });

  describe('onBack', () => {
    it('llama a location.back()', () => {
      component.onBack();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('getPlatformLabel', () => {
    it('devuelve cadena vacía cuando platform es null', () => {
      expect(component.getPlatformLabel(null)).toBe('');
    });

    it('traduce la plataforma cuando existe en availablePlatformsConstant', () => {
      component.getPlatformLabel('PS5');
      expect(mockTransloco.translate).toHaveBeenCalledWith('consoles.ps5');
    });

    it('devuelve el código directamente si no existe en AVAILABLE_PLATFORMS', () => {
      const result = component.getPlatformLabel('UNKNOWN' as any);
      expect(result).toBe('UNKNOWN');
    });
  });

  describe('getDiff', () => {
    it('devuelve la diferencia entre soldPriceFinal y price', () => {
      expect(component.getDiff(makeGame({ price: 20, soldPriceFinal: 25 }))).toBe(5);
    });

    it('devuelve diferencia negativa cuando se vendió por menos', () => {
      expect(component.getDiff(makeGame({ price: 30, soldPriceFinal: 20 }))).toBe(-10);
    });

    it('devuelve null si soldPriceFinal es null', () => {
      expect(component.getDiff(makeGame({ soldPriceFinal: null }))).toBeNull();
    });

    it('devuelve null si price es null', () => {
      expect(component.getDiff(makeGame({ price: null }))).toBeNull();
    });
  });
});
