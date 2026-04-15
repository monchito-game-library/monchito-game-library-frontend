import { CONTROLLER_COMPATIBILITY } from '@/constants/controller-compatibility.constant';

/** Platform compatibility of a controller. */
export type ControllerCompatibilityType = (typeof CONTROLLER_COMPATIBILITY)[keyof typeof CONTROLLER_COMPATIBILITY];
