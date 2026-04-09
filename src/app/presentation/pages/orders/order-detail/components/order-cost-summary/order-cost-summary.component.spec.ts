import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { OrderModel } from '@/models/order/order.model';
import { sortedMembers } from '@/shared/order-member.util';
import { OrderCostSummaryComponent } from './order-cost-summary.component';

// ─── Fixture ────────────────────────────────────────────────────────────────

const makeOrder = (overrides = {}): OrderModel => ({
  id: 'order-1',
  ownerId: 'user-owner',
  title: 'Test Order',
  status: 'draft',
  orderDate: null,
  receivedDate: null,
  shippingCost: 10,
  paypalFee: 2,
  discountAmount: 0,
  discountType: 'amount',
  notes: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  members: [
    {
      id: 'm1',
      orderId: 'order-1',
      userId: 'user-owner',
      role: 'owner',
      displayName: 'Owner',
      email: 'o@t.com',
      avatarUrl: null,
      isReady: true,
      joinedAt: '2024-01-01'
    },
    {
      id: 'm2',
      orderId: 'order-1',
      userId: 'user-2',
      role: 'member',
      displayName: 'Member',
      email: 'm@t.com',
      avatarUrl: null,
      isReady: false,
      joinedAt: '2024-01-01'
    }
  ],
  lines: [
    {
      id: 'l1',
      orderId: 'order-1',
      productId: 'p1',
      requestedBy: 'user-owner',
      quantityNeeded: 10,
      productName: 'BoxA',
      productCategory: 'box',
      productUrl: null,
      unitPrice: 5,
      packChosen: null,
      quantityOrdered: 10,
      notes: null,
      createdAt: '2024-01-01',
      allocations: []
    },
    {
      id: 'l2',
      orderId: 'order-1',
      productId: 'p2',
      requestedBy: 'user-2',
      quantityNeeded: 5,
      productName: 'BoxB',
      productCategory: 'box',
      productUrl: null,
      unitPrice: 4,
      packChosen: null,
      quantityOrdered: 5,
      notes: null,
      createdAt: '2024-01-01',
      allocations: []
    }
  ],
  ...overrides
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OrderCostSummaryComponent', () => {
  let component: OrderCostSummaryComponent;

  function createComponent(order: OrderModel, userId: string | null = 'user-owner') {
    const fixture = TestBed.createComponent(OrderCostSummaryComponent);
    fixture.componentRef.setInput('order', order);
    fixture.componentRef.setInput('userId', userId);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        OrderCostSummaryComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: {} },
          translocoConfig: { availableLangs: ['es'], defaultLang: 'es' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    component = createComponent(makeOrder());
  });

  // ── sortedMembers ──────────────────────────────────────────────────────────

  describe('sortedMembers', () => {
    it('el owner aparece siempre en primera posición', () => {
      const order = makeOrder();
      const reversed = [...order.members].reverse();
      const result = sortedMembers(reversed);
      expect(result[0].role).toBe('owner');
    });

    it('mantiene al resto de miembros tras el owner', () => {
      const order = makeOrder();
      const result = sortedMembers(order.members);
      expect(result[0].userId).toBe('user-owner');
      expect(result[1].userId).toBe('user-2');
    });

    it('no muta el array original', () => {
      const order = makeOrder();
      const original = [...order.members];
      sortedMembers(order.members);
      expect(order.members).toEqual(original);
    });
  });

  // ── computeTotalSubtotal ───────────────────────────────────────────────────

  describe('computeTotalSubtotal', () => {
    it('suma correctamente unitPrice × quantityOrdered de todas las líneas', () => {
      // l1: 5 × 10 = 50 | l2: 4 × 5 = 20 → total = 70
      expect(component.totalSubtotal()).toBe(70);
    });

    it('trata quantityOrdered null como 0', () => {
      const order = makeOrder({
        lines: [
          {
            id: 'l1',
            orderId: 'order-1',
            productId: 'p1',
            requestedBy: 'user-owner',
            quantityNeeded: 10,
            productName: 'BoxA',
            productCategory: 'box',
            productUrl: null,
            unitPrice: 5,
            packChosen: null,
            quantityOrdered: null,
            notes: null,
            createdAt: '2024-01-01',
            allocations: []
          }
        ]
      });
      const c = createComponent(order);
      expect(c.totalSubtotal()).toBe(0);
    });

    it('devuelve 0 cuando no hay líneas', () => {
      const order = makeOrder({ lines: [] });
      const c = createComponent(order);
      expect(c.totalSubtotal()).toBe(0);
    });
  });

  // ── computeMySubtotal ──────────────────────────────────────────────────────

  describe('computeMySubtotal', () => {
    it('suma solo las líneas solicitadas por el usuario autenticado', () => {
      // user-owner tiene l1: 5 × 10 = 50
      expect(component.mySubtotal()).toBe(50);
    });

    it('devuelve 0 cuando userId es null', () => {
      const c = createComponent(makeOrder(), null);
      expect(c.mySubtotal()).toBe(0);
    });

    it('devuelve 0 cuando el usuario no tiene líneas propias', () => {
      const c = createComponent(makeOrder(), 'user-sin-lineas');
      expect(c.mySubtotal()).toBe(0);
    });
  });

  // ── computeMyShippingShare ─────────────────────────────────────────────────

  describe('computeMyShippingShare', () => {
    it('calcula la parte proporcional del envío', () => {
      // mySubtotal=50, total=70, shipping=10 → 50/70 * 10 ≈ 7.142...
      const expected = (50 / 70) * 10;
      expect(component.myShippingShare()).toBeCloseTo(expected, 5);
    });

    it('devuelve 0 cuando el total es 0', () => {
      const order = makeOrder({ lines: [] });
      const c = createComponent(order);
      expect(c.myShippingShare()).toBe(0);
    });

    it('devuelve 0 cuando shippingCost es null', () => {
      const order = makeOrder({ shippingCost: null });
      expect(createComponent(order).myShippingShare()).toBe(0);
    });
  });

  // ── computeMyPaypalShare ───────────────────────────────────────────────────

  describe('computeMyPaypalShare', () => {
    it('calcula la parte proporcional del fee de PayPal', () => {
      // mySubtotal=50, total=70, paypalFee=2 → 50/70 * 2 ≈ 1.428...
      const expected = (50 / 70) * 2;
      expect(component.myPaypalShare()).toBeCloseTo(expected, 5);
    });

    it('devuelve 0 cuando el total es 0', () => {
      const order = makeOrder({ lines: [] });
      const c = createComponent(order);
      expect(c.myPaypalShare()).toBe(0);
    });

    it('devuelve 0 cuando paypalFee es null', () => {
      const order = makeOrder({ paypalFee: null });
      expect(createComponent(order).myPaypalShare()).toBe(0);
    });
  });

  // ── computeMyTotal ─────────────────────────────────────────────────────────

  describe('computeMyTotal', () => {
    it('suma subtotal + shipping + paypal del usuario', () => {
      const mySubtotal = component.mySubtotal();
      const myShipping = component.myShippingShare();
      const myPaypal = component.myPaypalShare();
      expect(component.myTotal()).toBeCloseTo(mySubtotal + myShipping + myPaypal, 5);
    });

    it('devuelve 0 cuando userId es null', () => {
      const c = createComponent(makeOrder(), null);
      expect(c.myTotal()).toBe(0);
    });
  });

  // ── computeExtras ──────────────────────────────────────────────────────────

  describe('computeExtras', () => {
    it('con discountType amount: (shipping + paypal) - discountAmount', () => {
      const order = makeOrder({ shippingCost: 10, paypalFee: 2, discountAmount: 3, discountType: 'amount' });
      const c = createComponent(order);
      // (10 + 2) - 3 = 9
      expect(c.extras()).toBe(9);
    });

    it('con discountType percentage: (shipping + paypal) - (subtotal * discount/100)', () => {
      // subtotal=70, discount=10% → 70*0.1=7; extras=(10+2)-7=5
      const order = makeOrder({ shippingCost: 10, paypalFee: 2, discountAmount: 10, discountType: 'percentage' });
      const c = createComponent(order);
      expect(c.extras()).toBeCloseTo(5, 5);
    });

    it('sin descuento devuelve shipping + paypal', () => {
      // discountAmount=0 → (10+2)-0 = 12
      expect(component.extras()).toBe(12);
    });

    it('trata discountAmount null como 0', () => {
      const order = makeOrder({ discountAmount: null });
      const c = createComponent(order);
      expect(c.extras()).toBe(12);
    });
  });

  // ── computeMemberCosts ─────────────────────────────────────────────────────

  describe('computeMemberCosts', () => {
    it('devuelve una entrada por cada miembro del pedido', () => {
      expect(component.memberCosts()).toHaveLength(2);
    });

    it('el owner aparece en primera posición', () => {
      const costs = component.memberCosts();
      expect(costs[0].userId).toBe('user-owner');
    });

    it('calcula correctamente el subtotal del owner (5 × 10 = 50)', () => {
      const ownerCost = component.memberCosts()[0];
      expect(ownerCost.subtotal).toBe(50);
    });

    it('calcula correctamente el subtotal del member (4 × 5 = 20)', () => {
      const memberCost = component.memberCosts()[1];
      expect(memberCost.subtotal).toBe(20);
    });

    it('el extrasShare es proporcional al subtotal de cada miembro', () => {
      const costs = component.memberCosts();
      const total = 70; // 50 + 20
      const extras = 12; // shippingCost(10) + paypalFee(2), sin descuento

      expect(costs[0].extrasShare).toBeCloseTo((50 / total) * extras, 5);
      expect(costs[1].extrasShare).toBeCloseTo((20 / total) * extras, 5);
    });

    it('el total de cada miembro es subtotal + extrasShare', () => {
      const costs = component.memberCosts();
      for (const c of costs) {
        expect(c.total).toBeCloseTo(c.subtotal + c.extrasShare, 5);
      }
    });

    it('devuelve extrasShare = 0 para todos cuando el total es 0', () => {
      const order = makeOrder({ lines: [] });
      const c = createComponent(order);
      const costs = c.memberCosts();
      for (const mc of costs) {
        expect(mc.extrasShare).toBe(0);
      }
    });
  });

  // ── onToggleCostDetail ─────────────────────────────────────────────────────

  describe('onToggleCostDetail', () => {
    it('alterna costDetailExpanded de false a true', () => {
      expect(component.costDetailExpanded()).toBe(false);
      component.onToggleCostDetail();
      expect(component.costDetailExpanded()).toBe(true);
    });

    it('alterna costDetailExpanded de true a false', () => {
      component.onToggleCostDetail();
      component.onToggleCostDetail();
      expect(component.costDetailExpanded()).toBe(false);
    });
  });

  // ── onToggleMyPart ─────────────────────────────────────────────────────────

  describe('onToggleMyPart', () => {
    it('alterna myPartExpanded de false a true', () => {
      expect(component.myPartExpanded()).toBe(false);
      component.onToggleMyPart();
      expect(component.myPartExpanded()).toBe(true);
    });

    it('alterna myPartExpanded de true a false', () => {
      component.onToggleMyPart();
      component.onToggleMyPart();
      expect(component.myPartExpanded()).toBe(false);
    });
  });
});
