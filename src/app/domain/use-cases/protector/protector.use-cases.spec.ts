import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { PROTECTOR_REPOSITORY, ProtectorRepositoryContract } from '@/domain/repositories/protector.repository.contract';
import { ProtectorUseCasesImpl } from './protector.use-cases';

const mockRepo: ProtectorRepositoryContract = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  toggleActive: vi.fn()
};

describe('ProtectorUseCasesImpl', () => {
  let useCases: ProtectorUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [ProtectorUseCasesImpl, { provide: PROTECTOR_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(ProtectorUseCasesImpl);
  });

  it('getAllProtectors delega en repo.getAll sin filtro', async () => {
    vi.mocked(mockRepo.getAll).mockResolvedValue([]);
    await useCases.getAllProtectors();

    expect(mockRepo.getAll).toHaveBeenCalledWith(undefined);
  });

  it('getAllProtectors delega en repo.getAll con onlyActive=true', async () => {
    vi.mocked(mockRepo.getAll).mockResolvedValue([]);
    await useCases.getAllProtectors(true);

    expect(mockRepo.getAll).toHaveBeenCalledWith(true);
  });

  it('addProtector delega en repo.create', async () => {
    const newProtector = {
      id: 'p-1',
      name: 'BluRay',
      packs: [],
      category: 'box' as const,
      notes: null,
      isActive: true
    };
    vi.mocked(mockRepo.create).mockResolvedValue(newProtector);
    const input = { name: 'BluRay', packs: [], category: 'box' as const, notes: null, isActive: true };

    await useCases.addProtector(input);

    expect(mockRepo.create).toHaveBeenCalledWith(input);
  });

  it('updateProtector delega en repo.update con id y patch', async () => {
    const updated = { id: 'p-1', name: 'BluRay v2', packs: [], category: 'box' as const, notes: null, isActive: true };
    vi.mocked(mockRepo.update).mockResolvedValue(updated);
    const patch = { name: 'BluRay v2' };

    await useCases.updateProtector('p-1', patch);

    expect(mockRepo.update).toHaveBeenCalledWith('p-1', patch);
  });

  it('toggleProtectorActive delega en repo.toggleActive', async () => {
    const result = { id: 'p-1', name: 'BluRay', packs: [], category: 'box' as const, notes: null, isActive: false };
    vi.mocked(mockRepo.toggleActive).mockResolvedValue(result);

    await useCases.toggleProtectorActive('p-1', false);

    expect(mockRepo.toggleActive).toHaveBeenCalledWith('p-1', false);
  });
});
