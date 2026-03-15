import { inject, Injectable } from '@angular/core';

import { GAME_REPOSITORY, GameRepositoryContract } from '@/domain/repositories/game.repository.contract';
import { GameModel } from '@/models/game/game.model';
import { PlatformType } from '@/types/platform.type';
import { GameCatalog } from '@/dtos/rawg/rawg-game.dto';
import { GameUseCasesContract } from './game.use-cases.contract';

@Injectable()
export class GameUseCasesImpl implements GameUseCasesContract {
  private readonly _repo: GameRepositoryContract = inject(GAME_REPOSITORY);

  /**
   * Returns all games in the user's collection.
   *
   * @param {string} userId
   */
  async getAllGames(userId: string): Promise<GameModel[]> {
    return this._repo.getAllGamesForUser(userId);
  }

  /**
   * Returns a single game by UUID, or undefined if not found.
   *
   * @param {string} userId
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  async getById(userId: string, uuid: string): Promise<GameModel | undefined> {
    return this._repo.getById(userId, uuid);
  }

  /**
   * Returns all games for a given platform.
   *
   * @param {string} userId
   * @param {PlatformType} platform
   */
  async getByPlatform(userId: string, platform: PlatformType): Promise<GameModel[]> {
    return this._repo.getByConsole(userId, platform);
  }

  /**
   * Adds a new game to the user's collection.
   * Passes the catalog entry to the repository so it can be linked to the record.
   *
   * @param {string} userId
   * @param {GameModel} game
   * @param {GameCatalog | null} [catalogEntry]
   */
  async addGame(userId: string, game: GameModel, catalogEntry?: GameCatalog | null): Promise<void> {
    return this._repo.addGameForUser(userId, game, catalogEntry);
  }

  /**
   * Updates an existing game. The model must include the uuid field.
   * Passes the catalog entry to the repository so the catalog link can be refreshed.
   *
   * @param {string} userId
   * @param {GameModel} game - Must include uuid
   * @param {GameCatalog | null} [catalogEntry]
   */
  async updateGame(userId: string, game: GameModel, catalogEntry?: GameCatalog | null): Promise<void> {
    return this._repo.updateGameForUser(userId, game, catalogEntry);
  }

  /**
   * Deletes a game by UUID.
   *
   * @param {string} userId
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  async deleteGame(userId: string, uuid: string): Promise<void> {
    return this._repo.deleteById(userId, uuid);
  }

  /**
   * Deletes all games in the user's collection.
   *
   * @param {string} userId
   */
  async clearAll(userId: string): Promise<void> {
    return this._repo.clearAllForUser(userId);
  }
}
