import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/data/config/supabase.config';
import { WishlistFullDto, WishlistInsertDto, WishlistUpdateDto } from '@/dtos/supabase/wishlist.dto';
import { GameCatalogDto, GameCatalogInsertDto } from '@/dtos/supabase/game-catalog.dto';
import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { WishlistItemFormValue } from '@/interfaces/forms/wishlist-item-form.interface';
import { WishlistRepositoryContract } from '@/domain/repositories/wishlist.repository.contract';
import { mapWishlistItem, mapWishlistToInsertDto } from '@/mappers/supabase/wishlist.mapper';

/** Wishlist repository backed by Supabase. Reads through user_wishlist_full view. */
@Injectable({ providedIn: 'root' })
export class SupabaseWishlistRepository implements WishlistRepositoryContract {
  private readonly _supabase: SupabaseClient = getSupabaseClient();
  private readonly _viewName = 'user_wishlist_full';
  private readonly _tableName = 'user_wishlist';
  private readonly _catalogTable = 'game_catalog';

  /**
   * Returns all wishlist items for the given user ordered by priority descending.
   *
   * @param {string} userId
   */
  async getAllForUser(userId: string): Promise<WishlistItemModel[]> {
    const { data, error } = await this._supabase
      .from(this._viewName)
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch wishlist: ${error.message}`);
    return (data as WishlistFullDto[]).map(mapWishlistItem);
  }

  /**
   * Finds or creates the game_catalog entry for the given RAWG game, then inserts
   * a user_wishlist row linked to that catalog entry.
   *
   * @param {string} userId
   * @param {GameCatalogDto} catalogEntry
   * @param {WishlistItemFormValue} formValue
   */
  async addItem(userId: string, catalogEntry: GameCatalogDto, formValue: WishlistItemFormValue): Promise<void> {
    const gameCatalogId: string = await this._getOrCreateGameCatalog(catalogEntry);
    const payload: WishlistInsertDto = mapWishlistToInsertDto(userId, gameCatalogId, formValue);
    const { error } = await this._supabase.from(this._tableName).insert(payload);
    if (error) throw new Error(`Failed to add wishlist item: ${error.message}`);
  }

  /**
   * Updates the wishlist-specific fields of an existing item.
   *
   * @param {string} userId
   * @param {string} id - Supabase UUID of the user_wishlist row
   * @param {Partial<WishlistItemFormValue>} patch
   */
  async updateItem(userId: string, id: string, patch: Partial<WishlistItemFormValue>): Promise<void> {
    const payload: WishlistUpdateDto = {};
    if (patch.desiredPrice !== undefined) payload.desired_price = patch.desiredPrice;
    if (patch.priority !== undefined) payload.priority = patch.priority;
    if (patch.notes !== undefined) payload.notes = patch.notes;

    const { error } = await this._supabase.from(this._tableName).update(payload).eq('id', id).eq('user_id', userId);

    if (error) throw new Error(`Failed to update wishlist item: ${error.message}`);
  }

  /**
   * Deletes a wishlist item by UUID if it belongs to the given user.
   *
   * @param {string} userId
   * @param {string} id - Supabase UUID of the user_wishlist row
   */
  async deleteItem(userId: string, id: string): Promise<void> {
    const { error } = await this._supabase.from(this._tableName).delete().eq('id', id).eq('user_id', userId);

    if (error) throw new Error(`Failed to delete wishlist item: ${error.message}`);
  }

  /**
   * Finds an existing game_catalog entry by RAWG ID, creating one if it does not exist.
   * Returns the catalog row UUID.
   *
   * @param {GameCatalogDto} catalogEntry
   */
  private async _getOrCreateGameCatalog(catalogEntry: GameCatalogDto): Promise<string> {
    if (catalogEntry.rawg_id) {
      const { data: existing } = await this._supabase
        .from(this._catalogTable)
        .select('id')
        .eq('rawg_id', catalogEntry.rawg_id)
        .single();

      if (existing) return existing.id;
    }

    const record: GameCatalogInsertDto = {
      rawg_id: catalogEntry.rawg_id ?? null,
      title: catalogEntry.title,
      slug: catalogEntry.slug,
      image_url: catalogEntry.image_url,
      released_date: catalogEntry.released_date,
      rating: catalogEntry.rating,
      platforms: catalogEntry.platforms,
      genres: catalogEntry.genres,
      source: catalogEntry.rawg_id ? 'rawg' : 'manual'
    };

    const { data: created, error } = await this._supabase.from(this._catalogTable).insert(record).select('id').single();

    if (error) throw new Error(`Failed to create game catalog entry: ${error.message}`);
    return created.id;
  }
}
