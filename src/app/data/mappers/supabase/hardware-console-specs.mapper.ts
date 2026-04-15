import { HardwareConsoleSpecsDto } from '@/dtos/supabase/hardware-console-specs.dto';
import { HardwareConsoleSpecsModel } from '@/models/hardware-console-specs/hardware-console-specs.model';
import { ConsoleSpecsCategoryType } from '@/types/console-specs-category.type';
import { ConsoleSpecsMediaType } from '@/types/console-specs-media.type';

/**
 * Maps a hardware_console_specs row to the HardwareConsoleSpecsModel domain model.
 *
 * @param {HardwareConsoleSpecsDto} dto - Row from the hardware_console_specs table
 */
export function mapHardwareConsoleSpecs(dto: HardwareConsoleSpecsDto): HardwareConsoleSpecsModel {
  return {
    modelId: dto.model_id,
    launchYear: dto.launch_year,
    discontinuedYear: dto.discontinued_year,
    category: dto.category as ConsoleSpecsCategoryType,
    media: dto.media as ConsoleSpecsMediaType,
    videoResolution: dto.video_resolution,
    unitsSoldMillion: dto.units_sold_million
  };
}

/**
 * Maps a HardwareConsoleSpecsModel to a HardwareConsoleSpecsUpsertDto for Supabase upserts.
 *
 * @param {HardwareConsoleSpecsModel} model - Domain model to persist
 */
export function mapHardwareConsoleSpecsToUpsertDto(model: HardwareConsoleSpecsModel): HardwareConsoleSpecsDto {
  return {
    model_id: model.modelId,
    launch_year: model.launchYear,
    discontinued_year: model.discontinuedYear,
    category: model.category,
    media: model.media,
    video_resolution: model.videoResolution,
    units_sold_million: model.unitsSoldMillion
  };
}
