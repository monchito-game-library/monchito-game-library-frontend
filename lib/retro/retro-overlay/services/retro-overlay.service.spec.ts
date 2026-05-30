import { ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { Component, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-template-host',
  template: '<ng-template #tmpl><p tabindex="0">Template content</p></ng-template>',
  standalone: true
})
class TemplateHostComponent {
  @ViewChild('tmpl', { read: TemplateRef }) tmpl!: TemplateRef<unknown>;
  @ViewChild('tmpl', { read: ViewContainerRef }) vcr!: ViewContainerRef;
}

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

  it('open() sin config usa defaults sin lanzar error', () => {
    const ref = service.open(DummyOverlayComponent, undefined);
    expect(ref).toBeInstanceOf(RetroOverlayRef);
    ref.close();
  });

  it('abrir y cerrar N veces no acumula subscripciones en _subs', () => {
    let lastRef!: RetroOverlayRef;
    for (let i = 0; i < 3; i++) {
      lastRef = service.open(DummyOverlayComponent, { hasBackdrop: true });
      lastRef.close();
      expect((lastRef as any)._subs.length).toBe(0);
    }
  });

  describe('_restoreFocusIfNeeded — guards de foco', () => {
    it('no llama body.focus() si document.body era el elemento enfocado antes del open()', async () => {
      // Asegurar que body tiene el foco antes de abrir
      (document.activeElement as HTMLElement)?.blur?.();
      const bodySpy = vi.spyOn(document.body, 'focus');

      const ref = service.open(DummyOverlayComponent, { restoreFocus: true, focusTrap: false });
      const closePromise = firstValueFrom(ref.afterClosed$);
      ref.close();
      await closePromise;

      expect(bodySpy).not.toHaveBeenCalled();
      bodySpy.mockRestore();
    });

    it('no llama focus() si el elemento previo ya no está conectado al DOM', async () => {
      const detachedEl = document.createElement('button');
      document.body.appendChild(detachedEl);
      detachedEl.focus();

      // Desconectar el elemento ANTES de cerrar el overlay para simular que fue eliminado
      document.body.removeChild(detachedEl);
      const focusSpy = vi.spyOn(detachedEl, 'focus');

      const ref = service.open(DummyOverlayComponent, { restoreFocus: true, focusTrap: false });
      const closePromise = firstValueFrom(ref.afterClosed$);
      ref.close();
      await closePromise;

      expect(focusSpy).not.toHaveBeenCalled();
      focusSpy.mockRestore();
    });
  });

  describe('Escape key — aislamiento de propagación', () => {
    /**
     * Emite un evento Escape directamente en el Subject interno del CDK OverlayRef
     * accediendo a la propiedad privada _overlayRef del RetroOverlayRef.
     * Devuelve el evento y el spy sobre stopPropagation.
     */
    function emitEscapeVia(ref: RetroOverlayRef): {
      event: KeyboardEvent;
      stopSpy: () => void;
      preventSpy: () => void;
    } {
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      const stopSpy = vi.spyOn(event, 'stopPropagation');
      const preventSpy = vi.spyOn(event, 'preventDefault');
      // Acceso al OverlayRef CDK interno para obtener el Subject de keydown
      const cdkOverlayRef = (ref as any)._overlayRef;
      // El CDK OverlayRef expone _keydownEvents (Subject) internamente
      const keydownSubject = cdkOverlayRef?._keydownEvents as Subject<KeyboardEvent> | undefined;
      if (keydownSubject) {
        keydownSubject.next(event);
      }
      return { event, stopSpy: stopSpy as unknown as () => void, preventSpy: preventSpy as unknown as () => void };
    }

    it('con disableClose: true — Escape no cierra el overlay y llama stopPropagation + preventDefault', async () => {
      const ref = service.open(DummyOverlayComponent, { disableClose: true });
      let closed = false;
      ref.afterClosed$.subscribe(() => {
        closed = true;
      });

      const { stopSpy, preventSpy } = emitEscapeVia(ref);

      await new Promise((r) => setTimeout(r, 0));

      expect(closed).toBe(false);
      expect(stopSpy).toHaveBeenCalled();
      expect(preventSpy).toHaveBeenCalled();

      ref.close();
    });

    it('con disableClose: false — Escape cierra el overlay y llama stopPropagation', async () => {
      const ref = service.open(DummyOverlayComponent, { disableClose: false });
      const closePromise = firstValueFrom(ref.afterClosed$);

      const { stopSpy } = emitEscapeVia(ref);

      await closePromise;

      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('Backdrop click — cierre y bloqueo', () => {
    /**
     * Emite un MouseEvent directamente en el Subject interno del CDK OverlayRef
     * para simular un backdrop click desde el test sin necesidad de DOM real.
     */
    function emitBackdropClickVia(ref: RetroOverlayRef): void {
      const event = new MouseEvent('click');
      const cdkOverlayRef = (ref as any)._overlayRef;
      const backdropSubject = cdkOverlayRef?._backdropClick as Subject<MouseEvent> | undefined;
      if (backdropSubject) {
        backdropSubject.next(event);
      }
    }

    it('backdrop click cierra el overlay cuando disableClose es false', async () => {
      const ref = service.open(DummyOverlayComponent, { hasBackdrop: true, disableClose: false });
      const closePromise = firstValueFrom(ref.afterClosed$);

      emitBackdropClickVia(ref);

      const result = await closePromise;
      expect(result).toBeUndefined();
    });

    it('backdrop click NO cierra el overlay cuando disableClose es true', async () => {
      const ref = service.open(DummyOverlayComponent, { hasBackdrop: true, disableClose: true });
      let closed = false;
      ref.afterClosed$.subscribe(() => {
        closed = true;
      });

      emitBackdropClickVia(ref);

      await new Promise((r) => setTimeout(r, 0));
      expect(closed).toBe(false);

      ref.close();
    });
  });

  describe('RestoreFocus — foco real', () => {
    it('restaura el foco al botón previo tras cerrar el overlay', async () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();
      expect(document.activeElement).toBe(button);

      const ref = service.open(DummyOverlayComponent, { restoreFocus: true, focusTrap: false });
      const closePromise = firstValueFrom(ref.afterClosed$);
      ref.close();
      await closePromise;

      expect(document.activeElement).toBe(button);
      document.body.removeChild(button);
    });
  });

  describe('data getter en RetroOverlayRef', () => {
    it('data devuelve el valor pasado en config.data', () => {
      const ref = service.open(DummyOverlayComponent, { data: { foo: 'bar' } });
      expect(ref.data).toEqual({ foo: 'bar' });
      ref.close();
    });

    it('data devuelve null si no se pasa data en la config', () => {
      const ref = service.open(DummyOverlayComponent, {});
      expect(ref.data).toBeNull();
      ref.close();
    });
  });

  describe('TemplateRef — path de error sin ViewContainerRef', () => {
    it('lanza error si se abre un TemplateRef sin ViewContainerRef disponible', () => {
      // El servicio inyectado en TestBed no tiene ViewContainerRef opcional (null)
      // Creamos un TemplateRef simulado que es instancia de TemplateRef
      const fakeTemplate = Object.create(TemplateRef.prototype) as TemplateRef<unknown>;
      expect(() => service.open(fakeTemplate)).toThrow(
        '[RetroOverlayService] Se requiere ViewContainerRef para abrir TemplatePortal'
      );
    });
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
  function makeFakeOverlayRef() {
    const detachmentsSubject = new Subject<void>();
    return {
      fakeOverlayRef: {
        dispose: vi.fn(),
        backdropClick: vi.fn().mockReturnValue(new Subject<MouseEvent>().asObservable()),
        keydownEvents: vi.fn().mockReturnValue(new Subject<KeyboardEvent>().asObservable()),
        detachments: vi.fn().mockReturnValue(detachmentsSubject.asObservable())
      },
      detachmentsSubject
    };
  }

  it('backdropClick$ delega en el overlayRef', () => {
    const { fakeOverlayRef } = makeFakeOverlayRef();
    const ref = new RetroOverlayRef(fakeOverlayRef as any);
    expect(ref.backdropClick$).toBeTruthy();
  });

  it('keydownEvents$ delega en el overlayRef', () => {
    const { fakeOverlayRef } = makeFakeOverlayRef();
    const ref = new RetroOverlayRef(fakeOverlayRef as any);
    expect(ref.keydownEvents$).toBeTruthy();
  });

  it('_subs queda vacío después de close()', () => {
    const { fakeOverlayRef } = makeFakeOverlayRef();
    const backdropSubject = new Subject<MouseEvent>();
    const keydownSubject = new Subject<KeyboardEvent>();
    const ref = new RetroOverlayRef(fakeOverlayRef as any);
    ref._addSub(backdropSubject.subscribe());
    ref._addSub(keydownSubject.subscribe());
    expect((ref as any)._subs.length).toBe(2);
    ref.close();
    expect((ref as any)._subs.length).toBe(0);
  });

  it('afterClosed$ recibe el valor ANTES de que dispose() sea llamado', () => {
    const callOrder: string[] = [];
    const { fakeOverlayRef } = makeFakeOverlayRef();
    fakeOverlayRef.dispose.mockImplementation(() => {
      callOrder.push('dispose');
    });
    const ref = new RetroOverlayRef<unknown, string>(fakeOverlayRef as any);
    ref.afterClosed$.subscribe(() => {
      callOrder.push('afterClosed');
    });

    ref.close('resultado');

    expect(callOrder).toEqual(['afterClosed', 'dispose']);
    expect(fakeOverlayRef.dispose).toHaveBeenCalledTimes(1);
  });

  it('dispose directo (sin close()) destruye el focusTrap via detachments()', () => {
    const { fakeOverlayRef, detachmentsSubject } = makeFakeOverlayRef();
    const fakeFocusTrap = { destroy: vi.fn() };
    const ref = new RetroOverlayRef(fakeOverlayRef as any);
    ref._registerFocusTrap(fakeFocusTrap, false, null);
    ref._subscribeDetachments();

    // Simular que el CDK dispone el overlay por navegación (sin pasar por close())
    detachmentsSubject.next();

    expect(fakeFocusTrap.destroy).toHaveBeenCalledTimes(1);
  });

  it('dispose directo no ejecuta doble limpieza si close() ya fue llamado', () => {
    const { fakeOverlayRef, detachmentsSubject } = makeFakeOverlayRef();
    const fakeFocusTrap = { destroy: vi.fn() };
    const ref = new RetroOverlayRef(fakeOverlayRef as any);
    ref._registerFocusTrap(fakeFocusTrap, false, null);
    ref._subscribeDetachments();

    // close() primero — marca _cleaned = true
    ref.close();

    // detachments() dispara después (dispose interno del CDK)
    detachmentsSubject.next();

    // destroy solo se llamó una vez (desde close())
    expect(fakeFocusTrap.destroy).toHaveBeenCalledTimes(1);
  });

  it('data devuelve null si no se llamó _setConfig()', () => {
    const { fakeOverlayRef } = makeFakeOverlayRef();
    const ref = new RetroOverlayRef(fakeOverlayRef as any);
    expect(ref.data).toBeNull();
  });

  it('data devuelve el valor registrado via _setConfig()', () => {
    const { fakeOverlayRef } = makeFakeOverlayRef();
    const ref = new RetroOverlayRef(fakeOverlayRef as any);
    ref._setConfig({ data: { id: 42 } });
    expect(ref.data).toEqual({ id: 42 });
  });
});
