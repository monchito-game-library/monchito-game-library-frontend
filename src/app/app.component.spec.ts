import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AppComponent } from './app.component';
import { UserContextService } from '@/services/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import { USER_PREFERENCES_USE_CASES } from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { ThemeService } from '@/services/theme.service';
import { PwaUpdateService } from '@/services/pwa-update.service';
import { TranslocoService } from '@jsverse/transloco';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockUserContext: {
    userId: ReturnType<typeof signal<string | null>>;
    isUserSelected: ReturnType<typeof vi.fn>;
    getDisplayName: ReturnType<typeof vi.fn>;
    getUserEmail: ReturnType<typeof vi.fn>;
    getAvatarUrl: ReturnType<typeof vi.fn>;
    clearUser: ReturnType<typeof vi.fn>;
  };
  let mockUserPrefsState: {
    avatarUrl: ReturnType<typeof signal<string | null>>;
    bannerImageUrl: ReturnType<typeof signal<string | null>>;
    preferencesLoaded: ReturnType<typeof signal<boolean>>;
    isAdmin: ReturnType<typeof signal<boolean>>;
    role: ReturnType<typeof signal<string | null>>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserContext = {
      userId: signal<string | null>(null),
      isUserSelected: vi.fn().mockReturnValue(false),
      getDisplayName: vi.fn().mockReturnValue('Test User'),
      getUserEmail: vi.fn().mockReturnValue('test@example.com'),
      getAvatarUrl: vi.fn().mockReturnValue('https://fallback.example.com/avatar.jpg'),
      clearUser: vi.fn()
    };

    mockUserPrefsState = {
      avatarUrl: signal<string | null>(null),
      bannerImageUrl: signal<string | null>(null),
      preferencesLoaded: signal(false),
      isAdmin: signal(false),
      role: signal(null)
    };

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: UserContextService, useValue: mockUserContext },
        { provide: UserPreferencesService, useValue: mockUserPrefsState },
        { provide: USER_PREFERENCES_USE_CASES, useValue: { loadPreferences: vi.fn().mockResolvedValue(null) } },
        { provide: ThemeService, useValue: { initTheme: vi.fn(), setDarkTheme: vi.fn(), setLightTheme: vi.fn() } },
        { provide: PwaUpdateService, useValue: { init: vi.fn() } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k), setActiveLang: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(AppComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  describe('isAuthenticated', () => {
    it('es false cuando no hay usuario autenticado', () => {
      mockUserContext.isUserSelected.mockReturnValue(false);
      expect(component.isAuthenticated()).toBe(false);
    });

    it('es false cuando la ruta es pública (/auth/login)', () => {
      mockUserContext.isUserSelected.mockReturnValue(true);
      component.currentRoute.set('/auth/login');
      expect(component.isAuthenticated()).toBe(false);
    });

    it('es false cuando la ruta es pública (/auth/register)', () => {
      mockUserContext.isUserSelected.mockReturnValue(true);
      component.currentRoute.set('/auth/register');
      expect(component.isAuthenticated()).toBe(false);
    });

    it('es true cuando hay usuario y la ruta es privada', () => {
      mockUserContext.isUserSelected.mockReturnValue(true);
      component.currentRoute.set('/list');
      expect(component.isAuthenticated()).toBe(true);
    });
  });

  describe('isNavActive', () => {
    it('es true cuando la ruta actual comienza con la ruta del item', () => {
      component.currentRoute.set('/list');
      expect(component.isNavActive('/list')).toBe(true);
    });

    it('es false cuando la ruta actual no coincide', () => {
      component.currentRoute.set('/wishlist');
      expect(component.isNavActive('/list')).toBe(false);
    });

    it('/add es activo cuando la ruta actual es /update/:id', () => {
      component.currentRoute.set('/update/123');
      expect(component.isNavActive('/add')).toBe(true);
    });

    it('/add es activo cuando la ruta actual es /add', () => {
      component.currentRoute.set('/add');
      expect(component.isNavActive('/add')).toBe(true);
    });
  });

  describe('getPageTitle', () => {
    it('devuelve "nav.add" para rutas /update/:id', () => {
      component.currentRoute.set('/update/42');
      expect(component.getPageTitle()).toBe('nav.add');
    });

    it('devuelve el label del nav item activo (/list → nav.collection)', () => {
      component.currentRoute.set('/list');
      expect(component.getPageTitle()).toBe('nav.collection');
    });

    it('devuelve el label del nav item activo (/wishlist → nav.wishlist)', () => {
      component.currentRoute.set('/wishlist');
      expect(component.getPageTitle()).toBe('nav.wishlist');
    });

    it('devuelve "" para rutas desconocidas', () => {
      component.currentRoute.set('/unknown');
      expect(component.getPageTitle()).toBe('');
    });
  });

  describe('getDisplayName', () => {
    it('delega en UserContextService', () => {
      expect(component.getDisplayName()).toBe('Test User');
    });
  });

  describe('getUserEmail', () => {
    it('delega en UserContextService', () => {
      expect(component.getUserEmail()).toBe('test@example.com');
    });
  });

  describe('getAvatarUrl', () => {
    it('devuelve avatarUrl del estado cuando existe', () => {
      mockUserPrefsState.avatarUrl.set('https://cdn.example.com/avatar.jpg');
      expect(component.getAvatarUrl()).toBe('https://cdn.example.com/avatar.jpg');
    });

    it('devuelve el fallback de UserContextService cuando avatarUrl es null', () => {
      mockUserPrefsState.avatarUrl.set(null);
      expect(component.getAvatarUrl()).toBe('https://fallback.example.com/avatar.jpg');
    });
  });

  describe('logout', () => {
    it('llama a clearUser en UserContextService', () => {
      component.logout();
      expect(mockUserContext.clearUser).toHaveBeenCalledOnce();
    });
  });
});
