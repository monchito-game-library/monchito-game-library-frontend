/** Item type discriminator for the unified market views. */
export type MarketItemType = 'game' | 'console' | 'controller';

/** Domain model for an item listed for sale (available_items view). */
export interface AvailableItemModel {
  itemType: MarketItemType;
  id: string;
  userId: string;
  itemName: string;
  brandName: string | null;
  modelName: string | null;
  salePrice: number | null;
}

/** Domain model for a sold item (sold_items view). */
export interface SoldItemModel {
  itemType: MarketItemType;
  id: string;
  userId: string;
  itemName: string;
  brandName: string | null;
  modelName: string | null;
  soldAt: string;
  soldPriceFinal: number | null;
}
