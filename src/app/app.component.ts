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
import { availableLangConstant } from '@/constants/available-lang.constant';
import { AvailableLanguageInterface } from '@/interfaces/available-language.interface';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-root',
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
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // --- Servicios inyectados ---
  private readonly _router: Router = inject(Router);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userPreferences: UserPreferencesService = inject(UserPreferencesService);
  private readonly _snackBar: MatSnackBar = inject(MatSnackBar);
  readonly userContext: UserContextService = inject(UserContextService);

  /** Señal reactiva con la URL del avatar actual */
  readonly avatarUrl = this._userPreferences.avatarUrl;

  /** Indica si se está subiendo un avatar */
  readonly uploadingAvatar = this._userPreferences.uploadingAvatar;

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
      if (userId) void this._userPreferences.load(userId);
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
   * Persiste el tema e idioma actuales en Supabase si hay usuario autenticado.
   */
  private _savePreferences(): void {
    const userId: string | null = this.userContext.userId();
    if (!userId) return;
    const theme: 'light' | 'dark' = this.isDark() ? 'dark' : 'light';
    const language: 'es' | 'en' = this._transloco.getActiveLang() as 'es' | 'en';
    void this._userPreferences.save(userId, theme, language);
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

    try {
      await this._userPreferences.uploadAvatar(userId, file);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al subir la imagen';
      this._snackBar.open(message, 'Cerrar', { duration: 4000 });
    } finally {
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
