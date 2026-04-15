import { Provider } from '@angular/core';

import { HARDWARE_BRAND_USE_CASES } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases.contract';
import { HardwareBrandUseCasesImpl } from '@/domain/use-cases/hardware-brand/hardware-brand.use-cases';

/** Binds HARDWARE_BRAND_USE_CASES to HardwareBrandUseCasesImpl. */
export const hardwareBrandUseCasesProvider: Provider = {
  provide: HARDWARE_BRAND_USE_CASES,
  useClass: HardwareBrandUseCasesImpl
};
