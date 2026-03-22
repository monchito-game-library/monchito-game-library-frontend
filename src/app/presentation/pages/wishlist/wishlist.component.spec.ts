import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { WishlistComponent } from './wishlist.component';
import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { GameCatalogDto } from '@/dtos/supabase/game-catalog.dto';
import { WISHLIST_USE_CASES } from '@/domain/use-cases/wishlist/wishlist.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';
import { TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

function makeItem(overrides: Partial<WishlistItemModel> = {}): WishlistItemModel {
  return {
    id: 'item-1',
    userId: 'user-1',
    gameCatalogId: 'catalog-1',
    desiredPrice: null,
    priority: 3,
    notes: null,
    platform: 'PS5',
    createdAt: '2024-01-01T00:00:00Z',
    title: 'Test Game',
    slug: 'test-game',
    imageUrl: null,
    rawgId: null,
    releasedDate: null,
    rating: 4,
    platforms: [],
    genres: [],
    ...overrides
  };
}

const mockCatalogEntry: GameCatalogDto = {
  rawg_id: 1,
  title: 'Test Game',
  slug: 'test-game',
  image_url: null,
  released_date: null,
  rating: 4,
  platforms: [],
  genres: [],
  source: 'rawg',
  esrb_rating: null,
  metacritic_score: null
};

describe('WishlistComponent', () => {
  let component: WishlistComponent;
  let fixture: ComponentFixture<WishlistComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [WishlistComponent, ReactiveFormsModule],
      providers: [
        {
          provide: WISHLIST_USE_CASES,
          useValue: {
            getAllForUser: vi.fn().mockResolvedValue([]),
            addItem: vi.fn(),
            updateItem: vi.fn(),
            deleteItem: vi.fn()
          }
        },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(WishlistComponent);
    component = fixture.componentInstance;
    // No detectChanges() — evitamos ngOnInit para no disparar llamadas async
  });

  describe('valores iniciales', () => {
    it('loading es true', () => expect(component.loading()).toBe(true));
    it('items es []', () => expect(component.items()).toEqual([]));
    it('viewMode es "list"', () => expect(component.viewMode()).toBe('list'));
    it('pendingCatalogEntry es null', () => expect(component.pendingCatalogEntry()).toBeNull());
    it('totalEstimatedSpend es 0', () => expect(component.totalEstimatedSpend()).toBe(0));
    it('itemsWithPrice es 0', () => expect(component.itemsWithPrice()).toBe(0));
  });

  describe('totalEstimatedSpend', () => {
    it('suma los desiredPrice no nulos', () => {
      component.items.set([
        makeItem({ desiredPrice: 30 }),
        makeItem({ desiredPrice: 20 }),
        makeItem({ desiredPrice: null })
      ]);
      expect(component.totalEstimatedSpend()).toBe(50);
    });

    it('trata null como 0', () => {
      component.items.set([makeItem({ desiredPrice: null }), makeItem({ desiredPrice: null })]);
      expect(component.totalEstimatedSpend()).toBe(0);
    });
  });

  describe('itemsWithPrice', () => {
    it('cuenta solo los items con desiredPrice no nulo', () => {
      component.items.set([
        makeItem({ desiredPrice: 30 }),
        makeItem({ desiredPrice: null }),
        makeItem({ desiredPrice: 15 })
      ]);
      expect(component.itemsWithPrice()).toBe(2);
    });
  });

  describe('mobileCanConfirm', () => {
    it('es false cuando el formulario no es válido', () => {
      component.mobileForm.controls.platform.setValue(null);
      component.mobileForm.controls.desiredPrice.setValue(null);
      expect(component.mobileCanConfirm()).toBe(false);
    });

    it('es false cuando el formulario es válido pero no hay pendingCatalogEntry ni editingItem', () => {
      component.mobileForm.setValue({ priority: 3, platform: 'PS5', desiredPrice: 50, notes: null });
      expect(component.mobileCanConfirm()).toBe(false);
    });

    it('es true cuando el formulario es válido y hay pendingCatalogEntry', () => {
      component.mobileForm.setValue({ priority: 3, platform: 'PS5', desiredPrice: 50, notes: null });
      component.pendingCatalogEntry.set(mockCatalogEntry);
      expect(component.mobileCanConfirm()).toBe(true);
    });
  });

  describe('onAddItem', () => {
    it('cambia viewMode a "search"', () => {
      component.onAddItem();
      expect(component.viewMode()).toBe('search');
    });

    it('limpia pendingCatalogEntry', () => {
      component.pendingCatalogEntry.set(mockCatalogEntry);
      component.onAddItem();
      expect(component.pendingCatalogEntry()).toBeNull();
    });
  });

  describe('onEditItem', () => {
    it('cambia viewMode a "form"', () => {
      component.onEditItem(makeItem({ priority: 4, platform: 'PS4', desiredPrice: 25, notes: 'Nota' }));
      expect(component.viewMode()).toBe('form');
    });

    it('pre-rellena el formulario con los valores del item', () => {
      component.onEditItem(makeItem({ priority: 4, platform: 'PS4', desiredPrice: 25, notes: 'Nota' }));
      expect(component.mobileForm.value.priority).toBe(4);
      expect(component.mobileForm.value.platform).toBe('PS4');
      expect(component.mobileForm.value.desiredPrice).toBe(25);
      expect(component.mobileForm.value.notes).toBe('Nota');
    });
  });

  describe('onMobileGameSelected', () => {
    it('establece pendingCatalogEntry con el juego seleccionado', () => {
      component.onMobileGameSelected(mockCatalogEntry);
      expect(component.pendingCatalogEntry()).toEqual(mockCatalogEntry);
    });

    it('cambia viewMode a "form"', () => {
      component.onMobileGameSelected(mockCatalogEntry);
      expect(component.viewMode()).toBe('form');
    });
  });

  describe('onMobileBackToSearch', () => {
    it('limpia pendingCatalogEntry', () => {
      component.pendingCatalogEntry.set(mockCatalogEntry);
      component.onMobileBackToSearch();
      expect(component.pendingCatalogEntry()).toBeNull();
    });

    it('cambia viewMode a "search"', () => {
      component.onMobileBackToSearch();
      expect(component.viewMode()).toBe('search');
    });
  });

  describe('onMobileCancel', () => {
    it('cambia viewMode a "list"', () => {
      component.viewMode.set('form');
      component.onMobileCancel();
      expect(component.viewMode()).toBe('list');
    });

    it('limpia pendingCatalogEntry', () => {
      component.pendingCatalogEntry.set(mockCatalogEntry);
      component.onMobileCancel();
      expect(component.pendingCatalogEntry()).toBeNull();
    });
  });
});
