import { PlatformType } from '@/types/platform.type';

/**
 * Maps a RAWG platform name to the corresponding local platform code.
 * Returns null for platform names that have no local equivalent.
 *
 * @param {string} rawgPlatformName - Platform name as returned by the RAWG API
 */
export function mapRawgPlatformToCode(rawgPlatformName: string): PlatformType | null {
  const platformMap: Record<string, PlatformType> = {
    'PlayStation 5': 'PS5',
    PS5: 'PS5',
    'PlayStation 4': 'PS4',
    PS4: 'PS4',
    'PlayStation 3': 'PS3',
    PS3: 'PS3',
    'PlayStation 2': 'PS2',
    PS2: 'PS2',
    PlayStation: 'PS1',
    PS1: 'PS1',
    'PS Vita': 'PS-VITA',
    'PlayStation Vita': 'PS-VITA',
    PSP: 'PSP',
    PC: 'PC',
    'Nintendo Switch': 'SWITCH',
    Switch: 'SWITCH',
    Wii: 'WII',
    'Wii U': 'WII',
    GameCube: 'GAME-CUBE',
    'Nintendo DS': 'DS',
    'Nintendo 3DS': '3DS',
    '3DS': '3DS',
    'Game Boy Color': 'GBC',
    'Game Boy Advance': 'GBA',
    'Xbox Series S/X': 'XBOX-SERIES',
    'Xbox Series X': 'XBOX-SERIES',
    'Xbox One': 'XBOX-ONE',
    'Xbox 360': 'XBOX-360',
    Xbox: 'XBOX'
  };
  return platformMap[rawgPlatformName] || null;
}
