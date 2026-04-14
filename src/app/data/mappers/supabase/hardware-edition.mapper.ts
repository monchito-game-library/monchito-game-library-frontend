import { HardwareEditionDto, HardwareEditionInsertDto } from '@/dtos/supabase/hardware-edition.dto';
import { HardwareEditionModel } from '@/models/hardware-edition/hardware-edition.model';

/**
 * Maps a hardware_editions row to the HardwareEditionModel domain model.
 *
 * @param {HardwareEditionDto} dto - Row from the hardware_editions table
 */
export function mapHardwareEdition(dto: HardwareEditionDto): HardwareEditionModel {
  return {
    id: dto.id,
    modelId: dto.model_id,
    name: dto.name
  };
}

/**
 * Maps a HardwareEditionModel to a HardwareEditionInsertDto for Supabase inserts.
 *
 * @param {Omit<HardwareEditionModel, 'id'>} model - Domain model without id
 */
export function mapHardwareEditionToInsertDto(model: Omit<HardwareEditionModel, 'id'>): HardwareEditionInsertDto {
  return {
    model_id: model.modelId,
    name: model.name
  };
}
