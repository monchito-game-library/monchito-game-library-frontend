import { ControllerCompatibilityType } from '@/types/controller-compatibility.type';

/** Available controller compatibilities, used in form selectors. */
export const availableControllerCompatibilities: { code: ControllerCompatibilityType; labelKey: string }[] = [
  { code: 'PS5', labelKey: 'controllerCompatibilities.ps5' },
  { code: 'PS4', labelKey: 'controllerCompatibilities.ps4' },
  { code: 'PS3', labelKey: 'controllerCompatibilities.ps3' },
  { code: 'Xbox', labelKey: 'controllerCompatibilities.xbox' },
  { code: 'PC', labelKey: 'controllerCompatibilities.pc' },
  { code: 'Switch', labelKey: 'controllerCompatibilities.switch' },
  { code: 'Universal', labelKey: 'controllerCompatibilities.universal' }
];
