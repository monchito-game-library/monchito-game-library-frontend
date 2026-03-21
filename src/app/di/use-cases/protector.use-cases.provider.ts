import { Provider } from '@angular/core';

import { PROTECTOR_USE_CASES } from '@/domain/use-cases/protector/protector.use-cases.contract';
import { ProtectorUseCasesImpl } from '@/domain/use-cases/protector/protector.use-cases';

/** Binds PROTECTOR_USE_CASES to the default implementation. */
export const protectorUseCasesProvider: Provider = {
  provide: PROTECTOR_USE_CASES,
  useClass: ProtectorUseCasesImpl
};
