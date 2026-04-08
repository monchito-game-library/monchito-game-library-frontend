import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';
import { UserPreferencesRepositoryContract } from '@/domain/repositories/user-preferences.repository.contract';
import { UserPreferencesDto } from '@/dtos/supabase/user-preferences.dto';
import { mapUserPreferences, mapUserPreferencesToInsertDto } from '@/mappers/supabase/user-preferences.mapper';

@Injectable({ providedIn: 'root' })
export class SupabasePreferencesRepository implements UserPreferencesRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly _table = 'user_preferences';
  private readonly _bucket = 'avatars';
  private readonly _bannerBucket = 'banners';

  /**
   * Fetches the stored preferences for a user. Returns null if none exist yet.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getPreferences(userId: string): Promise<UserPreferencesModel | null> {
    const { data, error } = await this._supabase
      .from(this._table)
      .select('theme, language, avatar_url, banner_url, role')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return mapUserPreferences(data as UserPreferencesDto, userId);
  }

  /**
   * Upserts theme and language preferences for a user.
   *
   * @param {UserPreferencesModel} preferences - Preferencias del usuario a guardar
   */
  async savePreferences(preferences: UserPreferencesModel): Promise<void> {
    const { error } = await this._supabase.from(this._table).upsert(mapUserPreferencesToInsertDto(preferences));
    if (error) throw new Error(`Failed to save preferences: ${error.message}`);
  }

  /**
   * Upserts only the avatar URL without touching other preference fields.
   *
   * @param {string} userId
   * @param {string} avatarUrl - Public URL of the uploaded avatar.
   */
  async saveAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
    const { error } = await this._supabase.from(this._table).upsert({ user_id: userId, avatar_url: avatarUrl });

    if (error) throw new Error(`Failed to save avatar URL: ${error.message}`);
  }

  /**
   * Upserts only the banner URL without touching other preference fields.
   *
   * @param {string} userId
   * @param {string} bannerUrl - URL of the selected banner image.
   */
  async saveBannerUrl(userId: string, bannerUrl: string): Promise<void> {
    const { error } = await this._supabase.from(this._table).upsert({ user_id: userId, banner_url: bannerUrl });

    if (error) throw new Error(`Failed to save banner URL: ${error.message}`);
  }

  /**
   * Uploads an avatar image to the avatars bucket and returns its public URL.
   * Overwrites any existing file for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {File} file - Fichero de imagen a subir
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const { error } = await this._supabase.storage.from(this._bucket).upload(userId, file, {
      upsert: true,
      contentType: file.type
    });

    if (error) throw new Error(`Failed to upload avatar: ${error.message}`);

    const { data } = this._supabase.storage.from(this._bucket).getPublicUrl(userId);
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  /**
   * Uploads a banner image to the banners bucket and returns its public URL.
   * Overwrites any existing file for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {File} file - Fichero de imagen a subir
   */
  async uploadBanner(userId: string, file: File): Promise<string> {
    const { error } = await this._supabase.storage.from(this._bannerBucket).upload(userId, file, {
      upsert: true,
      contentType: file.type
    });

    if (error) throw new Error(`Failed to upload banner: ${error.message}`);

    const { data } = this._supabase.storage.from(this._bannerBucket).getPublicUrl(userId);
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  /**
   * Deletes the user's banner file from the banners bucket.
   * Silently ignores errors if the file does not exist.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async deleteBanner(userId: string): Promise<void> {
    await this._supabase.storage.from(this._bannerBucket).remove([userId]);
  }
}
