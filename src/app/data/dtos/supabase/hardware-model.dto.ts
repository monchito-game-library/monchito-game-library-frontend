/** Row from the hardware_models table in Supabase. */
export interface HardwareModelDto {
  id: string;
  brand_id: string;
  name: string;
  type: 'console' | 'controller';
  generation: number | null;
  created_at?: string;
  updated_at?: string;
}

/** Payload for inserting a row in hardware_models. */
export type HardwareModelInsertDto = Pick<HardwareModelDto, 'brand_id' | 'name' | 'type' | 'generation'>;
