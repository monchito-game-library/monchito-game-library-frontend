import { InjectionToken } from '@angular/core';

import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { WishlistItemFormValue } from '@/interfaces/forms/wishlist-item-form.interface';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';

/** Contract for the wishlist repository. */
export interface WishlistRepositoryContract {
  /**
   * Returns all wishlist items for the given user, ordered by priority (high→low).
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  getAllForUser(userId: string): Promise<WishlistItemModel[]>;

  /**
   * Adds a game to the user's wishlist.
   * Finds or creates the game_catalog entry using the provided catalog DTO,
   * then inserts a row in user_wishlist.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {GameCatalogDto} catalogEntry - RAWG catalog entry to link
   * @param {WishlistItemFormValue} formValue - Valores del formulario de wishlist
   */
  addItem(userId: string, catalogEntry: GameCatalogDto, formValue: WishlistItemFormValue): Promise<void>;

  /**
   * Updates the wishlist-specific fields (desired_price, priority, notes) of an existing item.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_wishlist row
   * @param {Partial<WishlistItemFormValue>} patch - Campos a actualizar en el item
   */
  updateItem(userId: string, id: string, patch: Partial<WishlistItemFormValue>): Promise<void>;

  /**
   * Deletes a wishlist item by UUID if it belongs to the user.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_wishlist row
   */
  deleteItem(userId: string, id: string): Promise<void>;
}

/** InjectionToken for WishlistRepositoryContract. */
export const WISHLIST_REPOSITORY = new InjectionToken<WishlistRepositoryContract>('WISHLIST_REPOSITORY');
