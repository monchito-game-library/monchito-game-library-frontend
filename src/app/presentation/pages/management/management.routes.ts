import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';
import { canActivateAdmin } from '@/guards/admin.guard';

export const managementRoutes: Routes = [
  {
    path: '',
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
        path: 'products',
        loadComponent: () =>
          import('./products/products-management.component').then((m) => m.ProductsManagementComponent)
      }
    ]
  }
];
