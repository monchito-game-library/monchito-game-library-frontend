import { inject, Injectable } from '@angular/core';

import { AvailableItemModel, SoldItemModel } from '@/models/market/market-item.model';
import { MARKET_REPOSITORY, MarketRepositoryContract } from '@/domain/repositories/market.repository.contract';
import { MarketUseCasesContract } from './market.use-cases.contract';

@Injectable()
export class MarketUseCasesImpl implements MarketUseCasesContract {
  private readonly _repo: MarketRepositoryContract = inject(MARKET_REPOSITORY);

  /**
   * Returns all items listed for sale by the given user, across all item types.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAvailableItems(userId: string): Promise<AvailableItemModel[]> {
    return this._repo.getAvailableItems(userId);
  }

  /**
   * Returns the full sale history for the given user, across all item types.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getSoldItems(userId: string): Promise<SoldItemModel[]> {
    return this._repo.getSoldItems(userId);
  }
}
