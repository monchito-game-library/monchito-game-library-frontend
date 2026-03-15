import { InjectionToken } from '@angular/core';
import { GameEditModel } from '@/models/game/game-edit.model';
import { GameListModel } from '@/models/game/game-list.model';
import { GameModel } from '@/models/game/game.model';
import { PlatformType } from '@/types/platform.type';
import { GameCatalog } from '@/dtos/rawg/rawg-game.dto';

/** Contract for the game repository. */
export interface GameRepositoryContract {
  /**
   * Returns all games in the user's collection.
   *
   * @param {string} userId
   */
  getAllGamesForUser(userId: string): Promise<GameModel[]>;

  /**
   * Returns all games in the user's collection with only the columns needed
   * for the list view and game cards (excludes condition, format, rawgId, rawgSlug).
   *
   * @param {string} userId
   */
  getAllGamesForList(userId: string): Promise<GameListModel[]>;

  /**
   * Returns all games in the user's collection filtered by platform.
   *
   * @param {string} userId
   * @param {PlatformType} platform
   */
  getByConsole(userId: string, platform: PlatformType): Promise<GameModel[]>;

  /**
   * Adds a new game to the user's collection.
   * If a catalog entry is provided it will be linked to the game record.
   *
   * @param {string} userId
   * @param {GameModel} game
   * @param {GameCatalog | null} [catalogEntry] - Optional RAWG catalog entry to associate
   */
  addGameForUser(userId: string, game: GameModel, catalogEntry?: GameCatalog | null): Promise<void>;

  /**
   * Deletes a game by UUID if it belongs to the user.
   *
   * @param {string} userId
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  deleteById(userId: string, uuid: string): Promise<void>;

  /**
   * Updates an existing game if it belongs to the user.
   * If a catalog entry is provided the catalog link will also be updated.
   * The game model must include the uuid field.
   *
   * @param {string} userId
   * @param {GameModel} game - Must include uuid
   * @param {GameCatalog | null} [catalogEntry] - Optional RAWG catalog entry to associate
   */
  updateGameForUser(userId: string, game: GameModel, catalogEntry?: GameCatalog | null): Promise<void>;

  /**
   * Deletes all games for a user.
   *
   * @param {string} userId
   */
  clearAllForUser(userId: string): Promise<void>;

  /**
   * Returns a single game by UUID if it belongs to the user.
   *
   * @param {string} userId
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  getById(userId: string, uuid: string): Promise<GameModel | undefined>;

  /**
   * Returns only the fields needed by the edit form for a single game.
   * Fetches a targeted subset of columns to avoid loading unused catalog metadata.
   *
   * @param {string} userId
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  getGameForEdit(userId: string, uuid: string): Promise<GameEditModel | undefined>;
}

/** InjectionToken for GameRepositoryContract. */
export const GAME_REPOSITORY = new InjectionToken<GameRepositoryContract>('GAME_REPOSITORY');
