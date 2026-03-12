import { GameConditionType } from '@/types/game-condition.type';

/** Represents a game condition option (new or used) for use in form selectors. */
export interface AvailableConditionInterface {
  /** Internal condition code ('new' or 'used'). */
  code: GameConditionType;
  /** Transloco key for the human-readable label (e.g. 'gameForm.conditions.new'). */
  labelKey: string;
}
