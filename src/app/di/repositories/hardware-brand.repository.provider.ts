import { Provider } from '@angular/core';

import { HARDWARE_BRAND_REPOSITORY } from '@/domain/repositories/hardware-brand.repository.contract';
import { SupabaseHardwareBrandRepository } from '@/repositories/supabase-hardware-brand.repository';

/** Binds HARDWARE_BRAND_REPOSITORY to the Supabase-backed implementation. */
export const hardwareBrandRepositoryProvider: Provider = {
  provide: HARDWARE_BRAND_REPOSITORY,
  useClass: SupabaseHardwareBrandRepository
};
