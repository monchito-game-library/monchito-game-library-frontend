import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { UserPreferencesService } from './user-preferences.service';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPreferencesService);
  });

  describe('valores iniciales', () => {
    it('avatarUrl es null', () => expect(service.avatarUrl()).toBeNull());
    it('uploadingAvatar es false', () => expect(service.uploadingAvatar()).toBe(false));
    it('uploadingBanner es false', () => expect(service.uploadingBanner()).toBe(false));
    it('bannerImageUrl es null', () => expect(service.bannerImageUrl()).toBeNull());
    it('preferencesLoaded es false', () => expect(service.preferencesLoaded()).toBe(false));
    it('allGames es []', () => expect(service.allGames()).toEqual([]));
    it('role es "user"', () => expect(service.role()).toBe('user'));
  });

  describe('isAdmin (computed)', () => {
    it('es false cuando role es "user"', () => {
      expect(service.isAdmin()).toBe(false);
    });

    it('es true cuando role se cambia a "admin"', () => {
      service.role.set('admin');
      expect(service.isAdmin()).toBe(true);
    });

    it('vuelve a false al cambiar role de "admin" a "user"', () => {
      service.role.set('admin');
      service.role.set('user');
      expect(service.isAdmin()).toBe(false);
    });
  });

  it('los signals WritableSignal se actualizan con set()', () => {
    service.avatarUrl.set('https://cdn.example.com/av.jpg');
    service.uploadingAvatar.set(true);
    service.preferencesLoaded.set(true);

    expect(service.avatarUrl()).toBe('https://cdn.example.com/av.jpg');
    expect(service.uploadingAvatar()).toBe(true);
    expect(service.preferencesLoaded()).toBe(true);
  });
});
