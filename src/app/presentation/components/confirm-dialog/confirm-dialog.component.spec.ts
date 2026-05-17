import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { RETRO_DIALOG_DATA, RetroDialogRef } from '@/services/retro-dialog/retro-dialog.service';
import { TranslocoService } from '@jsverse/transloco';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: RETRO_DIALOG_DATA, useValue: { title: 'Confirmar', message: '¿Estás seguro?' } },
        { provide: RetroDialogRef, useValue: { close: vi.fn(), afterClosed: () => [] } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } }
      ]
    });
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());
  it('expone el título inyectado', () => expect(component.data.title).toBe('Confirmar'));
  it('expone el mensaje inyectado', () => expect(component.data.message).toBe('¿Estás seguro?'));
});
