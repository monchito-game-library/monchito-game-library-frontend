import { PLATFORM } from '@/constants/platform.constant';

/** All valid gaming platforms, used in forms, filters and validations. */
export type PlatformType = (typeof PLATFORM)[keyof typeof PLATFORM];
