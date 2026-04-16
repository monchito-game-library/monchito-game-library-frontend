import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';
import { canActivateDesktopOnly } from '@/guards/desktop-only/desktop-only.guard';

export const orderCreateRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./order-create.component').then((m) => m.OrderCreateComponent),
    canActivate: [canActivateUser, canActivateDesktopOnly]
  }
];
