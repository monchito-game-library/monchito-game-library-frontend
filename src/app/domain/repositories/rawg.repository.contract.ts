import { InjectionToken } from '@angular/core';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';

export interface RawgRepositoryContract {
  /**
   * Searches the RAWG catalog by title and returns the results mapped to GameCatalogDto.
   *
   * @param {string} query - Search term
   * @param {number} [page] - Page number (default: 1)
   * @param {number} [pageSize] - Results per page (default: 20, max: 40)
   */
  searchGames(query: string, page?: number, pageSize?: number): Promise<GameCatalogDto[]>;

  /**
   * Returns a list of top-rated games from RAWG (no search term).
   * Used to pre-populate the banner picker on load.
   *
   * @param {number} [pageSize] - Number of results to fetch (default: 12)
   */
  getTopGames(pageSize?: number): Promise<GameCatalogDto[]>;

  /**
   * Returns the full detail of a game from RAWG mapped to GameCatalogDto.
   *
   * @param {number} gameId - RAWG game ID
   */
  getGameDetails(gameId: number): Promise<GameCatalogDto>;
}

export const RAWG_REPOSITORY = new InjectionToken<RawgRepositoryContract>('RawgRepositoryContract');
