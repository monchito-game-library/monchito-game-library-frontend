import { Provider } from '@angular/core';

import { GAME_REPOSITORY } from '@/domain/repositories/game.repository.contract';
import { SupabaseRepository } from '@/repositories/supabase.repository';

/** Binds GAME_REPOSITORY to the Supabase-backed implementation. */
export const gameRepositoryProvider: Provider = {
  provide: GAME_REPOSITORY,
  useClass: SupabaseRepository
};
