import { Routes } from '@angular/router';

export const gamesHubRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./games-hub.component').then((m) => m.GamesHubComponent)
  }
];
