/** RAWG platform entry. */
export interface RawgPlatformDto {
  id: number;
  name: string;
  slug: string;
}

/** Platform info attached to a game (includes requirements for PC). */
export interface RawgPlatformInfoDto {
  platform: RawgPlatformDto;
  released_at?: string;
  requirements?: {
    minimum?: string;
    recommended?: string;
  };
}

/** Parent platform grouping (e.g. 'PC', 'PlayStation', 'Xbox', 'Nintendo'). */
export interface RawgParentPlatformDto {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}
