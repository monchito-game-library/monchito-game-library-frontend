import { MarketItemType } from '@/models/market/market-item.model';

/** Row from the available_items view (for_sale = true, not yet sold). */
export interface AvailableItemDto {
  item_type: MarketItemType;
  id: string;
  user_id: string;
  item_name: string;
  brand_name: string | null;
  model_name: string | null;
  detail_left: string | null;
  detail_right: string | null;
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
  detail_left: string | null;
  detail_right: string | null;
  sold_at: string;
  sold_price_final: number | null;
  created_at: string;
}
