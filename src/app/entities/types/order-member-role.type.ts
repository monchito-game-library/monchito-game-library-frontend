import { ORDER_MEMBER_ROLE } from '@/constants/order-member-role.constant';

/** Role of a participant in a group order. */
export type OrderMemberRoleType = (typeof ORDER_MEMBER_ROLE)[keyof typeof ORDER_MEMBER_ROLE];
