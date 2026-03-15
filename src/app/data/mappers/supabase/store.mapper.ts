import { StoreDto, StoreInsertDto } from '@/dtos/supabase/store.dto';
import { StoreModel } from '@/models/store/store.model';
import { GameFormatType } from '@/types/game-format.type';

/**
 * Maps a stores table row to the StoreModel domain model.
 *
 * @param {StoreDto} dto
 */
export function mapStore(dto: StoreDto): StoreModel {
  return {
    id: dto.id,
    code: dto.code,
    label: dto.label,
    formatHint: (dto.format_hint as GameFormatType) ?? null,
    isSystem: dto.is_system
  };
}

/**
 * Maps a StoreModel to a StoreInsertDto for Supabase inserts/updates.
 *
 * @param {Omit<StoreModel, 'id'>} model
 */
export function mapStoreToInsertDto(model: Omit<StoreModel, 'id'>): StoreInsertDto {
  return {
    code: model.code,
    label: model.label,
    format_hint: model.formatHint,
    is_system: model.isSystem
  };
}
