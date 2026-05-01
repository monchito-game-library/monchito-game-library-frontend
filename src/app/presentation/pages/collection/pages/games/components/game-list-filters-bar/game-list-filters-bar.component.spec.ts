import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { GameListFiltersBarComponent } from './game-list-filters-bar.component';
import { GameListFiltersSheetData } from '@/interfaces/game-list-filters-sheet.interface';

describe('GameListFiltersBarComponent', () => {
  let component: GameListFiltersBarComponent;
  let fixture: ComponentFixture<GameListFiltersBarComponent>;
  let mockData: GameListFiltersSheetData;
  let clearAllFiltersSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    clearAllFiltersSpy = vi.fn();
    mockData = {
      selectedConsole: signal(''),
      selectedStore: signal(''),
      selectedStatus: signal(''),
      selectedFormat: signal(''),
      onlyFavorites: signal(false),
      onlyLoaned: signal(false),
      sortBy: signal('title'),
      sortDirection: signal('asc'),
      stores: signal([]),
      clearAllFilters: clearAllFiltersSpy
    } as unknown as GameListFiltersSheetData;

    TestBed.configureTestingModule({
      imports: [GameListFiltersBarComponent]
    });
    TestBed.overrideComponent(GameListFiltersBarComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(GameListFiltersBarComponent);
    fixture.componentRef.setInput('data', mockData);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('expone las plataformas disponibles', () => {
    expect(component.consoles.length).toBeGreaterThan(0);
  });

  it('expone los estados disponibles', () => {
    expect(component.gameStatuses.length).toBeGreaterThan(0);
  });

  describe('activeChips', () => {
    it('está vacío cuando no hay filtros activos', () => {
      expect(component.activeChips()).toEqual([]);
    });

    it('genera un chip cuando hay plataforma seleccionada', () => {
      const platform: WritableSignal<string> = mockData.selectedConsole as unknown as WritableSignal<string>;
      platform.set(component.consoles[0].code);
      const chips = component.activeChips();
      expect(chips.length).toBe(1);
      expect(chips[0].key).toContain('platform-');
      expect(chips[0].labelKey).toBe(component.consoles[0].labelKey);
    });

    it('genera un chip cuando hay tienda seleccionada', () => {
      mockData.stores.set([{ id: 'store-1', label: 'GAME', formatHint: null }]);
      mockData.selectedStore.set('store-1');
      const chips = component.activeChips();
      expect(chips.length).toBe(1);
      expect(chips[0].label).toBe('GAME');
    });

    it('genera un chip para formato físico', () => {
      const fmt: WritableSignal<string> = mockData.selectedFormat as unknown as WritableSignal<string>;
      fmt.set('physical');
      const chips = component.activeChips();
      expect(chips.length).toBe(1);
      expect(chips[0].labelKey).toBe('gameList.filters.physical');
      expect(chips[0].icon).toBe('album');
    });

    it('genera un chip para formato digital', () => {
      const fmt: WritableSignal<string> = mockData.selectedFormat as unknown as WritableSignal<string>;
      fmt.set('digital');
      const chips = component.activeChips();
      expect(chips[0].icon).toBe('cloud');
    });

    it('genera un chip cuando hay estado seleccionado', () => {
      mockData.selectedStatus.set(component.gameStatuses[0].code);
      const chips = component.activeChips();
      expect(chips.length).toBe(1);
      expect(chips[0].labelKey).toBe(component.gameStatuses[0].labelKey);
    });

    it('genera un chip para favoritos', () => {
      mockData.onlyFavorites.set(true);
      const chips = component.activeChips();
      expect(chips.some((c) => c.key === 'favorites')).toBe(true);
    });

    it('genera un chip para prestados', () => {
      mockData.onlyLoaned.set(true);
      const chips = component.activeChips();
      expect(chips.some((c) => c.key === 'loaned')).toBe(true);
    });

    it('cada chip removable resetea su filtro', () => {
      mockData.onlyFavorites.set(true);
      const chip = component.activeChips().find((c) => c.key === 'favorites');
      chip?.onRemove();
      expect(mockData.onlyFavorites()).toBe(false);
    });

    it('onRemove del chip de plataforma resetea selectedConsole', () => {
      const platform: WritableSignal<string> = mockData.selectedConsole as unknown as WritableSignal<string>;
      platform.set(component.consoles[0].code);
      const chip = component.activeChips().find((c) => c.key.startsWith('platform-'));
      chip?.onRemove();
      expect(mockData.selectedConsole()).toBe('');
    });

    it('onRemove del chip de tienda resetea selectedStore', () => {
      mockData.stores.set([{ id: 'store-1', label: 'GAME', formatHint: null }]);
      mockData.selectedStore.set('store-1');
      const chip = component.activeChips().find((c) => c.key.startsWith('store-'));
      chip?.onRemove();
      expect(mockData.selectedStore()).toBe('');
    });

    it('onRemove del chip de formato resetea selectedFormat', () => {
      const fmt: WritableSignal<string> = mockData.selectedFormat as unknown as WritableSignal<string>;
      fmt.set('physical');
      const chip = component.activeChips().find((c) => c.key.startsWith('format-'));
      chip?.onRemove();
      expect(mockData.selectedFormat()).toBe('');
    });

    it('onRemove del chip de estado resetea selectedStatus', () => {
      mockData.selectedStatus.set(component.gameStatuses[0].code);
      const chip = component.activeChips().find((c) => c.key.startsWith('status-'));
      chip?.onRemove();
      expect(mockData.selectedStatus()).toBe('');
    });

    it('onRemove del chip de prestados resetea onlyLoaned', () => {
      mockData.onlyLoaned.set(true);
      const chip = component.activeChips().find((c) => c.key === 'loaned');
      chip?.onRemove();
      expect(mockData.onlyLoaned()).toBe(false);
    });
  });
});
