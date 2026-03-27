/** Row from the orders table. */
export interface OrderDto {
  id: string;
  owner_id: string;
  title: string | null;
  status: 'draft' | 'ordered' | 'shipped' | 'received';
  order_date: string | null;
  received_date: string | null;
  shipping_cost: number | null;
  paypal_fee: number | null;
  discount_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Row from the order_members table. */
export interface OrderMemberDto {
  id: string;
  order_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}

/** Row from the order_line_allocations table. */
export interface OrderLineAllocationDto {
  id: string;
  order_line_id: string;
  user_id: string;
  quantity_needed: number;
  quantity_this_order: number;
}

/** Row from the order_lines table, with order_products and allocations joined. */
export interface OrderLineDto {
  id: string;
  order_id: string;
  product_id: string;
  unit_price: number;
  pack_chosen: number | null;
  quantity_ordered: number | null;
  notes: string | null;
  created_at: string;
  order_products: { name: string; category: string };
  order_line_allocations: OrderLineAllocationDto[];
}

/** Full order row with members and lines joined — used in the detail query. */
export interface OrderDetailDto extends OrderDto {
  order_members: OrderMemberDto[];
  order_lines: OrderLineDto[];
}

/** Lightweight order row with member count — used in the list query. */
export interface OrderSummaryDto extends OrderDto {
  order_members: { id: string }[];
}

/** Row from the order_invitations table. */
export interface OrderInvitationDto {
  id: string;
  order_id: string;
  token: string;
  expires_at: string | null;
  used_by: string | null;
  created_at: string;
}

/** Payload for inserting a new order. */
export interface OrderInsertDto {
  owner_id: string;
  title: string | null;
  notes: string | null;
}

/** Row from the order_products table. */
export interface OrderProductDto {
  id: string;
  name: string;
  category: string;
  origin: string | null;
}

/** Payload for updating an existing order. */
export interface OrderUpdateDto {
  title?: string | null;
  notes?: string | null;
  status?: 'draft' | 'ordered' | 'shipped' | 'received';
  order_date?: string | null;
  received_date?: string | null;
  shipping_cost?: number | null;
  paypal_fee?: number | null;
  discount_amount?: number | null;
  updated_at: string;
}

/** Payload for inserting a new order line. */
export interface OrderLineInsertDto {
  order_id: string;
  product_id: string;
  unit_price: number;
  pack_chosen: number | null;
  quantity_ordered: number | null;
  notes: string | null;
}

/** Payload for updating an existing order line. */
export type OrderLineUpdateDto = Partial<Omit<OrderLineInsertDto, 'order_id' | 'product_id'>>;

/** Payload for upserting a participant's allocation. */
export interface OrderLineAllocationUpsertDto {
  order_line_id: string;
  user_id: string;
  quantity_needed: number;
  quantity_this_order: number;
}
