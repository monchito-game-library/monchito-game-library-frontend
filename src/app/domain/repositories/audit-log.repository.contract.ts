import { InjectionToken } from '@angular/core';

import { AuditLogModel } from '@/models/audit-log/audit-log.model';
import { AuditLogInsertDto } from '@/dtos/audit-log/audit-log-insert.dto';

export interface AuditLogRepositoryContract {
  getRecentLogs(limit?: number): Promise<AuditLogModel[]>;
  insertLog(entry: AuditLogInsertDto): Promise<void>;
}

export const AUDIT_LOG_REPOSITORY = new InjectionToken<AuditLogRepositoryContract>('AUDIT_LOG_REPOSITORY');
