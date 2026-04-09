/** All valid lifecycle statuses for a group order. */
export const ORDER_STATUS = {
  DRAFT: 'draft',
  SELECTING_PACKS: 'selecting_packs',
  ORDERING: 'ordering',
  ORDERED: 'ordered',
  RECEIVED: 'received'
} as const;
