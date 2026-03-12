import { InjectionToken } from '@angular/core';

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
   * Returns a single game by ID, or undefined if not found.
   *
   * @param {string} userId
   * @param {number} gameId
   */
  getById(userId: string, gameId: number): Promise<GameModel | undefined>;

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
   * Updates an existing game.
   * Pass a catalog entry to update the RAWG catalog link.
   *
   * @param {string} userId
   * @param {number} gameId
   * @param {GameModel} game
   * @param {GameCatalog | null} [catalogEntry]
   */
  updateGame(userId: string, gameId: number, game: GameModel, catalogEntry?: GameCatalog | null): Promise<void>;

  /**
   * Deletes a game by ID.
   *
   * @param {string} userId
   * @param {number} gameId
   */
  deleteGame(userId: string, gameId: number): Promise<void>;

  /**
   * Deletes all games in the user's collection.
   *
   * @param {string} userId
   */
  clearAll(userId: string): Promise<void>;
}

export const GAME_USE_CASES = new InjectionToken<GameUseCasesContract>('GAME_USE_CASES');
