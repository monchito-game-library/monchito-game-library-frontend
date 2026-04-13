import { Routes } from '@angular/router';
import { consoleRepositoryProvider } from '@/di/repositories/console.repository.provider';
import { consoleUseCasesProvider } from '@/di/use-cases/console.use-cases.provider';

export const consolesRoutes: Routes = [
  {
    path: '',
    providers: [consoleRepositoryProvider, consoleUseCasesProvider],
    children: [
      {
        path: '',
        loadComponent: () => import('./consoles.component').then((m) => m.ConsolesComponent)
      }
    ]
  }
];
