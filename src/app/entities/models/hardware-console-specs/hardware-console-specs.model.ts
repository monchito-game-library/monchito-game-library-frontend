import { ConsoleSpecsCategoryType } from '@/types/console-specs-category.type';
import { ConsoleSpecsMediaType } from '@/types/console-specs-media.type';

/** Domain model for the technical specifications of a console hardware model. */
export interface HardwareConsoleSpecsModel {
  /** UUID of the parent hardware_models row. Acts as primary key (1:1). */
  modelId: string;
  /** Year the console was launched. */
  launchYear: number;
  /** Year the console was discontinued. Null if still in sale. */
  discontinuedYear: number | null;
  /** Console category: home, portable or hybrid. */
  category: ConsoleSpecsCategoryType;
  /** Primary media format. */
  media: ConsoleSpecsMediaType;
  /** Maximum video resolution (free text: '4K', '1080p', '960×544'…). Null if not applicable. */
  videoResolution: string | null;
  /** Units sold in millions. Aggregated per model family as reported by the manufacturer. Null if unknown. */
  unitsSoldMillion: number | null;
}
