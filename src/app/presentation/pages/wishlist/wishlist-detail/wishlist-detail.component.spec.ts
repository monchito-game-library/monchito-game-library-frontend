import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { WishlistDetailComponent } from './wishlist-detail.component';
import { WishlistItemModel } from '@/models/wishlist/wishlist-item.model';
import { WISHLIST_USE_CASES } from '@/domain/use-cases/wishlist/wishlist.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';

function makeItem(overrides: Partial<WishlistItemModel> = {}): WishlistItemModel {
  return {
    id: 'item-1',
    userId: 'user-1',
    gameCatalogId: 'catalog-1',
    desiredPrice: 39.99,
    priority: 4,
    notes: null,
    platform: 'PS5',
    createdAt: '2024-01-01T00:00:00Z',
    title: 'God of War',
    slug: 'god-of-war',
    imageUrl: null,
    rawgId: 58175,
    releasedDate: '2018-04-20',
    rating: 4.42,
    platforms: ['PS4', 'PS5'],
    genres: ['Action'],
    ...overrides
  };
}

describe('WishlistDetailComponent', () => {
  let component: WishlistDetailComponent;
  let fixture: ComponentFixture<WishlistDetailComponent>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure no item in history state by default
    window.history.pushState(null, '');

    TestBed.configureTestingModule({
      imports: [WishlistDetailComponent],
      providers: [
        {
          provide: WISHLIST_USE_CASES,
          useValue: {
            getAllForUser: vi.fn().mockResolvedValue([]),
            deleteItem: vi.fn().mockResolvedValue(undefined)
          }
        },
        { provide: UserContextService, useValue: { userId: signal<string | null>('user-1') } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: TranslocoService, useValue: { translate: vi.fn((k: string) => k) } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: Location, useValue: { back: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: vi.fn().mockReturnValue('item-1') } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(WishlistDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    window.history.pushState(null, '');
  });

  describe('storeLinks (computed)', () => {
    beforeEach(() => {
      component.item.set(makeItem());
    });

    it('genera 4 enlaces de tienda', () => {
      expect(component.storeLinks()).toHaveLength(4);
    });

    it('incluye la plataforma en el término de búsqueda cuando está definida', () => {
      const ceX = component.storeLinks().find((l) => l.label === 'CEX')!;
      expect(ceX.url).toContain('God+of+War+PS5');
    });

    it('usa solo el título cuando no hay plataforma', () => {
      component.item.set(makeItem({ platform: '' }));
      const ceX = component.storeLinks().find((l) => l.label === 'CEX')!;
      expect(ceX.url).toContain('God+of+War');
      expect(ceX.url).not.toContain('PS5');
    });

    it('genera URL de Amazon correctamente', () => {
      const amazon = component.storeLinks().find((l) => l.label === 'Amazon')!;
      expect(amazon.url).toContain('amazon.es');
      expect(amazon.url).toContain('God+of+War+PS5');
    });

    it('devuelve array vacío cuando item es null', () => {
      component.item.set(null);
      expect(component.storeLinks()).toEqual([]);
    });
  });

  describe('ngOnInit', () => {
    it('usa el item del history state si está disponible', async () => {
      const stateItem = makeItem({ title: 'From State' });
      window.history.pushState({ item: stateItem }, '');

      await component.ngOnInit();

      expect(component.item()?.title).toBe('From State');
    });

    it('llama a getAllForUser como fallback cuando no hay state', async () => {
      const wishlistUseCases = TestBed.inject(WISHLIST_USE_CASES as any) as any;
      wishlistUseCases.getAllForUser.mockResolvedValue([makeItem()]);

      await component.ngOnInit();

      expect(wishlistUseCases.getAllForUser).toHaveBeenCalledWith('user-1');
      expect(component.item()?.id).toBe('item-1');
    });

    it('navega hacia atrás si el item no se encuentra en la carga', async () => {
      const wishlistUseCases = TestBed.inject(WISHLIST_USE_CASES as any) as any;
      wishlistUseCases.getAllForUser.mockResolvedValue([]);
      const location = TestBed.inject(Location as any) as any;

      await component.ngOnInit();

      expect(location.back).toHaveBeenCalled();
    });

    it('muestra snackbar de error y navega atrás si la carga falla', async () => {
      const wishlistUseCases = TestBed.inject(WISHLIST_USE_CASES as any) as any;
      wishlistUseCases.getAllForUser.mockRejectedValue(new Error('fail'));
      const snackBar = TestBed.inject(MatSnackBar as any) as any;
      const location = TestBed.inject(Location as any) as any;

      await component.ngOnInit();

      expect(snackBar.open).toHaveBeenCalled();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('onBack', () => {
    it('navega a /wishlist', () => {
      const router = TestBed.inject(Router as any) as any;

      component.onBack();

      expect(router.navigate).toHaveBeenCalledWith(['/wishlist']);
    });
  });

  describe('onEdit', () => {
    it('navega a /wishlist con el editItemId en el state', () => {
      component.item.set(makeItem());
      const router = TestBed.inject(Router as any) as any;

      component.onEdit();

      expect(router.navigate).toHaveBeenCalledWith(
        ['/wishlist'],
        expect.objectContaining({ state: { editItemId: 'item-1' } })
      );
    });

    it('no navega si item es null', () => {
      component.item.set(null);
      const router = TestBed.inject(Router as any) as any;

      component.onEdit();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    it('no elimina si el dialog se cancela', async () => {
      component.item.set(makeItem());
      const wishlistUseCases = TestBed.inject(WISHLIST_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      await component.onDelete();

      expect(wishlistUseCases.deleteItem).not.toHaveBeenCalled();
    });

    it('elimina el item y navega atrás si el dialog se confirma', async () => {
      component.item.set(makeItem());
      const wishlistUseCases = TestBed.inject(WISHLIST_USE_CASES as any) as any;
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const location = TestBed.inject(Location as any) as any;

      await component.onDelete();

      expect(wishlistUseCases.deleteItem).toHaveBeenCalledWith('user-1', 'item-1');
      expect(location.back).toHaveBeenCalled();
    });

    it('muestra snackbar de éxito al eliminar', async () => {
      component.item.set(makeItem());
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onDelete();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('muestra snackbar de error si deleteItem lanza', async () => {
      component.item.set(makeItem());
      const wishlistUseCases = TestBed.inject(WISHLIST_USE_CASES as any) as any;
      wishlistUseCases.deleteItem.mockRejectedValue(new Error('delete error'));
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const snackBar = TestBed.inject(MatSnackBar as any) as any;

      await component.onDelete();

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('no hace nada si item es null', async () => {
      component.item.set(null);
      const wishlistUseCases = TestBed.inject(WISHLIST_USE_CASES as any) as any;

      await component.onDelete();

      expect(wishlistUseCases.deleteItem).not.toHaveBeenCalled();
    });
  });

  describe('onOwn', () => {
    it('no navega si el dialog se cancela', async () => {
      component.item.set(makeItem());
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });
      const router = TestBed.inject(Router as any) as any;

      await component.onOwn();

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('navega a /add con catalogEntry y wishlistItemId si el dialog se confirma', async () => {
      component.item.set(makeItem());
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const router = TestBed.inject(Router as any) as any;

      await component.onOwn();

      expect(router.navigate).toHaveBeenCalledWith(
        ['/add'],
        expect.objectContaining({ state: expect.objectContaining({ wishlistItemId: 'item-1' }) })
      );
    });

    it('establece source como "rawg" cuando rawgId es truthy', async () => {
      component.item.set(makeItem({ rawgId: 58175 }));
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const router = TestBed.inject(Router as any) as any;

      await component.onOwn();

      const state = router.navigate.mock.calls[0][1].state;
      expect(state.catalogEntry.source).toBe('rawg');
    });

    it('establece source como "manual" cuando rawgId es null', async () => {
      component.item.set(makeItem({ rawgId: null }));
      const dialog = TestBed.inject(MatDialog as any) as any;
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      const router = TestBed.inject(Router as any) as any;

      await component.onOwn();

      const state = router.navigate.mock.calls[0][1].state;
      expect(state.catalogEntry.source).toBe('manual');
    });

    it('no hace nada si item es null', async () => {
      component.item.set(null);
      const wishlistUseCases = TestBed.inject(WISHLIST_USE_CASES as any) as any;

      await component.onOwn();

      expect(wishlistUseCases.deleteItem).not.toHaveBeenCalled();
    });
  });

  describe('_userId getter', () => {
    it('lanza Error cuando userId es null', () => {
      const userContext = TestBed.inject(UserContextService as any) as any;
      userContext.userId.set(null);
      expect(() => (component as any)._userId).toThrow('No user selected');
    });
  });
});
