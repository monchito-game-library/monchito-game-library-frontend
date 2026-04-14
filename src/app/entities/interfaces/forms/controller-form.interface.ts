import { FormControl } from '@angular/forms';

import { ControllerCompatibilityType } from '@/types/controller-compatibility.type';
import { GameConditionType } from '@/types/game-condition.type';

export interface ControllerFormValue {
  model: string | null;
  edition: string | null;
  color: string;
  compatibility: ControllerCompatibilityType;
  condition: GameConditionType;
  price: number | null;
  store: string | null;
  purchaseDate: string | null;
  notes: string | null;
}

export interface ControllerForm {
  model: FormControl<string | null>;
  edition: FormControl<string | null>;
  color: FormControl<string>;
  compatibility: FormControl<ControllerCompatibilityType>;
  condition: FormControl<GameConditionType>;
  price: FormControl<number | null>;
  store: FormControl<string | null>;
  purchaseDate: FormControl<string | null>;
  notes: FormControl<string | null>;
}
