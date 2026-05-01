import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import {
  USER_ADMIN_REPOSITORY,
  UserAdminRepositoryContract
} from '@/domain/repositories/user-admin.repository.contract';
import { UserAdminUseCasesImpl } from './user-admin.use-cases';

const mockRepo: UserAdminRepositoryContract = {
  getAllUsers: vi.fn(),
  setUserRole: vi.fn(),
  deleteUser: vi.fn()
};

describe('UserAdminUseCasesImpl', () => {
  let useCases: UserAdminUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [UserAdminUseCasesImpl, { provide: USER_ADMIN_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(UserAdminUseCasesImpl);
  });

  it('getAllUsers delega en repo.getAllUsers', async () => {
    vi.mocked(mockRepo.getAllUsers).mockResolvedValue([]);
    await useCases.getAllUsers();

    expect(mockRepo.getAllUsers).toHaveBeenCalledOnce();
  });

  it('getAllUsers devuelve la lista del repositorio', async () => {
    const users = [{ id: 'u-1', email: 'admin@test.com', role: 'admin' as const }] as never;
    vi.mocked(mockRepo.getAllUsers).mockResolvedValue(users);

    expect(await useCases.getAllUsers()).toBe(users);
  });

  it('setUserRole delega en repo.setUserRole con los parámetros correctos', async () => {
    vi.mocked(mockRepo.setUserRole).mockResolvedValue();

    await useCases.setUserRole('u-1', 'admin');

    expect(mockRepo.setUserRole).toHaveBeenCalledWith('u-1', 'admin');
  });

  it('setUserRole acepta role member', async () => {
    vi.mocked(mockRepo.setUserRole).mockResolvedValue();

    await useCases.setUserRole('u-2', 'member');

    expect(mockRepo.setUserRole).toHaveBeenCalledWith('u-2', 'member');
  });

  it('deleteUser delega en repo.deleteUser con el userId', async () => {
    vi.mocked(mockRepo.deleteUser).mockResolvedValue();

    await useCases.deleteUser('u-3');

    expect(mockRepo.deleteUser).toHaveBeenCalledWith('u-3');
  });

  it('deleteUser propaga el error del repositorio', async () => {
    const repoError = new Error('Forbidden');
    vi.mocked(mockRepo.deleteUser).mockRejectedValue(repoError);

    await expect(useCases.deleteUser('u-3')).rejects.toThrow('Forbidden');
  });
});
