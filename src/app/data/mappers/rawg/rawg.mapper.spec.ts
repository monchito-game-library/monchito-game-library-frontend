import { describe, expect, it } from 'vitest';

import { RawgBannerItemDto, RawgGameDto, RawgGameDetailDto } from '@/dtos/rawg/rawg-game.dto';
import { mapRawgBanner, mapRawgGame, mapRawgGameDetail } from '@/mappers/rawg/rawg.mapper';

// ─── mapRawgBanner ────────────────────────────────────────────────────────────

describe('mapRawgBanner', () => {
  it('mapea imageUrl y title correctamente', () => {
    const dto: RawgBannerItemDto = { background_image: 'https://example.com/bg.jpg', name: 'God of War' };
    const result = mapRawgBanner(dto);

    expect(result.imageUrl).toBe('https://example.com/bg.jpg');
    expect(result.title).toBe('God of War');
  });

  it('reemplaza background_image null por cadena vacía', () => {
    const dto: RawgBannerItemDto = { background_image: null, name: 'Test' };
    expect(mapRawgBanner(dto).imageUrl).toBe('');
  });
});

// ─── Fixtures compartidos ─────────────────────────────────────────────────────

const baseRawgDto: RawgGameDto = {
  id: 42,
  slug: 'god-of-war',
  name: 'God of War',
  released: '2018-04-20',
  tba: false,
  background_image: 'https://media.rawg.io/media/games/gow.jpg',
  rating: 4.44,
  rating_top: 5,
  ratings: [],
  ratings_count: 9800,
  reviews_text_count: 0,
  added: 50000,
  metacritic: 94,
  playtime: 22,
  suggestions_count: 300,
  updated: '2026-01-01T00:00:00Z',
  reviews_count: 200,
  platforms: [{ platform: { id: 18, name: 'PlayStation 4', slug: 'playstation4' } }],
  parent_platforms: [{ platform: { id: 2, name: 'PlayStation', slug: 'playstation' } }],
  genres: [{ id: 4, name: 'Action', slug: 'action' }],
  stores: [
    {
      id: 1,
      store: { id: 3, name: 'PlayStation Store', slug: 'playstation-store', domain: 'store.playstation.com' },
      url: ''
    }
  ],
  tags: [
    { id: 1, name: 'Singleplayer', slug: 'singleplayer', language: 'eng' },
    { id: 2, name: 'Action', slug: 'action', language: 'eng' },
    { id: 3, name: 'Adventure', slug: 'adventure', language: 'eng' },
    { id: 4, name: 'RPG', slug: 'rpg', language: 'eng' },
    { id: 5, name: 'Fantasy', slug: 'fantasy', language: 'eng' },
    { id: 6, name: 'Open World', slug: 'open-world', language: 'eng' },
    { id: 7, name: 'Story Rich', slug: 'story-rich', language: 'eng' },
    { id: 8, name: 'Norse Mythology', slug: 'norse-mythology', language: 'eng' },
    { id: 9, name: 'Hack and Slash', slug: 'hack-and-slash', language: 'eng' },
    { id: 10, name: 'Third Person', slug: 'third-person', language: 'eng' },
    { id: 11, name: 'Extra tag', slug: 'extra', language: 'eng' }
  ],
  esrb_rating: { id: 4, name: 'Mature', slug: 'mature' },
  short_screenshots: [{ id: 1, image: 'https://media.rawg.io/media/screenshots/ss1.jpg' }]
};

// ─── mapRawgGame ─────────────────────────────────────────────────────────────

describe('mapRawgGame', () => {
  it('mapea los campos básicos correctamente', () => {
    const result = mapRawgGame(baseRawgDto);

    expect(result.rawg_id).toBe(42);
    expect(result.slug).toBe('god-of-war');
    expect(result.title).toBe('God of War');
    expect(result.released_date).toBe('2018-04-20');
    expect(result.tba).toBe(false);
    expect(result.image_url).toBe('https://media.rawg.io/media/games/gow.jpg');
    expect(result.rating).toBe(4.44);
    expect(result.metacritic_score).toBe(94);
    expect(result.esrb_rating).toBe('Mature');
    expect(result.source).toBe('rawg');
  });

  it('extrae los nombres de plataformas y parent_platforms', () => {
    const result = mapRawgGame(baseRawgDto);

    expect(result.platforms).toEqual(['PlayStation 4']);
    expect(result.parent_platforms).toEqual(['PlayStation']);
  });

  it('extrae los nombres de géneros', () => {
    expect(mapRawgGame(baseRawgDto).genres).toEqual(['Action']);
  });

  it('limita tags a los 10 primeros', () => {
    expect(mapRawgGame(baseRawgDto).tags).toHaveLength(10);
  });

  it('extrae screenshots de short_screenshots', () => {
    expect(mapRawgGame(baseRawgDto).screenshots).toEqual(['https://media.rawg.io/media/screenshots/ss1.jpg']);
  });

  it('deja developers y publishers vacíos (no disponibles en búsqueda)', () => {
    const result = mapRawgGame(baseRawgDto);
    expect(result.developers).toEqual([]);
    expect(result.publishers).toEqual([]);
  });

  it('maneja arrays undefined con arrays vacíos', () => {
    const dto = {
      ...baseRawgDto,
      platforms: undefined as unknown as RawgGameDto['platforms'],
      genres: undefined as unknown as RawgGameDto['genres'],
      tags: undefined as unknown as RawgGameDto['tags']
    };
    const result = mapRawgGame(dto);

    expect(result.platforms).toEqual([]);
    expect(result.genres).toEqual([]);
    expect(result.tags).toEqual([]);
  });

  it('mapea metacritic null a null', () => {
    expect(mapRawgGame({ ...baseRawgDto, metacritic: null }).metacritic_score).toBeNull();
  });

  it('mapea esrb_rating null a null', () => {
    expect(mapRawgGame({ ...baseRawgDto, esrb_rating: null }).esrb_rating).toBeNull();
  });
});

// ─── mapRawgGameDetail ────────────────────────────────────────────────────────

describe('mapRawgGameDetail', () => {
  const detailDto: RawgGameDetailDto = {
    ...baseRawgDto,
    name_original: 'God of War',
    description: '<p>Descripción HTML</p>',
    description_raw: 'Descripción HTML',
    metacritic_platforms: [],
    metacritic_url: 'https://www.metacritic.com/game/god-of-war/',
    website: 'https://www.playstation.com/es-es/games/god-of-war/',
    reddit_url: '',
    reddit_name: '',
    reddit_description: '',
    reddit_logo: '',
    reddit_count: 0,
    twitch_count: 0,
    youtube_count: 0,
    screenshots_count: 1,
    movies_count: 0,
    creators_count: 1,
    achievements_count: 0,
    parent_achievements_count: 0,
    developers: [{ id: 1, name: 'SIE Santa Monica Studio', slug: 'sie-santa-monica-studio' }],
    publishers: [{ id: 1, name: 'Sony Interactive Entertainment', slug: 'sony' }],
    stores: [
      {
        id: 1,
        store: { id: 3, name: 'PlayStation Store', slug: 'playstation-store', domain: 'store.playstation.com' },
        url: 'https://store.playstation.com'
      }
    ]
  };

  it('incluye descripción y descripción raw', () => {
    const result = mapRawgGameDetail(detailDto);

    expect(result.description).toBe('<p>Descripción HTML</p>');
    expect(result.description_raw).toBe('Descripción HTML');
  });

  it('incluye developers y publishers', () => {
    const result = mapRawgGameDetail(detailDto);

    expect(result.developers).toEqual(['SIE Santa Monica Studio']);
    expect(result.publishers).toEqual(['Sony Interactive Entertainment']);
  });

  it('incluye metacritic_url y website', () => {
    const result = mapRawgGameDetail(detailDto);

    expect(result.metacritic_url).toBe('https://www.metacritic.com/game/god-of-war/');
    expect(result.website).toBe('https://www.playstation.com/es-es/games/god-of-war/');
  });

  it('limita tags a los 15 primeros en detalle (vs 10 en búsqueda)', () => {
    const manyTags = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      name: `Tag ${i}`,
      slug: `tag-${i}`,
      language: 'eng'
    }));
    const result = mapRawgGameDetail({ ...detailDto, tags: manyTags });

    expect(result.tags).toHaveLength(15);
  });
});
