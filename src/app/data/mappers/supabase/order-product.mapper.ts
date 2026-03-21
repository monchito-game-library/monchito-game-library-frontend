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
    unitPrice: dto.unit_price,
    availablePacks: dto.available_packs ?? [],
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
    unit_price: model.unitPrice,
    available_packs: model.availablePacks,
    category: model.category,
    notes: model.notes,
    is_active: model.isActive
  };
}
