import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';
import {
  USER_PREFERENCES_USE_CASES,
  UserPreferencesUseCasesContract
} from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { ThemeService } from '@/services/theme/theme.service';
import { UserPreferencesService } from '@/services/user-preferences/user-preferences.service';

/**
 * Handles application-level initialization of user preferences.
 * Loads preferences from Supabase and applies theme, language, avatar and banner to the app state.
 */
@Injectable({ providedIn: 'root' })
export class UserPreferencesInitService {
  private readonly _userPreferencesUseCases: UserPreferencesUseCasesContract = inject(USER_PREFERENCES_USE_CASES);
  private readonly _themeService: ThemeService = inject(ThemeService);
  private readonly _transloco: TranslocoService = inject(TranslocoService);
  private readonly _userPreferencesState: UserPreferencesService = inject(UserPreferencesService);

  /**
   * Loads user preferences from Supabase and applies theme, language, avatar and banner.
   * Sets preferencesLoaded to true when done, even if no preferences exist yet.
   *
   * @param {string} userId - Authenticated user ID
   */
  async loadPreferences(userId: string): Promise<void> {
    try {
      let prefs: UserPreferencesModel | null = await this._userPreferencesUseCases.loadPreferences(userId);

      if (!prefs) {
        // First sign-in via OAuth — no user_preferences record yet. Create defaults so
        // the app works correctly immediately and settings are persisted from this session on.
        await this._userPreferencesUseCases.savePreferences(userId, 'light', 'es');
        return;
      }

      if (prefs.theme === 'dark') {
        this._themeService.setDarkTheme();
      } else {
        this._themeService.setLightTheme();
      }

      if (prefs.language) {
        this._transloco.setActiveLang(prefs.language);
      }

      if (prefs.avatarUrl) {
        this._userPreferencesState.avatarUrl.set(prefs.avatarUrl);
      }

      if (prefs.bannerUrl) {
        this._userPreferencesState.bannerImageUrl.set(prefs.bannerUrl);
      }

      this._userPreferencesState.role.set(prefs.role);
    } catch {
      // If loading fails, continue with app defaults — preferencesLoaded must still be set to true
      // so that guards (admin.guard) don't block indefinitely waiting for this signal.
    } finally {
      this._userPreferencesState.preferencesLoaded.set(true);
    }
  }
}
