import { InjectionToken } from '@angular/core';

import { AvailableItemModel, SoldItemModel } from '@/models/market/market-item.model';

/** Contract for the unified market repository (available_items and sold_items views). */
export interface MarketRepositoryContract {
  /**
   * Returns all items listed for sale by the given user, across all item types.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  getAvailableItems(userId: string): Promise<AvailableItemModel[]>;

  /**
   * Returns the full sale history for the given user, across all item types.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  getSoldItems(userId: string): Promise<SoldItemModel[]>;
}

/** InjectionToken for MarketRepositoryContract. */
export const MARKET_REPOSITORY = new InjectionToken<MarketRepositoryContract>('MARKET_REPOSITORY');
