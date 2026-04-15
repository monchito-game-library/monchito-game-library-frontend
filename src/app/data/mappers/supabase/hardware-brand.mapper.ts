import { HardwareBrandDto, HardwareBrandInsertDto } from '@/dtos/supabase/hardware-brand.dto';
import { HardwareBrandModel } from '@/models/hardware-brand/hardware-brand.model';

/**
 * Maps a hardware_brands row to the HardwareBrandModel domain model.
 *
 * @param {HardwareBrandDto} dto - Row from the hardware_brands table
 */
export function mapHardwareBrand(dto: HardwareBrandDto): HardwareBrandModel {
  return {
    id: dto.id,
    name: dto.name
  };
}

/**
 * Maps a HardwareBrandModel to a HardwareBrandInsertDto for Supabase inserts.
 *
 * @param {Omit<HardwareBrandModel, 'id'>} model - Domain model without id
 */
export function mapHardwareBrandToInsertDto(model: Omit<HardwareBrandModel, 'id'>): HardwareBrandInsertDto {
  return {
    name: model.name
  };
}
