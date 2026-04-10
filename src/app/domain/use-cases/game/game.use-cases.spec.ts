import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { GAME_REPOSITORY, GameRepositoryContract } from '@/domain/repositories/game.repository.contract';
import { GameUseCasesImpl } from './game.use-cases';

const mockRepo: GameRepositoryContract = {
  getAllGamesForUser: vi.fn(),
  getAllGamesForList: vi.fn(),
  getByConsole: vi.fn(),
  addGameForUser: vi.fn(),
  deleteById: vi.fn(),
  updateGameForUser: vi.fn(),
  clearAllForUser: vi.fn(),
  getById: vi.fn(),
  getGameForEdit: vi.fn(),
  getSoldGames: vi.fn(),
  updateSaleStatus: vi.fn()
};

describe('GameUseCasesImpl', () => {
  let useCases: GameUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [GameUseCasesImpl, { provide: GAME_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(GameUseCasesImpl);
  });

  it('getAllGames delega en repo.getAllGamesForUser', async () => {
    vi.mocked(mockRepo.getAllGamesForUser).mockResolvedValue([]);
    await useCases.getAllGames('user-1');

    expect(mockRepo.getAllGamesForUser).toHaveBeenCalledWith('user-1');
  });

  it('getAllGamesForList delega en repo.getAllGamesForList', async () => {
    vi.mocked(mockRepo.getAllGamesForList).mockResolvedValue([]);
    await useCases.getAllGamesForList('user-1');

    expect(mockRepo.getAllGamesForList).toHaveBeenCalledWith('user-1');
  });

  it('getById delega en repo.getById', async () => {
    vi.mocked(mockRepo.getById).mockResolvedValue(undefined);
    await useCases.getById('user-1', 'uuid-1');

    expect(mockRepo.getById).toHaveBeenCalledWith('user-1', 'uuid-1');
  });

  it('getGameForEdit delega en repo.getGameForEdit', async () => {
    vi.mocked(mockRepo.getGameForEdit).mockResolvedValue(undefined);
    await useCases.getGameForEdit('user-1', 'uuid-1');

    expect(mockRepo.getGameForEdit).toHaveBeenCalledWith('user-1', 'uuid-1');
  });

  it('getByPlatform delega en repo.getByConsole', async () => {
    vi.mocked(mockRepo.getByConsole).mockResolvedValue([]);
    await useCases.getByPlatform('user-1', 'PS5');

    expect(mockRepo.getByConsole).toHaveBeenCalledWith('user-1', 'PS5');
  });

  it('addGame delega en repo.addGameForUser', async () => {
    vi.mocked(mockRepo.addGameForUser).mockResolvedValue();
    const game = { id: 1 } as never;
    await useCases.addGame('user-1', game, null);

    expect(mockRepo.addGameForUser).toHaveBeenCalledWith('user-1', game, null);
  });

  it('updateGame delega en repo.updateGameForUser', async () => {
    vi.mocked(mockRepo.updateGameForUser).mockResolvedValue();
    const game = { id: 1, uuid: 'u' } as never;
    await useCases.updateGame('user-1', game);

    expect(mockRepo.updateGameForUser).toHaveBeenCalledWith('user-1', game, undefined);
  });

  it('deleteGame delega en repo.deleteById', async () => {
    vi.mocked(mockRepo.deleteById).mockResolvedValue();
    await useCases.deleteGame('user-1', 'uuid-1');

    expect(mockRepo.deleteById).toHaveBeenCalledWith('user-1', 'uuid-1');
  });

  it('clearAll delega en repo.clearAllForUser', async () => {
    vi.mocked(mockRepo.clearAllForUser).mockResolvedValue();
    await useCases.clearAll('user-1');

    expect(mockRepo.clearAllForUser).toHaveBeenCalledWith('user-1');
  });
});
