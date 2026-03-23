import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { RAWG_REPOSITORY, RawgRepositoryContract } from '@/domain/repositories/rawg.repository.contract';
import { CatalogUseCasesImpl } from './catalog.use-cases';

const mockRepo: RawgRepositoryContract = {
  searchGames: vi.fn(),
  getTopGames: vi.fn(),
  getTopBanners: vi.fn(),
  searchBanners: vi.fn(),
  getGameDetails: vi.fn(),
  getGameScreenshots: vi.fn()
};

describe('CatalogUseCasesImpl', () => {
  let useCases: CatalogUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [CatalogUseCasesImpl, { provide: RAWG_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(CatalogUseCasesImpl);
  });

  describe('searchGames', () => {
    it('delega en repo.searchGames con los parámetros correctos', async () => {
      vi.mocked(mockRepo.searchGames).mockResolvedValue([]);
      await useCases.searchGames('god of war', 2, 10);

      expect(mockRepo.searchGames).toHaveBeenCalledWith('god of war', 2, 10);
    });

    it('usa valores por defecto de página y tamaño', async () => {
      vi.mocked(mockRepo.searchGames).mockResolvedValue([]);
      await useCases.searchGames('zelda');

      expect(mockRepo.searchGames).toHaveBeenCalledWith('zelda', 1, 20);
    });
  });

  describe('getTopGames', () => {
    it('delega en repo.getTopGames con el tamaño por defecto', async () => {
      vi.mocked(mockRepo.getTopGames).mockResolvedValue([]);
      await useCases.getTopGames();

      expect(mockRepo.getTopGames).toHaveBeenCalledWith(12);
    });

    it('delega en repo.getTopGames con tamaño personalizado', async () => {
      vi.mocked(mockRepo.getTopGames).mockResolvedValue([]);
      await useCases.getTopGames(6);

      expect(mockRepo.getTopGames).toHaveBeenCalledWith(6);
    });
  });

  describe('getGameDetails', () => {
    it('delega en repo.getGameDetails', async () => {
      vi.mocked(mockRepo.getGameDetails).mockResolvedValue({} as never);
      await useCases.getGameDetails(42);

      expect(mockRepo.getGameDetails).toHaveBeenCalledWith(42);
    });
  });

  describe('getTopBanners', () => {
    it('delega en repo.getTopBanners', async () => {
      vi.mocked(mockRepo.getTopBanners).mockResolvedValue([]);
      await useCases.getTopBanners();

      expect(mockRepo.getTopBanners).toHaveBeenCalledWith(12);
    });
  });

  describe('searchBanners', () => {
    it('delega en repo.searchBanners', async () => {
      vi.mocked(mockRepo.searchBanners).mockResolvedValue([]);
      await useCases.searchBanners('zelda', 6);

      expect(mockRepo.searchBanners).toHaveBeenCalledWith('zelda', 6);
    });
  });

  describe('getAllGameScreenshots — lógica de paginación', () => {
    it('devuelve screenshots de una sola página cuando next es null', async () => {
      vi.mocked(mockRepo.getGameScreenshots).mockResolvedValueOnce({
        count: 2,
        next: null,
        screenshots: ['ss1.jpg', 'ss2.jpg']
      });

      const result = await useCases.getAllGameScreenshots('god-of-war');

      expect(result).toEqual(['ss1.jpg', 'ss2.jpg']);
      expect(mockRepo.getGameScreenshots).toHaveBeenCalledTimes(1);
      expect(mockRepo.getGameScreenshots).toHaveBeenCalledWith('god-of-war', 1, 40);
    });

    it('itera páginas hasta que next sea null', async () => {
      vi.mocked(mockRepo.getGameScreenshots)
        .mockResolvedValueOnce({ count: 4, next: 'page2', screenshots: ['ss1.jpg', 'ss2.jpg'] })
        .mockResolvedValueOnce({ count: 4, next: null, screenshots: ['ss3.jpg', 'ss4.jpg'] });

      const result = await useCases.getAllGameScreenshots(42);

      expect(result).toEqual(['ss1.jpg', 'ss2.jpg', 'ss3.jpg', 'ss4.jpg']);
      expect(mockRepo.getGameScreenshots).toHaveBeenCalledTimes(2);
      expect(mockRepo.getGameScreenshots).toHaveBeenNthCalledWith(1, 42, 1, 40);
      expect(mockRepo.getGameScreenshots).toHaveBeenNthCalledWith(2, 42, 2, 40);
    });

    it('devuelve array vacío cuando no hay screenshots', async () => {
      vi.mocked(mockRepo.getGameScreenshots).mockResolvedValueOnce({
        count: 0,
        next: null,
        screenshots: []
      });

      const result = await useCases.getAllGameScreenshots('game-slug');
      expect(result).toEqual([]);
    });
  });
});
