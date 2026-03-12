import { InjectionToken } from '@angular/core';
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
   * Deletes a game by ID if it belongs to the user.
   *
   * @param {string} userId
   * @param {number} id
   */
  deleteById(userId: string, id: number): Promise<void>;

  /**
   * Updates an existing game if it belongs to the user.
   * If a catalog entry is provided the catalog link will also be updated.
   *
   * @param {string} userId
   * @param {number} id
   * @param {GameModel} game
   * @param {GameCatalog | null} [catalogEntry] - Optional RAWG catalog entry to associate
   */
  updateGameForUser(userId: string, id: number, game: GameModel, catalogEntry?: GameCatalog | null): Promise<void>;

  /**
   * Deletes all games for a user.
   *
   * @param {string} userId
   */
  clearAllForUser(userId: string): Promise<void>;

  /**
   * Returns a single game by ID if it belongs to the user.
   *
   * @param {string} userId
   * @param {number} id
   */
  getById(userId: string, id: number): Promise<GameModel | undefined>;
}

/** InjectionToken for GameRepositoryContract. */
export const GAME_REPOSITORY = new InjectionToken<GameRepositoryContract>('GAME_REPOSITORY');
