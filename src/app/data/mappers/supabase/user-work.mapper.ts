import { UserWorkDto, UserWorkInsertDto } from '@/dtos/supabase/user-work.dto';
import { GameModel } from '@/models/game/game.model';
import { WorkModel } from '@/models/work/work.model';
import { GameStatus } from '@/types/game-status.type';
import { PlatformType } from '@/types/platform.type';

/**
 * Maps a user_works row to the WorkModel domain model.
 *
 * @param {UserWorkDto} dto - Row from the user_works table
 */
export function mapUserWork(dto: UserWorkDto): WorkModel {
  return {
    uuid: dto.id ?? '',
    userId: dto.user_id,
    gameCatalogId: dto.game_catalog_id,
    platform: (dto.platform ?? null) as PlatformType | null,
    status: (dto.status ?? 'backlog') as GameStatus,
    personalRating: dto.personal_rating ?? null,
    isFavorite: dto.is_favorite ?? false
  };
}

/**
 * Maps the work-side fields from a GameModel to a UserWorkInsertDto.
 * Used by the repository when creating or updating the user_works row that
 * groups the game's copies. Operational fields (user_id, game_catalog_id) must
 * be added by the caller.
 *
 * @param {GameModel} model - Game model to map
 */
export function mapGameToWorkInsertDto(model: GameModel): UserWorkInsertDto {
  const dto: UserWorkInsertDto = {
    status: model.status,
    personal_rating: model.personalRating,
    is_favorite: model.isFavorite
  };

  // platform es NOT NULL en user_works; omitir el campo si el modelo no lo trae
  // para que un UPDATE parcial no rompa con NOT NULL constraint.
  if (model.platform !== null) {
    dto.platform = model.platform;
  }

  return dto;
}
