import { InjectionToken } from '@angular/core';
import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';

/** Contract for the user preferences repository. */
export interface UserPreferencesRepositoryContract {
  /**
   * Returns the stored preferences for a user, or null if none exist yet.
   *
   * @param {string} userId - Authenticated user ID
   */
  getPreferences(userId: string): Promise<UserPreferencesModel | null>;

  /**
   * Upserts the user's preferences.
   *
   * @param {UserPreferencesModel} preferences - Preferences to persist
   */
  savePreferences(preferences: UserPreferencesModel): Promise<void>;

  /**
   * Updates only the avatar URL without touching other preferences.
   *
   * @param {string} userId - Authenticated user ID
   * @param {string} avatarUrl - Public URL of the uploaded avatar
   */
  saveAvatarUrl(userId: string, avatarUrl: string): Promise<void>;

  /**
   * Updates only the banner URL without touching other preferences.
   *
   * @param {string} userId - Authenticated user ID
   * @param {string} bannerUrl - URL of the selected banner image
   */
  saveBannerUrl(userId: string, bannerUrl: string): Promise<void>;

  /**
   * Uploads an avatar image to storage and returns its public URL.
   *
   * @param {string} userId - Authenticated user ID
   * @param {File} file - Image file selected by the user
   */
  uploadAvatar(userId: string, file: File): Promise<string>;
}

/** InjectionToken for UserPreferencesRepositoryContract. */
export const USER_PREFERENCES_REPOSITORY = new InjectionToken<UserPreferencesRepositoryContract>(
  'USER_PREFERENCES_REPOSITORY'
);
