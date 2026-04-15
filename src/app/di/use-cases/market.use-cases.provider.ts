import { Provider } from '@angular/core';

import { MARKET_USE_CASES } from '@/domain/use-cases/market/market.use-cases.contract';
import { MarketUseCasesImpl } from '@/domain/use-cases/market/market.use-cases';

export const marketUseCasesProvider: Provider = {
  provide: MARKET_USE_CASES,
  useClass: MarketUseCasesImpl
};
