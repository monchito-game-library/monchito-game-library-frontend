/** Row from the admin_audit_log table in Supabase. */
export interface AuditLogRowDto {
  id: string;
  performed_by: string;
  performed_by_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  created_at: string;
}

/** Payload for inserting a row into admin_audit_log. */
export type AuditLogInsertRowDto = Omit<AuditLogRowDto, 'id' | 'created_at'>;
