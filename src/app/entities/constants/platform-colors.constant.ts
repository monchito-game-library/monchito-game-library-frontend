/** Brand accent colors (rgba with transparency) for each gaming platform. */
export const PLATFORM_COLORS: Readonly<Record<string, string>> = {
  PS5: 'rgba(0, 52, 164, 0.82)',
  PS4: 'rgba(0, 52, 164, 0.82)',
  PS3: 'rgba(0, 52, 164, 0.72)',
  PS2: 'rgba(0, 52, 164, 0.72)',
  PS1: 'rgba(0, 52, 164, 0.72)',
  'PS-VITA': 'rgba(0, 52, 164, 0.77)',
  PSP: 'rgba(0, 52, 164, 0.72)',
  SWITCH: 'rgba(228, 0, 15, 0.82)',
  '3DS': 'rgba(188, 17, 0, 0.77)',
  DS: 'rgba(188, 17, 0, 0.72)',
  GBC: 'rgba(188, 17, 0, 0.72)',
  GBA: 'rgba(188, 17, 0, 0.72)',
  WII: 'rgba(188, 17, 0, 0.72)',
  'GAME-CUBE': 'rgba(80, 6, 127, 0.77)',
  'XBOX-SERIES': 'rgba(16, 124, 16, 0.82)',
  'XBOX-ONE': 'rgba(16, 124, 16, 0.77)',
  'XBOX-360': 'rgba(16, 124, 16, 0.72)',
  XBOX: 'rgba(16, 124, 16, 0.72)',
  PC: 'rgba(80, 80, 100, 0.77)'
} as const;
