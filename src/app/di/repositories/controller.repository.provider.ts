import { Provider } from '@angular/core';

import { CONTROLLER_REPOSITORY } from '@/domain/repositories/controller.repository.contract';
import { SupabaseControllerRepository } from '@/repositories/supabase-controller.repository';

/** Binds CONTROLLER_REPOSITORY to the Supabase-backed implementation. */
export const controllerRepositoryProvider: Provider = {
  provide: CONTROLLER_REPOSITORY,
  useClass: SupabaseControllerRepository
};
