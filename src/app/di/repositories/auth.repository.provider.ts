import { Provider } from '@angular/core';

import { AUTH_REPOSITORY } from '@/domain/repositories/auth.repository.contract';
import { SupabaseAuthRepository } from '@/repositories/supabase-auth.repository';

/** Binds AUTH_REPOSITORY to the Supabase-backed implementation. */
export const authRepositoryProvider: Provider = {
  provide: AUTH_REPOSITORY,
  useClass: SupabaseAuthRepository
};
