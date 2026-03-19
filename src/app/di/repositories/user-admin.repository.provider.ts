import { Provider } from '@angular/core';

import { USER_ADMIN_REPOSITORY } from '@/domain/repositories/user-admin.repository.contract';
import { SupabaseUserAdminRepository } from '@/repositories/supabase-user-admin.repository';

/** Binds USER_ADMIN_REPOSITORY to the Supabase-backed implementation. */
export const userAdminRepositoryProvider: Provider = {
  provide: USER_ADMIN_REPOSITORY,
  useClass: SupabaseUserAdminRepository
};
