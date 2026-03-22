import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { STORE_REPOSITORY, StoreRepositoryContract } from '@/domain/repositories/store.repository.contract';
import { StoreUseCasesImpl } from './store.use-cases';

const mockRepo: StoreRepositoryContract = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

describe('StoreUseCasesImpl', () => {
  let useCases: StoreUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [StoreUseCasesImpl, { provide: STORE_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(StoreUseCasesImpl);
  });

  it('getAllStores delega en repo.getAll', async () => {
    vi.mocked(mockRepo.getAll).mockResolvedValue([]);
    await useCases.getAllStores();

    expect(mockRepo.getAll).toHaveBeenCalledOnce();
  });

  it('getAllStores devuelve la lista del repositorio', async () => {
    const stores = [{ id: 's-1', label: 'GAME', formatHint: null }];
    vi.mocked(mockRepo.getAll).mockResolvedValue(stores);

    const result = await useCases.getAllStores();
    expect(result).toBe(stores);
  });

  it('addStore delega en repo.create con los parámetros correctos', async () => {
    const newStore = { id: 's-2', label: 'Amazon', formatHint: null };
    vi.mocked(mockRepo.create).mockResolvedValue(newStore);
    const input = { label: 'Amazon', formatHint: null };

    await useCases.addStore(input, 'user-1');

    expect(mockRepo.create).toHaveBeenCalledWith(input, 'user-1');
  });

  it('updateStore delega en repo.update con los parámetros correctos', async () => {
    const updated = { id: 's-1', label: 'GAME ES', formatHint: 'physical' as const };
    vi.mocked(mockRepo.update).mockResolvedValue(updated);
    const patch = { label: 'GAME ES' };

    await useCases.updateStore('s-1', patch);

    expect(mockRepo.update).toHaveBeenCalledWith('s-1', patch);
  });

  it('deleteStore delega en repo.delete con el id correcto', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue();

    await useCases.deleteStore('s-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('s-1');
  });
});
