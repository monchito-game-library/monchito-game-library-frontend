import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { describe, beforeEach, it, expect } from 'vitest';
import { RetroBottomSheetService } from './retro-bottom-sheet.service';
import { RetroBottomSheetRef } from '@/types/retro-bottom-sheet-ref.type';
import { RetroOverlayRef } from '@/services/retro-overlay/retro-overlay.service';

@Component({
  selector: 'app-dummy-sheet',
  template: '<p>Sheet content</p>',
  standalone: true
})
class DummySheetComponent {}

describe('RetroBottomSheetService', () => {
  let service: RetroBottomSheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule]
    });
    service = TestBed.inject(RetroBottomSheetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a component and return a RetroBottomSheetRef', () => {
    const ref: RetroBottomSheetRef<DummySheetComponent> = service.open(DummySheetComponent);
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('should close and emit on afterClosed$', async () => {
    const ref = service.open(DummySheetComponent);
    const closePromise = new Promise<unknown>((resolve) => {
      ref.afterClosed$.subscribe(resolve);
    });
    ref.close('result');
    const result = await closePromise;
    expect(result).toBe('result');
  });
});
