import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  QueryList,
  signal,
  ViewChildren,
  WritableSignal
} from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { TranslocoPipe } from '@jsverse/transloco';
import { UserContextService } from '@/services/user-context.service';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { ThemeService } from '@/services/theme.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import { UserPreferencesInitService } from '@/services/user-preferences-init.service';
import { NavItemInterface } from '@/interfaces/nav-item.interface';
import { PwaUpdateService } from '@/services/pwa-update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, MatIcon, MatMenu, MatMenuTrigger, SkeletonComponent, TranslocoPipe]
})
export class AppComponent implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _userPreferencesInit: UserPreferencesInitService = inject(UserPreferencesInitService);
  private readonly _pwaUpdate: PwaUpdateService = inject(PwaUpdateService);
  private readonly _publicRoutes: string[] = ['/auth/login', '/auth/register', '/auth/forgot-password'];

  readonly userContext: UserContextService = inject(UserContextService);

  /** Navigation items shared by desktop rail and mobile bottom nav. */
  readonly navItems: NavItemInterface[] = [
    { icon: 'sports_esports', label: 'nav.collection', route: '/games' },
    { icon: 'bookmark', label: 'nav.wishlist', route: '/wishlist' },
    { icon: 'shopping_cart', label: 'nav.orders', route: '/orders' }
  ];

  /** Settings item — only shown in mobile bottom nav (desktop uses profile menu). */
  readonly settingsNavItem: NavItemInterface = { icon: 'settings', label: 'nav.settings', route: '/settings' };

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

  /** References to the profile menu triggers (rail + topbar). */
  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;

  constructor() {
    effect(() => {
      const userId: string | null = this.userContext.userId();
      if (userId) {
        void this._userPreferencesInit.loadPreferences(userId);
      }
    });
  }

  ngOnInit(): void {
    this._themeService.initTheme();
    this._pwaUpdate.init();

    this._router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });

    this.currentRoute.set(this._router.url);
  }

  /**
   * Navigates to the settings page and closes the profile menu.
   */
  onNavigateToSettings(): void {
    this._closeMenu();
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
    if (route === '/games/add') {
      return current.startsWith('/games/add') || current.startsWith('/games/edit/');
    }
    return current.startsWith(route);
  }

  /**
   * Returns the transloco key for the current page title, used in the mobile topbar.
   * Falls back to an empty string for routes not matched by any nav item.
   */
  getPageTitle(): string {
    const route = this.currentRoute();
    if (route.startsWith('/update/')) return 'nav.add';
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

  /**
   * Closes all active profile menu triggers.
   */
  private _closeMenu(): void {
    this.menuTriggers?.forEach((trigger: MatMenuTrigger) => trigger.closeMenu());
  }
}
