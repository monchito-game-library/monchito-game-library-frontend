import { Provider } from '@angular/core';

import { HARDWARE_EDITION_USE_CASES } from '@/domain/use-cases/hardware-edition/hardware-edition.use-cases.contract';
import { HardwareEditionUseCasesImpl } from '@/domain/use-cases/hardware-edition/hardware-edition.use-cases';

/** Binds HARDWARE_EDITION_USE_CASES to HardwareEditionUseCasesImpl. */
export const hardwareEditionUseCasesProvider: Provider = {
  provide: HARDWARE_EDITION_USE_CASES,
  useClass: HardwareEditionUseCasesImpl
};
