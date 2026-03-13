import { InjectionToken } from '@angular/core';

import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';

/** Contract for the user-preferences use cases. */
export interface UserPreferencesUseCasesContract {
  /**
   * Loads the user's preferences from the repository.
   * Returns null if no preferences have been saved yet.
   *
   * @param {string} userId - Authenticated user ID
   */
  loadPreferences(userId: string): Promise<UserPreferencesModel | null>;

  /**
   * Persists the user's theme and language settings.
   *
   * @param {string} userId - Authenticated user ID
   * @param {'light' | 'dark'} theme - Selected theme
   * @param {'es' | 'en'} language - Selected language
   */
  savePreferences(userId: string, theme: 'light' | 'dark', language: 'es' | 'en'): Promise<void>;

  /**
   * Validates the file, uploads it to storage, and saves the resulting URL.
   * Throws if the file does not meet size or type restrictions.
   *
   * @param {string} userId - Authenticated user ID
   * @param {File} file - Image file selected by the user
   */
  uploadAvatar(userId: string, file: File): Promise<string>;

  /**
   * Persists the banner URL selected by the user.
   * If the previous banner was stored in Supabase Storage, deletes it from the bucket.
   *
   * @param {string} userId - Authenticated user ID
   * @param {string} bannerUrl - URL of the selected banner image
   * @param {string | null} currentBannerUrl - Current banner URL to delete if it belongs to the banners bucket
   */
  saveBannerUrl(userId: string, bannerUrl: string, currentBannerUrl: string | null): Promise<void>;

  /**
   * Validates the file, uploads it to storage, and saves the resulting banner URL.
   * Throws if the file does not meet size or type restrictions.
   *
   * @param {string} userId - Authenticated user ID
   * @param {File} file - Image file selected by the user
   */
  uploadBanner(userId: string, file: File): Promise<string>;
}

/** InjectionToken for UserPreferencesUseCasesContract. */
export const USER_PREFERENCES_USE_CASES = new InjectionToken<UserPreferencesUseCasesContract>(
  'USER_PREFERENCES_USE_CASES'
);
