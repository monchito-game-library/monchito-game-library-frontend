/** A single purchasable pack option for a protector. */
export interface ProtectorPackDto {
  quantity: number;
  price: number;
  url: string | null;
}

/** Row from the order_products table in Supabase. */
export interface ProtectorDto {
  id: string;
  name: string;
  packs: ProtectorPackDto[];
  category: string;
  notes: string | null;
  is_active: boolean;
  created_at?: string;
}

/** Payload for inserting a new row in the order_products table. */
export type ProtectorInsertDto = Omit<ProtectorDto, 'id' | 'created_at'>;
