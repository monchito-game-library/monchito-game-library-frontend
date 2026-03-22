import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { describe, beforeEach, expect, it, vi } from 'vitest';

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
          useValue: { getScreenshots: vi.fn().mockResolvedValue([]), searchBanners: vi.fn(), getTopBanners: vi.fn() }
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
});
