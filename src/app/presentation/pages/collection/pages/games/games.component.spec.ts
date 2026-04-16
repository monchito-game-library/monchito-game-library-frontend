import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, Subject } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { GamesComponent } from './games.component';
import { GameListModel } from '@/models/game/game-list.model';
import { GAME_USE_CASES } from '@/domain/use-cases/game/game.use-cases.contract';
import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';
import { TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
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
    forSale: false,
    soldAt: null,
    soldPriceFinal: null,
    activeLoanId: null,
    activeLoanTo: null,
    activeLoanAt: null,
    ...overrides
  };
}

describe('GamesComponent', () => {
  let component: GamesComponent;
  let fixture: ComponentFixture<GamesComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [GamesComponent],
      providers: [
        { provide: GAME_USE_CASES, useValue: { getAllGamesForList: vi.fn().mockResolvedValue([]) } },
        { provide: STORE_USE_CASES, useValue: { getAllStores: vi.fn().mockResolvedValue([]) } },
        {
          provide: UserContextService,
          useValue: { userId: signal<string | null>('user-1'), requireUserId: vi.fn().mockReturnValue('user-1') }
        },
        { provide: UserPreferencesService, useValue: { allGames: signal<GameListModel[]>([]) } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        provideRouter([]),
        { provide: BreakpointObserver, useValue: { observe: vi.fn().mockReturnValue(NEVER) } },
        { provide: MatBottomSheet, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(GamesComponent);
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
    it('onlyLoaned es false', () => expect(component.onlyLoaned()).toBe(false));
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

  describe('filteredGames — filtro por prestados', () => {
    it('muestra solo prestados cuando onlyLoaned es true', () => {
      component.allGames.set([
        makeGame({ title: 'A', activeLoanId: 'loan-1', activeLoanTo: 'Juan', activeLoanAt: '2024-06-01' }),
        makeGame({ title: 'B', activeLoanId: null })
      ]);
      component.onlyLoaned.set(true);
      expect(component.filteredGames()).toHaveLength(1);
      expect(component.filteredGames()[0].title).toBe('A');
    });

    it('muestra todos cuando onlyLoaned es false', () => {
      component.allGames.set([
        makeGame({ title: 'A', activeLoanId: 'loan-1', activeLoanTo: 'Juan', activeLoanAt: '2024-06-01' }),
        makeGame({ title: 'B', activeLoanId: null })
      ]);
      component.onlyLoaned.set(false);
      expect(component.filteredGames()).toHaveLength(2);
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

    it('ordena por personal_rating ascendente', () => {
      component.allGames.set([
        makeGame({ title: 'A', personalRating: 8 }),
        makeGame({ title: 'B', personalRating: 5 }),
        makeGame({ title: 'C', personalRating: 10 })
      ]);
      component.sortBy.set('personal_rating');
      const ratings = component.filteredGames().map((g) => g.personalRating);
      expect(ratings).toEqual([5, 8, 10]);
    });

    it('ordena por created_at (id desc) como criterio por defecto', () => {
      component.allGames.set([
        makeGame({ id: 1, title: 'A' }),
        makeGame({ id: 3, title: 'B' }),
        makeGame({ id: 2, title: 'C' })
      ]);
      component.sortBy.set('created_at');
      const ids = component.filteredGames().map((g) => g.id);
      expect(ids).toEqual([3, 2, 1]);
    });

    it('trata null como 0 al ordenar por precio (|| 0)', () => {
      component.allGames.set([makeGame({ title: 'A', price: null }), makeGame({ title: 'B', price: 10 })]);
      component.sortBy.set('price');
      component.sortDirection.set('asc');
      const prices = component.filteredGames().map((g) => g.price);
      expect(prices).toEqual([null, 10]);
    });

    it('trata null como 0 al ordenar por personal_rating (|| 0)', () => {
      component.allGames.set([
        makeGame({ title: 'A', personalRating: null }),
        makeGame({ title: 'B', personalRating: 7 })
      ]);
      component.sortBy.set('personal_rating');
      component.sortDirection.set('asc');
      const ratings = component.filteredGames().map((g) => g.personalRating);
      expect(ratings).toEqual([null, 7]);
    });

    it('trata undefined id como 0 al ordenar por created_at (|| 0)', () => {
      component.allGames.set([makeGame({ title: 'A' }), makeGame({ id: 5, title: 'B' })]);
      component.sortBy.set('created_at');
      const ids = component.filteredGames().map((g) => g.id);
      expect(ids[0]).toBe(5);
    });

    it('cubre brazo || 0 de b.price cuando b.price es null', () => {
      component.allGames.set([makeGame({ title: 'B', price: 10 }), makeGame({ title: 'A', price: null })]);
      component.sortBy.set('price');
      component.sortDirection.set('asc');
      const prices = component.filteredGames().map((g) => g.price);
      expect(prices).toEqual([null, 10]);
    });

    it('cubre brazo || 0 de b.personalRating cuando b.personalRating es null', () => {
      component.allGames.set([
        makeGame({ title: 'B', personalRating: 7 }),
        makeGame({ title: 'A', personalRating: null })
      ]);
      component.sortBy.set('personal_rating');
      component.sortDirection.set('asc');
      const ratings = component.filteredGames().map((g) => g.personalRating);
      expect(ratings).toEqual([null, 7]);
    });

    it('cubre brazo || 0 de a.id cuando a.id es undefined en created_at', () => {
      component.allGames.set([makeGame({ id: 5, title: 'B' }), makeGame({ title: 'A' })]);
      component.sortBy.set('created_at');
      const ids = component.filteredGames().map((g) => g.id);
      expect(ids[0]).toBe(5);
    });
  });

  describe('trackByRowIndex', () => {
    it('devuelve el índice de fila recibido', () => {
      expect(component.trackByRowIndex(0)).toBe(0);
      expect(component.trackByRowIndex(5)).toBe(5);
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
      component.onlyLoaned.set(true);
      expect(component.activeFilterCount()).toBe(6);
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
      component.onlyLoaned.set(true);

      component.clearAllFilters();

      expect(component.searchTerm()).toBe('');
      expect(component.selectedConsole()).toBe('');
      expect(component.selectedStore()).toBe('');
      expect(component.selectedStatus()).toBe('');
      expect(component.selectedFormat()).toBe('');
      expect(component.onlyFavorites()).toBe(false);
      expect(component.onlyLoaned()).toBe(false);
    });
  });

  describe('onSearchInput', () => {
    it('actualiza searchTerm con el valor recibido (trim)', () => {
      component.onSearchInput('  god of war  ');
      expect(component.searchTerm()).toBe('god of war');
    });

    it('acepta cadena vacía sin lanzar error', () => {
      expect(() => component.onSearchInput('')).not.toThrow();
      expect(component.searchTerm()).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('carga juegos desde Supabase cuando la caché está vacía', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      const mockGames = [makeGame({ title: 'Zelda' })];
      gameUseCases.getAllGamesForList.mockResolvedValue(mockGames);

      await component.ngOnInit();

      expect(component.allGames()).toEqual(mockGames);
      expect(component.loading()).toBe(false);
    });

    it('muestra la caché inmediatamente y luego recarga desde Supabase', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      const userPreferences = TestBed.inject(UserPreferencesService as any) as any;
      const cached = [makeGame({ title: 'Cached' })];
      const fresh = [makeGame({ title: 'Fresh' })];
      userPreferences.allGames.set(cached);
      gameUseCases.getAllGamesForList.mockResolvedValue(fresh);

      await component.ngOnInit();

      // Always forces a refresh even when cache is present
      expect(gameUseCases.getAllGamesForList).toHaveBeenCalled();
      expect(component.allGames()).toEqual(fresh);
    });
  });

  describe('onGameDeleted', () => {
    it('recarga la lista y muestra snackbar de confirmación', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.getAllGamesForList.mockResolvedValue([]);
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onGameDeleted();

      expect(gameUseCases.getAllGamesForList).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalled();
    });
  });

  describe('openFiltersSheet', () => {
    it('abre la hoja de filtros con el data correcto', () => {
      const bottomSheet = TestBed.inject(MatBottomSheet as any) as any;
      component.openFiltersSheet();
      expect(bottomSheet.open).toHaveBeenCalled();
    });

    it('la función clearAllFilters del data limpia los filtros', () => {
      const bottomSheet = TestBed.inject(MatBottomSheet as any) as any;
      component.searchTerm.set('zelda');
      component.selectedConsole.set('PS5');
      component.openFiltersSheet();
      const data = bottomSheet.open.mock.calls[0][1].data;
      data.clearAllFilters();
      expect(component.searchTerm()).toBe('');
      expect(component.selectedConsole()).toBe('');
    });
  });

  describe('rowItemSize', () => {
    it('devuelve un número positivo para la altura de la fila', () => {
      const size = component.rowItemSize();
      expect(size).toBeGreaterThan(0);
    });

    it('cambia según columnCount e isMobile', () => {
      component.columnCount.set(2);
      component.isMobile.set(true);
      const sizeMobile = component.rowItemSize();

      component.columnCount.set(6);
      component.isMobile.set(false);
      const sizeDesktop = component.rowItemSize();

      expect(sizeMobile).toBeGreaterThan(sizeDesktop);
    });
  });

  describe('ngOnDestroy', () => {
    it('se llama sin errores tras ngOnInit', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.getAllGamesForList.mockResolvedValue([]);
      await component.ngOnInit();
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('_loadGames con error', () => {
    it('muestra snackbar si la carga desde Supabase falla', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      gameUseCases.getAllGamesForList.mockRejectedValue(new Error('fail'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await (component as any)._loadGames(true);

      expect(snackBar.open).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });
  });

  describe('_loadGames con caché', () => {
    it('usa la caché y no llama a Supabase cuando forceRefresh es false y hay datos en caché', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
      const userPreferences = TestBed.inject(UserPreferencesService as any) as any;
      const cachedGames = [makeGame({ title: 'Cached' })];
      userPreferences.allGames.set(cachedGames);

      await (component as any)._loadGames(false);

      expect(gameUseCases.getAllGamesForList).not.toHaveBeenCalled();
      expect(component.allGames()).toEqual(cachedGames);
      expect(component.loading()).toBe(false);
    });
  });

  describe('onAdd', () => {
    it('navega al formulario de alta de juego', () => {
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.onAdd();
      expect(spy).toHaveBeenCalledWith(['/collection/games/add']);
    });
  });
});

describe('GamesComponent — _userId sin usuario autenticado', () => {
  it('_loadGames muestra snackbar de error si userId es null', async () => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [GamesComponent],
      providers: [
        { provide: GAME_USE_CASES, useValue: { getAllGamesForList: vi.fn() } },
        { provide: STORE_USE_CASES, useValue: { getAllStores: vi.fn().mockResolvedValue([]) } },
        {
          provide: UserContextService,
          useValue: {
            userId: signal<string | null>(null),
            requireUserId: vi.fn(() => {
              throw new Error('No user selected');
            })
          }
        },
        { provide: UserPreferencesService, useValue: { allGames: signal<GameListModel[]>([]) } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        provideRouter([]),
        { provide: BreakpointObserver, useValue: { observe: vi.fn().mockReturnValue(NEVER) } },
        { provide: MatBottomSheet, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(GamesComponent, { set: { imports: [], template: '' } });
    const fixture = TestBed.createComponent(GamesComponent);
    const component = fixture.componentInstance;
    const snackBar = TestBed.inject(MatSnackBar as any) as any;

    await (component as any)._loadGames(true);

    expect(snackBar.open).toHaveBeenCalled();
  });
});

describe('GamesComponent — breakpoint observer', () => {
  let component: GamesComponent;
  let bpSubject: Subject<BreakpointState>;

  beforeEach(async () => {
    vi.clearAllMocks();
    bpSubject = new Subject<BreakpointState>();

    TestBed.configureTestingModule({
      imports: [GamesComponent],
      providers: [
        { provide: GAME_USE_CASES, useValue: { getAllGamesForList: vi.fn().mockResolvedValue([]) } },
        { provide: STORE_USE_CASES, useValue: { getAllStores: vi.fn().mockResolvedValue([]) } },
        {
          provide: UserContextService,
          useValue: { userId: signal<string | null>('user-1'), requireUserId: vi.fn().mockReturnValue('user-1') }
        },
        { provide: UserPreferencesService, useValue: { allGames: signal<GameListModel[]>([]) } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        provideRouter([]),
        { provide: BreakpointObserver, useValue: { observe: vi.fn().mockReturnValue(bpSubject.asObservable()) } },
        { provide: MatBottomSheet, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const fixture = TestBed.createComponent(GamesComponent);
    component = fixture.componentInstance;
    await component.ngOnInit();
  });

  function emitBp(
    active600: boolean,
    active768: boolean,
    active900: boolean,
    active1200: boolean,
    active1600: boolean
  ): void {
    bpSubject.next({
      matches: active768,
      breakpoints: {
        '(max-width: 600px)': active600,
        '(max-width: 768px)': active768,
        '(max-width: 900px)': active900,
        '(max-width: 1200px)': active1200,
        '(max-width: 1600px)': active1600
      }
    });
  }

  it('establece columnCount=2 cuando max-width 600px está activo', () => {
    emitBp(true, true, true, true, true);
    expect(component.columnCount()).toBe(2);
    expect(component.isMobile()).toBe(true);
  });

  it('establece columnCount=3 cuando max-width 900px activo (sin 600px)', () => {
    emitBp(false, true, true, true, true);
    expect(component.columnCount()).toBe(3);
    expect(component.isMobile()).toBe(true);
  });

  it('establece columnCount=4 cuando max-width 1200px activo (sin 600/900px)', () => {
    emitBp(false, false, false, true, true);
    expect(component.columnCount()).toBe(4);
    expect(component.isMobile()).toBe(false);
  });

  it('establece columnCount=5 cuando max-width 1600px activo (sin menores)', () => {
    emitBp(false, false, false, false, true);
    expect(component.columnCount()).toBe(5);
  });

  it('establece columnCount=6 cuando ningún breakpoint está activo', () => {
    emitBp(false, false, false, false, false);
    expect(component.columnCount()).toBe(6);
  });
});

describe('GamesComponent — carga inicial', () => {
  let component: GamesComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [GamesComponent],
      providers: [
        { provide: GAME_USE_CASES, useValue: { getAllGamesForList: vi.fn().mockResolvedValue([]) } },
        { provide: STORE_USE_CASES, useValue: { getAllStores: vi.fn().mockResolvedValue([]) } },
        {
          provide: UserContextService,
          useValue: { userId: signal<string | null>('user-1'), requireUserId: vi.fn().mockReturnValue('user-1') }
        },
        { provide: UserPreferencesService, useValue: { allGames: signal<GameListModel[]>([]) } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn(), events: NEVER } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: vi.fn() } } } },
        { provide: BreakpointObserver, useValue: { observe: vi.fn().mockReturnValue(NEVER) } },
        { provide: MatBottomSheet, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    TestBed.overrideComponent(GamesComponent, { set: { imports: [], template: '' } });
    const fixture = TestBed.createComponent(GamesComponent);
    component = fixture.componentInstance;
    await component.ngOnInit();
  });

  it('siempre llama a getAllGamesForList en ngOnInit (force refresh)', () => {
    const gameUseCases = TestBed.inject(GAME_USE_CASES as any) as any;
    expect(gameUseCases.getAllGamesForList).toHaveBeenCalledWith('user-1');
  });

  it('loading queda en false tras la carga', () => {
    expect(component.loading()).toBe(false);
  });
});
