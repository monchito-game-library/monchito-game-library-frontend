import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { DeleteUserDialogComponent } from './delete-user-dialog.component';

describe('DeleteUserDialogComponent', () => {
  let component: DeleteUserDialogComponent;
  let fixture: ComponentFixture<DeleteUserDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockDialogRef = { close: vi.fn() };
    TestBed.configureTestingModule({
      imports: [DeleteUserDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { email: 'target@test.com' } },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(DeleteUserDialogComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(DeleteUserDialogComponent);
    component = fixture.componentInstance;
  });

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('expone el email inyectado vía data', () => {
    expect(component.data.email).toBe('target@test.com');
  });

  it('canConfirm es false cuando el input está vacío', () => {
    expect(component.canConfirm()).toBe(false);
  });

  it('canConfirm es false cuando el input no coincide con el email', () => {
    component.form.controls.emailConfirmation.setValue('otro@test.com');
    expect(component.canConfirm()).toBe(false);
  });

  it('canConfirm es true cuando el input coincide exactamente con el email', () => {
    component.form.controls.emailConfirmation.setValue('target@test.com');
    expect(component.canConfirm()).toBe(true);
  });

  it('canConfirm ignora espacios al principio y final', () => {
    component.form.controls.emailConfirmation.setValue('  target@test.com  ');
    expect(component.canConfirm()).toBe(true);
  });

  it('onConfirm cierra el dialog con true cuando el email coincide', () => {
    component.form.controls.emailConfirmation.setValue('target@test.com');
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('onConfirm no cierra el dialog cuando el email no coincide', () => {
    component.form.controls.emailConfirmation.setValue('otro@test.com');
    component.onConfirm();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
