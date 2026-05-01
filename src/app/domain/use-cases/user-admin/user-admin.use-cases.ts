import { inject, Injectable } from '@angular/core';
import { UserAdminUseCasesContract } from './user-admin.use-cases.contract';
import {
  USER_ADMIN_REPOSITORY,
  UserAdminRepositoryContract
} from '@/domain/repositories/user-admin.repository.contract';
import { UserAdminModel } from '@/models/user-admin/user-admin.model';
import { UserRoleType } from '@/types/user-role.type';

@Injectable()
export class UserAdminUseCasesImpl implements UserAdminUseCasesContract {
  private readonly _repository: UserAdminRepositoryContract = inject(USER_ADMIN_REPOSITORY);

  /**
   * Returns all registered users with their current role.
   */
  async getAllUsers(): Promise<UserAdminModel[]> {
    return this._repository.getAllUsers();
  }

  /**
   * Updates the role for the given user.
   *
   * @param {string} userId - UUID of the user to update
   * @param {UserRoleType} role - The new role to assign
   */
  async setUserRole(userId: string, role: UserRoleType): Promise<void> {
    return this._repository.setUserRole(userId, role);
  }

  /**
   * Permanently deletes a user and all their associated data.
   *
   * @param {string} userId - UUID of the user to delete
   */
  async deleteUser(userId: string): Promise<void> {
    return this._repository.deleteUser(userId);
  }
}
