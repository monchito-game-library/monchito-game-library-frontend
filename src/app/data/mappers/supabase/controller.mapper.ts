import { ControllerDto, ControllerInsertDto } from '@/dtos/supabase/controller.dto';
import { ControllerModel } from '@/models/controller/controller.model';
import { GameConditionType } from '@/types/game-condition.type';
import { ControllerCompatibilityType } from '@/types/controller-compatibility.type';

/**
 * Maps a user_controllers row to the ControllerModel domain model.
 *
 * @param {ControllerDto} dto - Row from the user_controllers table
 */
export function mapController(dto: ControllerDto): ControllerModel {
  return {
    id: dto.id,
    userId: dto.user_id,
    model: dto.model,
    edition: dto.edition,
    color: dto.color,
    compatibility: dto.compatibility as ControllerCompatibilityType,
    condition: dto.condition as GameConditionType,
    price: dto.price,
    store: dto.store,
    purchaseDate: dto.purchase_date,
    notes: dto.notes,
    createdAt: dto.created_at
  };
}

/**
 * Maps a ControllerModel to a ControllerInsertDto for Supabase inserts and updates.
 *
 * @param {string} userId - UUID del usuario autenticado
 * @param {ControllerModel} model - Domain model to persist
 */
export function mapControllerToInsertDto(userId: string, model: ControllerModel): ControllerInsertDto {
  return {
    user_id: userId,
    model: model.model,
    edition: model.edition,
    color: model.color,
    compatibility: model.compatibility,
    condition: model.condition,
    price: model.price,
    store: model.store,
    purchase_date: model.purchaseDate,
    notes: model.notes
  };
}
