import { InjectionToken } from '@angular/core';
import { LibOptionParent } from '@/interfaces/lib-option-parent.interface';

export type { LibOptionParent } from '@/interfaces/lib-option-parent.interface';

/**
 * Token de inyección para el componente padre de una LibOptionComponent.
 * Los componentes LibSelectComponent y LibAutocompleteComponent lo proveen
 * en su propio contexto para que las opciones notifiquen la selección.
 */
export const LIB_OPTION_PARENT = new InjectionToken<LibOptionParent>('LIB_OPTION_PARENT');
