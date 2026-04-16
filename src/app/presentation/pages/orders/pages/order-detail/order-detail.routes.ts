import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';
import { canActivateDesktopOnly } from '@/guards/desktop-only/desktop-only.guard';

export const orderDetailRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./order-detail.component').then((m) => m.OrderDetailComponent),
    canActivate: [canActivateUser, canActivateDesktopOnly]
  }
];
