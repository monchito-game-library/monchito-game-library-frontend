import { describe, beforeEach, expect, it, vi } from 'vitest';

import { CropInteractionBase } from './crop-interaction.base';

class TestCropInteraction extends CropInteractionBase {
  constructor(cropW = 200, cropH = 200) {
    super();
    this._cropW = cropW;
    this._cropH = cropH;
  }
}

function makeImgEvent(naturalWidth: number, naturalHeight: number): Event {
  return { target: { naturalWidth, naturalHeight } as HTMLImageElement } as unknown as Event;
}

function makePointerEvent(overrides: {
  pointerType?: string;
  clientX?: number;
  clientY?: number;
  pointerId?: number;
}): PointerEvent {
  return {
    pointerType: overrides.pointerType ?? 'mouse',
    clientX: overrides.clientX ?? 0,
    clientY: overrides.clientY ?? 0,
    pointerId: overrides.pointerId ?? 1,
    currentTarget: { setPointerCapture: vi.fn() },
    preventDefault: vi.fn()
  } as unknown as PointerEvent;
}

function makeTouchEvent(touches: { clientX: number; clientY: number }[]): TouchEvent {
  return {
    touches,
    preventDefault: vi.fn()
  } as unknown as TouchEvent;
}

describe('CropInteractionBase', () => {
  let crop: TestCropInteraction;

  beforeEach(() => {
    crop = new TestCropInteraction();
  });

  describe('valores iniciales', () => {
    it('posX es 50', () => expect(crop.posX()).toBe(50));
    it('posY es 50', () => expect(crop.posY()).toBe(50));
    it('scale es 1', () => expect(crop.scale()).toBe(1));
    it('imageLoaded es false', () => expect(crop.imageLoaded()).toBe(false));
    it('isDragging es false', () => expect(crop.isDragging()).toBe(false));
    it('positionCss es "50% 50%"', () => expect(crop.positionCss()).toBe('50% 50%'));
    it('transformCss es "scale(1)"', () => expect(crop.transformCss()).toBe('scale(1)'));
  });

  describe('computed signals', () => {
    it('positionCss refleja posX y posY actualizados', () => {
      crop.posX.set(30);
      crop.posY.set(70);
      expect(crop.positionCss()).toBe('30% 70%');
    });

    it('transformCss refleja scale actualizado', () => {
      crop.scale.set(2);
      expect(crop.transformCss()).toBe('scale(2)');
    });
  });

  describe('onImageLoad', () => {
    it('marca imageLoaded como true', () => {
      crop.onImageLoad(makeImgEvent(400, 200));
      expect(crop.imageLoaded()).toBe(true);
    });

    it('imagen ancha (imageAR > containerAR): calcula overflowX, overflowY = 0', () => {
      // Container 200x200, imagen 400x200 → imageAR=2 > containerAR=1
      // overflowX = 200 * 2 - 200 = 200, overflowY = 0
      crop.onImageLoad(makeImgEvent(400, 200));
      expect((crop as any)._overflowX).toBe(200);
      expect((crop as any)._overflowY).toBe(0);
    });

    it('imagen alta (imageAR < containerAR): calcula overflowY, overflowX = 0', () => {
      // Container 200x200, imagen 200x400 → imageAR=0.5 < containerAR=1
      // overflowY = 200 / 0.5 - 200 = 200, overflowX = 0
      crop.onImageLoad(makeImgEvent(200, 400));
      expect((crop as any)._overflowX).toBe(0);
      expect((crop as any)._overflowY).toBe(200);
    });
  });

  describe('onPointerDown', () => {
    it('ignora eventos de tipo touch', () => {
      crop.onPointerDown(makePointerEvent({ pointerType: 'touch' }));
      expect(crop.isDragging()).toBe(false);
    });

    it('inicia el arrastre con eventos de tipo mouse', () => {
      const event = makePointerEvent({ pointerType: 'mouse', clientX: 100, clientY: 80 });
      crop.onPointerDown(event);
      expect(crop.isDragging()).toBe(true);
    });

    it('llama a setPointerCapture con el pointerId', () => {
      const event = makePointerEvent({ pointerType: 'mouse', pointerId: 42 });
      crop.onPointerDown(event);
      expect((event.currentTarget as any).setPointerCapture).toHaveBeenCalledWith(42);
    });
  });

  describe('onPointerMove', () => {
    it('no mueve la imagen si no está arrastrando', () => {
      crop.onPointerMove(makePointerEvent({ clientX: 50 }));
      expect(crop.posX()).toBe(50);
    });

    it('actualiza posX al arrastrar horizontalmente sobre imagen ancha', () => {
      // Container 200x200, imagen 400x200 → _overflowX = 200
      crop.onImageLoad(makeImgEvent(400, 200));
      crop.onPointerDown(makePointerEvent({ pointerType: 'mouse', clientX: 0, clientY: 0 }));
      // dx = +20 → posX = 50 - (20/200)*100 = 40
      crop.onPointerMove(makePointerEvent({ clientX: 20, clientY: 0 }));
      expect(crop.posX()).toBe(40);
    });

    it('posX se limita entre 0 y 100', () => {
      crop.onImageLoad(makeImgEvent(400, 200));
      crop.onPointerDown(makePointerEvent({ pointerType: 'mouse', clientX: 0 }));
      // Arrastre extremo a la derecha → posX llega a 0
      crop.onPointerMove(makePointerEvent({ clientX: 1000 }));
      expect(crop.posX()).toBe(0);
    });
  });

  describe('onPointerUp', () => {
    it('termina el arrastre', () => {
      crop.onPointerDown(makePointerEvent({ pointerType: 'mouse' }));
      crop.onPointerUp();
      expect(crop.isDragging()).toBe(false);
    });
  });

  describe('onWheel', () => {
    it('aumenta el zoom al desplazar hacia arriba (deltaY < 0)', () => {
      crop.scale.set(2);
      crop.onWheel({ deltaY: -1, preventDefault: vi.fn() } as unknown as WheelEvent);
      expect(crop.scale()).toBeCloseTo(2.1);
    });

    it('reduce el zoom al desplazar hacia abajo (deltaY > 0)', () => {
      crop.scale.set(2);
      crop.onWheel({ deltaY: 1, preventDefault: vi.fn() } as unknown as WheelEvent);
      expect(crop.scale()).toBeCloseTo(1.9);
    });

    it('no baja del mínimo (1) al hacer zoom out', () => {
      // scale ya está en 1; otro scroll hacia abajo → se queda en 1
      crop.onWheel({ deltaY: 1, preventDefault: vi.fn() } as unknown as WheelEvent);
      expect(crop.scale()).toBe(1);
    });

    it('no supera el máximo (4) al hacer zoom in', () => {
      crop.scale.set(4);
      crop.onWheel({ deltaY: -1, preventDefault: vi.fn() } as unknown as WheelEvent);
      expect(crop.scale()).toBe(4);
    });
  });

  describe('onTouchStart', () => {
    it('registra la posición inicial con 1 dedo', () => {
      crop.onTouchStart(makeTouchEvent([{ clientX: 10, clientY: 20 }]));
      // No podemos leer _lastPointerX directamente, pero sí verificar que
      // un move posterior usa ese punto como referencia
      crop.onImageLoad(makeImgEvent(400, 200));
      crop.onTouchMove(makeTouchEvent([{ clientX: 30, clientY: 20 }]));
      // dx = 20 → posX = 50 - (20/200)*100 = 40
      expect(crop.posX()).toBe(40);
    });

    it('registra la distancia y scale iniciales con 2 dedos', () => {
      crop.scale.set(1);
      crop.onTouchStart(
        makeTouchEvent([
          { clientX: 0, clientY: 0 },
          { clientX: 100, clientY: 0 }
        ])
      );
      expect((crop as any)._pinchStartDistance).toBe(100);
      expect((crop as any)._pinchStartScale).toBe(1);
    });
  });

  describe('onTouchMove', () => {
    it('actualiza el scale con pinch-to-zoom (2 dedos)', () => {
      crop.onTouchStart(
        makeTouchEvent([
          { clientX: 0, clientY: 0 },
          { clientX: 100, clientY: 0 }
        ])
      );
      // Separan los dedos al doble → scale = 1 * (200/100) = 2
      crop.onTouchMove(
        makeTouchEvent([
          { clientX: 0, clientY: 0 },
          { clientX: 200, clientY: 0 }
        ])
      );
      expect(crop.scale()).toBe(2);
    });

    it('el scale no supera 4 con pinch', () => {
      crop.onTouchStart(
        makeTouchEvent([
          { clientX: 0, clientY: 0 },
          { clientX: 10, clientY: 0 }
        ])
      );
      // Separación extrema → intenta scale = 1 * (1000/10) = 100 → clamp a 4
      crop.onTouchMove(
        makeTouchEvent([
          { clientX: 0, clientY: 0 },
          { clientX: 1000, clientY: 0 }
        ])
      );
      expect(crop.scale()).toBe(4);
    });

    it('arrastra la imagen con 1 dedo', () => {
      crop.onImageLoad(makeImgEvent(400, 200));
      crop.onTouchStart(makeTouchEvent([{ clientX: 0, clientY: 0 }]));
      // dx = 20 → posX = 50 - (20/200)*100 = 40
      crop.onTouchMove(makeTouchEvent([{ clientX: 20, clientY: 0 }]));
      expect(crop.posX()).toBe(40);
    });
  });

  describe('onTouchEnd', () => {
    it('actualiza la posición de referencia cuando queda 1 dedo', () => {
      crop.onImageLoad(makeImgEvent(400, 200));
      crop.onTouchStart(
        makeTouchEvent([
          { clientX: 0, clientY: 0 },
          { clientX: 100, clientY: 0 }
        ])
      );
      // Suelta un dedo, queda el dedo en (50, 0)
      crop.onTouchEnd(makeTouchEvent([{ clientX: 50, clientY: 0 }]));
      // Mueve ese dedo 20px a la derecha → dx = 20 → posX = 50 - (20/200)*100 = 40
      crop.onTouchMove(makeTouchEvent([{ clientX: 70, clientY: 0 }]));
      expect(crop.posX()).toBe(40);
    });
  });
});
