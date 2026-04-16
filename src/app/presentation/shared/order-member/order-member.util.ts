import { OrderMemberModel } from '@/models/order/order-member.model';

/**
 * Returns the members list sorted so the owner always appears first.
 *
 * @param {OrderMemberModel[]} members - Members of the order
 */
export function sortedMembers(members: OrderMemberModel[]): OrderMemberModel[] {
  return [...members].sort((a, b) => (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : 0));
}

/**
 * Returns true when all non-owner members have marked their selection as ready.
 * If there are no invited members, returns true.
 *
 * @param {OrderMemberModel[]} members - Members of the order
 */
export function allMembersReady(members: OrderMemberModel[]): boolean {
  const invited: OrderMemberModel[] = members.filter((m) => m.role !== 'owner');
  return invited.length === 0 || invited.every((m) => m.isReady);
}

/**
 * Returns the count of non-owner members who have marked ready out of the total invited.
 *
 * @param {OrderMemberModel[]} members - Members of the order
 */
export function readyCount(members: OrderMemberModel[]): { ready: number; total: number } {
  const invited: OrderMemberModel[] = members.filter((m) => m.role !== 'owner');
  return { ready: invited.filter((m) => m.isReady).length, total: invited.length };
}
