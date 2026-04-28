/** Row from the hardware_models table in Supabase. */
export interface HardwareModelDto {
  id: string;
  brand_id: string;
  name: string;
  type: 'console' | 'controller';
  generation: number | null;
  /** Present only when the query includes hardware_console_specs(category).
     Supabase returns a single object (not an array) because model_id is the PK (1:1). */
  hardware_console_specs?: { category: 'home' | 'portable' | 'hybrid' } | null;
  created_at?: string;
  updated_at?: string;
}

/** Payload for inserting a row in hardware_models. */
export type HardwareModelInsertDto = Pick<HardwareModelDto, 'brand_id' | 'name' | 'type' | 'generation'>;
