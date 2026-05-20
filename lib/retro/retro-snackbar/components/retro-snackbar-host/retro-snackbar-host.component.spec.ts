import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  it('inyecta el servicio de snackbar', () => {
    expect(component.service).toBeTruthy();
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
});
