import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { GamesFilterService } from './games-filter.service';

describe('GamesFilterService', () => {
  let service: GamesFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GamesFilterService] });
    service = TestBed.inject(GamesFilterService);
  });

  describe('valores iniciales', () => {
    it('searchTerm es cadena vacía', () => expect(service.searchTerm()).toBe(''));
    it('selectedConsole es cadena vacía', () => expect(service.selectedConsole()).toBe(''));
    it('selectedStore es cadena vacía', () => expect(service.selectedStore()).toBe(''));
    it('selectedStatus es cadena vacía', () => expect(service.selectedStatus()).toBe(''));
    it('selectedFormat es cadena vacía', () => expect(service.selectedFormat()).toBe(''));
    it('onlyFavorites es false', () => expect(service.onlyFavorites()).toBe(false));
    it('onlyLoaned es false', () => expect(service.onlyLoaned()).toBe(false));
    it('sortBy es title', () => expect(service.sortBy()).toBe('title'));
    it('sortDirection es asc', () => expect(service.sortDirection()).toBe('asc'));
  });

  describe('clearAllFilters', () => {
    it('resetea todos los filtros a su estado vacío', () => {
      service.searchTerm.set('God of War');
      service.selectedConsole.set('PS5');
      service.selectedStore.set('store-uuid');
      service.selectedStatus.set('playing');
      service.selectedFormat.set('digital');
      service.onlyFavorites.set(true);
      service.onlyLoaned.set(true);

      service.clearAllFilters();

      expect(service.searchTerm()).toBe('');
      expect(service.selectedConsole()).toBe('');
      expect(service.selectedStore()).toBe('');
      expect(service.selectedStatus()).toBe('');
      expect(service.selectedFormat()).toBe('');
      expect(service.onlyFavorites()).toBe(false);
      expect(service.onlyLoaned()).toBe(false);
    });

    it('no modifica sortBy ni sortDirection', () => {
      service.sortBy.set('price');
      service.sortDirection.set('desc');

      service.clearAllFilters();

      expect(service.sortBy()).toBe('price');
      expect(service.sortDirection()).toBe('desc');
    });
  });
});
