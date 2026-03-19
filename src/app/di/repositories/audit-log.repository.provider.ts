import { Provider } from '@angular/core';

import { AUDIT_LOG_REPOSITORY } from '@/domain/repositories/audit-log.repository.contract';
import { SupabaseAuditLogRepository } from '@/data/repositories/supabase-audit-log.repository';

export const auditLogRepositoryProvider: Provider = {
  provide: AUDIT_LOG_REPOSITORY,
  useClass: SupabaseAuditLogRepository
};
