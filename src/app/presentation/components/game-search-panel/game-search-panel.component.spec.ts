import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { GameSearchPanelComponent } from './game-search-panel.component';
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

describe('GameSearchPanelComponent', () => {
  let component: GameSearchPanelComponent;
  let fixture: ComponentFixture<GameSearchPanelComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [GameSearchPanelComponent],
      providers: [{ provide: CATALOG_USE_CASES, useValue: { searchGames: vi.fn().mockResolvedValue([]) } }],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(GameSearchPanelComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(GameSearchPanelComponent);
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
});
