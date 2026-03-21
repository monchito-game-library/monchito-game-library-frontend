import { OrderProductDto, OrderProductInsertDto } from '@/dtos/supabase/order-product.dto';
import { OrderProductModel } from '@/models/order-product/order-product.model';
import { OrderProductCategory } from '@/types/order-product-category.type';

/**
 * Maps an order_products table row to the OrderProductModel domain model.
 *
 * @param {OrderProductDto} dto
 */
export function mapOrderProduct(dto: OrderProductDto): OrderProductModel {
  return {
    id: dto.id,
    name: dto.name,
    packs: (dto.packs ?? []).map((p) => ({
      quantity: p.quantity,
      price: p.price,
      url: p.url ?? null
    })),
    category: dto.category as OrderProductCategory,
    notes: dto.notes,
    isActive: dto.is_active
  };
}

/**
 * Maps an OrderProductModel to an OrderProductInsertDto for Supabase inserts.
 *
 * @param {Omit<OrderProductModel, 'id'>} model
 */
export function mapOrderProductToInsertDto(model: Omit<OrderProductModel, 'id'>): OrderProductInsertDto {
  return {
    name: model.name,
    packs: model.packs,
    category: model.category,
    notes: model.notes,
    is_active: model.isActive
  };
}
