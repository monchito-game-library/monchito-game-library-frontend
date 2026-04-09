import { RawgPlatformInfoDto, RawgParentPlatformDto } from './rawg-platform.dto';
import {
  RawgGenreDto,
  RawgTagDto,
  RawgEsrbRatingDto,
  RawgDeveloperDto,
  RawgPublisherDto,
  RawgStoreInfoDto,
  RawgScreenshotDto,
  RawgRatingDto
} from './rawg-metadata.dto';

/** Game entry returned by the RAWG /games search endpoint. */
export interface RawgGameDto {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  tba: boolean;
  background_image: string | null;
  rating: number;
  rating_top: number;
  ratings: RawgRatingDto[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status?: {
    yet?: number;
    owned?: number;
    beaten?: number;
    toplay?: number;
    dropped?: number;
    playing?: number;
  };
  metacritic: number | null;
  playtime: number;
  suggestions_count: number;
  updated: string;
  reviews_count: number;
  saturated_color?: string;
  dominant_color?: string;
  platforms: RawgPlatformInfoDto[];
  parent_platforms: RawgParentPlatformDto[];
  genres: RawgGenreDto[];
  stores: RawgStoreInfoDto[];
  tags: RawgTagDto[];
  esrb_rating: RawgEsrbRatingDto | null;
  /**
   * Undocumented field — not present in the official RAWG spec.
   * Returns up to 6 images. The `/games/{id}/screenshots` endpoint also returns
   * the same 6 via the public API (RAWG limits this for non-internal consumers).
   */
  short_screenshots?: RawgScreenshotDto[];
}

/** Full game detail returned by the RAWG /games/{id} endpoint. */
export interface RawgGameDetailDto extends RawgGameDto {
  name_original: string;
  /** HTML format */
  description: string;
  /** Plain text format */
  description_raw: string;
  metacritic_platforms: Array<{
    metascore: number;
    url: string;
    platform: { platform: number; name: string; slug: string };
  }>;
  metacritic_url?: string;
  website: string;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: number;
  youtube_count: number;
  screenshots_count: number;
  movies_count: number;
  creators_count: number;
  achievements_count: number;
  parent_achievements_count: number;
  developers: RawgDeveloperDto[];
  publishers: RawgPublisherDto[];
  reactions?: Record<string, number>;
  alternative_names?: string[];
}

/**
 * Minimal projection of a RAWG game list result.
 * Only the two fields the banner picker needs — avoids deserialising platforms, tags, genres, etc.
 */
export interface RawgBannerItemDto {
  name: string;
  background_image: string | null;
}

/** Response from the RAWG /games search endpoint. */
export interface RawgSearchResponseDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGameDto[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  seo_h1?: string;
  noindex?: boolean;
  nofollow?: boolean;
  description?: string;
  nofollow_collections?: string[];
}

/**
 * RAWG game entry mapped to the shape needed to insert into our game_catalog table.
 * Used by the repository when staging a RAWG selection before saving.
 */
export interface GameCatalog {
  id?: string;
  rawg_id: number;
  title: string;
  slug: string;
  image_url: string | null;
  released_date: string | null;
  rating: number;
  platforms: string[];
  genres: string[];
  screenshots?: string[];
  description?: string;
  created_at?: string;
  updated_at?: string;
}
