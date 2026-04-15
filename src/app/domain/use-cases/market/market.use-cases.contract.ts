import { InjectionToken } from '@angular/core';

import { AvailableItemModel, SoldItemModel } from '@/models/market/market-item.model';

export interface MarketUseCasesContract {
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

/** InjectionToken for MarketUseCasesContract. */
export const MARKET_USE_CASES = new InjectionToken<MarketUseCasesContract>('MARKET_USE_CASES');
