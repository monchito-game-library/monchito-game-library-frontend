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

  describe('ngOnDestroy', () => {
    it('revoca la URL del objeto al destruir el componente', () => {
      component.ngOnDestroy();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('onConfirm', () => {
    it('recorta la imagen y cierra el dialog con un Blob', async () => {
      const mockBlob = new Blob(['fake-image'], { type: 'image/jpeg' });
      const mockCtx = { drawImage: vi.fn() };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue(mockCtx),
        toBlob: vi.fn().mockImplementation((cb: (b: Blob) => void) => cb(mockBlob))
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLElement);

      // Simulate loaded image with real dimensions
      (component as any)._imgEl = { naturalWidth: 560, naturalHeight: 560 } as HTMLImageElement;
      (component as any)._overflowX = 0;
      (component as any)._overflowY = 0;

      await component.onConfirm();

      expect(mockCtx.drawImage).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(mockBlob);
    });
  });
});
