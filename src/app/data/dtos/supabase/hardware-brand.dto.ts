/** Row from the hardware_brands table in Supabase. */
export interface HardwareBrandDto {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/** Payload for inserting a row in hardware_brands. */
export type HardwareBrandInsertDto = Pick<HardwareBrandDto, 'name'>;
