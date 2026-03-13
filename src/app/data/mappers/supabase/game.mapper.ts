import { UserGameFullDto, UserGameInsertDto } from '@/dtos/supabase/game-catalog.dto';
import { GameModel } from '@/models/game/game.model';
import { GameConditionType } from '@/types/game-condition.type';
import { GameStatus } from '@/types/game-status.type';
import { PlatformType } from '@/types/platform.type';
import { StoreType } from '@/types/stores.type';

/**
 * Maps a user_games_full view row to the GameModel domain model.
 * Prefers user-specific fields (user_platform, user_notes) over catalog defaults.
 *
 * @param {UserGameFullDto} dto
 */
export function mapGame(dto: UserGameFullDto): GameModel {
  return {
    id: parseInt((dto.id || '').split('-').join('').substring(0, 8), 16),
    title: dto.title,
    price: dto.price,
    store: (dto.store ?? 'none') as StoreType,
    condition: (dto.condition ?? 'new') as GameConditionType,
    platinum: dto.platinum ?? false,
    description: dto.user_notes || dto.description || '',
    platform: (dto.user_platform || dto.platform) as PlatformType | null,
    imageUrl: dto.image_url ?? undefined,
    status: (dto.status ?? 'backlog') as GameStatus,
    personalRating: dto.personal_rating ?? null,
    edition: dto.edition ?? null,
    isFavorite: dto.is_favorite ?? false
  };
}

/**
 * Maps game-data fields from a GameModel to a UserGameInsertDto.
 * Operational fields (user_id, game_catalog_id) must be added by the caller.
 *
 * @param {GameModel} model
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
    is_favorite: model.isFavorite
  };
}
