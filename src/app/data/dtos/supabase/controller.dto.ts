/** Row from the user_controllers table. */
export interface ControllerDto {
  id: string;
  user_id: string;
  brand_id: string;
  model_id: string;
  edition_id: string | null;
  color: string;
  compatibility: string;
  condition: string;
  price: number | null;
  store: string | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  for_sale: boolean;
  sale_price: number | null;
  sold_at: string | null;
  sold_price_final: number | null;
  active_loan_id: string | null;
  active_loan_to: string | null;
  active_loan_at: string | null;
}

/** Payload for inserting a row in user_controllers. */
export interface ControllerInsertDto {
  user_id: string;
  brand_id: string;
  model_id: string;
  edition_id: string | null;
  color: string;
  compatibility: string;
  condition: string;
  price: number | null;
  store: string | null;
  purchase_date: string | null;
  notes: string | null;
}

/** Payload for updating an existing user_controllers row. */
export type ControllerUpdateDto = Partial<Omit<ControllerInsertDto, 'user_id'>>;
