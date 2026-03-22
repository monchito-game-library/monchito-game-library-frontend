import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { GameListComponent } from './game-list.component';
import { GameListModel } from '@/models/game/game-list.model';
import { GAME_USE_CASES } from '@/domain/use-cases/game/game.use-cases.contract';
import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import { TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

function makeGame(overrides: Partial<GameListModel> = {}): GameListModel {
  return {
    title: 'Test Game',
    price: null,
    store: null,
    platform: null,
    platinum: false,
    description: '',
    status: 'backlog',
    personalRating: null,
    edition: null,
    format: null,
    isFavorite: false,
    ...overrides
  };
}

describe('GameListComponent', () => {
  let component: GameListComponent;
  let fixture: ComponentFixture<GameListComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [GameListComponent],
      providers: [
        { provide: GAME_USE_CASES, useValue: { getAllGamesForList: vi.fn().mockResolvedValue([]) } },
        { provide: STORE_USE_CASES, useValue: { getAllStores: vi.fn().mockResolvedValue([]) } },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: UserPreferencesService, useValue: { allGames: signal<GameListModel[]>([]) } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        provideRouter([]),
        { provide: BreakpointObserver, useValue: { observe: vi.fn().mockReturnValue(NEVER) } },
        { provide: MatBottomSheet, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(GameListComponent);
    component = fixture.componentInstance;
    // No detectChanges() — evitamos ngOnInit para no disparar llamadas async
  });

  describe('valores iniciales', () => {
    it('searchTerm es ""', () => expect(component.searchTerm()).toBe(''));
    it('selectedConsole es ""', () => expect(component.selectedConsole()).toBe(''));
    it('selectedStore es ""', () => expect(component.selectedStore()).toBe(''));
    it('selectedStatus es ""', () => expect(component.selectedStatus()).toBe(''));
    it('selectedFormat es ""', () => expect(component.selectedFormat()).toBe(''));
    it('onlyFavorites es false', () => expect(component.onlyFavorites()).toBe(false));
    it('sortBy es "title"', () => expect(component.sortBy()).toBe('title'));
    it('sortDirection es "asc"', () => expect(component.sortDirection()).toBe('asc'));
    it('allGames es []', () => expect(component.allGames()).toEqual([]));
    it('filteredGames es [] cuando no hay juegos', () => expect(component.filteredGames()).toEqual([]));
    it('ownedCount es 0', () => expect(component.ownedCount()).toBe(0));
    it('platinumCount es 0', () => expect(component.platinumCount()).toBe(0));
    it('totalPrice es 0', () => expect(component.totalPrice()).toBe(0));
    it('activeFilterCount es 0', () => expect(component.activeFilterCount()).toBe(0));
  });

  describe('filteredGames — sin filtros', () => {
    it('devuelve todos los juegos cuando no hay filtros activos', () => {
      component.allGames.set([makeGame({ title: 'A' }), makeGame({ title: 'B' })]);
      expect(component.filteredGames()).toHaveLength(2);
    });
  });

  describe('filteredGames — filtro por searchTerm', () => {
    it('filtra por título (case-insensitive)', () => {
      component.allGames.set([makeGame({ title: 'God of War' }), makeGame({ title: 'Spider-Man' })]);
      component.searchTerm.set('god');
      expect(component.filteredGames()).toHaveLength(1);
      expect(component.filteredGames()[0].title).toBe('God of War');
    });

    it('devuelve vacío si ningún título coincide', () => {
      component.allGames.set([makeGame({ title: 'God of War' })]);
      component.searchTerm.set('zelda');
      expect(component.filteredGames()).toHaveLength(0);
    });
  });

  describe('filteredGames — filtro por plataforma', () => {
    it('filtra por plataforma', () => {
      component.allGames.set([
        makeGame({ title: 'A', platform: 'PS5' }),
        makeGame({ title: 'B', platform: 'XBOX-SERIES' })
      ]);
      component.selectedConsole.set('PS5');
      expect(component.filteredGames()).toHaveLength(1);
      expect(component.filteredGames()[0].title).toBe('A');
    });
  });

  describe('filteredGames — filtro por store', () => {
    it('filtra por tienda (UUID)', () => {
      component.allGames.set([makeGame({ title: 'A', store: 'store-1' }), makeGame({ title: 'B', store: 'store-2' })]);
      component.selectedStore.set('store-1');
      expect(component.filteredGames()).toHaveLength(1);
    });
  });

  describe('filteredGames — filtro por status', () => {
    it('filtra por estado', () => {
      component.allGames.set([
        makeGame({ title: 'A', status: 'platinum' }),
        makeGame({ title: 'B', status: 'backlog' })
      ]);
      component.selectedStatus.set('platinum');
      expect(component.filteredGames()).toHaveLength(1);
    });
  });

  describe('filteredGames — filtro por formato', () => {
    it('filtra por formato físico', () => {
      component.allGames.set([
        makeGame({ title: 'A', format: 'physical' }),
        makeGame({ title: 'B', format: 'digital' })
      ]);
      component.selectedFormat.set('physical');
      expect(component.filteredGames()).toHaveLength(1);
      expect(component.filteredGames()[0].title).toBe('A');
    });
  });

  describe('filteredGames — filtro por favoritos', () => {
    it('muestra solo favoritos cuando onlyFavorites es true', () => {
      component.allGames.set([makeGame({ title: 'A', isFavorite: true }), makeGame({ title: 'B', isFavorite: false })]);
      component.onlyFavorites.set(true);
      expect(component.filteredGames()).toHaveLength(1);
      expect(component.filteredGames()[0].title).toBe('A');
    });
  });

  describe('filteredGames — filtros combinados', () => {
    it('aplica múltiples filtros simultáneamente (AND)', () => {
      component.allGames.set([
        makeGame({ title: 'God of War', platform: 'PS5', status: 'platinum' }),
        makeGame({ title: 'God of War', platform: 'PC', status: 'backlog' }),
        makeGame({ title: 'Spider-Man', platform: 'PS5', status: 'platinum' })
      ]);
      component.searchTerm.set('god');
      component.selectedConsole.set('PS5');
      expect(component.filteredGames()).toHaveLength(1);
    });
  });

  describe('filteredGames — orden', () => {
    it('ordena por título ascendente por defecto', () => {
      component.allGames.set([
        makeGame({ title: 'Zelda' }),
        makeGame({ title: 'Astro' }),
        makeGame({ title: 'Mario' })
      ]);
      const titles = component.filteredGames().map((g) => g.title);
      expect(titles).toEqual(['Astro', 'Mario', 'Zelda']);
    });

    it('ordena por título descendente', () => {
      component.allGames.set([
        makeGame({ title: 'Zelda' }),
        makeGame({ title: 'Astro' }),
        makeGame({ title: 'Mario' })
      ]);
      component.sortDirection.set('desc');
      const titles = component.filteredGames().map((g) => g.title);
      expect(titles).toEqual(['Zelda', 'Mario', 'Astro']);
    });

    it('ordena por precio ascendente', () => {
      component.allGames.set([
        makeGame({ title: 'C', price: 30 }),
        makeGame({ title: 'A', price: 10 }),
        makeGame({ title: 'B', price: 20 })
      ]);
      component.sortBy.set('price');
      const prices = component.filteredGames().map((g) => g.price);
      expect(prices).toEqual([10, 20, 30]);
    });

    it('ordena por precio descendente', () => {
      component.allGames.set([
        makeGame({ title: 'C', price: 30 }),
        makeGame({ title: 'A', price: 10 }),
        makeGame({ title: 'B', price: 20 })
      ]);
      component.sortBy.set('price');
      component.sortDirection.set('desc');
      const prices = component.filteredGames().map((g) => g.price);
      expect(prices).toEqual([30, 20, 10]);
    });
  });

  describe('gameRows', () => {
    it('agrupa los juegos en filas de columnCount elementos', () => {
      component.allGames.set([
        makeGame({ title: 'A' }),
        makeGame({ title: 'B' }),
        makeGame({ title: 'C' }),
        makeGame({ title: 'D' }),
        makeGame({ title: 'E' })
      ]);
      component.columnCount.set(3);
      const rows = component.gameRows();
      expect(rows).toHaveLength(2);
      expect(rows[0]).toHaveLength(3);
      expect(rows[1]).toHaveLength(2);
    });

    it('devuelve una sola fila si hay menos juegos que columnas', () => {
      component.allGames.set([makeGame({ title: 'A' }), makeGame({ title: 'B' })]);
      component.columnCount.set(4);
      expect(component.gameRows()).toHaveLength(1);
    });

    it('devuelve vacío si no hay juegos', () => {
      component.allGames.set([]);
      expect(component.gameRows()).toEqual([]);
    });
  });

  describe('ownedCount', () => {
    it('refleja el número de juegos filtrados', () => {
      component.allGames.set([
        makeGame({ platform: 'PS5' }),
        makeGame({ platform: 'PC' }),
        makeGame({ platform: 'PS5' })
      ]);
      component.selectedConsole.set('PS5');
      expect(component.ownedCount()).toBe(2);
    });
  });

  describe('platinumCount', () => {
    it('cuenta solo los juegos con status platinum', () => {
      component.allGames.set([
        makeGame({ status: 'platinum' }),
        makeGame({ status: 'platinum' }),
        makeGame({ status: 'backlog' })
      ]);
      expect(component.platinumCount()).toBe(2);
    });
  });

  describe('totalPrice', () => {
    it('suma los precios de los juegos filtrados', () => {
      component.allGames.set([makeGame({ price: 20 }), makeGame({ price: 35 }), makeGame({ price: null })]);
      expect(component.totalPrice()).toBe(55);
    });

    it('trata null como 0 en la suma', () => {
      component.allGames.set([makeGame({ price: null }), makeGame({ price: null })]);
      expect(component.totalPrice()).toBe(0);
    });
  });

  describe('activeFilterCount', () => {
    it('es 0 cuando no hay filtros activos', () => {
      expect(component.activeFilterCount()).toBe(0);
    });

    it('incrementa por cada filtro activo', () => {
      component.selectedConsole.set('PS5');
      expect(component.activeFilterCount()).toBe(1);
      component.selectedStore.set('store-1');
      expect(component.activeFilterCount()).toBe(2);
      component.selectedStatus.set('platinum');
      expect(component.activeFilterCount()).toBe(3);
      component.selectedFormat.set('physical');
      expect(component.activeFilterCount()).toBe(4);
      component.onlyFavorites.set(true);
      expect(component.activeFilterCount()).toBe(5);
    });

    it('no cuenta el searchTerm en activeFilterCount', () => {
      component.searchTerm.set('god');
      expect(component.activeFilterCount()).toBe(0);
    });
  });

  describe('formatFilterIcon', () => {
    it('devuelve "sports_esports" cuando no hay filtro de formato', () => {
      expect(component.formatFilterIcon()).toBe('sports_esports');
    });

    it('devuelve "album" cuando el formato es physical', () => {
      component.selectedFormat.set('physical');
      expect(component.formatFilterIcon()).toBe('album');
    });

    it('devuelve "cloud" cuando el formato es digital', () => {
      component.selectedFormat.set('digital');
      expect(component.formatFilterIcon()).toBe('cloud');
    });
  });

  describe('clearAllFilters', () => {
    it('resetea todos los filtros a sus valores por defecto', () => {
      component.searchTerm.set('god');
      component.selectedConsole.set('PS5');
      component.selectedStore.set('store-1');
      component.selectedStatus.set('platinum');
      component.selectedFormat.set('physical');
      component.onlyFavorites.set(true);

      component.clearAllFilters();

      expect(component.searchTerm()).toBe('');
      expect(component.selectedConsole()).toBe('');
      expect(component.selectedStore()).toBe('');
      expect(component.selectedStatus()).toBe('');
      expect(component.selectedFormat()).toBe('');
      expect(component.onlyFavorites()).toBe(false);
    });
  });

  describe('onSearchInput', () => {
    it('actualiza searchTerm con el valor del input (trim)', () => {
      const event = { target: { value: '  god of war  ' } } as unknown as Event;
      component.onSearchInput(event);
      expect(component.searchTerm()).toBe('god of war');
    });

    it('no falla si el target es null', () => {
      const event = { target: null } as unknown as Event;
      expect(() => component.onSearchInput(event)).not.toThrow();
    });
  });
});
