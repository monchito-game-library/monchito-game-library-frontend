import { Routes } from '@angular/router';

export const auditLogManagementRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./audit-log-management.component').then((m) => m.AuditLogManagementComponent)
  }
];
