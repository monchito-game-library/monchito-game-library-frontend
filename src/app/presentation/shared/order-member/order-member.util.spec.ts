import { describe, expect, it } from 'vitest';

import { allMembersReady, readyCount, sortedMembers } from './order-member.util';
import { OrderMemberModel } from '@/models/order/order-member.model';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function member(overrides: Partial<OrderMemberModel> = {}): OrderMemberModel {
  return {
    id: 'm1',
    orderId: 'order-1',
    userId: 'user-1',
    role: 'member',
    displayName: 'Test User',
    email: 'test@example.com',
    avatarUrl: null,
    isReady: false,
    joinedAt: '2024-01-01',
    ...overrides
  };
}

function owner(overrides: Partial<OrderMemberModel> = {}): OrderMemberModel {
  return member({ userId: 'owner-1', role: 'owner', isReady: true, ...overrides });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('sortedMembers', () => {
  it('el owner aparece en primera posición aunque esté al final del array', () => {
    const m1 = member({ userId: 'u1' });
    const m2 = member({ userId: 'u2' });
    const o = owner({ userId: 'owner' });
    const result = sortedMembers([m1, m2, o]);
    expect(result[0].role).toBe('owner');
  });

  it('el owner aparece en primera posición aunque esté en el medio del array', () => {
    const m1 = member({ userId: 'u1' });
    const o = owner({ userId: 'owner' });
    const m2 = member({ userId: 'u2' });
    const result = sortedMembers([m1, o, m2]);
    expect(result[0].userId).toBe('owner');
  });

  it('devuelve el mismo array cuando solo hay un owner', () => {
    const o = owner();
    const result = sortedMembers([o]);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('owner');
  });

  it('no muta el array original', () => {
    const members = [member({ userId: 'u1' }), owner()];
    const originalOrder = [...members].map((m) => m.userId);
    sortedMembers(members);
    expect(members.map((m) => m.userId)).toEqual(originalOrder);
  });

  it('devuelve array vacío cuando la entrada es vacía', () => {
    expect(sortedMembers([])).toEqual([]);
  });

  it('mantiene el orden relativo de los non-owner entre sí', () => {
    const m1 = member({ userId: 'u1' });
    const m2 = member({ userId: 'u2' });
    const o = owner();
    const result = sortedMembers([m1, m2, o]);
    expect(result[1].userId).toBe('u1');
    expect(result[2].userId).toBe('u2');
  });
});

describe('allMembersReady', () => {
  it('devuelve true cuando no hay miembros invitados (solo owner)', () => {
    expect(allMembersReady([owner()])).toBe(true);
  });

  it('devuelve true cuando no hay miembros en absoluto', () => {
    expect(allMembersReady([])).toBe(true);
  });

  it('devuelve true cuando todos los invitados tienen isReady = true', () => {
    const members = [owner(), member({ userId: 'u1', isReady: true }), member({ userId: 'u2', isReady: true })];
    expect(allMembersReady(members)).toBe(true);
  });

  it('devuelve false cuando al menos un invitado tiene isReady = false', () => {
    const members = [owner(), member({ userId: 'u1', isReady: true }), member({ userId: 'u2', isReady: false })];
    expect(allMembersReady(members)).toBe(false);
  });

  it('devuelve false cuando el único invitado no está listo', () => {
    const members = [owner(), member({ isReady: false })];
    expect(allMembersReady(members)).toBe(false);
  });

  it('no cuenta al owner para determinar si todos están listos', () => {
    const o = owner({ isReady: false });
    const m = member({ isReady: true });
    expect(allMembersReady([o, m])).toBe(true);
  });
});

describe('readyCount', () => {
  it('devuelve { ready: 0, total: 0 } cuando solo hay owner', () => {
    expect(readyCount([owner()])).toEqual({ ready: 0, total: 0 });
  });

  it('devuelve { ready: 0, total: 0 } cuando no hay miembros', () => {
    expect(readyCount([])).toEqual({ ready: 0, total: 0 });
  });

  it('cuenta correctamente el total de invitados', () => {
    const members = [owner(), member({ userId: 'u1' }), member({ userId: 'u2' }), member({ userId: 'u3' })];
    expect(readyCount(members).total).toBe(3);
  });

  it('cuenta correctamente los invitados listos', () => {
    const members = [
      owner(),
      member({ userId: 'u1', isReady: true }),
      member({ userId: 'u2', isReady: false }),
      member({ userId: 'u3', isReady: true })
    ];
    expect(readyCount(members).ready).toBe(2);
  });

  it('devuelve { ready: 0, total: 1 } cuando el único invitado no está listo', () => {
    expect(readyCount([owner(), member({ isReady: false })])).toEqual({ ready: 0, total: 1 });
  });

  it('devuelve { ready: 1, total: 1 } cuando el único invitado está listo', () => {
    expect(readyCount([owner(), member({ isReady: true })])).toEqual({ ready: 1, total: 1 });
  });

  it('no cuenta al owner en ninguno de los contadores', () => {
    const o = owner({ isReady: true });
    const m = member({ isReady: false });
    const result = readyCount([o, m]);
    expect(result.total).toBe(1);
    expect(result.ready).toBe(0);
  });
});
