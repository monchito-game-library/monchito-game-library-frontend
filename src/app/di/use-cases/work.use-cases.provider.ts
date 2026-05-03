import { Provider } from '@angular/core';

import { WORK_USE_CASES } from '@/domain/use-cases/work/work.use-cases.contract';
import { WorkUseCasesImpl } from '@/domain/use-cases/work/work.use-cases';

/** Binds WORK_USE_CASES to WorkUseCasesImpl. */
export const workUseCasesProvider: Provider = {
  provide: WORK_USE_CASES,
  useClass: WorkUseCasesImpl
};
