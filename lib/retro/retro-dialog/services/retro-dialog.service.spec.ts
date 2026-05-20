import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import {
  RetroDialogService,
  RetroDialogRef,
  RetroDialogTitleDirective,
  RetroDialogContentDirective,
  RetroDialogActionsDirective,
  RetroDialogCloseDirective,
  RETRO_DIALOG_DATA
} from './retro-dialog.service';
import { RetroOverlayService, RetroOverlayRef } from '../../retro-overlay/services/retro-overlay.service';

@Component({ selector: 'app-test-dialog', template: '', standalone: true })
class TestDialogComponent {}

describe('RetroDialogService', () => {
  let service: RetroDialogService;
  let mockOverlayRef: Partial<RetroOverlayRef<TestDialogComponent, unknown>>;
  let mockOverlayService: Partial<RetroOverlayService>;

  beforeEach(() => {
    vi.clearAllMocks();

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

  it('open() añade panelClass extra cuando se pasa como string', () => {
    service.open(TestDialogComponent, { panelClass: 'mi-clase-extra' });
    const callArgs = (mockOverlayService.open as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(callArgs.panelClass).toContain('mi-clase-extra');
  });

  it('open() añade panelClass extra cuando se pasa como array', () => {
    service.open(TestDialogComponent, { panelClass: ['clase-a', 'clase-b'] });
    const callArgs = (mockOverlayService.open as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(callArgs.panelClass).toContain('clase-a');
    expect(callArgs.panelClass).toContain('clase-b');
  });

  it('open() con disableClose pone autoFocus en false', () => {
    service.open(TestDialogComponent, { disableClose: true });
    const callArgs = (mockOverlayService.open as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(callArgs.autoFocus).toBe(false);
  });

  it('open() llama extraProviders y crea el RetroDialogRef', () => {
    // El mock de overlayService.open llama a extraProviders si se lo pasamos
    // Necesitamos que el overlay mock simule llamar a extraProviders
    const realOpen = mockOverlayService.open as ReturnType<typeof vi.fn>;
    realOpen.mockImplementationOnce((_component: unknown, cfg: { extraProviders?: (r: unknown) => unknown[] }) => {
      // Llamar a extraProviders para crear el dialogRef interno
      if (cfg.extraProviders) cfg.extraProviders(mockOverlayRef);
      return mockOverlayRef;
    });
    const ref = service.open(TestDialogComponent);
    expect(ref).toBeInstanceOf(RetroDialogRef);
  });
});

describe('RetroDialogRef', () => {
  let overlayRef: RetroOverlayRef<TestDialogComponent, boolean>;
  let dialogRef: RetroDialogRef<TestDialogComponent, boolean>;

  beforeEach(() => {
    vi.clearAllMocks();

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

  it('componentInstance delega en el overlayRef', () => {
    (overlayRef as any).componentInstance = { foo: 'bar' };
    expect(dialogRef.componentInstance).toEqual({ foo: 'bar' });
  });

  it('backdropClick$ delega en el overlayRef', () => {
    expect(dialogRef.backdropClick$).toBeTruthy();
  });

  it('keydownEvents$ delega en el overlayRef', () => {
    expect(dialogRef.keydownEvents$).toBeTruthy();
  });
});

describe('RetroDialogActionsDirective', () => {
  it('align inicia en "end"', () => {
    TestBed.configureTestingModule({
      imports: [RetroDialogActionsDirective],
      schemas: [NO_ERRORS_SCHEMA]
    });
    // La directiva se puede instanciar directamente para verificar el default
    const directive = new RetroDialogActionsDirective();
    expect(directive.align).toBe('end');
  });
});

describe('RETRO_DIALOG_DATA', () => {
  it('es el mismo token que RETRO_OVERLAY_DATA', () => {
    const { RETRO_OVERLAY_DATA } = require('../../retro-overlay/services/retro-overlay.service');
    expect(RETRO_DIALOG_DATA).toBe(RETRO_OVERLAY_DATA);
  });
});

@Component({
  standalone: true,
  imports: [RetroDialogActionsDirective],
  template: `<div retroDialogActions [align]="align">acciones</div>`
})
class ActionsHostComponent {
  align: 'start' | 'center' | 'end' = 'end';
}

describe('RetroDialogActionsDirective — host bindings', () => {
  let fixture: ComponentFixture<ActionsHostComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ActionsHostComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(ActionsHostComponent);
    fixture.detectChanges();
  });

  it('aplica --end class cuando align es "end"', () => {
    fixture.componentInstance.align = 'end';
    fixture.changeDetectorRef.detectChanges();
    fixture.changeDetectorRef.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(el.classList.contains('retro-dialog__actions--end')).toBe(true);
  });

  it('aplica --center class cuando align es "center"', () => {
    fixture.componentInstance.align = 'center';
    fixture.changeDetectorRef.detectChanges();
    fixture.changeDetectorRef.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(el.classList.contains('retro-dialog__actions--center')).toBe(true);
    expect(el.classList.contains('retro-dialog__actions--end')).toBe(false);
  });

  it('aplica --start class cuando align es "start"', () => {
    fixture.componentInstance.align = 'start';
    fixture.changeDetectorRef.detectChanges();
    fixture.changeDetectorRef.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(el.classList.contains('retro-dialog__actions--start')).toBe(true);
    expect(el.classList.contains('retro-dialog__actions--end')).toBe(false);
  });
});

describe('RetroDialogCloseDirective', () => {
  it('_onClick() llama a dialogRef.close con el resultado configurado', () => {
    const mockDialogRef = { close: vi.fn() } as unknown as RetroDialogRef<unknown>;

    @Component({
      standalone: true,
      imports: [RetroDialogCloseDirective],
      template: `<button [retroDialogClose]="'ok'">Cerrar</button>`
    })
    class CloseHostComponent {}

    TestBed.configureTestingModule({
      imports: [CloseHostComponent],
      providers: [{ provide: RetroDialogRef, useValue: mockDialogRef }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const f = TestBed.createComponent(CloseHostComponent);
    f.detectChanges();
    f.nativeElement.querySelector('button').click();
    expect(mockDialogRef.close).toHaveBeenCalledWith('ok');
  });
});
