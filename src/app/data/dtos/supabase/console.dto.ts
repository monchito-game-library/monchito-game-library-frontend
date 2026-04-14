/** Row from the user_consoles table. */
export interface ConsoleDto {
  id: string;
  user_id: string;
  brand_id: string;
  model_id: string;
  edition_id: string | null;
  region: string | null;
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

/** Payload for inserting a row in user_consoles. */
export interface ConsoleInsertDto {
  user_id: string;
  brand_id: string;
  model_id: string;
  edition_id: string | null;
  region: string | null;
  condition: string;
  price: number | null;
  store: string | null;
  purchase_date: string | null;
  notes: string | null;
}

/** Payload for updating an existing user_consoles row. */
export type ConsoleUpdateDto = Partial<Omit<ConsoleInsertDto, 'user_id'>>;
