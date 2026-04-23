import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { OrderDetailComponent } from './order-detail.component';
import { ORDERS_USE_CASES } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { OrderModel } from '@/models/order/order.model';
import { mockRouter } from '@/testing/router.mock';
import { mockSnackBar } from '@/testing/snack-bar.mock';
import { mockTransloco } from '@/testing/transloco.mock';
import { mockDialog } from '@/testing/dialog.mock';

function makeOrder(overrides: Partial<OrderModel> = {}): OrderModel {
  return {
    id: 'order-1',
    ownerId: 'user-1',
    title: 'Test Order',
    status: 'draft',
    orderDate: null,
    receivedDate: null,
    shippingCost: null,
    paypalFee: null,
    discountAmount: null,
    discountType: 'amount',
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    members: [],
    lines: [],
    ...overrides
  };
}

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;

  const mockOrdersUseCases = {
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addLine: vi.fn(),
    updateLine: vi.fn(),
    deleteLine: vi.fn(),
    getProducts: vi.fn(),
    createInvitation: vi.fn(),
    setMemberReady: vi.fn(),
    subscribeToOrderMembers: vi.fn().mockReturnValue(() => {}),
    subscribeToOrderLines: vi.fn().mockReturnValue(() => {})
  };

  const mockUserContext = {
    userId: vi.fn().mockReturnValue('user-1')
  };

  const mockRoute = {
    snapshot: { paramMap: { get: vi.fn().mockReturnValue('order-1') } }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserContext.userId.mockReturnValue('user-1');
    mockOrdersUseCases.subscribeToOrderMembers.mockReturnValue(() => {});
    mockOrdersUseCases.subscribeToOrderLines.mockReturnValue(() => {});
    mockOrdersUseCases.getById.mockResolvedValue(makeOrder());

    TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        { provide: ORDERS_USE_CASES, useValue: mockOrdersUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: TranslocoService, useValue: mockTransloco }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(OrderDetailComponent, { set: { imports: [], template: '' } });

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    (component as any)._orderId = 'order-1';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial signals ──────────────────────────────────────────────────────────

  describe('initial signals', () => {
    it('order is null', () => {
      expect(component.order()).toBeNull();
    });

    it('loading is false', () => {
      expect(component.loading()).toBe(false);
    });

    it('saving is false', () => {
      expect(component.saving()).toBe(false);
    });

    it('editingHeader is false', () => {
      expect(component.editingHeader()).toBe(false);
    });

    it('editingLayout is false', () => {
      expect(component.editingLayout()).toBe(false);
    });

    it('products is []', () => {
      expect(component.products()).toEqual([]);
    });

    it('packSteps is []', () => {
      expect(component.packSteps()).toEqual([]);
    });

    it('allPacksSelected is false', () => {
      expect(component.allPacksSelected()).toBe(false);
    });
  });

  // ── selectingPacks / placingOrder ────────────────────────────────────────────

  describe('selectingPacks()', () => {
    it('returns false when order is null', () => {
      expect(component.selectingPacks()).toBe(false);
    });

    it('returns true when order status is selecting_packs', () => {
      component.order.set(makeOrder({ status: 'selecting_packs' }));
      expect(component.selectingPacks()).toBe(true);
    });

    it('returns false when order status is draft', () => {
      component.order.set(makeOrder({ status: 'draft' }));
      expect(component.selectingPacks()).toBe(false);
    });
  });

  describe('placingOrder()', () => {
    it('returns false when order is null', () => {
      expect(component.placingOrder()).toBe(false);
    });

    it('returns true when order status is ordering', () => {
      component.order.set(makeOrder({ status: 'ordering' }));
      expect(component.placingOrder()).toBe(true);
    });

    it('returns false when order status is draft', () => {
      component.order.set(makeOrder({ status: 'draft' }));
      expect(component.placingOrder()).toBe(false);
    });
  });

  // ── isOwner ──────────────────────────────────────────────────────────────────

  describe('isOwner()', () => {
    it('returns false when order is null', () => {
      expect(component.isOwner()).toBe(false);
    });

    it('returns true when ownerId matches userId', () => {
      component.order.set(makeOrder({ ownerId: 'user-1' }));
      expect(component.isOwner()).toBe(true);
    });

    it('returns false when ownerId does not match userId', () => {
      component.order.set(makeOrder({ ownerId: 'other-user' }));
      expect(component.isOwner()).toBe(false);
    });
  });

  // ── nextStatus / prevStatus ──────────────────────────────────────────────────

  describe('nextStatus()', () => {
    it('returns null when order is null', () => {
      expect(component.nextStatus()).toBeNull();
    });

    it('returns selecting_packs when status is draft', () => {
      component.order.set(makeOrder({ status: 'draft' }));
      expect(component.nextStatus()).toBe('selecting_packs');
    });

    it('returns null when status is received (final)', () => {
      component.order.set(makeOrder({ status: 'received' }));
      expect(component.nextStatus()).toBeNull();
    });

    it('returns ordered when status is ordering', () => {
      component.order.set(makeOrder({ status: 'ordering' }));
      expect(component.nextStatus()).toBe('ordered');
    });
  });

  describe('prevStatus()', () => {
    it('returns null when order is null', () => {
      expect(component.prevStatus()).toBeNull();
    });

    it('returns null when status is draft (first)', () => {
      component.order.set(makeOrder({ status: 'draft' }));
      expect(component.prevStatus()).toBeNull();
    });

    it('returns draft when status is selecting_packs', () => {
      component.order.set(makeOrder({ status: 'selecting_packs' }));
      expect(component.prevStatus()).toBe('draft');
    });

    it('returns ordering when status is ordered', () => {
      component.order.set(makeOrder({ status: 'ordered' }));
      expect(component.prevStatus()).toBe('ordering');
    });
  });

  // ── ngOnInit ─────────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('reads orderId from route params', () => {
      component.ngOnInit();
      expect(mockRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    });

    it('calls getById to load the order', async () => {
      component.ngOnInit();
      await Promise.resolve();
      expect(mockOrdersUseCases.getById).toHaveBeenCalledWith('order-1');
    });

    it('updates order signal after loading', async () => {
      const ord = makeOrder();
      mockOrdersUseCases.getById.mockResolvedValue(ord);
      component.ngOnInit();
      await Promise.resolve();
      expect(component.order()).toEqual(ord);
    });

    it('subscribes to order members and lines', () => {
      component.ngOnInit();
      expect(mockOrdersUseCases.subscribeToOrderMembers).toHaveBeenCalledWith('order-1', expect.any(Function));
      expect(mockOrdersUseCases.subscribeToOrderLines).toHaveBeenCalledWith('order-1', expect.any(Function));
    });

    it('sets loading to false after successful load', async () => {
      component.ngOnInit();
      await new Promise((r) => setTimeout(r, 0));
      expect(component.loading()).toBe(false);
    });

    it('sets loading to false even when getById rejects', async () => {
      mockOrdersUseCases.getById.mockRejectedValue(new Error('network error'));
      component.ngOnInit();
      await Promise.resolve();
      expect(component.loading()).toBe(false);
    });

    it('shows snackbar when getById rejects', async () => {
      mockOrdersUseCases.getById.mockRejectedValue(new Error('network error'));
      component.ngOnInit();
      await Promise.resolve();
      expect(mockSnackBar.open).toHaveBeenCalled();
    });
  });

  // ── ngOnDestroy ──────────────────────────────────────────────────────────────

  describe('ngOnDestroy()', () => {
    it('calls the member unsubscribe function', () => {
      const unsubscribeMembers = vi.fn();
      mockOrdersUseCases.subscribeToOrderMembers.mockReturnValue(unsubscribeMembers);
      component.ngOnInit();
      component.ngOnDestroy();
      expect(unsubscribeMembers).toHaveBeenCalled();
    });

    it('calls the lines unsubscribe function', () => {
      const unsubscribeLines = vi.fn();
      mockOrdersUseCases.subscribeToOrderLines.mockReturnValue(unsubscribeLines);
      component.ngOnInit();
      component.ngOnDestroy();
      expect(unsubscribeLines).toHaveBeenCalled();
    });

    it('clears the editing layout timer if set', () => {
      vi.useFakeTimers();
      component.onInfoEditingStarted();
      component.ngOnDestroy();
      // No error thrown means timer was cleared correctly
      vi.runAllTimers();
      expect(component.editingLayout()).toBe(false);
    });
  });

  // ── onInfoEditingStarted / onInfoEditingEnded ────────────────────────────────

  describe('onInfoEditingStarted()', () => {
    it('sets editingHeader to true immediately', () => {
      component.onInfoEditingStarted();
      expect(component.editingHeader()).toBe(true);
    });

    it('sets editingLayout to true after 300ms', () => {
      vi.useFakeTimers();
      component.onInfoEditingStarted();
      expect(component.editingLayout()).toBe(false);
      vi.advanceTimersByTime(300);
      expect(component.editingLayout()).toBe(true);
    });

    it('resets the timer if called again', () => {
      vi.useFakeTimers();
      component.onInfoEditingStarted();
      vi.advanceTimersByTime(100);
      component.onInfoEditingStarted();
      vi.advanceTimersByTime(200);
      expect(component.editingLayout()).toBe(false);
      vi.advanceTimersByTime(100);
      expect(component.editingLayout()).toBe(true);
    });
  });

  describe('onInfoEditingEnded()', () => {
    it('sets editingHeader to false', () => {
      component.editingHeader.set(true);
      component.onInfoEditingEnded();
      expect(component.editingHeader()).toBe(false);
    });

    it('sets editingLayout to false', () => {
      component.editingLayout.set(true);
      component.onInfoEditingEnded();
      expect(component.editingLayout()).toBe(false);
    });
  });

  // ── onInfoHeaderSaved ────────────────────────────────────────────────────────

  describe('onInfoHeaderSaved()', () => {
    it('calls getById to silently reload', async () => {
      (component as any)._orderId = 'order-1';
      await component.onInfoHeaderSaved();
      expect(mockOrdersUseCases.getById).toHaveBeenCalledWith('order-1');
    });
  });

  // ── onEditHeader ─────────────────────────────────────────────────────────────

  describe('onEditHeader()', () => {
    it('calls startEditing on the info section', () => {
      const startEditing = vi.fn();
      (component as any)._infoSection = { startEditing };
      component.onEditHeader();
      expect(startEditing).toHaveBeenCalled();
    });
  });

  // ── onAdvanceStatus ──────────────────────────────────────────────────────────

  describe('onAdvanceStatus()', () => {
    it('does nothing when not owner', async () => {
      component.order.set(makeOrder({ ownerId: 'other' }));
      await component.onAdvanceStatus();
      expect(mockOrdersUseCases.update).not.toHaveBeenCalled();
    });

    it('does nothing when nextStatus is null (received)', async () => {
      component.order.set(makeOrder({ status: 'received' }));
      await component.onAdvanceStatus();
      expect(mockOrdersUseCases.update).not.toHaveBeenCalled();
    });

    it('calls update with next status when advancing from ordering', async () => {
      component.order.set(makeOrder({ status: 'ordering' }));
      mockOrdersUseCases.update.mockResolvedValue(undefined);
      mockOrdersUseCases.getById.mockResolvedValue(makeOrder({ status: 'ordered' }));
      await component.onAdvanceStatus();
      expect(mockOrdersUseCases.update).toHaveBeenCalledWith('order-1', { status: 'ordered' });
    });

    it('sets saving to false after successful advance', async () => {
      component.order.set(makeOrder({ status: 'ordering' }));
      mockOrdersUseCases.update.mockResolvedValue(undefined);
      mockOrdersUseCases.getById.mockResolvedValue(makeOrder({ status: 'ordered' }));
      await component.onAdvanceStatus();
      expect(component.saving()).toBe(false);
    });

    it('shows snackbar and sets saving to false when update rejects', async () => {
      component.order.set(makeOrder({ status: 'ordering' }));
      mockOrdersUseCases.update.mockRejectedValue(new Error('error'));
      await component.onAdvanceStatus();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.saving()).toBe(false);
    });

    it('calls _onAdvanceToSelectingPacks when next is selecting_packs', async () => {
      component.order.set(makeOrder({ status: 'draft' }));
      mockOrdersUseCases.update.mockResolvedValue(undefined);
      mockOrdersUseCases.getById.mockResolvedValue(makeOrder({ status: 'selecting_packs' }));
      mockOrdersUseCases.getProducts.mockResolvedValue([]);
      await component.onAdvanceStatus();
      expect(mockOrdersUseCases.update).toHaveBeenCalledWith('order-1', { status: 'selecting_packs' });
    });

    it('muestra snackbar y restablece saving cuando _onAdvanceToSelectingPacks lanza un error', async () => {
      component.order.set(makeOrder({ status: 'draft' }));
      mockOrdersUseCases.getProducts.mockResolvedValue([]);
      mockOrdersUseCases.update.mockRejectedValue(new Error('network error'));
      await component.onAdvanceStatus();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.saving()).toBe(false);
    });
  });

  // ── _initStepper / _initForStatus ────────────────────────────────────────────

  describe('_initStepper via _loadOrder', () => {
    it('inicializa packSteps cuando el order está en selecting_packs y el usuario es propietario', async () => {
      const lineData = {
        id: 'line-1',
        orderId: 'order-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productCategory: 'box' as const,
        productUrl: null,
        requestedBy: 'user-1',
        quantityNeeded: 2,
        quantityOrdered: null,
        unitPrice: 10,
        packChosen: null,
        notes: null,
        createdAt: '2024-01-01',
        allocations: []
      };
      const selectingOrder = makeOrder({
        status: 'selecting_packs',
        ownerId: 'user-1',
        lines: [lineData],
        members: [
          {
            id: 'm-1',
            orderId: 'order-1',
            userId: 'user-1',
            displayName: 'User 1',
            email: 'u@test.com',
            avatarUrl: null,
            role: 'owner' as const,
            isReady: false,
            joinedAt: '2024-01-01'
          }
        ]
      });
      mockOrdersUseCases.getById.mockResolvedValue(selectingOrder);
      mockOrdersUseCases.getProducts.mockResolvedValue([]);

      await (component as any)._loadOrder();

      expect(component.packSteps().length).toBe(1);
      expect(component.packSteps()[0].productId).toBe('prod-1');
      expect(component.packSteps()[0].totalNeeded).toBe(2);
    });

    it('agrupa líneas del mismo producto en un único step', async () => {
      const makeLineData = (id: string, qty: number) => ({
        id,
        orderId: 'order-1',
        productId: 'prod-1',
        productName: 'Product 1',
        productCategory: 'box' as const,
        productUrl: null,
        requestedBy: 'user-1',
        quantityNeeded: qty,
        quantityOrdered: null,
        unitPrice: 10,
        packChosen: null,
        notes: null,
        createdAt: '2024-01-01',
        allocations: []
      });
      const selectingOrder = makeOrder({
        status: 'selecting_packs',
        ownerId: 'user-1',
        lines: [makeLineData('l1', 1), makeLineData('l2', 3)],
        members: []
      });
      mockOrdersUseCases.getById.mockResolvedValue(selectingOrder);
      mockOrdersUseCases.getProducts.mockResolvedValue([]);

      await (component as any)._loadOrder();

      expect(component.packSteps().length).toBe(1);
      expect(component.packSteps()[0].totalNeeded).toBe(4);
    });
  });

  // ── onRegressStatus ──────────────────────────────────────────────────────────

  describe('onRegressStatus()', () => {
    it('does nothing when not owner', async () => {
      component.order.set(makeOrder({ ownerId: 'other' }));
      await component.onRegressStatus();
      expect(mockOrdersUseCases.update).not.toHaveBeenCalled();
    });

    it('does nothing when prevStatus is null (draft)', async () => {
      component.order.set(makeOrder({ status: 'draft' }));
      await component.onRegressStatus();
      expect(mockOrdersUseCases.update).not.toHaveBeenCalled();
    });

    it('calls update with prev status and resets pack signals', async () => {
      component.order.set(makeOrder({ status: 'selecting_packs' }));
      component.packSteps.set([
        { productId: 'p1', productName: 'P', totalNeeded: 1, suggestions: [], lineIds: [], memberBreakdown: [] }
      ]);
      component.allPacksSelected.set(true);
      mockOrdersUseCases.update.mockResolvedValue(undefined);
      mockOrdersUseCases.getById.mockResolvedValue(makeOrder({ status: 'draft' }));
      await component.onRegressStatus();
      expect(mockOrdersUseCases.update).toHaveBeenCalledWith('order-1', { status: 'draft' });
      expect(component.packSteps()).toEqual([]);
      expect(component.allPacksSelected()).toBe(false);
    });

    it('shows snackbar when update rejects', async () => {
      component.order.set(makeOrder({ status: 'ordering' }));
      mockOrdersUseCases.update.mockRejectedValue(new Error('error'));
      await component.onRegressStatus();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.saving()).toBe(false);
    });
  });

  // ── onConfirmPacks ───────────────────────────────────────────────────────────

  describe('onConfirmPacks()', () => {
    it('calls update with ordering status', async () => {
      mockOrdersUseCases.update.mockResolvedValue(undefined);
      mockOrdersUseCases.getById.mockResolvedValue(makeOrder({ status: 'ordering' }));
      await component.onConfirmPacks();
      expect(mockOrdersUseCases.update).toHaveBeenCalledWith('order-1', { status: 'ordering' });
    });

    it('resets packSteps and allPacksSelected', async () => {
      component.packSteps.set([
        { productId: 'p1', productName: 'P', totalNeeded: 1, suggestions: [], lineIds: [], memberBreakdown: [] }
      ]);
      component.allPacksSelected.set(true);
      mockOrdersUseCases.update.mockResolvedValue(undefined);
      mockOrdersUseCases.getById.mockResolvedValue(makeOrder({ status: 'ordering' }));
      await component.onConfirmPacks();
      expect(component.packSteps()).toEqual([]);
      expect(component.allPacksSelected()).toBe(false);
    });

    it('shows snackbar and saving false on error', async () => {
      mockOrdersUseCases.update.mockRejectedValue(new Error('error'));
      await component.onConfirmPacks();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.saving()).toBe(false);
    });
  });

  // ── onToggleMemberReady ──────────────────────────────────────────────────────

  describe('onToggleMemberReady()', () => {
    it('does nothing when order is null', async () => {
      await component.onToggleMemberReady();
      expect(mockOrdersUseCases.setMemberReady).not.toHaveBeenCalled();
    });

    it('does nothing when userId is null', async () => {
      mockUserContext.userId.mockReturnValue(null);
      component.order.set(makeOrder());
      await component.onToggleMemberReady();
      expect(mockOrdersUseCases.setMemberReady).not.toHaveBeenCalled();
    });

    it('does nothing when saving is true', async () => {
      component.order.set(
        makeOrder({
          members: [
            {
              userId: 'user-1',
              isReady: false,
              displayName: null,
              email: null,
              avatarUrl: null,
              id: 'm1',
              orderId: 'order-1',
              joinedAt: '2024-01-01',
              role: 'member' as const
            }
          ]
        })
      );
      component.saving.set(true);
      await component.onToggleMemberReady();
      expect(mockOrdersUseCases.setMemberReady).not.toHaveBeenCalled();
    });

    it('does nothing when member is not found', async () => {
      component.order.set(makeOrder({ members: [] }));
      await component.onToggleMemberReady();
      expect(mockOrdersUseCases.setMemberReady).not.toHaveBeenCalled();
    });

    it('calls setMemberReady toggling isReady from false to true', async () => {
      component.order.set(
        makeOrder({
          members: [
            {
              userId: 'user-1',
              isReady: false,
              displayName: null,
              email: null,
              avatarUrl: null,
              id: 'm1',
              orderId: 'order-1',
              joinedAt: '2024-01-01',
              role: 'member' as const
            }
          ]
        })
      );
      mockOrdersUseCases.setMemberReady.mockResolvedValue(undefined);
      await component.onToggleMemberReady();
      expect(mockOrdersUseCases.setMemberReady).toHaveBeenCalledWith('order-1', 'user-1', true);
    });

    it('calls setMemberReady toggling isReady from true to false', async () => {
      component.order.set(
        makeOrder({
          members: [
            {
              userId: 'user-1',
              isReady: true,
              displayName: null,
              email: null,
              avatarUrl: null,
              id: 'm1',
              orderId: 'order-1',
              joinedAt: '2024-01-01',
              role: 'member' as const
            }
          ]
        })
      );
      mockOrdersUseCases.setMemberReady.mockResolvedValue(undefined);
      await component.onToggleMemberReady();
      expect(mockOrdersUseCases.setMemberReady).toHaveBeenCalledWith('order-1', 'user-1', false);
    });

    it('shows snackbar on error', async () => {
      component.order.set(
        makeOrder({
          members: [
            {
              userId: 'user-1',
              isReady: false,
              displayName: null,
              email: null,
              avatarUrl: null,
              id: 'm1',
              orderId: 'order-1',
              joinedAt: '2024-01-01',
              role: 'member' as const
            }
          ]
        })
      );
      mockOrdersUseCases.setMemberReady.mockRejectedValue(new Error('error'));
      await component.onToggleMemberReady();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.saving()).toBe(false);
    });
  });

  // ── onShareInvitation ────────────────────────────────────────────────────────

  describe('onShareInvitation()', () => {
    it('does nothing when saving is true', async () => {
      component.saving.set(true);
      await component.onShareInvitation();
      expect(mockOrdersUseCases.createInvitation).not.toHaveBeenCalled();
    });

    it('creates invitation and copies URL to clipboard on success', async () => {
      mockOrdersUseCases.createInvitation.mockResolvedValue('token-abc');
      const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
      await component.onShareInvitation();
      expect(mockOrdersUseCases.createInvitation).toHaveBeenCalledWith('order-1');
      expect(clipboardSpy).toHaveBeenCalled();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.saving()).toBe(false);
    });

    it('shows snackbar on error', async () => {
      mockOrdersUseCases.createInvitation.mockRejectedValue(new Error('error'));
      await component.onShareInvitation();
      expect(mockSnackBar.open).toHaveBeenCalled();
      expect(component.saving()).toBe(false);
    });
  });

  // ── onDeleteOrder ────────────────────────────────────────────────────────────

  describe('onDeleteOrder()', () => {
    it('does nothing when dialog returns falsy', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
      component.order.set(makeOrder());
      await component.onDeleteOrder();
      expect(mockOrdersUseCases.delete).not.toHaveBeenCalled();
    });

    it('does nothing when order is null even if confirmed', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
      await component.onDeleteOrder();
      expect(mockOrdersUseCases.delete).not.toHaveBeenCalled();
    });

    it('deletes order and navigates to /orders on confirm', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
      component.order.set(makeOrder());
      mockOrdersUseCases.delete.mockResolvedValue(undefined);
      mockRouter.navigate.mockResolvedValue(true);
      await component.onDeleteOrder();
      expect(mockOrdersUseCases.delete).toHaveBeenCalledWith('order-1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders']);
    });

    it('shows snackbar on delete error', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
      component.order.set(makeOrder());
      mockOrdersUseCases.delete.mockRejectedValue(new Error('error'));
      await component.onDeleteOrder();
      expect(mockSnackBar.open).toHaveBeenCalled();
    });
  });

  // ── onDeleteLine ─────────────────────────────────────────────────────────────

  describe('onDeleteLine()', () => {
    it('does nothing when dialog returns falsy', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });
      await component.onDeleteLine('line-1');
      expect(mockOrdersUseCases.deleteLine).not.toHaveBeenCalled();
    });

    it('deletes line and reloads on confirm', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
      mockOrdersUseCases.deleteLine.mockResolvedValue(undefined);
      mockOrdersUseCases.getById.mockResolvedValue(makeOrder());
      await component.onDeleteLine('line-1');
      expect(mockOrdersUseCases.deleteLine).toHaveBeenCalledWith('line-1');
      expect(mockSnackBar.open).toHaveBeenCalled();
    });

    it('shows snackbar on delete error', async () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
      mockOrdersUseCases.deleteLine.mockRejectedValue(new Error('error'));
      await component.onDeleteLine('line-1');
      expect(mockSnackBar.open).toHaveBeenCalled();
    });
  });

  // ── onAddLine ────────────────────────────────────────────────────────────────

  describe('onAddLine()', () => {
    it('does nothing when dialog returns undefined', async () => {
      mockOrdersUseCases.getProducts.mockResolvedValue([]);
      mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
      component.order.set(makeOrder());
      await component.onAddLine();
      expect(mockOrdersUseCases.addLine).not.toHaveBeenCalled();
    });

    it('does nothing when userId is null', async () => {
      mockUserContext.userId.mockReturnValue(null);
      mockOrdersUseCases.getProducts.mockResolvedValue([]);
      mockDialog.open.mockReturnValue({ afterClosed: () => of({ productId: 'p1', quantityNeeded: 1, notes: null }) });
      await component.onAddLine();
      expect(mockOrdersUseCases.addLine).not.toHaveBeenCalled();
    });

    it('adds line and shows snackbar on success', async () => {
      const formValue = { productId: 'p1', quantityNeeded: 1, notes: null };
      mockOrdersUseCases.getProducts.mockResolvedValue([]);
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formValue) });
      component.order.set(makeOrder());
      mockOrdersUseCases.addLine.mockResolvedValue('line-new');
      mockOrdersUseCases.getById.mockResolvedValue(makeOrder());
      await component.onAddLine();
      expect(mockOrdersUseCases.addLine).toHaveBeenCalledWith('order-1', 'user-1', formValue);
      expect(mockSnackBar.open).toHaveBeenCalled();
    });

    it('shows snackbar on addLine error', async () => {
      const formValue = { productId: 'p1', quantityNeeded: 1, notes: null };
      mockOrdersUseCases.getProducts.mockResolvedValue([]);
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formValue) });
      component.order.set(makeOrder());
      mockOrdersUseCases.addLine.mockRejectedValue(new Error('error'));
      await component.onAddLine();
      expect(mockSnackBar.open).toHaveBeenCalled();
    });
  });

  // ── onEditLine ───────────────────────────────────────────────────────────────

  describe('onEditLine()', () => {
    const line = {
      id: 'line-1',
      orderId: 'order-1',
      productId: 'prod-1',
      productName: 'Prod',
      productCategory: 'box' as const,
      productUrl: null,
      requestedBy: 'user-1',
      quantityNeeded: 1,
      quantityOrdered: 1,
      unitPrice: 10,
      packChosen: 1,
      notes: null,
      createdAt: '2024-01-01',
      allocations: []
    };

    it('does nothing when dialog returns undefined', async () => {
      mockOrdersUseCases.getProducts.mockResolvedValue([]);
      mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
      await component.onEditLine(line);
      expect(mockOrdersUseCases.updateLine).not.toHaveBeenCalled();
    });

    it('updates line and shows snackbar on success', async () => {
      const formValue = { productId: 'prod-1', quantityNeeded: 2, notes: 'note' };
      mockOrdersUseCases.getProducts.mockResolvedValue([]);
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formValue) });
      mockOrdersUseCases.updateLine.mockResolvedValue(undefined);
      mockOrdersUseCases.getById.mockResolvedValue(makeOrder());
      await component.onEditLine(line);
      expect(mockOrdersUseCases.updateLine).toHaveBeenCalledWith('line-1', { quantityNeeded: 2, notes: 'note' });
      expect(mockSnackBar.open).toHaveBeenCalled();
    });

    it('shows snackbar on updateLine error', async () => {
      const formValue = { productId: 'prod-1', quantityNeeded: 2, notes: null };
      mockOrdersUseCases.getProducts.mockResolvedValue([]);
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formValue) });
      mockOrdersUseCases.updateLine.mockRejectedValue(new Error('error'));
      await component.onEditLine(line);
      expect(mockSnackBar.open).toHaveBeenCalled();
    });
  });
});
