import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

import {
  USER_PREFERENCES_REPOSITORY,
  UserPreferencesRepositoryInterface
} from '@/domain/repositories/user-preferences.repository.contract';
import { UserPreferencesInterface } from '@/interfaces/user-preferences.interface';
import { ThemeService } from '@/services/theme.service';

/** Tamaño máximo de avatar permitido: 2 MB */
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

/** Tipos MIME aceptados para el avatar */
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly _repo: UserPreferencesRepositoryInterface = inject(USER_PREFERENCES_REPOSITORY);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** URL del avatar del usuario actual */
  readonly avatarUrl: WritableSignal<string | null> = signal(null);

  /** Indica si se está subiendo un avatar */
  readonly uploadingAvatar: WritableSignal<boolean> = signal(false);

  /**
   * Carga las preferencias del usuario desde Supabase y las aplica.
   * Si no existen preferencias guardadas, respeta el estado actual.
   *
   * @param {string} userId - ID del usuario autenticado
   */
  async load(userId: string): Promise<void> {
    const prefs: UserPreferencesInterface | null = await this._repo.getPreferences(userId);
    if (!prefs) return;

    prefs.theme === 'dark' ? this._themeService.setDarkTheme() : this._themeService.setLightTheme();
    this._transloco.setActiveLang(prefs.language);
    this.avatarUrl.set(prefs.avatarUrl ?? null);
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

  /**
   * Valida, sube el avatar a Supabase Storage y guarda la URL en user_preferences.
   * Lanza un error si el fichero no cumple las restricciones de tamaño o tipo.
   *
   * @param {string} userId - ID del usuario autenticado
   * @param {File} file - Fichero de imagen seleccionado por el usuario
   */
  async uploadAvatar(userId: string, file: File): Promise<void> {
    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error('La imagen no puede superar los 2 MB');
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      throw new Error('Formato no permitido. Usa JPG, PNG o WebP');
    }

    this.uploadingAvatar.set(true);

    try {
      const url: string = await this._repo.uploadAvatar(userId, file);
      await this._repo.savePreferences({
        userId,
        theme: this._themeService.isDarkMode() ? 'dark' : 'light',
        language: this._transloco.getActiveLang() as 'es' | 'en',
        avatarUrl: url
      });
      this.avatarUrl.set(url);
    } finally {
      this.uploadingAvatar.set(false);
    }
  }
}
