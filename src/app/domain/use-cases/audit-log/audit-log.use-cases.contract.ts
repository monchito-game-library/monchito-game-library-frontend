import { InjectionToken } from '@angular/core';

import { AuditLogModel } from '@/models/audit-log/audit-log.model';
import { AuditLogInsertDto } from '@/dtos/audit-log/audit-log-insert.dto';

export interface AuditLogUseCasesContract {
  getRecentLogs(limit?: number): Promise<AuditLogModel[]>;
  log(entry: AuditLogInsertDto): Promise<void>;
}

export const AUDIT_LOG_USE_CASES = new InjectionToken<AuditLogUseCasesContract>('AUDIT_LOG_USE_CASES');
