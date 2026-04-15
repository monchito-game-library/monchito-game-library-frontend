import { Provider } from '@angular/core';

import { HARDWARE_MODEL_USE_CASES } from '@/domain/use-cases/hardware-model/hardware-model.use-cases.contract';
import { HardwareModelUseCasesImpl } from '@/domain/use-cases/hardware-model/hardware-model.use-cases';

/** Binds HARDWARE_MODEL_USE_CASES to HardwareModelUseCasesImpl. */
export const hardwareModelUseCasesProvider: Provider = {
  provide: HARDWARE_MODEL_USE_CASES,
  useClass: HardwareModelUseCasesImpl
};
