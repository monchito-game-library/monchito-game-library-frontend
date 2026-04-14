import { HardwareModelDto, HardwareModelInsertDto } from '@/dtos/supabase/hardware-model.dto';
import { HardwareModelModel } from '@/models/hardware-model/hardware-model.model';
import { HardwareModelType } from '@/types/hardware-model.type';

/**
 * Maps a hardware_models row to the HardwareModelModel domain model.
 *
 * @param {HardwareModelDto} dto - Row from the hardware_models table
 */
export function mapHardwareModel(dto: HardwareModelDto): HardwareModelModel {
  return {
    id: dto.id,
    brandId: dto.brand_id,
    name: dto.name,
    type: dto.type as HardwareModelType,
    generation: dto.generation ?? null
  };
}

/**
 * Maps a HardwareModelModel to a HardwareModelInsertDto for Supabase inserts.
 *
 * @param {Omit<HardwareModelModel, 'id'>} model - Domain model without id
 */
export function mapHardwareModelToInsertDto(model: Omit<HardwareModelModel, 'id'>): HardwareModelInsertDto {
  return {
    brand_id: model.brandId,
    name: model.name,
    type: model.type,
    generation: model.generation
  };
}
