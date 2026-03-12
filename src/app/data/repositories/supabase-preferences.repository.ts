import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/data/config/supabase.config';
import { UserPreferencesInterface } from '@/interfaces/user-preferences.interface';
import { UserPreferencesRepositoryInterface } from '@/domain/repositories/user-preferences.repository.contract';

@Injectable({ providedIn: 'root' })
export class SupabasePreferencesRepository implements UserPreferencesRepositoryInterface {
  private readonly _supabase: SupabaseClient;
  private readonly _table = 'user_preferences';
  private readonly _bucket = 'avatars';

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
      .select('theme, language, avatar_url')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      userId,
      theme: data.theme as 'light' | 'dark',
      language: data.language as 'es' | 'en',
      avatarUrl: data.avatar_url ?? null
    };
  }

  /**
   * Guarda las preferencias del usuario en Supabase usando upsert.
   *
   * @param {UserPreferencesInterface} preferences - Preferencias a guardar
   */
  async savePreferences(preferences: UserPreferencesInterface): Promise<void> {
    const record: Record<string, unknown> = {
      user_id: preferences.userId,
      theme: preferences.theme,
      language: preferences.language
    };

    if (preferences.avatarUrl !== undefined) {
      record['avatar_url'] = preferences.avatarUrl;
    }

    const { error } = await this._supabase.from(this._table).upsert(record);

    if (error) {
      throw new Error(`Failed to save preferences: ${error.message}`);
    }
  }

  /**
   * Sube un avatar al bucket de Storage y devuelve la URL pública.
   * Sobreescribe el fichero existente del usuario si ya tenía uno.
   *
   * @param {string} userId - ID del usuario
   * @param {File} file - Fichero de imagen a subir
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const { error } = await this._supabase.storage.from(this._bucket).upload(userId, file, {
      upsert: true,
      contentType: file.type
    });

    if (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }

    const { data } = this._supabase.storage.from(this._bucket).getPublicUrl(userId);
    return data.publicUrl;
  }
}
