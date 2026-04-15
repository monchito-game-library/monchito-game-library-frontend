import { Provider } from '@angular/core';

import { HARDWARE_MODEL_REPOSITORY } from '@/domain/repositories/hardware-model.repository.contract';
import { SupabaseHardwareModelRepository } from '@/repositories/supabase-hardware-model.repository';

/** Binds HARDWARE_MODEL_REPOSITORY to the Supabase-backed implementation. */
export const hardwareModelRepositoryProvider: Provider = {
  provide: HARDWARE_MODEL_REPOSITORY,
  useClass: SupabaseHardwareModelRepository
};
