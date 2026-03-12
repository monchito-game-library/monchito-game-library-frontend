/** RAWG genre entry. */
export interface RawgGenreDto {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

/** RAWG tag entry. */
export interface RawgTagDto {
  id: number;
  name: string;
  slug: string;
  language?: string;
  games_count?: number;
}

/** RAWG ESRB rating entry. */
export interface RawgEsrbRatingDto {
  id: number;
  /** e.g. 'Everyone', 'Teen', 'Mature', 'Adults Only', 'Rating Pending' */
  name: string;
  /** e.g. 'everyone', 'teen', 'mature', 'adults-only', 'rating-pending' */
  slug: string;
}

/** RAWG developer entry. */
export interface RawgDeveloperDto {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

/** RAWG publisher entry. */
export interface RawgPublisherDto {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

/** RAWG store entity. */
export interface RawgStoreDto {
  id: number;
  /** e.g. 'Steam', 'PlayStation Store', 'Xbox Store' */
  name: string;
  slug: string;
  domain?: string;
  games_count?: number;
  image_background?: string;
}

/** Store entry attached to a game, with the purchase URL. */
export interface RawgStoreInfoDto {
  id: number;
  store: RawgStoreDto;
  url?: string;
}

/** Game screenshot entry. */
export interface RawgScreenshotDto {
  id: number;
  image: string;
  width?: number;
  height?: number;
  is_deleted?: boolean;
}

/** User rating breakdown (exceptional / recommended / meh / skip). */
export interface RawgRatingDto {
  id: number;
  /** e.g. 'exceptional', 'recommended', 'meh', 'skip' */
  title: string;
  count: number;
  percent: number;
}
