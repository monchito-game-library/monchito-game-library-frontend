/** Row from the hardware_editions table in Supabase. */
export interface HardwareEditionDto {
  id: string;
  model_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/** Payload for inserting a row in hardware_editions. */
export type HardwareEditionInsertDto = Pick<HardwareEditionDto, 'model_id' | 'name'>;

/** Payload for updating a row in hardware_editions. */
export type HardwareEditionUpdateDto = Partial<Pick<HardwareEditionDto, 'name'>>;
