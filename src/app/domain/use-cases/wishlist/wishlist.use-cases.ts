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
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllForUser(userId: string): Promise<WishlistItemModel[]> {
    return this._repo.getAllForUser(userId);
  }

  /**
   * Adds a game to the user's wishlist.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {GameCatalogDto} catalogEntry - Entrada del catálogo de juegos
   * @param {WishlistItemFormValue} formValue - Valores del formulario de wishlist
   */
  async addItem(userId: string, catalogEntry: GameCatalogDto, formValue: WishlistItemFormValue): Promise<void> {
    return this._repo.addItem(userId, catalogEntry, formValue);
  }

  /**
   * Updates the wishlist-specific fields of an existing item.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_wishlist row
   * @param {Partial<WishlistItemFormValue>} patch - Campos a actualizar en el item
   */
  async updateItem(userId: string, id: string, patch: Partial<WishlistItemFormValue>): Promise<void> {
    return this._repo.updateItem(userId, id, patch);
  }

  /**
   * Deletes a wishlist item by UUID.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} id - Supabase UUID of the user_wishlist row
   */
  async deleteItem(userId: string, id: string): Promise<void> {
    return this._repo.deleteItem(userId, id);
  }
}
