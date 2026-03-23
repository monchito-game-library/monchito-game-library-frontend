import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { WishlistItemDialogComponent } from './wishlist-item-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { TranslocoService } from '@jsverse/transloco';

const mockCatalogEntry: GameCatalogDto = {
  rawg_id: 1,
  title: 'God of War',
  slug: 'god-of-war',
  image_url: null,
  released_date: null,
  rating: 4.5,
  platforms: [],
  genres: [],
  source: 'rawg',
  esrb_rating: null,
  metacritic_score: null
};

describe('WishlistItemDialogComponent — modo add', () => {
  let component: WishlistItemDialogComponent;
  let fixture: ComponentFixture<WishlistItemDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [WishlistItemDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'add' } },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(WishlistItemDialogComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(WishlistItemDialogComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('showSearch es true en modo add', () => expect(component.showSearch()).toBe(true));
    it('selectedCatalogEntry es null', () => expect(component.selectedCatalogEntry()).toBeNull());
  });

  describe('canConfirm', () => {
    it('es false si el formulario es inválido', () => {
      expect(component.canConfirm()).toBe(false);
    });

    it('es false si el formulario es válido pero no hay selectedCatalogEntry', () => {
      component.form.setValue({ priority: 3, platform: 'PS5', desiredPrice: 50, notes: null });
      expect(component.canConfirm()).toBe(false);
    });

    it('es true si el formulario es válido y hay selectedCatalogEntry', () => {
      component.form.setValue({ priority: 3, platform: 'PS5', desiredPrice: 50, notes: null });
      component.selectedCatalogEntry.set(mockCatalogEntry);
      expect(component.canConfirm()).toBe(true);
    });
  });

  describe('onGameSelected', () => {
    it('establece selectedCatalogEntry', () => {
      component.onGameSelected(mockCatalogEntry);
      expect(component.selectedCatalogEntry()).toEqual(mockCatalogEntry);
    });

    it('oculta la búsqueda', () => {
      component.onGameSelected(mockCatalogEntry);
      expect(component.showSearch()).toBe(false);
    });

    it('limpia el campo platform', () => {
      component.form.controls.platform.setValue('PS5');
      component.onGameSelected(mockCatalogEntry);
      expect(component.form.controls.platform.value).toBeNull();
    });
  });

  describe('onChangGame', () => {
    it('limpia selectedCatalogEntry', () => {
      component.selectedCatalogEntry.set(mockCatalogEntry);
      component.onChangGame();
      expect(component.selectedCatalogEntry()).toBeNull();
    });

    it('muestra de nuevo la búsqueda', () => {
      component.showSearch.set(false);
      component.onChangGame();
      expect(component.showSearch()).toBe(true);
    });
  });

  describe('onCancel', () => {
    it('cierra el dialog con null', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(null);
    });
  });

  describe('onConfirm en modo add', () => {
    it('cierra el dialog con catalogEntry y formValue cuando el formulario es válido', () => {
      component.form.setValue({ priority: 3, platform: 'PS5', desiredPrice: 50, notes: null });
      component.selectedCatalogEntry.set(mockCatalogEntry);
      component.onConfirm();
      const result = mockDialogRef.close.mock.calls[0][0];
      expect(result.catalogEntry).toEqual(mockCatalogEntry);
      expect(result.formValue.platform).toBe('PS5');
    });

    it('no cierra el dialog si canConfirm es false', () => {
      component.onConfirm();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });
});

describe('WishlistItemDialogComponent — modo edit', () => {
  let component: WishlistItemDialogComponent;
  let fixture: ComponentFixture<WishlistItemDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  const existingItem = { priority: 4, platform: 'PS4', desiredPrice: 25, notes: 'Nota' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [WishlistItemDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'edit', item: existingItem } },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(WishlistItemDialogComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(WishlistItemDialogComponent);
    component = fixture.componentInstance;
  });

  it('showSearch es false en modo edit', () => expect(component.showSearch()).toBe(false));

  it('el formulario se pre-rellena con los datos del item', () => {
    expect(component.form.value.priority).toBe(4);
    expect(component.form.value.platform).toBe('PS4');
    expect(component.form.value.desiredPrice).toBe(25);
    expect(component.form.value.notes).toBe('Nota');
  });

  it('canConfirm es true cuando el formulario es válido en modo edit', () => {
    expect(component.canConfirm()).toBe(true);
  });

  it('onConfirm no incluye catalogEntry en modo edit', () => {
    component.onConfirm();
    const result = mockDialogRef.close.mock.calls[0][0];
    expect(result.catalogEntry).toBeUndefined();
    expect(result.formValue.platform).toBe('PS4');
  });
});
