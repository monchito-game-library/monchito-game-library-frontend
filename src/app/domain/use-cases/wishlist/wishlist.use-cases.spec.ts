import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { WISHLIST_REPOSITORY, WishlistRepositoryContract } from '@/domain/repositories/wishlist.repository.contract';
import { WishlistUseCasesImpl } from './wishlist.use-cases';

const mockRepo: WishlistRepositoryContract = {
  getAllForUser: vi.fn(),
  addItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn()
};

describe('WishlistUseCasesImpl', () => {
  let useCases: WishlistUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [WishlistUseCasesImpl, { provide: WISHLIST_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(WishlistUseCasesImpl);
  });

  it('getAllForUser delega en repo.getAllForUser', async () => {
    vi.mocked(mockRepo.getAllForUser).mockResolvedValue([]);
    await useCases.getAllForUser('user-1');

    expect(mockRepo.getAllForUser).toHaveBeenCalledWith('user-1');
  });

  it('getAllForUser devuelve el resultado del repositorio', async () => {
    const items = [{ id: 'w-1' }] as never;
    vi.mocked(mockRepo.getAllForUser).mockResolvedValue(items);

    const result = await useCases.getAllForUser('user-1');
    expect(result).toBe(items);
  });

  it('addItem delega en repo.addItem con los parámetros correctos', async () => {
    vi.mocked(mockRepo.addItem).mockResolvedValue();
    const catalog = { id: 'cat-1' } as never;
    const formValue = { platform: 'PS5', desiredPrice: 49.99, priority: 3, notes: null };

    await useCases.addItem('user-1', catalog, formValue);

    expect(mockRepo.addItem).toHaveBeenCalledWith('user-1', catalog, formValue);
  });

  it('updateItem delega en repo.updateItem con los parámetros correctos', async () => {
    vi.mocked(mockRepo.updateItem).mockResolvedValue();
    const patch = { priority: 5 };

    await useCases.updateItem('user-1', 'wish-uuid-1', patch);

    expect(mockRepo.updateItem).toHaveBeenCalledWith('user-1', 'wish-uuid-1', patch);
  });

  it('deleteItem delega en repo.deleteItem con los parámetros correctos', async () => {
    vi.mocked(mockRepo.deleteItem).mockResolvedValue();

    await useCases.deleteItem('user-1', 'wish-uuid-1');

    expect(mockRepo.deleteItem).toHaveBeenCalledWith('user-1', 'wish-uuid-1');
  });
});
