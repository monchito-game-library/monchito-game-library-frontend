import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { RawgSearchStateService } from './rawg-search-state.service';

describe('RawgSearchStateService', () => {
  let service: RawgSearchStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RawgSearchStateService);
  });

  describe('valores iniciales', () => {
    it('rawgSearchResults es []', () => expect(service.rawgSearchResults()).toEqual([]));
    it('rawgSearchLoading es false', () => expect(service.rawgSearchLoading()).toBe(false));
    it('rawgSearchQuery es ""', () => expect(service.rawgSearchQuery()).toBe(''));
  });

  describe('signals WritableSignal', () => {
    it('rawgSearchResults se actualiza con set()', () => {
      service.rawgSearchResults.set([{ title: 'God of War', imageUrl: 'https://img.example.com/gow.jpg' }]);
      expect(service.rawgSearchResults()).toHaveLength(1);
    });

    it('rawgSearchLoading se actualiza con set()', () => {
      service.rawgSearchLoading.set(true);
      expect(service.rawgSearchLoading()).toBe(true);
    });

    it('rawgSearchQuery se actualiza con set()', () => {
      service.rawgSearchQuery.set('zelda');
      expect(service.rawgSearchQuery()).toBe('zelda');
    });
  });
});
