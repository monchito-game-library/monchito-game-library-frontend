import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import {
  HARDWARE_CONSOLE_SPECS_REPOSITORY,
  HardwareConsoleSpecsRepositoryContract
} from '@/domain/repositories/hardware-console-specs.repository.contract';
import { HardwareConsoleSpecsUseCasesImpl } from './hardware-console-specs.use-cases';

const mockRepo: HardwareConsoleSpecsRepositoryContract = {
  getByModelId: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn()
};

const specsModel = {
  modelId: 'model-1',
  launchYear: 2020,
  discontinuedYear: null,
  category: 'home' as const,
  media: 'optical_disc' as const,
  videoResolution: '4K',
  unitsSoldMillion: 67
};

describe('HardwareConsoleSpecsUseCasesImpl', () => {
  let useCases: HardwareConsoleSpecsUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [HardwareConsoleSpecsUseCasesImpl, { provide: HARDWARE_CONSOLE_SPECS_REPOSITORY, useValue: mockRepo }]
    });
    useCases = TestBed.inject(HardwareConsoleSpecsUseCasesImpl);
  });

  it('getByModelId delega en repo.getByModelId con el modelId correcto', async () => {
    vi.mocked(mockRepo.getByModelId).mockResolvedValue(specsModel);

    const result = await useCases.getByModelId('model-1');

    expect(mockRepo.getByModelId).toHaveBeenCalledWith('model-1');
    expect(result).toBe(specsModel);
  });

  it('getByModelId devuelve undefined cuando no hay specs', async () => {
    vi.mocked(mockRepo.getByModelId).mockResolvedValue(undefined);

    const result = await useCases.getByModelId('model-x');

    expect(result).toBeUndefined();
  });

  it('upsert delega en repo.upsert con los parámetros correctos', async () => {
    vi.mocked(mockRepo.upsert).mockResolvedValue(specsModel);

    const result = await useCases.upsert(specsModel);

    expect(mockRepo.upsert).toHaveBeenCalledWith(specsModel);
    expect(result).toBe(specsModel);
  });

  it('delete delega en repo.delete con el modelId correcto', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue();

    await useCases.delete('model-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('model-1');
  });
});
