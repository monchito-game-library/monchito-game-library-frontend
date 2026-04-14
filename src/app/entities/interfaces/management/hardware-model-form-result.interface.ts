import { HardwareModelType } from '@/types/hardware-model.type';
import { ConsoleSpecsCategoryType } from '@/types/console-specs-category.type';
import { ConsoleSpecsMediaType } from '@/types/console-specs-media.type';

/** Specs data embedded in the model form when type is 'console'. */
export interface HardwareModelConsoleSpecsResult {
  launchYear: number;
  discontinuedYear: number | null;
  category: ConsoleSpecsCategoryType;
  media: ConsoleSpecsMediaType;
  videoResolution: string | null;
  unitsSoldMillion: number | null;
}

/** Shape emitted by the hardware model edit panel on save. */
export interface HardwareModelFormResult {
  name: string;
  type: HardwareModelType;
  generation: number | null;
  /** Populated only when type === 'console'. */
  specs: HardwareModelConsoleSpecsResult | null;
}
