import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { SettingsComponent } from './settings.component';
import { ThemeService } from '@/services/theme.service';
import { UserContextService } from '@/services/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import { USER_PREFERENCES_USE_CASES } from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { CATALOG_USE_CASES } from '@/domain/use-cases/catalog/catalog.use-cases.contract';
import { AUTH_USE_CASES } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  let mockThemeService: {
    isDarkMode: ReturnType<typeof signal<boolean>>;
    setLightTheme: ReturnType<typeof vi.fn>;
    setDarkTheme: ReturnType<typeof vi.fn>;
  };
  let mockUserPreferencesState: {
    avatarUrl: ReturnType<typeof signal>;
    uploadingAvatar: ReturnType<typeof signal>;
    uploadingBanner: ReturnType<typeof signal>;
    bannerImageUrl: ReturnType<typeof signal>;
    rawgSearchResults: ReturnType<typeof signal>;
    rawgSearchLoading: ReturnType<typeof signal>;
    rawgSearchQuery: ReturnType<typeof signal>;
    preferencesLoaded: ReturnType<typeof signal>;
  };
  let mockUserContext: {
    userId: ReturnType<typeof signal>;
    getDisplayName: ReturnType<typeof vi.fn>;
    getUserEmail: ReturnType<typeof vi.fn>;
    getAvatarUrl: ReturnType<typeof vi.fn>;
    clearUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockThemeService = {
      isDarkMode: signal(false),
      setLightTheme: vi.fn(),
      setDarkTheme: vi.fn()
    };

    mockUserPreferencesState = {
      avatarUrl: signal<string | null>(null),
      uploadingAvatar: signal(false),
      uploadingBanner: signal(false),
      bannerImageUrl: signal<string | null>(null),
      rawgSearchResults: signal([]),
      rawgSearchLoading: signal(false),
      rawgSearchQuery: signal(''),
      preferencesLoaded: signal(false)
    };

    mockUserContext = {
      userId: signal<string | null>('user-1'),
      getDisplayName: vi.fn().mockReturnValue('Test User'),
      getUserEmail: vi.fn().mockReturnValue('test@example.com'),
      getAvatarUrl: vi.fn().mockReturnValue('https://fallback.url/avatar.jpg'),
      clearUser: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: UserPreferencesService, useValue: mockUserPreferencesState },
        { provide: UserContextService, useValue: mockUserContext },
        {
          provide: USER_PREFERENCES_USE_CASES,
          useValue: {
            saveBannerUrl: vi.fn().mockResolvedValue(undefined),
            savePreferences: vi.fn().mockResolvedValue(undefined),
            uploadAvatar: vi.fn(),
            uploadBanner: vi.fn()
          }
        },
        {
          provide: CATALOG_USE_CASES,
          useValue: { searchBanners: vi.fn().mockResolvedValue([]), getTopBanners: vi.fn().mockResolvedValue([]) }
        },
        { provide: AUTH_USE_CASES, useValue: { updateDisplayName: vi.fn().mockResolvedValue(undefined) } },
        {
          provide: TranslocoService,
          useValue: {
            translate: vi.fn((k: string) => k),
            getActiveLang: vi.fn().mockReturnValue('es'),
            setActiveLang: vi.fn()
          }
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(SettingsComponent, { set: { imports: [], template: '' } });

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    // No detectChanges() — evitamos ngOnInit
  });

  describe('valores iniciales', () => {
    it('editingName es false', () => expect(component.editingName()).toBe(false));
    it('nameInputValue es ""', () => expect(component.nameInputValue()).toBe(''));
    it('savingName es false', () => expect(component.savingName()).toBe(false));
    it('avatarUrl delega en UserPreferencesService', () => expect(component.avatarUrl()).toBeNull());
    it('uploadingAvatar delega en UserPreferencesService', () => expect(component.uploadingAvatar()).toBe(false));
    it('isDark delega en ThemeService', () => expect(component.isDark()).toBe(false));
  });

  describe('getDisplayName', () => {
    it('delega en UserContextService', () => {
      expect(component.getDisplayName()).toBe('Test User');
      expect(mockUserContext.getDisplayName).toHaveBeenCalledOnce();
    });
  });

  describe('getUserEmail', () => {
    it('delega en UserContextService', () => {
      expect(component.getUserEmail()).toBe('test@example.com');
    });
  });

  describe('getAvatarUrl', () => {
    it('devuelve avatarUrl del estado cuando existe', () => {
      mockUserPreferencesState.avatarUrl.set('https://cdn.example.com/avatar.jpg');
      expect(component.getAvatarUrl()).toBe('https://cdn.example.com/avatar.jpg');
    });

    it('devuelve el fallback de UserContextService cuando avatarUrl es null', () => {
      mockUserPreferencesState.avatarUrl.set(null);
      expect(component.getAvatarUrl()).toBe('https://fallback.url/avatar.jpg');
    });
  });

  describe('onEditName', () => {
    it('activa el modo edición', () => {
      component.onEditName();
      expect(component.editingName()).toBe(true);
    });

    it('inicializa nameInputValue con el nombre actual', () => {
      mockUserContext.getDisplayName.mockReturnValue('Mi Nombre');
      component.onEditName();
      expect(component.nameInputValue()).toBe('Mi Nombre');
    });
  });

  describe('onCancelEditName', () => {
    it('desactiva el modo edición', () => {
      component.editingName.set(true);
      component.onCancelEditName();
      expect(component.editingName()).toBe(false);
    });
  });

  describe('onSaveName', () => {
    it('sale del modo edición sin llamar a la API si el nombre no cambió', async () => {
      const authUseCases = TestBed.inject(AUTH_USE_CASES as any) as any;
      mockUserContext.getDisplayName.mockReturnValue('Test User');
      component.nameInputValue.set('Test User');
      component.editingName.set(true);

      await component.onSaveName();

      expect(authUseCases.updateDisplayName).not.toHaveBeenCalled();
      expect(component.editingName()).toBe(false);
    });

    it('sale del modo edición sin llamar a la API si el nombre está vacío', async () => {
      const authUseCases = TestBed.inject(AUTH_USE_CASES as any) as any;
      component.nameInputValue.set('   ');
      component.editingName.set(true);

      await component.onSaveName();

      expect(authUseCases.updateDisplayName).not.toHaveBeenCalled();
      expect(component.editingName()).toBe(false);
    });

    it('llama a updateDisplayName y sale del modo edición si el nombre cambió', async () => {
      const authUseCases = TestBed.inject(AUTH_USE_CASES as any) as any;
      mockUserContext.getDisplayName.mockReturnValue('Test User');
      component.nameInputValue.set('Nuevo Nombre');
      component.editingName.set(true);

      await component.onSaveName();

      expect(authUseCases.updateDisplayName).toHaveBeenCalledWith('Nuevo Nombre');
      expect(component.editingName()).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    it('llama a setDarkTheme cuando el tema actual es claro', () => {
      mockThemeService.isDarkMode.set(false);
      component.toggleTheme();
      expect(mockThemeService.setDarkTheme).toHaveBeenCalledOnce();
      expect(mockThemeService.setLightTheme).not.toHaveBeenCalled();
    });

    it('llama a setLightTheme cuando el tema actual es oscuro', () => {
      mockThemeService.isDarkMode.set(true);
      component.toggleTheme();
      expect(mockThemeService.setLightTheme).toHaveBeenCalledOnce();
      expect(mockThemeService.setDarkTheme).not.toHaveBeenCalled();
    });
  });

  describe('onSelectBanner', () => {
    it('actualiza bannerImageUrl en el estado', () => {
      component.onSelectBanner('https://cdn.example.com/banner.jpg');
      expect(mockUserPreferencesState.bannerImageUrl()).toBe('https://cdn.example.com/banner.jpg');
    });

    it('llama a saveBannerUrl con el userId y la nueva URL', () => {
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      component.onSelectBanner('https://cdn.example.com/banner.jpg');
      expect(useCases.saveBannerUrl).toHaveBeenCalledWith('user-1', 'https://cdn.example.com/banner.jpg', null);
    });

    it('no llama a saveBannerUrl si no hay userId', () => {
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      mockUserContext.userId.set(null);
      component.onSelectBanner('https://cdn.example.com/banner.jpg');
      expect(useCases.saveBannerUrl).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('llama a clearUser en UserContextService', () => {
      component.logout();
      expect(mockUserContext.clearUser).toHaveBeenCalledOnce();
    });
  });

  describe('ngOnInit / ngOnDestroy', () => {
    it('ngOnInit llama a _loadInitialBanners', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(catalogUseCases.getTopBanners).toHaveBeenCalled();
    });

    it('ngOnDestroy unsubscribe sin errores', () => {
      component.ngOnInit();
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('selectedLangControl.valueChanges con valor truthy llama a setActiveLang y _savePreferences', () => {
      const transloco = TestBed.inject(TranslocoService as any) as any;
      const userPrefsUseCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      component.ngOnInit();

      component.selectedLangControl.setValue('en');

      expect(transloco.setActiveLang).toHaveBeenCalledWith('en');
      expect(userPrefsUseCases.savePreferences).toHaveBeenCalled();
    });

    it('el debounce de búsqueda ejecuta _executeSearch al emitir _searchSubject', () => {
      vi.useFakeTimers();
      try {
        const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;
        component.ngOnInit();

        (component as any)._searchSubject.next('zelda');
        vi.advanceTimersByTime(500);

        expect(catalogUseCases.searchBanners).toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('onRawgSearch', () => {
    it('actualiza rawgSearchQuery con el valor del input', () => {
      const event = { target: { value: 'zelda' } } as unknown as Event;
      component.onRawgSearch(event);
      expect(mockUserPreferencesState.rawgSearchQuery()).toBe('zelda');
    });
  });

  describe('onSaveName — error path', () => {
    it('muestra snackbar cuando updateDisplayName lanza un error', async () => {
      const authUseCases = TestBed.inject(AUTH_USE_CASES as any) as any;
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      authUseCases.updateDisplayName.mockRejectedValue(new Error('Auth error'));
      mockUserContext.getDisplayName.mockReturnValue('Old Name');
      component.nameInputValue.set('New Name');

      await component.onSaveName();

      expect(snackBar.open).toHaveBeenCalled();
      expect(component.savingName()).toBe(false);
    });
  });

  describe('_loadInitialBanners', () => {
    it('actualiza rawgSearchResults con los banners filtrados', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;
      catalogUseCases.getTopBanners.mockResolvedValue([
        { title: 'God of War', imageUrl: 'https://img.example.com/gow.jpg' },
        { title: 'No Image Game', imageUrl: '' }
      ]);

      await (component as any)._loadInitialBanners();

      expect(mockUserPreferencesState.rawgSearchResults()).toHaveLength(1);
      expect(mockUserPreferencesState.rawgSearchLoading()).toBe(false);
    });

    it('pone rawgSearchResults a [] cuando falla', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;
      catalogUseCases.getTopBanners.mockRejectedValue(new Error('Network error'));

      await (component as any)._loadInitialBanners();

      expect(mockUserPreferencesState.rawgSearchResults()).toEqual([]);
      expect(mockUserPreferencesState.rawgSearchLoading()).toBe(false);
    });
  });

  describe('_executeSearch', () => {
    it('llama a _loadInitialBanners cuando la query es vacía', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;

      await (component as any)._executeSearch('   ');

      expect(catalogUseCases.getTopBanners).toHaveBeenCalled();
    });

    it('busca en RAWG y actualiza resultados cuando hay query', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;
      catalogUseCases.searchBanners.mockResolvedValue([
        { title: 'Zelda', imageUrl: 'https://img.example.com/zelda.jpg' }
      ]);

      await (component as any)._executeSearch('zelda');

      expect(mockUserPreferencesState.rawgSearchResults()).toHaveLength(1);
      expect(mockUserPreferencesState.rawgSearchLoading()).toBe(false);
    });

    it('pone rawgSearchResults a [] cuando la búsqueda falla', async () => {
      const catalogUseCases = TestBed.inject(CATALOG_USE_CASES as any) as any;
      catalogUseCases.searchBanners.mockRejectedValue(new Error('Network error'));

      await (component as any)._executeSearch('zelda');

      expect(mockUserPreferencesState.rawgSearchResults()).toEqual([]);
    });
  });

  describe('onAvatarFileSelected', () => {
    function mockFileEvent(file?: File): Event {
      const input = { files: file ? [file] : null, value: '' } as unknown as HTMLInputElement;
      return { target: input } as unknown as Event;
    }

    it('retorna sin abrir diálogo cuando no hay fichero', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      await component.onAvatarFileSelected(mockFileEvent());
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('retorna sin subir cuando el diálogo se cancela (blob null)', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(null) });
      const file = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });

      await component.onAvatarFileSelected(mockFileEvent(file));

      expect(useCases.uploadAvatar).not.toHaveBeenCalled();
    });

    it('sube el avatar cuando el diálogo confirma un blob', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      const blob = new Blob(['data'], { type: 'image/jpeg' });
      dialog.open.mockReturnValue({ afterClosed: () => of(blob) });
      useCases.uploadAvatar.mockResolvedValue('https://cdn.example.com/new-avatar.jpg');
      const file = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });

      await component.onAvatarFileSelected(mockFileEvent(file));

      expect(useCases.uploadAvatar).toHaveBeenCalled();
      expect(mockUserPreferencesState.avatarUrl()).toBe('https://cdn.example.com/new-avatar.jpg');
      expect(mockUserPreferencesState.uploadingAvatar()).toBe(false);
    });

    it('muestra snackbar cuando la subida falla', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const blob = new Blob(['data'], { type: 'image/jpeg' });
      dialog.open.mockReturnValue({ afterClosed: () => of(blob) });
      useCases.uploadAvatar.mockRejectedValue(new Error('Storage error'));
      const file = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });

      await component.onAvatarFileSelected(mockFileEvent(file));

      expect(snackBar.open).toHaveBeenCalled();
      expect(mockUserPreferencesState.uploadingAvatar()).toBe(false);
    });

    it('retorna sin subir cuando no hay userId', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      const blob = new Blob(['data'], { type: 'image/jpeg' });
      dialog.open.mockReturnValue({ afterClosed: () => of(blob) });
      mockUserContext.userId.set(null);
      const file = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });

      await component.onAvatarFileSelected(mockFileEvent(file));

      expect(useCases.uploadAvatar).not.toHaveBeenCalled();
    });
  });

  describe('onBannerFileSelected', () => {
    function mockFileEvent(file?: File): Event {
      const input = { files: file ? [file] : null, value: '' } as unknown as HTMLInputElement;
      return { target: input } as unknown as Event;
    }

    it('retorna sin abrir diálogo cuando no hay fichero', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      await component.onBannerFileSelected(mockFileEvent());
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('retorna sin subir cuando el diálogo se cancela', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(null) });
      const file = new File(['data'], 'banner.jpg', { type: 'image/jpeg' });

      await component.onBannerFileSelected(mockFileEvent(file));

      expect(useCases.uploadBanner).not.toHaveBeenCalled();
    });

    it('sube el banner cuando el diálogo confirma un blob', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      const blob = new Blob(['data'], { type: 'image/jpeg' });
      dialog.open.mockReturnValue({ afterClosed: () => of(blob) });
      useCases.uploadBanner.mockResolvedValue('https://cdn.example.com/new-banner.jpg');
      const file = new File(['data'], 'banner.jpg', { type: 'image/jpeg' });

      await component.onBannerFileSelected(mockFileEvent(file));

      expect(useCases.uploadBanner).toHaveBeenCalled();
      expect(mockUserPreferencesState.bannerImageUrl()).toBe('https://cdn.example.com/new-banner.jpg');
      expect(mockUserPreferencesState.uploadingBanner()).toBe(false);
    });

    it('muestra snackbar cuando la subida del banner falla', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const blob = new Blob(['data'], { type: 'image/jpeg' });
      dialog.open.mockReturnValue({ afterClosed: () => of(blob) });
      useCases.uploadBanner.mockRejectedValue(new Error('Storage error'));
      const file = new File(['data'], 'banner.jpg', { type: 'image/jpeg' });

      await component.onBannerFileSelected(mockFileEvent(file));

      expect(snackBar.open).toHaveBeenCalled();
      expect(mockUserPreferencesState.uploadingBanner()).toBe(false);
    });

    it('retorna sin subir cuando no hay userId', async () => {
      const dialog = TestBed.inject(MatDialog as any) as any;
      const useCases = TestBed.inject(USER_PREFERENCES_USE_CASES as any) as any;
      const blob = new Blob(['data'], { type: 'image/jpeg' });
      dialog.open.mockReturnValue({ afterClosed: () => of(blob) });
      mockUserContext.userId.set(null);
      const file = new File(['data'], 'banner.jpg', { type: 'image/jpeg' });

      await component.onBannerFileSelected(mockFileEvent(file));

      expect(useCases.uploadBanner).not.toHaveBeenCalled();
    });
  });
});
