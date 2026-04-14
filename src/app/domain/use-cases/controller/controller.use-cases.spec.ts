import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import {
  CONTROLLER_REPOSITORY,
  ControllerRepositoryContract
} from '@/domain/repositories/controller.repository.contract';
import { ControllerUseCasesImpl } from './controller.use-cases';
import { ControllerModel } from '@/models/controller/controller.model';

const mockRepo: ControllerRepositoryContract = {
  getAllForUser: vi.fn(),
  getById: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

const controllerModel: ControllerModel = {
  id: 'controller-uuid-1',
  userId: 'user-1',
  brandId: 'brand-uuid-1',
  modelId: 'model-uuid-1',
  editionId: null,
  color: 'Blanco',
  compatibility: 'PS5',
  condition: 'new',
  price: 79.99,
  store: 'GAME',
  purchaseDate: '2023-12-25',
  notes: null,
  createdAt: '2023-12-25T09:00:00Z'
};

describe('ControllerUseCasesImpl', () => {
  let useCases: ControllerUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [ControllerUseCasesImpl, { provide: CONTROLLER_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(ControllerUseCasesImpl);
  });

  it('getAllForUser delega en repo.getAllForUser', async () => {
    vi.mocked(mockRepo.getAllForUser).mockResolvedValue([]);
    await useCases.getAllForUser('user-1');

    expect(mockRepo.getAllForUser).toHaveBeenCalledWith('user-1');
  });

  it('getAllForUser devuelve el resultado del repositorio', async () => {
    const items = [controllerModel];
    vi.mocked(mockRepo.getAllForUser).mockResolvedValue(items);

    const result = await useCases.getAllForUser('user-1');
    expect(result).toBe(items);
  });

  it('getById delega en repo.getById con los parámetros correctos', async () => {
    vi.mocked(mockRepo.getById).mockResolvedValue(controllerModel);

    await useCases.getById('user-1', 'controller-uuid-1');

    expect(mockRepo.getById).toHaveBeenCalledWith('user-1', 'controller-uuid-1');
  });

  it('getById devuelve undefined cuando no existe', async () => {
    vi.mocked(mockRepo.getById).mockResolvedValue(undefined);

    const result = await useCases.getById('user-1', 'inexistente');
    expect(result).toBeUndefined();
  });

  it('add delega en repo.add con los parámetros correctos', async () => {
    vi.mocked(mockRepo.add).mockResolvedValue();

    await useCases.add('user-1', controllerModel);

    expect(mockRepo.add).toHaveBeenCalledWith('user-1', controllerModel);
  });

  it('update delega en repo.update con los parámetros correctos', async () => {
    vi.mocked(mockRepo.update).mockResolvedValue();

    await useCases.update('user-1', 'controller-uuid-1', controllerModel);

    expect(mockRepo.update).toHaveBeenCalledWith('user-1', 'controller-uuid-1', controllerModel);
  });

  it('delete delega en repo.delete con los parámetros correctos', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue();

    await useCases.delete('user-1', 'controller-uuid-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('user-1', 'controller-uuid-1');
  });
});
