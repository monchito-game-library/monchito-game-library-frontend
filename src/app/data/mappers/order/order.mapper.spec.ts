import { describe, expect, it } from 'vitest';

import {
  mapOrderLineAllocation,
  mapOrderLine,
  mapOrderMember,
  mapOrder,
  mapOrderSummary,
  mapOrderProduct,
  mapOrderInvitation
} from './order.mapper';
import {
  OrderLineAllocationDto,
  OrderLineDto,
  OrderMemberDto,
  OrderDetailDto,
  OrderSummaryDto,
  OrderProductDto,
  OrderInvitationDto
} from '@/dtos/supabase/order.dto';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const allocationDto: OrderLineAllocationDto = {
  id: 'alloc-1',
  order_line_id: 'line-1',
  user_id: 'user-1',
  quantity_needed: 5,
  quantity_this_order: 3
};

const packA = { url: 'https://example.com/packA', price: 10, quantity: 5 };
const packB = { url: 'https://example.com/packB', price: 18, quantity: 10 };

const orderLineDto: OrderLineDto = {
  id: 'line-1',
  order_id: 'order-1',
  product_id: 'prod-1',
  requested_by: 'user-1',
  quantity_needed: 10,
  unit_price: 2.5,
  pack_chosen: 10,
  quantity_ordered: 1,
  notes: 'sin notas',
  created_at: '2025-01-01T00:00:00Z',
  order_products: {
    name: 'Producto A',
    category: 'miniaturas',
    packs: [packA, packB]
  },
  order_line_allocations: [allocationDto]
};

const orderMemberDto: OrderMemberDto = {
  id: 'member-1',
  order_id: 'order-1',
  user_id: 'user-1',
  role: 'owner',
  joined_at: '2025-01-01T00:00:00Z',
  display_name: 'Alice',
  email: 'alice@example.com',
  avatar_url: 'https://example.com/avatar.png',
  is_ready: true
};

const orderDetailDto: OrderDetailDto = {
  id: 'order-1',
  owner_id: 'user-1',
  title: 'Pedido enero',
  status: 'draft',
  order_date: '2025-03-01',
  received_date: null,
  shipping_cost: 12.5,
  paypal_fee: 2.0,
  discount_amount: 5,
  discount_type: 'percentage',
  notes: 'Notas generales',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
  order_members: [orderMemberDto],
  order_lines: [orderLineDto]
};

const orderSummaryDto: OrderSummaryDto = {
  id: 'order-1',
  owner_id: 'user-1',
  title: 'Pedido enero',
  status: 'draft',
  order_date: '2025-03-01',
  received_date: null,
  shipping_cost: null,
  paypal_fee: null,
  discount_amount: null,
  discount_type: 'amount',
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-02T00:00:00Z',
  order_members: [{ id: 'member-1' }, { id: 'member-2' }]
};

const orderProductDto: OrderProductDto = {
  id: 'prod-1',
  name: 'Producto A',
  category: 'miniaturas',
  notes: 'Notas del producto',
  packs: [packB, packA] // desordenados a propósito
};

const orderInvitationDto: OrderInvitationDto = {
  id: 'inv-1',
  order_id: 'order-1',
  token: 'abc123',
  expires_at: '2025-12-31T23:59:59Z',
  used_by: null,
  created_at: '2025-06-01T00:00:00Z',
  orders: {
    title: 'Pedido enero',
    created_at: '2025-01-01T00:00:00Z',
    order_date: '2025-03-01',
    order_members: [{ id: 'member-1' }, { id: 'member-2' }]
  }
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('order.mapper', () => {
  describe('mapOrderLineAllocation', () => {
    it('mapea todos los campos correctamente', () => {
      const model = mapOrderLineAllocation(allocationDto);

      expect(model.id).toBe('alloc-1');
      expect(model.orderLineId).toBe('line-1');
      expect(model.userId).toBe('user-1');
      expect(model.quantityNeeded).toBe(5);
      expect(model.quantityThisOrder).toBe(3);
    });
  });

  describe('mapOrderLine', () => {
    it('mapea los campos directos correctamente', () => {
      const model = mapOrderLine(orderLineDto);

      expect(model.id).toBe('line-1');
      expect(model.orderId).toBe('order-1');
      expect(model.productId).toBe('prod-1');
      expect(model.requestedBy).toBe('user-1');
      expect(model.quantityNeeded).toBe(10);
      expect(model.unitPrice).toBe(2.5);
      expect(model.packChosen).toBe(10);
      expect(model.quantityOrdered).toBe(1);
      expect(model.notes).toBe('sin notas');
      expect(model.createdAt).toBe('2025-01-01T00:00:00Z');
    });

    it('productName proviene de dto.order_products.name', () => {
      const model = mapOrderLine(orderLineDto);
      expect(model.productName).toBe('Producto A');
    });

    it('productCategory proviene de dto.order_products.category', () => {
      const model = mapOrderLine(orderLineDto);
      expect(model.productCategory).toBe('miniaturas');
    });

    it('productUrl es la URL del primer pack cuando hay packs', () => {
      const model = mapOrderLine(orderLineDto);
      expect(model.productUrl).toBe('https://example.com/packA');
    });

    it('productUrl es null cuando packs está vacío', () => {
      const dto: OrderLineDto = {
        ...orderLineDto,
        order_products: { name: 'Producto A', category: 'miniaturas', packs: [] }
      };
      const model = mapOrderLine(dto);
      expect(model.productUrl).toBeNull();
    });

    it('productUrl es null cuando packs es undefined', () => {
      const dto = {
        ...orderLineDto,
        order_products: { name: 'Producto A', category: 'miniaturas', packs: undefined as never }
      };
      const model = mapOrderLine(dto);
      expect(model.productUrl).toBeNull();
    });

    it('mapea el array de allocations correctamente', () => {
      const model = mapOrderLine(orderLineDto);

      expect(model.allocations).toHaveLength(1);
      expect(model.allocations[0].id).toBe('alloc-1');
    });

    it('allocations es [] cuando order_line_allocations está vacío', () => {
      const dto: OrderLineDto = { ...orderLineDto, order_line_allocations: [] };
      const model = mapOrderLine(dto);

      expect(model.allocations).toEqual([]);
    });
  });

  describe('mapOrderMember', () => {
    it('mapea todos los campos correctamente', () => {
      const model = mapOrderMember(orderMemberDto);

      expect(model.id).toBe('member-1');
      expect(model.orderId).toBe('order-1');
      expect(model.userId).toBe('user-1');
      expect(model.displayName).toBe('Alice');
      expect(model.email).toBe('alice@example.com');
      expect(model.avatarUrl).toBe('https://example.com/avatar.png');
      expect(model.role).toBe('owner');
      expect(model.isReady).toBe(true);
      expect(model.joinedAt).toBe('2025-01-01T00:00:00Z');
    });

    it('isReady es false cuando el miembro no está listo', () => {
      const dto: OrderMemberDto = { ...orderMemberDto, is_ready: false };
      const model = mapOrderMember(dto);
      expect(model.isReady).toBe(false);
    });

    it('displayName y avatarUrl pueden ser null', () => {
      const dto: OrderMemberDto = { ...orderMemberDto, display_name: null, avatar_url: null };
      const model = mapOrderMember(dto);
      expect(model.displayName).toBeNull();
      expect(model.avatarUrl).toBeNull();
    });
  });

  describe('mapOrder', () => {
    it('mapea todos los campos del header correctamente', () => {
      const model = mapOrder(orderDetailDto);

      expect(model.id).toBe('order-1');
      expect(model.ownerId).toBe('user-1');
      expect(model.title).toBe('Pedido enero');
      expect(model.status).toBe('draft');
      expect(model.orderDate).toBe('2025-03-01');
      expect(model.receivedDate).toBeNull();
      expect(model.shippingCost).toBe(12.5);
      expect(model.paypalFee).toBe(2.0);
      expect(model.discountAmount).toBe(5);
      expect(model.discountType).toBe('percentage');
      expect(model.notes).toBe('Notas generales');
      expect(model.createdAt).toBe('2025-01-01T00:00:00Z');
      expect(model.updatedAt).toBe('2025-01-02T00:00:00Z');
    });

    it('mapea el array de members correctamente', () => {
      const model = mapOrder(orderDetailDto);

      expect(model.members).toHaveLength(1);
      expect(model.members[0].id).toBe('member-1');
    });

    it('mapea el array de lines correctamente', () => {
      const model = mapOrder(orderDetailDto);

      expect(model.lines).toHaveLength(1);
      expect(model.lines[0].id).toBe('line-1');
    });

    it('members es [] cuando order_members está vacío', () => {
      const dto: OrderDetailDto = { ...orderDetailDto, order_members: [] };
      const model = mapOrder(dto);
      expect(model.members).toEqual([]);
    });

    it('lines es [] cuando order_lines está vacío', () => {
      const dto: OrderDetailDto = { ...orderDetailDto, order_lines: [] };
      const model = mapOrder(dto);
      expect(model.lines).toEqual([]);
    });
  });

  describe('mapOrderSummary', () => {
    it('mapea todos los campos correctamente', () => {
      const model = mapOrderSummary(orderSummaryDto);

      expect(model.id).toBe('order-1');
      expect(model.ownerId).toBe('user-1');
      expect(model.title).toBe('Pedido enero');
      expect(model.status).toBe('draft');
      expect(model.orderDate).toBe('2025-03-01');
      expect(model.createdAt).toBe('2025-01-01T00:00:00Z');
    });

    it('memberCount es la longitud del array order_members', () => {
      const model = mapOrderSummary(orderSummaryDto);
      expect(model.memberCount).toBe(2);
    });

    it('memberCount es 0 cuando order_members está vacío', () => {
      const dto: OrderSummaryDto = { ...orderSummaryDto, order_members: [] };
      const model = mapOrderSummary(dto);
      expect(model.memberCount).toBe(0);
    });

    it('memberCount es 0 cuando order_members es undefined', () => {
      const dto = { ...orderSummaryDto, order_members: undefined as never };
      const model = mapOrderSummary(dto);
      expect(model.memberCount).toBe(0);
    });
  });

  describe('mapOrderProduct', () => {
    it('mapea todos los campos correctamente', () => {
      const model = mapOrderProduct(orderProductDto);

      expect(model.id).toBe('prod-1');
      expect(model.name).toBe('Producto A');
      expect(model.category).toBe('miniaturas');
      expect(model.notes).toBe('Notas del producto');
    });

    it('packs están ordenados de menor a mayor quantity', () => {
      const model = mapOrderProduct(orderProductDto);

      expect(model.packs[0].quantity).toBe(5);
      expect(model.packs[1].quantity).toBe(10);
    });

    it('no muta el array original de packs', () => {
      const originalOrder = orderProductDto.packs.map((p) => p.quantity);
      mapOrderProduct(orderProductDto);
      const afterOrder = orderProductDto.packs.map((p) => p.quantity);
      expect(afterOrder).toEqual(originalOrder);
    });

    it('packs es [] cuando el dto tiene packs vacío', () => {
      const dto: OrderProductDto = { ...orderProductDto, packs: [] };
      const model = mapOrderProduct(dto);
      expect(model.packs).toEqual([]);
    });

    it('packs es [] cuando el dto tiene packs undefined', () => {
      const dto = { ...orderProductDto, packs: undefined as never };
      const model = mapOrderProduct(dto);
      expect(model.packs).toEqual([]);
    });
  });

  describe('mapOrderInvitation', () => {
    it('mapea todos los campos correctamente cuando orders está presente', () => {
      const model = mapOrderInvitation(orderInvitationDto);

      expect(model.id).toBe('inv-1');
      expect(model.orderId).toBe('order-1');
      expect(model.token).toBe('abc123');
      expect(model.expiresAt).toBe('2025-12-31T23:59:59Z');
      expect(model.usedBy).toBeNull();
      expect(model.createdAt).toBe('2025-06-01T00:00:00Z');
    });

    it('orderTitle proviene de orders.title cuando orders no es null', () => {
      const model = mapOrderInvitation(orderInvitationDto);
      expect(model.orderTitle).toBe('Pedido enero');
    });

    it('orderTitle es null cuando orders es null', () => {
      const dto: OrderInvitationDto = { ...orderInvitationDto, orders: null };
      const model = mapOrderInvitation(dto);
      expect(model.orderTitle).toBeNull();
    });

    it('orderCreatedAt usa orders.created_at cuando orders está disponible', () => {
      const model = mapOrderInvitation(orderInvitationDto);
      expect(model.orderCreatedAt).toBe('2025-01-01T00:00:00Z');
    });

    it('orderCreatedAt usa dto.created_at cuando orders es null', () => {
      const dto: OrderInvitationDto = { ...orderInvitationDto, orders: null };
      const model = mapOrderInvitation(dto);
      expect(model.orderCreatedAt).toBe('2025-06-01T00:00:00Z');
    });

    it('orderDate proviene de orders.order_date cuando orders está disponible', () => {
      const model = mapOrderInvitation(orderInvitationDto);
      expect(model.orderDate).toBe('2025-03-01');
    });

    it('orderDate es null cuando orders es null', () => {
      const dto: OrderInvitationDto = { ...orderInvitationDto, orders: null };
      const model = mapOrderInvitation(dto);
      expect(model.orderDate).toBeNull();
    });

    it('orderMemberCount es la longitud de orders.order_members', () => {
      const model = mapOrderInvitation(orderInvitationDto);
      expect(model.orderMemberCount).toBe(2);
    });

    it('orderMemberCount es 0 cuando orders es null', () => {
      const dto: OrderInvitationDto = { ...orderInvitationDto, orders: null };
      const model = mapOrderInvitation(dto);
      expect(model.orderMemberCount).toBe(0);
    });

    it('orderMemberCount es 0 cuando orders.order_members está vacío', () => {
      const dto: OrderInvitationDto = {
        ...orderInvitationDto,
        orders: { ...orderInvitationDto.orders!, order_members: [] }
      };
      const model = mapOrderInvitation(dto);
      expect(model.orderMemberCount).toBe(0);
    });
  });
});
