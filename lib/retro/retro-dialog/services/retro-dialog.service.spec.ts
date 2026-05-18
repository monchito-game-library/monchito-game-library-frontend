import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { RetroDialogService, RetroDialogRef, RETRO_DIALOG_DATA } from './retro-dialog.service';
import { RetroOverlayService, RetroOverlayRef } from '../../retro-overlay/services/retro-overlay.service';

@Component({ selector: 'app-test-dialog', template: '', standalone: true })
class TestDialogComponent {}

describe('RetroDialogService', () => {
  let service: RetroDialogService;
  let mockOverlayRef: Partial<RetroOverlayRef<TestDialogComponent, unknown>>;
  let mockOverlayService: Partial<RetroOverlayService>;

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
      providers: [RetroDialogService, { provide: RetroOverlayService, useValue: mockOverlayService }]
    });
    service = TestBed.inject(RetroDialogService);
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('open() delega en RetroOverlayService', () => {
    service.open(TestDialogComponent, { data: { foo: 'bar' } });
    expect(mockOverlayService.open).toHaveBeenCalled();
  });

  it('open() devuelve un RetroDialogRef', () => {
    const ref = service.open(TestDialogComponent);
    expect(ref).toBeInstanceOf(RetroDialogRef);
  });

  it('open() incluye retro-overlay-panel--dialog en el panelClass', () => {
    service.open(TestDialogComponent);
    const callArgs = (mockOverlayService.open as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(callArgs.panelClass).toContain('retro-overlay-panel--dialog');
  });
});

describe('RetroDialogRef', () => {
  let overlayRef: RetroOverlayRef<TestDialogComponent, boolean>;
  let dialogRef: RetroDialogRef<TestDialogComponent, boolean>;

  beforeEach(() => {
    overlayRef = {
      componentInstance: null,
      close: vi.fn(),
      afterClosed$: of(true),
      backdropClick$: of(new MouseEvent('click')),
      keydownEvents$: of(new KeyboardEvent('keydown'))
    } as unknown as RetroOverlayRef<TestDialogComponent, boolean>;

    dialogRef = new RetroDialogRef(overlayRef);
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

describe('RETRO_DIALOG_DATA', () => {
  it('es el mismo token que RETRO_OVERLAY_DATA', () => {
    const { RETRO_OVERLAY_DATA } = require('../../retro-overlay/services/retro-overlay.service');
    expect(RETRO_DIALOG_DATA).toBe(RETRO_OVERLAY_DATA);
  });
});
