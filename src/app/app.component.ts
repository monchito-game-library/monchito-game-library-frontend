import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatDivider } from '@angular/material/divider';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { UserContextService } from '@/services/user-context.service';
import { ThemeService } from '@/services/theme.service';
import { UserPreferencesService } from '@/services/user-preferences.service';
import {
  USER_PREFERENCES_USE_CASES,
  UserPreferencesUseCasesContract
} from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { availableLangConstant } from '@/constants/available-lang.constant';
import { AvailableLanguageInterface } from '@/interfaces/available-language.interface';
import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';

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
  imports: [
    RouterOutlet,
    RouterLink,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatDivider,
    MatSlideToggle,
    TranslocoPipe,
    MatProgressSpinner,
    MatTooltip
  ]
})
export class AppComponent implements OnInit {
  // --- Servicios inyectados ---
  private readonly _router: Router = inject(Router);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);
  private readonly _userPreferencesUseCases: UserPreferencesUseCasesContract = inject(USER_PREFERENCES_USE_CASES);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  readonly userContext: UserContextService = inject(UserContextService);

  /** Señal reactiva con la URL del avatar actual */
  readonly avatarUrl = this._userPreferencesState.avatarUrl;

  /** Indica si se está subiendo un avatar */
  readonly uploadingAvatar = this._userPreferencesState.uploadingAvatar;

  // --- Rutas públicas donde NO se debe mostrar la navegación ---
  private readonly _publicRoutes: string[] = ['/login', '/register', '/forgot-password'];

  /** Idiomas disponibles */
  readonly availableLanguages: AvailableLanguageInterface[] = availableLangConstant;

  /** Control de selección de idioma */
  readonly selectedLangControl: FormControl<string> = new FormControl(this._transloco.getActiveLang(), {
    nonNullable: true
  });

  /** Ítems de navegación principal */
  readonly navItems: NavItem[] = [
    { icon: 'sports_esports', label: 'Colección', route: '/list' },
    { icon: 'add_circle', label: 'Añadir', route: '/add' }
  ];

  /** Modo oscuro activo */
  readonly isDark: WritableSignal<boolean> = signal(this._themeService.isDarkMode());

  /** Ruta actual */
  readonly currentRoute: WritableSignal<string> = signal('');

  constructor() {
    // Carga las preferencias de Supabase cada vez que el usuario se autentica
    effect(() => {
      const userId: string | null = this.userContext.userId();
      if (userId) void this._loadPreferences(userId);
    });
  }

  ngOnInit(): void {
    this._themeService.initTheme();
    this.isDark.set(this._themeService.isDarkMode());

    this.selectedLangControl.valueChanges.subscribe((lang: string) => {
      if (!lang) return;
      this._transloco.setActiveLang(lang);
      this._savePreferences();
    });

    this._router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });

    this.currentRoute.set(this._router.url);
  }

  /**
   * Alterna entre tema oscuro y claro.
   */
  /**
   * Alterna entre tema oscuro y claro y persiste la preferencia.
   */
  toggleTheme(): void {
    this.isDark.update((prev: boolean): boolean => !prev);
    this.isDark() ? this._themeService.setDarkTheme() : this._themeService.setLightTheme();
    this._savePreferences();
  }

  /**
   * Carga las preferencias del usuario desde Supabase y aplica tema, idioma y avatar.
   *
   * @param {string} userId - ID del usuario autenticado
   */
  private async _loadPreferences(userId: string): Promise<void> {
    const prefs: UserPreferencesModel | null = await this._userPreferencesUseCases.loadPreferences(userId);
    if (!prefs) return;

    if (prefs.theme === 'dark') {
      this.isDark.set(true);
      this._themeService.setDarkTheme();
    } else {
      this.isDark.set(false);
      this._themeService.setLightTheme();
    }

    if (prefs.language) {
      this._transloco.setActiveLang(prefs.language);
      this.selectedLangControl.setValue(prefs.language, { emitEvent: false });
    }

    if (prefs.avatarUrl) {
      this._userPreferencesState.avatarUrl.set(prefs.avatarUrl);
    }
  }

  /**
   * Persiste el tema e idioma actuales en Supabase si hay usuario autenticado.
   */
  private _savePreferences(): void {
    const userId: string | null = this.userContext.userId();
    if (!userId) return;
    const theme: 'light' | 'dark' = this.isDark() ? 'dark' : 'light';
    const language: 'es' | 'en' = this._transloco.getActiveLang() as 'es' | 'en';
    void this._userPreferencesUseCases.savePreferences(userId, theme, language);
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
   * Maneja la selección de un fichero de avatar y lo sube a Supabase Storage.
   *
   * @param {Event} event - Evento del input file
   */
  async onAvatarFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const userId = this.userContext.userId();
    if (!userId) return;

    this._userPreferencesState.uploadingAvatar.set(true);
    try {
      const url: string = await this._userPreferencesUseCases.uploadAvatar(userId, file);
      this._userPreferencesState.avatarUrl.set(url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al subir la imagen';
      this._snackBar.open(message, 'Cerrar', { duration: 4000 });
    } finally {
      this._userPreferencesState.uploadingAvatar.set(false);
      input.value = '';
    }
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
}
