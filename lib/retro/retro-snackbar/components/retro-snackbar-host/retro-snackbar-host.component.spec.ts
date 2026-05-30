import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { RetroSnackbarHostComponent } from './retro-snackbar-host.component';
import { RetroSnackbarService, RetroSnackbarMessage } from '../../services/retro-snackbar.service';
import { mockRetroSnackbar } from '@retro/testing/retro-snackbar.mock';

describe('RetroSnackbarHostComponent', () => {
  let fixture: ComponentFixture<RetroSnackbarHostComponent>;
  let component: RetroSnackbarHostComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [
        RetroSnackbarHostComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { 'common.notifications': 'Notifications', 'common.close': 'Close' } },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [{ provide: RetroSnackbarService, useValue: mockRetroSnackbar }]
    }).compileComponents();

    fixture = TestBed.createComponent(RetroSnackbarHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('expone messages como signal derivado del servicio', () => {
    expect(component.messages).toBeTruthy();
    expect(typeof component.messages).toBe('function');
  });

  it('dismiss delega en el servicio con el id dado', () => {
    component.dismiss(42);
    expect(mockRetroSnackbar.dismiss).toHaveBeenCalledWith(42);
  });

  it('onAction ejecuta el handler del mensaje y lo descarta', () => {
    const handler = vi.fn();
    const msg: RetroSnackbarMessage = {
      id: 1,
      text: 'Mensaje de prueba',
      variant: 'success',
      duration: 4000,
      action: { label: 'Acción', handler }
    };
    component.onAction(msg);
    expect(handler).toHaveBeenCalled();
    expect(mockRetroSnackbar.dismiss).toHaveBeenCalledWith(1);
  });

  it('onAction descarta el mensaje aunque no haya handler de acción', () => {
    const msg: RetroSnackbarMessage = {
      id: 2,
      text: 'Sin acción',
      variant: 'error',
      duration: 4000
    };
    expect(() => component.onAction(msg)).not.toThrow();
    expect(mockRetroSnackbar.dismiss).toHaveBeenCalledWith(2);
  });

  describe('aria-live dinámico por variante', () => {
    let messagesSignal: ReturnType<typeof signal<readonly RetroSnackbarMessage[]>>;

    beforeEach(async () => {
      messagesSignal = signal<readonly RetroSnackbarMessage[]>([]);
      const serviceWithSignal = { ...mockRetroSnackbar, messages: messagesSignal };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [
          RetroSnackbarHostComponent,
          TranslocoTestingModule.forRoot({
            langs: { en: { 'common.notifications': 'Notifications', 'common.close': 'Close' } },
            translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
          })
        ],
        providers: [{ provide: RetroSnackbarService, useValue: serviceWithSignal }]
      }).compileComponents();

      fixture = TestBed.createComponent(RetroSnackbarHostComponent);
      fixture.detectChanges();
    });

    it('snackbar de variante error tiene aria-live="assertive" y role="alert"', () => {
      const errorMsg: RetroSnackbarMessage = { id: 10, text: 'Error grave', variant: 'error', duration: 4000 };
      messagesSignal.set([errorMsg]);
      fixture.detectChanges();

      const item: HTMLElement = fixture.nativeElement.querySelector('.retro-snackbar');
      expect(item.getAttribute('aria-live')).toBe('assertive');
      expect(item.getAttribute('role')).toBe('alert');
    });

    it('snackbar de variante success tiene aria-live="polite" y role="status"', () => {
      const successMsg: RetroSnackbarMessage = { id: 11, text: 'Éxito', variant: 'success', duration: 4000 };
      messagesSignal.set([successMsg]);
      fixture.detectChanges();

      const item: HTMLElement = fixture.nativeElement.querySelector('.retro-snackbar');
      expect(item.getAttribute('aria-live')).toBe('polite');
      expect(item.getAttribute('role')).toBe('status');
    });

    it('snackbar de variante warning tiene aria-live="polite" y role="status"', () => {
      const warningMsg: RetroSnackbarMessage = { id: 12, text: 'Aviso', variant: 'warning', duration: 4000 };
      messagesSignal.set([warningMsg]);
      fixture.detectChanges();

      const item: HTMLElement = fixture.nativeElement.querySelector('.retro-snackbar');
      expect(item.getAttribute('aria-live')).toBe('polite');
      expect(item.getAttribute('role')).toBe('status');
    });

    it('el contenedor aside no tiene aria-live fijo', () => {
      const aside: HTMLElement = fixture.nativeElement.querySelector('.retro-snackbar-host');
      expect(aside.getAttribute('aria-live')).toBeNull();
    });
  });
});
