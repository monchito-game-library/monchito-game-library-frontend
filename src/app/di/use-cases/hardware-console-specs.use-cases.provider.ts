import { Provider } from '@angular/core';

import { HARDWARE_CONSOLE_SPECS_USE_CASES } from '@/domain/use-cases/hardware-console-specs/hardware-console-specs.use-cases.contract';
import { HardwareConsoleSpecsUseCasesImpl } from '@/domain/use-cases/hardware-console-specs/hardware-console-specs.use-cases';

/** Binds HARDWARE_CONSOLE_SPECS_USE_CASES to HardwareConsoleSpecsUseCasesImpl. */
export const hardwareConsoleSpecsUseCasesProvider: Provider = {
  provide: HARDWARE_CONSOLE_SPECS_USE_CASES,
  useClass: HardwareConsoleSpecsUseCasesImpl
};
