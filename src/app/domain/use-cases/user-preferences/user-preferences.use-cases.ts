import { inject, Injectable } from '@angular/core';

import {
  USER_PREFERENCES_REPOSITORY,
  UserPreferencesRepositoryContract
} from '@/domain/repositories/user-preferences.repository.contract';
import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';
import { UserPreferencesUseCasesContract } from './user-preferences.use-cases.contract';

/** Maximum allowed avatar file size: 2 MB. */
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

/** Maximum allowed banner file size: 5 MB. */
const MAX_BANNER_SIZE = 5 * 1024 * 1024;

/** Accepted MIME types for image uploads. */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class UserPreferencesUseCasesImpl implements UserPreferencesUseCasesContract {
  private readonly _repo: UserPreferencesRepositoryContract = inject(USER_PREFERENCES_REPOSITORY);

  /**
   * Loads the user's preferences from the repository.
   * Returns null if no preferences have been saved yet.
   *
   * @param {string} userId - Authenticated user ID
   */
  async loadPreferences(userId: string): Promise<UserPreferencesModel | null> {
    return this._repo.getPreferences(userId);
  }

  /**
   * Persists the user's theme and language settings.
   *
   * @param {string} userId - Authenticated user ID
   * @param {'light' | 'dark'} theme - Selected theme
   * @param {'es' | 'en'} language - Selected language
   */
  async savePreferences(userId: string, theme: 'light' | 'dark', language: 'es' | 'en'): Promise<void> {
    await this._repo.savePreferences({ userId, theme, language });
  }

  /**
   * Validates the file, uploads it to storage, and saves the resulting URL.
   * Throws if the file exceeds 2 MB or has an unsupported MIME type.
   *
   * @param {string} userId - Authenticated user ID
   * @param {File} file - Image file selected by the user
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error('Image must not exceed 2 MB');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Unsupported format. Use JPG, PNG or WebP');
    }

    const url: string = await this._repo.uploadAvatar(userId, file);
    await this._repo.saveAvatarUrl(userId, url);
    return url;
  }

  /**
   * Persists the banner URL selected by the user.
   * If the previous banner was uploaded to Supabase Storage (banners bucket), deletes the file.
   *
   * @param {string} userId - Authenticated user ID
   * @param {string} bannerUrl - URL of the selected banner image
   * @param {string | null} currentBannerUrl - Current banner URL, checked against the banners bucket path
   */
  async saveBannerUrl(userId: string, bannerUrl: string, currentBannerUrl: string | null): Promise<void> {
    if (currentBannerUrl?.includes('/object/public/banners/')) {
      await this._repo.deleteBanner(userId).catch(() => undefined);
    }
    await this._repo.saveBannerUrl(userId, bannerUrl);
  }

  /**
   * Validates the file, uploads it to the banners bucket, and saves the resulting URL.
   * Throws if the file exceeds 5 MB or has an unsupported MIME type.
   *
   * @param {string} userId - Authenticated user ID
   * @param {File} file - Image file selected by the user
   */
  async uploadBanner(userId: string, file: File): Promise<string> {
    if (file.size > MAX_BANNER_SIZE) {
      throw new Error('Image must not exceed 5 MB');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Unsupported format. Use JPG, PNG or WebP');
    }

    const url: string = await this._repo.uploadBanner(userId, file);
    await this._repo.saveBannerUrl(userId, url);
    return url;
  }
}
