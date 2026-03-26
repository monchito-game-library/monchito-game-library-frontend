import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';
import {
  USER_PREFERENCES_USE_CASES,
  UserPreferencesUseCasesContract
} from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { ThemeService } from './theme.service';
import { UserPreferencesService } from './user-preferences.service';

/**
 * Handles application-level initialisation of user preferences.
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
    const prefs: UserPreferencesModel | null = await this._userPreferencesUseCases.loadPreferences(userId);
    if (!prefs) {
      this._userPreferencesState.preferencesLoaded.set(true);
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
    this._userPreferencesState.preferencesLoaded.set(true);
  }
}
