import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { UserContextService } from '@/services/user-context/user-context.service';
import { OrderModel } from '@/models/order/order.model';
import { OrderLineModel } from '@/models/order/order-line.model';
import { OrderProductListComponent } from './order-product-list.component';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeLine = (overrides: Partial<OrderLineModel> = {}): OrderLineModel => ({
  id: 'l1',
  orderId: 'order-1',
  productId: 'p1',
  requestedBy: 'user-owner',
  quantityNeeded: 5,
  productName: 'BoxA',
  productCategory: 'box',
  productUrl: 'https://example.com/p1',
  unitPrice: 10,
  packChosen: null,
  quantityOrdered: 5,
  notes: null,
  createdAt: '2024-01-01',
  allocations: [],
  ...overrides
});

const makeOrder = (overrides: Partial<OrderModel> = {}): OrderModel => ({
  id: 'order-1',
  ownerId: 'user-owner',
  title: 'Test Order',
  status: 'draft',
  orderDate: null,
  receivedDate: null,
  shippingCost: 0,
  paypalFee: 0,
  discountAmount: 0,
  discountType: 'amount',
  notes: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  members: [],
  lines: [makeLine()],
  ...overrides
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OrderProductListComponent', () => {
  let component: OrderProductListComponent;
  let mockUserContext: { userId: ReturnType<typeof vi.fn> };

  function createComponent(order: OrderModel, editingHeader = false) {
    const fixture = TestBed.createComponent(OrderProductListComponent);
    fixture.componentRef.setInput('order', order);
    fixture.componentRef.setInput('editingHeader', editingHeader);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserContext = { userId: vi.fn().mockReturnValue('user-owner') };

    TestBed.configureTestingModule({
      imports: [
        OrderProductListComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      providers: [{ provide: UserContextService, useValue: mockUserContext }],
      schemas: [NO_ERRORS_SCHEMA]
    });

    component = createComponent(makeOrder());
  });

  // ── isOwner ────────────────────────────────────────────────────────────────

  describe('isOwner', () => {
    it('devuelve true cuando ownerId coincide con el userId del contexto', () => {
      expect(component.isOwner()).toBe(true);
    });

    it('devuelve false cuando el usuario autenticado no es el owner', () => {
      mockUserContext.userId.mockReturnValue('user-2');
      expect(component.isOwner()).toBe(false);
    });
  });

  // ── visibleLines ───────────────────────────────────────────────────────────

  describe('visibleLines', () => {
    it('en estado draft devuelve solo las líneas del usuario autenticado', () => {
      const lines = [makeLine({ id: 'l1', requestedBy: 'user-owner' }), makeLine({ id: 'l2', requestedBy: 'user-2' })];
      const order = makeOrder({ status: 'draft', lines });
      const c = createComponent(order);
      const result = c.visibleLines(lines);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('l1');
    });

    it('en estado draft incluye líneas con requestedBy null', () => {
      const lines = [makeLine({ id: 'l1', requestedBy: 'user-owner' }), makeLine({ id: 'l2', requestedBy: null })];
      const order = makeOrder({ status: 'draft', lines });
      const c = createComponent(order);
      const result = c.visibleLines(lines);
      expect(result).toHaveLength(2);
    });

    it('en estado no draft devuelve todas las líneas', () => {
      const lines = [makeLine({ id: 'l1', requestedBy: 'user-owner' }), makeLine({ id: 'l2', requestedBy: 'user-2' })];
      const order = makeOrder({ status: 'ordered', lines });
      const c = createComponent(order);
      const result = c.visibleLines(lines);
      expect(result).toHaveLength(2);
    });

    it('en estado ordered devuelve todas las líneas', () => {
      const lines = [makeLine({ id: 'l1', requestedBy: 'user-owner' }), makeLine({ id: 'l2', requestedBy: 'user-2' })];
      const order = makeOrder({ status: 'ordered', lines });
      const c = createComponent(order);
      const result = c.visibleLines(lines);
      expect(result).toHaveLength(2);
    });

    it('en estado draft devuelve vacío si el usuario no tiene líneas propias', () => {
      mockUserContext.userId.mockReturnValue('user-sin-lineas');
      const lines = [makeLine({ requestedBy: 'user-owner' })];
      const order = makeOrder({ status: 'draft', lines });
      const c = createComponent(order);
      expect(c.visibleLines(lines)).toHaveLength(0);
    });
  });

  // ── groupedLines ───────────────────────────────────────────────────────────

  describe('groupedLines', () => {
    it('con una sola línea devuelve una única entrada agrupada', () => {
      const result = component.groupedLines();
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('p1');
    });

    it('agrupa varias líneas del mismo producto sumando quantityOrdered', () => {
      const lines = [
        makeLine({ id: 'l1', productId: 'p1', quantityOrdered: 10 }),
        makeLine({ id: 'l2', productId: 'p1', quantityOrdered: 5, requestedBy: 'user-2' })
      ];
      const order = makeOrder({ lines });
      const c = createComponent(order);
      const result = c.groupedLines();
      expect(result).toHaveLength(1);
      expect(result[0].quantityOrdered).toBe(15);
    });

    it('productos distintos generan entradas separadas', () => {
      const lines = [
        makeLine({ id: 'l1', productId: 'p1', productName: 'BoxA' }),
        makeLine({ id: 'l2', productId: 'p2', productName: 'BoxB' })
      ];
      const order = makeOrder({ lines });
      const c = createComponent(order);
      const result = c.groupedLines();
      expect(result).toHaveLength(2);
    });

    it('trata quantityOrdered null como 0 al acumular', () => {
      const lines = [
        makeLine({ id: 'l1', productId: 'p1', quantityOrdered: 5 }),
        makeLine({ id: 'l2', productId: 'p1', quantityOrdered: null, requestedBy: 'user-2' })
      ];
      const order = makeOrder({ lines });
      const c = createComponent(order);
      const result = c.groupedLines();
      expect(result[0].quantityOrdered).toBe(5);
    });

    it('toma la productUrl de la primera línea encontrada', () => {
      const lines = [
        makeLine({ id: 'l1', productId: 'p1', productUrl: 'https://first.com' }),
        makeLine({ id: 'l2', productId: 'p1', productUrl: 'https://second.com', requestedBy: 'user-2' })
      ];
      const order = makeOrder({ lines });
      const c = createComponent(order);
      const result = c.groupedLines();
      expect(result[0].productUrl).toBe('https://first.com');
    });

    it('devuelve array vacío cuando no hay líneas', () => {
      const order = makeOrder({ lines: [] });
      const c = createComponent(order);
      expect(c.groupedLines()).toEqual([]);
    });
  });
});
