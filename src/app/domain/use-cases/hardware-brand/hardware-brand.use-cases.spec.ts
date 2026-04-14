import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import {
  HARDWARE_BRAND_REPOSITORY,
  HardwareBrandRepositoryContract
} from '@/domain/repositories/hardware-brand.repository.contract';
import { HardwareBrandUseCasesImpl } from './hardware-brand.use-cases';

const mockRepo: HardwareBrandRepositoryContract = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
};

const brandModel = { id: 'brand-1', name: 'Sony' };

describe('HardwareBrandUseCasesImpl', () => {
  let useCases: HardwareBrandUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [HardwareBrandUseCasesImpl, { provide: HARDWARE_BRAND_REPOSITORY, useValue: mockRepo }]
    });
    useCases = TestBed.inject(HardwareBrandUseCasesImpl);
  });

  it('getAll delega en repo.getAll y devuelve la lista', async () => {
    vi.mocked(mockRepo.getAll).mockResolvedValue([brandModel]);

    const result = await useCases.getAll();

    expect(mockRepo.getAll).toHaveBeenCalledOnce();
    expect(result).toEqual([brandModel]);
  });

  it('getById delega en repo.getById con el id correcto', async () => {
    vi.mocked(mockRepo.getById).mockResolvedValue(brandModel);

    const result = await useCases.getById('brand-1');

    expect(mockRepo.getById).toHaveBeenCalledWith('brand-1');
    expect(result).toBe(brandModel);
  });

  it('create delega en repo.create con los parámetros correctos', async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(brandModel);

    const result = await useCases.create({ name: 'Sony' });

    expect(mockRepo.create).toHaveBeenCalledWith({ name: 'Sony' });
    expect(result).toBe(brandModel);
  });

  it('update delega en repo.update con los parámetros correctos', async () => {
    const updated = { id: 'brand-1', name: 'Microsoft' };
    vi.mocked(mockRepo.update).mockResolvedValue(updated);

    const result = await useCases.update('brand-1', { name: 'Microsoft' });

    expect(mockRepo.update).toHaveBeenCalledWith('brand-1', { name: 'Microsoft' });
    expect(result).toBe(updated);
  });

  it('delete delega en repo.delete con el id correcto', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue();

    await useCases.delete('brand-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('brand-1');
  });
});
