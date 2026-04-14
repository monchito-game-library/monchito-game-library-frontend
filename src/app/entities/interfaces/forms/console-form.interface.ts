import { FormControl } from '@angular/forms';

import { ConsoleRegionType } from '@/types/console-region.type';
import { GameConditionType } from '@/types/game-condition.type';

export interface ConsoleFormValue {
  brandId: string | null;
  modelId: string | null;
  editionId: string | null;
  region: ConsoleRegionType | null;
  condition: GameConditionType;
  price: number | null;
  store: string | null;
  purchaseDate: string | null;
  notes: string | null;
}

export interface ConsoleForm {
  brandId: FormControl<string | null>;
  modelId: FormControl<string | null>;
  editionId: FormControl<string | null>;
  region: FormControl<ConsoleRegionType | null>;
  condition: FormControl<GameConditionType>;
  price: FormControl<number | null>;
  store: FormControl<string | null>;
  purchaseDate: FormControl<string | null>;
  notes: FormControl<string | null>;
}
