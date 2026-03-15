import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';
import { canActivateAdmin } from '@/guards/admin.guard';

export const routes: Routes = [
  // Public routes (no authentication required)
  {
    path: 'login',
    loadComponent: (): Promise<typeof import('@/pages/login/login.component').LoginComponent> =>
      import('@/pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: (): Promise<typeof import('@/pages/register/register.component').RegisterComponent> =>
      import('@/pages/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: (): Promise<
      typeof import('@/pages/forgot-password/forgot-password.component').ForgotPasswordComponent
    > => import('@/pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent)
  },

  // Protected routes (authentication required)
  {
    path: 'home',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'add',
    loadComponent: (): Promise<
      typeof import('@/pages/create-update-game/create-and-update-game.component').CreateAndUpdateGameComponent
    > =>
      import('@/pages/create-update-game/create-and-update-game.component').then((m) => m.CreateAndUpdateGameComponent),
    canActivate: [canActivateUser]
  },
  {
    path: 'list',
    loadComponent: (): Promise<typeof import('@/pages/game-list/game-list.component').GameListComponent> =>
      import('@/pages/game-list/game-list.component').then((m) => m.GameListComponent),
    canActivate: [canActivateUser]
  },
  {
    path: 'update/:id',
    loadComponent: (): Promise<
      typeof import('@/pages/create-update-game/create-and-update-game.component').CreateAndUpdateGameComponent
    > =>
      import('@/pages/create-update-game/create-and-update-game.component').then((m) => m.CreateAndUpdateGameComponent),
    canActivate: [canActivateUser]
  },

  {
    path: 'settings',
    loadComponent: (): Promise<typeof import('@/pages/settings/settings.component').SettingsComponent> =>
      import('@/pages/settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [canActivateUser]
  },
  {
    path: 'management',
    redirectTo: 'management/stores',
    pathMatch: 'full'
  },
  {
    path: 'management/stores',
    loadComponent: (): Promise<
      typeof import('@/pages/management/stores/stores-management.component').StoresManagementComponent
    > => import('@/pages/management/stores/stores-management.component').then((m) => m.StoresManagementComponent),
    canActivate: [canActivateUser, canActivateAdmin]
  },

  // Default and fallback routes
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
