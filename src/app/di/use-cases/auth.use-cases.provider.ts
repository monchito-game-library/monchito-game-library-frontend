import { Provider } from '@angular/core';

import { AUTH_USE_CASES } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { AuthUseCasesImpl } from '@/domain/use-cases/auth/auth.use-cases';

/** Binds AUTH_USE_CASES to the default implementation. */
export const authUseCasesProvider: Provider = {
  provide: AUTH_USE_CASES,
  useClass: AuthUseCasesImpl
};
