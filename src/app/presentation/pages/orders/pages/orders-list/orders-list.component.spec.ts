import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { OrdersListComponent } from './orders-list.component';
import { ORDERS_USE_CASES } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context/user-context.service';
import { OrderSummaryModel } from '@/models/order/order-summary.model';
import { mockRouter } from '@/testing/router.mock';

function makeOrderSummary(overrides: Partial<OrderSummaryModel> = {}): OrderSummaryModel {
  return {
    id: 'order-1',
    title: 'Test Order',
    status: 'draft',
    createdAt: '2024-01-01T00:00:00Z',
    ownerId: 'user-1',
    memberCount: 1,
    orderDate: null,
    ...overrides
  };
}

describe('OrdersListComponent', () => {
  let component: OrdersListComponent;
  let fixture: ComponentFixture<OrdersListComponent>;

  const mockOrdersUseCases = {
    getAllForUser: vi.fn()
  };

  const mockUserContext = {
    userId: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        OrdersListComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: ORDERS_USE_CASES, useValue: mockOrdersUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(OrdersListComponent);
    component = fixture.componentInstance;
  });

  describe('valores iniciales', () => {
    it('orders es []', () => {
      expect(component.orders()).toEqual([]);
    });

    it('loading es false', () => {
      expect(component.loading()).toBe(false);
    });
  });

  describe('ngOnInit / _loadOrders()', () => {
    it('no llama a getAllForUser cuando userId es null', async () => {
      mockUserContext.userId.mockReturnValue(null);

      component.ngOnInit();

      expect(mockOrdersUseCases.getAllForUser).not.toHaveBeenCalled();
    });

    it('loading permanece false cuando userId es null', async () => {
      mockUserContext.userId.mockReturnValue(null);

      component.ngOnInit();

      expect(component.loading()).toBe(false);
    });

    it('llama a getAllForUser con el userId cuando está definido', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.getAllForUser.mockResolvedValue([]);

      component.ngOnInit();

      expect(mockOrdersUseCases.getAllForUser).toHaveBeenCalledWith('user-1');
    });

    it('actualiza la señal orders con el resultado de getAllForUser', async () => {
      const mockOrders = [makeOrderSummary()];
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.getAllForUser.mockResolvedValue(mockOrders);

      component.ngOnInit();
      await Promise.resolve();

      expect(component.orders()).toEqual(mockOrders);
    });

    it('pone loading a false tras la carga exitosa', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.getAllForUser.mockResolvedValue([]);

      component.ngOnInit();
      await Promise.resolve();

      expect(component.loading()).toBe(false);
    });

    it('pone loading a true durante la carga y a false al terminar', async () => {
      mockUserContext.userId.mockReturnValue('user-1');

      let resolveLoad!: (value: OrderSummaryModel[]) => void;
      const loadPromise = new Promise<OrderSummaryModel[]>((res) => {
        resolveLoad = res;
      });
      mockOrdersUseCases.getAllForUser.mockReturnValue(loadPromise);

      const callPromise = (component as any)._loadOrders();

      expect(component.loading()).toBe(true);

      resolveLoad([]);
      await callPromise;

      expect(component.loading()).toBe(false);
    });

    it('loading termina en false aunque getAllForUser rechace', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.getAllForUser.mockRejectedValue(new Error('error de red'));

      await (component as any)._loadOrders().catch(() => {});

      expect(component.loading()).toBe(false);
    });
  });

  describe('onCreateOrder()', () => {
    it('navega a /orders/new', () => {
      component.onCreateOrder();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders', 'new']);
    });
  });

  describe('onOpenOrder()', () => {
    it('navega a /orders/:orderId', () => {
      component.onOpenOrder('order-abc');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders', 'order-abc']);
    });
  });
});
