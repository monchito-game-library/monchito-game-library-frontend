import { CONSOLE_REGION } from '@/constants/console-region.constant';

/** Geographic region of a console unit. */
export type ConsoleRegionType = (typeof CONSOLE_REGION)[keyof typeof CONSOLE_REGION];
