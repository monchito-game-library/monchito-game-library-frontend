import { PROTECTOR_CATEGORY } from '@/constants/protector-category.constant';

/** Category of a box-protector in the order catalogue. */
export type ProtectorCategory = (typeof PROTECTOR_CATEGORY)[keyof typeof PROTECTOR_CATEGORY];
