import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { describe, beforeEach, it, expect } from 'vitest';
import { firstValueFrom } from 'rxjs';
import {
  RetroOverlayService,
  RetroOverlayRef,
  RETRO_OVERLAY_DIALOG_CONFIG,
  RETRO_OVERLAY_MENU_CONFIG,
  RETRO_OVERLAY_BOTTOM_SHEET_CONFIG
} from './retro-overlay.service';

@Component({
  selector: 'app-dummy-overlay',
  template: '<p>Overlay content</p>',
  standalone: true
})
class DummyOverlayComponent {}

describe('RetroOverlayService', () => {
  let service: RetroOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule]
    });
    service = TestBed.inject(RetroOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a component and return a RetroOverlayRef', () => {
    const ref = service.open(DummyOverlayComponent);
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('should close the overlay and emit undefined on afterClosed$ when no result', async () => {
    const ref = service.open(DummyOverlayComponent);
    const closePromise = firstValueFrom(ref.afterClosed$);
    ref.close();
    const result = await closePromise;
    expect(result).toBeUndefined();
  });

  it('should emit the result passed to close()', async () => {
    const ref = service.open<DummyOverlayComponent, string>(DummyOverlayComponent);
    const closePromise = firstValueFrom(ref.afterClosed$);
    ref.close('done');
    const result = await closePromise;
    expect(result).toBe('done');
  });

  it('should set componentInstance on the ref', () => {
    const ref = service.open(DummyOverlayComponent);
    expect(ref.componentInstance).toBeInstanceOf(DummyOverlayComponent);
    ref.close();
  });

  describe('preset configs', () => {
    it('RETRO_OVERLAY_DIALOG_CONFIG should have focusTrap and block scroll', () => {
      expect(RETRO_OVERLAY_DIALOG_CONFIG.focusTrap).toBeTruthy();
      expect(RETRO_OVERLAY_DIALOG_CONFIG.scrollStrategy).toBe('block');
      expect(RETRO_OVERLAY_DIALOG_CONFIG.hasBackdrop).toBeTruthy();
    });

    it('RETRO_OVERLAY_MENU_CONFIG should have transparent backdrop and no focusTrap', () => {
      expect(RETRO_OVERLAY_MENU_CONFIG.focusTrap).toBeFalsy();
      expect(RETRO_OVERLAY_MENU_CONFIG.backdropClass).toBe('retro-overlay-backdrop--transparent');
    });

    it('RETRO_OVERLAY_BOTTOM_SHEET_CONFIG should have focusTrap and bottom-sheet panel class', () => {
      expect(RETRO_OVERLAY_BOTTOM_SHEET_CONFIG.focusTrap).toBeTruthy();
      expect(RETRO_OVERLAY_BOTTOM_SHEET_CONFIG.panelClass).toBe('retro-overlay-panel--bottom-sheet');
    });
  });
});
