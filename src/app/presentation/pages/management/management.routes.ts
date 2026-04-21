import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';
import { canActivateAdmin } from '@/guards/admin/admin.guard';
import { userAdminRepositoryProvider } from '@/di/repositories/user-admin.repository.provider';
import { userAdminUseCasesProvider } from '@/di/use-cases/user-admin.use-cases.provider';
import { auditLogRepositoryProvider } from '@/di/repositories/audit-log.repository.provider';
import { auditLogUseCasesProvider } from '@/di/use-cases/audit-log.use-cases.provider';
import { protectorRepositoryProvider } from '@/di/repositories/protector.repository.provider';
import { protectorUseCasesProvider } from '@/di/use-cases/protector.use-cases.provider';
import { storeRepositoryProvider } from '@/di/repositories/store.repository.provider';
import { storeUseCasesProvider } from '@/di/use-cases/store.use-cases.provider';

export const managementRoutes: Routes = [
  {
    path: '',
    providers: [
      userAdminRepositoryProvider,
      userAdminUseCasesProvider,
      auditLogRepositoryProvider,
      auditLogUseCasesProvider,
      protectorRepositoryProvider,
      protectorUseCasesProvider,
      storeRepositoryProvider,
      storeUseCasesProvider
    ],
    loadComponent: () => import('./management.component').then((m) => m.ManagementComponent),
    canActivate: [canActivateUser, canActivateAdmin],
    children: [
      { path: '', redirectTo: 'stores', pathMatch: 'full' },
      {
        path: 'stores',
        loadChildren: () => import('./pages/stores/stores-management.routes').then((m) => m.storesManagementRoutes)
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/users/users-management.routes').then((m) => m.usersManagementRoutes)
      },
      {
        path: 'audit-log',
        loadChildren: () =>
          import('./pages/audit-log/audit-log-management.routes').then((m) => m.auditLogManagementRoutes)
      },
      {
        path: 'protectors',
        loadChildren: () =>
          import('./pages/protectors/protectors-management.routes').then((m) => m.protectorsManagementRoutes)
      },
      {
        path: 'hardware',
        loadChildren: () =>
          import('./pages/hardware/hardware-management.routes').then((m) => m.hardwareManagementRoutes)
      }
    ]
  }
];
