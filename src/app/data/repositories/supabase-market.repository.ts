import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { AvailableItemDto, SoldItemDto } from '@/dtos/supabase/market-item.dto';
import { AvailableItemModel, SoldItemModel, MarketItemType } from '@/models/market/market-item.model';
import { MarketRepositoryContract } from '@/domain/repositories/market.repository.contract';

/** Market repository backed by Supabase. Queries the available_items and sold_items views. */
@Injectable({ providedIn: 'root' })
export class SupabaseMarketRepository implements MarketRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  /**
   * Returns all items listed for sale by the given user, ordered by creation date descending.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAvailableItems(userId: string): Promise<AvailableItemModel[]> {
    const { data, error } = await this._supabase
      .from('available_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch available items: ${error.message}`);
    return (data as AvailableItemDto[]).map(
      (dto): AvailableItemModel => ({
        itemType: dto.item_type as MarketItemType,
        id: dto.id,
        userId: dto.user_id,
        itemName: dto.item_name,
        brandName: dto.brand_name,
        modelName: dto.model_name,
        detailLeft: dto.detail_left,
        detailRight: dto.detail_right,
        salePrice: dto.sale_price
      })
    );
  }

  /**
   * Returns the full sale history for the given user, ordered by sale date descending.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getSoldItems(userId: string): Promise<SoldItemModel[]> {
    const { data, error } = await this._supabase
      .from('sold_items')
      .select('*')
      .eq('user_id', userId)
      .order('sold_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch sold items: ${error.message}`);
    return (data as SoldItemDto[]).map(
      (dto): SoldItemModel => ({
        itemType: dto.item_type as MarketItemType,
        id: dto.id,
        userId: dto.user_id,
        itemName: dto.item_name,
        brandName: dto.brand_name,
        modelName: dto.model_name,
        detailLeft: dto.detail_left,
        detailRight: dto.detail_right,
        soldAt: dto.sold_at,
        soldPriceFinal: dto.sold_price_final
      })
    );
  }
}
