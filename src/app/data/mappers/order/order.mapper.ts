import {
  OrderDetailDto,
  OrderSummaryDto,
  OrderMemberDto,
  OrderLineDto,
  OrderLineAllocationDto,
  OrderInvitationDto,
  OrderProductDto
} from '@/dtos/supabase/order.dto';
import { OrderModel } from '@/models/order/order.model';
import { OrderSummaryModel } from '@/models/order/order-summary.model';
import { OrderMemberModel } from '@/models/order/order-member.model';
import { OrderLineModel } from '@/models/order/order-line.model';
import { OrderLineAllocationModel } from '@/models/order/order-line-allocation.model';
import { OrderInvitationModel } from '@/models/order/order-invitation.model';
import { OrderProductModel } from '@/models/order/order-product.model';

/**
 * Maps an order_line_allocations row to the OrderLineAllocationModel domain model.
 *
 * @param {OrderLineAllocationDto} dto
 */
export function mapOrderLineAllocation(dto: OrderLineAllocationDto): OrderLineAllocationModel {
  return {
    id: dto.id,
    orderLineId: dto.order_line_id,
    userId: dto.user_id,
    quantityNeeded: dto.quantity_needed,
    quantityThisOrder: dto.quantity_this_order
  };
}

/**
 * Maps an order_lines row (with joined order_products and allocations) to OrderLineModel.
 *
 * @param {OrderLineDto} dto
 */
export function mapOrderLine(dto: OrderLineDto): OrderLineModel {
  return {
    id: dto.id,
    orderId: dto.order_id,
    productId: dto.product_id,
    productName: dto.order_products.name,
    productCategory: dto.order_products.category,
    unitPrice: dto.unit_price,
    packChosen: dto.pack_chosen,
    quantityOrdered: dto.quantity_ordered,
    notes: dto.notes,
    createdAt: dto.created_at,
    allocations: (dto.order_line_allocations ?? []).map(mapOrderLineAllocation)
  };
}

/**
 * Maps an order_members row to the OrderMemberModel domain model.
 *
 * @param {OrderMemberDto} dto
 */
export function mapOrderMember(dto: OrderMemberDto): OrderMemberModel {
  return {
    id: dto.id,
    orderId: dto.order_id,
    userId: dto.user_id,
    role: dto.role,
    joinedAt: dto.joined_at
  };
}

/**
 * Maps a full orders row (with members and lines joined) to the OrderModel domain model.
 *
 * @param {OrderDetailDto} dto
 */
export function mapOrder(dto: OrderDetailDto): OrderModel {
  return {
    id: dto.id,
    ownerId: dto.owner_id,
    title: dto.title,
    status: dto.status,
    orderDate: dto.order_date,
    receivedDate: dto.received_date,
    shippingCost: dto.shipping_cost,
    paypalFee: dto.paypal_fee,
    discountAmount: dto.discount_amount,
    notes: dto.notes,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    members: (dto.order_members ?? []).map(mapOrderMember),
    lines: (dto.order_lines ?? []).map(mapOrderLine)
  };
}

/**
 * Maps a lightweight orders row (with member count) to the OrderSummaryModel domain model.
 *
 * @param {OrderSummaryDto} dto
 */
export function mapOrderSummary(dto: OrderSummaryDto): OrderSummaryModel {
  return {
    id: dto.id,
    ownerId: dto.owner_id,
    title: dto.title,
    status: dto.status,
    orderDate: dto.order_date,
    memberCount: (dto.order_members ?? []).length,
    createdAt: dto.created_at
  };
}

/**
 * Maps an order_products row to the OrderProductModel domain model.
 *
 * @param {OrderProductDto} dto
 */
export function mapOrderProduct(dto: OrderProductDto): OrderProductModel {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    origin: dto.origin
  };
}

/**
 * Maps an order_invitations row to the OrderInvitationModel domain model.
 *
 * @param {OrderInvitationDto} dto
 */
export function mapOrderInvitation(dto: OrderInvitationDto): OrderInvitationModel {
  return {
    id: dto.id,
    orderId: dto.order_id,
    token: dto.token,
    expiresAt: dto.expires_at,
    usedBy: dto.used_by,
    createdAt: dto.created_at
  };
}
