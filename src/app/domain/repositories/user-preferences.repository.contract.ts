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
}

export const USER_PREFERENCES_REPOSITORY = new InjectionToken<UserPreferencesRepositoryInterface>(
  'USER_PREFERENCES_REPOSITORY'
);
