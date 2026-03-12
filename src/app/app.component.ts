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
import { TranslocoService } from '@ngneat/transloco';
import { UserContextService } from '@/services/user-context.service';
import { ThemeService } from '@/services/theme.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import {
  USER_PREFERENCES_USE_CASES,
  UserPreferencesUseCasesContract
} from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { GAME_USE_CASES, GameUseCasesContract } from '@/domain/use-cases/game/game.use-cases.contract';
import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';
import { GameModel } from '@/models/game/game.model';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, MatIcon, MatMenu, MatMenuTrigger]
})
export class AppComponent implements OnInit {
  // --- Inyecciones privadas ---
  private readonly _router: Router = inject(Router);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _userPreferencesUseCases: UserPreferencesUseCasesContract = inject(USER_PREFERENCES_USE_CASES);
  private readonly _gameUseCases: GameUseCasesContract = inject(GAME_USE_CASES);
  readonly userContext: UserContextService = inject(UserContextService);

  // --- Variables privadas ---
  private readonly _publicRoutes: string[] = ['/login', '/register', '/forgot-password'];

  // --- Variables públicas readonly ---
  /** Ítems de navegación principal */
  readonly navItems: NavItem[] = [
    { icon: 'sports_esports', label: 'Colección', route: '/list' },
    { icon: 'add_circle', label: 'Añadir', route: '/add' }
  ];

  // --- Signals públicos ---
  /** Señal reactiva con la URL del avatar actual */
  readonly avatarUrl = this._userPreferencesState.avatarUrl;

  /** URL de la portada actualmente usada como fondo del panel */
  readonly bannerImageUrl = this._userPreferencesState.bannerImageUrl;

  /** Indica si las preferencias del usuario ya han sido cargadas desde Supabase. */
  readonly preferencesLoaded: WritableSignal<boolean> = this._userPreferencesState.preferencesLoaded;

  /** Ruta actual */
  readonly currentRoute: WritableSignal<string> = signal('');

  // --- Configuraciones públicas ---
  /** Referencias a los disparadores del menú de perfil (rail + topbar) */
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
   * Navega a la página de ajustes y cierra el menú de perfil.
   */
  onNavigateToSettings(): void {
    this._closeMenu();
    void this._router.navigate(['/settings']);
  }

  /**
   * Verifica si hay un usuario autenticado y no estamos en una ruta pública.
   */
  isAuthenticated(): boolean {
    const isUserAuthenticated = this.userContext.isUserSelected();
    const isPublicRoute = this._publicRoutes.some((route) => this.currentRoute().startsWith(route));
    return isUserAuthenticated && !isPublicRoute;
  }

  /**
   * Determina si un ítem de navegación está activo según la ruta actual.
   * La ruta /update/:id se considera activa para el ítem /add.
   *
   * @param {string} route - Ruta del ítem de navegación
   */
  isNavActive(route: string): boolean {
    const current = this.currentRoute();
    if (route === '/add') {
      return current.startsWith('/add') || current.startsWith('/update/');
    }
    return current.startsWith(route);
  }

  /**
   * Obtiene el nombre para mostrar del usuario autenticado.
   */
  getDisplayName(): string {
    return this.userContext.getDisplayName();
  }

  /**
   * Obtiene la URL del avatar del usuario.
   * Prioriza el avatar subido por el usuario sobre el generado automáticamente.
   */
  getAvatarUrl(): string {
    return this.avatarUrl() ?? this.userContext.getAvatarUrl();
  }

  /**
   * Obtiene el email del usuario autenticado.
   */
  getUserEmail(): string | null {
    return this.userContext.getUserEmail();
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    this.userContext.clearUser();
  }

  /**
   * Carga las preferencias del usuario desde Supabase y aplica tema, idioma y avatar.
   *
   * @param {string} userId - ID del usuario autenticado
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
   * Carga las URLs de portada de la colección del usuario y elige una aleatoria como fondo del panel.
   *
   * @param {string} userId - ID del usuario autenticado
   */
  private async _loadGameImages(userId: string): Promise<void> {
    const games: GameModel[] = await this._gameUseCases.getAllGames(userId);
    const urls: string[] = games.map((game: GameModel) => game.imageUrl).filter((url): url is string => !!url);

    // Barajamos y limitamos a 24 para que el grid de Settings no sea interminable.
    // Cada sesión muestra un subconjunto distinto, lo que añade variedad.
    const shuffled = [...urls].sort(() => Math.random() - 0.5).slice(0, 24);
    this._userPreferencesState.gameImageUrls.set(shuffled);
    this._userPreferencesState.gamesLoaded.set(true);
    this._pickRandomBanner();
  }

  /**
   * Elige aleatoriamente una URL de portada de la lista disponible y la asigna al banner.
   */
  /**
   * Elige aleatoriamente una URL de portada solo si el usuario no tiene banner guardado.
   */
  private _pickRandomBanner(): void {
    if (this._userPreferencesState.bannerImageUrl()) return;
    const urls: string[] = this._userPreferencesState.gameImageUrls();
    if (!urls.length) return;
    this._userPreferencesState.bannerImageUrl.set(urls[Math.floor(Math.random() * urls.length)]);
  }

  /**
   * Cierra todos los disparadores activos del menú de perfil.
   */
  private _closeMenu(): void {
    this.menuTriggers?.forEach((trigger: MatMenuTrigger) => trigger.closeMenu());
  }
}
