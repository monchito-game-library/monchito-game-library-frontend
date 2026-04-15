import { Provider } from '@angular/core';

import { CONSOLE_USE_CASES } from '@/domain/use-cases/console/console.use-cases.contract';
import { ConsoleUseCasesImpl } from '@/domain/use-cases/console/console.use-cases';

/** Binds CONSOLE_USE_CASES to ConsoleUseCasesImpl. */
export const consoleUseCasesProvider: Provider = {
  provide: CONSOLE_USE_CASES,
  useClass: ConsoleUseCasesImpl
};
