import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('@/pages/auth/auth.routes').then((m) => m.authRoutes) },
  {
    path: 'reset-password',
    loadChildren: () => import('@/pages/auth/reset-password/reset-password.routes').then((m) => m.resetPasswordRoutes)
  },
  { path: 'home', redirectTo: 'games', pathMatch: 'full' },
  { path: 'games', loadChildren: () => import('@/pages/game-list/game-list.routes').then((m) => m.gameListRoutes) },
  { path: 'wishlist', loadChildren: () => import('@/pages/wishlist/wishlist.routes').then((m) => m.wishlistRoutes) },
  { path: 'orders', loadChildren: () => import('@/pages/orders/orders.routes').then((m) => m.ordersRoutes) },
  { path: 'settings', loadChildren: () => import('@/pages/settings/settings.routes').then((m) => m.settingsRoutes) },
  {
    path: 'management',
    loadChildren: () => import('@/pages/management/management.routes').then((m) => m.managementRoutes)
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
