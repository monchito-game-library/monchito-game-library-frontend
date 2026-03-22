import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { AvatarCropDialogComponent } from './avatar-crop-dialog.component';
import { TranslocoService } from '@jsverse/transloco';

describe('AvatarCropDialogComponent', () => {
  let component: AvatarCropDialogComponent;
  let fixture: ComponentFixture<AvatarCropDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [AvatarCropDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { file: new Blob([''], { type: 'image/jpeg' }), aspectRatio: 1, resizeToWidth: 280 }
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } }
      ]
    });
    TestBed.overrideComponent(AvatarCropDialogComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(AvatarCropDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => vi.restoreAllMocks());

  it('se crea correctamente', () => expect(component).toBeTruthy());

  it('cropW es 280', () => expect(component.cropW).toBe(280));

  it('cropH se calcula como Math.round(280 / aspectRatio)', () => {
    // aspectRatio = 1 → cropH = 280
    expect(component.cropH).toBe(280);
  });

  it('imageUrl es la URL generada por createObjectURL', () => {
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(component.imageUrl).toBe('blob:mock-url');
  });

  describe('onCancel', () => {
    it('cierra el dialog con null', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(null);
    });
  });
});
