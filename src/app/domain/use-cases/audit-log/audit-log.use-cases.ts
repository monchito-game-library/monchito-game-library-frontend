import { inject, Injectable } from '@angular/core';

import { AuditLogUseCasesContract } from './audit-log.use-cases.contract';
import { AUDIT_LOG_REPOSITORY, AuditLogRepositoryContract } from '@/domain/repositories/audit-log.repository.contract';
import { AuditLogModel } from '@/models/audit-log/audit-log.model';
import { AuditLogInsertDto } from '@/dtos/audit-log/audit-log-insert.dto';

@Injectable()
export class AuditLogUseCasesImpl implements AuditLogUseCasesContract {
  private readonly _repository: AuditLogRepositoryContract = inject(AUDIT_LOG_REPOSITORY);

  /**
   * Returns the most recent audit log entries, ordered by descending date.
   *
   * @param {number} limit - Maximum number of entries to retrieve (default 100)
   */
  async getRecentLogs(limit?: number): Promise<AuditLogModel[]> {
    return this._repository.getRecentLogs(limit);
  }

  /**
   * Persists a new audit log entry for the currently authenticated user.
   *
   * @param {AuditLogInsertDto} entry - The action details to record
   */
  async log(entry: AuditLogInsertDto): Promise<void> {
    return this._repository.insertLog(entry);
  }
}
