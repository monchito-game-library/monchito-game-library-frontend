import { Provider } from '@angular/core';

import { GAME_USE_CASES } from '@/domain/use-cases/game/game.use-cases.contract';
import { GameUseCasesImpl } from '@/domain/use-cases/game/game.use-cases';

/** Binds GAME_USE_CASES to the default implementation. */
export const gameUseCasesProvider: Provider = {
  provide: GAME_USE_CASES,
  useClass: GameUseCasesImpl
};
