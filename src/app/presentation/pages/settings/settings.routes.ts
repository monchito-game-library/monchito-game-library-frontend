import { Routes } from '@angular/router';
import { canActivateUser } from '@/guards/user.guard';
import { userPreferencesRepositoryProvider } from '@/di/repositories/user-preferences.repository.provider';
import { userPreferencesUseCasesProvider } from '@/di/use-cases/user-preferences.use-cases.provider';

export const settingsRoutes: Routes = [
  {
    path: '',
    providers: [userPreferencesRepositoryProvider, userPreferencesUseCasesProvider],
    loadComponent: () => import('./settings.component').then((m) => m.SettingsComponent),
    canActivate: [canActivateUser]
  }
];
