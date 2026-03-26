import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { USER_PREFERENCES_USE_CASES } from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { ThemeService } from './theme.service';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesInitService } from './user-preferences-init.service';

const mockThemeService: Partial<ThemeService> = {
  setDarkTheme: vi.fn(),
  setLightTheme: vi.fn()
};

const mockTransloco: Partial<TranslocoService> = {
  setActiveLang: vi.fn()
};

const mockUserPreferencesUseCases = {
  loadPreferences: vi.fn()
};

describe('UserPreferencesInitService', () => {
  let service: UserPreferencesInitService;
  let mockUserPrefsState: {
    preferencesLoaded: ReturnType<typeof signal<boolean>>;
    avatarUrl: ReturnType<typeof signal<string | null>>;
    bannerImageUrl: ReturnType<typeof signal<string | null>>;
    role: ReturnType<typeof signal<string | null>>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserPrefsState = {
      preferencesLoaded: signal(false),
      avatarUrl: signal<string | null>(null),
      bannerImageUrl: signal<string | null>(null),
      role: signal<string | null>(null)
    };

    TestBed.configureTestingModule({
      providers: [
        UserPreferencesInitService,
        { provide: USER_PREFERENCES_USE_CASES, useValue: mockUserPreferencesUseCases },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: TranslocoService, useValue: mockTransloco },
        { provide: UserPreferencesService, useValue: mockUserPrefsState }
      ]
    });

    service = TestBed.inject(UserPreferencesInitService);
  });

  describe('loadPreferences', () => {
    it('establece preferencesLoaded=true cuando no hay preferencias guardadas', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue(null);

      await service.loadPreferences('user-1');

      expect(mockUserPrefsState.preferencesLoaded()).toBe(true);
    });

    it('no aplica ningún ajuste adicional cuando las preferencias son null', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue(null);

      await service.loadPreferences('user-1');

      expect(mockThemeService.setDarkTheme).not.toHaveBeenCalled();
      expect(mockThemeService.setLightTheme).not.toHaveBeenCalled();
      expect(mockTransloco.setActiveLang).not.toHaveBeenCalled();
    });

    it('aplica tema oscuro cuando theme es "dark"', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'dark',
        language: null,
        avatarUrl: null,
        bannerUrl: null,
        role: 'user'
      });

      await service.loadPreferences('user-1');

      expect(mockThemeService.setDarkTheme).toHaveBeenCalledOnce();
      expect(mockThemeService.setLightTheme).not.toHaveBeenCalled();
    });

    it('aplica tema claro cuando theme es "light"', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'light',
        language: null,
        avatarUrl: null,
        bannerUrl: null,
        role: 'user'
      });

      await service.loadPreferences('user-1');

      expect(mockThemeService.setLightTheme).toHaveBeenCalledOnce();
      expect(mockThemeService.setDarkTheme).not.toHaveBeenCalled();
    });

    it('establece el idioma cuando language está definido', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'light',
        language: 'es',
        avatarUrl: null,
        bannerUrl: null,
        role: 'user'
      });

      await service.loadPreferences('user-1');

      expect(mockTransloco.setActiveLang).toHaveBeenCalledWith('es');
    });

    it('no llama a setActiveLang cuando language es null', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'light',
        language: null,
        avatarUrl: null,
        bannerUrl: null,
        role: 'user'
      });

      await service.loadPreferences('user-1');

      expect(mockTransloco.setActiveLang).not.toHaveBeenCalled();
    });

    it('actualiza avatarUrl cuando está definida', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'light',
        language: null,
        avatarUrl: 'https://cdn.example.com/avatar.jpg',
        bannerUrl: null,
        role: 'user'
      });

      await service.loadPreferences('user-1');

      expect(mockUserPrefsState.avatarUrl()).toBe('https://cdn.example.com/avatar.jpg');
    });

    it('no modifica avatarUrl cuando es null', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'light',
        language: null,
        avatarUrl: null,
        bannerUrl: null,
        role: 'user'
      });

      await service.loadPreferences('user-1');

      expect(mockUserPrefsState.avatarUrl()).toBeNull();
    });

    it('actualiza bannerImageUrl cuando está definida', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'light',
        language: null,
        avatarUrl: null,
        bannerUrl: 'https://cdn.example.com/banner.jpg',
        role: 'user'
      });

      await service.loadPreferences('user-1');

      expect(mockUserPrefsState.bannerImageUrl()).toBe('https://cdn.example.com/banner.jpg');
    });

    it('actualiza el rol del usuario', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'light',
        language: null,
        avatarUrl: null,
        bannerUrl: null,
        role: 'admin'
      });

      await service.loadPreferences('user-1');

      expect(mockUserPrefsState.role()).toBe('admin');
    });

    it('establece preferencesLoaded=true cuando las preferencias existen', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'dark',
        language: 'en',
        avatarUrl: null,
        bannerUrl: null,
        role: 'user'
      });

      await service.loadPreferences('user-1');

      expect(mockUserPrefsState.preferencesLoaded()).toBe(true);
    });

    it('aplica todos los campos cuando todos están definidos', async () => {
      mockUserPreferencesUseCases.loadPreferences.mockResolvedValue({
        theme: 'dark',
        language: 'en',
        avatarUrl: 'https://cdn.example.com/a.jpg',
        bannerUrl: 'https://cdn.example.com/b.jpg',
        role: 'admin'
      });

      await service.loadPreferences('user-1');

      expect(mockThemeService.setDarkTheme).toHaveBeenCalledOnce();
      expect(mockTransloco.setActiveLang).toHaveBeenCalledWith('en');
      expect(mockUserPrefsState.avatarUrl()).toBe('https://cdn.example.com/a.jpg');
      expect(mockUserPrefsState.bannerImageUrl()).toBe('https://cdn.example.com/b.jpg');
      expect(mockUserPrefsState.role()).toBe('admin');
      expect(mockUserPrefsState.preferencesLoaded()).toBe(true);
    });
  });
});
