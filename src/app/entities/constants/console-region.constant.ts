import { ConsoleRegionType } from '@/types/console-region.type';

/** Console region codes as constants for use in comparisons and logic. */
export const CONSOLE_REGION: Record<string, ConsoleRegionType> = {
  PAL: 'PAL',
  NTSC: 'NTSC',
  NTSC_J: 'NTSC-J'
} as const;
