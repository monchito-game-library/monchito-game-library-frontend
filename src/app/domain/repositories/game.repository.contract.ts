import { InjectionToken } from '@angular/core';
import { GameEditModel } from '@/models/game/game-edit.model';
import { GameListModel } from '@/models/game/game-list.model';
import { GameModel } from '@/models/game/game.model';
import { PlatformType } from '@/types/platform.type';
import { GameCatalog } from '@/dtos/rawg/rawg-game.dto';
import { GameSaleStatusModel } from '@/interfaces/game-sale-status.interface';
import { GameLoanStatusModel } from '@/interfaces/game-loan-status.interface';
import { GameLoanDto } from '@/dtos/supabase/game-loan.dto';

/** Contract for the game repository. */
export interface GameRepositoryContract {
  /**
   * Returns all games in the user's collection.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  getAllGamesForUser(userId: string): Promise<GameModel[]>;

  /**
   * Returns all games in the user's collection with only the columns needed
   * for the list view and game cards (excludes condition, format, rawgId, rawgSlug).
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  getAllGamesForList(userId: string): Promise<GameListModel[]>;

  /**
   * Returns all games in the user's collection filtered by platform.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {PlatformType} platform - Plataforma a filtrar
   */
  getByConsole(userId: string, platform: PlatformType): Promise<GameModel[]>;

  /**
   * Adds a new game to the user's collection.
   * If a catalog entry is provided it will be linked to the game record.
   * If `targetWorkId` is provided, the new copy is added to that exact work_id
   * (caso "Añadir otra copia"): el repo omite la resolución de catalog y de
   * obra, y reutiliza el `game_catalog_id` y `work_id` proporcionados.
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {GameModel} game - Juego a guardar
   * @param {GameCatalog | null} [catalogEntry] - Optional RAWG catalog entry to associate
   * @param {string} [targetWorkId] - UUID de la work existente a la que asociar la nueva copia
   */
  addGameForUser(
    userId: string,
    game: GameModel,
    catalogEntry?: GameCatalog | null,
    targetWorkId?: string
  ): Promise<void>;

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
   * @param {string} userId - UUID del usuario autenticado
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

  /**
   * Returns all games that have been sold (sold_at IS NOT NULL) for the given user.
   *
   * @param {string} userId - UUID del usuario autenticado
   */
  getSoldGames(userId: string): Promise<GameListModel[]>;

  /**
   * Updates only the sale-related columns of a game (for_sale, sale_price, sold_at, sold_price_final).
   *
   * @param {string} userId - UUID del usuario autenticado
   * @param {string} uuid - Supabase UUID of the user_games row
   * @param {GameSaleStatusModel} sale - New sale status values
   */
  updateSaleStatus(userId: string, uuid: string, sale: GameSaleStatusModel): Promise<void>;

  /**
   * Creates a new active loan for a game. Returns the UUID of the created loan row.
   *
   * @param {GameLoanStatusModel} loan - Datos del préstamo a registrar
   */
  createLoan(loan: GameLoanStatusModel): Promise<string>;

  /**
   * Marks a loan as returned by setting returned_at to today's date.
   *
   * @param {string} loanId - UUID of the game_loans row
   */
  returnLoan(loanId: string): Promise<void>;

  /**
   * Returns the full loan history for a game, ordered by loaned_at descending.
   *
   * @param {string} userGameId - UUID of the user_games row
   */
  getLoanHistory(userGameId: string): Promise<GameLoanDto[]>;
}

/** InjectionToken for GameRepositoryContract. */
export const GAME_REPOSITORY = new InjectionToken<GameRepositoryContract>('GAME_REPOSITORY');
