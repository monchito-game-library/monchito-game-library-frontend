/**
 * Transforms a RAWG media URL to a resized version using the app's own
 * `/rawg-media/` proxy path, which rewrites to `https://media.rawg.io/...`.
 *
 * Using a same-origin proxy avoids CORS issues and gives us full control
 * over caching headers. Non-RAWG URLs are returned unchanged.
 *
 * @param {string | null | undefined} url - Original image URL
 * @param {number} width - Target width in pixels (default 420 — fits 2× DPR on a 210px card)
 */
export function optimizeImageUrl(url: string | null | undefined, width: number = 420): string | null {
  if (!url) return null;

  // RAWG CDN: https://media.rawg.io/media/games/... → /rawg-media/media/resize/420/-/games/...
  if (url.includes('media.rawg.io/media/') && !url.includes('/resize/') && !url.includes('/crop/')) {
    const resized = url.replace('media.rawg.io/media/', `media.rawg.io/media/resize/${width}/-/`);
    return toProxiedUrl(resized);
  }

  return toProxiedUrl(url);
}

/**
 * Rewrites any `https://media.rawg.io/...` URL to a same-origin proxy
 * (`/rawg-media/...`). Other URLs pass through unchanged.
 */
function toProxiedUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('https://media.rawg.io/')) {
    return '/rawg-media/' + url.slice('https://media.rawg.io/'.length);
  }
  return url;
}
