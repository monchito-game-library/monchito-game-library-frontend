import { Provider } from '@angular/core';

import { STORE_USE_CASES } from '@/domain/use-cases/store/store.use-cases.contract';
import { StoreUseCasesImpl } from '@/domain/use-cases/store/store.use-cases';

/** Binds STORE_USE_CASES to the default implementation. */
export const storeUseCasesProvider: Provider = {
  provide: STORE_USE_CASES,
  useClass: StoreUseCasesImpl
};
