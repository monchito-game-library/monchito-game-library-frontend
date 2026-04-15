/** Row from the hardware_loans table. */
export interface HardwareLoanDto {
  id: string;
  item_type: 'console' | 'controller';
  user_item_id: string;
  loaned_to: string;
  loaned_at: string;
  returned_at: string | null;
  created_at: string;
}

/** Payload for inserting a row in hardware_loans. */
export type HardwareLoanInsertDto = Pick<HardwareLoanDto, 'item_type' | 'user_item_id' | 'loaned_to' | 'loaned_at'>;
