import { InjectionToken } from '@angular/core';
import { UserAdminModel } from '@/models/user-admin/user-admin.model';
import { UserRoleType } from '@/types/user-role.type';

export interface UserAdminUseCasesContract {
  getAllUsers(): Promise<UserAdminModel[]>;
  setUserRole(userId: string, role: UserRoleType): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}

export const USER_ADMIN_USE_CASES = new InjectionToken<UserAdminUseCasesContract>('USER_ADMIN_USE_CASES');
