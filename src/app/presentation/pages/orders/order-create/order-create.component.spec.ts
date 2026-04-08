import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { OrderCreateComponent } from './order-create.component';
import { ORDERS_USE_CASES } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { UserContextService } from '@/services/user-context.service';

describe('OrderCreateComponent', () => {
  let component: OrderCreateComponent;
  let fixture: ComponentFixture<OrderCreateComponent>;

  const mockOrdersUseCases = {
    create: vi.fn()
  };

  const mockUserContext = {
    userId: vi.fn()
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [
        OrderCreateComponent,
        ReactiveFormsModule,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }
        })
      ],
      providers: [
        { provide: ORDERS_USE_CASES, useValue: mockOrdersUseCases },
        { provide: UserContextService, useValue: mockUserContext },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: vi.fn() } } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(OrderCreateComponent);
    component = fixture.componentInstance;
  });

  describe('estado inicial del formulario', () => {
    it('title es null', () => {
      expect(component.form.controls.title.value).toBeNull();
    });

    it('title es requerido (el formulario es inválido sin título)', () => {
      expect(component.form.controls.title.hasError('required')).toBe(true);
    });

    it('notes es null', () => {
      expect(component.form.controls.notes.value).toBeNull();
    });

    it('discountType tiene valor por defecto "amount"', () => {
      expect(component.form.controls.discountType.value).toBe('amount');
    });

    it('saving es false', () => {
      expect(component.saving()).toBe(false);
    });
  });

  describe('onSubmit()', () => {
    it('no hace nada cuando el formulario es inválido (title ausente)', async () => {
      mockUserContext.userId.mockReturnValue('user-1');

      await component.onSubmit();

      expect(mockOrdersUseCases.create).not.toHaveBeenCalled();
    });

    it('no hace nada cuando userId es null', async () => {
      mockUserContext.userId.mockReturnValue(null);
      component.form.controls.title.setValue('Pedido de prueba');

      await component.onSubmit();

      expect(mockOrdersUseCases.create).not.toHaveBeenCalled();
    });

    it('no hace nada cuando saving ya es true', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      component.form.controls.title.setValue('Pedido de prueba');
      component.saving.set(true);

      await component.onSubmit();

      expect(mockOrdersUseCases.create).not.toHaveBeenCalled();
    });

    it('llama a ordersUseCases.create con userId y los valores del formulario', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.create.mockResolvedValue('order-new');
      mockRouter.navigate.mockResolvedValue(true);

      component.form.controls.title.setValue('Pedido de prueba');

      await component.onSubmit();

      expect(mockOrdersUseCases.create).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ title: 'Pedido de prueba' })
      );
    });

    it('navega a /orders/:id tras la creación exitosa', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.create.mockResolvedValue('order-new');
      mockRouter.navigate.mockResolvedValue(true);

      component.form.controls.title.setValue('Pedido de prueba');

      await component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders', 'order-new']);
    });

    it('pone saving a true durante la operación', async () => {
      mockUserContext.userId.mockReturnValue('user-1');

      let resolveCreate!: (value: string) => void;
      const createPromise = new Promise<string>((res) => {
        resolveCreate = res;
      });
      mockOrdersUseCases.create.mockReturnValue(createPromise);
      mockRouter.navigate.mockResolvedValue(true);

      component.form.controls.title.setValue('Pedido de prueba');

      const submitPromise = component.onSubmit();

      expect(component.saving()).toBe(true);

      resolveCreate('order-new');
      await submitPromise;
    });

    it('pone saving a false tras la creación exitosa', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.create.mockResolvedValue('order-new');
      mockRouter.navigate.mockResolvedValue(true);

      component.form.controls.title.setValue('Pedido de prueba');

      await component.onSubmit();

      expect(component.saving()).toBe(false);
    });

    it('saving termina en false aunque create rechace (bloque finally)', async () => {
      mockUserContext.userId.mockReturnValue('user-1');
      mockOrdersUseCases.create.mockRejectedValue(new Error('error del servidor'));

      component.form.controls.title.setValue('Pedido de prueba');

      await component.onSubmit().catch(() => {});

      expect(component.saving()).toBe(false);
    });
  });
});
