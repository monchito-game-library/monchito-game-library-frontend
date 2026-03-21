/** A single purchasable pack option for an order product. */
export interface OrderProductPackDto {
  quantity: number;
  price: number;
  url: string | null;
}

/** Row from the order_products table in Supabase. */
export interface OrderProductDto {
  id: string;
  name: string;
  packs: OrderProductPackDto[];
  category: string;
  notes: string | null;
  is_active: boolean;
  created_at?: string;
}

/** Payload for inserting a new row in the order_products table. */
export type OrderProductInsertDto = Omit<OrderProductDto, 'id' | 'created_at'>;
