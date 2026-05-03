import { Provider } from '@angular/core';

import { WORK_REPOSITORY } from '@/domain/repositories/work.repository.contract';
import { SupabaseWorkRepository } from '@/repositories/supabase-work.repository';

/** Binds WORK_REPOSITORY to the Supabase-backed implementation. */
export const workRepositoryProvider: Provider = {
  provide: WORK_REPOSITORY,
  useClass: SupabaseWorkRepository
};
