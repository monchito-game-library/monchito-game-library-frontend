import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('@/pages/auth/auth.routes').then((m) => m.authRoutes) },
  { path: 'home', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', loadChildren: () => import('@/pages/game-list/game-list.routes').then((m) => m.gameListRoutes) },
  {
    path: 'add',
    loadChildren: () =>
      import('@/pages/create-update-game/create-and-update-game.routes').then((m) => m.createUpdateGameRoutes)
  },
  {
    path: 'update/:id',
    loadChildren: () =>
      import('@/pages/create-update-game/create-and-update-game.routes').then((m) => m.createUpdateGameRoutes)
  },
  { path: 'wishlist', loadChildren: () => import('@/pages/wishlist/wishlist.routes').then((m) => m.wishlistRoutes) },
  {
    path: 'sold-games',
    loadChildren: () => import('@/pages/sold-games/sold-games.routes').then((m) => m.soldGamesRoutes)
  },
  { path: 'orders', loadChildren: () => import('@/pages/orders/orders.routes').then((m) => m.ordersRoutes) },
  { path: 'settings', loadChildren: () => import('@/pages/settings/settings.routes').then((m) => m.settingsRoutes) },
  {
    path: 'management',
    loadChildren: () => import('@/pages/management/management.routes').then((m) => m.managementRoutes)
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
