/**
 * Transforms a RAWG media URL to a resized version using RAWG's resize CDN endpoint.
 * For non-RAWG URLs the original is returned unchanged.
 *
 * @param {string | null | undefined} url - Original image URL
 * @param {number} width - Target width in pixels (default 420 — fits 2× DPR on a 210px card)
 */
export function optimizeImageUrl(url: string | null | undefined, width: number = 420): string | null {
  if (!url) return null;

  // RAWG CDN: https://media.rawg.io/media/games/... → /media/resize/420/-/games/...
  if (url.includes('media.rawg.io/media/') && !url.includes('/resize/') && !url.includes('/crop/')) {
    return url.replace('media.rawg.io/media/', `media.rawg.io/media/resize/${width}/-/`);
  }

  return url;
}
