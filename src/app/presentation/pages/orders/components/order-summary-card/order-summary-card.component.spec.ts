import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { OrderSummaryCardComponent } from './order-summary-card.component';
import { OrderSummaryModel } from '@/models/order/order-summary.model';

const makeOrder = (overrides: Partial<OrderSummaryModel> = {}): OrderSummaryModel => ({
  id: 'order-1',
  ownerId: 'user-1',
  title: 'Pedido marzo 2026',
  status: 'draft',
  orderDate: null,
  memberCount: 2,
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides
});

describe('OrderSummaryCardComponent', () => {
  let component: OrderSummaryCardComponent;
  let fixture: ComponentFixture<OrderSummaryCardComponent>;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        OrderSummaryCardComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(OrderSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('order', makeOrder());
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('onCardClick()', () => {
    it('emite el id del pedido a través de openOrder', () => {
      const emitted: string[] = [];
      component.openOrder.subscribe((id: string) => emitted.push(id));

      component.onCardClick();

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toBe('order-1');
    });

    it('emite el id correcto cuando el pedido cambia', () => {
      fixture.componentRef.setInput('order', makeOrder({ id: 'order-99' }));
      fixture.detectChanges();

      const emitted: string[] = [];
      component.openOrder.subscribe((id: string) => emitted.push(id));

      component.onCardClick();

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toBe('order-99');
    });
  });
});
