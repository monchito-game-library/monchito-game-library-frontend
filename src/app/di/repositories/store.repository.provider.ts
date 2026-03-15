import { Provider } from '@angular/core';

import { STORE_REPOSITORY } from '@/domain/repositories/store.repository.contract';
import { SupabaseStoreRepository } from '@/repositories/supabase-store.repository';

/** Binds STORE_REPOSITORY to the Supabase-backed implementation. */
export const storeRepositoryProvider: Provider = {
  provide: STORE_REPOSITORY,
  useClass: SupabaseStoreRepository
};
