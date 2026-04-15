import { Provider } from '@angular/core';

import { MARKET_REPOSITORY } from '@/domain/repositories/market.repository.contract';
import { SupabaseMarketRepository } from '@/data/repositories/supabase-market.repository';

export const marketRepositoryProvider: Provider = {
  provide: MARKET_REPOSITORY,
  useClass: SupabaseMarketRepository
};
