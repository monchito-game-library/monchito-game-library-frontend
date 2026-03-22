import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { NEVER } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { GameFormComponent } from './game-form.component';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { GAME_USE_CASES } from '@/domain/use-cases/game/game.use-cases.contract';
import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { WISHLIST_USE_CASES } from '@/domain/use-cases/wishlist/wishlist.use-cases.contract';
import { CATALOG_USE_CASES } from '@/domain/use-cases/catalog/catalog.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import { TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

const mockCatalogDto: GameCatalogDto = {
  rawg_id: null,
  title: 'God of War',
  slug: 'god-of-war',
  image_url: 'https://cdn.example.com/gow.jpg',
  released_date: '2018-04-20',
  rating: 4.5,
  platforms: ['PlayStation 4', 'PlayStation 5'],
  genres: ['Action'],
  source: 'rawg',
  esrb_rating: null,
  metacritic_score: null,
  screenshots: []
};

describe('GameFormComponent', () => {
  let component: GameFormComponent;
  let fixture: ComponentFixture<GameFormComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [GameFormComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync('noop'),
        {
          provide: GAME_USE_CASES,
          useValue: {
            getAllGamesForList: vi.fn(),
            getGameForEdit: vi.fn(),
            addGame: vi.fn(),
            updateGame: vi.fn(),
            deleteGame: vi.fn()
          }
        },
        { provide: STORE_USE_CASES, useValue: { getAllStores: vi.fn().mockResolvedValue([]) } },
        { provide: WISHLIST_USE_CASES, useValue: { deleteItem: vi.fn() } },
        {
          provide: CATALOG_USE_CASES,
          useValue: {
            getScreenshots: vi.fn().mockResolvedValue([]),
            searchBanners: vi.fn(),
            getTopBanners: vi.fn(),
            getAllGameScreenshots: vi.fn().mockResolvedValue([])
          }
        },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: UserPreferencesService, useValue: { allGames: signal([]) } },
        {
          provide: TranslocoService,
          useValue: { translate: vi.fn((k: string) => k), getActiveLang: vi.fn().mockReturnValue('es') }
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(GameFormComponent, { set: { imports: [], template: '' } });

    fixture = TestBed.createComponent(GameFormComponent);
    component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    // No detectChanges() — evitamos ngOnInit y la carga async de datos
  });

  describe('valores iniciales', () => {
    it('searchMode es false', () => expect(component.searchMode()).toBe(false));
    it('loading es false', () => expect(component.loading()).toBe(false));
    it('saving es false', () => expect(component.saving()).toBe(false));
    it('screenshotsLoading es false', () => expect(component.screenshotsLoading()).toBe(false));
    it('isEditMode es false', () => expect(component.isEditMode).toBe(false));
    it('selectedGame es null', () => expect(component.selectedGame()).toBeNull());
    it('selectedImageUrl es null', () => expect(component.selectedImageUrl()).toBeNull());
    it('gamePlatforms es []', () => expect(component.gamePlatforms()).toEqual([]));
    it('hasChanges es true en modo creación', () => expect(component.hasChanges()).toBe(true));
    it('coverObjectPosition es "50% 50%" cuando no hay posición', () =>
      expect(component.coverObjectPosition()).toBe('50% 50%'));
    it('coverTransform es "scale(1)" cuando no hay posición', () =>
      expect(component.coverTransform()).toBe('scale(1)'));
  });

  describe('coverObjectPosition', () => {
    it('devuelve la posición cuando _coverPosition tiene valor', () => {
      (component as any)._coverPosition.set('30% 70%');
      expect(component.coverObjectPosition()).toBe('30% 70%');
    });
  });

  describe('coverTransform', () => {
    it('devuelve la escala cuando _coverPosition tiene 3 partes', () => {
      (component as any)._coverPosition.set('50% 50% 1.5');
      expect(component.coverTransform()).toBe('scale(1.5)');
    });

    it('devuelve "scale(1)" cuando _coverPosition tiene menos de 3 partes', () => {
      (component as any)._coverPosition.set('50% 50%');
      expect(component.coverTransform()).toBe('scale(1)');
    });
  });

  describe('coverImages', () => {
    it('devuelve [] cuando no hay juego seleccionado', () => {
      expect(component.coverImages()).toEqual([]);
    });

    it('devuelve solo el cover cuando no hay screenshots', () => {
      component.selectedGame.set({
        rawg_id: 1,
        title: 'Test',
        slug: 'test',
        image_url: 'https://cdn.example.com/cover.jpg',
        released_date: null,
        rating: 4,
        platforms: [],
        genres: [],
        screenshots: []
      });
      expect(component.coverImages()).toEqual(['https://cdn.example.com/cover.jpg']);
    });

    it('incluye screenshots sin duplicar el cover', () => {
      component.selectedGame.set({
        rawg_id: 1,
        title: 'Test',
        slug: 'test',
        image_url: 'https://cdn.example.com/cover.jpg',
        released_date: null,
        rating: 4,
        platforms: [],
        genres: [],
        screenshots: ['https://cdn.example.com/cover.jpg', 'https://cdn.example.com/ss1.jpg']
      });
      const images = component.coverImages();
      expect(images).toHaveLength(2);
      expect(images).toContain('https://cdn.example.com/cover.jpg');
      expect(images).toContain('https://cdn.example.com/ss1.jpg');
    });
  });

  describe('openSearchMode / closeSearchMode', () => {
    it('openSearchMode activa el modo búsqueda', () => {
      component.openSearchMode();
      expect(component.searchMode()).toBe(true);
    });

    it('closeSearchMode desactiva el modo búsqueda', () => {
      component.searchMode.set(true);
      component.closeSearchMode();
      expect(component.searchMode()).toBe(false);
    });
  });

  describe('selectGameFromSearch', () => {
    it('establece selectedGame con los datos del catálogo', () => {
      component.selectGameFromSearch(mockCatalogDto);
      expect(component.selectedGame()?.title).toBe('God of War');
    });

    it('establece selectedImageUrl con la URL de la portada', () => {
      component.selectGameFromSearch(mockCatalogDto);
      expect(component.selectedImageUrl()).toBe('https://cdn.example.com/gow.jpg');
    });

    it('rellena el campo título del formulario', () => {
      component.selectGameFromSearch(mockCatalogDto);
      expect(component.form.value.title).toBe('God of War');
    });

    it('puebla gamePlatforms cuando el juego tiene plataformas', () => {
      component.selectGameFromSearch(mockCatalogDto);
      const names = component.gamePlatforms().map((p) => p.name);
      expect(names).toContain('PlayStation 4');
      expect(names).toContain('PlayStation 5');
    });

    it('cierra el modo búsqueda', () => {
      component.searchMode.set(true);
      component.selectGameFromSearch(mockCatalogDto);
      expect(component.searchMode()).toBe(false);
    });

    it('limpia gamePlatforms cuando el juego no tiene plataformas', () => {
      component.gamePlatforms.set([{ name: 'PS5', code: 'PS5' }]);
      component.selectGameFromSearch({ ...mockCatalogDto, platforms: [] });
      expect(component.gamePlatforms()).toEqual([]);
    });

    it('llama a _loadScreenshots cuando rawg_id es truthy', () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES);
      component.selectGameFromSearch({ ...mockCatalogDto, rawg_id: 58175 });
      expect((catalogUseCases as any).getAllGameScreenshots).toHaveBeenCalled();
    });
  });

  describe('clearSelectedGame', () => {
    it('limpia selectedGame', () => {
      component.selectedGame.set({
        rawg_id: 1,
        title: 'Test',
        slug: 'test',
        image_url: null,
        released_date: null,
        rating: 4,
        platforms: [],
        genres: []
      });
      component.clearSelectedGame();
      expect(component.selectedGame()).toBeNull();
    });

    it('limpia selectedImageUrl', () => {
      component.selectedImageUrl.set('https://cdn.example.com/cover.jpg');
      component.clearSelectedGame();
      expect(component.selectedImageUrl()).toBeNull();
    });

    it('limpia gamePlatforms', () => {
      component.gamePlatforms.set([{ name: 'PS5', code: 'PS5' }]);
      component.clearSelectedGame();
      expect(component.gamePlatforms()).toEqual([]);
    });

    it('limpia el título en modo creación', () => {
      component.form.patchValue({ title: 'God of War' });
      component.clearSelectedGame();
      expect(component.form.value.title).toBe('');
    });
  });

  describe('filteredStores', () => {
    it('devuelve todas las tiendas cuando el input está vacío', () => {
      (component as any)._storeModels.set([
        { id: '1', label: 'Amazon', format: null },
        { id: '2', label: 'GAME', format: null }
      ]);
      expect(component.filteredStores()).toHaveLength(2);
    });

    it('filtra tiendas por nombre (case-insensitive)', () => {
      (component as any)._storeModels.set([
        { id: '1', label: 'Amazon', format: null },
        { id: '2', label: 'GAME', format: null }
      ]);
      component.form.controls.store.setValue('ama');
      expect(component.filteredStores()).toHaveLength(1);
      expect(component.filteredStores()[0].label).toBe('Amazon');
    });
  });

  describe('onSelectImage', () => {
    it('actualiza selectedImageUrl con la URL proporcionada', () => {
      component.onSelectImage('https://cdn.example.com/ss1.jpg');
      expect(component.selectedImageUrl()).toBe('https://cdn.example.com/ss1.jpg');
    });
  });

  describe('displayStoreLabel', () => {
    it('devuelve "" cuando id es null', () => {
      expect(component.displayStoreLabel(null)).toBe('');
    });

    it('devuelve el label de la tienda cuando existe', () => {
      (component as any)._storeModels.set([{ id: 'store-1', label: 'GAME', formatHint: null }]);
      expect(component.displayStoreLabel('store-1')).toBe('GAME');
    });

    it('devuelve "" cuando la tienda no se encuentra', () => {
      (component as any)._storeModels.set([]);
      expect(component.displayStoreLabel('unknown')).toBe('');
    });
  });

  describe('displayPlatformLabel', () => {
    it('devuelve "" cuando el código es null', () => {
      expect(component.displayPlatformLabel(null)).toBe('');
    });

    it('devuelve el código como fallback cuando la plataforma no existe', () => {
      expect(component.displayPlatformLabel('UNKNOWN' as any)).toBe('UNKNOWN');
    });
  });

  describe('onFormatChange', () => {
    it('marca el formato como tocado por el usuario', () => {
      component.onFormatChange('digital');
      expect((component as any)._formatTouchedByUser).toBe(true);
    });

    it('actualiza el valor del control format', () => {
      component.onFormatChange('digital');
      expect(component.form.controls.format.value).toBe('digital');
    });
  });

  describe('_onStoreChange', () => {
    it('no cambia el formato cuando _formatTouchedByUser es true', () => {
      (component as any)._formatTouchedByUser = true;
      (component as any)._storeModels.set([{ id: 'store-1', label: 'GAME', formatHint: 'digital' }]);
      component.form.controls.format.setValue('physical');

      (component as any)._onStoreChange('store-1');

      expect(component.form.controls.format.value).toBe('physical');
    });

    it('sugiere el formato del store cuando no ha sido tocado por el usuario', () => {
      (component as any)._formatTouchedByUser = false;
      (component as any)._storeModels.set([{ id: 'store-1', label: 'GAME', formatHint: 'digital' }]);

      (component as any)._onStoreChange('store-1');

      expect(component.form.controls.format.value).toBe('digital');
    });

    it('resetea _formatTouchedByUser cuando id es null', () => {
      (component as any)._formatTouchedByUser = true;

      (component as any)._onStoreChange(null);

      expect((component as any)._formatTouchedByUser).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('no abre el diálogo cuando el formulario es inválido', () => {
      const dialog = TestBed.inject(MatDialog);
      component.onSubmit();
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('no procede cuando el diálogo no se confirma', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(false) });
      component.form.patchValue({ title: 'God of War', platform: 'PS5' });

      await component.onSubmit();
      await new Promise((r) => setTimeout(r, 0));

      expect(gameUseCases.addGame).not.toHaveBeenCalled();
    });

    it('llama a addGame y navega cuando se confirma en modo creación', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(true) });
      (gameUseCases.addGame as any).mockResolvedValue(undefined);
      component.form.patchValue({ title: 'God of War', platform: 'PS5' });

      await component.onSubmit();
      await new Promise((r) => setTimeout(r, 0));

      expect(gameUseCases.addGame).toHaveBeenCalled();
    });

    it('llama a deleteItem después de addGame cuando hay pendingWishlistItemId', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const wishlistUseCases = TestBed.inject(WISHLIST_USE_CASES);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(true) });
      (gameUseCases.addGame as any).mockResolvedValue(undefined);
      (wishlistUseCases.deleteItem as any).mockResolvedValue(undefined);
      (component as any)._pendingWishlistItemId = 'wishlist-item-1';
      component.form.patchValue({ title: 'God of War', platform: 'PS5' });

      await component.onSubmit();
      await new Promise((r) => setTimeout(r, 0));

      expect(wishlistUseCases.deleteItem).toHaveBeenCalledWith('user-1', 'wishlist-item-1');
    });

    it('llama a updateGame en modo edición cuando se confirma', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(true) });
      (gameUseCases.updateGame as any).mockResolvedValue(undefined);
      component.isEditMode = true;
      (component as any)._gameUuid = 'some-uuid';
      component.form.patchValue({ title: 'God of War', platform: 'PS5' });

      await component.onSubmit();
      await new Promise((r) => setTimeout(r, 0));

      expect(gameUseCases.updateGame).toHaveBeenCalled();
    });

    it('muestra snackbar con mensaje de duplicado cuando el error contiene 23505', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const snackBar = TestBed.inject(MatSnackBar);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(true) });
      (gameUseCases.addGame as any).mockRejectedValue(new Error('unique constraint 23505'));
      component.form.patchValue({ title: 'God of War', platform: 'PS5' });

      await component.onSubmit();
      await new Promise((r) => setTimeout(r, 0));

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('muestra snackbar con mensaje genérico cuando el error no es duplicado', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const snackBar = TestBed.inject(MatSnackBar);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(true) });
      (gameUseCases.addGame as any).mockRejectedValue(new Error('Network error'));
      component.form.patchValue({ title: 'God of War', platform: 'PS5' });

      await component.onSubmit();
      await new Promise((r) => setTimeout(r, 0));

      expect(snackBar.open).toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    it('no abre el diálogo cuando no hay _gameUuid', async () => {
      const dialog = TestBed.inject(MatDialog);
      await component.onDelete();
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('llama a deleteGame y navega cuando se confirma', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(true) });
      (gameUseCases.deleteGame as any).mockResolvedValue(undefined);
      (component as any)._gameUuid = 'game-uuid';

      await component.onDelete();
      await new Promise((r) => setTimeout(r, 0));

      expect(gameUseCases.deleteGame).toHaveBeenCalledWith('user-1', 'game-uuid');
    });

    it('no llama a deleteGame cuando el diálogo no se confirma', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(false) });
      (component as any)._gameUuid = 'game-uuid';

      await component.onDelete();
      await new Promise((r) => setTimeout(r, 0));

      expect(gameUseCases.deleteGame).not.toHaveBeenCalled();
    });
  });

  describe('openCoverPositionDialog', () => {
    it('no abre el diálogo cuando no hay imageUrl', async () => {
      const dialog = TestBed.inject(MatDialog);
      component.selectedImageUrl.set(null);

      await component.openCoverPositionDialog();

      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('actualiza _coverPosition cuando el diálogo devuelve un valor', async () => {
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of('50% 30% 1.2') });
      component.selectedImageUrl.set('https://cdn.example.com/cover.jpg');

      await component.openCoverPositionDialog();

      expect((component as any)._coverPosition()).toBe('50% 30% 1.2');
    });

    it('no actualiza _coverPosition cuando el diálogo devuelve null', async () => {
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(null) });
      component.selectedImageUrl.set('https://cdn.example.com/cover.jpg');
      (component as any)._coverPosition.set('50% 50%');

      await component.openCoverPositionDialog();

      expect((component as any)._coverPosition()).toBe('50% 50%');
    });
  });

  describe('filteredPlatforms', () => {
    it('devuelve plataformas estáticas filtradas cuando gamePlatforms está vacío', () => {
      component.form.controls.platform.setValue(null);
      const result = component.filteredPlatforms();
      expect(result.length).toBeGreaterThan(0);
    });

    it('filtra plataformas estáticas por el input cuando gamePlatforms está vacío', () => {
      component.form.controls.platform.setValue('PS5');
      const result = component.filteredPlatforms();
      expect(
        result.every((p) => p.code.toLowerCase().includes('ps5') || p.labelKey.toLowerCase().includes('ps5'))
      ).toBe(true);
    });

    it('devuelve plataformas dinámicas cuando gamePlatforms tiene elementos', () => {
      component.gamePlatforms.set([
        { name: 'PlayStation 5', code: 'PS5' },
        { name: 'Xbox Series X', code: 'XBOX-SERIES' }
      ]);
      component.form.controls.platform.setValue(null);
      const result = component.filteredPlatforms();
      expect(result.length).toBe(2);
    });

    it('filtra plataformas dinámicas por input cuando gamePlatforms tiene elementos', () => {
      component.gamePlatforms.set([
        { name: 'PlayStation 5', code: 'PS5' },
        { name: 'Xbox Series X', code: 'XBOX-SERIES' }
      ]);
      component.form.controls.platform.setValue('XBOX' as any);
      const result = component.filteredPlatforms();
      expect(result.every((p) => p.code !== 'PS5')).toBe(true);
    });

    it('usa plataforma existente de platforms cuando el código coincide', () => {
      component.gamePlatforms.set([{ name: 'PS5 Custom', code: 'PS5' }]);
      component.form.controls.platform.setValue(null);
      const result = component.filteredPlatforms();
      const ps5 = result.find((p) => p.code === 'PS5');
      expect(ps5).toBeDefined();
    });
  });
});

describe('GameFormComponent — ngOnInit', () => {
  let component: GameFormComponent;
  let fixture: any;
  let gameUseCasesMock: any;

  const editGame = {
    id: 1,
    uuid: 'game-uuid',
    title: 'God of War',
    price: 59.99,
    store: null,
    platform: 'PS5' as any,
    condition: 'new' as any,
    platinum: false,
    description: '',
    status: 'playing' as any,
    personalRating: 9,
    edition: null,
    format: 'physical' as any,
    isFavorite: true,
    imageUrl: 'https://cdn.example.com/gow.jpg',
    rawgId: 58175,
    rawgSlug: 'god-of-war',
    rawgRating: 4.42,
    releasedDate: '2018-04-20',
    genres: ['Action'],
    gameCatalogId: 'cat-1',
    coverPosition: null
  };

  function setup(idParam: string | null, gameResolved: any = undefined) {
    gameUseCasesMock = {
      getAllGamesForList: vi.fn(),
      getGameForEdit: vi.fn().mockResolvedValue(gameResolved),
      addGame: vi.fn(),
      updateGame: vi.fn(),
      deleteGame: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [GameFormComponent],
      providers: [
        provideAnimationsAsync('noop'),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue(idParam) } } }
        },
        { provide: GAME_USE_CASES, useValue: gameUseCasesMock },
        { provide: STORE_USE_CASES, useValue: { getAllStores: vi.fn().mockResolvedValue([]) } },
        { provide: WISHLIST_USE_CASES, useValue: { deleteItem: vi.fn() } },
        {
          provide: CATALOG_USE_CASES,
          useValue: {
            getScreenshots: vi.fn().mockResolvedValue([]),
            searchBanners: vi.fn(),
            getTopBanners: vi.fn(),
            getAllGameScreenshots: vi.fn().mockResolvedValue(['ss1.jpg'])
          }
        },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: UserPreferencesService, useValue: { allGames: signal([]) } },
        {
          provide: TranslocoService,
          useValue: { translate: vi.fn((k: string) => k), getActiveLang: vi.fn().mockReturnValue('es') }
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(GameFormComponent);
    component = fixture.componentInstance;
  }

  it('modo creación — no entra en edit mode', async () => {
    setup(null);
    await component.ngOnInit();

    expect(component.isEditMode).toBe(false);
    expect(component.loading()).toBe(false);
  });

  it('modo creación con pendingCatalogEntry — llama a selectGameFromSearch', async () => {
    setup(null);
    (component as any)._pendingCatalogEntry = {
      rawg_id: null,
      title: 'Zelda',
      slug: 'zelda',
      image_url: null,
      released_date: null,
      rating: 4,
      platforms: [],
      genres: [],
      source: 'rawg',
      esrb_rating: null,
      metacritic_score: null,
      screenshots: []
    };
    await component.ngOnInit();

    expect(component.selectedGame()?.title).toBe('Zelda');
  });

  it('modo edición — establece isEditMode y carga el juego', async () => {
    setup('game-uuid', editGame);
    await component.ngOnInit();

    expect(component.isEditMode).toBe(true);
    expect(component.form.value.title).toBe('God of War');
    expect(component.loading()).toBe(false);
  });

  it('modo edición — establece selectedGame e imageUrl cuando hay imageUrl', async () => {
    setup('game-uuid', editGame);
    await component.ngOnInit();

    expect(component.selectedGame()?.title).toBe('God of War');
    expect(component.selectedImageUrl()).toBe('https://cdn.example.com/gow.jpg');
  });

  it('modo edición — sin game (undefined), no rellena el formulario', async () => {
    setup('game-uuid', undefined);
    await component.ngOnInit();

    expect(component.isEditMode).toBe(true);
    expect(component.form.value.title).toBe('');
    expect(component.loading()).toBe(false);
  });

  it('modo edición — juego sin imageUrl no establece selectedGame', async () => {
    setup('game-uuid', { ...editGame, imageUrl: null, rawgId: null });
    await component.ngOnInit();

    expect(component.selectedGame()).toBeNull();
    expect(component.selectedImageUrl()).toBeNull();
  });

  it('hasChanges devuelve false en modo edición cuando el formulario no ha cambiado', async () => {
    setup('game-uuid', editGame);
    await component.ngOnInit();

    expect(component.hasChanges()).toBe(false);
  });
});

describe('GameFormComponent — constructor nav state', () => {
  function setupWithNavState(state: object) {
    TestBed.configureTestingModule({
      imports: [GameFormComponent],
      providers: [
        provideAnimationsAsync('noop'),
        {
          provide: Router,
          useValue: {
            getCurrentNavigation: vi.fn().mockReturnValue({ extras: { state } }),
            events: NEVER
          }
        },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } } },
        {
          provide: GAME_USE_CASES,
          useValue: {
            getAllGamesForList: vi.fn(),
            getGameForEdit: vi.fn(),
            addGame: vi.fn(),
            updateGame: vi.fn(),
            deleteGame: vi.fn()
          }
        },
        { provide: STORE_USE_CASES, useValue: { getAllStores: vi.fn().mockResolvedValue([]) } },
        { provide: WISHLIST_USE_CASES, useValue: { deleteItem: vi.fn() } },
        {
          provide: CATALOG_USE_CASES,
          useValue: {
            getScreenshots: vi.fn().mockResolvedValue([]),
            searchBanners: vi.fn(),
            getTopBanners: vi.fn(),
            getAllGameScreenshots: vi.fn().mockResolvedValue([])
          }
        },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: UserPreferencesService, useValue: { allGames: signal([]) } },
        {
          provide: TranslocoService,
          useValue: { translate: vi.fn((k: string) => k), getActiveLang: vi.fn().mockReturnValue('es') }
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    const fixture = TestBed.createComponent(GameFormComponent);
    return fixture.componentInstance;
  }

  it('establece _pendingWishlistItemId desde el navigation state', () => {
    vi.clearAllMocks();
    const component = setupWithNavState({ wishlistItemId: 'wl-item-1' });
    expect((component as any)._pendingWishlistItemId).toBe('wl-item-1');
  });

  it('establece _pendingCatalogEntry desde el navigation state', () => {
    vi.clearAllMocks();
    const catalogEntry = {
      rawg_id: 42,
      title: 'Zelda',
      slug: 'zelda',
      image_url: null,
      released_date: null,
      rating: 4.8,
      platforms: [],
      genres: [],
      source: 'rawg' as const,
      esrb_rating: null,
      metacritic_score: null,
      screenshots: []
    };
    const component = setupWithNavState({ catalogEntry });
    expect((component as any)._pendingCatalogEntry).toEqual(catalogEntry);
  });
});

describe('GameFormComponent — constructor effect stores', () => {
  it('reasigna el valor del store cuando stores carga con un store ya seleccionado', () => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [GameFormComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync('noop'),
        {
          provide: GAME_USE_CASES,
          useValue: {
            getAllGamesForList: vi.fn(),
            getGameForEdit: vi.fn(),
            addGame: vi.fn(),
            updateGame: vi.fn(),
            deleteGame: vi.fn()
          }
        },
        { provide: STORE_USE_CASES, useValue: { getAllStores: vi.fn().mockResolvedValue([]) } },
        { provide: WISHLIST_USE_CASES, useValue: { deleteItem: vi.fn() } },
        {
          provide: CATALOG_USE_CASES,
          useValue: {
            getScreenshots: vi.fn().mockResolvedValue([]),
            searchBanners: vi.fn(),
            getTopBanners: vi.fn(),
            getAllGameScreenshots: vi.fn().mockResolvedValue([])
          }
        },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: UserPreferencesService, useValue: { allGames: signal([]) } },
        {
          provide: TranslocoService,
          useValue: { translate: vi.fn((k: string) => k), getActiveLang: vi.fn().mockReturnValue('es') }
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(GameFormComponent, { set: { imports: [], template: '' } });

    const fixture = TestBed.createComponent(GameFormComponent);
    const component = fixture.componentInstance;

    component.form.controls.store.setValue('store-uuid', { emitEvent: false });
    (component as any)._storeModels.set([{ id: 'store-uuid', label: 'GameStop', formatHint: null }]);
    TestBed.flushEffects();

    expect(component.form.controls.store.value).toBe('store-uuid');
  });
});
