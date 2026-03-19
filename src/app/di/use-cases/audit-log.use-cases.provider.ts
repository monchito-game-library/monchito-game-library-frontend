import { Provider } from '@angular/core';

import { AUDIT_LOG_USE_CASES } from '@/domain/use-cases/audit-log/audit-log.use-cases.contract';
import { AuditLogUseCasesImpl } from '@/domain/use-cases/audit-log/audit-log.use-cases';

export const auditLogUseCasesProvider: Provider = {
  provide: AUDIT_LOG_USE_CASES,
  useClass: AuditLogUseCasesImpl
};
