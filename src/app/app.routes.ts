import { Routes } from '@angular/router';
import { canActivateUser } from './guards/user.guard';

import { HomeComponent } from './pages/home/home.component';
import { GameListComponent } from './pages/game-list/game-list.component';
import { DatabaseToolsComponent } from './pages/database-tools/database-tools.component';
import { CreateAndUpdateGameComponent } from './pages/create-update-game/create-and-update-game.component';
import { SelectUserComponent } from './pages/select-user/select-user.component';

export const routes: Routes = [
  {
    path: 'select-user',
    component: SelectUserComponent
  },
  {
    path: '',
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
    path: 'tools',
    component: DatabaseToolsComponent,
    canActivate: [canActivateUser]
  },
  {
    path: 'update/:id',
    component: CreateAndUpdateGameComponent,
    canActivate: [canActivateUser]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
