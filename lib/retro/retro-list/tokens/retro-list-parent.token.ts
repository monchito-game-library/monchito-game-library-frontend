import { InjectionToken } from '@angular/core';
import { RetroListParent } from '../interfaces/retro-list-parent.interface';

/**
 * Token de inyección que retro-list provee y retro-list-item requiere.
 * Garantiza que retro-list-item solo puede usarse dentro de un retro-list.
 */
export const RETRO_LIST_PARENT = new InjectionToken<RetroListParent>('RETRO_LIST_PARENT');
