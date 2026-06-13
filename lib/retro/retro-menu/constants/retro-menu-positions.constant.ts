import { ConnectedPosition } from '@angular/cdk/overlay';

/**
 * Posiciones CDK para el panel de retro-menu.
 * Se intenta primero apertura hacia abajo-izquierda, luego hacia arriba,
 * y las variantes con alineación derecha.
 */
export const RETRO_MENU_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 }
];
