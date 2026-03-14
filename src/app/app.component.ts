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
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { UserContextService } from '@/services/user-context.service';
import { SkeletonComponent } from '@/components/ad-hoc/skeleton/skeleton.component';
import { ThemeService } from '@/services/theme.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import {
  USER_PREFERENCES_USE_CASES,
  UserPreferencesUseCasesContract
} from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';
import { GameModel } from '@/models/game/game.model';
import { NavItemInterface } from '@/interfaces/nav-item.interface';

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
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _userPreferencesUseCases: UserPreferencesUseCasesContract = inject(USER_PREFERENCES_USE_CASES);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);

  private readonly _publicRoutes: string[] = ['/login', '/register', '/forgot-password'];

  readonly userContext: UserContextService = inject(UserContextService);

  /** Main navigation items. */
  readonly navItems: NavItemInterface[] = [
    { icon: 'sports_esports', label: 'nav.collection', route: '/list' },
    { icon: 'add_circle', label: 'nav.add', route: '/add' }
  ];

  /** Reactive signal with the current avatar URL. */
  readonly avatarUrl = this._userPreferencesState.avatarUrl;

  /** URL of the cover currently used as the profile panel background. */
  readonly bannerImageUrl = this._userPreferencesState.bannerImageUrl;

  /** Whether user preferences have been loaded from Supabase at least once. */
  readonly preferencesLoaded: WritableSignal<boolean> = this._userPreferencesState.preferencesLoaded;

  /** Current route URL. */
  readonly currentRoute: WritableSignal<string> = signal('');

  /** References to the profile menu triggers (rail + topbar). */
  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;

  constructor() {
    effect(() => {
      const userId: string | null = this.userContext.userId();
      if (userId) {
        void this._loadPreferences(userId);
        void this._loadGameImages(userId);
      }
    });
  }

  ngOnInit(): void {
    this._themeService.initTheme();

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
    if (route === '/add') {
      return current.startsWith('/add') || current.startsWith('/update/');
    }
    return current.startsWith(route);
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
   * Loads user preferences from Supabase and applies theme, language and avatar.
   *
   * @param {string} userId - Authenticated user ID
   */
  private async _loadPreferences(userId: string): Promise<void> {
    const prefs: UserPreferencesModel | null = await this._userPreferencesUseCases.loadPreferences(userId);
    if (!prefs) {
      this.preferencesLoaded.set(true);
      return;
    }

    if (prefs.theme === 'dark') {
      this._themeService.setDarkTheme();
    } else {
      this._themeService.setLightTheme();
    }

    if (prefs.language) {
      this._transloco.setActiveLang(prefs.language);
    }

    if (prefs.avatarUrl) {
      this._userPreferencesState.avatarUrl.set(prefs.avatarUrl);
    }

    if (prefs.bannerUrl) {
      this._userPreferencesState.bannerImageUrl.set(prefs.bannerUrl);
    }

    this.preferencesLoaded.set(true);
  }

  /**
   * Loads cover image URLs from the user's collection and picks one at random as the panel background.
   * The list is shuffled and capped at 24 so the Settings grid stays manageable;
   * each session shows a different subset, adding visual variety.
   *
   * @param {string} userId - Authenticated user ID
   */
  private async _loadGameImages(userId: string): Promise<void> {
    const games: GameModel[] = await this._gameUseCases.getAllGames(userId);
    const urls: string[] = games.map((game: GameModel) => game.imageUrl).filter((url): url is string => !!url);

    const shuffled = [...urls].sort(() => Math.random() - 0.5).slice(0, 24);
    this._userPreferencesState.gameImageUrls.set(shuffled);
    this._userPreferencesState.gamesLoaded.set(true);
    this._pickRandomBanner();
  }

  /**
   * Picks a random cover URL from the available list and sets it as the banner,
   * only if the user does not already have a saved banner.
   */
  private _pickRandomBanner(): void {
    if (this._userPreferencesState.bannerImageUrl()) return;
    const urls: string[] = this._userPreferencesState.gameImageUrls();
    if (!urls.length) return;
    this._userPreferencesState.bannerImageUrl.set(urls[Math.floor(Math.random() * urls.length)]);
  }

  /**
   * Closes all active profile menu triggers.
   */
  private _closeMenu(): void {
    this.menuTriggers?.forEach((trigger: MatMenuTrigger) => trigger.closeMenu());
  }
}
