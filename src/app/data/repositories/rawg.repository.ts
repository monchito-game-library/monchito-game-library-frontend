import { Injectable } from '@angular/core';

import { environment } from '@/env';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { RawgGameDetailDto, RawgSearchResponseDto } from '@/dtos/rawg/rawg-game.dto';
import { RawgRepositoryContract } from '@/domain/repositories/rawg.repository.contract';
import { mapRawgGame, mapRawgGameDetail } from '@/mappers/rawg/rawg.mapper';

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
}
