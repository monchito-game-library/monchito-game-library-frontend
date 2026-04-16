import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { RawgBannerItemDto, RawgGameDto, RawgGameDetailDto } from '@/dtos/rawg/rawg-game.dto';
import { BannerSuggestionModel } from '@/models/banner/banner-suggestion.model';
/**
 * Maps a minimal RAWG list item to BannerSuggestionModel.
 * Skips all metadata — only image and title are needed by the banner picker.
 *
 * @param {RawgBannerItemDto} dto - Raw RAWG banner list item
 */
export function mapRawgBanner(dto: RawgBannerItemDto): BannerSuggestionModel {
  return {
    imageUrl: dto.background_image ?? '',
    title: dto.name
  };
}

/**
 * Maps a basic RAWG search result to a GameCatalogDto.
 * Detail-only fields (description, developers, publishers) are left empty.
 *
 * @param {RawgGameDto} dto - Raw RAWG search result
 */
export function mapRawgGame(dto: RawgGameDto): GameCatalogDto {
  return {
    rawg_id: dto.id,
    slug: dto.slug,
    title: dto.name,
    released_date: dto.released,
    tba: dto.tba ?? false,
    image_url: dto.background_image,
    rating: dto.rating,
    rating_top: dto.rating_top ?? 5,
    ratings_count: dto.ratings_count ?? 0,
    reviews_count: dto.reviews_count ?? 0,
    metacritic_score: dto.metacritic ?? null,
    esrb_rating: dto.esrb_rating?.name ?? null,
    platforms: dto.platforms?.map((p) => p.platform.name) ?? [],
    parent_platforms: dto.parent_platforms?.map((pp) => pp.platform.name) ?? [],
    genres: dto.genres?.map((g) => g.name) ?? [],
    tags: dto.tags?.slice(0, 10).map((t) => t.name) ?? [],
    developers: [],
    publishers: [],
    stores: dto.stores?.map((s) => ({ id: s.store.id, name: s.store.name, url: s.url })) ?? [],
    screenshots: dto.short_screenshots?.map((ss) => ss.image) ?? [],
    source: 'rawg',
    times_added_by_users: 0
  };
}

/**
 * Maps a detailed RAWG game response to a GameCatalogDto.
 * Includes all available fields from the /games/{id} endpoint.
 *
 * @param {RawgGameDetailDto} dto - Raw RAWG detail response
 */
export function mapRawgGameDetail(dto: RawgGameDetailDto): GameCatalogDto {
  return {
    rawg_id: dto.id,
    slug: dto.slug,
    title: dto.name,
    description: dto.description || undefined,
    description_raw: dto.description_raw || undefined,
    released_date: dto.released,
    tba: dto.tba ?? false,
    image_url: dto.background_image,
    rating: dto.rating,
    rating_top: dto.rating_top ?? 5,
    ratings_count: dto.ratings_count ?? 0,
    reviews_count: dto.reviews_count ?? 0,
    metacritic_score: dto.metacritic ?? null,
    metacritic_url: dto.metacritic_url ?? undefined,
    esrb_rating: dto.esrb_rating?.name ?? null,
    platforms: dto.platforms?.map((p) => p.platform.name) ?? [],
    parent_platforms: dto.parent_platforms?.map((pp) => pp.platform.name) ?? [],
    genres: dto.genres?.map((g) => g.name) ?? [],
    tags: dto.tags?.slice(0, 15).map((t) => t.name) ?? [],
    developers: dto.developers?.map((d) => d.name) ?? [],
    publishers: dto.publishers?.map((p) => p.name) ?? [],
    stores: dto.stores?.map((s) => ({ id: s.store.id, name: s.store.name, domain: s.store.domain, url: s.url })) ?? [],
    screenshots: dto.short_screenshots?.map((ss) => ss.image) ?? [],
    website: dto.website || undefined,
    source: 'rawg',
    times_added_by_users: 0
  };
}
