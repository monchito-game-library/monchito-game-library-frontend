/**
 * Extracts a dominant color from an HTMLImageElement using canvas pixel sampling.
 * Skips near-black and near-white pixels to get a more representative mid-tone.
 * Returns an rgba string or null if extraction fails (e.g. CORS restriction).
 */
export function extractDominantColor(img: HTMLImageElement): string | null {
  try {
    const W = 50;
    const H = 67;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, W, H);
    const { data } = ctx.getImageData(0, 0, W, H);

    let r = 0,
      g = 0,
      b = 0,
      count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const pr = data[i],
        pg = data[i + 1],
        pb = data[i + 2];
      const brightness = (pr + pg + pb) / 3;
      if (brightness < 30 || brightness > 225) continue;
      r += pr;
      g += pg;
      b += pb;
      count++;
    }

    if (count < 50) {
      r = 0;
      g = 0;
      b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      count = data.length / 4;
    }

    return `rgba(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}, 0.75)`;
  } catch {
    return null;
  }
}
