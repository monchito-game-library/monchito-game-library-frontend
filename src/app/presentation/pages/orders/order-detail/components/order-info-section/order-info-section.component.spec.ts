import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { OrderInfoSectionComponent } from './order-info-section.component';
import { ORDERS_USE_CASES } from '@/domain/use-cases/orders/orders.use-cases.contract';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderModel } from '@/models/order/order.model';
import { OrderMemberModel } from '@/models/order/order-member.model';

const makeMember = (overrides: Partial<OrderMemberModel> = {}): OrderMemberModel => ({
  id: 'member-1',
  orderId: 'order-1',
  userId: 'user-1',
  displayName: 'Usuario Uno',
  email: 'user1@test.com',
  avatarUrl: null,
  role: 'member',
  isReady: false,
  joinedAt: '2026-01-01T00:00:00Z',
  ...overrides
});

const makeOwner = (overrides: Partial<OrderMemberModel> = {}): OrderMemberModel =>
  makeMember({ id: 'member-owner', userId: 'owner-1', role: 'owner', isReady: false, ...overrides });

const makeOrder = (overrides: Partial<OrderModel> = {}): OrderModel => ({
  id: 'order-1',
  ownerId: 'owner-1',
  title: 'Pedido de prueba',
  status: 'draft',
  orderDate: null,
  receivedDate: null,
  shippingCost: 10,
  paypalFee: 2,
  discountAmount: null,
  discountType: 'amount',
  notes: 'Notas de prueba',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  members: [],
  lines: [],
  ...overrides
});

describe('OrderInfoSectionComponent', () => {
  let component: OrderInfoSectionComponent;
  let fixture: ComponentFixture<OrderInfoSectionComponent>;
  let mockOrdersUseCases: { update: ReturnType<typeof vi.fn> };
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };
  let mockTransloco: { translate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    mockOrdersUseCases = { update: vi.fn().mockResolvedValue(undefined) };
    mockSnackBar = { open: vi.fn() };
    mockTransloco = { translate: vi.fn().mockReturnValue('') };

    TestBed.configureTestingModule({
      imports: [OrderInfoSectionComponent],
      providers: [
        { provide: ORDERS_USE_CASES, useValue: mockOrdersUseCases },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: TranslocoService, useValue: mockTransloco }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    TestBed.overrideComponent(OrderInfoSectionComponent, { set: { imports: [], template: '' } });

    fixture = TestBed.createComponent(OrderInfoSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('order', makeOrder());
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('sortedMembers()', () => {
    it('coloca al owner siempre al inicio independientemente del orden de entrada', () => {
      const member1 = makeMember({ id: 'member-a', userId: 'user-a' });
      const member2 = makeMember({ id: 'member-b', userId: 'user-b' });
      const owner = makeOwner();

      const result = component.sortedMembers([member1, owner, member2]);

      expect(result[0].role).toBe('owner');
      expect(result[1].id).toBe('member-a');
      expect(result[2].id).toBe('member-b');
    });

    it('devuelve la lista tal cual cuando solo hay miembros sin owner', () => {
      const member1 = makeMember({ id: 'member-a' });
      const member2 = makeMember({ id: 'member-b' });

      const result = component.sortedMembers([member1, member2]);

      expect(result).toHaveLength(2);
    });
  });

  describe('readyCount()', () => {
    it('devuelve { ready: 1, total: 2 } cuando 1 de 2 miembros no-owner está listo', () => {
      const owner = makeOwner();
      const member1 = makeMember({ id: 'member-a', isReady: true });
      const member2 = makeMember({ id: 'member-b', isReady: false });

      const result = component.readyCount([owner, member1, member2]);

      expect(result).toEqual({ ready: 1, total: 2 });
    });

    it('devuelve { ready: 0, total: 0 } cuando solo hay owner en la lista', () => {
      const owner = makeOwner();

      const result = component.readyCount([owner]);

      expect(result).toEqual({ ready: 0, total: 0 });
    });
  });

  describe('allMembersReady()', () => {
    it('devuelve true cuando no hay miembros no-owner', () => {
      const owner = makeOwner();

      expect(component.allMembersReady([owner])).toBe(true);
    });

    it('devuelve true cuando todos los miembros no-owner tienen isReady=true', () => {
      const owner = makeOwner();
      const member1 = makeMember({ id: 'member-a', isReady: true });
      const member2 = makeMember({ id: 'member-b', isReady: true });

      expect(component.allMembersReady([owner, member1, member2])).toBe(true);
    });

    it('devuelve false cuando al menos un miembro no-owner no está listo', () => {
      const owner = makeOwner();
      const member1 = makeMember({ id: 'member-a', isReady: true });
      const member2 = makeMember({ id: 'member-b', isReady: false });

      expect(component.allMembersReady([owner, member1, member2])).toBe(false);
    });
  });

  describe('startEditing()', () => {
    it('pone editingHeader a true', () => {
      component.startEditing();

      expect(component.editingHeader()).toBe(true);
    });

    it('emite editingStarted', () => {
      const spy = vi.spyOn(component.editingStarted, 'emit');

      component.startEditing();

      expect(spy).toHaveBeenCalledOnce();
    });

    it('parchea el headerForm con los valores del pedido', () => {
      fixture.componentRef.setInput(
        'order',
        makeOrder({
          title: 'Nuevo título',
          notes: 'Nuevas notas',
          shippingCost: 15,
          paypalFee: 3,
          discountAmount: 5,
          discountType: 'percentage'
        })
      );
      fixture.detectChanges();

      component.startEditing();

      expect(component.headerForm.getRawValue()).toMatchObject({
        title: 'Nuevo título',
        notes: 'Nuevas notas',
        shippingCost: 15,
        paypalFee: 3,
        discountAmount: 5,
        discountType: 'percentage'
      });
    });
  });

  describe('onCancelEdit()', () => {
    it('pone editingHeader a false', async () => {
      component.editingHeader.set(true);

      component.onCancelEdit();
      await new Promise((r) => setTimeout(r, 0));

      expect(component.editingHeader()).toBe(false);
    });

    it('emite editingEnded', () => {
      const spy = vi.spyOn(component.editingEnded, 'emit');

      component.onCancelEdit();

      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('onSaveHeader()', () => {
    it('llama a ordersUseCases.update con el id del pedido y el valor del formulario', async () => {
      component.startEditing();

      await component.onSaveHeader();
      await new Promise((r) => setTimeout(r, 0));

      expect(mockOrdersUseCases.update).toHaveBeenCalledOnce();
      expect(mockOrdersUseCases.update).toHaveBeenCalledWith('order-1', expect.any(Object));
    });

    it('emite editingEnded y headerSaved al guardar correctamente', async () => {
      const spyEnded = vi.spyOn(component.editingEnded, 'emit');
      const spySaved = vi.spyOn(component.headerSaved, 'emit');

      component.startEditing();
      await component.onSaveHeader();
      await new Promise((r) => setTimeout(r, 0));

      expect(spyEnded).toHaveBeenCalledOnce();
      expect(spySaved).toHaveBeenCalledOnce();
    });

    it('muestra snackbar de éxito al guardar correctamente', async () => {
      component.startEditing();
      await component.onSaveHeader();
      await new Promise((r) => setTimeout(r, 0));

      expect(mockSnackBar.open).toHaveBeenCalledOnce();
    });

    it('muestra snackbar de error cuando update falla', async () => {
      mockOrdersUseCases.update.mockRejectedValue(new Error('Error de red'));

      component.startEditing();
      await component.onSaveHeader();
      await new Promise((r) => setTimeout(r, 0));

      expect(mockSnackBar.open).toHaveBeenCalledOnce();
    });
  });
});
