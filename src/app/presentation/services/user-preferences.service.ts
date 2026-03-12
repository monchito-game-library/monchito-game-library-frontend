import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

import {
  USER_PREFERENCES_REPOSITORY,
  UserPreferencesRepositoryInterface
} from '@/domain/repositories/user-preferences.repository.contract';
import { UserPreferencesInterface } from '@/interfaces/user-preferences.interface';
import { ThemeService } from '@/services/theme.service';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly _repo: UserPreferencesRepositoryInterface = inject(USER_PREFERENCES_REPOSITORY);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /**
   * Carga las preferencias del usuario desde Supabase y las aplica.
   * Si no existen preferencias guardadas, respeta el estado actual (localStorage / sistema).
   *
   * @param {string} userId - ID del usuario autenticado
   */
  async load(userId: string): Promise<void> {
    const prefs: UserPreferencesInterface | null = await this._repo.getPreferences(userId);
    if (!prefs) return;

    prefs.theme === 'dark' ? this._themeService.setDarkTheme() : this._themeService.setLightTheme();
    this._transloco.setActiveLang(prefs.language);
  }

  /**
   * Guarda las preferencias actuales del usuario en Supabase.
   *
   * @param {string} userId - ID del usuario autenticado
   * @param {'light' | 'dark'} theme - Tema actual
   * @param {'es' | 'en'} language - Idioma actual
   */
  async save(userId: string, theme: 'light' | 'dark', language: 'es' | 'en'): Promise<void> {
    await this._repo.savePreferences({ userId, theme, language });
  }
}
