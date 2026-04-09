import { ORDER_STATUS } from '@/constants/order-status.constant';

/** Lifecycle status of a group order. */
export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
