import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { WORK_REPOSITORY, WorkRepositoryContract } from '@/domain/repositories/work.repository.contract';
import { WorkModel } from '@/models/work/work.model';
import { GameModel } from '@/models/game/game.model';
import { WorkUseCasesImpl } from './work.use-cases';

const mockRepo: WorkRepositoryContract = {
  getById: vi.fn(),
  getCopies: vi.fn(),
  update: vi.fn()
};

const workModel: WorkModel = {
  uuid: 'work-1',
  userId: 'user-1',
  gameCatalogId: 'cat-1',
  platform: 'PS5',
  status: 'playing',
  personalRating: 8,
  isFavorite: false
};

describe('WorkUseCasesImpl', () => {
  let useCases: WorkUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [WorkUseCasesImpl, { provide: WORK_REPOSITORY, useValue: mockRepo }]
    });
    useCases = TestBed.inject(WorkUseCasesImpl);
  });

  it('getById delega en repo.getById', async () => {
    vi.mocked(mockRepo.getById).mockResolvedValue(workModel);

    const result = await useCases.getById('user-1', 'work-1');

    expect(mockRepo.getById).toHaveBeenCalledWith('user-1', 'work-1');
    expect(result).toBe(workModel);
  });

  it('getCopies delega en repo.getCopies', async () => {
    const copies = [{ uuid: 'game-1' } as GameModel];
    vi.mocked(mockRepo.getCopies).mockResolvedValue(copies);

    const result = await useCases.getCopies('user-1', 'work-1');

    expect(mockRepo.getCopies).toHaveBeenCalledWith('user-1', 'work-1');
    expect(result).toBe(copies);
  });

  it('update delega en repo.update con el patch', async () => {
    vi.mocked(mockRepo.update).mockResolvedValue();
    const patch = { status: 'completed' as const, isFavorite: true };

    await useCases.update('user-1', 'work-1', patch);

    expect(mockRepo.update).toHaveBeenCalledWith('user-1', 'work-1', patch);
  });
});
