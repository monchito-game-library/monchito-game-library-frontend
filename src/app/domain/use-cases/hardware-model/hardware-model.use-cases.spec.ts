import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import {
  HARDWARE_MODEL_REPOSITORY,
  HardwareModelRepositoryContract
} from '@/domain/repositories/hardware-model.repository.contract';
import { HardwareModelUseCasesImpl } from './hardware-model.use-cases';

const mockRepo: HardwareModelRepositoryContract = {
  getAllByBrand: vi.fn(),
  getAllByType: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

const modelModel = {
  id: 'model-1',
  brandId: 'brand-1',
  name: 'PlayStation 5',
  type: 'console' as const,
  generation: 9
};

describe('HardwareModelUseCasesImpl', () => {
  let useCases: HardwareModelUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [HardwareModelUseCasesImpl, { provide: HARDWARE_MODEL_REPOSITORY, useValue: mockRepo }]
    });
    useCases = TestBed.inject(HardwareModelUseCasesImpl);
  });

  it('getAllByBrand delega en repo.getAllByBrand con el brandId correcto', async () => {
    vi.mocked(mockRepo.getAllByBrand).mockResolvedValue([modelModel]);

    const result = await useCases.getAllByBrand('brand-1');

    expect(mockRepo.getAllByBrand).toHaveBeenCalledWith('brand-1');
    expect(result).toEqual([modelModel]);
  });

  it('getAllByType delega en repo.getAllByType con el type correcto', async () => {
    vi.mocked(mockRepo.getAllByType).mockResolvedValue([modelModel]);

    const result = await useCases.getAllByType('console');

    expect(mockRepo.getAllByType).toHaveBeenCalledWith('console');
    expect(result).toEqual([modelModel]);
  });

  it('getById delega en repo.getById con el id correcto', async () => {
    vi.mocked(mockRepo.getById).mockResolvedValue(modelModel);

    const result = await useCases.getById('model-1');

    expect(mockRepo.getById).toHaveBeenCalledWith('model-1');
    expect(result).toBe(modelModel);
  });

  it('create delega en repo.create con los parámetros correctos', async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(modelModel);
    const input = { brandId: 'brand-1', name: 'PlayStation 5', type: 'console' as const, generation: null };

    const result = await useCases.create(input);

    expect(mockRepo.create).toHaveBeenCalledWith(input);
    expect(result).toBe(modelModel);
  });

  it('update delega en repo.update con los parámetros correctos', async () => {
    const updated = { ...modelModel, name: 'PlayStation 5 Digital' };
    vi.mocked(mockRepo.update).mockResolvedValue(updated);

    const result = await useCases.update('model-1', { name: 'PlayStation 5 Digital' });

    expect(mockRepo.update).toHaveBeenCalledWith('model-1', { name: 'PlayStation 5 Digital' });
    expect(result).toBe(updated);
  });

  it('delete delega en repo.delete con el id correcto', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue();

    await useCases.delete('model-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('model-1');
  });
});
