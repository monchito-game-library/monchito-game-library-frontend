import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it } from 'vitest';

import { OrderPlacingComponent } from './order-placing.component';
import { OrderModel } from '@/models/order/order.model';
import { OrderProductModel } from '@/models/order/order-product.model';
import { OrderLineModel } from '@/models/order/order-line.model';

function makeLine(overrides: Partial<OrderLineModel> = {}): OrderLineModel {
  return {
    id: 'l1',
    orderId: 'order-1',
    productId: 'prod-1',
    productName: 'Protector PS5',
    productCategory: 'box',
    productUrl: null,
    requestedBy: 'user-1',
    quantityNeeded: 1,
    quantityOrdered: 1,
    unitPrice: 10,
    packChosen: 1,
    notes: null,
    createdAt: '2024-01-01T00:00:00Z',
    allocations: [],
    ...overrides
  };
}

function makeOrder(overrides: Partial<OrderModel> = {}): OrderModel {
  return {
    id: 'order-1',
    ownerId: 'user-1',
    title: 'Test Order',
    status: 'ordering',
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

function makeProduct(overrides: Partial<OrderProductModel> = {}): OrderProductModel {
  return {
    id: 'prod-1',
    name: 'Protector PS5',
    category: 'box',
    notes: null,
    packs: [{ quantity: 1, price: 10, url: 'https://example.com' }],
    ...overrides
  };
}

describe('OrderPlacingComponent', () => {
  let component: OrderPlacingComponent;
  let fixture: ComponentFixture<OrderPlacingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrderPlacingComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(OrderPlacingComponent, { set: { imports: [], template: '' } });
    fixture = TestBed.createComponent(OrderPlacingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('order', makeOrder());
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('editingHeader', false);
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('placingRows()', () => {
    it('devuelve array vacío cuando el pedido no tiene líneas', () => {
      expect(component.placingRows()).toEqual([]);
    });

    it('agrupa líneas por productId y calcula totalOrdered', () => {
      fixture.componentRef.setInput(
        'order',
        makeOrder({
          lines: [
            makeLine({ id: 'l1', requestedBy: 'user-1', quantityOrdered: 2 }),
            makeLine({ id: 'l2', requestedBy: 'user-2', quantityOrdered: 3 })
          ]
        })
      );
      fixture.detectChanges();
      const rows = component.placingRows();
      expect(rows).toHaveLength(1);
      expect(rows[0].totalOrdered).toBe(5);
    });

    it('devuelve totalCost 0 y breakdown vacío cuando totalOrdered es 0', () => {
      fixture.componentRef.setInput(
        'order',
        makeOrder({
          lines: [makeLine({ quantityOrdered: 0 })]
        })
      );
      fixture.componentRef.setInput('products', [makeProduct()]);
      fixture.detectChanges();
      const rows = component.placingRows();
      expect(rows[0].totalCost).toBe(0);
      expect(rows[0].breakdown).toEqual([]);
    });

    it('devuelve totalCost 0 y breakdown vacío cuando el producto no se encuentra', () => {
      fixture.componentRef.setInput(
        'order',
        makeOrder({
          lines: [makeLine({ productId: 'unknown-prod', productName: 'Unknown', quantityOrdered: 2 })]
        })
      );
      fixture.componentRef.setInput('products', [makeProduct()]);
      fixture.detectChanges();
      const rows = component.placingRows();
      expect(rows[0].totalCost).toBe(0);
      expect(rows[0].breakdown).toEqual([]);
    });

    it('calcula breakdown y totalCost cuando el producto existe y hay unidades pedidas', () => {
      fixture.componentRef.setInput(
        'order',
        makeOrder({
          lines: [makeLine({ quantityOrdered: 2, unitPrice: 10 })]
        })
      );
      fixture.componentRef.setInput('products', [makeProduct()]);
      fixture.detectChanges();
      const rows = component.placingRows();
      expect(rows[0].totalOrdered).toBe(2);
      expect(rows[0].totalCost).toBeGreaterThan(0);
      expect(rows[0].breakdown.length).toBeGreaterThan(0);
    });

    it('agrupa múltiples productos en filas separadas', () => {
      fixture.componentRef.setInput(
        'order',
        makeOrder({
          lines: [
            makeLine({ id: 'l1', productId: 'prod-1', quantityOrdered: 1 }),
            makeLine({ id: 'l2', productId: 'prod-2', productName: 'Otro', quantityOrdered: 1 })
          ]
        })
      );
      fixture.detectChanges();
      expect(component.placingRows()).toHaveLength(2);
    });
  });
});
