import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import { TranslocoService } from '@jsverse/transloco';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Confirmar', message: '¿Estás seguro?' } },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
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
