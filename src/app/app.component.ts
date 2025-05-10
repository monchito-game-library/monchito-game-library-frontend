import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormControl } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { MatChip } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { IndexedDBRepository } from './repositories/indexeddb.repository';
import { UserContextService } from './services/user-context.service';
import { ThemeService } from './services/theme.service';
import { defaultIndexedDbPath } from './models/constants/game-library.constant';
import { GameRecord } from './models/interfaces/game-record.interface';
import { availableLangConstant } from './models/constants/available-lang.constant';
import { AvailableLanguageInterface } from './models/interfaces/available-language.interface';
import { availableUsers } from './models/constants/available-users.constant';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgOptimizedImage,
    MatChip,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    MatDivider,
    TranslocoPipe
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // --- Servicios inyectados ---
  private readonly _db = inject(IndexedDBRepository);
  private readonly _router = inject(Router);
  private readonly _themeService = inject(ThemeService);
  private readonly _transloco = inject(TranslocoService);
  readonly userContext = inject(UserContextService);

  // --- Idiomas disponibles y selección ---
  readonly availableLanguages: AvailableLanguageInterface[] = availableLangConstant;
  readonly selectedLangControl = new FormControl(this._transloco.getActiveLang(), { nonNullable: true });

  // --- Tema visual reactivo (modo oscuro) ---
  readonly isDark = signal(this._themeService.isDarkMode());

  // --- Usuario actual resuelto desde userId ---
  readonly currentUser = computed(() => {
    const id = this.userContext.userId();
    return availableUsers.find((u) => u.id === id) ?? null;
  });

  constructor() {
    // Efecto que carga automáticamente los juegos por defecto al seleccionar usuario (si no tiene juegos guardados)
    effect(() => {
      const userId = this.userContext.userId();
      if (!userId || typeof window === 'undefined') return;

      this._db.getAllGamesForUser(userId).then(async (games) => {
        if (games.length === 0) {
          try {
            const response = await fetch(defaultIndexedDbPath);
            const records: GameRecord[] = await response.json();
            const userGames = records.filter((r) => r.userId === userId);

            for (const record of userGames) {
              await this._db.addGameForUser(userId, record.game);
            }
          } catch (err) {
            console.error('Error loading default games:', err);
          }
        }
      });
    });
  }

  ngOnInit(): void {
    // Inicializa tema visual
    this._themeService.initTheme();
    this.isDark.set(this._themeService.isDarkMode());

    // Reactividad a cambio de idioma
    this.selectedLangControl.valueChanges.subscribe((lang) => {
      if (lang) this._transloco.setActiveLang(lang);
    });
  }

  /**
   * Alterna entre tema oscuro y claro.
   */
  toggleTheme(): void {
    this.isDark.update((prev) => !prev);
    this.isDark() ? this._themeService.setDarkTheme() : this._themeService.setLightTheme();
  }

  /**
   * Limpia la sesión de usuario y redirige al selector.
   */
  logout(): void {
    this.userContext.clearUser();
    void this._router.navigateByUrl('/select-user');
  }
}
