import { FormControl } from '@angular/forms';

import { ConsoleRegionType } from '@/types/console-region.type';
import { GameConditionType } from '@/types/game-condition.type';

export interface ConsoleFormValue {
  brand: string | null;
  model: string | null;
  edition: string | null;
  region: ConsoleRegionType | null;
  condition: GameConditionType;
  price: number | null;
  store: string | null;
  purchaseDate: string | null;
  notes: string | null;
}

export interface ConsoleForm {
  brand: FormControl<string | null>;
  model: FormControl<string | null>;
  edition: FormControl<string | null>;
  region: FormControl<ConsoleRegionType | null>;
  condition: FormControl<GameConditionType>;
  price: FormControl<number | null>;
  store: FormControl<string | null>;
  purchaseDate: FormControl<string | null>;
  notes: FormControl<string | null>;
}
