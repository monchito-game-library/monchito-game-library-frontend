/** Row from the user_consoles table. */
export interface ConsoleDto {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  region: string | null;
  condition: string;
  price: number | null;
  store: string | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
}

/** Payload for inserting a row in user_consoles. */
export interface ConsoleInsertDto {
  user_id: string;
  brand: string;
  model: string;
  region: string | null;
  condition: string;
  price: number | null;
  store: string | null;
  purchase_date: string | null;
  notes: string | null;
}

/** Payload for updating an existing user_consoles row. */
export type ConsoleUpdateDto = Partial<Omit<ConsoleInsertDto, 'user_id'>>;
