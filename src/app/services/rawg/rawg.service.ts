import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RawgGame, RawgSearchResponse, RawgGameDetail, GameCatalog } from './rawg.interface';

/**
 * Servicio para interactuar con la API de RAWG
 * Documentación: https://api.rawg.io/docs/
 */
@Injectable({ providedIn: 'root' })
export class RawgService {
  private readonly apiUrl = environment.rawg.apiUrl;
  private readonly apiKey = environment.rawg.apiKey;

  /**
   * Busca juegos por nombre
   * @param query Término de búsqueda
   * @param page Página de resultados (default: 1)
   * @param pageSize Número de resultados por página (default: 20, max: 40)
   */
  async searchGames(query: string, page = 1, pageSize = 20): Promise<RawgSearchResponse> {
    const params = new URLSearchParams({
      search: query,
      page: page.toString(),
      page_size: pageSize.toString()
    });

    if (this.apiKey) {
      params.append('key', this.apiKey);
    }

    const response = await fetch(`${this.apiUrl}/games?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Obtiene los detalles completos de un juego
   * @param gameId ID del juego en RAWG
   */
  async getGameDetails(gameId: number): Promise<RawgGameDetail> {
    const params = new URLSearchParams();

    if (this.apiKey) {
      params.append('key', this.apiKey);
    }

    const response = await fetch(`${this.apiUrl}/games/${gameId}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Convierte un juego de RAWG a nuestro formato de catálogo
   */
  convertToGameCatalog(rawgGame: RawgGame): GameCatalog {
    return {
      rawg_id: rawgGame.id,
      title: rawgGame.name,
      slug: rawgGame.slug,
      image_url: rawgGame.background_image,
      released_date: rawgGame.released,
      rating: rawgGame.rating,
      platforms: rawgGame.platforms?.map((p) => p.platform.name) || [],
      genres: rawgGame.genres?.map((g) => g.name) || []
    };
  }

  /**
   * Convierte los detalles de un juego de RAWG a nuestro formato de catálogo
   */
  convertDetailToGameCatalog(rawgGame: RawgGameDetail): GameCatalog {
    return {
      rawg_id: rawgGame.id,
      title: rawgGame.name,
      slug: rawgGame.slug,
      image_url: rawgGame.background_image,
      released_date: rawgGame.released,
      rating: rawgGame.rating,
      platforms: rawgGame.platforms?.map((p) => p.platform.name) || [],
      genres: rawgGame.genres?.map((g) => g.name) || [],
      description: rawgGame.description_raw || rawgGame.description
    };
  }
}
