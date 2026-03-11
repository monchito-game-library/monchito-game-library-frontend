import { Routes } from '@angular/router';
import { canActivateUser } from './presentation/guards/user.guard';

import { HomeComponent } from './presentation/pages/home/home.component';
import { GameListComponent } from './presentation/pages/game-list/game-list.component';
import { CreateAndUpdateGameComponent } from './presentation/pages/create-update-game/create-and-update-game.component';
import { LoginComponent } from './presentation/pages/login/login.component';
import { RegisterComponent } from './presentation/pages/register/register.component';
import { ForgotPasswordComponent } from './presentation/pages/forgot-password/forgot-password.component';

export const routes: Routes = [
  // Public routes (no authentication required)
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },

  // Protected routes (authentication required)
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [canActivateUser]
  },
  {
    path: 'add',
    component: CreateAndUpdateGameComponent,
    canActivate: [canActivateUser]
  },
  {
    path: 'list',
    component: GameListComponent,
    canActivate: [canActivateUser]
  },
  {
    path: 'update/:id',
    component: CreateAndUpdateGameComponent,
    canActivate: [canActivateUser]
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
