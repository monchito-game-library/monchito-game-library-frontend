import { InjectionToken } from '@angular/core';
import { UserAdminModel } from '@/models/user-admin/user-admin.model';
import { UserRoleType } from '@/types/user-role.type';

export interface UserAdminRepositoryContract {
  getAllUsers(): Promise<UserAdminModel[]>;
  setUserRole(userId: string, role: UserRoleType): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}

export const USER_ADMIN_REPOSITORY = new InjectionToken<UserAdminRepositoryContract>('USER_ADMIN_REPOSITORY');
