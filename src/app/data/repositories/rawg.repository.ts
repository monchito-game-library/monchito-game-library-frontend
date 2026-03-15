import { Injectable } from '@angular/core';

import { environment } from '@/env';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { RawgGameDetailDto, RawgSearchResponseDto } from '@/dtos/rawg/rawg-game.dto';
import { RawgScreenshotDto } from '@/dtos/rawg/rawg-metadata.dto';
import { RawgRepositoryContract } from '@/domain/repositories/rawg.repository.contract';
import { mapRawgBanner, mapRawgGame, mapRawgGameDetail } from '@/mappers/rawg/rawg.mapper';
import { BannerSuggestionModel } from '@/models/banner/banner-suggestion.model';

/** Game repository backed by the RAWG API (https://api.rawg.io/docs/). */
@Injectable({ providedIn: 'root' })
export class RawgRepository implements RawgRepositoryContract {
  private readonly _apiUrl: string = environment.rawg.apiUrl;
  private readonly _apiKey: string = environment.rawg.apiKey;

  /**
   * Searches the RAWG catalog by title and returns the results mapped to GameCatalogDto.
   *
   * @param {string} query - Search term
   * @param {number} [page=1] - Page number
   * @param {number} [pageSize=20] - Results per page (max 40)
   */
  async searchGames(query: string, page: number = 1, pageSize: number = 20): Promise<GameCatalogDto[]> {
    const params = new URLSearchParams({
      search: query,
      page: page.toString(),
      page_size: pageSize.toString()
    });

    if (this._apiKey) params.append('key', this._apiKey);

    const response = await fetch(`${this._apiUrl}/games?${params.toString()}`);
    if (!response.ok) throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);

    const data: RawgSearchResponseDto = await response.json();
    return data.results.map(mapRawgGame);
  }

  /**
   * Returns a list of top-rated games from RAWG without a search term.
   * Used to pre-populate the banner picker when the user has not typed anything yet.
   *
   * @param {number} [pageSize=12] - Number of results to fetch (max 40)
   */
  async getTopGames(pageSize: number = 12): Promise<GameCatalogDto[]> {
    const params = new URLSearchParams({
      page: '1',
      page_size: pageSize.toString(),
      ordering: '-rating'
    });

    if (this._apiKey) params.append('key', this._apiKey);

    const response = await fetch(`${this._apiUrl}/games?${params.toString()}`);
    if (!response.ok) throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);

    const data: RawgSearchResponseDto = await response.json();
    return data.results.map(mapRawgGame);
  }

  /**
   * Returns top-rated games as minimal banner suggestions (image + title only).
   *
   * @param {number} [pageSize=12]
   */
  async getTopBanners(pageSize: number = 12): Promise<BannerSuggestionModel[]> {
    const params = new URLSearchParams({ page: '1', page_size: pageSize.toString(), ordering: '-rating' });
    if (this._apiKey) params.append('key', this._apiKey);

    const response = await fetch(`${this._apiUrl}/games?${params.toString()}`);
    if (!response.ok) throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);

    const data: { results: { name: string; background_image: string | null }[] } = await response.json();
    return data.results.map(mapRawgBanner);
  }

  /**
   * Searches games by title and returns minimal banner suggestions (image + title only).
   *
   * @param {string} query - Search term
   * @param {number} [pageSize=12]
   */
  async searchBanners(query: string, pageSize: number = 12): Promise<BannerSuggestionModel[]> {
    const params = new URLSearchParams({ search: query, page: '1', page_size: pageSize.toString() });
    if (this._apiKey) params.append('key', this._apiKey);

    const response = await fetch(`${this._apiUrl}/games?${params.toString()}`);
    if (!response.ok) throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);

    const data: { results: { name: string; background_image: string | null }[] } = await response.json();
    return data.results.map(mapRawgBanner);
  }

  /**
   * Returns the full detail of a game from RAWG mapped to GameCatalogDto.
   *
   * @param {number} gameId - RAWG game ID
   */
  async getGameDetails(gameId: number): Promise<GameCatalogDto> {
    const params = new URLSearchParams();
    if (this._apiKey) params.append('key', this._apiKey);

    const response = await fetch(`${this._apiUrl}/games/${gameId}?${params.toString()}`);
    if (!response.ok) throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);

    const data: RawgGameDetailDto = await response.json();
    return mapRawgGameDetail(data);
  }

  /**
   * Returns one page of screenshots for a game from the RAWG /games/{identifier}/screenshots endpoint.
   * Prefer passing the slug over the numeric ID — RAWG returns more results with the slug.
   *
   * @param {string | number} gameIdentifier - RAWG game slug (preferred) or numeric ID
   * @param {number} [page=1] - Page number
   * @param {number} [pageSize=40] - Results per page (max 40)
   */
  async getGameScreenshots(
    gameIdentifier: string | number,
    page: number = 1,
    pageSize: number = 40
  ): Promise<{ count: number; next: string | null; screenshots: string[] }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      with_deleted: 'false'
    });
    if (this._apiKey) params.append('key', this._apiKey);

    const response = await fetch(`${this._apiUrl}/games/${gameIdentifier}/screenshots?${params.toString()}`);
    if (!response.ok) throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);

    const data: { count: number; next: string | null; results: RawgScreenshotDto[] } = await response.json();
    return {
      count: data.count,
      next: data.next,
      screenshots: data.results.filter((s: RawgScreenshotDto) => !s.is_deleted).map((s: RawgScreenshotDto) => s.image)
    };
  }
}
