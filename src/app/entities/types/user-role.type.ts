import { USER_ROLE } from '@/constants/user-role.constant';

/** Role of a user in the application. */
export type UserRoleType = (typeof USER_ROLE)[keyof typeof USER_ROLE];
