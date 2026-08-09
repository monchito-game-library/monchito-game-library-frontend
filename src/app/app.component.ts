import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroTooltipDirective } from '@retro/retro-tooltip/directive/retro-tooltip.directive';
import { TranslocoPipe } from '@jsverse/transloco';
import { UserContextService } from '@/services/user-context/user-context.service';
import { RetroSkeletonComponent } from '@retro/retro-skeleton/retro-skeleton.component';
import { ThemeService } from '@/services/theme/theme.service';
import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';
import { UserPreferencesInitService } from '@/services/user-preferences-init/user-preferences-init.service';
import { BREAKPOINTS } from '@/constants/breakpoints.constant';
import { NavItemInterface } from '@/interfaces/nav-item.interface';
import { PwaUpdateService } from '@/services/pwa-update/pwa-update.service';
import { RetroSnackbarHostComponent } from '@retro/retro-snackbar/components/retro-snackbar-host/retro-snackbar-host.component';
import { RetroMenuComponent } from '@retro/retro-menu/retro-menu.component';
import { RetroMenuItemComponent } from '@retro/retro-menu/components/retro-menu-item/retro-menu-item.component';
import { RetroMenuTriggerDirective } from '@retro/retro-menu/directive/retro-menu-trigger.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RetroSkeletonComponent,
    RetroIconComponent,
    RetroTooltipDirective,
    TranslocoPipe,
    NgOptimizedImage,
    RetroSnackbarHostComponent,
    RetroMenuComponent,
    RetroMenuItemComponent,
    RetroMenuTriggerDirective
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly _router: Router = inject(Router);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _userPreferencesInit: UserPreferencesInitService = inject(UserPreferencesInitService);
  private readonly _pwaUpdate: PwaUpdateService = inject(PwaUpdateService);
  private readonly _publicRoutes: string[] = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  private readonly _mobileQuery: MediaQueryList = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`);
  private readonly _mobileAbort: AbortController = new AbortController();
  private readonly _isMobile: WritableSignal<boolean> = signal(this._mobileQuery.matches);

  readonly userContext: UserContextService = inject(UserContextService);

  /** Navigation items shared by desktop rail and mobile bottom nav. */
  readonly navItems: NavItemInterface[] = [
    { icon: 'sports_esports', label: 'nav.collection', route: '/collection' },
    { icon: 'bookmark', label: 'nav.wishlist', route: '/wishlist' },
    { icon: 'sell', label: 'nav.sale', route: '/sale' },
    { icon: 'shopping_cart', label: 'nav.orders', route: '/orders', tabletOnly: true }
  ];

  /** Settings item — only shown in mobile bottom nav (desktop uses profile menu). */
  readonly settingsNavItem: NavItemInterface = { icon: 'settings', label: 'nav.settings', route: '/settings' };

  /** Sub-items mostrados bajo "Venta" en el sidebar (solo desktop) y bottom nav (mobile). */
  readonly saleSubItems: ReadonlyArray<NavItemInterface> = [
    { icon: 'sell', label: 'salePage.tabs.available', route: '/sale/available' },
    { icon: 'history', label: 'salePage.tabs.history', route: '/sale/history' }
  ];

  /** Sub-items mostrados bajo "Colección" en el sidebar cuando está activo (solo desktop). */
  readonly collectionSubItems = computed(
    (): ReadonlyArray<{ route: string; label: string; icon: string }> => [
      { route: '/collection/games', icon: 'videogame_asset', label: 'nav.subnav.games' },
      { route: '/collection/consoles', icon: 'tv', label: 'nav.subnav.consoles' },
      { route: '/collection/controllers', icon: 'gamepad', label: 'nav.subnav.controllers' }
    ]
  );

  /** True cuando la ruta activa está dentro de /collection/* (incluyendo overview). */
  readonly isCollectionActive = computed((): boolean => this.currentRoute().startsWith('/collection'));

  /** True cuando la ruta activa está dentro de /management/*. */
  readonly isManagementActive = computed((): boolean => this.currentRoute().startsWith('/management'));

  /** True cuando la ruta activa está dentro de /sale/*. */
  readonly isSaleActive = computed((): boolean => this.currentRoute().startsWith('/sale'));

  /**
   * Estado animado del sub-nav de "Colección" en el sidebar.
   * Se sincroniza automáticamente con la ruta activa; se mantiene como WritableSignal
   * para permitir override manual futuro (botón chevron, etc.) sin refactor.
   */
  readonly collectionOpen: WritableSignal<boolean> = signal(false);

  /**
   * Estado animado del sub-nav de "Gestión" en el sidebar.
   * @see collectionOpen
   */
  readonly managementOpen: WritableSignal<boolean> = signal(false);

  /**
   * Estado animado del sub-nav de "Venta" en el sidebar.
   * @see collectionOpen
   */
  readonly saleOpen: WritableSignal<boolean> = signal(false);

  /**
   * Sub-items mostrados bajo "Gestión" en el sidebar cuando está activo (solo desktop).
   * Usa iconos Material en lugar de dots para mayor claridad.
   */
  readonly managementSubItems = computed((): ReadonlyArray<{ route: string; label: string; icon: string }> => {
    const items: Array<{ route: string; label: string; icon: string }> = [
      { route: '/management', icon: 'home', label: 'management.nav.home' },
      { route: '/management/protectors', icon: 'videogame_asset', label: 'management.nav.products' },
      { route: '/management/stores', icon: 'storefront', label: 'management.nav.stores' },
      { route: '/management/users', icon: 'group', label: 'management.nav.users' },
      { route: '/management/hardware', icon: 'memory', label: 'management.nav.hardware' }
    ];
    if (!this._userPreferencesState.isOwner()) {
      return items.filter((i) => i.route !== '/management/users');
    }
    return items;
  });

  /** Management navigation items. */
  readonly managementNavItems: NavItemInterface[] = [
    { icon: 'admin_panel_settings', label: 'nav.management', route: '/management' }
  ];

  /** Reactive signal with the current avatar URL. */
  readonly avatarUrl = this._userPreferencesState.avatarUrl;

  /** URL of the cover currently used as the profile panel background. */
  readonly bannerImageUrl = this._userPreferencesState.bannerImageUrl;

  /** Whether user preferences have been loaded from Supabase at least once. */
  readonly preferencesLoaded: WritableSignal<boolean> = this._userPreferencesState.preferencesLoaded;

  /** Whether the current user has the admin role. */
  readonly isAdmin = this._userPreferencesState.isAdmin;

  /** Current route URL. */
  readonly currentRoute: WritableSignal<string> = signal('');

  /** Items visible in the bottom nav — filters tablet-only items on mobile. */
  readonly bottomNavItems: Signal<NavItemInterface[]> = computed((): NavItemInterface[] => {
    const isMobile = this._isMobile();
    // En el bottom nav, expandimos `/sale` en sus dos subitems (En venta
    // + Historial) para que el usuario pueda cambiar de pestaña sin abrir
    // un submenú. El rail de escritorio sigue mostrando el padre y
    // despliega los subitems al hacer hover.
    const items: NavItemInterface[] = [
      ...this.navItems.filter((item) => item.route !== '/sale'),
      ...this.saleSubItems,
      ...(this.isAdmin() ? this.managementNavItems : [])
    ];
    if (isMobile) {
      // En mobile `Pedidos` queda excluido (sólo tablet/desktop). Para mantener
      // 4 items estables y que el pill deslizante no descuadre, añadimos `Ajustes`
      // como cuarta entrada.
      return [...items.filter((item) => !item.tabletOnly), this.settingsNavItem];
    }
    return items;
  });

  /** Index of the active item in the bottom-nav, used to position the sliding pill. */
  readonly activeNavIndex: Signal<number> = computed((): number => {
    const idx = this.bottomNavItems().findIndex((item) => this.isNavActive(item.route));
    return Math.max(idx, 0);
  });

  /** Total number of visible bottom-nav items, used to size the pill. */
  readonly navItemCount: Signal<number> = computed((): number => this.bottomNavItems().length);

  /** True cuando el bottom nav tiene más de 5 entradas y debe compactarse. */
  readonly isDenseNav: Signal<boolean> = computed((): boolean => this.navItemCount() > 5);

  constructor() {
    effect(() => {
      const userId: string | null = this.userContext.userId();
      if (userId) {
        void this._userPreferencesInit.loadPreferences(userId);
      }
    });

    effect(() => {
      this.collectionOpen.set(this.isCollectionActive());
    });

    effect(() => {
      this.managementOpen.set(this.isManagementActive());
    });

    effect(() => {
      this.saleOpen.set(this.isSaleActive());
    });
  }

  ngOnInit(): void {
    this._pwaUpdate.init();
    this._mobileQuery.addEventListener('change', (e) => this._isMobile.set((e as MediaQueryListEvent).matches), {
      signal: this._mobileAbort.signal
    });

    this._router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });

    this.currentRoute.set(this._router.url);
  }

  ngOnDestroy(): void {
    this._mobileAbort.abort();
  }

  /**
   * Navigates to the settings page.
   */
  onNavigateToSettings(): void {
    void this._router.navigate(['/settings']);
  }

  /**
   * Returns true if there is an authenticated user and the current route is not public.
   */
  isAuthenticated(): boolean {
    const isUserAuthenticated = this.userContext.isUserSelected();
    const isPublicRoute = this._publicRoutes.some((route) => this.currentRoute().startsWith(route));
    return isUserAuthenticated && !isPublicRoute;
  }

  /**
   * Returns true if a navigation item is active for the current route.
   * The /update/:id route is considered active for the /add item.
   *
   * @param {string} route - Route path of the navigation item
   */
  isNavActive(route: string): boolean {
    const current = this.currentRoute();
    if (route === '/collection/games/add') {
      return current.startsWith('/collection/games/add') || current.startsWith('/collection/games/edit/');
    }
    return current.startsWith(route);
  }

  /**
   * Returns the transloco key for the current page title, used in the mobile topbar.
   * Prioriza los subitems cuyo `route` coincide EXACTO con la URL actual
   * (p.ej. `/sale/available` → `salePage.tabs.available`) sobre el match
   * por `startsWith` de los items padre. Esto da títulos más específicos
   * al navegar a un subitem, manteniendo los labels padre como fallback.
   */
  getPageTitle(): string {
    const route = this.currentRoute();
    if (route.startsWith('/collection/games/edit/')) return 'nav.add';
    const subItems: ReadonlyArray<{ route: string; label: string; icon?: string }> = [
      ...this.collectionSubItems(),
      ...this.managementSubItems(),
      ...this.saleSubItems
    ];
    const exactSub = subItems.find((item) => item.route === route);
    if (exactSub) return exactSub.label;
    const allItems = [...this.navItems, this.settingsNavItem, ...this.managementNavItems];
    const match = allItems.find((item) => route.startsWith(item.route));
    return match?.label ?? '';
  }

  /**
   * Returns the authenticated user's display name.
   */
  getDisplayName(): string {
    return this.userContext.getDisplayName();
  }

  /**
   * Returns the user's avatar URL.
   * Prioritises the uploaded avatar over the automatically generated one.
   */
  getAvatarUrl(): string {
    return this.avatarUrl() ?? this.userContext.getAvatarUrl();
  }

  /**
   * Returns the authenticated user's email address.
   */
  getUserEmail(): string | null {
    return this.userContext.getUserEmail();
  }

  /**
   * Signs out the current user.
   */
  logout(): void {
    this.userContext.clearUser();
  }
}
