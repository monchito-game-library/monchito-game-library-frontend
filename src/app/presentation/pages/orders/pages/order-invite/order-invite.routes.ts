import { Routes } from '@angular/router';

export const orderInviteRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./order-invite.component').then((m) => m.OrderInviteComponent)
  }
];
