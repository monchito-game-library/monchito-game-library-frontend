import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AppComponent } from './app.component';
import { UserContextService } from '@/services/user-context/user-context.service';
import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';
import { UserPreferencesInitService } from '@/services/user-preferences-init/user-preferences-init.service';
import { ThemeService } from '@/services/theme/theme.service';
import { PwaUpdateService } from '@/services/pwa-update/pwa-update.service';

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
        { provide: UserPreferencesInitService, useValue: { loadPreferences: vi.fn().mockResolvedValue(undefined) } },
        { provide: ThemeService, useValue: { initTheme: vi.fn(), setDarkTheme: vi.fn(), setLightTheme: vi.fn() } },
        { provide: PwaUpdateService, useValue: { init: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(AppComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    // Acceder a menuTriggers para cubrir la propiedad @ViewChildren
    expect(component.menuTriggers).toBeDefined();
  });

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
      component.currentRoute.set('/collection');
      expect(component.isAuthenticated()).toBe(true);
    });
  });

  describe('isNavActive', () => {
    it('es true cuando la ruta actual comienza con la ruta del item', () => {
      component.currentRoute.set('/collection');
      expect(component.isNavActive('/collection')).toBe(true);
    });

    it('es false cuando la ruta actual no coincide', () => {
      component.currentRoute.set('/wishlist');
      expect(component.isNavActive('/collection')).toBe(false);
    });

    it('/collection/games/add es activo cuando la ruta actual es /collection/games/edit/:id', () => {
      component.currentRoute.set('/collection/games/edit/123');
      expect(component.isNavActive('/collection/games/add')).toBe(true);
    });

    it('/collection/games/add es activo cuando la ruta actual es /collection/games/add', () => {
      component.currentRoute.set('/collection/games/add');
      expect(component.isNavActive('/collection/games/add')).toBe(true);
    });
  });

  describe('getPageTitle', () => {
    it('devuelve "nav.add" para rutas /collection/games/edit/:id', () => {
      component.currentRoute.set('/collection/games/edit/42');
      expect(component.getPageTitle()).toBe('nav.add');
    });

    it('devuelve el label del nav item activo (/collection → nav.collection)', () => {
      component.currentRoute.set('/collection');
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

  describe('ngOnInit', () => {
    it('inicializa el tema y el servicio PWA', () => {
      const themeService = TestBed.inject(ThemeService as any) as any;
      const pwaUpdate = TestBed.inject(PwaUpdateService as any) as any;

      component.ngOnInit();

      expect(themeService.initTheme).toHaveBeenCalled();
      expect(pwaUpdate.init).toHaveBeenCalled();
    });

    it('establece currentRoute con la URL del router', () => {
      component.ngOnInit();
      expect(typeof component.currentRoute()).toBe('string');
    });

    it('actualiza currentRoute al navegar', async () => {
      component.ngOnInit();
      const router = TestBed.inject(Router);
      await router.navigate(['/list']).catch(() => {});
      expect(typeof component.currentRoute()).toBe('string');
    });
  });

  describe('effect — loadPreferences cuando userId cambia', () => {
    it('delega en UserPreferencesInitService cuando userId pasa de null a un valor', () => {
      const initService = TestBed.inject(UserPreferencesInitService as any) as any;

      mockUserContext.userId.set('user-1');
      TestBed.tick();

      expect(initService.loadPreferences).toHaveBeenCalledWith('user-1');
    });
  });

  describe('onNavigateToSettings', () => {
    it('navega a /settings', () => {
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.onNavigateToSettings();

      expect(spy).toHaveBeenCalledWith(['/settings']);
    });
  });

  describe('bottomNavItems', () => {
    it('devuelve los items de navegación cuando isAdmin es false', () => {
      mockUserPrefsState.isAdmin.set(false);
      const items = component.bottomNavItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('incluye items de gestión cuando isAdmin es true', () => {
      mockUserPrefsState.isAdmin.set(true);
      const items = component.bottomNavItems();
      expect(items.some((i) => i.route === '/management')).toBe(true);
    });

    it('filtra items tabletOnly cuando isMobile es true', () => {
      (component as any)._isMobile.set(true);
      mockUserPrefsState.isAdmin.set(false);
      const items = component.bottomNavItems();
      expect(items.every((i) => !i.tabletOnly)).toBe(true);
    });

    it('incluye items tabletOnly cuando isMobile es false', () => {
      (component as any)._isMobile.set(false);
      mockUserPrefsState.isAdmin.set(false);
      const items = component.bottomNavItems();
      expect(items.some((i) => i.tabletOnly)).toBe(true);
    });
  });

  describe('activeNavIndex', () => {
    it('devuelve un índice >= 0', () => {
      component.currentRoute.set('/collection');
      expect(component.activeNavIndex()).toBeGreaterThanOrEqual(0);
    });

    it('devuelve 0 cuando ninguna ruta coincide', () => {
      component.currentRoute.set('/ruta-desconocida');
      expect(component.activeNavIndex()).toBe(0);
    });
  });

  describe('navItemCount', () => {
    it('devuelve el número total de items de navegación', () => {
      expect(component.navItemCount()).toBeGreaterThan(0);
    });
  });
});

describe('AppComponent — router subscription (NavigationEnd)', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerEvents$: Subject<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    routerEvents$ = new Subject();

    const mockUserContext = {
      userId: signal<string | null>(null),
      isUserSelected: vi.fn().mockReturnValue(false),
      getDisplayName: vi.fn().mockReturnValue(''),
      getUserEmail: vi.fn().mockReturnValue(''),
      getAvatarUrl: vi.fn().mockReturnValue(''),
      clearUser: vi.fn()
    };

    const mockUserPrefsState = {
      avatarUrl: signal<string | null>(null),
      bannerImageUrl: signal<string | null>(null),
      preferencesLoaded: signal(false),
      isAdmin: signal(false),
      role: signal(null)
    };

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            url: '',
            events: routerEvents$.asObservable(),
            navigate: vi.fn().mockResolvedValue(true)
          }
        },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: UserPreferencesService, useValue: mockUserPrefsState },
        { provide: UserPreferencesInitService, useValue: { loadPreferences: vi.fn().mockResolvedValue(undefined) } },
        { provide: ThemeService, useValue: { initTheme: vi.fn(), setDarkTheme: vi.fn(), setLightTheme: vi.fn() } },
        { provide: PwaUpdateService, useValue: { init: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(AppComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('actualiza currentRoute al recibir NavigationEnd', () => {
    component.ngOnInit();
    routerEvents$.next(new NavigationEnd(1, '/list', '/list'));
    expect(component.currentRoute()).toBe('/list');
  });
});
