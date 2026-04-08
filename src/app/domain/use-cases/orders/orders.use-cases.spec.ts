import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { ORDER_REPOSITORY, OrderRepositoryContract } from '@/domain/repositories/order.repository.contract';
import { OrdersUseCasesImpl } from './orders.use-cases';

// ─── Mock del repositorio ─────────────────────────────────────────────────────

const mockRepo: OrderRepositoryContract = {
  getAllForUser: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  addLine: vi.fn(),
  updateLine: vi.fn(),
  deleteLine: vi.fn(),
  upsertAllocation: vi.fn(),
  getProducts: vi.fn(),
  createInvitation: vi.fn(),
  getInvitationByToken: vi.fn(),
  acceptInvitation: vi.fn(),
  setMemberReady: vi.fn(),
  subscribeToOrderMembers: vi.fn(),
  subscribeToOrderLines: vi.fn()
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OrdersUseCasesImpl', () => {
  let useCases: OrdersUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [OrdersUseCasesImpl, { provide: ORDER_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(OrdersUseCasesImpl);
  });

  // ─── getAllForUser ──────────────────────────────────────────────────────────

  describe('getAllForUser', () => {
    it('delega en repo.getAllForUser con los parámetros correctos', async () => {
      vi.mocked(mockRepo.getAllForUser).mockResolvedValue([]);

      await useCases.getAllForUser('user-1');

      expect(mockRepo.getAllForUser).toHaveBeenCalledWith('user-1');
    });

    it('devuelve el resultado del repositorio', async () => {
      const summaries = [{ id: 'order-1' }] as never;
      vi.mocked(mockRepo.getAllForUser).mockResolvedValue(summaries);

      const result = await useCases.getAllForUser('user-1');

      expect(result).toBe(summaries);
    });
  });

  // ─── getById ───────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('delega en repo.getById con los parámetros correctos', async () => {
      vi.mocked(mockRepo.getById).mockResolvedValue({} as never);

      await useCases.getById('order-1');

      expect(mockRepo.getById).toHaveBeenCalledWith('order-1');
    });

    it('devuelve el resultado del repositorio', async () => {
      const order = { id: 'order-1' } as never;
      vi.mocked(mockRepo.getById).mockResolvedValue(order);

      const result = await useCases.getById('order-1');

      expect(result).toBe(order);
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('delega en repo.create con los parámetros correctos', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue('order-uuid');
      const formValue = { title: 'Pedido enero', notes: null } as never;

      await useCases.create('user-1', formValue);

      expect(mockRepo.create).toHaveBeenCalledWith('user-1', formValue);
    });

    it('devuelve el resultado del repositorio', async () => {
      vi.mocked(mockRepo.create).mockResolvedValue('order-uuid');

      const result = await useCases.create('user-1', { title: 'Pedido enero', notes: null } as never);

      expect(result).toBe('order-uuid');
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('delega en repo.update con los parámetros correctos', async () => {
      vi.mocked(mockRepo.update).mockResolvedValue();
      const patch = { title: 'Nuevo título' } as never;

      await useCases.update('order-1', patch);

      expect(mockRepo.update).toHaveBeenCalledWith('order-1', patch);
    });
  });

  // ─── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('delega en repo.delete con los parámetros correctos', async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue();

      await useCases.delete('order-1');

      expect(mockRepo.delete).toHaveBeenCalledWith('order-1');
    });
  });

  // ─── addLine ───────────────────────────────────────────────────────────────

  describe('addLine', () => {
    it('delega en repo.addLine con los parámetros correctos', async () => {
      vi.mocked(mockRepo.addLine).mockResolvedValue('line-uuid');
      const formValue = { productId: 'prod-1', quantityNeeded: 5 } as never;

      await useCases.addLine('order-1', 'user-1', formValue);

      expect(mockRepo.addLine).toHaveBeenCalledWith('order-1', 'user-1', formValue);
    });

    it('devuelve el resultado del repositorio', async () => {
      vi.mocked(mockRepo.addLine).mockResolvedValue('line-uuid');

      const result = await useCases.addLine('order-1', 'user-1', { productId: 'prod-1' } as never);

      expect(result).toBe('line-uuid');
    });
  });

  // ─── updateLine ────────────────────────────────────────────────────────────

  describe('updateLine', () => {
    it('delega en repo.updateLine con los parámetros correctos', async () => {
      vi.mocked(mockRepo.updateLine).mockResolvedValue();
      const patch = { quantityOrdered: 2 } as never;

      await useCases.updateLine('line-1', patch);

      expect(mockRepo.updateLine).toHaveBeenCalledWith('line-1', patch);
    });
  });

  // ─── deleteLine ────────────────────────────────────────────────────────────

  describe('deleteLine', () => {
    it('delega en repo.deleteLine con los parámetros correctos', async () => {
      vi.mocked(mockRepo.deleteLine).mockResolvedValue();

      await useCases.deleteLine('line-1');

      expect(mockRepo.deleteLine).toHaveBeenCalledWith('line-1');
    });
  });

  // ─── upsertAllocation ──────────────────────────────────────────────────────

  describe('upsertAllocation', () => {
    it('delega en repo.upsertAllocation con los parámetros correctos', async () => {
      vi.mocked(mockRepo.upsertAllocation).mockResolvedValue();
      const formValue = { quantityNeeded: 3, quantityThisOrder: 2 } as never;

      await useCases.upsertAllocation('line-1', 'user-1', formValue);

      expect(mockRepo.upsertAllocation).toHaveBeenCalledWith('line-1', 'user-1', formValue);
    });
  });

  // ─── getProducts ───────────────────────────────────────────────────────────

  describe('getProducts', () => {
    it('delega en repo.getProducts sin parámetros', async () => {
      vi.mocked(mockRepo.getProducts).mockResolvedValue([]);

      await useCases.getProducts();

      expect(mockRepo.getProducts).toHaveBeenCalledWith();
    });

    it('devuelve el resultado del repositorio', async () => {
      const products = [{ id: 'prod-1' }] as never;
      vi.mocked(mockRepo.getProducts).mockResolvedValue(products);

      const result = await useCases.getProducts();

      expect(result).toBe(products);
    });
  });

  // ─── createInvitation ──────────────────────────────────────────────────────

  describe('createInvitation', () => {
    it('delega en repo.createInvitation con los parámetros correctos', async () => {
      vi.mocked(mockRepo.createInvitation).mockResolvedValue('token-abc');

      await useCases.createInvitation('order-1');

      expect(mockRepo.createInvitation).toHaveBeenCalledWith('order-1');
    });

    it('devuelve el resultado del repositorio', async () => {
      vi.mocked(mockRepo.createInvitation).mockResolvedValue('token-abc');

      const result = await useCases.createInvitation('order-1');

      expect(result).toBe('token-abc');
    });
  });

  // ─── getInvitationByToken ──────────────────────────────────────────────────

  describe('getInvitationByToken', () => {
    it('delega en repo.getInvitationByToken con los parámetros correctos', async () => {
      vi.mocked(mockRepo.getInvitationByToken).mockResolvedValue(null);

      await useCases.getInvitationByToken('token-abc');

      expect(mockRepo.getInvitationByToken).toHaveBeenCalledWith('token-abc');
    });

    it('devuelve el resultado del repositorio cuando existe la invitación', async () => {
      const invitation = { id: 'inv-1', token: 'token-abc' } as never;
      vi.mocked(mockRepo.getInvitationByToken).mockResolvedValue(invitation);

      const result = await useCases.getInvitationByToken('token-abc');

      expect(result).toBe(invitation);
    });

    it('devuelve null cuando el repositorio devuelve null', async () => {
      vi.mocked(mockRepo.getInvitationByToken).mockResolvedValue(null);

      const result = await useCases.getInvitationByToken('token-inexistente');

      expect(result).toBeNull();
    });
  });

  // ─── acceptInvitation ──────────────────────────────────────────────────────

  describe('acceptInvitation', () => {
    it('delega en repo.acceptInvitation con los parámetros correctos', async () => {
      vi.mocked(mockRepo.acceptInvitation).mockResolvedValue('order-1');

      await useCases.acceptInvitation('token-abc', 'user-1');

      expect(mockRepo.acceptInvitation).toHaveBeenCalledWith('token-abc', 'user-1');
    });

    it('devuelve el resultado del repositorio', async () => {
      vi.mocked(mockRepo.acceptInvitation).mockResolvedValue('order-1');

      const result = await useCases.acceptInvitation('token-abc', 'user-1');

      expect(result).toBe('order-1');
    });
  });

  // ─── setMemberReady ────────────────────────────────────────────────────────

  describe('setMemberReady', () => {
    it('delega en repo.setMemberReady con los parámetros correctos', async () => {
      vi.mocked(mockRepo.setMemberReady).mockResolvedValue();

      await useCases.setMemberReady('order-1', 'user-1', true);

      expect(mockRepo.setMemberReady).toHaveBeenCalledWith('order-1', 'user-1', true);
    });

    it('pasa isReady=false correctamente al repositorio', async () => {
      vi.mocked(mockRepo.setMemberReady).mockResolvedValue();

      await useCases.setMemberReady('order-1', 'user-1', false);

      expect(mockRepo.setMemberReady).toHaveBeenCalledWith('order-1', 'user-1', false);
    });
  });

  // ─── subscribeToOrderMembers ───────────────────────────────────────────────

  describe('subscribeToOrderMembers', () => {
    it('delega en repo.subscribeToOrderMembers con los parámetros correctos', () => {
      const cleanup = vi.fn();
      vi.mocked(mockRepo.subscribeToOrderMembers).mockReturnValue(cleanup);
      const onChanged = vi.fn();

      useCases.subscribeToOrderMembers('order-1', onChanged);

      expect(mockRepo.subscribeToOrderMembers).toHaveBeenCalledWith('order-1', onChanged);
    });

    it('devuelve la función de limpieza del repositorio', () => {
      const cleanup = vi.fn();
      vi.mocked(mockRepo.subscribeToOrderMembers).mockReturnValue(cleanup);

      const result = useCases.subscribeToOrderMembers('order-1', vi.fn());

      expect(result).toBe(cleanup);
    });
  });

  // ─── subscribeToOrderLines ─────────────────────────────────────────────────

  describe('subscribeToOrderLines', () => {
    it('delega en repo.subscribeToOrderLines con los parámetros correctos', () => {
      const cleanup = vi.fn();
      vi.mocked(mockRepo.subscribeToOrderLines).mockReturnValue(cleanup);
      const onChanged = vi.fn();

      useCases.subscribeToOrderLines('order-1', onChanged);

      expect(mockRepo.subscribeToOrderLines).toHaveBeenCalledWith('order-1', onChanged);
    });

    it('devuelve la función de limpieza del repositorio', () => {
      const cleanup = vi.fn();
      vi.mocked(mockRepo.subscribeToOrderLines).mockReturnValue(cleanup);

      const result = useCases.subscribeToOrderLines('order-1', vi.fn());

      expect(result).toBe(cleanup);
    });
  });
});
