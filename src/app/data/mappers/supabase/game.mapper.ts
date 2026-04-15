import { UserGameEditDto, UserGameFullDto, UserGameInsertDto, UserGameListDto } from '@/dtos/supabase/game-catalog.dto';
import { GameEditModel } from '@/models/game/game-edit.model';
import { GameListModel } from '@/models/game/game-list.model';
import { GameModel } from '@/models/game/game.model';
import { GameConditionType } from '@/types/game-condition.type';
import { GameFormatType } from '@/types/game-format.type';
import { GameStatus } from '@/types/game-status.type';
import { PlatformType } from '@/types/platform.type';

/**
 * Maps a user_games_full view row to the GameModel domain model.
 * Prefers user-specific fields (user_platform, user_notes) over catalog defaults.
 *
 * @param {UserGameFullDto} dto - Row from the user_games_full view
 */
export function mapGame(dto: UserGameFullDto): GameModel {
  return {
    id: parseInt((dto.id || '').split('-').join('').substring(0, 8), 16),
    uuid: dto.id,
    title: dto.title,
    price: dto.price,
    store: dto.store ?? null,
    condition: (dto.condition ?? 'new') as GameConditionType,
    platinum: dto.platinum ?? false,
    description: dto.user_notes || dto.description || '',
    platform: (dto.user_platform || dto.platform) as PlatformType | null,
    imageUrl: dto.image_url ?? undefined,
    rawgId: dto.rawg_id ?? null,
    rawgSlug: dto.slug ?? null,
    status: (dto.status ?? 'backlog') as GameStatus,
    personalRating: dto.personal_rating ?? null,
    edition: dto.edition ?? null,
    format: (dto.format ?? null) as GameFormatType | null,
    isFavorite: dto.is_favorite ?? false,
    forSale: dto.for_sale ?? false,
    salePrice: dto.sale_price ?? null,
    soldAt: dto.sold_at ?? null,
    soldPriceFinal: dto.sold_price_final ?? null,
    activeLoanId: dto.active_loan_id ?? null,
    activeLoanTo: dto.active_loan_to ?? null,
    activeLoanAt: dto.active_loan_at ?? null
  };
}

/**
 * Maps a UserGameEditDto (partial view row) to the GameEditModel used by the edit form.
 *
 * @param {UserGameEditDto} dto - Partial view row for the edit form
 */
export function mapGameEdit(dto: UserGameEditDto): GameEditModel {
  return {
    uuid: dto.id,
    id: parseInt((dto.id || '').split('-').join('').substring(0, 8), 16),
    title: dto.title,
    price: dto.price,
    store: dto.store ?? null,
    platform: (dto.user_platform ?? null) as PlatformType | null,
    condition: (dto.condition ?? 'new') as GameConditionType,
    platinum: dto.platinum ?? false,
    description: dto.user_notes || dto.description || '',
    status: (dto.status ?? 'backlog') as GameStatus,
    personalRating: dto.personal_rating ?? null,
    edition: dto.edition ?? null,
    format: (dto.format ?? null) as GameFormatType | null,
    isFavorite: dto.is_favorite ?? false,
    imageUrl: dto.image_url,
    rawgId: dto.rawg_id,
    rawgSlug: dto.slug ?? null,
    releasedDate: dto.released_date ?? null,
    rawgRating: dto.rawg_rating ?? 0,
    genres: dto.genres ?? [],
    coverPosition: dto.cover_position ?? null,
    forSale: dto.for_sale ?? false,
    salePrice: dto.sale_price ?? null,
    soldAt: dto.sold_at ?? null,
    soldPriceFinal: dto.sold_price_final ?? null,
    activeLoanId: dto.active_loan_id ?? null,
    activeLoanTo: dto.active_loan_to ?? null,
    activeLoanAt: dto.active_loan_at ?? null
  };
}

/**
 * Maps a UserGameListDto (partial view row) to the GameListModel used by the list and card.
 *
 * @param {UserGameListDto} dto - Partial view row for the list and card
 */
export function mapGameList(dto: UserGameListDto): GameListModel {
  return {
    id: parseInt((dto.id || '').split('-').join('').substring(0, 8), 16),
    uuid: dto.id,
    title: dto.title,
    price: dto.price,
    store: dto.store ?? null,
    platform: (dto.user_platform ?? null) as PlatformType | null,
    platinum: dto.platinum ?? false,
    description: dto.user_notes || dto.description || '',
    imageUrl: dto.image_url ?? undefined,
    status: (dto.status ?? 'backlog') as GameStatus,
    personalRating: dto.personal_rating ?? null,
    edition: dto.edition ?? null,
    format: (dto.format ?? null) as GameFormatType | null,
    isFavorite: dto.is_favorite ?? false,
    coverPosition: dto.cover_position ?? null,
    forSale: dto.for_sale ?? false,
    soldAt: dto.sold_at ?? null,
    soldPriceFinal: dto.sold_price_final ?? null,
    activeLoanId: dto.active_loan_id ?? null,
    activeLoanTo: dto.active_loan_to ?? null,
    activeLoanAt: dto.active_loan_at ?? null
  };
}

/**
 * Maps game-data fields from a GameModel to a UserGameInsertDto.
 * Operational fields (user_id, game_catalog_id) must be added by the caller.
 *
 * @param {GameModel} model - Game model to map
 */
export function mapGameToInsertDto(model: GameModel): UserGameInsertDto {
  return {
    price: model.price,
    store: model.store,
    platform: model.platform,
    condition: model.condition as 'new' | 'used',
    description: model.description,
    platinum: model.platinum,
    status: model.status,
    personal_rating: model.personalRating,
    edition: model.edition,
    format: model.format,
    is_favorite: model.isFavorite,
    cover_position: model.coverPosition ?? null,
    for_sale: model.forSale ?? false,
    sale_price: model.salePrice ?? null,
    sold_at: model.soldAt ?? null,
    sold_price_final: model.soldPriceFinal ?? null
  };
}
