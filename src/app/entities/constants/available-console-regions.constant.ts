import { ConsoleRegionType } from '@/types/console-region.type';

/** Available console regions, used in form selectors. */
export const availableConsoleRegions: { code: ConsoleRegionType; labelKey: string }[] = [
  { code: 'PAL', labelKey: 'consoleRegions.pal' },
  { code: 'NTSC', labelKey: 'consoleRegions.ntsc' },
  { code: 'NTSC-J', labelKey: 'consoleRegions.ntscJ' }
];
