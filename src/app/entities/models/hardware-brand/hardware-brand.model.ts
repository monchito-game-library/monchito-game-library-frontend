/** Domain model for a hardware brand (e.g. Sony, Microsoft, Nintendo). */
export interface HardwareBrandModel {
  /** Supabase UUID. */
  id: string;
  /** Human-readable brand name. */
  name: string;
}
