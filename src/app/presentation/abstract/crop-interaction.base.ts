import { computed, signal, Signal, WritableSignal } from '@angular/core';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

/**
 * Abstract base class that encapsulates the shared drag, zoom and touch
 * interaction logic for image crop/position dialogs.
 *
 * Subclasses must set `_cropW` and `_cropH` in their constructor before
 * any user interaction occurs.
 */
export abstract class CropInteractionBase {
  protected _cropW: number = 0;
  protected _cropH: number = 0;
  protected _imgEl: HTMLImageElement | null = null;
  protected _overflowX: number = 0;
  protected _overflowY: number = 0;

  private _lastPointerX: number = 0;
  private _lastPointerY: number = 0;
  private _pinchStartDistance: number = 0;
  private _pinchStartScale: number = 1;

  /** Horizontal position percentage (0–100). */
  readonly posX: WritableSignal<number> = signal<number>(50);

  /** Vertical position percentage (0–100). */
  readonly posY: WritableSignal<number> = signal<number>(50);

  /** Zoom scale factor (1 = fit, up to 4×). */
  readonly scale: WritableSignal<number> = signal<number>(1);

  /** Whether the image has finished loading. */
  readonly imageLoaded: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the user is currently dragging. */
  readonly isDragging: WritableSignal<boolean> = signal<boolean>(false);

  /** CSS object-position value derived from posX and posY. */
  readonly positionCss: Signal<string> = computed((): string => `${this.posX()}% ${this.posY()}%`);

  /** CSS transform value derived from the scale signal. */
  readonly transformCss: Signal<string> = computed((): string => `scale(${this.scale()})`);

  /**
   * Computes the image overflow once it loads so drag sensitivity is proportional.
   *
   * @param {Event} event - Native load event from the img element
   */
  onImageLoad(event: Event): void {
    const img: HTMLImageElement = event.target as HTMLImageElement;
    this._imgEl = img;
    const containerAR: number = this._cropW / this._cropH;
    const imageAR: number = img.naturalWidth / img.naturalHeight;

    if (imageAR > containerAR) {
      this._overflowX = this._cropH * imageAR - this._cropW;
      this._overflowY = 0;
    } else {
      this._overflowX = 0;
      this._overflowY = this._cropW / imageAR - this._cropH;
    }

    this.imageLoaded.set(true);
  }

  /**
   * Starts drag tracking and captures the pointer.
   *
   * @param {PointerEvent} event - Evento del puntero
   */
  onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    this.isDragging.set(true);
    this._lastPointerX = event.clientX;
    this._lastPointerY = event.clientY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  /**
   * Updates position based on pointer delta while dragging.
   *
   * @param {PointerEvent} event - Evento del puntero
   */
  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) return;
    const dx: number = event.clientX - this._lastPointerX;
    const dy: number = event.clientY - this._lastPointerY;
    this._lastPointerX = event.clientX;
    this._lastPointerY = event.clientY;
    this._applyDelta(dx, dy);
  }

  /**
   * Ends drag tracking.
   */
  onPointerUp(): void {
    this.isDragging.set(false);
  }

  /**
   * Handles mouse wheel to zoom in or out.
   *
   * @param {WheelEvent} event - Evento de la rueda
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    this._applyZoom(event.deltaY > 0 ? -0.1 : 0.1);
  }

  /**
   * Records the initial pinch distance and scale when a two-finger gesture starts.
   *
   * @param {TouchEvent} event - Evento táctil
   */
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 2) {
      this._pinchStartDistance = this._touchDistance(event);
      this._pinchStartScale = this.scale();
      event.preventDefault();
    } else if (event.touches.length === 1) {
      this._lastPointerX = event.touches[0].clientX;
      this._lastPointerY = event.touches[0].clientY;
    }
  }

  /**
   * Handles single-finger drag and two-finger pinch-to-zoom on touch devices.
   *
   * @param {TouchEvent} event - Evento táctil
   */
  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 2) {
      const distance: number = this._touchDistance(event);
      this.scale.set(
        Math.max(MIN_SCALE, Math.min(MAX_SCALE, this._pinchStartScale * (distance / this._pinchStartDistance)))
      );
    } else if (event.touches.length === 1) {
      const dx: number = event.touches[0].clientX - this._lastPointerX;
      const dy: number = event.touches[0].clientY - this._lastPointerY;
      this._lastPointerX = event.touches[0].clientX;
      this._lastPointerY = event.touches[0].clientY;
      this._applyDelta(dx, dy);
    }
  }

  /**
   * Resets the last touch position when a finger is lifted so single-finger
   * drag starts correctly after a pinch gesture.
   *
   * @param {TouchEvent} event - Evento táctil
   */
  onTouchEnd(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this._lastPointerX = event.touches[0].clientX;
      this._lastPointerY = event.touches[0].clientY;
    }
  }

  /**
   * Applies a pan delta (in pixels) to posX and posY, adjusted by current scale.
   * The effective overflow accounts for both the image's natural overflow at scale 1
   * and the additional apparent overflow introduced by the CSS scale transform.
   *
   * @param {number} dx - Horizontal pixel delta
   * @param {number} dy - Vertical pixel delta
   */
  private _applyDelta(dx: number, dy: number): void {
    const s: number = this.scale();
    const effectiveOverflowX: number = (this._cropW + this._overflowX) * s - this._cropW;
    const effectiveOverflowY: number = (this._cropH + this._overflowY) * s - this._cropH;
    if (effectiveOverflowX > 0) {
      this.posX.update((x: number): number => Math.max(0, Math.min(100, x - (dx / effectiveOverflowX) * 100)));
    }
    if (effectiveOverflowY > 0) {
      this.posY.update((y: number): number => Math.max(0, Math.min(100, y - (dy / effectiveOverflowY) * 100)));
    }
  }

  /**
   * Applies a zoom delta to the current scale, clamped between MIN_SCALE and MAX_SCALE.
   *
   * @param {number} delta - Amount to add to the current scale
   */
  private _applyZoom(delta: number): void {
    this.scale.update((s: number): number => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s + delta)));
  }

  /**
   * Returns the Euclidean distance between the two active touch points.
   *
   * @param {TouchEvent} event - Evento táctil
   */
  private _touchDistance(event: TouchEvent): number {
    const dx: number = event.touches[0].clientX - event.touches[1].clientX;
    const dy: number = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
