import { Provider } from '@angular/core';

import { HARDWARE_CONSOLE_SPECS_REPOSITORY } from '@/domain/repositories/hardware-console-specs.repository.contract';
import { SupabaseHardwareConsoleSpecsRepository } from '@/repositories/supabase-hardware-console-specs.repository';

/** Binds HARDWARE_CONSOLE_SPECS_REPOSITORY to the Supabase-backed implementation. */
export const hardwareConsoleSpecsRepositoryProvider: Provider = {
  provide: HARDWARE_CONSOLE_SPECS_REPOSITORY,
  useClass: SupabaseHardwareConsoleSpecsRepository
};
