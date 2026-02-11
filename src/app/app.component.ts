import { Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { GAME_REPOSITORY } from './tokens/game-repository.token';
import { GameRepositoryInterface } from './models/interfaces/game-repository.interface';
import { UserContextService } from './services/user-context.service';
import { ThemeService } from './services/theme.service';
import { defaultIndexedDbPath } from './models/constants/game-library.constant';
import { GameRecord } from './models/interfaces/game-record.interface';
import { availableLangConstant } from './models/constants/available-lang.constant';
import { AvailableLanguageInterface } from './models/interfaces/available-language.interface';
import { availableUsers } from './models/constants/available-users.constant';
import { AvailableUserInterface } from './models/interfaces/available-user.interface';
import { GameInterface } from './models/interfaces/game.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatChip, MatIcon, MatMenu, MatMenuTrigger, MatMenuItem, MatDivider, TranslocoPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // --- Servicios inyectados ---
  private readonly _db: GameRepositoryInterface = inject(GAME_REPOSITORY);
  private readonly _router: Router = inject(Router);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  readonly userContext: UserContextService = inject(UserContextService);

  // --- Idiomas disponibles y selección ---
  readonly availableLanguages: AvailableLanguageInterface[] = availableLangConstant;
  readonly selectedLangControl: FormControl<string> = new FormControl(this._transloco.getActiveLang(), {
    nonNullable: true
  });

  // --- Tema visual reactivo (modo oscuro) ---
  readonly isDark: WritableSignal<boolean> = signal(this._themeService.isDarkMode());

  // --- Ruta actual ---
  readonly currentRoute: WritableSignal<string> = signal('');

  // --- Rutas públicas donde NO se debe mostrar el header ---
  private readonly publicRoutes: string[] = ['/login', '/register', '/forgot-password'];

  // --- Usuario autenticado (deprecado currentUser para compatibilidad) ---
  readonly currentUser: Signal<AvailableUserInterface | null> = computed((): AvailableUserInterface | null => {
    // Mantenido para compatibilidad pero ya no usado
    return null;
  });

  constructor() {
    // Carga automática de juegos por defecto DESACTIVADA para usar Supabase
    // Si quieres volver a activarla, descomenta el código siguiente:
    /*
    effect(() => {
      const userId: string | null = this.userContext.userId();
      if (!userId || typeof window === 'undefined') return;

      this._db.getAllGamesForUser(userId).then(async (games: GameInterface[]) => {
        if (games.length === 0) {
          try {
            const response: Response = await fetch(defaultIndexedDbPath);
            const records: GameRecord[] = await response.json();
            const userGames: GameRecord[] = records.filter((r: GameRecord): boolean => r.userId === userId);

            for (const record of userGames) {
              await this._db.addGameForUser(userId, record.game);
            }
          } catch (err) {
            console.error('Error loading default games:', err);
          }
        }
      });
    });
    */
  }

  ngOnInit(): void {
    // Inicializa tema visual
    this._themeService.initTheme();
    this.isDark.set(this._themeService.isDarkMode());

    // Reactividad a cambio de idioma
    this.selectedLangControl.valueChanges.subscribe((lang: string) => {
      if (lang) this._transloco.setActiveLang(lang);
    });

    // Escuchar cambios de ruta
    this._router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });

    // Establecer ruta inicial
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
   * Verifica si hay un usuario autenticado Y no estamos en una ruta pública
   */
  isAuthenticated(): boolean {
    const isUserAuthenticated = this.userContext.isUserSelected();
    const isPublicRoute = this.publicRoutes.some((route) => this.currentRoute().startsWith(route));
    return isUserAuthenticated && !isPublicRoute;
  }

  /**
   * Obtiene el nombre para mostrar del usuario autenticado
   */
  getDisplayName(): string {
    return this.userContext.getDisplayName();
  }

  /**
   * Obtiene la URL del avatar del usuario
   */
  getAvatarUrl(): string {
    return this.userContext.getAvatarUrl();
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.userContext.clearUser();
  }
}
