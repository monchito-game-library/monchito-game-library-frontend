import { Provider } from '@angular/core';

import { CATALOG_USE_CASES } from '@/domain/use-cases/catalog/catalog.use-cases.contract';
import { CatalogUseCasesImpl } from '@/domain/use-cases/catalog/catalog.use-cases';

/** Binds CATALOG_USE_CASES to the default implementation. */
export const catalogUseCasesProvider: Provider = {
  provide: CATALOG_USE_CASES,
  useClass: CatalogUseCasesImpl
};
