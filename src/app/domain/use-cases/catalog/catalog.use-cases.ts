import { inject, Injectable } from '@angular/core';

import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { BannerSuggestionModel } from '@/models/banner/banner-suggestion.model';
import { RAWG_REPOSITORY, RawgRepositoryContract } from '@/domain/repositories/rawg.repository.contract';
import { CatalogUseCasesContract } from './catalog.use-cases.contract';

@Injectable()
export class CatalogUseCasesImpl implements CatalogUseCasesContract {
  private readonly _rawgRepo: RawgRepositoryContract = inject(RAWG_REPOSITORY);

  /**
   * Searches the RAWG catalog by title.
   *
   * @param {string} query - Search term
   * @param {number} [page=1] - Page number
   * @param {number} [pageSize=20] - Results per page
   */
  async searchGames(query: string, page: number = 1, pageSize: number = 20): Promise<GameCatalogDto[]> {
    return this._rawgRepo.searchGames(query, page, pageSize);
  }

  /**
   * Returns a list of top-rated games from RAWG.
   *
   * @param {number} [pageSize=12] - Number of results
   */
  async getTopGames(pageSize: number = 12): Promise<GameCatalogDto[]> {
    return this._rawgRepo.getTopGames(pageSize);
  }

  /**
   * Returns the full detail of a game from RAWG.
   *
   * @param {number} gameId - RAWG game ID
   */
  async getGameDetails(gameId: number): Promise<GameCatalogDto> {
    return this._rawgRepo.getGameDetails(gameId);
  }

  /**
   * Returns all screenshot URLs for a game by iterating through all pages
   * of the RAWG /games/{identifier}/screenshots endpoint.
   *
   * @param {string | number} gameIdentifier - RAWG game slug (preferred) or numeric ID
   */
  async getAllGameScreenshots(gameIdentifier: string | number): Promise<string[]> {
    const all: string[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await this._rawgRepo.getGameScreenshots(gameIdentifier, page, 40);
      all.push(...result.screenshots);
      hasMore = result.next !== null;
      page++;
    }

    return all;
  }

  /**
   * Returns top-rated games as minimal banner suggestions.
   *
   * @param {number} [pageSize=12] - Number of results
   */
  async getTopBanners(pageSize: number = 12): Promise<BannerSuggestionModel[]> {
    return this._rawgRepo.getTopBanners(pageSize);
  }

  /**
   * Searches games by title and returns minimal banner suggestions.
   *
   * @param {string} query - Search term
   * @param {number} [pageSize=12] - Results per page
   */
  async searchBanners(query: string, pageSize: number = 12): Promise<BannerSuggestionModel[]> {
    return this._rawgRepo.searchBanners(query, pageSize);
  }
}
