import { PlatformType } from '@/types/platform.type';

/** Represents a gaming platform available for selection or filtering in forms. */
export interface AvailablePlatformInterface {
  /** Platform code (e.g. 'PS5', 'XBOX-SERIES'). */
  code: PlatformType;
  /** Transloco key for the human-readable platform name. */
  labelKey: string;
}
