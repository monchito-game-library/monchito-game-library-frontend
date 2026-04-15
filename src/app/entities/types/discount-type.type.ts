import { DISCOUNT_TYPE } from '@/constants/discount-type.constant';

/** Whether the order discount is a fixed amount (€) or a percentage of the subtotal. */
export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];
