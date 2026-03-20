import { InjectionToken } from '@angular/core';

import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { WishlistItemFormValue } from '@/interfaces/forms/wishlist-item-form.interface';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';

export interface WishlistUseCasesContract {
  /**
   * Returns all wishlist items for the given user, ordered by priority (high→low).
   *
   * @param {string} userId
   */
  getAllForUser(userId: string): Promise<WishlistItemModel[]>;

  /**
   * Adds a game to the user's wishlist.
   *
   * @param {string} userId
   * @param {GameCatalogDto} catalogEntry
   * @param {WishlistItemFormValue} formValue
   */
  addItem(userId: string, catalogEntry: GameCatalogDto, formValue: WishlistItemFormValue): Promise<void>;

  /**
   * Updates the wishlist-specific fields of an existing item.
   *
   * @param {string} userId
   * @param {string} id - Supabase UUID of the user_wishlist row
   * @param {Partial<WishlistItemFormValue>} patch
   */
  updateItem(userId: string, id: string, patch: Partial<WishlistItemFormValue>): Promise<void>;

  /**
   * Deletes a wishlist item by UUID.
   *
   * @param {string} userId
   * @param {string} id - Supabase UUID of the user_wishlist row
   */
  deleteItem(userId: string, id: string): Promise<void>;
}

/** InjectionToken for WishlistUseCasesContract. */
export const WISHLIST_USE_CASES = new InjectionToken<WishlistUseCasesContract>('WISHLIST_USE_CASES');
