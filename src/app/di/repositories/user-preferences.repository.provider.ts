import { Provider } from '@angular/core';

import { USER_PREFERENCES_REPOSITORY } from '@/domain/repositories/user-preferences.repository.contract';
import { SupabasePreferencesRepository } from '@/repositories/supabase-preferences.repository';

/** Binds USER_PREFERENCES_REPOSITORY to the Supabase-backed implementation. */
export const userPreferencesRepositoryProvider: Provider = {
  provide: USER_PREFERENCES_REPOSITORY,
  useClass: SupabasePreferencesRepository
};
