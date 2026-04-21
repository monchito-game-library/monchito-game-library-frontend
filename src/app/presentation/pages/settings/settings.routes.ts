import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user/user.guard';
import { rawgRepositoryProvider } from '@/di/repositories/rawg.repository.provider';
import { catalogUseCasesProvider } from '@/di/use-cases/catalog.use-cases.provider';

export const settingsRoutes: Routes = [
  {
    path: '',
    providers: [rawgRepositoryProvider, catalogUseCasesProvider],
    loadComponent: () => import('./settings.component').then((m) => m.SettingsComponent),
    canActivate: [canActivateUser]
  }
];
