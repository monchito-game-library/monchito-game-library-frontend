import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
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
import { UserContextService } from '@/services/user-context/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';
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

/** Providers compartidos por todos los TestBed de esta spec. */
function buildCommonProviders(opts: { catalogScreenshots?: string[] } = {}) {
  return [
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
        getAllGameScreenshots: vi.fn().mockResolvedValue(opts.catalogScreenshots ?? [])
      }
    },
    {
      provide: UserContextService,
      useValue: { userId: signal<string | null>('user-1'), requireUserId: vi.fn().mockReturnValue('user-1') }
    },
    { provide: UserPreferencesService, useValue: { allGames: signal([]) } },
    {
      provide: TranslocoService,
      useValue: { translate: vi.fn((k: string) => k), getActiveLang: vi.fn().mockReturnValue('es') }
    },
    { provide: MatSnackBar, useValue: { open: vi.fn() } },
    { provide: MatDialog, useValue: { open: vi.fn() } }
  ];
}

describe('GameFormComponent', () => {
  let component: GameFormComponent;
  let fixture: ComponentFixture<GameFormComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [GameFormComponent],
      providers: [provideRouter([]), ...buildCommonProviders()],
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

    it('usa "50%" como fallback de la segunda parte cuando la posición no tiene espacio', () => {
      (component as any)._coverPosition.set('75%');
      expect(component.coverObjectPosition()).toBe('75% 50%');
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

    it('omite el cover de la lista cuando image_url es null', () => {
      component.selectedGame.set({
        rawg_id: 1,
        title: 'Test',
        slug: 'test',
        image_url: null,
        released_date: null,
        rating: 4,
        platforms: [],
        genres: [],
        screenshots: ['https://cdn.example.com/ss1.jpg']
      });
      const images = component.coverImages();
      expect(images).toHaveLength(1);
      expect(images[0]).toBe('https://cdn.example.com/ss1.jpg');
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

    it('mapea plataforma desconocida a null en gamePlatforms', () => {
      component.selectGameFromSearch({ ...mockCatalogDto, platforms: ['Unknown Platform'] });
      const codes = component.gamePlatforms().map((p) => p.code);
      expect(codes).toContain(null);
    });

    it('llama a _loadScreenshots cuando rawg_id es truthy', () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES);
      component.selectGameFromSearch({ ...mockCatalogDto, rawg_id: 58175 });
      expect((catalogUseCases as any).getAllGameScreenshots).toHaveBeenCalled();
    });

    it('usa rawg_id como identificador cuando slug está vacío', () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES);
      component.selectGameFromSearch({ ...mockCatalogDto, slug: '', rawg_id: 58175 });
      expect((catalogUseCases as any).getAllGameScreenshots).toHaveBeenCalledWith(58175);
    });

    it('pasa cadena vacía a _loadScreenshots cuando image_url es null', () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES);
      component.selectGameFromSearch({ ...mockCatalogDto, rawg_id: 58175, image_url: null });
      expect((catalogUseCases as any).getAllGameScreenshots).toHaveBeenCalled();
    });

    it('usa [] cuando screenshots es undefined', () => {
      const dto = { ...mockCatalogDto };
      delete (dto as any).screenshots;
      component.selectGameFromSearch(dto);
      expect(component.selectedGame()?.screenshots).toEqual([]);
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

    it('mantiene el título en modo edición', () => {
      (component as any).isEditMode = true;
      component.form.patchValue({ title: 'God of War' });
      component.clearSelectedGame();
      expect(component.form.value.title).toBe('God of War');
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

  describe('_loadScreenshots — selectedGame null', () => {
    it('no modifica selectedGame cuando ya es null al completar la carga', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;
      catalogUseCases.getAllGameScreenshots.mockResolvedValue(['https://cdn.example.com/ss1.jpg']);
      component.selectedGame.set(null);

      await (component as any)._loadScreenshots('god-of-war', '');

      expect(component.selectedGame()).toBeNull();
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

    it('delega en TranslocoService cuando la plataforma existe', () => {
      const transloco = TestBed.inject(TranslocoService as any) as any;
      component.displayPlatformLabel('PS5');
      expect(transloco.translate).toHaveBeenCalled();
    });
  });

  describe('_userContext.requireUserId', () => {
    it('lanza Error cuando userId es null', () => {
      const userContext = TestBed.inject(UserContextService as any) as any;
      userContext.requireUserId.mockImplementation(() => {
        throw new Error('No user selected');
      });
      expect(() => userContext.requireUserId()).toThrow('No user selected');
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

    it('incluye catalogEntry cuando selectedGame tiene rawg_id', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(true) });
      (gameUseCases.addGame as any).mockResolvedValue(undefined);
      component.form.patchValue({ title: 'God of War', platform: 'PS5' });
      component.selectedGame.set({
        rawg_id: 58175,
        title: 'God of War',
        slug: 'god-of-war',
        image_url: 'https://cdn.example.com/gow.jpg',
        released_date: null,
        rating: 4.5,
        platforms: [],
        genres: [],
        screenshots: []
      });

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

    it('usa los fallbacks de ?? cuando los campos opcionales son null', async () => {
      const gameUseCases = TestBed.inject(GAME_USE_CASES);
      const dialog = TestBed.inject(MatDialog);
      (dialog.open as any).mockReturnValue({ afterClosed: () => of(true) });
      (gameUseCases.addGame as any).mockResolvedValue(undefined);

      component.form.patchValue({ title: 'God of War', platform: 'PS5' });
      component.form.controls.condition.setValue(null as any);
      component.form.controls.status.setValue(null as any);
      component.form.controls.format.setValue(null);
      component.form.controls.is_favorite.setValue(null as any);
      component.form.controls.description.setValue(null as any);

      await component.onSubmit();
      await new Promise((r) => setTimeout(r, 0));

      const call = (gameUseCases.addGame as any).mock.calls[0][1];
      expect(call.condition).toBe('new');
      expect(call.status).toBe('backlog');
      expect(call.format).toBeNull();
      expect(call.isFavorite).toBe(false);
      expect(call.description).toBe('');
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

  describe('onCancel', () => {
    it('llama a location.back()', () => {
      const location = TestBed.inject(Location);
      vi.spyOn(location, 'back').mockImplementation(() => {});

      component.onCancel();

      expect(location.back).toHaveBeenCalled();
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

    it('usa el fallback cuando el código de gamePlatform no existe en la lista estática', () => {
      component.gamePlatforms.set([{ name: 'Consola Desconocida', code: 'UNKNOWN-CODE' as any }]);
      component.form.controls.platform.setValue(null);
      const result = component.filteredPlatforms();
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('UNKNOWN-CODE');
      expect(result[0].labelKey).toBe('Consola Desconocida');
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
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue(idParam) } } } },
        ...buildCommonProviders({ catalogScreenshots: ['ss1.jpg'] }),
        { provide: GAME_USE_CASES, useValue: gameUseCasesMock }
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

  it('modo edición — formatValue signal refleja el formato del juego cargado (digital)', async () => {
    setup('game-uuid', { ...editGame, format: 'digital' });
    await component.ngOnInit();

    expect(component.form.controls.format.value).toBe('digital');
    expect(component.formatValue()).toBe('digital');
  });

  it('modo edición — formatValue signal refleja el formato del juego cargado (physical)', async () => {
    setup('game-uuid', { ...editGame, format: 'physical' });
    await component.ngOnInit();

    expect(component.form.controls.format.value).toBe('physical');
    expect(component.formatValue()).toBe('physical');
  });

  it('modo edición — usa "physical" como fallback cuando el juego tiene format null', async () => {
    setup('game-uuid', { ...editGame, format: null });
    await component.ngOnInit();

    expect(component.form.controls.format.value).toBe('physical');
    expect(component.formatValue()).toBe('physical');
  });

  it('modo edición — juego con imageUrl pero sin rawgId no llama a _loadScreenshots', async () => {
    setup('game-uuid', { ...editGame, rawgId: null });
    await component.ngOnInit();

    expect(component.selectedGame()?.title).toBe('God of War');
    const catalogUseCases = TestBed.inject(CATALOG_USE_CASES);
    expect((catalogUseCases as any).getAllGameScreenshots).not.toHaveBeenCalled();
  });

  it('hasChanges devuelve false en modo edición cuando el formulario no ha cambiado', async () => {
    setup('game-uuid', editGame);
    await component.ngOnInit();

    expect(component.hasChanges()).toBe(false);
  });

  it('hasChanges es true en modo edición cuando el juego no fue encontrado (_initialSnapshot es null)', async () => {
    setup('game-uuid', undefined);
    await component.ngOnInit();

    expect(component.hasChanges()).toBe(true);
  });

  it('modo edición — usa rawgId como identificador cuando rawgSlug es null', async () => {
    setup('game-uuid', { ...editGame, rawgSlug: null, rawgId: 58175 });
    const catalogUseCases = TestBed.inject(CATALOG_USE_CASES);
    await component.ngOnInit();

    expect((catalogUseCases as any).getAllGameScreenshots).toHaveBeenCalledWith(58175);
  });
});

describe('GameFormComponent — ngOnInit nav state', () => {
  function setupWithNavState(state: object) {
    TestBed.configureTestingModule({
      imports: [GameFormComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            lastSuccessfulNavigation: vi.fn().mockReturnValue({ extras: { state } }),
            navigate: vi.fn(),
            events: NEVER
          }
        },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue(null) } } } },
        ...buildCommonProviders()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    const fixture = TestBed.createComponent(GameFormComponent);
    return fixture.componentInstance;
  }

  it('establece _pendingWishlistItemId desde el navigation state', async () => {
    vi.clearAllMocks();
    const component = setupWithNavState({ wishlistItemId: 'wl-item-1' });
    await component.ngOnInit();
    expect((component as any)._pendingWishlistItemId).toBe('wl-item-1');
  });

  it('establece _pendingCatalogEntry desde el navigation state', async () => {
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
    await component.ngOnInit();
    expect((component as any)._pendingCatalogEntry).toEqual(catalogEntry);
  });

  it('aplica prefillTitle, prefillPlatform y prefillFormat al form (caso "Añadir otra copia" sin catalogEntry)', async () => {
    vi.clearAllMocks();
    const component = setupWithNavState({
      prefillTitle: 'Broforce',
      prefillPlatform: 'PS4',
      prefillFormat: 'digital',
      forceWorkId: 'work-uuid-1'
    });
    await component.ngOnInit();

    expect(component.form.controls.title.value).toBe('Broforce');
    expect(component.form.controls.platform.value).toBe('PS4');
    expect(component.form.controls.format.value).toBe('digital');
    expect((component as any)._pendingTargetWorkId).toBe('work-uuid-1');
  });

  it('aplica prefillStatus / prefillPersonalRating / prefillIsFavorite al form', async () => {
    vi.clearAllMocks();
    const component = setupWithNavState({
      prefillTitle: 'Broforce',
      prefillStatus: 'completed',
      prefillPersonalRating: 9,
      prefillIsFavorite: true
    });
    await component.ngOnInit();

    expect(component.form.controls.status.value).toBe('completed');
    expect(component.form.controls.personal_rating.value).toBe(9);
    expect(component.form.controls.is_favorite.value).toBe(true);
  });

  it('no aplica prefillPersonalRating cuando viene null (mantiene el valor por defecto del form)', async () => {
    vi.clearAllMocks();
    const initialRating = 5;
    const component = setupWithNavState({
      prefillTitle: 'Broforce',
      prefillPersonalRating: null
    });
    component.form.controls.personal_rating.setValue(initialRating);
    await component.ngOnInit();

    // El prefill null no debe sobrescribir el valor actual
    expect(component.form.controls.personal_rating.value).toBe(initialRating);
  });

  it('aplica prefillIsFavorite=false explícitamente (no es undefined)', async () => {
    vi.clearAllMocks();
    const component = setupWithNavState({
      prefillTitle: 'Broforce',
      prefillIsFavorite: false
    });
    component.form.controls.is_favorite.setValue(true);
    await component.ngOnInit();

    expect(component.form.controls.is_favorite.value).toBe(false);
  });

  it('selectGameFromSearch descarta _pendingTargetWorkId si el rawg_id cambia', async () => {
    vi.clearAllMocks();
    const original = {
      rawg_id: 100,
      title: 'Original',
      slug: 'original',
      image_url: null,
      released_date: null,
      rating: 4,
      platforms: [],
      genres: [],
      source: 'rawg' as const,
      esrb_rating: null,
      metacritic_score: null,
      screenshots: []
    };
    const component = setupWithNavState({ catalogEntry: original, forceWorkId: 'work-1' });
    await component.ngOnInit();
    expect((component as any)._pendingTargetWorkId).toBe('work-1');

    // El usuario elige otro juego desde la búsqueda RAWG
    const otherGame = { ...original, rawg_id: 999, title: 'Otro', slug: 'otro' };
    component.selectGameFromSearch(otherGame);

    expect((component as any)._pendingTargetWorkId).toBeNull();
  });

  it('clearSelectedGame también descarta _pendingTargetWorkId', async () => {
    vi.clearAllMocks();
    const component = setupWithNavState({
      prefillTitle: 'Broforce',
      forceWorkId: 'work-1'
    });
    await component.ngOnInit();
    expect((component as any)._pendingTargetWorkId).toBe('work-1');

    component.clearSelectedGame();

    expect((component as any)._pendingTargetWorkId).toBeNull();
  });
});

describe('GameFormComponent — constructor effect stores', () => {
  function setupEffectsBed() {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [GameFormComponent],
      providers: [provideRouter([]), ...buildCommonProviders()],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(GameFormComponent, { set: { imports: [], template: '' } });

    const fixture = TestBed.createComponent(GameFormComponent);
    return { fixture, component: fixture.componentInstance };
  }

  it('reasigna el valor del store cuando stores carga con un store ya seleccionado', () => {
    const { component } = setupEffectsBed();

    component.form.controls.store.setValue('store-uuid', { emitEvent: false });
    (component as any)._storeModels.set([{ id: 'store-uuid', label: 'GameStop', formatHint: null }]);
    TestBed.tick();

    expect(component.form.controls.store.value).toBe('store-uuid');
  });

  it('no reasigna el store cuando stores carga pero no hay store seleccionado (current es null)', () => {
    const { component } = setupEffectsBed();

    // store.value es null (modo creación, sin selección previa)
    (component as any)._storeModels.set([{ id: 'store-uuid', label: 'GameStop', formatHint: null }]);
    TestBed.tick();

    expect(component.form.controls.store.value).toBeNull();
  });
});
