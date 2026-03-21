/** Row from the order_products table in Supabase. */
export interface OrderProductDto {
  id: string;
  name: string;
  unit_price: number;
  available_packs: number[];
  category: string;
  notes: string | null;
  is_active: boolean;
  created_at?: string;
}

/** Payload for inserting a new row in the order_products table. */
export type OrderProductInsertDto = Omit<OrderProductDto, 'id' | 'created_at'>;
