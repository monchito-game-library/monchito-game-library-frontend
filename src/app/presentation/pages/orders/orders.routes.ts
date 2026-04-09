import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';
import { canActivateDesktopOnly } from '@/guards/desktop-only.guard';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders.component').then((m) => m.OrdersComponent),
    canActivate: [canActivateUser, canActivateDesktopOnly]
  },
  {
    path: 'new',
    loadComponent: () => import('./order-create/order-create.component').then((m) => m.OrderCreateComponent),
    canActivate: [canActivateUser, canActivateDesktopOnly]
  },
  {
    path: 'invite/:token',
    loadComponent: () => import('./order-invite/order-invite.component').then((m) => m.OrderInviteComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
    canActivate: [canActivateUser, canActivateDesktopOnly]
  }
];
