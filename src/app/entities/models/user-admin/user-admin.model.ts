import { UserRoleType } from '@/types/user-role.type';

export interface UserAdminModel {
  userId: string;
  email: string;
  role: UserRoleType;
  avatarUrl: string | null;
  createdAt: string;
}
