import { Provider } from '@angular/core';

import { PROTECTOR_REPOSITORY } from '@/domain/repositories/protector.repository.contract';
import { SupabaseProtectorRepository } from '@/repositories/supabase-protector.repository';

/** Binds PROTECTOR_REPOSITORY to the Supabase-backed implementation. */
export const protectorRepositoryProvider: Provider = {
  provide: PROTECTOR_REPOSITORY,
  useClass: SupabaseProtectorRepository
};
