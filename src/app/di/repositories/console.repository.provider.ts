import { Provider } from '@angular/core';

import { CONSOLE_REPOSITORY } from '@/domain/repositories/console.repository.contract';
import { SupabaseConsoleRepository } from '@/repositories/supabase-console.repository';

/** Binds CONSOLE_REPOSITORY to the Supabase-backed implementation. */
export const consoleRepositoryProvider: Provider = {
  provide: CONSOLE_REPOSITORY,
  useClass: SupabaseConsoleRepository
};
