/** Domain model for a hardware edition (e.g. Final Fantasy XVI Limited Edition). */
export interface HardwareEditionModel {
  /** Supabase UUID. */
  id: string;
  /** UUID of the parent hardware model. */
  modelId: string;
  /** Human-readable edition name. */
  name: string;
}
