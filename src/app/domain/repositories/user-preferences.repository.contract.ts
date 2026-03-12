import { InjectionToken } from '@angular/core';
import { UserPreferencesInterface } from '@/interfaces/user-preferences.interface';

export interface UserPreferencesRepositoryInterface {
  /**
   * Obtiene las preferencias del usuario. Devuelve null si no existen aún.
   *
   * @param {string} userId - ID del usuario
   */
  getPreferences(userId: string): Promise<UserPreferencesInterface | null>;

  /**
   * Guarda (upsert) las preferencias del usuario.
   *
   * @param {UserPreferencesInterface} preferences - Preferencias a guardar
   */
  savePreferences(preferences: UserPreferencesInterface): Promise<void>;

  /**
   * Sube un avatar al bucket de Storage y devuelve la URL pública.
   *
   * @param {string} userId - ID del usuario
   * @param {File} file - Fichero de imagen a subir
   */
  uploadAvatar(userId: string, file: File): Promise<string>;
}

export const USER_PREFERENCES_REPOSITORY = new InjectionToken<UserPreferencesRepositoryInterface>(
  'USER_PREFERENCES_REPOSITORY'
);
