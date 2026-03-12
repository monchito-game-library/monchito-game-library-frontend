import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { UserContextService } from '@/services/user-context.service';
import { ThemeService } from '@/services/theme.service';
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
  imports: [RouterOutlet, RouterLink, MatIcon, MatMenu, MatMenuTrigger, MatMenuItem, MatDivider, TranslocoPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // --- Servicios inyectados ---
  private readonly _router: Router = inject(Router);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  readonly userContext: UserContextService = inject(UserContextService);

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

  ngOnInit(): void {
    this._themeService.initTheme();
    this.isDark.set(this._themeService.isDarkMode());

    this.selectedLangControl.valueChanges.subscribe((lang: string) => {
      if (lang) this._transloco.setActiveLang(lang);
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
  toggleTheme(): void {
    this.isDark.update((prev: boolean): boolean => !prev);
    this.isDark() ? this._themeService.setDarkTheme() : this._themeService.setLightTheme();
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
   */
  getAvatarUrl(): string {
    return this.userContext.getAvatarUrl();
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    this.userContext.clearUser();
  }
}
