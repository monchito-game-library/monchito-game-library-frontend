import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { CONSOLE_REPOSITORY, ConsoleRepositoryContract } from '@/domain/repositories/console.repository.contract';
import { ConsoleUseCasesImpl } from './console.use-cases';
import { ConsoleModel } from '@/models/console/console.model';

const mockRepo: ConsoleRepositoryContract = {
  getAllForUser: vi.fn(),
  getById: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  updateSaleStatus: vi.fn(),
  createLoan: vi.fn(),
  returnLoan: vi.fn()
};

const consoleModel: ConsoleModel = {
  id: 'console-uuid-1',
  userId: 'user-1',
  brandId: 'brand-uuid-1',
  modelId: 'model-uuid-1',
  editionId: null,
  region: 'PAL',
  condition: 'new',
  price: 549.99,
  store: 'MediaMarkt',
  purchaseDate: '2023-11-10',
  notes: null,
  createdAt: '2023-11-10T10:00:00Z',
  forSale: false,
  salePrice: null,
  soldAt: null,
  soldPriceFinal: null,
  activeLoanId: null,
  activeLoanTo: null,
  activeLoanAt: null
};

describe('ConsoleUseCasesImpl', () => {
  let useCases: ConsoleUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [ConsoleUseCasesImpl, { provide: CONSOLE_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(ConsoleUseCasesImpl);
  });

  it('getAllForUser delega en repo.getAllForUser', async () => {
    vi.mocked(mockRepo.getAllForUser).mockResolvedValue([]);
    await useCases.getAllForUser('user-1');

    expect(mockRepo.getAllForUser).toHaveBeenCalledWith('user-1');
  });

  it('getAllForUser devuelve el resultado del repositorio', async () => {
    const items = [consoleModel];
    vi.mocked(mockRepo.getAllForUser).mockResolvedValue(items);

    const result = await useCases.getAllForUser('user-1');
    expect(result).toBe(items);
  });

  it('getById delega en repo.getById con los parámetros correctos', async () => {
    vi.mocked(mockRepo.getById).mockResolvedValue(consoleModel);

    await useCases.getById('user-1', 'console-uuid-1');

    expect(mockRepo.getById).toHaveBeenCalledWith('user-1', 'console-uuid-1');
  });

  it('getById devuelve undefined cuando no existe', async () => {
    vi.mocked(mockRepo.getById).mockResolvedValue(undefined);

    const result = await useCases.getById('user-1', 'inexistente');
    expect(result).toBeUndefined();
  });

  it('add delega en repo.add con los parámetros correctos', async () => {
    vi.mocked(mockRepo.add).mockResolvedValue();

    await useCases.add('user-1', consoleModel);

    expect(mockRepo.add).toHaveBeenCalledWith('user-1', consoleModel);
  });

  it('update delega en repo.update con los parámetros correctos', async () => {
    vi.mocked(mockRepo.update).mockResolvedValue();

    await useCases.update('user-1', 'console-uuid-1', consoleModel);

    expect(mockRepo.update).toHaveBeenCalledWith('user-1', 'console-uuid-1', consoleModel);
  });

  it('delete delega en repo.delete con los parámetros correctos', async () => {
    vi.mocked(mockRepo.delete).mockResolvedValue();

    await useCases.delete('user-1', 'console-uuid-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('user-1', 'console-uuid-1');
  });

  it('updateSaleStatus delega en repo.updateSaleStatus con los parámetros correctos', async () => {
    const sale = { forSale: true, salePrice: 299, soldAt: null, soldPriceFinal: null };
    vi.mocked(mockRepo.updateSaleStatus).mockResolvedValue();

    await useCases.updateSaleStatus('user-1', 'console-uuid-1', sale);

    expect(mockRepo.updateSaleStatus).toHaveBeenCalledWith('user-1', 'console-uuid-1', sale);
  });

  it('createLoan delega en repo.createLoan y devuelve el id del préstamo', async () => {
    const loan = {
      itemType: 'console' as const,
      userItemId: 'console-uuid-1',
      loanedTo: 'amigo',
      loanedAt: '2024-03-01'
    };
    vi.mocked(mockRepo.createLoan).mockResolvedValue('loan-uuid-1');

    const result = await useCases.createLoan(loan);

    expect(mockRepo.createLoan).toHaveBeenCalledWith(loan);
    expect(result).toBe('loan-uuid-1');
  });

  it('returnLoan delega en repo.returnLoan con los parámetros correctos', async () => {
    vi.mocked(mockRepo.returnLoan).mockResolvedValue();

    await useCases.returnLoan('loan-uuid-1', 'console-uuid-1', 'user-1');

    expect(mockRepo.returnLoan).toHaveBeenCalledWith('loan-uuid-1', 'console-uuid-1', 'user-1');
  });
});
