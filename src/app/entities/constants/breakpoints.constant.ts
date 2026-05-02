/** Minimum screen width (px) required to access desktop/tablet-only routes. */
export const MIN_DESKTOP_WIDTH_PX = 768;

/**
 * Centralised breakpoint values shared between `BreakpointObserver` (TypeScript)
 * and the SCSS `@media` queries. Keep these aligned with the CSS custom
 * properties declared in `styles.scss` (`--bp-*`).
 */
export const BREAKPOINTS = {
  /** Phone ↔ tablet/desktop divide. */
  mobile: 768,
  /** Tablet landscape / small desktop. */
  tablet: 1024,
  /** Standard desktop. */
  desktop: 1280,
  /** FHD nativo. */
  desktopLarge: 1920,
  /** 2K / QHD. */
  ultraWide: 2560,
  /** 4K / UHD. */
  ultraWideXl: 3840
} as const;

/**
 * Column count for the games grid by max viewport width. The list iterates
 * these ascending and picks the first matching column count; widths above the
 * largest entry use `GAME_GRID_FALLBACK_COLUMNS`.
 */
export const GAME_GRID_BREAKPOINTS: ReadonlyArray<{ readonly maxWidth: number; readonly columns: number }> = [
  { maxWidth: 600, columns: 2 },
  { maxWidth: 900, columns: 3 },
  { maxWidth: 1200, columns: 4 },
  { maxWidth: 1600, columns: 5 },
  { maxWidth: 1920, columns: 6 },
  { maxWidth: 2560, columns: 7 }
] as const;

/** Columns used on viewports wider than every threshold in `GAME_GRID_BREAKPOINTS`. */
export const GAME_GRID_FALLBACK_COLUMNS: number = 8;
