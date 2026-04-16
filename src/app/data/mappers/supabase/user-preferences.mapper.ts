import { UserPreferencesModel } from '@/models/user-preferences/user-preferences.model';
import { UserPreferencesDto, UserPreferencesInsertDto } from '@/dtos/supabase/user-preferences.dto';
import { UserRoleType } from '@/types/user-role.type';

/**
 * Maps a user_preferences table row to the domain model.
 *
 * @param {UserPreferencesDto} dto - Raw Supabase row
 * @param {string} userId - User ID (not stored as a selected column in queries)
 */
export function mapUserPreferences(dto: UserPreferencesDto, userId: string): UserPreferencesModel {
  return {
    userId,
    theme: dto.theme,
    language: dto.language,
    avatarUrl: dto.avatar_url ?? null,
    bannerUrl: dto.banner_url ?? null,
    role: (dto.role ?? 'user') as UserRoleType
  };
}

/**
 * Maps the domain model to an insert/upsert payload for the user_preferences table.
 *
 * @param {UserPreferencesModel} model - User preferences model to map
 */
export function mapUserPreferencesToInsertDto(model: UserPreferencesModel): UserPreferencesInsertDto {
  const dto: UserPreferencesInsertDto = {
    user_id: model.userId,
    theme: model.theme,
    language: model.language
  };

  if (model.avatarUrl !== undefined) {
    dto.avatar_url = model.avatarUrl;
  }

  return dto;
}
