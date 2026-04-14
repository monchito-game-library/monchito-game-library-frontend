import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import {
  HARDWARE_EDITION_REPOSITORY,
  HardwareEditionRepositoryContract
} from '@/domain/repositories/hardware-edition.repository.contract';
import { HardwareEditionUseCasesImpl } from './hardware-edition.use-cases';

const mockRepo: HardwareEditionRepositoryContract = {
  getAllByModel: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

const editionModel = { id: 'edition-1', modelId: 'model-1', name: 'Final Fantasy XVI Limited Edition' };

describe('HardwareEditionUseCasesImpl', () => {
  let useCases: HardwareEditionUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [HardwareEditionUseCasesImpl, { provide: HARDWARE_EDITION_REPOSITORY, useValue: mockRepo }]
    });
    useCases = TestBed.inject(HardwareEditionUseCasesImpl);
  });

  it('getAllByModel delega en repo.getAllByModel con el modelId correcto', async () => {
    vi.mocked(mockRepo.getAllByModel).mockResolvedValue([editionModel]);

    const result = await useCases.getAllByModel('model-1');

    expect(mockRepo.getAllByModel).toHaveBeenCalledWith('model-1');
    expect(result).toEqual([editionModel]);
  });

  it('getById delega en repo.getById con el id correcto', async () => {
    vi.mocked(mockRepo.getById).mockResolvedValue(editionModel);

    const result = await useCases.getById('edition-1');

    expect(mockRepo.getById).toHaveBeenCalledWith('edition-1');
    expect(result).toBe(editionModel);
  });

  it('create delega en repo.create con los parámetros correctos', async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(editionModel);
    const input = { modelId: 'model-1', name: 'Final Fantasy XVI Limited Edition' };

    const result = await useCases.create(input);

    expect(mockRepo.create).toHaveBeenCalledWith(input);
    expect(result).toBe(editionModel);
  });

  it('update delega en repo.update con los parámetros correctos', async () => {
    const updated = { ...editionModel, name: 'God of War Edition' };
    vi.mocked(mockRepo.update).mockResolvedValue(updated);

    const result = await useCases.update('edition-1', { name: 'God of War Edition' });

    expect(mockRepo.update).toHaveBeenCalledWith('edition-1', { name: 'God of War Edition' });
    expect(result).toBe(updated);
  });

  it('delete delega en repo.delete con el id correcto', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue();

    await useCases.delete('edition-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('edition-1');
  });
});
