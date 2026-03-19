export interface AuditLogModel {
  id: string;
  performedBy: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
  createdAt: string;
}
