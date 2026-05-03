import { inject, Injectable } from '@angular/core';

import { GAME_REPOSITORY, GameRepositoryContract } from '@/domain/repositories/game.repository.contract';
import { GameEditModel } from '@/models/game/game-edit.model';
import { GameListModel } from '@/models/game/game-list.model';
import { GameModel } from '@/models/game/game.model';
import { PlatformType } from '@/types/platform.type';
import { GameCatalog } from '@/dtos/rawg/rawg-game.dto';
import { GameUseCasesContract } from './game.use-cases.contract';
import { GameSaleStatusModel } from '@/interfaces/game-sale-status.interface';
import { GameLoanStatusModel } from '@/interfaces/game-loan-status.interface';
import { GameLoanDto } from '@/dtos/supabase/game-loan.dto';

@Injectable()
export class GameUseCasesImpl implements GameUseCasesContract {
  private readonly _repo: GameRepositoryContract = inject(GAME_REPOSITORY);

  /**
   * Returns all games in the user's collection.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllGames(userId: string): Promise<GameModel[]> {
    return this._repo.getAllGamesForUser(userId);
  }

  /**
   * Returns all games in the user's collection with only the fields needed
   * for the list view and game cards.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getAllGamesForList(userId: string): Promise<GameListModel[]> {
    return this._repo.getAllGamesForList(userId);
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
   * Returns only the fields needed by the edit form for a single game.
   *
   * @param {string} userId
   * @param {string} uuid - Supabase UUID of the user_games row
   */
  async getGameForEdit(userId: string, uuid: string): Promise<GameEditModel | undefined> {
    return this._repo.getGameForEdit(userId, uuid);
  }

  /**
   * Returns all games for a given platform.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {PlatformType} platform - Plataforma a filtrar
   */
  async getByPlatform(userId: string, platform: PlatformType): Promise<GameModel[]> {
    return this._repo.getByConsole(userId, platform);
  }

  /**
   * Adds a new game to the user's collection.
   * Passes the catalog entry to the repository so it can be linked to the record.
   * Si `targetWorkId` se proporciona, la nueva copia se asocia a esa work
   * existente directamente (caso "Añadir otra copia" del detalle).
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {GameModel} game - Juego a guardar
   * @param {GameCatalog | null} [catalogEntry]
   * @param {string} [targetWorkId] - UUID de la work existente a la que asociar la copia
   */
  async addGame(
    userId: string,
    game: GameModel,
    catalogEntry?: GameCatalog | null,
    targetWorkId?: string
  ): Promise<void> {
    return this._repo.addGameForUser(userId, game, catalogEntry, targetWorkId);
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
   * @param {string} userId - UUID del usuario autenticado
   */
  async clearAll(userId: string): Promise<void> {
    return this._repo.clearAllForUser(userId);
  }

  /**
   * Returns all sold games for the user, ordered by sold_at descending.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  async getSoldGames(userId: string): Promise<GameListModel[]> {
    return this._repo.getSoldGames(userId);
  }

  /**
   * Updates only the sale-related fields of a game.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} uuid - Supabase UUID of the user_games row
   * @param {GameSaleStatusModel} sale - New sale status values
   */
  async updateSaleStatus(userId: string, uuid: string, sale: GameSaleStatusModel): Promise<void> {
    return this._repo.updateSaleStatus(userId, uuid, sale);
  }

  /**
   * Creates a new active loan for a game. Returns the UUID of the created loan row.
   *
   * @param {GameLoanStatusModel} loan - Datos del préstamo a registrar
   */
  async createLoan(loan: GameLoanStatusModel): Promise<string> {
    return this._repo.createLoan(loan);
  }

  /**
   * Marks a loan as returned by setting returned_at to today's date.
   *
   * @param {string} loanId - UUID of the game_loans row
   */
  async returnLoan(loanId: string): Promise<void> {
    return this._repo.returnLoan(loanId);
  }

  /**
   * Returns the full loan history for a game, ordered by loaned_at descending.
   *
   * @param {string} userGameId - UUID of the user_games row
   */
  async getLoanHistory(userGameId: string): Promise<GameLoanDto[]> {
    return this._repo.getLoanHistory(userGameId);
  }
}
