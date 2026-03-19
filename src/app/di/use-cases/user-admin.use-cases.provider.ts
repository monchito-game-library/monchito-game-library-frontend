import { Provider } from '@angular/core';

import { USER_ADMIN_USE_CASES } from '@/domain/use-cases/user-admin/user-admin.use-cases.contract';
import { UserAdminUseCasesImpl } from '@/domain/use-cases/user-admin/user-admin.use-cases';

/** Binds USER_ADMIN_USE_CASES to the default implementation. */
export const userAdminUseCasesProvider: Provider = {
  provide: USER_ADMIN_USE_CASES,
  useClass: UserAdminUseCasesImpl
};
