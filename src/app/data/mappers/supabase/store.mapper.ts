import { StoreDto, StoreInsertDto } from '@/dtos/supabase/store.dto';
import { StoreModel } from '@/models/store/store.model';
import { GameFormatType } from '@/types/game-format.type';

/**
 * Maps a stores table row to the StoreModel domain model.
 *
 * @param {StoreDto} dto - Row from the stores table
 */
export function mapStore(dto: StoreDto): StoreModel {
  return {
    id: dto.id,
    label: dto.label,
    formatHint: (dto.format_hint as GameFormatType) ?? null
  };
}

/**
 * Maps a StoreModel and creator UUID to a StoreInsertDto for Supabase inserts.
 *
 * @param {Omit<StoreModel, 'id'>} model - Store model to map
 * @param {string} createdBy - UUID of the user creating the store
 */
export function mapStoreToInsertDto(model: Omit<StoreModel, 'id'>, createdBy: string): StoreInsertDto {
  return {
    label: model.label,
    format_hint: model.formatHint,
    created_by: createdBy
  };
}
