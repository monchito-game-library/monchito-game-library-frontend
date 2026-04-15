/** Row from the hardware_console_specs table in Supabase. */
export interface HardwareConsoleSpecsDto {
  model_id: string;
  launch_year: number;
  discontinued_year: number | null;
  category: 'home' | 'portable' | 'hybrid';
  media: 'optical_disc' | 'digital' | 'cartridge' | 'hybrid' | 'built_in';
  video_resolution: string | null;
  units_sold_million: number | null;
}
