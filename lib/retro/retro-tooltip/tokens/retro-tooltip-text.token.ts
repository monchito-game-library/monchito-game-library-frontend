import { InjectionToken, Signal } from '@angular/core';

/**
 * Permite que una directiva externa (p. ej. RetroEllipsisTooltipDirective)
 * suministre dinámicamente el texto de la tooltip. Cuando está presente,
 * RetroTooltipDirective lo prioriza sobre su input `retroTooltip`.
 */
export const RETRO_TOOLTIP_TEXT: InjectionToken<Signal<string>> = new InjectionToken<Signal<string>>(
  'RETRO_TOOLTIP_TEXT'
);
