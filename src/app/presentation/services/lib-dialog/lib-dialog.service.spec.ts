import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { LibDialogService, LibDialogRef, LIB_DIALOG_DATA } from './lib-dialog.service';
import { LibOverlayService, LibOverlayRef } from '@/services/lib-overlay/lib-overlay.service';

@Component({ selector: 'app-test-dialog', template: '', standalone: true })
class TestDialogComponent {}

describe('LibDialogService', () => {
  let service: LibDialogService;
  let mockOverlayRef: Partial<LibOverlayRef<TestDialogComponent, unknown>>;
  let mockOverlayService: Partial<LibOverlayService>;

  beforeEach(() => {
    mockOverlayRef = {
      componentInstance: null,
      close: vi.fn(),
      afterClosed$: of(undefined),
      backdropClick$: of(new MouseEvent('click')),
      keydownEvents$: of(new KeyboardEvent('keydown'))
    };

    mockOverlayService = {
      open: vi.fn().mockReturnValue(mockOverlayRef)
    };

    TestBed.configureTestingModule({
      providers: [LibDialogService, { provide: LibOverlayService, useValue: mockOverlayService }]
    });
    service = TestBed.inject(LibDialogService);
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('open() delega en LibOverlayService', () => {
    service.open(TestDialogComponent, { data: { foo: 'bar' } });
    expect(mockOverlayService.open).toHaveBeenCalled();
  });

  it('open() devuelve un LibDialogRef', () => {
    const ref = service.open(TestDialogComponent);
    expect(ref).toBeInstanceOf(LibDialogRef);
  });

  it('open() incluye lib-overlay-panel--dialog en el panelClass', () => {
    service.open(TestDialogComponent);
    const callArgs = (mockOverlayService.open as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(callArgs.panelClass).toContain('lib-overlay-panel--dialog');
  });
});

describe('LibDialogRef', () => {
  let overlayRef: LibOverlayRef<TestDialogComponent, boolean>;
  let dialogRef: LibDialogRef<TestDialogComponent, boolean>;

  beforeEach(() => {
    overlayRef = {
      componentInstance: null,
      close: vi.fn(),
      afterClosed$: of(true),
      backdropClick$: of(new MouseEvent('click')),
      keydownEvents$: of(new KeyboardEvent('keydown'))
    } as unknown as LibOverlayRef<TestDialogComponent, boolean>;

    dialogRef = new LibDialogRef(overlayRef);
  });

  it('afterClosed() devuelve el observable afterClosed$ del overlay', async () => {
    const { firstValueFrom } = await import('rxjs');
    const result = await firstValueFrom(dialogRef.afterClosed());
    expect(result).toBe(true);
  });

  it('close() delega en el overlayRef', () => {
    dialogRef.close(true);
    expect(overlayRef.close).toHaveBeenCalledWith(true);
  });

  it('close() sin argumento delega sin resultado', () => {
    dialogRef.close();
    expect(overlayRef.close).toHaveBeenCalledWith(undefined);
  });
});

describe('LIB_DIALOG_DATA', () => {
  it('es el mismo token que LIB_OVERLAY_DATA', () => {
    const { LIB_OVERLAY_DATA } = require('@/services/lib-overlay/lib-overlay.service');
    expect(LIB_DIALOG_DATA).toBe(LIB_OVERLAY_DATA);
  });
});
