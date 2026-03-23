import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { GameCoverPositionDialogComponent } from './game-cover-position-dialog.component';
import { TranslocoService } from '@jsverse/transloco';

describe('GameCoverPositionDialogComponent', () => {
  let component: GameCoverPositionDialogComponent;
  let fixture: ComponentFixture<GameCoverPositionDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  function setup(initialPosition: string | null): void {
    vi.clearAllMocks();
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [GameCoverPositionDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { imageUrl: 'https://cdn.example.com/cover.jpg', initialPosition } },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } }
      ]
    });
    TestBed.overrideComponent(GameCoverPositionDialogComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(GameCoverPositionDialogComponent);
    component = fixture.componentInstance;
  }

  describe('sin initialPosition', () => {
    beforeEach(() => setup(null));

    it('se crea correctamente', () => expect(component).toBeTruthy());
    it('posX por defecto es 50', () => expect(component.posX()).toBe(50));
    it('posY por defecto es 50', () => expect(component.posY()).toBe(50));
    it('scale por defecto es 1', () => expect(component.scale()).toBe(1));

    it('onCancel cierra el dialog con null', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(null);
    });
  });

  describe('con initialPosition "40 60 2.00"', () => {
    beforeEach(() => setup('40 60 2.00'));

    it('parsea posX', () => expect(component.posX()).toBe(40));
    it('parsea posY', () => expect(component.posY()).toBe(60));
    it('parsea scale', () => expect(component.scale()).toBe(2));

    it('onConfirm cierra el dialog con la posición formateada', () => {
      component.onConfirm();
      expect(mockDialogRef.close).toHaveBeenCalledWith('40% 60% 2.00');
    });
  });

  describe('con initialPosition de solo 2 partes "30 70"', () => {
    beforeEach(() => setup('30 70'));

    it('parsea posX', () => expect(component.posX()).toBe(30));
    it('parsea posY', () => expect(component.posY()).toBe(70));
    it('mantiene scale por defecto (1) al no haber tercera parte', () => expect(component.scale()).toBe(1));
  });

  describe('con initialPosition de solo 1 parte "50"', () => {
    beforeEach(() => setup('50'));

    it('mantiene posX por defecto (50)', () => expect(component.posX()).toBe(50));
    it('mantiene posY por defecto (50)', () => expect(component.posY()).toBe(50));
    it('mantiene scale por defecto (1)', () => expect(component.scale()).toBe(1));
  });
});
