import { ProtectorDto, ProtectorInsertDto } from '@/dtos/supabase/protector.dto';
import { ProtectorModel } from '@/models/protector/protector.model';
import { ProtectorCategory } from '@/types/protector-category.type';

/**
 * Maps an order_products table row to the ProtectorModel domain model.
 *
 * @param {ProtectorDto} dto - DTO/modelo recibido para mapear
 */
export function mapProtector(dto: ProtectorDto): ProtectorModel {
  return {
    id: dto.id,
    name: dto.name,
    packs: (dto.packs ?? []).map((p) => ({
      quantity: p.quantity,
      price: p.price,
      url: p.url ?? null
    })),
    category: dto.category as ProtectorCategory,
    notes: dto.notes,
    isActive: dto.is_active
  };
}

/**
 * Maps a ProtectorModel to a ProtectorInsertDto for Supabase inserts.
 *
 * @param {Omit<ProtectorModel, 'id'>} model - DTO/modelo recibido para mapear
 */
export function mapProtectorToInsertDto(model: Omit<ProtectorModel, 'id'>): ProtectorInsertDto {
  return {
    name: model.name,
    packs: model.packs,
    category: model.category,
    notes: model.notes,
    is_active: model.isActive
  };
}
