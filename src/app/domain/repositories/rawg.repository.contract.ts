import { InjectionToken } from '@angular/core';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { BannerSuggestionModel } from '@/models/banner/banner-suggestion.model';

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

  /**
   * Returns the full detail of a game from RAWG mapped to GameCatalogDto.
   *
   * @param {number} gameId - RAWG game ID
   */
  getGameDetails(gameId: number): Promise<GameCatalogDto>;

  /**
   * Returns one page of screenshots for a game from the RAWG /games/{identifier}/screenshots endpoint.
   * Prefer passing the slug over the numeric ID — RAWG returns more results with the slug.
   *
   * @param {string | number} gameIdentifier - RAWG game slug (preferred) or numeric ID
   * @param {number} [page=1] - Page number
   * @param {number} [pageSize=40] - Results per page (max 40)
   */
  getGameScreenshots(
    gameIdentifier: string | number,
    page?: number,
    pageSize?: number
  ): Promise<{ count: number; next: string | null; screenshots: string[] }>;
}

export const RAWG_REPOSITORY = new InjectionToken<RawgRepositoryContract>('RawgRepositoryContract');
