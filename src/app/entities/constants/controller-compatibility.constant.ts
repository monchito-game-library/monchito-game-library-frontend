import { ControllerCompatibilityType } from '@/types/controller-compatibility.type';

/** Controller compatibility codes as constants for use in comparisons and logic. */
export const CONTROLLER_COMPATIBILITY: Record<string, ControllerCompatibilityType> = {
  PS5: 'PS5',
  PS4: 'PS4',
  PS3: 'PS3',
  XBOX: 'Xbox',
  PC: 'PC',
  SWITCH: 'Switch',
  UNIVERSAL: 'Universal'
} as const;
