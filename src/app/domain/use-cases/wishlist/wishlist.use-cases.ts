import { inject, Injectable } from '@angular/core';

import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { WishlistItemFormValue } from '@/interfaces/forms/wishlist-item-form.interface';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { WISHLIST_REPOSITORY, WishlistRepositoryContract } from '@/domain/repositories/wishlist.repository.contract';
import { WishlistUseCasesContract } from './wishlist.use-cases.contract';

@Injectable()
export class WishlistUseCasesImpl implements WishlistUseCasesContract {
  private readonly _repo: WishlistRepositoryContract = inject(WISHLIST_REPOSITORY);

  /**
   * Returns all wishlist items for the given user, ordered by priority (high→low).
   *
   * @param {string} userId
   */
  async getAllForUser(userId: string): Promise<WishlistItemModel[]> {
    return this._repo.getAllForUser(userId);
  }

  /**
   * Adds a game to the user's wishlist.
   *
   * @param {string} userId
   * @param {GameCatalogDto} catalogEntry
   * @param {WishlistItemFormValue} formValue
   */
  async addItem(userId: string, catalogEntry: GameCatalogDto, formValue: WishlistItemFormValue): Promise<void> {
    return this._repo.addItem(userId, catalogEntry, formValue);
  }

  /**
   * Updates the wishlist-specific fields of an existing item.
   *
   * @param {string} userId
   * @param {string} id - Supabase UUID of the user_wishlist row
   * @param {Partial<WishlistItemFormValue>} patch
   */
  async updateItem(userId: string, id: string, patch: Partial<WishlistItemFormValue>): Promise<void> {
    return this._repo.updateItem(userId, id, patch);
  }

  /**
   * Deletes a wishlist item by UUID.
   *
   * @param {string} userId
   * @param {string} id - Supabase UUID of the user_wishlist row
   */
  async deleteItem(userId: string, id: string): Promise<void> {
    return this._repo.deleteItem(userId, id);
  }
}
