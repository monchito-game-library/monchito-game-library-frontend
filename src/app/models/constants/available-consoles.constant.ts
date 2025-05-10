import { AvailableConsolesInterface } from '../interfaces/available-consoles.interface';

/**
 * Consolas disponibles para seleccionar o filtrar videojuegos.
 * La propiedad `labelKey` se utiliza con Transloco.
 */
export const availableConsolesConstant: AvailableConsolesInterface[] = [
  { code: 'PS5', labelKey: 'consoles.ps5' },
  { code: 'PS4', labelKey: 'consoles.ps4' },
  { code: 'PS3', labelKey: 'consoles.ps3' },
  { code: 'PS2', labelKey: 'consoles.ps2' },
  { code: 'PS1', labelKey: 'consoles.ps1' },
  { code: 'PS-VITA', labelKey: 'consoles.psVita' },
  { code: 'PSP', labelKey: 'consoles.psp' },
  { code: 'GBC', labelKey: 'consoles.gbc' },
  { code: 'GBA', labelKey: 'consoles.gba' },
  { code: 'DS', labelKey: 'consoles.ds' },
  { code: '3DS', labelKey: 'consoles.3ds' },
  { code: 'GAME-CUBE', labelKey: 'consoles.gameCube' },
  { code: 'WII', labelKey: 'consoles.wii' },
  { code: 'SWITCH', labelKey: 'consoles.switch' },
  { code: 'XBOX', labelKey: 'consoles.xbox' },
  { code: 'XBOX-360', labelKey: 'consoles.xbox360' },
  { code: 'XBOX-ONE', labelKey: 'consoles.xboxOne' },
  { code: 'XBOX-SERIES', labelKey: 'consoles.xboxSeries' },
  { code: 'PC', labelKey: 'consoles.pc' }
];
