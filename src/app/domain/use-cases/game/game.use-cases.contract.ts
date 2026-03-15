import { InjectionToken } from '@angular/core';

import { GameEditModel } from '@/models/game/game-edit.model';
import { GameListModel } from '@/models/game/game-list.model';
import { GameModel } from '@/models/game/game.model';
import { PlatformType } from '@/types/platform.type';
import { GameCatalog } from '@/dtos/rawg/rawg-game.dto';

export interface GameUseCasesContract {
  /**
   * Returns all games in the user's collection.
   *
   * @param {string} userId
   */
  getAllGames(userId: string): Promise<GameModel[]>;

  /**
   * Returns all games in the user's collection with only the fields needed
   * for the list view and game cards.
   *
   * @param {string} userId
   */
  getAllGamesForList(userId: string): Promise<GameListModel[]>;

  /**
   * Returns a single game by UUID, or undefined if not found.
   *
   * @param {string} userId
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  getById(userId: string, uuid: string): Promise<GameModel | undefined>;

  /**
   * Returns only the fields needed by the edit form for a single game.
   *
   * @param {string} userId
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  getGameForEdit(userId: string, uuid: string): Promise<GameEditModel | undefined>;

  /**
   * Returns all games for a given platform.
   *
   * @param {string} userId
   * @param {PlatformType} platform
   */
  getByPlatform(userId: string, platform: PlatformType): Promise<GameModel[]>;

  /**
   * Adds a new game to the user's collection.
   * Pass a catalog entry to link it to the RAWG catalog.
   *
   * @param {string} userId
   * @param {GameModel} game
   * @param {GameCatalog | null} [catalogEntry]
   */
  addGame(userId: string, game: GameModel, catalogEntry?: GameCatalog | null): Promise<void>;

  /**
   * Updates an existing game. The model must include the uuid field.
   * Pass a catalog entry to update the RAWG catalog link.
   *
   * @param {string} userId
   * @param {GameModel} game - Must include uuid
   * @param {GameCatalog | null} [catalogEntry]
   */
  updateGame(userId: string, game: GameModel, catalogEntry?: GameCatalog | null): Promise<void>;

  /**
   * Deletes a game by UUID.
   *
   * @param {string} userId
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  deleteGame(userId: string, uuid: string): Promise<void>;

  /**
   * Deletes all games in the user's collection.
   *
   * @param {string} userId
   */
  clearAll(userId: string): Promise<void>;
}

export const GAME_USE_CASES = new InjectionToken<GameUseCasesContract>('GAME_USE_CASES');
