import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';
import { gameRepositoryProvider } from '@/di/repositories/game.repository.provider';
import { gameUseCasesProvider } from '@/di/use-cases/game.use-cases.provider';

export const gamesRoutes: Routes = [
  {
    path: '',
    providers: [gameRepositoryProvider, gameUseCasesProvider],
    children: [
      {
        path: '',
        loadComponent: () => import('./games.component').then((m) => m.GamesComponent),
        canActivate: [canActivateUser]
      },
      // Static routes must come before the dynamic :id segment to avoid conflicts
      {
        path: 'add',
        loadChildren: () =>
          import('./pages/create-update-game/create-and-update-game.routes').then((m) => m.createUpdateGameRoutes)
      },
      {
        path: 'edit/:id',
        loadChildren: () =>
          import('./pages/create-update-game/create-and-update-game.routes').then((m) => m.createUpdateGameRoutes)
      },
      {
        path: ':id',
        loadChildren: () => import('./pages/game-detail/game-detail.routes').then((m) => m.gameDetailRoutes)
      }
    ]
  }
];
