import { InjectionToken } from '@angular/core';
import { RetroOptionParent } from '../interfaces/retro-option-parent.interface';

export type { RetroOptionParent } from '../interfaces/retro-option-parent.interface';

/**
 * Token de inyección para el componente padre de una RetroOptionComponent.
 * Los componentes RetroSelectComponent y RetroAutocompleteComponent lo proveen
 * en su propio contexto para que las opciones notifiquen la selección.
 */
export const RETRO_OPTION_PARENT = new InjectionToken<RetroOptionParent>('RETRO_OPTION_PARENT');
