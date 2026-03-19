import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TranslocoPipe } from '@ngneat/transloco';

import { CoverPositionDialogDataInterface } from '@/interfaces/cover-position-dialog-data.interface';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

@Component({
  selector: 'app-game-cover-position-dialog',
  templateUrl: './game-cover-position-dialog.component.html',
  styleUrl: './game-cover-position-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, TranslocoPipe]
})
export class GameCoverPositionDialogComponent {
  private readonly _dialogRef: MatDialogRef<GameCoverPositionDialogComponent, string | null> = inject(
    MatDialogRef<GameCoverPositionDialogComponent, string | null>
  );

  /** Fixed preview container width in px — mirrors the 3:4 card aspect ratio. */
  private readonly _containerW: number = 240;
  private readonly _containerH: number = 320;

  private _lastPointerX: number = 0;
  private _lastPointerY: number = 0;
  /** Pixel overflow the image extends beyond the container horizontally (at scale 1). */
  private _overflowX: number = 0;
  /** Pixel overflow the image extends beyond the container vertically (at scale 1). */
  private _overflowY: number = 0;
  /** Initial pinch distance, used to compute pinch scale delta. */
  private _pinchStartDistance: number = 0;
  /** Scale value at the moment the pinch gesture started. */
  private _pinchStartScale: number = 1;

  readonly config: CoverPositionDialogDataInterface = inject<CoverPositionDialogDataInterface>(MAT_DIALOG_DATA);

  /** Horizontal position percentage (0–100). */
  readonly posX: WritableSignal<number> = signal<number>(50);

  /** Vertical position percentage (0–100). */
  readonly posY: WritableSignal<number> = signal<number>(50);

  /** Zoom scale factor (1 = normal fill, up to MAX_SCALE). */
  readonly scale: WritableSignal<number> = signal<number>(1);

  /** Whether the cover image has finished loading. */
  readonly imageLoaded: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the user is currently dragging the image. */
  readonly isDragging: WritableSignal<boolean> = signal<boolean>(false);

  /** CSS object-position value derived from posX and posY signals. */
  readonly positionCss: Signal<string> = computed((): string => `${this.posX()}% ${this.posY()}%`);

  /** CSS transform value derived from the scale signal. */
  readonly transformCss: Signal<string> = computed((): string => `scale(${this.scale()})`);

  constructor() {
    const pos: string | null = this.config.initialPosition;
    if (pos) {
      const parts: string[] = pos.split(' ');
      if (parts.length >= 2) {
        this.posX.set(parseFloat(parts[0]));
        this.posY.set(parseFloat(parts[1]));
      }
      if (parts.length >= 3) {
        this.scale.set(Math.max(MIN_SCALE, Math.min(MAX_SCALE, parseFloat(parts[2]))));
      }
    }
  }

  /**
   * Calculates the image overflow once it loads so drag sensitivity is proportional.
   *
   * @param {Event} event - Native load event from the img element
   */
  onImageLoad(event: Event): void {
    const img: HTMLImageElement = event.target as HTMLImageElement;
    const containerAR: number = this._containerW / this._containerH;
    const imageAR: number = img.naturalWidth / img.naturalHeight;

    if (imageAR > containerAR) {
      this._overflowX = this._containerH * imageAR - this._containerW;
      this._overflowY = 0;
    } else {
      this._overflowX = 0;
      this._overflowY = this._containerW / imageAR - this._containerH;
    }

    this.imageLoaded.set(true);
  }

  /**
   * Starts drag tracking and captures the pointer.
   *
   * @param {PointerEvent} event
   */
  onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'touch') return; // handled by touch events
    this.isDragging.set(true);
    this._lastPointerX = event.clientX;
    this._lastPointerY = event.clientY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  /**
   * Updates position based on pointer delta while dragging.
   *
   * @param {PointerEvent} event
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
   * @param {WheelEvent} event
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta: number = event.deltaY > 0 ? -0.1 : 0.1;
    this._applyZoom(delta);
  }

  /**
   * Records the initial pinch distance and scale when a two-finger gesture starts.
   *
   * @param {TouchEvent} event
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
   * @param {TouchEvent} event
   */
  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 2) {
      const distance: number = this._touchDistance(event);
      const newScale: number = this._pinchStartScale * (distance / this._pinchStartDistance);
      this.scale.set(Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale)));
    } else if (event.touches.length === 1) {
      const dx: number = event.touches[0].clientX - this._lastPointerX;
      const dy: number = event.touches[0].clientY - this._lastPointerY;
      this._lastPointerX = event.touches[0].clientX;
      this._lastPointerY = event.touches[0].clientY;
      this._applyDelta(dx, dy);
    }
  }

  /**
   * Closes the dialog and returns the chosen position + scale string.
   */
  onConfirm(): void {
    const x: number = Math.round(this.posX());
    const y: number = Math.round(this.posY());
    const s: string = this.scale().toFixed(2);
    this._dialogRef.close(`${x}% ${y}% ${s}`);
  }

  /**
   * Closes the dialog without returning a value.
   */
  onCancel(): void {
    this._dialogRef.close(null);
  }

  /**
   * Applies a pan delta (in pixels) to posX and posY, adjusted by current scale.
   *
   * @param {number} dx - Horizontal pixel delta
   * @param {number} dy - Vertical pixel delta
   */
  private _applyDelta(dx: number, dy: number): void {
    const s: number = this.scale();
    if (this._overflowX > 0 || s > 1) {
      const effectiveOverflowX: number = this._overflowX + this._containerW * (s - 1);
      this.posX.update((x: number): number => Math.max(0, Math.min(100, x - (dx / effectiveOverflowX) * 100)));
    }
    if (this._overflowY > 0 || s > 1) {
      const effectiveOverflowY: number = this._overflowY + this._containerH * (s - 1);
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
   * Returns the Euclidean distance between the two touch points.
   *
   * @param {TouchEvent} event
   */
  private _touchDistance(event: TouchEvent): number {
    const dx: number = event.touches[0].clientX - event.touches[1].clientX;
    const dy: number = event.touches[0].clientY - event.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
