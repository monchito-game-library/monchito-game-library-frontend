import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';
import { canActivateDesktopOnly } from '@/guards/desktop-only/desktop-only.guard';

export const ordersListRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders-list.component').then((m) => m.OrdersListComponent),
    canActivate: [canActivateUser, canActivateDesktopOnly]
  }
];
