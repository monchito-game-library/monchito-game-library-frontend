import { ConsoleDto, ConsoleInsertDto } from '@/dtos/supabase/console.dto';
import { ConsoleModel } from '@/models/console/console.model';
import { GameConditionType } from '@/types/game-condition.type';
import { ConsoleRegionType } from '@/types/console-region.type';

/**
 * Maps a user_consoles row to the ConsoleModel domain model.
 *
 * @param {ConsoleDto} dto - Row from the user_consoles table
 */
export function mapConsole(dto: ConsoleDto): ConsoleModel {
  return {
    id: dto.id,
    userId: dto.user_id,
    brand: dto.brand,
    model: dto.model,
    region: (dto.region as ConsoleRegionType) ?? null,
    condition: dto.condition as GameConditionType,
    price: dto.price,
    store: dto.store,
    purchaseDate: dto.purchase_date,
    notes: dto.notes,
    createdAt: dto.created_at
  };
}

/**
 * Maps a ConsoleModel to a ConsoleInsertDto for Supabase inserts and updates.
 *
 * @param {string} userId - UUID del usuario autenticado
 * @param {ConsoleModel} model - Domain model to persist
 */
export function mapConsoleToInsertDto(userId: string, model: ConsoleModel): ConsoleInsertDto {
  return {
    user_id: userId,
    brand: model.brand,
    model: model.model,
    region: model.region,
    condition: model.condition,
    price: model.price,
    store: model.store,
    purchase_date: model.purchaseDate,
    notes: model.notes
  };
}
