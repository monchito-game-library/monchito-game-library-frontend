import { Provider } from '@angular/core';

import { RAWG_REPOSITORY } from '@/domain/repositories/rawg.repository.contract';
import { RawgRepository } from '@/repositories/rawg.repository';

/** Binds RAWG_REPOSITORY to the HTTP-backed RAWG API implementation. */
export const rawgRepositoryProvider: Provider = {
  provide: RAWG_REPOSITORY,
  useClass: RawgRepository
};
