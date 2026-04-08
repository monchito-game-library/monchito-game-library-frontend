import { WishlistFullDto, WishlistInsertDto } from '@/dtos/supabase/wishlist.dto';
import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { WishlistItemFormValue } from '@/interfaces/forms/wishlist-item-form.interface';

/**
 * Maps a user_wishlist_full view row to the WishlistItemModel domain model.
 *
 * @param {WishlistFullDto} dto - DTO/modelo recibido para mapear
 */
export function mapWishlistItem(dto: WishlistFullDto): WishlistItemModel {
  return {
    id: dto.id,
    userId: dto.user_id,
    gameCatalogId: dto.game_catalog_id,
    platform: dto.platform ?? '',
    desiredPrice: dto.desired_price,
    priority: dto.priority,
    notes: dto.notes,
    createdAt: dto.created_at,
    title: dto.title,
    slug: dto.slug,
    imageUrl: dto.image_url,
    rawgId: dto.rawg_id,
    releasedDate: dto.released_date,
    rating: dto.rating,
    platforms: dto.platforms ?? [],
    genres: dto.genres ?? []
  };
}

/**
 * Maps a user ID, catalog entry UUID and form values to a WishlistInsertDto.
 *
 * @param {string} userId - UUID del usuario autenticado
 * @param {string} gameCatalogId - UUID de la entrada del catálogo de juegos
 * @param {WishlistItemFormValue} formValue - Valores del formulario de wishlist
 */
export function mapWishlistToInsertDto(
  userId: string,
  gameCatalogId: string,
  formValue: WishlistItemFormValue
): WishlistInsertDto {
  return {
    user_id: userId,
    game_catalog_id: gameCatalogId,
    platform: formValue.platform ?? '',
    desired_price: formValue.desiredPrice,
    priority: formValue.priority,
    notes: formValue.notes
  };
}
