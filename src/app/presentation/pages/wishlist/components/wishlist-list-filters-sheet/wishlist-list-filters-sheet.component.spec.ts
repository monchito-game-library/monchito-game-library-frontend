import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RETRO_BOTTOM_SHEET_DATA } from '@retro/retro-bottom-sheet/services/retro-bottom-sheet.service';
import { RETRO_OVERLAY_REF } from '@retro/retro-overlay/services/retro-overlay.service';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { WishlistListFiltersSheetComponent } from './wishlist-list-filters-sheet.component';
import { WishlistListFiltersSheetData } from '@/interfaces/wishlist-list-filters-sheet.interface';

function mockData(): WishlistListFiltersSheetData {
  return {
    searchTerm: signal(''),
    selectedPriority: signal(''),
    selectedPlatform: signal(''),
    onlyWithPrice: signal(false),
    onlyWithNotes: signal(false),
    sortBy: signal('priority'),
    sortDirection: signal('asc'),
    clearAllFilters: vi.fn(),
    availablePlatforms: (): string[] => []
  };
}

describe('WishlistListFiltersSheetComponent — modo bottom-sheet', () => {
  let component: WishlistListFiltersSheetComponent;
  let fixture: ComponentFixture<WishlistListFiltersSheetComponent>;
  let mockSheetRef: { close: ReturnType<typeof vi.fn> };
  let data: WishlistListFiltersSheetData;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSheetRef = { close: vi.fn() };
    data = mockData();

    TestBed.configureTestingModule({
      imports: [WishlistListFiltersSheetComponent],
      providers: [
        { provide: RETRO_OVERLAY_REF, useValue: mockSheetRef },
        { provide: RETRO_BOTTOM_SHEET_DATA, useValue: data }
      ]
    });
    TestBed.overrideComponent(WishlistListFiltersSheetComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(WishlistListFiltersSheetComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('priorities contiene "" y "1".."5"', () => {
    expect(component.priorities).toEqual(['', '1', '2', '3', '4', '5']);
  });

  it('data resuelve al sheetData inyectado', () => {
    expect(component.data()).toBe(data);
  });

  describe('close', () => {
    it('cierra el bottom sheet cuando hay sheetRef', () => {
      component.close();
      expect(mockSheetRef.close).toHaveBeenCalledOnce();
    });
  });

  describe('onClearAll', () => {
    it('llama a clearAllFilters del data', () => {
      component.onClearAll();
      expect(data.clearAllFilters).toHaveBeenCalledOnce();
    });

    it('cierra el bottom sheet tras limpiar', () => {
      component.onClearAll();
      expect(mockSheetRef.close).toHaveBeenCalledOnce();
    });
  });
});

describe('WishlistListFiltersSheetComponent — modo embebido (drawer)', () => {
  let component: WishlistListFiltersSheetComponent;
  let fixture: ComponentFixture<WishlistListFiltersSheetComponent>;
  let inputData: WishlistListFiltersSheetData;

  beforeEach(() => {
    vi.clearAllMocks();
    inputData = mockData();

    TestBed.configureTestingModule({
      imports: [WishlistListFiltersSheetComponent]
    });
    TestBed.overrideComponent(WishlistListFiltersSheetComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(WishlistListFiltersSheetComponent);
    fixture.componentRef.setInput('dataInput', inputData);
    component = fixture.componentInstance;
  });

  it('data resuelve al dataInput cuando no hay sheetData', () => {
    expect(component.data()).toBe(inputData);
  });

  it('close emite el evento closed cuando no hay sheetRef', () => {
    const emitSpy = vi.fn();
    component.closed.subscribe(emitSpy);
    component.close();
    expect(emitSpy).toHaveBeenCalledOnce();
  });

  it('onClearAll usa el dataInput y emite closed', () => {
    const emitSpy = vi.fn();
    component.closed.subscribe(emitSpy);
    component.onClearAll();
    expect(inputData.clearAllFilters).toHaveBeenCalledOnce();
    expect(emitSpy).toHaveBeenCalledOnce();
  });
});
