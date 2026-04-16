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
    brandId: dto.brand_id,
    modelId: dto.model_id,
    editionId: dto.edition_id ?? null,
    color: dto.color,
    compatibility: dto.compatibility as ControllerCompatibilityType,
    condition: dto.condition as GameConditionType,
    price: dto.price,
    store: dto.store,
    purchaseDate: dto.purchase_date,
    notes: dto.notes,
    createdAt: dto.created_at,
    forSale: dto.for_sale ?? false,
    salePrice: dto.sale_price ?? null,
    soldAt: dto.sold_at ?? null,
    soldPriceFinal: dto.sold_price_final ?? null,
    activeLoanId: dto.active_loan_id ?? null,
    activeLoanTo: dto.active_loan_to ?? null,
    activeLoanAt: dto.active_loan_at ?? null
  };
}

/**
 * Maps a ControllerModel to a ControllerInsertDto for Supabase inserts and updates.
 *
 * @param {string} userId - UUID of the authenticated user
 * @param {ControllerModel} model - Domain model to persist
 */
export function mapControllerToInsertDto(userId: string, model: ControllerModel): ControllerInsertDto {
  return {
    user_id: userId,
    brand_id: model.brandId,
    model_id: model.modelId,
    edition_id: model.editionId,
    color: model.color,
    compatibility: model.compatibility,
    condition: model.condition,
    price: model.price,
    store: model.store,
    purchase_date: model.purchaseDate,
    notes: model.notes
  };
}
