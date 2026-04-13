/** Row from the user_controllers table. */
export interface ControllerDto {
  id: string;
  user_id: string;
  model: string;
  edition: string | null;
  color: string;
  compatibility: string;
  condition: string;
  price: number | null;
  store: string | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
}

/** Payload for inserting a row in user_controllers. */
export interface ControllerInsertDto {
  user_id: string;
  model: string;
  edition: string | null;
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
