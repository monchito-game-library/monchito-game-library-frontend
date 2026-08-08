import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { WishlistFilterService } from './wishlist-filter.service';

describe('WishlistFilterService', () => {
  let service: WishlistFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [WishlistFilterService] });
    service = TestBed.inject(WishlistFilterService);
  });

  describe('valores iniciales', () => {
    it('searchTerm es cadena vacía', () => expect(service.searchTerm()).toBe(''));
    it('selectedPriority es cadena vacía', () => expect(service.selectedPriority()).toBe(''));
    it('selectedPlatform es cadena vacía', () => expect(service.selectedPlatform()).toBe(''));
    it('onlyWithPrice es false', () => expect(service.onlyWithPrice()).toBe(false));
    it('onlyWithNotes es false', () => expect(service.onlyWithNotes()).toBe(false));
    it('sortBy es priority', () => expect(service.sortBy()).toBe('priority'));
    it('sortDirection es asc', () => expect(service.sortDirection()).toBe('asc'));
  });

  describe('clearAllFilters', () => {
    it('resetea todos los filtros a su estado vacío', () => {
      service.searchTerm.set('God of War');
      service.selectedPriority.set('3');
      service.selectedPlatform.set('PS5');
      service.onlyWithPrice.set(true);
      service.onlyWithNotes.set(true);

      service.clearAllFilters();

      expect(service.searchTerm()).toBe('');
      expect(service.selectedPriority()).toBe('');
      expect(service.selectedPlatform()).toBe('');
      expect(service.onlyWithPrice()).toBe(false);
      expect(service.onlyWithNotes()).toBe(false);
    });

    it('no modifica sortBy ni sortDirection', () => {
      service.sortBy.set('title');
      service.sortDirection.set('desc');

      service.clearAllFilters();

      expect(service.sortBy()).toBe('title');
      expect(service.sortDirection()).toBe('desc');
    });
  });

  describe('activeFilterCount', () => {
    it('devuelve 0 cuando no hay filtros activos', () => {
      expect(service.activeFilterCount()).toBe(0);
    });

    it('cuenta searchTerm cuando tiene valor', () => {
      service.searchTerm.set('zelda');
      expect(service.activeFilterCount()).toBe(1);
    });

    it('cuenta selectedPriority cuando tiene valor', () => {
      service.selectedPriority.set('3');
      expect(service.activeFilterCount()).toBe(1);
    });

    it('cuenta selectedPlatform cuando tiene valor', () => {
      service.selectedPlatform.set('PS5');
      expect(service.activeFilterCount()).toBe(1);
    });

    it('cuenta onlyWithPrice cuando está activo', () => {
      service.onlyWithPrice.set(true);
      expect(service.activeFilterCount()).toBe(1);
    });

    it('cuenta onlyWithNotes cuando está activo', () => {
      service.onlyWithNotes.set(true);
      expect(service.activeFilterCount()).toBe(1);
    });

    it('suma múltiples filtros activos', () => {
      service.searchTerm.set('zelda');
      service.selectedPriority.set('3');
      service.selectedPlatform.set('PS5');
      service.onlyWithPrice.set(true);
      service.onlyWithNotes.set(true);
      expect(service.activeFilterCount()).toBe(5);
    });

    it('ignora sortBy y sortDirection', () => {
      service.sortBy.set('title');
      service.sortDirection.set('desc');
      expect(service.activeFilterCount()).toBe(0);
    });

    it('vuelve a 0 tras clearAllFilters', () => {
      service.searchTerm.set('zelda');
      service.onlyWithPrice.set(true);
      service.activeFilterCount();
      service.clearAllFilters();
      expect(service.activeFilterCount()).toBe(0);
    });
  });
});
