import { InjectionToken } from '@angular/core';

import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { BannerSuggestionModel } from '@/models/banner/banner-suggestion.model';

export interface CatalogUseCasesContract {
  /**
   * Searches the RAWG catalog by title.
   *
   * @param {string} query - Search term
   * @param {number} [page] - Page number (default: 1)
   * @param {number} [pageSize] - Results per page (default: 20)
   */
  searchGames(query: string, page?: number, pageSize?: number): Promise<GameCatalogDto[]>;

  /**
   * Returns a list of top-rated games from RAWG.
   *
   * @param {number} [pageSize] - Number of results (default: 12)
   */
  getTopGames(pageSize?: number): Promise<GameCatalogDto[]>;

  /**
   * Returns the full detail of a game from RAWG.
   *
   * @param {number} gameId - RAWG game ID
   */
  getGameDetails(gameId: number): Promise<GameCatalogDto>;

  /**
   * Returns all screenshot URLs for a game, iterating through all pages.
   * Prefer passing the slug over the numeric ID — RAWG returns more results with the slug.
   *
   * @param {string | number} gameIdentifier - RAWG game slug (preferred) or numeric ID
   */
  getAllGameScreenshots(gameIdentifier: string | number): Promise<string[]>;

  /**
   * Returns top-rated games as minimal banner suggestions (image + title only).
   * Used by the settings banner picker — avoids deserialising platforms, tags, etc.
   *
   * @param {number} [pageSize] - Number of results (default: 12)
   */
  getTopBanners(pageSize?: number): Promise<BannerSuggestionModel[]>;

  /**
   * Searches games by title and returns minimal banner suggestions (image + title only).
   *
   * @param {string} query - Search term
   * @param {number} [pageSize] - Results per page (default: 12)
   */
  searchBanners(query: string, pageSize?: number): Promise<BannerSuggestionModel[]>;
}

export const CATALOG_USE_CASES = new InjectionToken<CatalogUseCasesContract>('CATALOG_USE_CASES');
