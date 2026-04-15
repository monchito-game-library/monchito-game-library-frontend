import { Provider } from '@angular/core';

import { CONTROLLER_USE_CASES } from '@/domain/use-cases/controller/controller.use-cases.contract';
import { ControllerUseCasesImpl } from '@/domain/use-cases/controller/controller.use-cases';

/** Binds CONTROLLER_USE_CASES to ControllerUseCasesImpl. */
export const controllerUseCasesProvider: Provider = {
  provide: CONTROLLER_USE_CASES,
  useClass: ControllerUseCasesImpl
};
