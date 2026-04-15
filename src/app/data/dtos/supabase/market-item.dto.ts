/** Item type discriminator used in market views. */
export type MarketItemType = 'game' | 'console' | 'controller';

/** Row from the available_items view (for_sale = true, not yet sold). */
export interface AvailableItemDto {
  item_type: MarketItemType;
  id: string;
  user_id: string;
  item_name: string;
  brand_name: string | null;
  model_name: string | null;
  sale_price: number | null;
  created_at: string;
}

/** Row from the sold_items view (sold_at IS NOT NULL). */
export interface SoldItemDto {
  item_type: MarketItemType;
  id: string;
  user_id: string;
  item_name: string;
  brand_name: string | null;
  model_name: string | null;
  sold_at: string;
  sold_price_final: number | null;
  created_at: string;
}
