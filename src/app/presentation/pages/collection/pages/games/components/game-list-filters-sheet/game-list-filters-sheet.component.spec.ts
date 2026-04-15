import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { GameListFiltersSheetComponent } from './game-list-filters-sheet.component';

describe('GameListFiltersSheetComponent', () => {
  let component: GameListFiltersSheetComponent;
  let fixture: ComponentFixture<GameListFiltersSheetComponent>;
  let mockSheetRef: { dismiss: ReturnType<typeof vi.fn> };

  let mockData: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSheetRef = { dismiss: vi.fn() };
    mockData = {
      selectedConsole: signal(''),
      selectedStore: signal(''),
      selectedStatus: signal(''),
      selectedFormat: signal(''),
      onlyFavorites: signal(false),
      sortBy: signal('title'),
      sortDirection: signal('asc'),
      stores: signal([]),
      clearAllFilters: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [GameListFiltersSheetComponent],
      providers: [
        { provide: MatBottomSheetRef, useValue: mockSheetRef },
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: mockData }
      ]
    });
    TestBed.overrideComponent(GameListFiltersSheetComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(GameListFiltersSheetComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());
  it('consoles tiene plataformas disponibles', () => expect(component.consoles.length).toBeGreaterThan(0));
  it('gameStatuses tiene estados disponibles', () => expect(component.gameStatuses.length).toBeGreaterThan(0));

  describe('close', () => {
    it('cierra el bottom sheet', () => {
      component.close();
      expect(mockSheetRef.dismiss).toHaveBeenCalledOnce();
    });
  });

  describe('onClearAll', () => {
    it('llama a clearAllFilters del data', () => {
      component.onClearAll();
      expect(mockData.clearAllFilters).toHaveBeenCalledOnce();
    });

    it('cierra el bottom sheet', () => {
      component.onClearAll();
      expect(mockSheetRef.dismiss).toHaveBeenCalledOnce();
    });
  });
});
