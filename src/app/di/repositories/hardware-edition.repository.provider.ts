import { Provider } from '@angular/core';

import { HARDWARE_EDITION_REPOSITORY } from '@/domain/repositories/hardware-edition.repository.contract';
import { SupabaseHardwareEditionRepository } from '@/repositories/supabase-hardware-edition.repository';

/** Binds HARDWARE_EDITION_REPOSITORY to the Supabase-backed implementation. */
export const hardwareEditionRepositoryProvider: Provider = {
  provide: HARDWARE_EDITION_REPOSITORY,
  useClass: SupabaseHardwareEditionRepository
};
