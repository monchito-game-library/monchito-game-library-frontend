import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { extractDominantColor } from './dominant-color.util';

const W = 50;
const H = 67;
const PIXEL_COUNT = W * H;

function makePixelData(r: number, g: number, b: number): ImageData {
  const data = new Uint8ClampedArray(PIXEL_COUNT * 4);
  for (let i = 0; i < PIXEL_COUNT; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { data, width: W, height: H } as unknown as ImageData;
}

describe('extractDominantColor', () => {
  let mockCtx: any;

  let mockCanvas: any;

  beforeEach(() => {
    mockCtx = { drawImage: vi.fn(), getImageData: vi.fn() };
    mockCanvas = { width: 0, height: 0, getContext: vi.fn(() => mockCtx) };

    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) =>
      tag === 'canvas' ? (mockCanvas as HTMLCanvasElement) : origCreate(tag as 'div')
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna rgba con el promedio de los píxeles válidos (brillo entre 30 y 225)', () => {
    mockCtx.getImageData.mockReturnValue(makePixelData(100, 150, 200));
    expect(extractDominantColor({} as HTMLImageElement)).toBe('rgba(100, 150, 200, 0.75)');
  });

  it('usa el fallback de promedio total cuando todos los píxeles son near-black (brillo < 30)', () => {
    mockCtx.getImageData.mockReturnValue(makePixelData(10, 10, 10));
    expect(extractDominantColor({} as HTMLImageElement)).toBe('rgba(10, 10, 10, 0.75)');
  });

  it('usa el fallback de promedio total cuando todos los píxeles son near-white (brillo > 225)', () => {
    mockCtx.getImageData.mockReturnValue(makePixelData(240, 240, 240));
    expect(extractDominantColor({} as HTMLImageElement)).toBe('rgba(240, 240, 240, 0.75)');
  });

  it('usa el fallback cuando hay menos de 50 píxeles válidos', () => {
    const data = new Uint8ClampedArray(PIXEL_COUNT * 4).fill(5);
    for (let i = 0; i < 49; i++) {
      data[i * 4] = 100;
      data[i * 4 + 1] = 100;
      data[i * 4 + 2] = 100;
      data[i * 4 + 3] = 255;
    }
    mockCtx.getImageData.mockReturnValue({ data, width: W, height: H } as unknown as ImageData);
    const result = extractDominantColor({} as HTMLImageElement);
    expect(result).not.toBeNull();
    expect(result).toMatch(/^rgba\(\d+, \d+, \d+, 0\.75\)$/);
  });

  it('retorna null cuando getContext devuelve null', () => {
    mockCanvas.getContext.mockReturnValue(null);
    expect(extractDominantColor({} as HTMLImageElement)).toBeNull();
  });

  it('retorna null cuando drawImage lanza un error (p.ej. restricción CORS)', () => {
    mockCtx.drawImage.mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(extractDominantColor({} as HTMLImageElement)).toBeNull();
  });
});
