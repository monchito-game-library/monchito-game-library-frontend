import type { ConsoleModel } from '@/models/console/console.model';
import type { ControllerModel } from '@/models/controller/controller.model';

export type HardwareLoanItem = ConsoleModel | ControllerModel;

/** Union of all hardware item models managed in the collection. */
export type HardwareItemModel = ConsoleModel | ControllerModel;
