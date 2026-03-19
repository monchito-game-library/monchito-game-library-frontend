export interface AuditLogInsertDto {
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
}
