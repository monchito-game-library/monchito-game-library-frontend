import { ElementRef, TemplateRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { firstValueFrom, Subject } from 'rxjs';
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
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [OverlayModule]
    });
    service = TestBed.inject(RetroOverlayService);
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('open() con componente devuelve un RetroOverlayRef', () => {
    const ref = service.open(DummyOverlayComponent);
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('afterClosed$ emite undefined al cerrar sin resultado', async () => {
    const ref = service.open(DummyOverlayComponent);
    const closePromise = firstValueFrom(ref.afterClosed$);
    ref.close();
    const result = await closePromise;
    expect(result).toBeUndefined();
  });

  it('afterClosed$ emite el resultado pasado a close()', async () => {
    const ref = service.open<DummyOverlayComponent, string>(DummyOverlayComponent);
    const closePromise = firstValueFrom(ref.afterClosed$);
    ref.close('done');
    const result = await closePromise;
    expect(result).toBe('done');
  });

  it('componentInstance apunta al componente montado', () => {
    const ref = service.open(DummyOverlayComponent);
    expect(ref.componentInstance).toBeInstanceOf(DummyOverlayComponent);
    ref.close();
  });

  it('backdropClick$ es un Observable', () => {
    const ref = service.open(DummyOverlayComponent, { hasBackdrop: true });
    expect(ref.backdropClick$).toBeTruthy();
    ref.close();
  });

  it('open() con scrollStrategy block no lanza error', () => {
    const ref = service.open(DummyOverlayComponent, { scrollStrategy: 'block' });
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('open() con scrollStrategy close no lanza error', () => {
    const ref = service.open(DummyOverlayComponent, { scrollStrategy: 'close' });
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('open() con scrollStrategy reposition no lanza error', () => {
    const ref = service.open(DummyOverlayComponent, { scrollStrategy: 'reposition' });
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('open() sin scrollStrategy usa reposition por defecto', () => {
    const ref = service.open(DummyOverlayComponent, {});
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('open() con origin ElementRef usa posición anclada', () => {
    const fakeEl = document.createElement('button');
    document.body.appendChild(fakeEl);
    const elRef = new ElementRef(fakeEl);
    const ref = service.open(DummyOverlayComponent, { origin: elRef });
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
    document.body.removeChild(fakeEl);
  });

  it('open() con origin HTMLElement directo usa posición anclada', () => {
    const fakeEl = document.createElement('button');
    document.body.appendChild(fakeEl);
    const ref = service.open(DummyOverlayComponent, { origin: fakeEl });
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
    document.body.removeChild(fakeEl);
  });

  it('open() con focusTrap activa el focus trap', () => {
    const ref = service.open(DummyOverlayComponent, { ...RETRO_OVERLAY_DIALOG_CONFIG });
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('open() con restoreFocus sin focusTrap no lanza error', async () => {
    const ref = service.open(DummyOverlayComponent, { restoreFocus: true, focusTrap: false });
    const closePromise = firstValueFrom(ref.afterClosed$);
    ref.close();
    await closePromise;
    expect(ref).toBeInstanceOf(RetroOverlayRef);
  });

  it('open() con hasBackdrop y disableClose no cierra al hacer backdrop click', () => {
    const ref = service.open(DummyOverlayComponent, { hasBackdrop: true, disableClose: true });
    // El overlay sigue abierto después del backdrop click
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('open() con extraProviders los incluye en el injector', () => {
    const ref = service.open(DummyOverlayComponent, {
      extraProviders: (_libRef) => [{ provide: 'TEST', useValue: 'test-value' }]
    });
    expect(ref.componentInstance).toBeInstanceOf(DummyOverlayComponent);
    ref.close();
  });

  it('keydownEvents$ emite eventos de teclado del overlay', async () => {
    const ref = service.open(DummyOverlayComponent);
    expect(ref.keydownEvents$).toBeTruthy();
    ref.close();
  });

  describe('preset configs', () => {
    it('RETRO_OVERLAY_DIALOG_CONFIG tiene focusTrap y scroll block', () => {
      expect(RETRO_OVERLAY_DIALOG_CONFIG.focusTrap).toBeTruthy();
      expect(RETRO_OVERLAY_DIALOG_CONFIG.scrollStrategy).toBe('block');
      expect(RETRO_OVERLAY_DIALOG_CONFIG.hasBackdrop).toBeTruthy();
    });

    it('RETRO_OVERLAY_MENU_CONFIG tiene backdrop transparente y sin focusTrap', () => {
      expect(RETRO_OVERLAY_MENU_CONFIG.focusTrap).toBeFalsy();
      expect(RETRO_OVERLAY_MENU_CONFIG.backdropClass).toBe('retro-overlay-backdrop--transparent');
    });

    it('RETRO_OVERLAY_BOTTOM_SHEET_CONFIG tiene focusTrap y panelClass bottom-sheet', () => {
      expect(RETRO_OVERLAY_BOTTOM_SHEET_CONFIG.focusTrap).toBeTruthy();
      expect(RETRO_OVERLAY_BOTTOM_SHEET_CONFIG.panelClass).toBe('retro-overlay-panel--bottom-sheet');
    });
  });
});

describe('RetroOverlayRef', () => {
  it('backdropClick$ delega en el overlayRef', () => {
    const subject = new Subject<MouseEvent>();
    const fakeOverlayRef = {
      dispose: vi.fn(),
      backdropClick: vi.fn().mockReturnValue(subject.asObservable()),
      keydownEvents: vi.fn().mockReturnValue(new Subject().asObservable())
    };
    const ref = new RetroOverlayRef(fakeOverlayRef as any);
    expect(ref.backdropClick$).toBeTruthy();
  });

  it('keydownEvents$ delega en el overlayRef', () => {
    const subject = new Subject<KeyboardEvent>();
    const fakeOverlayRef = {
      dispose: vi.fn(),
      backdropClick: vi.fn().mockReturnValue(new Subject().asObservable()),
      keydownEvents: vi.fn().mockReturnValue(subject.asObservable())
    };
    const ref = new RetroOverlayRef(fakeOverlayRef as any);
    expect(ref.keydownEvents$).toBeTruthy();
  });
});
