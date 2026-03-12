import { Provider } from '@angular/core';

import { USER_PREFERENCES_USE_CASES } from '@/domain/use-cases/user-preferences/user-preferences.use-cases.contract';
import { UserPreferencesUseCasesImpl } from '@/domain/use-cases/user-preferences/user-preferences.use-cases';

/** Binds USER_PREFERENCES_USE_CASES to the default implementation. */
export const userPreferencesUseCasesProvider: Provider = {
  provide: USER_PREFERENCES_USE_CASES,
  useClass: UserPreferencesUseCasesImpl
};
