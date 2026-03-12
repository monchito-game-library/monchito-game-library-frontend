import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { RawgGame, RawgSearchResponse, RawgGameDetail, GameCatalog } from '@/dtos/rawg/rawg.dto';
import { GameCatalogV3 } from '@/interfaces/game-catalog-v3.interface';

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
   * Convierte un juego de RAWG a nuestro formato de catálogo (legacy)
   * @deprecated Use convertToGameCatalogV3 for schema v3
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
   * Convierte un juego de RAWG a formato de catálogo v3 (con TODOS los campos)
   * @param rawgGame Juego de RAWG (búsqueda básica)
   * @returns GameCatalogV3 con todos los campos mapeados
   */
  convertToGameCatalogV3(rawgGame: any): GameCatalogV3 {
    return {
      rawg_id: rawgGame.id,
      slug: rawgGame.slug,
      title: rawgGame.name,
      description_raw: undefined, // No disponible en búsqueda básica
      released_date: rawgGame.released,
      tba: rawgGame.tba || false,
      image_url: rawgGame.background_image,
      rating: rawgGame.rating,
      rating_top: rawgGame.rating_top || 5,
      ratings_count: rawgGame.ratings_count || 0,
      reviews_count: rawgGame.reviews_count || 0,
      metacritic_score: rawgGame.metacritic || null,
      metacritic_url: undefined, // No disponible en búsqueda básica
      esrb_rating: rawgGame.esrb_rating?.name || null,
      platforms: rawgGame.platforms?.map((p: any) => p.platform.name) || [],
      parent_platforms: rawgGame.parent_platforms?.map((pp: any) => pp.platform.name) || [],
      genres: rawgGame.genres?.map((g: any) => g.name) || [],
      tags: rawgGame.tags?.slice(0, 10).map((t: any) => t.name) || [], // Limitamos a 10 tags
      developers: [], // No disponible en búsqueda básica
      publishers: [], // No disponible en búsqueda básica
      stores:
        rawgGame.stores?.map((s: any) => ({
          id: s.store.id,
          name: s.store.name,
          url: s.url
        })) || [],
      screenshots: rawgGame.short_screenshots?.map((ss: any) => ss.image) || [],
      website: undefined, // No disponible en búsqueda básica
      source: 'rawg',
      added_by_user_id: undefined,
      times_added_by_users: 0
    };
  }

  /**
   * Convierte los detalles de un juego de RAWG a nuestro formato de catálogo (legacy)
   * @deprecated Use convertDetailToGameCatalogV3 for schema v3
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

  /**
   * Convierte los detalles completos de un juego de RAWG a formato v3
   * Incluye TODOS los campos disponibles en la API
   * @param rawgGame Juego detallado de RAWG (/games/{id})
   * @returns GameCatalogV3 completo
   */
  convertDetailToGameCatalogV3(rawgGame: any): GameCatalogV3 {
    return {
      rawg_id: rawgGame.id,
      slug: rawgGame.slug,
      title: rawgGame.name,
      description: rawgGame.description || undefined,
      description_raw: rawgGame.description_raw || undefined,
      released_date: rawgGame.released,
      tba: rawgGame.tba || false,
      image_url: rawgGame.background_image,
      background_image_additional: undefined, // RAWG no proporciona imagen adicional directamente
      rating: rawgGame.rating,
      rating_top: rawgGame.rating_top || 5,
      ratings_count: rawgGame.ratings_count || 0,
      reviews_count: rawgGame.reviews_count || 0,
      metacritic_score: rawgGame.metacritic || null,
      metacritic_url: rawgGame.metacritic_url || undefined,
      esrb_rating: rawgGame.esrb_rating?.name || null,
      platforms: rawgGame.platforms?.map((p: any) => p.platform.name) || [],
      parent_platforms: rawgGame.parent_platforms?.map((pp: any) => pp.platform.name) || [],
      genres: rawgGame.genres?.map((g: any) => g.name) || [],
      tags: rawgGame.tags?.slice(0, 15).map((t: any) => t.name) || [], // Más tags en detalles
      developers: rawgGame.developers?.map((d: any) => d.name) || [],
      publishers: rawgGame.publishers?.map((p: any) => p.name) || [],
      stores:
        rawgGame.stores?.map((s: any) => ({
          id: s.store.id,
          name: s.store.name,
          domain: s.store.domain,
          url: s.url
        })) || [],
      screenshots: rawgGame.short_screenshots?.map((ss: any) => ss.image) || [],
      website: rawgGame.website || undefined,
      source: 'rawg',
      added_by_user_id: undefined,
      times_added_by_users: 0
    };
  }
}
