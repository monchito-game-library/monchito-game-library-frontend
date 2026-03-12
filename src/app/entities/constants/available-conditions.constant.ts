import { AvailableConditionInterface } from '@/interfaces/available-condition.interface';

/** Available game conditions used in the game form condition selector. */
export const availableConditions: AvailableConditionInterface[] = [
  { code: 'new', labelKey: 'gameForm.conditions.new' },
  { code: 'used', labelKey: 'gameForm.conditions.used' }
];
