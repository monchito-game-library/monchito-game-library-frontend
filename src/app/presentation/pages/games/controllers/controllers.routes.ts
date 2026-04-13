import { Routes } from '@angular/router';
import { controllerRepositoryProvider } from '@/di/repositories/controller.repository.provider';
import { controllerUseCasesProvider } from '@/di/use-cases/controller.use-cases.provider';

export const controllersRoutes: Routes = [
  {
    path: '',
    providers: [controllerRepositoryProvider, controllerUseCasesProvider],
    children: [
      {
        path: '',
        loadComponent: () => import('./controllers.component').then((m) => m.ControllersComponent)
      }
    ]
  }
];
