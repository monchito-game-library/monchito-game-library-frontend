import { FormControl } from '@angular/forms';

import { ControllerCompatibilityType } from '@/types/controller-compatibility.type';
import { GameConditionType } from '@/types/game-condition.type';

export interface ControllerFormValue {
  brandId: string | null;
  modelId: string | null;
  editionId: string | null;
  color: string;
  compatibility: ControllerCompatibilityType;
  condition: GameConditionType;
  price: number | null;
  store: string | null;
  purchaseDate: Date | null;
  notes: string | null;
}

export interface ControllerForm {
  brandId: FormControl<string | null>;
  modelId: FormControl<string | null>;
  editionId: FormControl<string | null>;
  color: FormControl<string>;
  compatibility: FormControl<ControllerCompatibilityType>;
  condition: FormControl<GameConditionType>;
  price: FormControl<number | null>;
  store: FormControl<string | null>;
  purchaseDate: FormControl<Date | null>;
  notes: FormControl<string | null>;
}
