import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { RawgRepository } from './rawg.repository';

// No Supabase needed — mock fetch instead
const mockFetch = vi.spyOn(globalThis, 'fetch');

const rawgGame = {
  id: 58175,
  name: 'God of War',
  slug: 'god-of-war',
  background_image: 'https://media.rawg.io/gow.jpg',
  released: '2018-04-20',
  rating: 4.42,
  metacritic: 94,
  esrb_rating: { slug: 'mature' },
  platforms: [{ platform: { name: 'PlayStation 4' } }],
  parent_platforms: [{ platform: { slug: 'playstation' } }],
  genres: [{ name: 'Action' }],
  tags: [],
  developers: [],
  publishers: [],
  stores: []
};

const rawgDetailGame = {
  ...rawgGame,
  description_raw: 'An epic game.',
  background_image_additional: null,
  rating_top: 5,
  ratings_count: 1000,
  reviews_count: 500,
  metacritic_platforms: [],
  metacritic_url: null,
  website: null,
  reddit_url: null,
  reddit_name: null,
  added: 12000,
  added_by_status: null,
  tba: false,
  updated: '2024-01-01'
};

function mockFetchOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data
  } as Response);
}

function mockFetchFail(status = 500, statusText = 'Internal Server Error') {
  mockFetch.mockResolvedValueOnce({ ok: false, status, statusText } as Response);
}

describe('RawgRepository', () => {
  let repo: RawgRepository;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({ providers: [RawgRepository] });
    repo = TestBed.inject(RawgRepository);
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  describe('searchGames', () => {
    it('devuelve los juegos mapeados', async () => {
      mockFetchOk({ results: [rawgGame] });

      const result = await repo.searchGames('god of war');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('God of War');
    });

    it('construye la URL con los parámetros correctos', async () => {
      mockFetchOk({ results: [] });

      await repo.searchGames('zelda', 2, 10);

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('search=zelda');
      expect(url).toContain('page=2');
      expect(url).toContain('page_size=10');
    });

    it('lanza error cuando la API devuelve un código de error', async () => {
      mockFetchFail(404, 'Not Found');

      await expect(repo.searchGames('xxx')).rejects.toThrow('RAWG API error: 404 Not Found');
    });
  });

  describe('getTopGames', () => {
    it('devuelve juegos ordenados por rating', async () => {
      mockFetchOk({ results: [rawgGame] });

      const result = await repo.getTopGames(6);

      expect(result).toHaveLength(1);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('ordering=-rating');
      expect(url).toContain('page_size=6');
    });

    it('lanza error cuando la API devuelve un código de error', async () => {
      mockFetchFail(503, 'Service Unavailable');

      await expect(repo.getTopGames()).rejects.toThrow('RAWG API error: 503 Service Unavailable');
    });
  });

  describe('getTopBanners', () => {
    it('devuelve sugerencias de banner mapeadas', async () => {
      mockFetchOk({ results: [{ name: 'God of War', background_image: 'https://img.example.com/gow.jpg' }] });

      const result = await repo.getTopBanners(6);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('God of War');
      expect(result[0].imageUrl).toBe('https://img.example.com/gow.jpg');
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('ordering=-rating');
      expect(url).toContain('page_size=6');
    });

    it('lanza error cuando la API devuelve un código de error', async () => {
      mockFetchFail(500, 'Internal Server Error');

      await expect(repo.getTopBanners()).rejects.toThrow('RAWG API error: 500 Internal Server Error');
    });
  });

  describe('searchBanners', () => {
    it('devuelve sugerencias de banner mapeadas para la búsqueda', async () => {
      mockFetchOk({ results: [{ name: 'Zelda', background_image: null }] });

      const result = await repo.searchBanners('zelda', 5);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Zelda');
      expect(result[0].imageUrl).toBe('');
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('search=zelda');
      expect(url).toContain('page_size=5');
    });

    it('lanza error cuando la API devuelve un código de error', async () => {
      mockFetchFail(401, 'Unauthorized');

      await expect(repo.searchBanners('zelda')).rejects.toThrow('RAWG API error: 401 Unauthorized');
    });
  });

  describe('getGameDetails', () => {
    it('devuelve el detalle del juego mapeado', async () => {
      mockFetchOk(rawgDetailGame);

      const result = await repo.getGameDetails(58175);

      expect(result.title).toBe('God of War');
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/games/58175');
    });

    it('lanza error cuando la API devuelve un código de error', async () => {
      mockFetchFail(404, 'Not Found');

      await expect(repo.getGameDetails(9999)).rejects.toThrow('RAWG API error: 404 Not Found');
    });
  });

  describe('getGameScreenshots', () => {
    it('devuelve screenshots filtradas (excluye deleted)', async () => {
      mockFetchOk({
        count: 2,
        next: null,
        results: [
          { image: 'ss1.jpg', is_deleted: false },
          { image: 'ss2.jpg', is_deleted: true }
        ]
      });

      const result = await repo.getGameScreenshots('god-of-war');

      expect(result.screenshots).toEqual(['ss1.jpg']);
      expect(result.count).toBe(2);
      expect(result.next).toBeNull();
    });

    it('construye la URL con el identificador correcto', async () => {
      mockFetchOk({ count: 0, next: null, results: [] });

      await repo.getGameScreenshots(42, 2, 20);

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('/games/42/screenshots');
      expect(url).toContain('page=2');
      expect(url).toContain('page_size=20');
    });

    it('lanza error cuando la API devuelve un código de error', async () => {
      mockFetchFail(500, 'Internal Server Error');

      await expect(repo.getGameScreenshots('god-of-war')).rejects.toThrow('RAWG API error: 500 Internal Server Error');
    });
  });
});
