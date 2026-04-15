/** Payload used to create a hardware loan (console or controller). */
export interface HardwareLoanStatusModel {
  userItemId: string;
  itemType: 'console' | 'controller';
  loanedTo: string;
  loanedAt: string;
}
