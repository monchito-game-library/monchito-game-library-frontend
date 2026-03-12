import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/data/config/supabase.config';
import { UserPreferencesInterface } from '@/interfaces/user-preferences.interface';
import { UserPreferencesRepositoryInterface } from '@/domain/repositories/user-preferences.repository.contract';

@Injectable({ providedIn: 'root' })
export class SupabasePreferencesRepository implements UserPreferencesRepositoryInterface {
  private readonly _supabase: SupabaseClient;
  private readonly _table = 'user_preferences';

  constructor() {
    this._supabase = getSupabaseClient();
  }

  /**
   * Obtiene las preferencias del usuario desde Supabase.
   * Devuelve null si el usuario no tiene preferencias guardadas todavía.
   *
   * @param {string} userId - ID del usuario
   */
  async getPreferences(userId: string): Promise<UserPreferencesInterface | null> {
    const { data, error } = await this._supabase
      .from(this._table)
      .select('theme, language')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      userId,
      theme: data.theme as 'light' | 'dark',
      language: data.language as 'es' | 'en'
    };
  }

  /**
   * Guarda las preferencias del usuario en Supabase usando upsert.
   *
   * @param {UserPreferencesInterface} preferences - Preferencias a guardar
   */
  async savePreferences(preferences: UserPreferencesInterface): Promise<void> {
    const { error } = await this._supabase.from(this._table).upsert({
      user_id: preferences.userId,
      theme: preferences.theme,
      language: preferences.language
    });

    if (error) {
      throw new Error(`Failed to save preferences: ${error.message}`);
    }
  }
}
