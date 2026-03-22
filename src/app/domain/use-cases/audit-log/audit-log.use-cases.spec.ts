import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AUDIT_LOG_REPOSITORY, AuditLogRepositoryContract } from '@/domain/repositories/audit-log.repository.contract';
import { AuditLogInsertDto } from '@/dtos/audit-log/audit-log-insert.dto';
import { AuditLogUseCasesImpl } from './audit-log.use-cases';

const mockRepo: AuditLogRepositoryContract = {
  getRecentLogs: vi.fn(),
  insertLog: vi.fn()
};

describe('AuditLogUseCasesImpl', () => {
  let useCases: AuditLogUseCasesImpl;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [AuditLogUseCasesImpl, { provide: AUDIT_LOG_REPOSITORY, useValue: mockRepo }]
    });

    useCases = TestBed.inject(AuditLogUseCasesImpl);
  });

  describe('getRecentLogs', () => {
    it('delega en repo.getRecentLogs sin límite', async () => {
      vi.mocked(mockRepo.getRecentLogs).mockResolvedValue([]);
      await useCases.getRecentLogs();

      expect(mockRepo.getRecentLogs).toHaveBeenCalledWith(undefined);
    });

    it('delega en repo.getRecentLogs con límite', async () => {
      vi.mocked(mockRepo.getRecentLogs).mockResolvedValue([]);
      await useCases.getRecentLogs(50);

      expect(mockRepo.getRecentLogs).toHaveBeenCalledWith(50);
    });

    it('devuelve el resultado del repositorio', async () => {
      const logs = [{ id: 'l-1' }] as never;
      vi.mocked(mockRepo.getRecentLogs).mockResolvedValue(logs);

      const result = await useCases.getRecentLogs();
      expect(result).toBe(logs);
    });
  });

  describe('log', () => {
    it('delega en repo.insertLog con la entrada correcta', async () => {
      vi.mocked(mockRepo.insertLog).mockResolvedValue();
      const entry: AuditLogInsertDto = { action: 'CREATE', entityType: 'game', entityId: 'g-1', description: null };

      await useCases.log(entry);

      expect(mockRepo.insertLog).toHaveBeenCalledWith(entry);
    });
  });
});
