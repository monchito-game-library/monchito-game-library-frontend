import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { CatalogSearchPanelComponent } from './catalog-search-panel.component';
import { CATALOG_USE_CASES } from '@/domain/use-cases/catalog/catalog.use-cases.contract';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';

const mockGame: GameCatalogDto = {
  rawg_id: 1,
  title: 'God of War',
  slug: 'god-of-war',
  image_url: null,
  released_date: null,
  rating: 4.5,
  platforms: [],
  genres: [],
  source: 'rawg',
  esrb_rating: null,
  metacritic_score: null
};

describe('CatalogSearchPanelComponent', () => {
  let component: CatalogSearchPanelComponent;
  let fixture: ComponentFixture<CatalogSearchPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [CatalogSearchPanelComponent],
      providers: [{ provide: CATALOG_USE_CASES, useValue: { searchGames: vi.fn().mockResolvedValue([]) } }],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(CatalogSearchPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(CatalogSearchPanelComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('searchLoading es false', () => expect(component.searchLoading()).toBe(false));
    it('searchResults es []', () => expect(component.searchResults()).toEqual([]));
    it('searchQuery es ""', () => expect(component.searchQuery()).toBe(''));
  });

  describe('onSearchInput', () => {
    it('actualiza searchQuery con el valor del input (trim)', () => {
      const event = { target: { value: '  god of war  ' } } as unknown as Event;
      component.onSearchInput(event);
      expect(component.searchQuery()).toBe('god of war');
    });
  });

  describe('onSelectGame', () => {
    it('emite el juego seleccionado por gameSelected', () => {
      const spy = vi.spyOn(component.gameSelected, 'emit');
      component.onSelectGame(mockGame);
      expect(spy).toHaveBeenCalledWith(mockGame);
    });
  });

  describe('ngOnInit con initialQuery', () => {
    it('ejecuta _performSearch si initialQuery no está vacío', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;
      catalogUseCases.searchGames.mockResolvedValue([mockGame]);

      fixture.componentRef.setInput('initialQuery', 'god of war');
      await component.ngOnInit();

      expect(catalogUseCases.searchGames).toHaveBeenCalledWith('god of war', 1, 20);
      expect(component.searchResults()).toEqual([mockGame]);
      expect(component.searchLoading()).toBe(false);
    });

    it('no ejecuta _performSearch si initialQuery está vacío', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;

      fixture.componentRef.setInput('initialQuery', '   ');
      await component.ngOnInit();

      expect(catalogUseCases.searchGames).not.toHaveBeenCalled();
    });
  });

  describe('_performSearch (vía ngOnInit)', () => {
    it('pone searchResults a [] si la búsqueda falla', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;
      catalogUseCases.searchGames.mockRejectedValue(new Error('fail'));

      fixture.componentRef.setInput('initialQuery', 'zelda');
      await component.ngOnInit();

      expect(component.searchResults()).toEqual([]);
      expect(component.searchLoading()).toBe(false);
    });

    it('pone searchResults a [] si la consulta es vacía', async () => {
      component.searchResults.set([mockGame]);
      await (component as any)._performSearch('');
      expect(component.searchResults()).toEqual([]);
    });
  });

  describe('debounce subscription — _searchSubject', () => {
    it('ejecuta _performSearch tras el debounce al emitir _searchSubject', () => {
      vi.useFakeTimers();
      try {
        const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;

        (component as any)._searchSubject.next('zelda');
        vi.advanceTimersByTime(500);

        expect(catalogUseCases.searchGames).toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
