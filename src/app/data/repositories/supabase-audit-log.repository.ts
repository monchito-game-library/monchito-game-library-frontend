import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';

import { AuditLogRepositoryContract } from '@/domain/repositories/audit-log.repository.contract';
import { AuditLogModel } from '@/models/audit-log/audit-log.model';
import { AuditLogInsertDto } from '@/dtos/audit-log/audit-log-insert.dto';
import { AuditLogInsertRowDto, AuditLogRowDto } from '@/dtos/supabase/audit-log.dto';
import { SUPABASE_CLIENT } from '@/data/config/supabase.config';

@Injectable()
export class SupabaseAuditLogRepository implements AuditLogRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  /**
   * Retrieves the most recent audit log entries ordered by descending creation date.
   *
   * @param {number} limit - Maximum number of rows to return (default 100)
   */
  async getRecentLogs(limit: number = 100): Promise<AuditLogModel[]> {
    const { data, error } = await this._supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data as AuditLogRowDto[]).map((row) => ({
      id: row.id,
      performedBy: row.performed_by,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      description: row.description,
      createdAt: row.created_at
    }));
  }

  /**
   * Inserts a new audit log entry. The actor identity is resolved from the active Supabase session.
   *
   * @param {AuditLogInsertDto} entry - The action details to persist
   */
  async insertLog(entry: AuditLogInsertDto): Promise<void> {
    const {
      data: { user }
    } = await this._supabase.auth.getUser();

    if (!user) return;

    const payload: AuditLogInsertRowDto = {
      performed_by: user.id,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      description: entry.description ?? null
    };

    const { error } = await this._supabase.from('admin_audit_log').insert(payload);

    if (error) throw error;
  }
}
