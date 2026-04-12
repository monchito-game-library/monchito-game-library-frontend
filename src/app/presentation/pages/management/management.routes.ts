import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';
import { canActivateAdmin } from '@/guards/admin.guard';
import { userAdminRepositoryProvider } from '@/di/repositories/user-admin.repository.provider';
import { userAdminUseCasesProvider } from '@/di/use-cases/user-admin.use-cases.provider';
import { auditLogRepositoryProvider } from '@/di/repositories/audit-log.repository.provider';
import { auditLogUseCasesProvider } from '@/di/use-cases/audit-log.use-cases.provider';
import { protectorRepositoryProvider } from '@/di/repositories/protector.repository.provider';
import { protectorUseCasesProvider } from '@/di/use-cases/protector.use-cases.provider';

export const managementRoutes: Routes = [
  {
    path: '',
    providers: [
      userAdminRepositoryProvider,
      userAdminUseCasesProvider,
      auditLogRepositoryProvider,
      auditLogUseCasesProvider,
      protectorRepositoryProvider,
      protectorUseCasesProvider
    ],
    loadComponent: () => import('./management.component').then((m) => m.ManagementComponent),
    canActivate: [canActivateUser, canActivateAdmin],
    children: [
      { path: '', redirectTo: 'stores', pathMatch: 'full' },
      {
        path: 'stores',
        loadComponent: () => import('./stores/stores-management.component').then((m) => m.StoresManagementComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users-management.component').then((m) => m.UsersManagementComponent)
      },
      {
        path: 'audit-log',
        loadComponent: () =>
          import('./audit-log/audit-log-management.component').then((m) => m.AuditLogManagementComponent)
      },
      {
        path: 'protectors',
        loadComponent: () =>
          import('./protectors/protectors-management.component').then((m) => m.ProtectorsManagementComponent)
      }
    ]
  }
];
