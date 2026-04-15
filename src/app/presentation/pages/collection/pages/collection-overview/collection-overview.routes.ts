import { Routes } from '@angular/router';
import { gameRepositoryProvider } from '@/di/repositories/game.repository.provider';
import { gameUseCasesProvider } from '@/di/use-cases/game.use-cases.provider';
import { consoleRepositoryProvider } from '@/di/repositories/console.repository.provider';
import { consoleUseCasesProvider } from '@/di/use-cases/console.use-cases.provider';
import { controllerRepositoryProvider } from '@/di/repositories/controller.repository.provider';
import { controllerUseCasesProvider } from '@/di/use-cases/controller.use-cases.provider';

export const collectionOverviewRoutes: Routes = [
  {
    path: '',
    providers: [
      gameRepositoryProvider,
      gameUseCasesProvider,
      consoleRepositoryProvider,
      consoleUseCasesProvider,
      controllerRepositoryProvider,
      controllerUseCasesProvider
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./collection-overview.component').then((m) => m.CollectionOverviewComponent)
      }
    ]
  }
];
