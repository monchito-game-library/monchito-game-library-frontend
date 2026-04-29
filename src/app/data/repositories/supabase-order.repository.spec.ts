import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { mockSupabase } from './supabase-mock';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

import { SupabaseOrderRepository } from './supabase-order.repository';

function makeBuilder(result: { data?: unknown; error: { message: string } | null }) {
  const b: any = {};
  for (const m of ['select', 'eq', 'order', 'insert', 'update', 'delete', 'upsert', 'single']) {
    b[m] = vi.fn().mockReturnValue(b);
  }
  b.then = (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject);
  return b;
}

describe('SupabaseOrderRepository', () => {
  let repo: SupabaseOrderRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: mockSupabase }, SupabaseOrderRepository]
    });
    repo = TestBed.inject(SupabaseOrderRepository);
  });

  describe('getAllForUser', () => {
    it('devuelve la lista de pedidos mapeados', async () => {
      const dto = {
        id: 'o-1',
        owner_id: 'u-1',
        title: 'Pedido test',
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        order_members: []
      };
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [dto], error: null }));

      const result = await repo.getAllForUser('u-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
      expect(result).toHaveLength(1);
    });

    it('devuelve [] si data es null', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: null }));
      expect(await repo.getAllForUser('u-1')).toEqual([]);
    });

    it('lanza error si Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'boom' } }));
      await expect(repo.getAllForUser('u-1')).rejects.toThrow('Failed to fetch orders');
    });
  });

  describe('getById', () => {
    it('combina la fila de orders con los miembros del RPC', async () => {
      const orderDto = {
        id: 'o-1',
        owner_id: 'u-1',
        title: 't',
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        order_lines: []
      };
      mockSupabase.from.mockReturnValue(makeBuilder({ data: orderDto, error: null }));
      mockSupabase.rpc.mockResolvedValue({ data: [{ user_id: 'u-1', role: 'owner' }], error: null });

      const result = await repo.getById('o-1');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_order_members_info', { p_order_id: 'o-1' });
      expect(result).toBeDefined();
    });

    it('lanza error si la query de orders falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'orders fail' } }));
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });
      await expect(repo.getById('o-1')).rejects.toThrow('Failed to fetch order');
    });

    it('lanza error si el RPC de members falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: { id: 'o-1' }, error: null }));
      mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'members fail' } });
      await expect(repo.getById('o-1')).rejects.toThrow('Failed to fetch order members');
    });

    it('usa [] cuando el RPC de members devuelve data null', async () => {
      const orderDto = { id: 'o-1', owner_id: 'u-1', order_lines: [] };
      mockSupabase.from.mockReturnValue(makeBuilder({ data: orderDto, error: null }));
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await repo.getById('o-1');

      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('crea el pedido y añade al owner como miembro', async () => {
      const orderBuilder = makeBuilder({ data: { id: 'new-id' }, error: null });
      const memberBuilder = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValueOnce(orderBuilder).mockReturnValueOnce(memberBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { user_metadata: { display_name: 'John' } } } });

      const id = await repo.create('u-1', { title: 'T', notes: 'N' } as any);

      expect(id).toBe('new-id');
      expect(orderBuilder.insert).toHaveBeenCalled();
      expect(memberBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ order_id: 'new-id', user_id: 'u-1', role: 'owner' })
      );
    });

    it('lanza error si la inserción del pedido falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'insert fail' } }));
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await expect(repo.create('u-1', { title: 'T', notes: null } as any)).rejects.toThrow('Failed to create order');
    });

    it('lanza error si añadir al owner como miembro falla', async () => {
      const orderBuilder = makeBuilder({ data: { id: 'new-id' }, error: null });
      const memberBuilder = makeBuilder({ error: { message: 'member fail' } });
      mockSupabase.from.mockReturnValueOnce(orderBuilder).mockReturnValueOnce(memberBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await expect(repo.create('u-1', { title: 'T', notes: null } as any)).rejects.toThrow(
        'Failed to add owner as member'
      );
    });
  });

  describe('update', () => {
    it('hace update del pedido eliminando los campos undefined', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.update('o-1', { title: 'New title' } as any);

      expect(b.update).toHaveBeenCalled();
      const payload = b.update.mock.calls[0][0];
      expect(payload.title).toBe('New title');
      expect(payload).not.toHaveProperty('notes');
    });

    it('lanza error si update falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'fail' } }));
      await expect(repo.update('o-1', { title: 'x' } as any)).rejects.toThrow('Failed to update order');
    });
  });

  describe('delete', () => {
    it('elimina el pedido por id', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.delete('o-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', 'o-1');
    });

    it('lanza error si delete falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'fail' } }));
      await expect(repo.delete('o-1')).rejects.toThrow('Failed to delete order');
    });
  });

  describe('addLine', () => {
    it('inserta la línea y devuelve el id', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: { id: 'line-1' }, error: null }));
      const id = await repo.addLine('o-1', 'u-1', { productId: 'p-1', quantityNeeded: 2, notes: null } as any);
      expect(id).toBe('line-1');
    });

    it('lanza error si la inserción falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'fail' } }));
      await expect(
        repo.addLine('o-1', 'u-1', { productId: 'p-1', quantityNeeded: 1, notes: null } as any)
      ).rejects.toThrow('Failed to add order line');
    });
  });

  describe('updateLine', () => {
    it('actualiza solo los campos definidos', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.updateLine('line-1', { unitPrice: 9.99 } as any);

      const payload = b.update.mock.calls[0][0];
      expect(payload.unit_price).toBe(9.99);
      expect(payload).not.toHaveProperty('quantity_ordered');
    });

    it('lanza error si update falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'fail' } }));
      await expect(repo.updateLine('line-1', {} as any)).rejects.toThrow('Failed to update order line');
    });
  });

  describe('deleteLine', () => {
    it('elimina la línea por id', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.deleteLine('line-1');

      expect(b.delete).toHaveBeenCalled();
      expect(b.eq).toHaveBeenCalledWith('id', 'line-1');
    });

    it('lanza error si delete falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'fail' } }));
      await expect(repo.deleteLine('line-1')).rejects.toThrow('Failed to delete order line');
    });
  });

  describe('upsertAllocation', () => {
    it('hace upsert con onConflict en (order_line_id, user_id)', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.upsertAllocation('line-1', 'u-1', { quantityNeeded: 2, quantityThisOrder: 1 } as any);

      expect(b.upsert).toHaveBeenCalledWith(expect.any(Object), { onConflict: 'order_line_id,user_id' });
    });

    it('asume 0 cuando los campos vienen sin valor', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      await repo.upsertAllocation('line-1', 'u-1', {} as any);

      const payload = b.upsert.mock.calls[0][0];
      expect(payload.quantity_needed).toBe(0);
      expect(payload.quantity_this_order).toBe(0);
    });

    it('lanza error si upsert falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'fail' } }));
      await expect(repo.upsertAllocation('line-1', 'u-1', {} as any)).rejects.toThrow('Failed to upsert allocation');
    });
  });

  describe('getProducts', () => {
    it('devuelve los productos activos mapeados', async () => {
      const productDto = { id: 'p-1', name: 'Pack BR', category: 'protector', notes: null, packs: [] };
      mockSupabase.from.mockReturnValue(makeBuilder({ data: [productDto], error: null }));

      const result = await repo.getProducts();

      expect(result).toHaveLength(1);
    });

    it('lanza error si la query falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'fail' } }));
      await expect(repo.getProducts()).rejects.toThrow('Failed to fetch products');
    });

    it('devuelve [] cuando data es null sin error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: null }));
      expect(await repo.getProducts()).toEqual([]);
    });
  });

  describe('createInvitation', () => {
    it('genera token UUID y lo persiste', async () => {
      const b = makeBuilder({ error: null });
      mockSupabase.from.mockReturnValue(b);

      const token = await repo.createInvitation('o-1');

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
      expect(b.insert).toHaveBeenCalledWith(expect.objectContaining({ order_id: 'o-1' }));
    });

    it('lanza error si la inserción falla', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ error: { message: 'fail' } }));
      await expect(repo.createInvitation('o-1')).rejects.toThrow('Failed to create invitation');
    });
  });

  describe('getInvitationByToken', () => {
    it('devuelve la invitación cuando existe y no ha expirado', async () => {
      const dto = {
        id: 'inv-1',
        order_id: 'o-1',
        token: 'abc',
        expires_at: '2099-01-01T00:00:00Z',
        orders: { title: 't', created_at: 'x', order_date: null, order_members: [] }
      };
      mockSupabase.from.mockReturnValue(makeBuilder({ data: dto, error: null }));

      const result = await repo.getInvitationByToken('abc');

      expect(result).not.toBeNull();
    });

    it('devuelve null si Supabase devuelve error', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'fail' } }));
      expect(await repo.getInvitationByToken('abc')).toBeNull();
    });

    it('devuelve null si la invitación ha expirado', async () => {
      const dto = {
        id: 'inv-1',
        order_id: 'o-1',
        token: 'abc',
        expires_at: '2000-01-01T00:00:00Z',
        orders: { title: 't', created_at: 'x', order_date: null, order_members: [] }
      };
      mockSupabase.from.mockReturnValue(makeBuilder({ data: dto, error: null }));
      expect(await repo.getInvitationByToken('abc')).toBeNull();
    });
  });

  describe('acceptInvitation', () => {
    it('lanza error si la invitación no existe', async () => {
      mockSupabase.from.mockReturnValue(makeBuilder({ data: null, error: { message: 'fail' } }));
      await expect(repo.acceptInvitation('abc', 'u-1')).rejects.toThrow('Invitation not found or expired');
    });

    it('añade al usuario como miembro y marca el token como usado', async () => {
      const inviteDto = {
        id: 'inv-1',
        order_id: 'o-1',
        token: 'abc',
        expires_at: '2099-01-01T00:00:00Z',
        orders: { title: 't', created_at: 'x', order_date: null, order_members: [] }
      };
      const inviteBuilder = makeBuilder({ data: inviteDto, error: null });
      const memberBuilder = makeBuilder({ error: null });
      const updateBuilder = makeBuilder({ error: null });
      mockSupabase.from
        .mockReturnValueOnce(inviteBuilder)
        .mockReturnValueOnce(memberBuilder)
        .mockReturnValueOnce(updateBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { user_metadata: { display_name: 'Alice' } } } });

      const orderId = await repo.acceptInvitation('abc', 'u-1');

      expect(orderId).toBe('o-1');
      expect(memberBuilder.insert).toHaveBeenCalled();
      expect(updateBuilder.update).toHaveBeenCalledWith({ used_by: 'u-1' });
    });

    it('lanza error si memberError no es de duplicado', async () => {
      const inviteDto = {
        id: 'inv-1',
        order_id: 'o-1',
        token: 'abc',
        expires_at: '2099-01-01T00:00:00Z',
        orders: { title: 't', created_at: 'x', order_date: null, order_members: [] }
      };
      const inviteBuilder = makeBuilder({ data: inviteDto, error: null });
      const memberBuilder = makeBuilder({ error: { message: 'permission denied' } });
      mockSupabase.from.mockReturnValueOnce(inviteBuilder).mockReturnValueOnce(memberBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await expect(repo.acceptInvitation('abc', 'u-1')).rejects.toThrow('Failed to join order');
    });

    it('ignora errores de duplicado al insertar al miembro', async () => {
      const inviteDto = {
        id: 'inv-1',
        order_id: 'o-1',
        token: 'abc',
        expires_at: '2099-01-01T00:00:00Z',
        orders: { title: 't', created_at: 'x', order_date: null, order_members: [] }
      };
      const inviteBuilder = makeBuilder({ data: inviteDto, error: null });
      const memberBuilder = makeBuilder({ error: { message: 'duplicate key violation' } });
      const updateBuilder = makeBuilder({ error: null });
      mockSupabase.from
        .mockReturnValueOnce(inviteBuilder)
        .mockReturnValueOnce(memberBuilder)
        .mockReturnValueOnce(updateBuilder);
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      await expect(repo.acceptInvitation('abc', 'u-1')).resolves.toBe('o-1');
    });
  });

  describe('setMemberReady', () => {
    it('llama al RPC con los parámetros correctos', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: null });

      await repo.setMemberReady('o-1', 'u-1', true);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('set_member_ready', {
        p_order_id: 'o-1',
        p_user_id: 'u-1',
        p_is_ready: true
      });
    });

    it('lanza error si el RPC falla', async () => {
      mockSupabase.rpc.mockResolvedValue({ error: { message: 'fail' } });
      await expect(repo.setMemberReady('o-1', 'u-1', false)).rejects.toThrow('Failed to update member ready state');
    });
  });

  describe('subscribeToOrderMembers', () => {
    it('crea un canal, registra el handler y devuelve una función de cleanup', () => {
      const channel: any = {};
      channel.on = vi.fn().mockReturnValue(channel);
      channel.subscribe = vi.fn().mockReturnValue(channel);
      (mockSupabase as any).channel = vi.fn().mockReturnValue(channel);
      (mockSupabase as any).removeChannel = vi.fn();
      const onChanged = vi.fn();

      const cleanup = repo.subscribeToOrderMembers('o-1', onChanged);

      expect((mockSupabase as any).channel).toHaveBeenCalledWith('order-o-1');
      expect(channel.subscribe).toHaveBeenCalled();

      // Invoca manualmente el handler registrado en .on(...) para cubrir la callback inline.
      const handler = channel.on.mock.calls[0][2];
      handler({});
      expect(onChanged).toHaveBeenCalled();

      cleanup();
      expect((mockSupabase as any).removeChannel).toHaveBeenCalledWith(channel);
    });
  });

  describe('subscribeToOrderLines', () => {
    it('crea un canal, registra el handler y devuelve una función de cleanup', () => {
      const channel: any = {};
      channel.on = vi.fn().mockReturnValue(channel);
      channel.subscribe = vi.fn().mockReturnValue(channel);
      (mockSupabase as any).channel = vi.fn().mockReturnValue(channel);
      (mockSupabase as any).removeChannel = vi.fn();
      const onChanged = vi.fn();

      const cleanup = repo.subscribeToOrderLines('o-1', onChanged);

      expect((mockSupabase as any).channel).toHaveBeenCalledWith('order-lines-o-1');

      const handler = channel.on.mock.calls[0][2];
      handler({});
      expect(onChanged).toHaveBeenCalled();

      cleanup();
      expect((mockSupabase as any).removeChannel).toHaveBeenCalledWith(channel);
    });
  });
});
